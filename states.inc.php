<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaderstb implementation : © Nick Patron <nick.theboot@gmail.com>
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
    define("STATE_START_ROUND",        10);
    define("STATE_PLACE_WORKERS",      20);
    define("STATE_INCOME",             22);
    define("STATE_PAY_WORKERS",        23);
    define("STATE_BEGIN_AUCTION",      30);
    define("STATE_2_PLAYER_DUMMY_BID", 31);
    define("STATE_PLAYER_BID",         32);
    define("STATE_RAIL_BONUS",         33);
    define("STATE_NEXT_BID",           34);
    define("STATE_NEXT_BUILDING",      40);
    define("STATE_PAY_AUCTION",        41);
    define("STATE_CHOOSE_BUILDING",    42);
    define("STATE_RESOLVE_BUILDING",   43);
    define("STATE_TRAIN_STATION_BUILD",44);
    define("STATE_AUCTION_BONUS",      50);
    define("STATE_CHOOSE_BONUS",       51);
    define("STATE_END_BUILD",          53);
    define("STATE_END_ROUND",          59);
    define("STATE_ENDGAME_ACTIONS",    60);
    define("STATE_UPDATE_SCORES",      61);
    define("STATE_END_GAME",           99);
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
        "description" => clienttranslate('Setup round'),
        "type" => "game",
        "action" => "stStartRound",
        "args" => "argStartRound",
        "updateGameProgression" => true,   
        "transitions" => array( "" => STATE_PLACE_WORKERS )
    ),

    STATE_PLACE_WORKERS => array(
        "name" => "allocateWorkers",
        "description" => clienttranslate('Some players must allocate workers'),
        "descriptionmyturn" => clienttranslate('${you} must allocate workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPlaceWorkers",
        "args" => "argPlaceWorkers",
        "possibleactions" => array( "placeWorker", "hireWorker", "trade", "takeLoan", "done" ),
        "transitions" => array( "done" => STATE_INCOME )
    ),

    STATE_INCOME => array(
        "name" => "collectIncome",
        "description" =>  clienttranslate('collect income'),
        "type" => "game",
        "action" => "stCollectIncome",
        "transitions" => array( "" => STATE_PAY_WORKERS,  )
    ),
    
    STATE_PAY_WORKERS => array(
        "name" => "payWorkers",
        "description" => clienttranslate('Some players must choose how to pay workers'),
        "descriptionmyturn" => clienttranslate('${you} must choose how to pay workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPayWorkers",
        "args" => "argPayWorkers",
        "possibleactions" => array( "takeLoan", "updateGold", "trade", "done" ),
        "transitions" => array( "auction" => STATE_BEGIN_AUCTION)
    ),

    STATE_BEGIN_AUCTION  => array(
        "name" => "beginAuction",
        "description" => '',
        "type" => "game",
        "action" => "stBeginAuction",
        "updateGameProgression" => true,
        "transitions" => array( "auction" => STATE_PLAYER_BID, 
                                "endGame" => STATE_ENDGAME_ACTIONS,)
    ),

    STATE_PLAYER_BID => array(
        "name" => "playerBid",
        "description" => clienttranslate('${actplayer} must bid on auction or pass'),
        "descriptionmyturn" => clienttranslate('${you} must bid on auction or pass'),
        "type" => "activeplayer",
//        "action" => "stMakeBidOrPass",
        "args" => "argValidBids",
        "possibleactions" => array( "selectBid", "confirmBid", "pass" ),
        "transitions" => array( "nextBid" => STATE_NEXT_BID, 
                                "rail" => STATE_RAIL_BONUS )
    ),

    STATE_RAIL_BONUS => array(
        "name" => "getRailBonus",
        "description" => clienttranslate('${actplayer} must choose a rail bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a rail bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus" ),
        "transitions" => array( "nextBid" => STATE_NEXT_BID, 
                                "auctionBonus" => STATE_AUCTION_BONUS, 
                                "endAuction" => STATE_END_BUILD)
    ),

    STATE_NEXT_BID => array(
        "name" => "nextBid",
        "description" => '',
        "type" => "game",
        "action" => "stNextBid",
        "transitions" => array( "skipPlayer" => STATE_NEXT_BID, 
                                "playerBid" => STATE_PLAYER_BID, 
                                "endAuction" => STATE_NEXT_BUILDING )
    ),

    STATE_NEXT_BUILDING => array(
        "name" => "buildingPhase",
        "description" => '',
        "type" => "game",
        "action" => "stBuildingPhase",
        "updateGameProgression" => true,
        "transitions" => array( "auctionWon" => STATE_PAY_AUCTION, 
                                "auctionPassed" => STATE_END_BUILD )
    ),

    STATE_PAY_AUCTION => array(
        "name" => "payAuction",
        "description" => clienttranslate('${actplayer} must pay for auction'),
        "descriptionmyturn" => clienttranslate('${you} must pay for auction'),
        "type" => "activeplayer",
        "args" => "argAuctionCost",
        "possibleactions" => array( "trade", "takeLoan", "updateGold", "done" ),
        "transitions" => array( "build" => STATE_CHOOSE_BUILDING, 
                                "auction_bonus" => STATE_AUCTION_BONUS)
    ),

    STATE_CHOOSE_BUILDING => array(
        "name" => "chooseBuildingToBuild",
        "description" => clienttranslate('${actplayer} may choose a building to build'),
        "descriptionmyturn" => clienttranslate('${you} may choose a building to build'),
        "type" => "activeplayer",
        "args" => "argAllowedBuildings",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild" ),
        "transitions" => array( "building_bonus" => STATE_RESOLVE_BUILDING, 
                                "auction_bonus" => STATE_AUCTION_BONUS,
                                "end_build" => STATE_END_BUILD )
    ),

    STATE_RESOLVE_BUILDING =>  array(
        "name" => "resolveBuilding",
        "description" => clienttranslate('${actplayer} may recieve a build bonus'),
        "descriptionmyturn" => clienttranslate('${you} may recieve a build bonus'),
        "type" => "activeplayer",
        "args" => "argBuildingBonus",
        "action" => "stResolveBuilding",
        "possibleactions" => array("buildBonus"),
        "transitions" => array( "auction_bonus" => STATE_AUCTION_BONUS, 
                                "rail_bonus" => STATE_RAIL_BONUS,
                                "train_station_build"=> STATE_TRAIN_STATION_BUILD,)
    ),

    STATE_TRAIN_STATION_BUILD => array(
        "name" => "trainStationBuild",
        "description" => clienttranslate('${actplayer} may build another building'),
        "descriptionmyturn" => clienttranslate('${you} may build another building'),
        "type" => "activeplayer",
        "args" => "argTrainStationBuildings",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild" ),
        "transitions" => array( "building_bonus" => STATE_RESOLVE_BUILDING, 
                                "auction_bonus" => STATE_AUCTION_BONUS,
                                "end_build" => STATE_END_BUILD )
    ),

    STATE_AUCTION_BONUS => array(
        "name" => "auctionBonus",
        "description" => '',
        "type" => "game",
        "action" => "stGetAuctionBonus",
        "transitions" => array( "bonusChoice" => STATE_CHOOSE_BONUS, 
                                "endBuild" => STATE_END_BUILD )
    ),

    STATE_CHOOSE_BONUS => array(
        "name" => "bonusChoice",
        "description" => clienttranslate('${actplayer} may recieve a Bonus '),
        "descriptionmyturn" => clienttranslate('${you} may recieve a Bonus '),
        "type" => "activeplayer",
        "args" => "argBonusOption",
        "possibleactions" => array( "auctionBonus", 'trade', 'takeLoan' ),
        "transitions" => array( "done" => STATE_END_BUILD,
                                "railBonus" => STATE_RAIL_BONUS )
    ),

    STATE_END_BUILD => array(
        "name" => "endBuildRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndBuildRound",
        "updateGameProgression" => true,
        "transitions" => array( "endRound" => STATE_END_ROUND, 
                                "nextBuilding" => STATE_NEXT_BUILDING )
    ),
    
    STATE_END_ROUND => array(
        "name" => "endRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndRound",
        "transitions" => array( "nextAuction" => STATE_START_ROUND )
    ),

    STATE_ENDGAME_ACTIONS => array(
        "name" => "endGameActions",
        "description" => clienttranslate('Some players may choose to take actions before scoring'),
        "descriptionmyturn" => clienttranslate('${you} may choose to take actions before scoring'),
        "type" => "multipleactiveplayer",
        "action" => "stEndGameActions",
        "possibleactions" => array( "payLoan", "trade", 'hireWorker', "done" ),
        "transitions" => array( "" => STATE_END_GAME)
    ),

    STATE_UPDATE_SCORES => array(
        "name" => "UpdateScores",
        "description" => '',
        "type" => "game",
        "action" => "stUpdateScores",
        "transitions" => array( "nextAuction" => STATE_START_ROUND )
    ),


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

