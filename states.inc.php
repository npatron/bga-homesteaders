<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaderstb implementation : © © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Game is played over 10 rounds
 * Round Phases: (from manual)
 * 1) Setup => 100 
 *   a) remove bid markers (winner of auction 1 is new start player this round)
 *   b) remove old auction markers and reveal next auction markers
 *   c) in stage 5 remove "settlement" cards from building supply, and add "town" cards to building supply
 *   d) in stage 9 remove "town" cards from building supply, and add "city" cards to building supply
 * 2) Income => 200
 *   a) allocate workers
 *   b) collect Income
 *   c) Pay workers
 * 3) Auction => 300
 *   a) bidding 
 *     - each player places bid marker on valid bid or passes
 *     - keep going clockwise until everyone is either winning an auction or has passed.
 *   when a player passes, they advance on the railroad developement track and get an item (that bonus or bonus to left)
 *     - once a player passes they are skipped for the rest of the round. 
 * 
 *  (2 player bidding) before first player makes their bid, they MUST place neutral bidder on an auction, 
 *                        then they may bid or pass (on that auction or the other auction)
 *                        neutral player bid value starts at 5, 
 *                         it goes up if both players win an auction (max 9) 
 *                         it goes down if any player passes (min 3)
 *                        if neutral player wins auction 1, then start player is passed to next player 
 *   b) Building => 400
 *      - each player who won an auction (in auction order) must pay for auction.
 *      - they may trade resources (if they have chits) or take loans as necessary
 *      - they can pay the auction with silver, or gold (with gold being worth 5 silver, but not recieving any change)
 *      
 *      once they have paid for the auction, they must choose a building to build (if the auction includes a building)
 *      They may trade for resources before building the building, and before recieving any bonuses
 *      - if the auction includes additional items, after they build the building (and get any build rewards) 
 *              they may collect and pay for the additional railroad or recieve the worker
 *    
 */

/*
   Game state machine is a tool used to facilitate game developement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!
if (!defined('STATE_END_GAME')) {// ensure this block is only invoked once, since it is included multiple times
    define("STATE_START_ROUND", 10);
    define("STATE_PLACE_WORKERS", 20);
    define("STATE_INCOME", 22);
    define("STATE_PAY_WORKERS", 23);
    define("STATE_AUCTION", 30);
    define("STATE_2_PLAYER_DUMMY_BID", 31);
    define("STATE_PLAYER_BID", 32);
    define("STATE_PASS_BONUS", 33);
    define("STATE_NEXT_BID", 34);
    define("STATE_BEGIN_BUILDING", 40);
    define("STATE_PAY_AUCTION", 41);
    define("STATE_CHOOSE_BUILDING", 42);
    define("STATE_RESOLVE_BUILDING", 43);
    define("STATE_CHOOSE_BONUS", 44);
    define("STATE_RESOLVE_BONUS", 45);
    define("STATE_NEXT_BUILDING", 46);
    define("STATE_END_ROUND", 49);
    define("STATE_END_GAME", 99);
}

 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => STATE_START_ROUND )
    ),
    
    /*****************
     * 1) Setup 
     *   a) remove bid markers (winner of auction 1 is new start player this round)
     *   b) remove old auction markers and reveal next auction markers
     *   c) in stage 5 remove "settlement" cards from building supply, and add "town" cards to building supply
     *   d) in stage 9 remove "town" cards from building supply, and add "city" cards to building supply
     * 
     ****************/

    STATE_START_ROUND => array(
        "name" => "startRound", 
        "description" => clienttranslate('Setup round ${roundNumber}'),
        "type" => "game",
        "action" => "stStartRound",
        "updateGameProgression" => true,   
        "transitions" => array( "" => STATE_PLACE_WORKERS )
    ),

    /**************** 
     * 2) Income 
     *   a) allocate workers (can do asyncronously)
     *   b) collect Income
     *   c) Pay workers (optional decision window here for trading and using gold/silver)
     * 
     ****************/

    STATE_PLACE_WORKERS => array(
        "name" => "allocateWorkers",
        "description" => clienttranslate('Some players must allocate workers'),
        "descriptionmyturn" => clienttranslate('${you} must allocate workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPlaceWorkers",
        "args" => "argWorkersPlacement",
        "possibleactions" => array( "Wait For Player Order", "done", "trade" ),
        "transitions" => array( "done" => STATE_INCOME, "loopback" => STATE_PLACE_WORKERS )
    ),

    /*202 => array(
        "name" => "trade",
        "description" => clienttranslate('Some players may trade'),
        "descriptionmyturn" => clienttranslate('${you} may trade'),
        "type" => "multipleactiveplayer",
        "action" => "stTrade",
        "args" => "argWorkersPlacement",
        "possibleactions" => array( "buy", "sell", "pass" ),
        "transitions" => array("pass" => STATE_INCOME )
    ),*/

    STATE_INCOME => array(
        "name" => "collectIncome",
        "description" =>  clienttranslate('collect income'),
        "type" => "game",
        "action" => "stCollectIncome",
        "updateGameProgression" => true,   
        "transitions" => array( "" => STATE_PAY_WORKERS )
    ),
    
    STATE_PAY_WORKERS => array(
        "name" => "payWorkers",
        "description" => clienttranslate('Some players must choose how to pay workers'),
        "descriptionmyturn" => clienttranslate('${you} must choose how to pay workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPayWorkers",
        "args" => "argWorkersPlacement",
        "possibleactions" => array( "+ Gold", "- Gold", "Take Loan", "Trade", "Done" ),
        "transitions" => array( "Done" => STATE_AUCTION, "loopback" => STATE_PAY_WORKERS )
    ),

    /* 3) Auction 
     *   a) bidding 
     *     - each player places bid marker on valid bid or passes
     *     - keep going clockwise until everyone is either winning an auction or has passed.
     *   when a player passes, they advance on the railroad developement track and get an item (that bonus or bonus to left)
     *     - once a player passes they are skipped for the rest of the round. 
     * 
     *  (2 player bidding) before first player makes their bid, they MUST place neutral bidder on an auction, 
     *                        then they may bid or pass (on that auction or the other auction)
     *                        neutral player bid value starts at 5, 
     *                         it goes up if both players win an auction (max 9) 
     *                         it goes down if any player passes (min 3)
     *                        if neutral player wins auction 1, then start player is passed to next player 
     
     */
    STATE_AUCTION  => array(
        "name" => "beginAuction",
        "description" => '',
        "type" => "game",
        "action" => "stBeginAuction",
        "updateGameProgression" => true,
        "transitions" => array( "" => STATE_PLAYER_BID)
    ),

    STATE_PLAYER_BID => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${actplayer} must bid on auction or pass'),
        "descriptionmyturn" => clienttranslate('${you} must bid on auction or pass'),
        "type" => "activeplayer",
        "action" => "stUpdateBid",
        "args" => "bidLocation",
        "possibleactions" => array( "pass" ),
        "transitions" => array( "bid" => STATE_NEXT_BID, "pass" => STATE_PASS_BONUS )
    ),

    STATE_PASS_BONUS => array(
        "name" => "getPassBenefits",
        "description" => clienttranslate('${actplayer} must choose a rail bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a rail bonus'),
        "type" => "activeplayer",
        "args" => "bonus",
        "possibleactions" => array( "choose" ),
        "transitions" => array( "choose" => STATE_NEXT_BID )
    ),

    STATE_NEXT_BID => array(
        "name" => "nextBid",
        "description" => '',
        "type" => "game",
        "action" => "stNextBid",
        "updateGameProgression" => true,
        "transitions" => array( "nextBid" => STATE_PLAYER_BID, "auctionEnd" => STATE_BEGIN_BUILDING )
    ),

    /**
     * Building Phase 
     *   - each player who won an auction (in auction order) must pay for auction.
     *   - they may trade resources (if they have chits) or take loans as necessary
     *   - they can pay the auction with silver, or gold (with gold being worth 5 silver, but not recieving any change)
     *    
     *   once they have paid for the auction, they must choose a building to build (if the auction includes a building)
     *   They may trade for resources before building the building, and before recieving any bonuses
     *   - if the auction includes additional items, after they build the building (and get any build rewards) 
     *           they may collect and pay for the additional railroad or recieve the worker
     */

    STATE_NEXT_BUILDING => array(
        "name" => "buildingPhase",
        "description" => '',
        "type" => "game",
        "action" => "stBuildingPhase",
        "updateGameProgression" => true,
        "transitions" => array( "auctionWon" => STATE_BEGIN_BUILDING, "auctionPassed" => STATE_NEXT_BUILDING, "endRound" => STATE_END_ROUND )
    ),

    STATE_PAY_AUCTION => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${actplayer} must pay for auction'),
        "descriptionmyturn" => clienttranslate('${you} must pay for auction'),
        "type" => "activeplayer",
        "args" => "paymentMethod",
        "possibleactions" => array( "trade", "takeLoan", "pay" ),
        "transitions" => array( "" => STATE_CHOOSE_BUILDING, )
    ),

    /*402 => array(
        "name" => "trade",
        "description" => clienttranslate('${actplayer} may trade resources'),
        "descriptionmyturn" => clienttranslate('${you} may trade resources'),
        "type" => "activeplayer",
        "args" => "trades",
        "action" => "stTrade",
        "possibleactions" => array( "done" ),
        "transitions" => array( "done" => 401 )
    ),

    403 =>  array(
        "name" => "takeLoan",
        "description" => '',
        "type" => "game",
        "action" => "stTakeLoan",
        "updateGameProgression" => true,
        "transitions" => array( "" => 401)
    ),*/

    STATE_CHOOSE_BUILDING => array(
        "name" => "chooseBuildingToBuild",
        "description" => clienttranslate('${actplayer} may choose a(n) ${type} building to build'),
        "descriptionmyturn" => clienttranslate('${you} may choose a(n) ${type} building to build'),
        "type" => "activeplayer",
        "args" => "buildingToBuild",
        "action" => "stBuild",
        "possibleactions" => array( "trade", "choose", "takeLoan", "do not build" ),
        "transitions" => array(  "choose" => STATE_RESOLVE_BUILDING, "do not build" => STATE_RESOLVE_BUILDING )
    ),

    /*412 => array(
        "name" => "trade",
        "description" => clienttranslate('${actplayer} may trade resources'),
        "descriptionmyturn" => clienttranslate('${you} may trade resources'),
        "type" => "activeplayer",
        "args" => "trades",
        "action" => "stTrade",
        "possibleactions" => array( "done" ),
        "transitions" => array( "done" => 401 )
    ),

    413 =>  array(
        "name" => "takeLoan",
        "description" => '',
        "type" => "game",
        "action" => "stTakeLoan",
        "updateGameProgression" => true,
        "transitions" => array( "" => 401)
    ),*/

    STATE_RESOLVE_BUILDING =>  array(
        "name" => "getBonus",
        "description" => '',
        "type" => "game",
        "action" => "stGetBonus",
        "updateGameProgression" => true,
        "transitions" => array( "bonusChoice" => STATE_CHOOSE_BONUS, "nextAuction" => STATE_NEXT_BUILDING)
    ),

    STATE_CHOOSE_BONUS => array(
        "name" => "bonusChoice",
        "description" => clienttranslate('${actplayer} may get Bonus ${bonusText}'),
        "descriptionmyturn" => clienttranslate('${you} may get Bonus ${bonusText}'),
        "type" => "activeplayer",
        "args" => "trades",
        "action" => "stChooseBonus",
        "possibleactions" => array( "done" ),
        "transitions" => array( "done" => STATE_NEXT_BUILDING)
    ),
    
    // end of Round, 
    // if round 10, go to game end, (and scoring?)

    STATE_END_ROUND => array(
        "name" => "endRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndRound",
        "updateGameProgression" => true,
        "transitions" => array( "endGame" => STATE_END_GAME, "nextRound" => STATE_START_ROUND )
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);

