<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Homesteaders implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Homesteaders game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
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

 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => 2 )
    ),
    
    // Note: ID=2 => your first state

    2 => array(
        "name" => "playerAllocateWorkers",
        "description" => clienttranslate('Other players must place their workers'),
        "descriptionmyturn" => clienttranslate('${you} must place your workers'),
        "type" => "multipleactiveplayer",
        "possibleactions" => array( "doneAllocating", "repeatAllocate", "trade"  ),
        "transitions" => array( "trade" => 2, "repeatAllocate" => 2, "doneAllocating" =>3 ),
        "action" => "st_MultiPlayerInit"

    ),

    3 => array(
        "name" => "playersGetResources",
        "description" => clienttranslate('Everyone gets their resources '),
        "type" => "game",
        "possibleactions" => array( "distribute" ),
        "transitions" => array( "distribute" => 4 )
    ),

    4 => array(
        "name" => "payWorkers",
        "description" => clienttranslate('Everyone must pay their workers resources '),
        "descriptionmyturn" => clienttranslate('${you} must pay your workers'),
        "type" => "multipleactiveplayer",
        "possibleactions" => array( "takeDebt", "trade", "finishPaying" ),
        "transitions" => array( "finishPaying" => 4 )
    ),

    //Complication for handling when someone passes first round without having other people had a chance to bid or pass
    //Current idea to keep playerPassReward as a multiple action and let all passers go to the same time
    //Added a bunch of extra transitons to playerBidTurn to keep these allowed
    10 => array(
        "name" => "playerBidTurn",
        "description" => clienttranslate('${actplayer} must bid or pass'),
        "descriptionmyturn" => clienttranslate('${you} must bid or pass'),
        "type" => "activeplayer",
        "possibleactions" => array( "bid", "pass", 'passFirstRound', 'bidWithAPassedPlayer' ),
        "transitions" => array( "bid" => 10, "pass" => 11, "passFirstRound" => 10, 'bidWithAPassedPlayer' => 11 )
    ),

    11 => array(
        "name" => "playerPassReward",
        "description" => clienttranslate('Passing players must choose an item from the Railroad Development Track'),
        "descriptionmyturn" => clienttranslate('${you} must choose an item from the Railroad Development Track'),
        "type" => "multipleactiveplayer",
        "possibleactions" => array( "choose" ),
        "transitions" => array( "choose" => 12 ),
    ),

    12  => array(
        "name" => "playerPayForAuction",
        "description" => clienttranslate('${actplayer} must pay for their auction tile'),
        "descriptionmyturn" => clienttranslate('${you} must pay for your auction tile'),
        "type" => "activeplayer",
        "args" => "argsAuctionPrice",
        "possibleactions" => array( "takeDebt", "trade", "payAuction"  ),
        "transitions" => array( "trade" => 12, "takeDebt" => 12, "payAuction" => 13  ),
    ),

    //Currently only allowing Debt to be taken when relevant 
    13 => array(
        "name" => "playerBuild",
        "description" => clienttranslate('${actplayer} may build an allowed building type'),
        "descriptionmyturn" => clienttranslate('${you} may build an allowed building type'),
        "type" => "activeplayer",
        "args" => array("argsBuildingTypes", "argsAuctionBoon"),
        "possibleactions" => array( "build", "trade", "takeDebt", "lastPlayerBuild"  ),
        "transitions" => array( "trade" => 13, "takeDebt" => 13, "build" => 13, "lastPlayerBuild" => 14  ),
    ),

    14 => array(
        "name" => "roundEnd",
        "description" => clienttranslate('Configuring Round'),
        "type" => "game",
        "possibleactions" => array( "build", "trade", "takeDebt", "lastPlayerBuild"  ),
        "transitions" => array( "nextRound" => 2, "nextAge" => 2, "endGame" => 97  ),
    ),

    97 => array(
        "name" => "finalScoringChance",
        "description" => clienttranslate('Pay off debt and do final trades'),
        "descriptionmyturn" => clienttranslate('${you} may do trades and pay off debt before final scoring'),
        "type" => "multipleactiveplayer",
        "possibleactions" => array( "build", "trade", "takeDebt", "lastPlayerBuild"  ),
        "transitions" => array( "payDebt" => 97, "trade" => 97, "done" => 97  ),
    ),

    98 => array(
        "name" => "endGameScoring",
        "description" => clienttranslate('Configuring Round'),
        "type" => "game",
        "possibleactions" => array( "scoringCalculated"  ),
        "transitions" => array( "scoringCalculated" => 99  ),
    ),
    
/*
    Examples:
    
    2 => array(
        "name" => "nextPlayer",
        "description" => '',
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,   
        "transitions" => array( "endGame" => 99, "nextPlayer" => 10 )
    ),
    
    10 => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${actplayer} must play a card or pass'),
        "descriptionmyturn" => clienttranslate('${you} must play a card or pass'),
        "type" => "activeplayer",
        "possibleactions" => array( "playCard", "pass" ),
        "transitions" => array( "playCard" => 2, "pass" => 2 )
    ), 

*/    
   
    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);



