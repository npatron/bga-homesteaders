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
require_once('modules/HSDLog.class.php');
require_once('modules/HSDBid.class.php');

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
            "phase"             => 12,
            "number_auctions"   => 13,
            "current_auction"   => 14,
            "last_bidder"       => 15,
            "players_passed"    => 16,
            "bonus_option"      => 17,
        ) );
        
        $this->Log   = new HSDLog($this);
        $this->Bid  = new HSDBid($this);

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
        $sql = "DELETE FROM player WHERE 1 ";
        self::DbQuery( $sql );

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

        $this->Log->initStats($players);

        $number_auctions = 2;
        if (count($players) == 4){ 
            $number_auctions = 3;
        }
        // Init global values with their initial values
        $this->setGameStateInitialValue( 'round_number', 0 );
        $this->setGameStateInitialValue( 'first_player', 0 );
        $this->setGameStateInitialValue( 'phase',        0 );
        $this->setGameStateInitialValue( 'number_auctions', $number_auctions );
        $this->setGameStateInitialValue( 'current_auction', 1 );
        $this->setGameStateInitialValue( 'last_bidder', 0 );
        $this->setGameStateInitialValue( 'players_passed', 0 );
        $this->setGameStateInitialValue( 'bonus_option', 0 );
        
        // create building Tiles (in sql)
        $this->createBuildings($gamePlayers);
        $this->createAuctionTiles(count($players));

        $values = array();
        foreach( $players as $player_id => $player ){
            $values[] = "(".$player_id.")";
        }

        // setup resources table
        $sql = "INSERT INTO `resources` (player_id) VALUES ";
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        // create 1 worker for each player.
        $sql = "INSERT INTO `workers` (player_id) VALUES ";
        $sql .= implode( ',', $values );        
        self::DbQuery( $sql );

        // set colors
        foreach ($gamePlayers as $player_id => $p) {
            $color = $p['player_color'];
            $sql = "UPDATE `player` SET `color_name`='".self::$playerColorNames[$color]."' WHERE `player_id`='".$player_id."'";
            self::DbQuery( $sql );
        }
        
        $this->activeNextPlayer();
        $active_player = self::getActivePlayerId();
        $this->setGameStateValue('first_player', $active_player);
        
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
        $sql = "SELECT `player_id`, `player_score`, `color_name`, `player_name` FROM `player` ";
        $result['players'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `building_key`, `building_id`, `location`, `player_id`, `worker_slot` FROM `buildings` ";
        $result['buildings'] = self::getCollectionFromDb( $sql );
  
        $sql = "SELECT `worker_key`, `player_id`, `building_key`, `building_slot`, `selected` FROM `workers`";
        $result['workers'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `player_id`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '".$current_player_id."'";
        $result['player_resources'] = self::getObjectFromDb( $sql );

        $sql = "SELECT `player_id`, `workers`, `rail_tiles`, `bid_loc`, `rail_adv` FROM `resources` ";
        $result['resources'] = self::getCollectionFromDb( $sql );

        $sql = "SELECT `auction_id`, `position`, `location`,  `build_type`, `bonus` FROM `auctions` WHERE `location` IN (1,2,3) "; //`state`
        $result['auctions'] = self::getCollectionFromDb( $sql );
        
        $result['first_player'] = self::getGameStateValue( 'first_player');
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
        $gameprogress = (self::getGameStateValue('round_number')-1) * 10;
        $gameprogress += self::getGameStateValue('current_auction');
        return $gameprogress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    
    function createBuildings($gamePlayers){
        self::DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (`building_id`, `building_type`, `stage`, `location`, `player_id`, `worker_slot`) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $gamePlayers as $player_id => $player ) {
            $player_color = self::$playerColorNames[$player['player_color']];
            if ($player_color === 'yellow'){
                $values[] = "('".BUILDING_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'red'){
                $values[] = "('".BUILDING_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'green'){
                $values[] = "('".BUILDING_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BUILDING_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            }
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        $sql = "INSERT INTO buildings (building_id, building_type, stage, cost, worker_slot) VALUES ";
        $values=array();
        // some building have 2 copies in 2 player, and 3 copies in 3-4 player
        $count_3x = 3;
        // some buildings have 2 copies in 3-4 player
        $count_2x = 2; 
        if (count($gamePlayers) == 2){
            $count_3x = 2;
            $count_2x = 1; 
        }
        for($i = 0; $i < $count_3x; $i++) 
        {
            $values[] = "('".BUILDING_FARM   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT."','".WOOD."', '2')";
            $values[] = "('".BUILDING_MARKET ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT."','".WOOD."', '1')";
            $values[] = "('".BUILDING_FOUNDRY."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT."','".NONE."', '1')";
        }
        
        for($i = 0; $i < $count_2x ; $i++) 
        {
            $values[] = "('".BUILDING_RANCH        ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL.FOOD."', '1')";
            $values[] = "('".BUILDING_GENERAL_STORE."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".STEEL          ."', '0')";
            $values[] = "('".BUILDING_GOLD_MINE    ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL     ."', '1')";
            $values[] = "('".BUILDING_COPPER_MINE  ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD.STEEL."', '1')";
            $values[] = "('".BUILDING_RIVER_PORT   ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD           ."', '3')";
            $values[] = "('".BUILDING_WORKSHOP     ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".STEEL          ."', '0')";
            $values[] = "('".BUILDING_DEPOT        ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".WOOD.STEEL     ."', '0')";
            $values[] = "('".BUILDING_FORGE        ."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".STEEL.STEEL    ."', '1')";
            $values[] = "('".BUILDING_DUDE_RANCH   ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.FOOD      ."', '0')";
            $values[] = "('".BUILDING_RESTARAUNT   ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0')";
            $values[] = "('".BUILDING_TERMINAL     ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".STEEL.STEEL    ."', '0')";
            $values[] = "('".BUILDING_TRAIN_STATION."','".TYPE_INDUSTRIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0')";
        }
        //all other buildings
        $values[] = "('".BUILDING_GRAIN_MILL       ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.STEEL             ."', '0')";
        $values[] = "('".BUILDING_STEEL_MILL       ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.WOOD.GOLD         ."', '0')";
        $values[] = "('".BUILDING_BOARDING_HOUSE   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD              ."', '0')";
        $values[] = "('".BUILDING_RAILWORKERS_HOUSE."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".STEEL.STEEL            ."', '0')";
        $values[] = "('".BUILDING_TRADING_POST     ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".GOLD                   ."', '0')";
        $values[] = "('".BUILDING_CHURCH           ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".WOOD.STEEL.GOLD.COPPER ."', '0')";
        $values[] = "('".BUILDING_BANK             ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".STEEL.COPPER           ."', '0')";
        $values[] = "('".BUILDING_STABLES          ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".COW                    ."', '2')";
        $values[] = "('".BUILDING_MEATPACKING_PLANT."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".WOOD.COW               ."', '0')";
        $values[] = "('".BUILDING_FACTORY          ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".STEEL.STEEL.COPPER     ."', '0')";
        $values[] = "('".BUILDING_RODEO            ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".FOOD.COW               ."', '0')";
        $values[] = "('".BUILDING_LAWYER           ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.GOLD.COW          ."', '0')";
        $values[] = "('".BUILDING_FAIRGROUNDS      ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.WOOD.COPPER.COW   ."', '0')";
        $values[] = "('".BUILDING_TOWN_HALL        ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.WOOD.COPPER       ."', '0')";
        $values[] = "('".BUILDING_CIRCUS           ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".FOOD.FOOD.COW          ."', '0')";
        $values[] = "('".BUILDING_RAIL_YARD        ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".STEEL.STEEL.GOLD.COPPER."', '0')";
        sort($values);// this groups them by id's before creating them.
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    function createAuctionTiles($playerCount){

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

        if ($playerCount>3){
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

    
    function updateResource($player_id, $resource_key, $amount){
        $sql = "SELECT `".$resource_key."` FROM `resources` WHERE `player_id`= '".$player_id."'";
        $resource_count = self::getUniqueValueFromDB( $sql );
        $resource_count += $amount;
        $sql = "UPDATE `resources` SET `".$resource_key."`='".$resource_count."' WHERE `player_id`= '".$player_id."'";
        self::DbQuery( $sql );
    }

    function addWorker($player_id){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$player_id.");";
        self::DbQuery( $sql );
        $this->updateResource($player_id, 'workers', 1);
    }

    function getBuildingFromKey($building_key){
        $sql = "SELECT * from `buildings` where `building_key`='$building_key'";
        $building = self::getObjectFromDB($sql);
        return ($building);
    }

    function getBuildingNameFromKey($building_key){
        $building = $this->getBuildingFromKey($building_key);
        $buildingName = $this->getBuildingNameFromId($building['building_id']);
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

    function getColorNames(){
        $sql = "SELECT `player_id`, `color_name` FROM `player`";
        return self::getCollectionFromDb( $sql );
    }

    function getBuildingCostFromKey($building_key){
        $building = $this->getBuildingFromKey($building_key);
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
        $building_cost = $this->getBuildingCostFromKey ($building_key);
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

    function canPlayerAfford($player_id, $resource_arr){
        $sql = "SELECT * `resources` WHERE `player_id` =".$player_id;
        $player_resources = self::getObjectFromDB($sql);
        $enough = true;
        foreach( $resource_arr as $key => $resource){
            $enough = $enough && ($player_resources[$key] >= $resource);  
        }
        return $enough;
    }
    
    function collectIncome() 
    {
        self::notifyAllPlayers( "beginIncome", clienttranslate( 'Income Phase' ), array() );
        $sql = "SELECT * FROM `resources` ";
        $resources = self::getCollectionFromDB( $sql );
        foreach ( $resources as $player_id => $player_resource ){
            $sql = "SELECT * FROM `buildings` WHERE `player_id` = '".$player_id."'";
            $player_buildings = self::getCollectionFromDB( $sql );
            $sql = "SELECT * FROM `workers` WHERE `player_id` = '".$player_id."'";
            $player_workers = self::getCollectionFromDB( $sql );

            if ($player_resource['rail_tiles'] > 0){
                $player_resource['silver'] += $player_resource['rail_tiles'];
                $this->notifyIncome($player_id, 'rail tiles', $player_resource['rail_tiles'], 'silver');
            }
            foreach( $player_buildings as $building_key => $building ) {
                switch($building['building_id']) {
                    case BUILDING_HOMESTEAD_YELLOW:
                    case BUILDING_HOMESTEAD_RED:
                    case BUILDING_HOMESTEAD_GREEN:
                    case BUILDING_HOMESTEAD_BLUE:
                    case BUILDING_BOARDING_HOUSE:
                    case BUILDING_DEPOT:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 2, 'silver');
                        $player_resource['silver'] += 2;
                        break;
                    case BUILDING_GRAIN_MILL:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'food');
                        $player_resource['food'] += 1;
                        break;
                    case BUILDING_MARKET:
                    case BUILDING_GENERAL_STORE:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'trade');
                        $player_resource['trade'] += 1;
                        break;
                    case BUILDING_STEEL_MILL:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'steel');
                        $player_resource['steel'] += 1;
                        break;
                    case BUILDING_RAILWORKERS_HOUSE:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'silver');
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'trade');
                        $player_resource['silver'] += 1;
                        $player_resource['trade']  += 1;
                        break;
                    case BUILDING_TRADING_POST:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 2, 'trade');
                        $player_resource['trade'] += 2;
                        break;
                    case BUILDING_CHURCH:
                    case BUILDING_FACTORY:
                    case BUILDING_LAWYER:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 2, 'vp');
                        $player_resource['vp'] += 2;
                        break;
                    case BUILDING_WORKSHOP:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'vp');
                        $player_resource['vp'] += 1;
                        break;
                    case BUILDING_STABLES:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'trade');
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'vp');
                        $player_resource['trade'] += 1;
                        $player_resource['vp'] += 1;
                        break;
                    case BUILDING_BANK:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'loan');
                        $player_resource['loan'] -= 1;
                        break;
                    case BUILDING_RODEO:
                        $workers_or_5 = min($player_resource['workers'], 5);
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), $workers_or_5, 'silver');
                        $player_resource['silver'] += $workers_or_5;
                        break;
                    case BUILDING_FAIRGROUNDS:
                        $this->notifyIncome ($player_id, $this->getBuildingNameFromKey($building_key), 1, 'gold');
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
                            $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'wood');
                            $player_resource['wood'] += 1;
                        } else {
                            $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'vp');
                            $player_resource['vp'] += 1;
                        }
                        break;
                    case BUILDING_FARM:
                        if ($worker['building_slot'] == 1){
                            $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'trade');
                            $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 2, 'silver');
                            $player_resource['trade'] += 1;
                            $player_resource['silver'] += 2;
                        } else {
                            $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'food');
                            $player_resource['food'] += 1;
                        }
                        break;
                    case BUILDING_MARKET:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 2, 'silver');
                        $player_resource['silver'] += 2;
                        break;
                    case BUILDING_FOUNDRY:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'steel');
                        $player_resource['steel'] += 1;
                        break;
                    case BUILDING_RANCH:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'cow');
                        $player_resource['cow'] += 1;
                        break;
                    case BUILDING_GOLD_MINE:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'gold');
                        $player_resource['gold'] += 1;
                        break;
                    case BUILDING_COPPER_MINE:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 1, 'copper');
                        $player_resource['copper'] += 1;
                        break;
                    case BUILDING_RIVER_PORT:
                        if ($worker['building_slot'] == 2){
                            $this->notifyIncome ($player_id, '2 workers at '.$this->getBuildingNameFromKey($building_key), 1, 'gold');
                            $player_resource['gold'] += 1;
                        } 
                        break;
                    case BUILDING_MEATPACKING_PLANT:
                    case BUILDING_FORGE:
                        $this->notifyIncome ($player_id, 'worker at '.$this->getBuildingNameFromKey($building_key), 2, 'vp');
                        $player_resource['vp'] += 2;
                        break;
                }
            }
            if ($player_resource['loan']==-1){
                $this->notifyIncome ($player_id, 'auto-loan(due to bank)', 2, 'silver');
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

    function notifyIncome($player_id, $reason_string, $amount, $type){
        self::notifyAllPlayers( "playerIncome",
            clienttranslate( '${player_name} recieved '.$amount.' '.$type.' from '.$reason_string ), 
            //clienttranslate( '${player_name} recieved '.$amount.' ${token_name} '.$reason_string ), 
            array('player_id' => $player_id,
            'token_name' => $type,
            'player_name' => self::loadPlayersBasicInfos()[$player_id]['player_name'],
        ) );
    }

    function payForBuilding($player_id, $building_key){
        $building_cost = $this->getBuildingCostFromKey ($building_key);
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

    function getRailAdv() {
        $sql = "SELECT `rail_adv` FROM `resources` WHERE `player_id`='$active_player'";
        $rail_adv = self::getUniqueValueFromDB( $sql );
        if ($rail_adv < 5){
            $rail_adv++;
            $sql = "UPDATE `resources` SET `rail_adv`= '".$rail_adv."' WHERE `player_id`='$active_player'";
            self::DbQuery( $sql );
            self::notifyAllPlayers( "railAdv", 
                        clienttranslate( '${player_name} gains rail advancement ' ),            
                        array('player_id' => $this->getActivePlayerId(),
                              'player_name' => $this->getActivePlayerName(),
                              'rail_destination' => $rail_adv,));
        }
    }
    
    function getRailAdvBonusOptions($player_id){
        $sql = "SELECT `rail_adv` FROM `resources` WHERE `player_id`='".$player_id."'";
        $rail_adv = self::getUniqueValueFromDB( $sql );
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
        self::DbQuery( $sql);
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
            $this->payForBuilding($player_id, $building_key);
            self::notifyAllPlayers( "buyBuilding", 
                        clienttranslate( '${player_name} buys a building ${building_name} ' ),            
                        array('player_id' => $player_id,
                              'player_name' => $this->loadPlayersBasicInfos()[$player_id]['player_name'],
                              'building_key' => $this->$building_key,
                              'building_name' => $this->getBuildingNameFromKey($building_key),) );
            $sql = "UPDATE `buildings` Set `location`= ".BUILDING_LOC_PLAYER.", `player_id`=".$player_id." WHERE building_key =".$building_key;    
            self::DbQuery( $sql );
            return true;
        } else {
            throw new BgaUserException( self::_("You cannot afford to Buy "+$this->getBuildingNameFromKey($building_key)));
            return false;
        } 
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
        self::checkAction( "takeLoan" );
        $current_player_id = self::getCurrentPlayerId();
        $this->updateResource($current_player_id,'silver', 2);
        $this->updateResource($current_player_id,'loan', 1);
        $this->Log->takeLoan($current_player_id);
        $this->notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a loan' ), array(
            'player_id' => $this->getActivePlayerId(),
            'player_name' => $this->getActivePlayerName(),
        ) );
    }

    public function playerTrade( $trade )
    {
        self::checkAction( 'trade' );
        
        $player_id = $this->getCurrentPlayerId();
        $player_name = $this->getCurrentPlayerName();
        $sell = startsWith($trade, 'sell');
        switch($trade){
            //set 
            default:
                $trade_away_amt = -1;
                $trade_away_type = "wood";
                $trade_for_amt = 1;
                $trade_for_type = "silver";
        }
        
        $this->notifyAllPlayers( "trade", clienttranslate( '${player_name} trades ${trade1} for ${trade2}' ), array(
            'player_id' => $player_id,
            'player_name' => $player_name,
            'sell' => $sell,
            'trade1' => $trade_away_type,
            'trade2' => $trade_for_type,
        ) );
        $this->updateResource($player_id, 'trade', -1);
        $this->updateResource($player_id, $trade_away_type, $trade_away_amt);
        $this->updateResource($player_id, $trade_for_type, $trade_for_amt);
        if ($sell){
            $this->updateResource($player_id, 'vp', 1);
        }
    }

    public function playerHireWorker($free = false){
        self::checkAction( 'hireWorker' );
        $player_id = self::getCurrentPlayerId();
        if (!$free){
            $worker_cost = array('trade'=>1,'food'=>1);
            if (!$this->canPlayerAfford($player_id, $worker_cost))
                throw new BgaUserException( self::_("You cannot afford to hire a worker"));
            $this->updateResource($player_id, 'trade', -1);
            $this->updateResource($player_id, 'food', -1);
        }
        $this->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a new ${token}' ), array(
            'player_id' => $player_id,
            'worker_key' => $worker_key,
            'token' => 'worker',
            'player_name' => $this->getCurrentPlayerName(),));
        $this->addWorker($player_id);
    }

    public function playerSelectWorkerDestination($worker_key, $building_key, $building_slot) 
    {
        self::checkAction( "placeWorker" );
        $player_id = self::getCurrentPlayerId();
        $this->notifyAllPlayers( "workerMoved", clienttranslate( '${player_name} moves a ${token} to ${building_name}' ), array(
            'player_id' => $player_id,
            'worker_key' => $worker_key,
            'building_key' => $building_key,
            'building_name' => $this->getBuildingNameFromKey($building_key),
            'building_slot' => $building_slot, 
            'token' => 'worker',
            'player_name' => $this->getcurrentPlayerName(),
        ) );
        $sql = "UPDATE `workers` SET `building_key`= '".$building_key."', `building_slot`='".$building_slot."' WHERE `worker_key`='".$worker_key."'";
        self::DbQuery( $sql );
    }

    public function playerDonePlacingWorkers ()
    {
        $this->notifyAllPlayers( "playerPass", clienttranslate( '${player_name} is done assigning workers' ), array(
            'player_id' => $this->getCurrentPlayerId(),
            'player_name' => $this->getCurrentPlayerName(),
        ) );
        $this->gamestate->setPlayerNonMultiactive( self::getCurrentPlayerId(), "done" );
    }

    public function playerConfirmBid($bid_location){
        self::checkAction( "confirmBid" );
        $this->Bid->confirmBid($bid_location);
    }

    public function playerPassBid(){
        self::checkAction( "pass" );
        $this->Log->passBid($this->getActivePlayerId());
        $this->Bid->passBid();
        $this->gamestate->nextState( "rail" );
    }

    // pretty sure I don't want to track selected Building in sql, probably want to remove this.
    public function playerSelectBuilding(){
        self::checkAction( "build" );
        self::setGameStateValue( $selected_building );
    }

    // pretty sure I don't want to track selected Building in sql, probably want take it as input instead.
    public function playerBuildSelected(){
        $selected_building = $this->getGameStateValue( 'selected_building');
        $active_player = $this->getActivePlayerId();
        if ($selected_building == 0){
            throw new BgaUserException( _("You Must select a building to build") );
        }
        $success = $this->buyBuilding($active_player, $selected_building);
        if ($success) {
            $this->gamestate->nextState( 'build' );
        } else {
            throw new BgaUserException( _("Not enough resources to build that building") );
        }
    }

    public function playerDoNotBuild () {
        self::checkAction( "doNotBuild" );

        //goto next state;
        $auction_no = $this->getGameStateValue( 'current_auction' );
        $round_number = $this->getGameStateValue( 'round_number' );
        $bonus = self::getUniqueValueFromDB( "SELECT `bonus` FROM `auctions` WHERE `location` = ".$auction_no." AND `position` = ".$round_number );
        if ( $bonus ==  1){
            $this->gamestate->nextState( "bonus" ); 
        } else { 
            $this->gamestate->nextState( "endBuild" ); 
        }
    }

    public function playerPayAuction($gold) {
        self::checkAction( "payAuction" );
        $active_player = $this->getActivePlayerId();
        $sql = "SELECT `player_id`, `silver`, `gold`, `bid_loc` FROM `resources` WHERE `player_id`='".$active_player."'";
        $player_resources = self::getObectFromDB( $sql );
        $bid_cost = $this->Bid->getBidCost($player_resources['bid_loc']);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        if ($player_resources['gold'] >= $gold && $player_resources['silver'] >= $bid_cost){
            throw new BgaUserException( _("Not enough resources to pay for auction (take loan)") );
        }
        $player_resources['gold'] -= $gold;
        $player_resources['silver'] -= $bid_cost;
        $this->updateResource($this->getActivePlayerId(), 'silver', -$bid_cost);
        $this->updateResource($this->getActivePlayerId(), 'gold', -$gold);
    }

    public function playerSelectBonusOption($selected_bonus) {
        $active_player = $this->getActivePlayerId();
        //        $bonus = self::getRailAdvBonusOptions($active_player);
        switch ($selected_bonus){
            case 'worker':
                $this->addWorker($active_player);
            break;
            case TRADE:
                $this->updateResource($active_player,'cow', 1);
            break;
            case RAIL_LINE:
                $this->updateResource($active_player,'rail_tiles', 1);
            break;
            case WOOD:
                $this->updateResource($active_player,'wood', 1);
            break;
            case FOOD:
                $this->updateResource($active_player,'food', 1);
            break;
            case STEEL:
                $this->updateResource($active_player,'steel', 1);
            break;
            case GOLD:
                $this->updateResource($active_player,'gold', 1);
            break;
            case COPPER:
                $this->updateResource($active_player,'copper', 1);
            break;
            case COW:
                $this->updateResource($active_player,'cow', 1);
            break;
            case VP:
                $this->updateResource($active_player,'vp', 3);
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
        $res = array ();
        $players = $this->loadPlayersBasicInfos();
        foreach ( $players as $player_id => $player_info ) {
            $sql = "SELECT `trade` FROM `resources` WHERE `player_id`='$player_id'";
            $trade = self::getUniqueValueFromDB($sql); 
            $res [$player_id] = array("trade"=>$trade);
        }
        return $res;
    }

    function argValidBids() {
        $active_player_id = self::getActivePlayerId();
        $valid_bids = $this->Bid->getValidBids($active_player_id);
        return array('valid_bids'=>$valid_bids );
    }

    function argRailBonus() {
        $active_player_id = self::getActivePlayerId();

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
            $sql = "UPDATE auctions SET location = '".AUCTION_LOC_DISCARD."' WHERE position = '$last_round';";
            self::DbQuery( $sql );
        }
        $this->gamestate->nextState( );
    }

    function stPlaceWorkers()
    {
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stCollectIncome()
    {
        $this->collectIncome();
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
                self::DbQuery( $sql );
            } else {
                $players[] = $player_id;
            }
        }
        if( count($players)== 0 ){
            $this->gamesstate->nextstate( 'done' );
        }
        $this->gamestate->setPlayersMultiactive($players, 'done');
    }
    
    function stBeginAuction(){
        $this->Bid->clearBids();
        
        $first_player = self::getGameStateValue('first_player');
        $this->gamestate->changeActivePlayer( $first_player );
        $this->gamestate->nextState( );
    }
    
    function stRailBonus() {
        $active_player = $this->getActivePlayerId();
        // wait for player action (select bonus)
    }

    function stNextBid()
    { 
        $this->activeNextPlayer();
        // figure out if bid round is complete, 
        $active_player = $this->getActivePlayerId();
        $last_bidder = $this->getGameStateValue( 'last_bidder' );
        // if bidding is complete
        $players_passed = $this->getGameStateValue('players_passed');
        if ($active_player == $last_bidder || $players_passed >= $this->getPlayersNumber()) {
            $next_state = "endAuction";
        } else if ($this->Bid->canPlayerBid($active_player)) {// if this player can bid.
            $next_state = "playerBid";
        } else { // if not, let next player bid
            $next_state = "skipPlayer";
        }
        $this->gamestate->nextState( $next_state );
    }

    function stBuildingPhase()
    {
        $next_state = "";
        $auction_winner_id = $this->Bid->getWinnerOfAuction();
        // determine winner of this auction
        $current_auction = $this->getGameStateValue( 'current_auction' );
        
        if ($auction_winner_id == 0) {
            $next_state = "auctionPassed";
        } else {
            if ($current_auction == 1){
                $this->setGameStateValue('first_player', $auction_winner_id);
            }
            $this->gamestate->changeActivePlayer( $auction_winner_id );
            $next_state = "auctionWon";
        }    
        $this->gamestate->nextState( $next_state );
    }

    function stBuild()
    {
        $auction_no = $this->getGameStateValue( 'current_auction' );
        $round_number = $this->getGameStateValue( 'round_number' );
        $sql = "SELECT `build_type` FROM `auctions` WHERE `location` = '$auction_no AND `position` = '$round_number'";
        $build_type = self::getUniqueValueFromDB( $sql );
        if ( $build_type== 0 ){
            $this->gamestate->nextState( "bonus" ); 
        } 
    }

    function stResolveBuilding()
    {
        $next_state = "auctionBonus";
        $round_number = $this->getGameStateValue( 'round_number' );
        $auction_no = $this->getGameStateValue( 'current_auction' );
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
        $auction_no = $this->getGameStateValue( 'current_auction' );
        $round_number = $this->getGameStateValue( 'round_number' );
        $auction_id = self::getUniqueValueFromDB("SELECT `auction_id` FROM `auctions`  WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'");
        switch($auction_id){
            case AUCTION1_5:
            case AUCTION1_6:
            case AUCTION1_7: 
                // worker
                $this->addWorker($active_player);
                $next_state = "endBuild";
                $this->setGameStateValue( 'bonus_option', NONE );
            break;
            case AUCTION2_4:
            case AUCTION3_4:
                $this->addWorker($active_player);
                $this->setGameStateValue( 'bonus_option' , 7);
                // worker and rail adv
            break;
            case AUCTION2_8:
            case AUCTION3_7:
                // wood for rail tile (not rail advancement)
                $this->setGameStateValue( 'bonus_option' , WOOD);
            break;
            // resource for points
            case AUCTION1_9:
                // copper for 4 vp.
                $this->setGameStateValue( 'bonus_option' , COPPER);
            break;
            case AUCTION1_10:
                // cow for 4 vp.
                $this->setGameStateValue( 'bonus_option' , COW);
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
        $bonus = $this->getGameStateValue( 'bonus_option' );
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
                $this->setGameStateValue('phase', 3);
                $next_state = "railBonus";
            break;
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndBuildRound() {
        $auction_no = $this->getGameStateValue( 'current_auction' );
        $this->discardAuctionTile($auction_no);
        $next_state = "nextBuilding";
        if ($auction_no = $this->getGameStateValue( 'number_auctions' )){
            $next_state = "endRound";
        } else {
            $this->setGameStateValue( 'current_auction', ++$auction_no);
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndRound()
    {
        $round_number = $this->getGameStateValue( 'round_number' );
        $next_state = "endGame";
        if ($round_number < 10) {
            $this->setGameStateValue( 'current_auction',   1);
            $this->setGameStateValue( 'players_passed',    0);
            $this->setGameStateValue( 'last_bid' ,         0);
            $this->setGameStateValue( 'selected_worker',   0);
            $this->setGameStateValue( 'selected_building', 0);
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
