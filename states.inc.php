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


    STATE_START_ROUND => array(
        "name" => "startRound", 
        "description" => clienttranslate('Setup round ${roundNumber}'),
        "type" => "game",
        "action" => "stStartRound",
        "updateGameProgression" => true,   
        "transitions" => array( "" => STATE_PLACE_WORKERS )
    ),


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
        "transitions" => array( "done" => STATE_NEXT_BUILDING )
    ),
    
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

