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
require_once('modules/HSDBuilding.class.php');
require_once('modules/HSDAuction.class.php');

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
        
        $this->Log      = new HSDLog($this);
        $this->Bid      = new HSDBid($this);
        $this->Building = new HSDBuilding($this);
        $this->Auction  = new HSDAuction($this);

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
        $this->Building->createBuildings($gamePlayers);
        $this->Auction->createAuctionTiles(count($players));

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
    
        $current_player_id = $this->getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        $sql = "SELECT `player_id` p_id, `player_score`, `color_name`, `player_name` FROM `player` ";
        $result['players'] = $this->getCollectionFromDb( $sql );

        $sql = "SELECT `building_key` b_key, `building_id` b_id, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` ";
        $result['buildings'] = $this->getCollectionFromDb( $sql );
  
        $sql = "SELECT `worker_key` w_key, `player_id` p_id, `building_key` b_key, `building_slot` b_slot, `selected` FROM `workers`";
        $result['workers'] = $this->getCollectionFromDb( $sql );

        $sql = "SELECT `player_id` p_id, `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '".$current_player_id."'";
        $result['player_resources'] = $this->getObjectFromDb( $sql );

        $sql = "SELECT `player_id` p_id, `workers`, `track`, `bid_loc`, `rail_adv` FROM `resources` ";
        $result['resources'] = $this->getCollectionFromDb( $sql );

        $sql = "SELECT `auction_id` a_id, `position`, `location`,  `build_type`, `bonus` FROM `auctions` WHERE `location` IN (1,2,3) "; //`state`
        $result['auctions'] = $this->getCollectionFromDb( $sql );
        
        $result['first_player'] = $this->getGameStateValue( 'first_player');
        $result['current_player'] = $current_player_id;
        $result['round_number'] = $this->getGameStateValue( 'round_number' );

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
        $gameprogress = ($this->getGameStateValue('round_number')-1) * 10;
        $gameprogress += $this->getGameStateValue('current_auction');
        return $gameprogress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getPlayerName($player_id){
        return($this->loadPlayersBasicInfos()[$player_id]['player_name']);
    }

    function updateAndNotifyIncome($player_id, $type, $amount, $reason_string = ""){
        $this->notifyAllPlayers( "playerIncome",
        clienttranslate( '${player_name} recieved '.$amount.' '.$type.' from '.$reason_string ), 
        array('player_id' => $player_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => $this->getPlayerName($player_id),
            ) );
        $sql = "SELECT `".$type."` FROM `resources` WHERE `player_id`= '".$player_id."'";
        $resource_count = self::getUniqueValueFromDB( $sql );
        $resource_count += $amount;
        $sql = "UPDATE `resources` SET `".$type."`='".$resource_count."' WHERE `player_id`= '".$player_id."'";
        self::DbQuery( $sql );
    }

    function updateAndNotifyPayment($player_id, $type, $amount, $reason_string = ""){
        $this->notifyAllPlayers( "playerPayment",
            clienttranslate( '${player_name} paid '.$amount.' '.$type.' for '.$reason_string ), 
            array('player_id' => $player_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => $this->getPlayerName($player_id),
        ) );
        $this->updateResource($player_id, $type, $amount);
    }

    /*function notifyIncome($player_id, $reason_string, $amount, $type){
        self::notifyAllPlayers( "playerIncome",
            clienttranslate( '${player_name} recieved '.$amount.' '.$type.' from '.$reason_string ), 
            array('player_id' => $player_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => self::loadPlayersBasicInfos()[$player_id]['player_name'],
        ) );
    }*/

    /*function notifyPayment($player_id, $reason_string, $amount, $type){
        self::notifyAllPlayers( "playerPayment",
            clienttranslate( '${player_name} paid '.$amount.' '.$type.' for '.$reason_string ), 
            array('player_id' => $player_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => self::loadPlayersBasicInfos()[$player_id]['player_name'],
        ) );
    }*/

    /**
     * This will NOT notify the player only for use when notification has already happened (workers), or 
     * updating the trackers: bid_loc, rail_adv, 
     */
    function updateResource($player_id, $type, $amount){
        $sql = "SELECT `".$type."` FROM `resources` WHERE `player_id`= '".$player_id."'";
        $resource_count = self::getUniqueValueFromDB( $sql );
        $resource_count += $amount;
        $sql = "UPDATE `resources` SET `".$type."`='".$resource_count."' WHERE `player_id`= '".$player_id."'";
        self::DbQuery( $sql );
    }

    function addWorker($player_id, $reason_string){
        if ($reason_string == 'hire'){
            $this->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a new ${token}' ), array(
                'player_id' => $player_id,
                'player_name' => $this->getPlayerName($player_id),
                'token' => 'worker',));
        } else {
            $this->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a new ${token} as ${reason}' ), array(
                'player_id' => $player_id,
                'player_name' => $this->getPlayerName($player_id),
                'token' => 'worker',
                'reason' => $reason_string,));
        }
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$player_id.")";
        self::DbQuery( $sql );
        $this->updateResource($player_id, 'workers', 1);
    }

    function getColorNames(){
        $sql = "SELECT `player_id`, `color_name` FROM `player`";
        return self::getCollectionFromDb( $sql );
    }

    function canPlayerAfford($player_id, $resource_arr){
        $sql = "SELECT * FROM `resources` WHERE `player_id` ='".$player_id."'";
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
            $this->Building->buildingIncomeForPlayer($player_id);
            if ($player_resource['track'] > 0){
                $this->updateAndNotifyIncome($player_id, 'silver', $player_resource['track'], 'rail tracks');
            }
        }
    }

    function payForBuilding($player_id, $building_key){
        $building_cost = $this->getBuildingCostFromKey ($building_key);
        $sql = "SELECT * FROM `resources` WHERE `player_id` =".$player_id;
        $player_resources = self::getObjectFromDB($sql);
        $update = false;
        $sql = "UPDATE `resources` SET ";
        $values = array();
        foreach ($building_cost as $type => $cost){
            if ($building_cost[$type] > 0){
                $newValue = $player_resources[$type] - $building_cost[$type];
                $values[] = "`$type` ='$newValue'";
                $update = true;
            }
        }
        if ($update){
            $sql .= implode( ', ', $values ); 
            $sql .=" WHERE `player_id` ='".$player_id."'";
            self::DbQuery( $sql );
        }
    }

    function getRailAdv($player_id) {
        $sql = "SELECT `rail_adv` FROM `resources` WHERE `player_id`='".$player_id."'";
        $rail_adv = self::getUniqueValueFromDB( $sql );
        if ($rail_adv < 5){
            $rail_adv++;
            $sql = "UPDATE `resources` SET `rail_adv`= '".$rail_adv."' WHERE `player_id`='".$player_id."'";
            self::DbQuery( $sql );
            self::notifyAllPlayers( "railAdv", 
                        clienttranslate( '${player_name} advances their rail track ' ),
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
            $options[] = TRACK; 
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

    /** gets an array of valid build types from 
     * a bitwise map of build types (how it's stored in sql)
     * '0-None, + 1 RES, +2 COM, +4 IND, +8 SPE'
     * ex: 5 would be IND(4) + RES(1)
     * ex: 1 would be RES(1)
     */
    function getBuildTypeOptions($build_type){
        $build_type_options = array();
        if ($build_type %2 == 1){
            $build_type_options[] = TYPE_RESIDENTIAL;
            $build_type -=1;
        }
        if ($build_type %4 == 2){
            $build_type_options[] = TYPE_COMMERCIAL;
            $build_type -=2;
        }
        if ($build_type %8 == 4){
            $build_type_options[] = TYPE_INDUSTRIAL;
            $build_type -=4;
        }
        if ($build_type == 8){
            $build_type_options[] = TYPE_SPECIAL;
        }
        return $build_type_options;
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
        $afford = $this->canPlayerAffordBuilding ($player_id, $building_key);
        if (!$afford){
            throw new BgaUserException( self::_("You cannot afford to buy ".$this->Building->getBuildingNameFromKey($building_key)));
        }
        $this->payForBuilding($player_id, $building_key);
        self::notifyAllPlayers( "buyBuilding", 
                    clienttranslate( '${player_name} buys a building ${building_name} ' ),            
                    array('player_id' => $player_id,
                            'player_name' => $this->loadPlayersBasicInfos()[$player_id]['player_name'],
                            'building_key' => $building_key,
                            'building_id' => $this->getBuildingFromKey($building_key)['building_id'],
                            'building_name' => $this->Building->getBuildingNameFromKey($building_key),) );
        $sql = "UPDATE `buildings` Set `location`= ".BUILDING_LOC_PLAYER.", `player_id`=".$player_id." WHERE building_key =".$building_key;    
        self::DbQuery( $sql );
    }

    function pay($player_id, $silver, $gold, $reason_string){
        if (!$this->canPlayerAfford($player_id, array('gold'=>$gold, 'silver'=>$silver))){
            throw new BgaUserException( _("Not enough resources. Take loan(s) or trade") );
        }
        if ($gold > 0) {
            $this->notifyPayment($player_id, $reason_string, $gold, 'gold');
            $this->updateResource($player_id, 'gold', -$gold);
        }
        if ($silver > 0) {
            $this->notifyPayment($player_id, $reason_string, $silver, 'silver');
            $this->updateResource($player_id, 'silver', -$silver);
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
        $this->notifyIncome($current_player_id, 'loan', 2, 'silver');
        $this->updateResource($current_player_id,'loan', 1);
        $this->notifyIncome($current_player_id, 'loan', 1, 'loan');
        $this->Log->takeLoan($current_player_id);
        $this->notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a loan' ), array(
            'player_id' => $this->getCurrentPlayerId(),
            'player_name' => $this->getCurrentPlayerName(),
        ) );
    }

    public function playerTrade( $tradeAction )
    {
        self::checkAction( 'trade' );
        
        $current_player_id = $this->getCurrentPlayerId();
        $current_player_name = $this->getCurrentPlayerName();
        // default trade amounts
        $sell = false;
        $trade_away_amt = 1;
        $trade_for_amt = 1;
        switch($tradeAction){
            case 'buy_wood':
                $trade_away_type = "silver";
                $trade_for_type = "wood";
            break;
            case 'buy_food':
                $trade_away_amt = 2;
                $trade_away_type = "silver";
                $trade_for_type = "food";
            break;
            case 'buy_steel':
                $trade_away_amt = 3;
                $trade_away_type = "silver";
                $trade_for_type = "steel";
            break;
            case 'buy_gold':
                $trade_away_amt = 4;
                $trade_away_type = "silver";
                $trade_for_type = "gold";
            break;
            case 'buy_copper':
                $trade_away_type = "gold";
                $trade_for_type = "copper";
            break;
            case 'buy_livestock':
                $trade_away_type = "gold";
                $trade_for_type = "livestock";
            break;
            case 'sell_wood':
                $trade_away_type = "wood";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_food':
                $trade_away_type = "food";
                $trade_for_amt = 2;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_steel':
                $trade_away_type = "steel";
                $trade_for_amt = 3;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_gold':
                $trade_away_type = "gold";
                $trade_for_amt = 4;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_copper':
                $trade_away_type = "copper";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_livestock':
                $trade_away_type = "cow";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'market_wood_food':
                $trade_away_type = "wood";
                $trade_for_type = "food";
            break;
            case 'market_food_steel':
                $trade_away_type = "food";
                $trade_for_type = "steel";
            break;
        }
        $cost = array($trade_away_type=>$trade_away_amt, 'trade'=> 1);
        if (!$this->canPlayerAfford($current_player_id, $cost)){
            throw new BgaUserException( self::_("You cannot afford to make this trade"));
        }
        $this->notifyAllPlayers( "trade", clienttranslate( '${player_name} trades ${trade1} for ${trade2}' ), array(
            'player_id' => $current_player_id,
            'player_name' => $current_player_name,
            'sell' => $sell,
            'trade1' => $trade_away_type,
            'trade2' => $trade_for_type,
        ) );
        $this->notifyPayment($current_player_id, 'trade', 1, 'trade');
        $this->notifyPayment($current_player_id, 'trade', $trade_away_amt, $trade_away_type);
        $this->notifyIncome($current_player_id,  'trade', $trade_for_amt, $trade_for_type);

        $this->updateResource($current_player_id, 'trade', -1);
        $this->updateResource($current_player_id, $trade_away_type, -$trade_away_amt);
        $this->updateResource($current_player_id, $trade_for_type, $trade_for_amt);
        if ($sell){
            $this->notifyIncome($current_player_id, 'trade', 1, 'vp');
            $this->updateResource($current_player_id, 'vp', 1);
        }
    }

    public function playerHireWorker($free = false){
        self::checkAction( 'hireWorker' );
        $current_player_id = self::getCurrentPlayerId();
        if (!$free){
            $worker_cost = array('trade'=>1,'food'=>1);
            if (!$this->canPlayerAfford($current_player_id, $worker_cost))
                throw new BgaUserException( _("You cannot afford to hire a worker"));
            $this->updateResource($current_player_id, 'trade', -1);
            $this->notifyPayment($current_player_id, 'hire worker', 1, 'trade');
            $this->updateResource($current_player_id, 'food', -1);
            $this->notifyPayment($current_player_id, 'hire worker', 1, 'food');
        
        }
        
        $this->addWorker($current_player_id, 'hire');
    }

    /***  place workers phase ***/
    public function playerSelectWorkerDestination($worker_key, $building_key, $building_slot) 
    {
        self::checkAction( "placeWorker" );
        $current_player_id = self::getCurrentPlayerId();
        $this->notifyAllPlayers( "workerMoved", clienttranslate( '${player_name} moves a ${token} to ${building_name}' ), array(
            'player_id' => $current_player_id,
            'worker_key' => $worker_key,
            'building_key' => $building_key,
            'building_name' => $this->Building->getBuildingNameFromKey($building_key),
            'building_slot' => $building_slot, 
            'token' => 'worker',
            'player_name' => $this->getCurrentPlayerName(),
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
        $this->gamestate->setPlayerNonMultiactive( self::getCurrentPlayerId() , '' );
    }

    /*** Player Bid Phase ***/
    public function playerConfirmBid($bid_location){
        self::checkAction( "confirmBid" );
        $this->Bid->confirmBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerPassBid(){
        self::checkAction( "pass" );
        $this->Log->passBid($this->getActivePlayerId());
        $this->Bid->passBid();
        $this->setGameStateValue('phase', PHASE_BID_PASS );
        $this->gamestate->nextState( "rail" );
    }

    public function playerBuildBuilding($selected_building){
        $active_player = $this->getActivePlayerId();
        $this->buyBuilding($active_player, $selected_building);
        $this->gamestate->nextState( 'build' );
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

    public function playerPayWorkers($gold) {
        self::checkAction( "done" );
        $current_player_id = $this->getCurrentPlayerId();
        $sql = "SELECT `workers` FROM `resources` WHERE `player_id`='".$current_player_id."'";
        $workers = self::getUniqueValueFromDB( $sql );
        $cost = max($workers - (5*$gold), 0);
        $this->pay($current_player_id, $cost, $gold, "paying workers");
        $this->gamestate->setPlayerNonMultiactive($current_player_id, "auction" );
    }

    public function playerPayAuction($gold) {
        self::checkAction( "done" );
        $active_player_id = $this->getActivePlayerId();
        $sql = "SELECT `bid_loc` FROM `resources` WHERE `player_id`='".$active_player_id."'";
        $bid_loc = self::getUniqueValueFromDB( $sql );
        $bid_cost = $this->Bid->getBidCost($bid_loc);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        $this->pay($active_player_id, $bid_cost, $gold, "auction cost");

        $this->gamestate->nextstate( 'build' );
    }

    public function playerSelectBonusOption($selected_bonus) {
        $active_player = $this->getActivePlayerId();
        $rail_bonus_string = self::_('Rail Advancement Bonus');
        $options = $this->getRailAdvBonusOptions($active_player);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( "invalid bonus option selected: " );
        } 
        switch ($selected_bonus){
            case WORKER:
                $this->addWorker($active_player, $rail_bonus_string);
            break;
            case TRADE:
                $this->notifyIncome($active_player, $rail_bonus_string, 1, 'trade');
                $this->updateResource($active_player,'trade', 1);
            break;
            case TRACK:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'track');
                $this->updateResource($active_player,'track', 1);
            break;
            case WOOD:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'wood');
                $this->updateResource($active_player,'wood', 1);
            break;
            case FOOD:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'food');
                $this->updateResource($active_player,'food', 1);
            break;
            case STEEL:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'steel');
                $this->updateResource($active_player,'steel', 1);
            break;
            case GOLD:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'gold');
                $this->updateResource($active_player,'gold', 1);
            break;
            case COPPER:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'copper');
                $this->updateResource($active_player,'copper', 1);
            break;
            case COW:
                $this->notifyIncome($active_player, 'Rail advancement', 1, 'cow');
                $this->updateResource($active_player,'cow', 1);
            break;
            case VP:
                $this->notifyIncome($active_player, 'Rail advancement', 3, 'vp');
                $this->updateResource($active_player,'vp', 3);
            break;
        }
        $phase = self::getGameStateValue( 'phase' );
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

    public function playerWoodForTrack (){
        $active_player = $this->getActivePlayerId();
        if (!$this->canPlayerAfford($active_player, array('wood'=> 1))) {
            throw new BgaUserException( self::_("You need a Wood to take this action") );
        }
        $this->notifyPayment($active_player, 'Auction Bonus', -1, 'wood');
        $this->updateResource($active_player,'wood', -1);
        $this->notifyIncome($active_player, 'Auction Bonus', 1, 'track');
        $this->updateResource($active_player,'track', 1);
        $this->gamestate->nextState( 'done' );
    }

    public function playerCopperForVp () {
        $active_player = $this->getActivePlayerId();
        if (!$this->canPlayerAfford($active_player, array('copper'=> 1))){
            throw new BgaUserException( self::_("You need a Copper to take this action") );
        }
        $this->notifyPayment($active_player, 'Auction Bonus', 1, 'copper');
        $this->updateResource($active_player,'copper', -1);
        $this->notifyIncome($active_player, 'Auction Bonus', 4, 'vp');
        $this->updateResource($active_player,'vp', 4);
        $this->gamestate->nextState( 'done' );
    }

    public function playerCowForVp () {
        $active_player = $this->getActivePlayerId();
        if (!$this->canPlayerAfford($active_player,array('cow'=> 1))){
            throw new BgaUserException( self::_("You need a livestock to take this action ") );
        }
        $this->notifyPayment($active_player, 'Auction Bonus', 1, 'cow');
        $this->updateResource($active_player,'copper', -1);
        $this->notifyIncome($active_player, 'Auction Bonus', 4, 'vp');
        $this->updateResource($active_player,'vp', 4);
        $this->gamestate->nextState( 'done' );
    }

    public function playerFoodForVp () {
        $active_player = $this->getActivePlayerId();
        if (!$this->canPlayerAfford($active_player, array('food'=> 1))){
            throw new BgaUserException( self::_("You need a food to take this action ") ); 
        }
        $this->notifyPayment($active_player, 'Auction Bonus', 1, 'food');
        $this->updateResource($active_player,'food', -1);
        $this->notifyIncome($active_player, 'Auction Bonus', 2, 'vp');
        $this->updateResource($active_player,'vp', 4);
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerPassAuctionBonus () {
        $active_player = $this->getActivePlayerId();
        $this->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Auction Bonus' ), array(
            'player_id' => $active_player,
            'player_name' => $this->getActivePlayerName()));
        $this->gamestate->nextState( 'done' );
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argPayWorkers()
    {
        $res = array ();
        $sql = "SELECT `workers` FROM `resources`";
        $worker_counts = self::getCollectionFromDB($sql);
        return $worker_counts;
    }

    function argPlaceWorkers() 
    {
        $res = array ();
        $players = $this->loadPlayersBasicInfos();
        foreach ( $players as $player_id => $player_info ) {
            $sql = "SELECT `trade` FROM `resources` WHERE `player_id`='$player_id'";
            $trade = self::getUniqueValueFromDB( $sql ); 
            $res [$player_id] = array("trade"=>$trade);
        }
        return $res;
    }

    function argValidBids() {
        $active_player_id = self::getActivePlayerId();
        $valid_bids = $this->Bid->getValidBids($active_player_id);
        return array("valid_bids"=>$valid_bids );
    }

    function argRailBonus() {
        $active_player_id = self::getActivePlayerId();
        $rail_options= $this->getRailAdvBonusOptions($active_player_id);
        return array("rail_options"=>$rail_options);
    }

    function argAuctionCost() {
        $active_player_id = self::getActivePlayerId();
        $sql = "SELECT `bid_loc` FROM `resources` WHERE `player_id` = '".$active_player_id."'";
        $bid_location = self::getUniqueValueFromDB($sql);
        $bid_cost = $this->Bid->getBidCost($bid_location);
        return array("auction_cost"=>$bid_cost);
    }

    function argAllowedBuildings() {
        $round_number = self::getGameStateValue('round_number');
        $current_auction = self::getGameStateValue('current_auction');
        $sql = "SELECT `build_type` FROM `auctions` WHERE `location`='".$current_auction."'AND `position`='".$round_number."'";
        $build_type = self::getUniqueValueFromDB( $sql );// the sql value for the building.
        $build_type_options = $this->getBuildTypeOptions($build_type);// into an array of constants
        $buildings = array(); // this will catch the empty scenario.
        if (count($build_type_options) >0){
            $sql = "SELECT * FROM `buildings` WHERE `location`=".BUILDING_LOC_OFFER." AND (";
            $values = array();
            foreach($build_type_options as $i=>$option){
                $values[] = "`building_type`='".$build_type_options[$i]."'";
            }
            $sql .= implode( ' OR ', $values ); 
            $sql .= ")";
            $buildings = self::getCollectionFromDB( $sql );
        }
       return(array("allowed_buildings"=> $buildings));
    }

    function argBonusOption() {
        $bonus_option = $this->getGameStateValue( 'bonus_option');
        return (array("bonus_option"=> $bonus_option));
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
        $this->collectIncome( );
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
        $this->gamestate->setPlayersMultiactive($players, 'auction');
    }
    
    function stBeginAuction(){
        $this->Bid->clearBids( );
        $first_player = self::getGameStateValue('first_player');
        $this->gamestate->changeActivePlayer( $first_player );
        $this->gamestate->nextState( );
    }
    
    function stRailBonus() {
        //$active_player = $this->getActivePlayerId();
        // wait for player action (select bonus)
    }

    function stNextBid()
    { 
        $this->activeNextPlayer( );
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
        $sql = "SELECT `build_type` FROM `auctions` WHERE `location` = '$auction_no' AND `position` = '$round_number'";
        $build_type = self::getUniqueValueFromDB( $sql );
        if ( $build_type == 0 ){ // skip build, go straight to bonus.
            $this->gamestate->nextState( "bonus" ); 
        } 
    }

    function stResolveBuilding()
    {
        $next_state = "auctionBonus";
        $round_number = $this->getGameStateValue( 'round_number' );
        $auction_no = $this->getGameStateValue( 'current_auction' );
        $sql = "SELECT `bonus` FROM `auctions`  WHERE `location` = '".$auction_no."' AND `position` = '".$round_number."'";
        $bonus = self::getUniqueValueFromDB( $sql );
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
                $this->addWorker($active_player, _("Auction Tile Bonus"));
                $this->setGameStateValue( 'bonus_option', NONE );
                $next_state = "endBuild";
            break;
            case AUCTION2_4:
            case AUCTION3_4:
                $this->addWorker( $active_player, "Auction Tile Bonus");
                // worker and rail adv
                $this->setGameStateValue( 'phase', PHASE_AUCTION_BONUS);
                $this->getRailAdv( $active_player );
                $next_state = 'railBonus';
            break;
            case AUCTION2_8:
            case AUCTION3_7:
                // wood for rail track (not rail advancement)
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
                $this->updateResource($active_player, 'vp', 6);
                $this->notifyIncome($active_player, 'Auction Reward', 6, 'vp');
                // get 6 vp (charity) & get next (food->2VP) -notice no break;
            case AUCTION2_9:
            case AUCTION2_10:
            case AUCTION3_9:
                // trade 1 food for 2 VP.
                self::setGameStateValue( 'bonus_option' , FOOD);
            break;
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndBuildRound() {
        $this->Auction->discardAuctionTile();
        $this->Bid->setBidForPlayer($this->getActivePlayerId(), BID_PASS);
        $next_state = "nextBuilding";
        if ($auction_no = $this->getGameStateValue( 'number_auctions' )){
            $next_state = "endRound";
        } else {
            $this->setGameStateValue( 'current_auction', ++$auction_no);
        }
        $this->gamestate->nextState( $next_state );
    }

    function stEndRound(){
        $round_number = $this->getGameStateValue( 'round_number' );
        $next_state = "endGame";
        if ($round_number < 10) {
            $this->setGameStateValue( 'current_auction',   1);
            $this->setGameStateValue( 'players_passed',    0);
            $this->setGameStateValue( 'last_bidder' ,      0);
            $next_state = "nextAuction";
            $this->Bid->clearBids();
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
            $this->gamestate->setPlayerNonMultiactive( $active_player );
            
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
