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
require_once('modules/constants.inc.php');
require_once('modules/homesteadersLog.class.php');

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
            "selected_building" => 13,
            "bid_selected"      => 14,
            "phase"             => 15,
            "number_auctions"   => 16,
            "current_auction"   => 17,
            "last_bid"          => 18,
            "players_passed"    => 19,
            "bonus_option"      => 20,
        ) );
        
        $this->log   = new homesteadersLog($this);

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
        self::DbQuery('DELETE FROM player');
        // Set the colors of the players with HTML color code
        // values are red/green/blue/yellow
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
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

        /************ Start the game initialization *****/

        $this->log->initStats($players);

        $number_auctions = 2;
        if (count($players) == 4){ 
            $number_auctions = 3;
        }
        // Init global values with their initial values
        self::setGameStateInitialValue( 'round_number', 0 );
        self::setGameStateInitialValue( 'first_player', 0 );
        self::setGameStateInitialValue( 'selected_worker', 0 );
        self::setGameStateInitialValue( 'selected_building', 0 );
        self::setGameStateInitialValue( 'bid_selected', 0 );
        self::setGameStateInitialValue( 'phase', 0 );
        self::setGameStateInitialValue( 'number_auctions', $number_auctions );
        self::setGameStateInitialValue( 'current_auction', 1 );
        self::setGameStateInitialValue( 'last_bid', 0 );
        self::setGameStateInitialValue( 'players_passed', 0 );
        self::setGameStateInitialValue( 'bonus_option', 0 );
        
        // create building Tiles (in sql)
        self::createBuildings($gamePlayers);

        self::createAuctionTiles(count($players));

        $values = array();
        foreach( $players as $player_id => $player ){
            $values[] = "(".$player_id.")";
        }

        // setup resources table
        self::DBQuery("DELETE FROM `resources`");
        $sql = "INSERT INTO resources (player_id) VALUES ";
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        // create 1 worker for each player.
        self::DBQuery("DELETE FROM `workers`");
        $sql = "INSERT INTO `workers` (player_id) VALUES ";
        $sql .= implode( ',', $values );        
        self::DbQuery( $sql );

        // set colors
        foreach ($gamePlayers as $pid => $p) {
            $color = $p['player_color'];
            $sql = "UPDATE `player` SET `color_name`='".self::$playerColorNames[$color]."' WHERE `player_id`='".$pid."'";
            self::DBQuery( $sql );
        }
        
        self::activeNextPlayer();
        $active_player = self::getActivePlayerId();
        self::setGameStateValue('first_player', $active_player);
        
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
    
        $current_player_id = $this->getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        $sql = "SELECT `player_id`, `player_score`, `color_name` FROM `player` ";
        $result['players'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `building_key`, `building_id`, `building_type`, `stage`, `location`, `player_id`, `worker_slot` FROM `buildings` ";
        $result['buildings'] = self::getCollectionFromDb( $sql );
  
        $sql = "SELECT `worker_key`, `player_id`, `building_key`, `building_slot`, `selected` FROM `workers`";
        $result['workers'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `player_id`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '".$current_player_id."'";
        $result['player_resources'] = self::getObjectFromDb( $sql );

        $sql = "SELECT `player_id`, `workers`, `rail_tiles`, `bid_loc`, `rail_adv` FROM `resources` ";
        $result['resources'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `auction_id`, `position`, `location`,  `build_type`, `bonus` FROM `auctions` WHERE `location` IN (1,2,3) "; //`state`
        $result['auctions'] = self::getCollectionFromDb( $sql );
        
        $result['current_player'] = $current_player_id;
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
        $gameprogress += self::getGameStateValue('current_auction');
        return $gameprogress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    
    function createBuildings($gamePlayers){
        self::DBQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (`building_id`, `building_type`, `stage`, `location`, `player_id`) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $gamePlayers as $player_id => $player ) {
            $player_color = self::$playerColorNames[$player['player_color']];
            if ($player_color === 'yellow'){
                $values[] = "('".BUILDING_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."')";
            } else if ($player_color === 'red'){
                $values[] = "('".BUILDING_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."')";
            } else if ($player_color === 'green'){
                $values[] = "('".BUILDING_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BUILDING_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."')";
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

    static function createAuctionTiles($playerCount){
        self::DBQuery("DELETE FROM `auctions`");
        $sql = "INSERT INTO `auctions` ( `auction_id`, `position`, `location`, `build_type`, `bonus` ) VALUES ";
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
            $values[] = "('$i','$i','".AUCTION_LOC_DECK1."', '".$build[$i-1]."', '".$bonus[$i-1]."')";
        }

        //second auction has 1-4 , 5-8, and 9-10 shuffled
        $position1 = array('1','2','3','4');
        $position2 = array('5','6','7','8');
        $position3 = array('9','10');
        shuffle($position1);
        shuffle($position2);
        shuffle($position3);
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+11)."','".$position1[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+10]."', '".$bonus[$i+10]."')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+15)."','".$position2[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+14]."', '".$bonus[$i+14]."')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "('".($i+19)."','".$position3[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+18]."', '".$bonus[$i+18]."')";
        }

        if ($playerCount>2){
            shuffle($position1);
            shuffle($position2);
            shuffle($position3);
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+21)."','".$position1[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+20]."', '".$bonus[$i+20]."')";
            }
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+25)."','".$position2[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+24]."', '".$bonus[$i+24]."')";
            }
            for ($i = 0; $i <2; $i++){
                $values[] = "('".($i+29)."','".$position3[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+28]."', '".$bonus[$i+28]."')";
            }   
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    
    static function updateResource($player_id, $resource_key, $amount){
        $sql = "SELECT `".$resource_key."` FROM `resources` WHERE `player_id`= '".$player_id."'";
        $resource_count = self::getUniqueValueFromDB( $sql );
        $resource_count += $amount;
        $sql = "UPDATE `resources` SET `".$resource_key."`='".$resource_count."' WHERE `player_id`= '".$player_id."'";
        self::DBQuery( $sql );
        // TODO: add notification handler here;
    }

    static function addWorker($player_id){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$player_id.");";
        self::DbQuery( $sql );
        self::updateResource($player_id, 'workers', 1);
    }

    function getBuildingFromKey($building_key){
        $sql = "SELECT * from `buildings` where `building_key`='$building_key'";
        $building = self::getObjectFromDB($sql);
        return ($building);
    }

    function getBuildingNameFromKey($building_key){
        $building = self::getBuildingFromKey($building_key);
        $buildingName = self::getBuildingNameFromId($building['building_id']);
        return ($buildingName);
    }

    function getBuildingNameFromId($building_id){
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

    function getBuildingCostFromKey($building_key){
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

    function canPlayerAffordBuilding($player_id, $building_key){
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
    
    function collectIncome() 
    {
        $sql = "SELECT * FROM `resources` ";
        $resources = self::getCollectionFromDB( $sql );
        foreach ( $resources as $player_id => $player_resource ){
            $sql = "SELECT * FROM `buildings` WHERE `player_id` = '".$player_id."'";
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
                        $player_resource['loan'] -= 1;
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
            if ($player_resource['loan']==-1){
                $player_resource['loan'] = 0;
                $player_resource['silver'] += 2;
            }
            $sql = "UPDATE `resources` SET ";
            $values = array();
            foreach($player_resource as $res => $inc){
                $values[] = "`".$res."`='".$inc."' ";
            }
            $sql .= implode( ',', $values );
            $sql .= " WHERE `player_id`='".$player_id."' ";
            self::DbQuery( $sql );
        }
    }

    function payForBuilding($player_id, $building_key){
        $building_cost = self::getBuildingCostFromKey ($building_key);
        $sql = "SELECT * `resources` WHERE `player_id` =".$player_id;
        $player_resources = self::getObjectFromDB($sql);
        $wood  = ($player_resources['wood']   - $building_cost[WOOD]);
        $steel = ($player_resources['steel']  - $building_cost[STEEL]);
        $gold  = ($player_resources['gold']   - $building_cost[GOLD]);
        $copper =($player_resources['copper'] - $building_cost[COPPER]);
        $food  = ($player_resources['food']   - $building_cost[FOOD]);
        $cow   = ($player_resources['cow']    - $building_cost[COW]);
        $sql = "UPDATE `resources` SET 'wood'= '".$wood."','steel'= '".$steel."','gold' = '".$gold."','copper'='".$copper."','food' = '".$food."','cow'='".$cow."') WHERE `player_id` ='".$player_id."'";
        self::DbQuery( $sql );
    }
    
    function clearBids(){
        self::DbQuery( "UPDATE `resources` SET `bid_loc`= '".NO_BID."' " );
        self::setGameStateValue('last_bid', 0);
        self::setGameStateValue('bid_selected', 0 );
        self::setGameStateValue('players_passed', 0);
    }

    function canPlayerBid($player_id) {
        $sql = "SELECT `bid_loc` FROM `resources` WHERE `player_id`='".$player_id."'";
        $bid_location = self::getUniqueValueFromDB( $sql );
        
        /* if ($bid_location == BID_PASS  ) {
            return false;
        } */ 
        if ($bid_location == NO_BID || 
            $bid_location == OUTBID) {
            return true;
        } 
        return false;
    }
    
    function getRailAdvBonusOptions($player_id){
        $sql = "SELECT `rail_adv` FROM `resources` WHERE `player_id`='".$player_id."'";
        $rail_adv =self::getUniqueValueFromDB( $sql );
        $options = array();
        if($rail_adv >0){
            $options[] = TRADE; 
        } 
        if($rail_adv >1){
            $options[] = RAIL_LINE; 
        } 
        if($rail_adv >2){
            $options[] = WORKER;
        }  
        if($rail_adv >3){
            $options[] = WOOD;
            $options[] = FOOD;
            $options[] = STEEL;
            $options[] = GOLD;
            $options[] = COPPER;
            $options[] = COW;
        } 
        if($rail_adv >4){
            $options[] = VP;
        }
        return $options; 
    }

    function discardAuctionTile($auction_no){
        $round_number = self::getGameStateValue( 'round_number' );
        $sql = "UPDATE `auctions` SET `location`='".AUCTION_LOC_DISCARD."' WHERE `location` == '".$auction_no."' AND position == '".$round_number."'";
        self::DBQuery( $sql);
    }
    
    function doTheyOwnBuilding($player_id, $building_id) {
        $sql = "SELECT * FROM `buildings` WHERE `player_id`='".$player_id."'";
        $buildings = self::getCollectionFromDB( $sql );
        foreach ($buildings as $building_key => $building){
            if ($building['building_id'] == $building_id) {
                return true;
            }
        }
        return false;
    }

    function buyBuilding( $player_id, $building_key )
    {
        $afford = canPlayerAffordBuilding ($player_id, $building_key);
        if ($afford){
            self::payForBuilding($player_id, $building_key);
            $sql = "UPDATE `buildings` Set `location`= ".BUILDING_LOC_PLAYER.", `player_id`=".$player_id." WHERE building_key =".$building_key;    
            self::DbQuery( $sql );
            self::notifyAllPlayers( "buyBuilding", 
                        clienttranslate( '${player_name} buys a building ${building_name} ' ),            
                        array('player_id' => $player_id,
                              'player_name' => self::getActivePlayerName(),
                              'building_name' => getBuildingNameFromKey($building_key),) );
            return true;
        } else {
            $this->notifyPlayer( $player_id, "notEnoughResources", 
                        clienttranslate( '${you} do not have enough resources to buy building ${building_name} ' ),
                        array('player_id' => $player_id,
                            'player_name' => self::getActivePlayerName(),
                            'building_name' => getBuildingNameFromKey($building_key),
                            ) );
            return false;
        } 
    }

    function makeBid($bid_location, $player_id){
        $sql = "UPDATE `resources` SET `bid_loc` = '".$bid_location."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
		self::notifyAllPlayers("moveBidToken", '', array (
				'player_id' => $player_id,
				'bid'=>$bid_location
                ));
        // mark somebids as outbid.
        // TODO:: add logging of outbids (for stats).
        if ($bid_location > 0 && $bid_location < 10){
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '1' AND '".$bid_location."'";
            self::DBQuery( $sql );
        } else if ($bid_location > 10 && $bid < 20) {
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '11' AND '".$bid_location."'";
            self::DBQuery( $sql );
        } else if ($bid_location > 20 && $bid_location < 30) {
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '21' AND '".$bid_location."'";
            self::DBQuery( $sql );
        }
    }

    function getValidBids($player_id) {
        $valid_bids = range(1,29);
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $resources = self::getCollectionFromDB( $sql );
        $offset = 0;
        if (self::doTheyOwnBuilding($player_id, BUILDING_LAWYER)){
            $offset = 1;
        }             
        foreach ($resources as $player_id => $resource){
            $bid = $resource['bid_loc']; 
            if ($bid > 0 && $bid < 10){
                for ($i = ($bid - $offset); $i >0; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 10 && $bid < 20) {
                for ($i = ($bid - $offset); $i >10; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 20 && $bid < 30) {
                for ($i = ($bid - $offset); $i >20; $i--){
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
        (note: each method below must match an input method in homesteaders.action.php)
    */

    public function playerTakeLoan()
    {
        self::checkAction( 'takeLoan' );

        $current_player_id = $this->getCurrentPlayerId();
        $sql =  "SELECT `silver`, `loan` FROM `resources` WHERE `player_id`='".$current_player_id."' ";
        $player_resources = self::getObjectFromDb($sql);
        $silver = $player_resources['silver'] + 2;
        $loan = $player_resources['loan'] + 1;
        $sql = "UPDATE `resources` SET `silver`= '".$silver."', `loan`='".$loan."' WHERE player_id ='".$current_player_id."'";
        self::DbQuery( $sql );
        $this->log->takeLoan($current_player_id);
        self::notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a loan' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
        ) );
    }

    public function playerTrade( $async= true, $trade )
    {
        self::checkAction( 'trade' );
        
        $player_id = 0;
        $player_name = "";
        if ($async) {
            $player_id = self::getCurrentPlayerId();
            $player_name = self::getCurrentPlayerName();
        } else {
            $player_id = self::getActivePlayerId();
            $player_name = self::getActivePlayerName();
        }

        switch ($trade){
            case 1:
                
        }

        self::notifyAllPlayers( "trade", clienttranslate( '${player_name} trades ${trade1} for ${trade2}' ), array(
            'player_id' => $player_id,
            'player_name' => $player_name,
            'trade1' => $resource_to_sell_name,
            'trade2' => $resource_to_buy_name
        ) );
    }


    public function playerHireWorker($async = true){
        self::checkAction( 'hireWorker' );

        $player_id = self::getCurrentPlayerId();
        if ($async)

    }

    public function playerSelectWorkerDestination($building_key, $building_slot) 
    {
        self::checkAction( "placeWorkers" );
        $player_id = $this->getCurrentPlayerId();
        $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`= '".$player_id."' AND `selected` = '1' ";
        $workers = self::getCollectionFromDB( $sql );

        // if not enough workers are selected, select from un-assigned workers (controlled by player)
        if(count($workers)<1){
            $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$player_id."' AND `building_key`='0'";
            $workers = self::getCollectionFromDB( $sql );
        } 

        if(count($workers)<1)
            throw new BgaUserException( self::_("You Must select worker(s) to move") );
        
        $sql = "UPDATE `workers` SET `building_key`= '".$building_key."', `building_slot`='".$building_slot."', `selected`='0' WHERE `worker_key`='".array_rand($workers)."'";
        self::DBQuery( $sql );
    }

    public function playerDonePlacingWorkers ()
    {
        self::checkAction( "placeWorkers" );
        $this->gamestate->setPlayerNonMultiactive( $this->getCurrentPlayerId(), "done" );
    }

    public function playerMakeBid($bid_location){
        self::checkAction( "selectBid" );
        $active_player = $this->getActivePlayerId();
        $valid_bids = self::getValidBids($active_player);
        if (in_array($bid_location, $valid_bids)){// valid bid
            $active_player = $this->getActivePlayerId();
            self::makeBid($bid_location, $active_player);
            self::setGameStateValue('last_bid', $bid_location);
            $this->gamestate->nextState( "nextBid" );
        } else if ($bid_location == BID_PASS){ //follow pass bid procedue
            $players_passed = self::getGameStateValue('players_passed');
            self::setGameStateValue('players_passed', ++$players_passed);
            $this->gamestate->nextState( "pass" );
        } 
    }

    public function playerSelectBuilding(){
        self::checkAction( "build" );
        self::setGameStateValue( $selected_building );
    }

    public function playerBuildSelected(){
        $selected_building = self::getGameStateValue( 'selected_building');
        $active_player = $this->getActivePlayerId();
        if ($selected_building == 0){
            throw new BgaUserException( self::_("You Must select building(s) to build") );
        }
        $success = $this->buyBuilding($active_player, $selected_building);
        if ($success) {
            $this->gamestate->nextState( 'build' );
        }
    }

    public function playerSelectWorker($worker_key) {
        $sql = "SELECT `selected` FROM `workers` WHERE `worker_key`='".$worker_key."'";
        $selected = self::getUniqueValueFromDB( $sql );
        $selected = (!$selected &1); 
        $sql = "UPDATE `workers` SET `selected`='".$selected."' WHERE `worker_key`='".$worker_key."'";
        self::DBQuery( $sql);
    }

    public function playerDoNotBuild () {
        self::checkAction( "doNotBuild" );

        //goto next state;
        $auction_no = self::getGameStateValue( 'current_auction' );
        $round_number = self::getGameStateValue( 'round_number' );
        $bonus = self::getUniqueValueFromDB( "SELECT `bonus` FROM `auctions` WHERE `location` = ".$auction_no." AND `position` = ".$round_number );
        if ( $bonus ==  1){
            $this->gamestate->nextState( "bonus" ); 
        } else { 
            $this->gamestate->nextState( "endBuild" ); 
        }
    }

    public function playerPayAuction() {
        self::checkAction( "payAuction" );
        $active_player = $this->getActivePlayerId();
        $sql = "SELECT `player_id`, `silver`, `gold`, `bid_loc` FROM `resources` WHERE `player_id`='".$active_player."'";
        $player_resources = self::getObectFromDB( $sql );
    }

    public function playerSelectBonusOption($selected_bonus) {
        $active_player = $this->getActivePlayerId();
        //        $bonus = self::getRailAdvBonusOptions($active_player);
        switch ($selected_bonus){
            case 'worker':
                self::addWorker($active_player);
            break;
            case TRADE:
                self::updateResource($active_player,'cow', 1);
            break;
            case RAIL_LINE:
                self::updateResource($active_player,'rail_tiles', 1);
            break;
            case WOOD:
                self::updateResource($active_player,'wood', 1);
            break;
            case FOOD:
                self::updateResource($active_player,'food', 1);
            break;
            case STEEL:
                self::updateResource($active_player,'steel', 1);
            break;
            case GOLD:
                self::updateResource($active_player,'gold', 1);
            break;
            case COPPER:
                self::updateResource($active_player,'copper', 1);
            break;
            case COW:
                self::updateResource($active_player,'cow', 1);
            break;
            case VP:
                self::updateResource($active_player,'vp', 3);
            break;
        }
        $phase = self::getGlobalStateValue( 'phase' );
        $next_state = "";
        switch($phase){
            case PHASE_BID_PASS:
                $next_state = "nextBid";
            break;
            case PHASE_BUILD_BONUS:
                $next_state = "endAuction";
            break;
            case PHASE_AUCTION_BONUS:
                $next_state = "auctionBonus";
            break;
        }
        
        $this->gamestate->nextState( $next_state );
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

    function argPlaceWorkers() 
    {
        $current_player_id = $this->getCurrentPlayerId();
        $sql = "SELECT `trade` FROM `resources` WHERE `player_id` = '".$current_player_id."'";
        $trade = self::getUniqueValueFromDB( $sql);
        return array('trade'=>$trade);
    }

    function argValidBids() {
        $current_player_id = $this->getCurrentPlayerId();
        $valid_bids = self::getValidBids($current_player_id);
        return ($valid_bids);
    }

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
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_OFFER."' WHERE `stage` in ('".STAGE_SETTLEMENT."','".STAGE_SETTLEMENT_TOWN."');";
            self::DbQuery( $sql );
        }
        //rd 5 setup buildings
        if($round_number == 5){
            // add town buildings
            $sql = "UPDATE `buildings` SET `location` = '".BUILDING_LOC_OFFER."' WHERE `stage` = '".STAGE_TOWN."'";
            self::DbQuery( $sql );
            // remove settlement buildings (not owned)
            $sql = "UPDATE `buildings` SET `location` = '".BUILDING_LOC_DISCARD."' WHERE `stage` = '".STAGE_SETTLEMENT."' AND `location` = '".BUILDING_LOC_OFFER."'";
            self::DbQuery( $sql );
        }
        //rd 9 setup buildings
        if($round_number == 9){
            // clear all buildings
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_DISCARD."' WHERE `location` = '".BUILDING_LOC_OFFER."';";
            self::DbQuery( $sql );
            // add city buildings
            $sql = "UPDATE buildings SET location = '".BUILDING_LOC_OFFER."' WHERE `stage` = '".STAGE_CITY."';";
            self::DbQuery( $sql );
        }

        // update Auctions.
        if ($round_number>1){
            $last_round = $round_number -1;
            $sql = "UPDATE auctions SET location = '".AUCTION_LOC_DISCARD."' WHERE position = '".$last_round."';";
            self::DbQuery( $sql );
        }
        $this->gamestate->nextState( );
    }

    function stPlaceWorkers()
    {
        $this->gamestate->setAllPlayersMultiactive( );
        // for each player have them place workers (then press done)
        // TODO: figure out this multi-active thing.
        //$sql = "SELECT `worker_key`, `player_id`, `building_key`, `building_slot` `selected` FROM `workers` ";
        //$workers = self::getCollectionFromDB( $sql );
        // for testing purposes just assign the worker to homestead slot 1.
        /*foreach($workers as $worker_key => $worker){
            $player_id = $worker['player_id'];
            $sql = "SELECT `building_key`, `building_id`, `worker_slot`, `player_id` FROM `buildings` WHERE `player_id` = '".$player_id."'";
            $player_buildings = self::getCollectionFromDB( $sql );
            foreach ($player_buildings as $building_key => $building){
                if ($building['building_id'] <5){
                    $sql = "UPDATE `workers` SET `building_key` = ".$building_key.", `building_slot` = 1";
                    self::DBQuery( $sql );
                break;
                }
            }
        }*/
    }

    function stCollectIncome()
    {
        self::collectIncome();
        $this->gamestate->nextState( );
    }

    function stPayWorkers()
    {
        $sql = "SELECT `player_id`, `workers`, `gold`, `silver`, `trade`, `loan` FROM `resources` ";
        $resources = self::getCollectionFromDB( $sql );
        $players = array();
        foreach($resources as $player_id => $player){
            if ($player['gold'] == 0 && $player['trade'] == 0){
                //no decisions just pay.
                $silver = $player['silver'];
                $loan = $player['loan'];
                if ($player['silver'] >= $player['workers']){
                    $silver = $player['silver'] - $player['workers'];
                } else {
                    while ($silver < $player['workers']){
                        $silver +=2;
                        $loan ++;
                    } 
                }
                $sql = "UPDATE `resources` SET `silver`='".$silver."', `loan`='".$loan."' WHERE `player_id`='".$player_id."'";
                self::DBQuery( $sql );
            } else {
                $players[] = $player_id;
            }
        }
        $this->gamestate->setPlayersMultiactive($players, 'loopback');
    }
    
    function stBeginAuction(){
        self::clearBids();
        
        $first_player = self::getGameStateValue('first_player');
        $this->gamestate->changeActivePlayer( $first_player );
        $this->gamestate->nextState( );
    }

    function stMakeBidOrPass() {
        // don't think I need to do anything here        
    }
    
    function stRailBonus() {
        $active_player = self::getActivePlayerId();
        $sql = "SELECT `rail_adv` FROM `resources` WHERE `player_id`='".$active_player."'";
        $rail_adv = self::getUniqueValueFromDB( $sql );
        if ($rail_adv < 5){
            $sql = "UPDATE `resources` SET `rail_adv`= '".(++$rail_adv)."' WHERE `player_id`='".$active_player."'";
            self::DBQuery( $sql );
        }
        // wait for player action (select bonus)
    }

    function stNextBid()
    { 
        self::activeNextPlayer();
        // figure out if bid round is complete, 
        $active_player = self::getActivePlayerId();
        $last_bid = self::getGameStateValue( 'last_bid' );
        $sql = "SELECT `bid_loc` FROM `resources` WHERE `player_id`='".$active_player."'";
        $player_bid = self::getUniqueValueFromDB( $sql );
        // if bidding is complete
        $players_passed = self::getGameStateValue('players_passed');
        $player_count = self::getUniqueValueFromDB('SELECT COUNT(*) FROM `player`');
        if ($player_bid == $last_bid || $players_passed >= $player_count) {
            $next_state = "endAuction";
        } else if (self::canPlayerBid($active_player)) {// if this player can bid.
            $next_state = "bid";
        } else { // if not, let next player bid
            $next_state = "skip";
        }
        $this->gamestate->nextState( $next_state );
    }

    function stBuildingPhase()
    {
        $current_auction = self::getGameStateValue( 'current_auction' );
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $bids = self::getCollectionFromDB( $sql );
        $auction_winner_id = 0;
        $next_state = "";
        // determine winner of this auction
        foreach($bids as $player_id => $bid){ 
            if ($current_auction == 1 && $bid['bid_loc'] >= BID_A1_B3 && $bid['bid_loc'] <= BID_A1_B21 ){
                $auction_winner_id=$player_id;
                break;
            }
            if ($current_auction == 2 && $bid['bid_loc'] >= BID_A2_B3 && $bid['bid_loc'] <= BID_A2_B21 ){
                $auction_winner_id=$player_id;
                break;
            }
            if ($current_auction == 3  && $bid['bid_loc'] >= BID_A3_B3 && $bid['bid_loc'] <= BID_A3_B21 ){
                $next_pauction_winner_idlayer_id=$player_id;
                break;
            }
        }
        if ($auction_winner_id == 0) {
            $next_state = "auctionPassed";
        } else {
            if ($current_auction == 1){
                self::setGameStateValue('first_player', $auction_winner_id);
            }
            $this->gamestate->changeActivePlayer( $auction_winner_id );
            $next_state = "auctionWon";
        }    
        $this->gamestate->nextState( $next_state );
    }

    function stBuild()
    {
        $auction_no = self::getGameStateValue( 'current_auction' );
        $round_number = self::getGameStateValue( 'round_number' );
        $sql = "SELECT `build_type` FROM `auctions` WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'";
        $build_type = self::getUniqueValueFromDB( $sql );
        if ( $build_type== 0 ){
            $this->gamestate->nextState( "bonus" ); 
        } 
    }

    function stResolveBuilding()
    {
        $next_state = "auctionBonus";
        $round_number = self::getGameStateValue( 'round_number' );
        $auction_no = self::getGameStateValue( 'current_auction' );
        $bonus = self::getUniqueValueFromDB("SELECT `bonus` FROM `auctions`  WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'");
        if ($bonus == 0){
            $next_state = "endBuild";
        }
        $this->gamestate->nextState( $next_state );
    }

    function stGetAuctionBonus()
    {
        $next_state = "bonusChoice";
        $active_player = $this->getActivePlayerId();
        $auction_no = self::getGameStateValue( 'current_auction' );
        $round_number = self::getGameStateValue( 'round_number' );
        $auction_id = self::getUniqueValueFromDB("SELECT `auction_id` FROM `auctions`  WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'");
        switch($auction_id){
            case AUCTION1_5:
            case AUCTION1_6:
            case AUCTION1_7: 
                // worker
                self::addWorker($active_player);
                $next_state = "endBuild";
                self::setGameStateValue( 'bonus_option', NONE );
            break;
            case AUCTION2_4:
            case AUCTION3_4:
                self::addWorker($active_player);
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
                $oldVp = self::getUniqueValueFromDB( $sql );
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
        $this->gamestate->nextState( $next_state );
    }

    function stChooseBonus()
    {
        $bonus = self::getGameStateValue( 'bonus_option' );
        $next_state = "done";
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
                self::setGameStateValue('phase', 3);
                $next_state = "railBonus";
            break;
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndBuildRound() {
        $auction_no = self::getGameStateValue( 'current_auction' );
        self::discardAuctionTile($auction_no);
        $next_state = "nextBuilding";
        if ($auction_no = self::getGameStateValue( 'number_auctions' )){
            $next_state = "endRound";
        } else {
            self::setGameStateValue( 'current_auction', ++$auction_no);
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndRound()
    {
        $round_number = self::getGameStateValue( 'round_number' );
        $next_state = "endGame";
        if ($round_number < 10) {
            self::setGameStateValue( 'current_auction',   1);
            self::setGameStateValue( 'players_passed',    0);
            self::setGameStateValue( 'last_bid' ,         0);
            self::setGameStateValue( 'selected_worker',   0);
            self::setGameStateValue( 'selected_building', 0);
            self::setGameStateValue( 'bid_selected',      0);
            $next_state = "nextAuction";
        }
        $this->gamestate->nextState( $next_state );
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
