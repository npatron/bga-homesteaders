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
  * homesteaders.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
  
if (!defined('AUCTION_LOC_DISCARD')){
  define("AUCTION_LOC_DISCARD", 0);
  define("AUCTION_LOC_DECK1",   1);
  define("AUCTION_LOC_DECK2",   2);
  define("AUCTION_LOC_DECK3",   3);
}
if (!defined('AUCTION1_1')){
  // Auction tiles
  define("AUCTION1_1",  1);
  define("AUCTION1_2",  2);
  define("AUCTION1_3",  3);
  define("AUCTION1_4",  4);
  define("AUCTION1_5",  5);
  define("AUCTION1_6",  6);
  define("AUCTION1_7",  7);
  define("AUCTION1_8",  8);
  define("AUCTION1_9",  9);
  define("AUCTION1_10", 10);

  define("AUCTION2_1",  11);
  define("AUCTION2_2",  12);
  define("AUCTION2_3",  13);
  define("AUCTION2_4",  14);
  define("AUCTION2_5",  15);
  define("AUCTION2_6",  16);
  define("AUCTION2_7",  17);
  define("AUCTION2_8",  18);
  define("AUCTION2_9",  19);
  define("AUCTION2_10", 20);

  define("AUCTION3_1",  21);
  define("AUCTION3_2",  22);
  define("AUCTION3_3",  23);
  define("AUCTION3_4",  24);
  define("AUCTION3_5",  25);
  define("AUCTION3_6",  26);
  define("AUCTION3_7",  27);
  define("AUCTION3_8",  28);
  define("AUCTION3_9",  29);
  define("AUCTION3_10", 30);
}
if (!defined("BUILDING_HOMESTEAD_YELLOW")){
  // Buildings
  define("BUILDING_HOMESTEAD_YELLOW", 1);
  define("BUILDING_HOMESTEAD_RED", 2);
  define("BUILDING_HOMESTEAD_GREEN", 3);
  define("BUILDING_HOMESTEAD_BLUE", 4);
  // Settlement
  define("BUILDING_GRAIN_MILL", 5);
  define("BUILDING_FARM" ,      6);
  define("BUILDING_MARKET" ,    7);
  define("BUILDING_FOUNDRY" ,   8);
  define("BUILDING_STEEL_MILL", 9);
  // Settlement or TOWN
  define("BUILDING_BOARDING_HOUSE" ,   10);
  define("BUILDING_RAILWORKERS_HOUSE", 11);
  define("BUILDING_RANCH",             12);
  define("BUILDING_TRADING_POST",      13);
  define("BUILDING_GENERAL_STORE",     14);
  define("BUILDING_GOLD_MINE",         15);
  define("BUILDING_COPPER_MINE",       16);
  define("BUILDING_RIVER_PORT",        17);
  // Town
  define("BUILDING_CHURCH",            18);
  define("BUILDING_WORKSHOP",          19);
  define("BUILDING_DEPOT",             20);
  define("BUILDING_STABLES",           21);
  define("BUILDING_BANK",              22);
  define("BUILDING_MEATPACKING_PLANT", 23);
  define("BUILDING_FORGE",             24);
  define("BUILDING_FACTORY",           25);
  define("BUILDING_RODEO",             26);
  define("BUILDING_LAWYER",            27);
  define("BUILDING_FAIRGROUNDS",       28);
  // City
  define("BUILDING_DUDE_RANCH",    29);
  define("BUILDING_TOWN_HALL",     30);
  define("BUILDING_TERMINAL",      31);
  define("BUILDING_RESTARAUNT",    32);
  define("BUILDING_TRAIN_STATION", 33);
  define("BUILDING_CIRCUS",        34);
  define("BUILDING_RAIL_YARD",     35);  
  define("FIRST_PLAYER_TILE",      36);

  define("BUILDING_LOC_FUTURE",  0);
  define("BUILDING_LOC_OFFER",   1);
  define("BUILDING_LOC_PLAYER",  2);
  define("BUILDING_LOC_DISCARD", 3);

  define("STAGE_SETTLEMENT", 1);
  define("STAGE_SETTLEMENT_TOWN", 2);
  define("STAGE_TOWN", 3);
  define("STAGE_CITY", 4);

  define("TYPE_RESIDENTIAL", 0);
  define("TYPE_COMMERCIAL",  1);
  define("TYPE_INDUSTRIAL",  2);
  define("TYPE_SPECIAL",     3);
} 
if (!defined("WOOD")){
  //resources
  define("NONE",   0);
  define("WOOD",   1);
  define("STEEL",  2);
  define("GOLD",   3);
  define("COPPER", 4);
  define("FOOD",   5);
  define("COW",    6);
}
if (!defined("NO_BID")){ 
  define("NO_BID",     0);
  define("BID_A1_B3",  1);
  define("BID_A1_B4",  2);
  define("BID_A1_B5",  3);
  define("BID_A1_B6",  4);
  define("BID_A1_B7",  5);
  define("BID_A1_B9",  6);
  define("BID_A1_B12", 7);
  define("BID_A1_B16", 8);
  define("BID_A1_B21", 9);
  define("OUTBID",     10);
  define("BID_A2_B3",  11);
  define("BID_A2_B4",  12);
  define("BID_A2_B5",  13);
  define("BID_A2_B6",  14);
  define("BID_A2_B7",  15);
  define("BID_A2_B9",  16);
  define("BID_A2_B12", 17);
  define("BID_A2_B16", 18);
  define("BID_A2_B21", 19);
  define("BID_PASS",   20);
  define("BID_A3_B3",  21);
  define("BID_A3_B4",  22);
  define("BID_A3_B5",  23);
  define("BID_A3_B6",  24);
  define("BID_A3_B7",  25);
  define("BID_A3_B9",  26);
  define("BID_A3_B12", 27);
  define("BID_A3_B16", 28);
  define("BID_A3_B21", 29);
}

class homesteaders extends Table
{
    public static $playerColorNames = array("ff0000" =>'red', "008000"=>'green', "0000ff"=>'blue', "ffff00"=> 'yellow');

	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
            "round_number"      => 10,
            "first_player"      => 11, 
            "selected_worker"   => 12,
            "building_selected" => 13,
            "bid_selected"      => 14,
            "phase"             => 15,
            "number_auctions"   => 16,
            "auction_next"      => 17,
            "last_bid"          => 18,
            "players_passed"    => 19,
            "bonus_option"      => 20,
        ) );        

	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "homesteaders";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // values are red/green/blue/yellow
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );

        self::reloadPlayersBasicInfos();
        $gamePlayers = self::loadPlayersBasicInfos();
        
        $number_auctions = 2;
        if (count($players) == 4){ 
            $number_auctions = 3;
        }
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'round_number', 0 );
        self::setGameStateInitialValue( 'first_player', 0 );
        self::setGameStateInitialValue( 'selected_worker', 0 );
        self::setGameStateInitialValue( 'building_selected', 0 );
        self::setGameStateInitialValue( 'bid_selected', 0 );
        self::setGameStateInitialValue( 'phase', 0 );
        self::setGameStateInitialValue( 'number_auctions', $number_auctions );
        self::setGameStateInitialValue( 'auction_next', 1 );
        self::setGameStateInitialValue( 'last_bid', 0 );
        self::setGameStateInitialValue( 'players_passed', 0 );
        self::setGameStateInitialValue( 'bonus_option', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat( 'table', 'turns_number', 0 );
        self::initStat( 'table', 'outbids_in_auctions', 0 );
        self::initStat( 'player', 'buildings_bought', 0 );
        self::initStat( 'player', 'residential_bought', 0 );
        self::initStat( 'player', 'industrial_bought', 0 );
        self::initStat( 'player', 'commercial_bought', 0 );
        self::initStat( 'player', 'special_bought', 0 );
        self::initStat( 'player', 'auctions_won', 0 );
        self::initStat( 'player', 'spent_on_auctions', 0 );
        self::initStat( 'player', 'times_outbid', 0 );

        // create building Tiles (in sql)

        self::createBuildings($gamePlayers);

        self::createAuctionTiles(count($players));

        $values = array();
        foreach( $players as $player_id => $player ){
            $values[] = "(".$player_id.")";
        }
        //resources
        $sql = "INSERT INTO resources (player_id) VALUES ";
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        // create 1 worker for each player.
        $sql = "INSERT INTO `workers` (player_id) VALUES ";
        $sql .= implode( ',', $values );        
        self::DbQuery( $sql );

        // set colors
        foreach ($gamePlayers as $pid => $p) {
            $color = $p['player_color'];
            $sql = "UPDATE `player` SET `color_name`='".self::$playerColorNames[$color]."' WHERE `player_id`='".$pid."'";
            self::DBQuery( $sql );
        }
        
        $this->activeNextPlayer();
        $active_player = self::getActivePlayerId();
        self::setGameStateValue('first_player', $active_player);
        self::setGameStateValue('current_phase', STATE_START_ROUND);

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT `player_id` id, `player_score` score, `color_name` color FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT * FROM `buildings` where `location` in (1,2)";
        $result['buildings'] = self::getCollectionFromDb( $sql );
  
        $sql = "SELECT * FROM `workers`";
        $result['workers'] = self::getCollectionFromDb( $sql );

        // TODO: Gather all information about current game situation (visible by player $current_player_id).
        $sql = "SELECT `player_id` id, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `debt`, `trade_tokens`, `vp_tokens` FROM `resources` WHERE player_id = $current_player_id";
        $result['player_resources'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `player_id` id, `workers`, `rail_tiles`, `bid_loc`, `rail_adv` FROM `resources` ";
        $result['public_resources'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `auction_id`, `position`, `location`, `state`, `build_type`, `bonus` FROM `auctions` WHERE `location` IN (1,2,3) ";
        $result['auctions'] = self::getCollectionFromDb( $sql );

        $result['round_number'] = self::getGameStateValue( 'round_number' );

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        $gameprogress = self::getGameStateValue('round_number') * 10;
        return $gameprogress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    
    function createBuildings($gamePlayers){
        
        $sql = "INSERT INTO buildings (building_id, building_type, stage, location, player_id) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $gamePlayers as $player_id => $player ) {
            $player_color = self::$playerColorNames[$player['player_color']];
            if ($player_color === 'yellow'){
                $values[] = "('".BUILDING_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '3', '".$player_id."')";
            } else if ($player_color === 'red'){
                $values[] = "('".BUILDING_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '3', '".$player_id."')";
            } else if ($player_color === 'green'){
                $values[] = "('".BUILDING_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '3', '".$player_id."')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BUILDING_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '3', '".$player_id."')";
            }
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        $sql = "INSERT INTO buildings (building_id, building_type, stage, cost) VALUES ";
        $values=array();
        // these building have 2 copies in 2 player, and 3 copies in 3-4 player
        for($i = 0; $i < count($gamePlayers) && $i <3; $i++) 
        {
            $values[] = "('".BUILDING_FARM   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT."','".WOOD."')";
            $values[] = "('".BUILDING_MARKET ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT."','".WOOD."')";
            $values[] = "('".BUILDING_FOUNDRY."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT."','".NONE."')";
        }
        //these building have 2 copies in 3-4 player
        for($i = 1; $i < count($gamePlayers) && $i <3; $i++) 
        {
            $values[] = "('".BUILDING_RANCH        ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL.FOOD."')";
            $values[] = "('".BUILDING_GENERAL_STORE."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".STEEL."')";
            $values[] = "('".BUILDING_GOLD_MINE    ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL."')";
            $values[] = "('".BUILDING_COPPER_MINE  ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD.STEEL."')";
            $values[] = "('".BUILDING_RIVER_PORT   ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD."')";
            $values[] = "('".BUILDING_WORKSHOP     ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".STEEL."')";
            $values[] = "('".BUILDING_DEPOT        ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".WOOD.STEEL."')";
            $values[] = "('".BUILDING_FORGE        ."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".STEEL.STEEL."')";
            $values[] = "('".BUILDING_DUDE_RANCH   ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.FOOD."')";
            $values[] = "('".BUILDING_RESTARAUNT   ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".WOOD.COPPER."')";
            $values[] = "('".BUILDING_TERMINAL     ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".STEEL.STEEL."')";
            $values[] = "('".BUILDING_TRAIN_STATION."','".TYPE_INDUSTRIAL ."','".STAGE_CITY           ."','".WOOD.COPPER."')";
        }
        //all other buildings
        $values[] = "('".BUILDING_GRAIN_MILL       ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.STEEL."')";
        $values[] = "('".BUILDING_STEEL_MILL       ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.WOOD.GOLD."')";
        $values[] = "('".BUILDING_BOARDING_HOUSE   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD."')";
        $values[] = "('".BUILDING_RAILWORKERS_HOUSE."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".STEEL.STEEL."')";
        $values[] = "('".BUILDING_TRADING_POST     ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".GOLD."')";
        $values[] = "('".BUILDING_CHURCH           ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".WOOD.STEEL.GOLD.COPPER."')";
        $values[] = "('".BUILDING_WORKSHOP         ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".STEEL."')";
        $values[] = "('".BUILDING_STABLES          ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".COW."')";
        $values[] = "('".BUILDING_MEATPACKING_PLANT."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".WOOD.COW."')";
        $values[] = "('".BUILDING_FACTORY          ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".STEEL.STEEL.COPPER."')";
        $values[] = "('".BUILDING_RODEO            ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".FOOD.COW."')";
        $values[] = "('".BUILDING_LAWYER           ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.GOLD.COW."')";
        $values[] = "('".BUILDING_FAIRGROUNDS      ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.WOOD.COPPER.COW."')";
        $values[] = "('".BUILDING_TOWN_HALL        ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.WOOD.COPPER."')";
        $values[] = "('".BUILDING_CIRCUS           ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".FOOD.FOOD.COW."')";
        $values[] = "('".BUILDING_RAIL_YARD        ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".STEEL.STEEL.GOLD.COPPER."')";

        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    function addWorker($player_id){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$player_id.");";
        self::DbQuery( $sql );
    }

    static function createAuctionTiles($playerCount){
        $sql = "INSERT INTO `auctions` ( `auction_id`, `position`, `location`, `state`, `build_type`, `bonus` ) VALUES ";
        // 0-NONE, 1-RES, 2-COM, 4-IND, 8-SPE
        $build = array( 3, 4, 2, 5, 2, 1, 4,15,15,15,
                        1, 4,15, 0, 3, 6,12, 9, 6, 9,
                        1, 2, 4, 0, 1, 2, 4,15, 3, 0);
        $bonus = array( 0, 0, 0, 0, 1, 1, 1, 0, 1, 1,
                        0, 0, 0, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 0, 0, 1, 0, 1, 1); 
        $values=array();
        //first auction is in order, and all face-up
        for ($i = 1; $i <11; $i++){
            $values[] = "('$i','$i','".AUCTION_LOC_DECK1."','".AUCTION_STATE_FACEUP."', '".$build[$i-1]."', '".$bonus[$i-1]."')";
        }

        //second auction has 1-4 , 5-8, and 9-10 shuffled
        $position1 = array('1','2','3','4');
        $position2 = array('5','6','7','8');
        $position3 = array('9','10');
        shuffle($position1);
        shuffle($position2);
        shuffle($position3);
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+11)."','".$position1[$i]."','".AUCTION_LOC_DECK2."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+10]."', '".$bonus[$i+10]."')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+15)."','".$position2[$i]."','".AUCTION_LOC_DECK2."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+14]."', '".$bonus[$i+14]."')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "('".($i+19)."','".$position3[$i]."','".AUCTION_LOC_DECK2."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+18]."', '".$bonus[$i+18]."')";
        }

        if ($playerCount>2){
            shuffle($position1);
            shuffle($position2);
            shuffle($position3);
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+21)."','".$position1[$i]."','".AUCTION_LOC_DECK3."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+20]."', '".$bonus[$i+20]."')";
            }
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+25)."','".$position2[$i]."','".AUCTION_LOC_DECK3."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+24]."', '".$bonus[$i+24]."')";
            }
            for ($i = 0; $i <2; $i++){
                $values[] = "('".($i+29)."','".$position3[$i]."','".AUCTION_LOC_DECK3."','".AUCTION_STATE_FACEDOWN."', '".$build[$i+28]."', '".$bonus[$i+28]."')";
            }   
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    function getBuildingFromKey($building_key){
        $sql = "SELECT * from `buildings` where `building_key`='$building_key'";
        $building = self::getObjectFromDB($sql);
        return ($building);
    }

    static function getBuildingNameFromKey($building_key){
        $building = self::getBuildingFromKey($building_key);
        $buildingName = self::getBuildingNameFromId($building['building_id']);
        return ($buildingName);
    }

    static function getBuildingNameFromId($building_id){
        switch($building_id)
        {
            case BUILDING_HOMESTEAD_YELLOW:
            case BUILDING_HOMESTEAD_RED:
            case BUILDING_HOMESTEAD_GREEN:
            case BUILDING_HOMESTEAD_BLUE:
                return clienttranslate( 'Homestead' );
            case BUILDING_GRAIN_MILL:
                return clienttranslate( 'Grain Mill' );
            case BUILDING_FARM:
                return clienttranslate( 'Farm' );
            case BUILDING_MARKET:
                return clienttranslate( 'Market' );
            case BUILDING_FOUNDRY:
                return clienttranslate( 'Foundry' );
            case BUILDING_STEEL_MILL:
                return clienttranslate( 'Steel Mill' );
            case BUILDING_BOARDING_HOUSE:
                return clienttranslate( 'Boarding House' );
            case BUILDING_RAILWORKERS_HOUSE:
                return clienttranslate( 'Railworkers House' );
            case BUILDING_RANCH:
                return clienttranslate( 'Ranch' );
            case BUILDING_TRADING_POST:
                return clienttranslate( 'Trading Post' );
            case BUILDING_GENERAL_STORE:
                return clienttranslate( 'General Store' );
            case BUILDING_GOLD_MINE:
                return clienttranslate( 'Gold Mine' );
            case BUILDING_COPPER_MINE:
                return clienttranslate( 'Copper Mine' );
            case BUILDING_RIVER_PORT:
                return clienttranslate( 'River Port' );
            case BUILDING_CHURCH:
                return clienttranslate( 'Church' );
            case BUILDING_WORKSHOP:
                return clienttranslate( 'Workshop' );
            case BUILDING_DEPOT:
                return clienttranslate( 'Depot' );
            case BUILDING_STABLES:
                return clienttranslate( 'Stables' );
            case BUILDING_BANK:
                return clienttranslate( 'Bank' );
            case BUILDING_MEATPACKING_PLANT:
                return clienttranslate( 'Meatpacking Plant' );
            case BUILDING_FORGE:
                return clienttranslate( 'Forge' );
            case BUILDING_FACTORY:
                return clienttranslate( 'Factory' );
            case BUILDING_RODEO:
                return clienttranslate( 'Rodeo' );
            case BUILDING_LAWYER:
                return clienttranslate( 'Lawyer' );
            case BUILDING_FAIRGROUNDS:
                return clienttranslate( 'Fairgrounds' );
            case BUILDING_DUDE_RANCH:
                return clienttranslate( 'Dude Ranch' );
            case BUILDING_TOWN_HALL:
                return clienttranslate( 'Town Hall' );
            case BUILDING_TERMINAL:
                return clienttranslate( 'Terminal' );
            case BUILDING_RESTARAUNT:
                return clienttranslate( 'Restataunt' );
            case BUILDING_TRAIN_STATION:
                return clienttranslate( 'Train Station' );
            case BUILDING_CIRCUS:
                return clienttranslate( 'Circus' );
            case BUILDING_RAIL_YARD:
                return clienttranslate( 'Rail yard' );
        }
    }

    static function getBuildingCostFromKey($building_key){
        $building = self::getBuildingFromKey($building_key);
        $cost = $building['cost'];
        $building_cost = array(
            WOOD  =>  '0',
            STEEL =>  '0',
            GOLD  =>  '0',
            COPPER => '0',
            FOOD  =>  '0',
            COW   =>  '0',
        );
        if ($cost == "0") 
            return $building_cost;
        for ($i =0; $i < strlen($cost); $i++){
            $building_cost[$cost[$i]] ++;
        }
        return $building_cost;
    }

    static function canPlayerAffordBuilding($player_id, $building_key){
        $building_cost = self::getBuildingCostFromKey ($building_key);
        $sql = "SELECT * `resources` WHERE `player_id` =".$player_id;
        $player_resources = self::getObjectFromDB($sql);
        $enough =            ($player_resources['wood']   >= $building_cost[WOOD]);
        $enough = $enough && ($player_resources['steel']  >= $building_cost[STEEL]);
        $enough = $enough && ($player_resources['gold']   >= $building_cost[GOLD]);
        $enough = $enough && ($player_resources['copper'] >= $building_cost[COPPER]);
        $enough = $enough && ($player_resources['food']   >= $building_cost[FOOD]);
        $enough = $enough && ($player_resources['cow']    >= $building_cost[COW]);
        return $enough;
    }
    
    static function collectIncome() 
    {
        $sql = "SELECT * FROM `resources` ";
        $resources = self::getCollectionFromDB( $sql );
        foreach ( $resources as $player_id => $player_resource ){
            $sql = "SELECT * FROM `building` WHERE `player_id` = '".$player_id."'";
            $player_buildings = self::getCollectionFromDB( $sql );
            $sql = "SELECT * FROM `workers` WHERE `player_id` = '".$player_id."'";
            $player_workers = self::getCollectionFromDB( $sql );

            $player_resource['silver'] += $player_resource['rail_tiles'];
            foreach( $player_buildings as $building_key => $building ) {
                switch($building['building_id']) {
                    case BUILDING_HOMESTEAD_YELLOW:
                    case BUILDING_HOMESTEAD_RED:
                    case BUILDING_HOMESTEAD_GREEN:
                    case BUILDING_HOMESTEAD_BLUE:
                    case BUILDING_BOARDING_HOUSE:
                    case BUILDING_DEPOT:
                        $player_resource['silver'] += 2;
                        break;
                    case BUILDING_GRAIN_MILL:
                        $player_resource['food'] += 1;
                        break;
                    case BUILDING_MARKET:
                    case BUILDING_GENERAL_STORE:
                        $player_resource['trade'] += 1;
                        break;
                    case BUILDING_STEEL_MILL:
                        $player_resource['steel'] += 1;
                        break;
                    case BUILDING_RAILWORKERS_HOUSE:
                        $player_resource['silver'] += 1;
                        $player_resource['trade']  += 1;
                        break;
                    case BUILDING_TRADING_POST:
                        $player_resource['trade'] += 2;
                        break;
                    case BUILDING_CHURCH:
                    case BUILDING_FACTORY:
                    case BUILDING_LAWYER:
                        $player_resource['vp'] += 2;
                        break;
                    case BUILDING_WORKSHOP:
                        $player_resource['vp'] += 1;
                        break;
                    case BUILDING_STABLES:
                        $player_resource['trade'] += 1;
                        $player_resource['vp'] += 1;
                        break;
                    case BUILDING_BANK:
                        $player_resource['debt'] -= 1;
                        break;
                    case BUILDING_RODEO:
                        $player_resource['silver'] += min($player_resource['workers'], 5);
                        break;
                    case BUILDING_FAIRGROUNDS:
                        $player_resource['gold'] += 1;
                        break;
                }
            }
            foreach($player_workers as $worker_key => $worker ) {
                switch($worker['building_key']){
                    case BUILDING_HOMESTEAD_YELLOW:
                    case BUILDING_HOMESTEAD_RED:
                    case BUILDING_HOMESTEAD_GREEN:
                    case BUILDING_HOMESTEAD_BLUE:
                        if ($worker['building_slot'] == 1){
                            $player_resource['wood'] += 1;
                        } else {
                            $player_resource['vp'] += 1;
                        }
                        break;
                    case BUILDING_FARM:
                        if ($worker['building_slot'] == 1){
                            $player_resource['trade'] += 1;
                            $player_resource['silver'] += 2;
                        } else {
                            $player_resource['food'] += 1;
                        }
                        break;
                    case BUILDING_MARKET:
                        $player_resource['silver'] += 2;
                        break;
                    case BUILDING_FOUNDRY:
                        $player_resource['steel'] += 1;
                        break;
                    case BUILDING_RANCH:
                        $player_resource['cow'] += 1;
                        break;
                    case BUILDING_GOLD_MINE:
                        $player_resource['gold'] += 1;
                        break;
                    case BUILDING_COPPER_MINE:
                        $player_resource['copper'] += 1;
                        break;
                    case BUILDING_RIVER_PORT:
                        if ($worker['building_slot'] == 2){
                            $player_resource['gold'] += 1;
                        } 
                        break;
                    case BUILDING_MEATPACKING_PLANT:
                    case BUILDING_FORGE:
                        $player_resource['vp'] += 2;
                        break;
                }
            }
            if ($player_resource['dept']==-1){
                $player_resource['dept'] = 0;
                $player_resource['silver'] += 2;
            }
            $sql = "UPDATE `resource` SET ";
            foreach($player_resource as $res => $inc){
                $sql .= "`".$res."`='".$inc."', ";
            }
            $sql .= "'= WHERE `player_id`='".$player_id."' ";
            self::DbQuery( $sql );
        }
    }

    static function payForBuilding($player_id, $building_key){
        $building_cost = self::getBuildingCostFromKey ($building_key);
        $sql = "SELECT * `resources` WHERE `player_id` =".$player_id;
        $player_resources = self::getObjectFromDB($sql);
        $wood  = ($player_resources['wood']   - $building_cost[WOOD]);
        $steel = ($player_resources['steel']  - $building_cost[STEEL]);
        $gold  = ($player_resources['gold']   - $building_cost[GOLD]);
        $copper =($player_resources['copper'] - $building_cost[COPPER]);
        $food  = ($player_resources['food']   - $building_cost[FOOD]);
        $cow   = ($player_resources['cow']    - $building_cost[COW]);
        $sql = "UPDATE `resources` SET 'wood'= '".$wood."','steel'= '".$steel."','gold' = '".$gold."','copper'='".$copper."','food' = '".$food."','cow'='".$cow."') WHERE `player_id` =".$player_id;
        self::DbQuery( $sql );
    }

    function getUnusedWorkers($player_id){
        $workers = array();
        $sql = "SELECT * `workers` WHERE `player_id`='".$player_id."'";
        $player_workers = self::getCollectionFromDB( $sql);
        foreach($player_workers as $worker_key => $worker ){
            if ($worker[`building_key`] == '0'){
                $workers += $worker;
            }
        }
        return $workers;
    }
    
    static function clearBids(){
        $sql = "UPDATE `resources` SET `bid_loc`= '".NO_BID."' ";
        self::DbQuery( $sql );
        self::setGameStateValue('last_bid', 0);
        self::setGameStateValue('players_passed', 0);
    }

    static function canPlayerBid($player_id) {
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $bids = self::getCollectionFromDB( $sql );
        
        if ($bids[$player_id] == BID_PASS  ) {
            return true;
        } 
        if ($bids[$player_id] == NO_BID || 
            $bids[$player_id] == OUTBID) {
            return false;
        } 
        return false;
    }

    static function discardAuctionTile($auction_no){
        $round_number = self::getGameStateValue( 'round_number' );
        $sql = "UPDATE `auctions` SET `location`='".AUCTION_LOC_DISCARD."' WHERE `location` == '".$auction_no."' AND position == '".$round_number."'";
        self::DBQuery( $sql);
    }
    
    function doTheyOwnBuilding($player_id, $building_id) {
        $sql = "SELECT * FROM `buildings` WHERE `player_id`='".$player_id."'";
        $buildings = self::getCollectionFromDB( $sql );
        $own = false;
    }

    function buyBuilding( $player_id, $building_key )
    {
        $afford = canPlayerAffordBuilding ($player_id, $building_key);
        if ($afford){
            self::payForBuilding($player_id, $building_key);
            $sql = "UPDATE `buildings` Set `location`= ".BUILDING_LOC_PLAYER.", `player_id`=".$player_id." WHERE building_key =".$building_key;    
            self::DbQuery( $sql );
            self::notifyAllPlayers( "buyBuilding", clienttranslate( '${player_name} buys a building ${building_key} ' ),
            array('player_id' => $player_id,'player_name' => self::getActivePlayerName(),'building_key' => getBuildingNameFromKey($building_key),) );
            return true;
        } else {
            $this->notifyPlayer( $player_id, "notEnoughResources", clienttranslate( '${you} do not have enough resources to buy building ${building_key} ' ),
            array('player_id' => $player_id,'player_name' => self::getActivePlayerName(),'building_key' => getBuildingNameFromKey($building_key),) );
            return false;
        } 
    }

    static function getValidBids($player_id) {
        $valid_bids = range(1,29);
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $resources = self::getCollectionFromDB( $sql );
        
        foreach ($resources as $player_id => $resource){
            $bid = $resource['bid_loc']; 
            if ($bid > 0 && $bid < 10){
                for ($i = $bid; i >0; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 10 && $bid < 20) {
                for ($i = $bid; i >10; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 20 && $bid < 30) {
                for ($i = $bid; i >20; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            }
        }
        return ($valid_bids);
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in homesteaderstb.action.php)
    */

    function takeLoan()
    {
        self::checkAction( 'takeLoan' );

        $current_player_id = self::getCurrentPlayerId();
        $sql =  "SELECT * FROM `resources` WHERE `player_id`='".$current_player_id."' ";
        $resource = self::getObjectFromDb($sql);
        $silver = $resource['silver'] + 2;
        $dept = $resource['dept'] + 1;
        $sql = "UPDATE resources Set `silver`= ".$silver.", `dept`=".$dept." player WHERE player_id =$current_player_id";
        self::DbQuery( $sql );

        self::notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a loan' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
        ) );
    }

    function trade( $resource1, $resource2 )
    {
        self::checkAction( 'trade' );
        
        $player_id = self::getCurrentPlayerId();

        self::notifyAllPlayers( "trade", clienttranslate( '${player_name} trades ${trade1} for ${trade2}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
    }

    function selectWorkerDestination($selectedWorker, $building_key, $building_slot) {
        self::checkAction( "placeWorkers" );
        $player_id = self::getCurrentPlayerId();
        $slotRequiredWorkers = 1;
        $building = self::getBuildingFromKey($building_key);
        if ($building['building_id'] == BUILDING_RIVER_PORT){
            $slotRequiredWorkers = 2;
        }

        if (count($selectedWorker)> $slotRequiredWorkers)
            throw new BgaUserException( self::_("Too many workers selected.") );

        // if not enough workers are selected, select un-assigned workers (controlled by player)
        if(count($selectedWorker)<$slotRequiredWorkers){
            $workers = getUnusedWorkers($player_id);
            if (count($workers) + count($selectedWorker)<$slotRequiredWorkers)
               throw new BgaUserException( self::_("You Must select worker(s) to move") );
            $selectedWorker += $workers;
        } 
    }
 
    function placeWorker($worker_key, $building_key, $building_slot)
    {
        self::checkAction( "placeWorkers" );
        $player_id = self::getCurrentPlayerId();
        $sql = "UPDATE `workers` SET `building_id`='".$building_key."' `player_id`='".$player_id."' WHERE `worker_key`='".$worker_key."'";
        self::DbQuery( $sql );
    }

    function donePlacingWorkers (){
        $current_player_id = self::getCurrentPlayerId();
        $currentPhase = self::getGameStateValue('current_phase');
            
        $this->gamestate->setPlayerNonMultiactive( $current_player_id, "done" );
    }

    static function makeBid($player_id, $bid_location){
        $sql = "UPDATE `resource` SET `bid_loc` = '".$bid_location."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    
    
    //Example for game state "MyGameState":

    function stStartRound()
    {
        $round_number = self::getGameStateValue('round_number') + 1;
        self::setGameStateValue('round_number', $round_number);

        //rd 1 setup buildings
        if($round_number == 1){
            // add 'settlement' and 'settlement/town' buildings
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_OFFER."' WHERE stage in ('".STAGE_SETTLEMENT."','".STAGE_SETTLEMENT_TOWN."');";
            self::DbQuery( $sql );
        }
        //rd 5 setup buildings
        if($round_number == 5){
            // add town buildings
            $sql = "UPDATE `buildings` SET `location` = '".BUILDING_LOC_OFFER."' WHERE stage = '".STAGE_TOWN."'";
            self::DbQuery( $sql );
            // remove settlement buildings (not owned)
            $sql = "UPDATE `buildings` SET `location` = '".BUILDING_LOC_DISCARD."' WHERE stage = '".STAGE_SETTLEMENT."' AND location = '".BUILDING_LOC_OFFER."'";
            self::DbQuery( $sql );
        }
        //rd 9 setup buildings
        if($round_number == 9){
            // clear all buildings
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_DISCARD."' WHERE location = '".BUILDING_LOC_OFFER."';";
            self::DbQuery( $sql );
            // add city buildings
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_OFFER."' WHERE stage = '".STAGE_CITY."';";
            self::DbQuery( $sql );
        }

        // update Auctions.
        if ($round_number>1){
            $last_round = $round_number -1;
            $sql = "UPDATE auctions SET location = '".AUCTION_LOC_DISCARD."' WHERE position = '".$last_round."';";
            self::DbQuery( $sql );
        }
        $sql = "UPDATE auctions SET state = '".AUCTION_STATE_FACEUP."' WHERE position = '".$round_number."';";
        self::DbQuery( $sql );
        
        $this->gamestate->nextState();
    }    

    function stPlaceWorkers()
    {
        $this->gamestate->setAllPlayersMultiactive( "done");
        // for each player have them place workers (then press done)
        
        $this->gamestate->setAllPlayersNonMultiactive( STATE_INCOME );
    }

    function stCollectIncome()
    {
        self::collectIncome();

        $this->gamestate->nextState( );
    }

    function stPayWorkers()
    {
        $sql = "SELECT `player_id`, `workers`, `gold`, `silver` `trade` `dept` FROM `resources` "
        $players = self::getCollectionFromDB( $sql );
        $this->gamestate->setAllPlayersMultiactive( );
        foreach($players as $player_id => $player){
            if ($player['gold'] == 0 && $player['trade'] == 0){
                //no decisions just pay.
                $silver = $player['silver'];
                $dept = $player['dept'];
                if ($player['silver'] >= $player['workers']){
                    $silver = $player['silver'] - $player['workers'];
                } else {
                    while ($silver < $player['workers']){
                        $silver +=2;
                        $dept ++;
                    } 
                }
                $sql = "UPDATE `resources` SET `silver`='".$silver."', `dept`='".$dept."' WHERE `player_id`='".$player_id."'";
                $this->gamestate->setPlayerNonMultiactive($player_id);
            } else {
                $this->gamestate->setPlayerNonMultiactive($player_id);    
            }
        }
        // if player has gold or trade token, 
        // make them active to trade and,
        // choose to pay workers with gold or silver (no change for gold)
        
    }
    
    function stBeginAuction(){
        self::clearBids();

        $first_player = self::getGameStateValue('first_player');
        $this->gamestate->changeActivePlayer( $first_player );
        $this->gamestate->nextState( STATE_PLAYER_BID );
    }

    function stNextBid()
    { 
        $this->activeNextPlayer();
        // figure out if bid round is complete, 
        $active_player = $this->getActivePlayerId();
        $last_bid = self::getGameStateValue( 'last_bid' );
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $bids = self::getCollectionFromDB( $sql );
        // if bidding is complete
        $players_passed = self::getGameStateValue('players_passed');
        if ($bids[$active_player] == $last_bid || $players_passed >= count($bids)) {
            //  TODO:: put message here, that bidding round is complete.
            $this->gamestate->nextState( STATE_NEXT_BUILDING );
        } else if (self::canPlayerBid($active_player)) {// if this player can bid.
            $this->gamestate->nextState( STATE_PLAYER_BID );
        } else { // if not, let next player bid
            $this->gamestate->nextState( STATE_NEXT_BID );
        }
    }

    function stUpdateBid($bid_location) {
        $active_player = $this->getActivePlayer();
        $valid_bids = self::getValidBids($active_player);
        if (in_array($bid_location, $valid_bids)){// valid bid
            $active_player = $this->getActivePlayerId();
            self::makeBid($bid_location, $active_player);
            self::setGameStateValue('last_bid', $bid_location);
            $this->gamestate->nextState( STATE_NEXT_BID );
        } else if ($bid_location == BID_PASS){ //follow pass bid procedue
            $players_passed = self::getGameStateValue('players_passed');
            $players_passed ++;
            self::setGameStateValue('players_passed', $players_passed);
            self::setGameStateValue('phase', 2);
            $this->gamestate->nextState( STATE_RAIL_BONUS );
        } else { //if ($bid_location == NO_BID || $bid_location == OUTBID) {
            // user error non-valid bid.
            // TODO: Add ERROR HERE.
        } 
    }

    function stBuildingPhase()
    {
        $next_auction = self::getGameStateValue( 'auction_next' );
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $bids = self::getCollectionFromDB( $sql );
        $next_player_id = 0;
        // determine winner of this auction
        foreach($bids as $player_id => $bid){ 
            if ($next_auction == 1 && $bid['bid_loc'] >= BID_A1_B3 && $bid['bid_loc'] <= BID_A1_B21 ){
                $next_player_id=$player_id;
                break;
            }
            if ($next_auction == 2 && $bid['bid_loc'] >= BID_A2_B3 && $bid['bid_loc'] <= BID_A2_B21 ){
                $next_player_id=$player_id;
                break;
            }
            if ($next_auction == 3  && $bid['bid_loc'] >= BID_A3_B3 && $bid['bid_loc'] <= BID_A3_B21 ){
                $next_player_id=$player_id;
                break;
            }
        }
        if ($next_player_id == 0) {
            self::discardAuctionTile($next_auction);
            $number_auctions = self::getGameStateValue( 'number_auctions' );
            if ($next_auction == $number_auctions) {
                $next_auction ++;
                self::setGameStateValue( 'auction_next', $next_auction);
                $this->gamestate->nextState( STATE_NEXT_BUILDING );
            } else {
                self::setGameStateValue( 'auction_next', 1);
                $this->gamestate->nextState( STATE_END_ROUND );
            }
        } else {
            if ($next_auction == 1){
                self::setGameStateValue('first_player', $next_player_id);
            }
            $this->gamestate->changeActivePlayer( $next_player_id );
            $this->gamestate->nextState( STATE_PAY_AUCTION );
        }    
    }

    function stBuild()
    {
        $auction_no = self::getGameStateValue( 'auction_next' );
        $round_number = self::getGameStateValue( 'round_number' );
        $sql = "SELECT `auction_id`, `build_type` FROM `auctions` WHERE `location` = ".$auction_no." AND `position` = ".$round_number;
        $auction_card = self::getObjectFromDB( $sql );
        $build_type = $auction_card['build_type']; 
        if ( $build_type== 0 ){
            $this->gamestate->nextState( STATE_CHOOSE_BONUS ); 
        } else {
            $this->gamestate->nextState( STATE_RESOLVE_BUILDING );
        }
        
    }

    function stGetBonus()
    {
        $round_number = self::getGameStateValue( 'round_number' );
        $active_player = $this->getActivePlayerId();
        $auction_no = self::getGameStateValue( 'auction_next' );
        $sql = "SELECT `auction_id`, `bonus` FROM `auctions` WHERE `location` = ".$auction_no." AND `position` = ".$round_number;
        $auction = self::getObjectFromDB( $sql );
        if ($auction['bonus'] == 1){
            switch($auction['auction_id']){
                case AUCTION1_5:
                case AUCTION1_6:
                case AUCTION1_7: 
                    // worker
                    addWorker($active_player);
                    self::setGameStateValue( 'bonus_option', NONE );
                break;
                case AUCTION2_4:
                case AUCTION3_4:
                    addWorker($active_player);
                    self::setGameStateValue( 'bonus_option' , 7);
                    // worker and rail adv
                break;
                case AUCTION2_8:
                case AUCTION3_7:
                    // wood for rail tile (not rail advancement)
                    self::setGameStateValue( 'bonus_option' , WOOD);
                break;
                // resource for points
                case AUCTION1_9:
                    // copper for 4 vp.
                    self::setGameStateValue( 'bonus_option' , COPPER);
                break;
                case AUCTION1_10:
                    // cow for 4 vp.
                    self::setGameStateValue( 'bonus_option' , COW);
                break;
                case AUCTION3_10:
                    $sql = "SELECT `vp` FROM `resources` WHERE `player_id` = '".$active_player."'";
                    $oldVp = self::getObjectFromDB( $sql );
                    $vp = $oldVp['vp'] + 6;
                    $sql = "UPDATE `resources` SET `vp`= '".$vp."' WHERE `player_id` = '".$active_player."'";
                    self::DbQuery( $sql );
                    // get 6 vp (charity) & get next (food->2VP)
                case AUCTION2_9:
                case AUCTION2_10:
                case AUCTION3_9:
                    // trade 1 food for 2 VP.
                    self::setGameStateValue( 'bonus_option' , FOOD);
                break;
            }
            $this->gamestate->nextState( STATE_CHOOSE_BONUS );
        } else {
            if ($auction_no = self::getGameStateValue( 'number_auctions' )){
                $this->gamestate->nextState( STATE_END_ROUND );
            } else {
                $sql = "UPDATE `auctions` SET `location` = 0 WHERE `location` = '".$auction_no."' AND `position` = '".$round_number."'";
                self::DbQuery( $sql );
                self::setGameStateValue( 'auction_next', ($auction_no +  1) );
                $this->gamestate->nextState( STATE_NEXT_BUILDING );
            }
        }
    }

    function stChooseBonus()
    {
        $bonus = self::getGameStateValue( 'bonus_option' );
        switch($bonus){
            case NONE:
                // no choice required.
            break;
            case WOOD:
                // trade wood for rail tile.
            break;
            case FOOD:
                // trade 2 food for vp.
            break;
            case COW:
                // trade livestock for vp.
            break;
            case COPPER:
                // trade copper for vp.
            break;
            case 7:
                // get rail_advancement.
            break;
        }
        $auction_no = self::getGameStateValue( 'auction_next' );
        self::discardAuctionTile($auction_no);
        if ($auction_no = self::getGameStateValue( 'number_auctions' )){
            $this->gamestate->nextState( STATE_END_ROUND );
        } else {
            self::setGameStateValue( 'auction_next', $auction_no +  1 );
            $this->gamestate->nextState( STATE_NEXT_BUILDING );
        }
    }

    function stEndRound()
    {
        $round_number = self::getGameStateValue( 'round_number' );
        if ($round_number == 10){
            $this->gamestate->nextState( STATE_END_GAME );
        } else {
            self::setGameStateValue( 'auction_next' , 1);
            self::setGameStateValue( 'players_passed' , 0);
            self::setGameStateValue( 'last_bid' , 0);
            $this->gamestate->nextState( STATE_START_ROUND );
        }
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
