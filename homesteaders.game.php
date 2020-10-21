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
require_once('modules/HSDResource.class.php');
require_once('modules/HSDScore.class.php');

class homesteaders extends Table
{
    public $playerColorNames = array("ff0000" =>'red', "008000"=>'green', "0000ff"=>'blue', "ffff00"=> 'yellow', "982fff"=> 'purple');
    
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
            "auction_bonus"     => 17,
            "building_bonus"    => 18,
            "last_building"     => 19,
            "dummy_bid_val"     => 20,
        ) );
        
        $this->Log      = new HSDLog($this);
        $this->Bid      = new HSDBid($this);
        $this->Building = new HSDBuilding($this);
        $this->Auction  = new HSDAuction($this);
        $this->Resource = new HSDresource($this);
        $this->Score    = new HSDScore($this);
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
        $this->setGameStateInitialValue( 'round_number', 1 );
        $this->setGameStateInitialValue( 'first_player', 0 );
        $this->setGameStateInitialValue( 'phase',        0 );
        $this->setGameStateInitialValue( 'number_auctions', $number_auctions );
        $this->setGameStateInitialValue( 'current_auction', 1 );
        $this->setGameStateInitialValue( 'last_bidder', 0 );
        $this->setGameStateInitialValue( 'players_passed', 0 );
        $this->setGameStateInitialValue( 'auction_bonus', 0 );
        $this->setGameStateInitialValue( 'building_bonus', 0 );
        $this->setGameStateInitialValue( 'last_building', 0 );
        $this->setGameStateInitialValue( 'dummy_bid_val', 5 );
        
        $values = array();
        // set colors
        foreach ($gamePlayers as $player_id => $p) {
            $color = $p['player_color'];
            $sql = "UPDATE `player` SET `color_name`='".$this->playerColorNames[$color]."' WHERE `player_id`='".$player_id."'";
            self::DbQuery( $sql );

            $values[] = "(".$player_id.")";
        }
        
        // create building Tiles (in sql)
        $this->Building->createBuildings($players);
        $this->Auction->createAuctionTiles(count($players));

        // setup resources table
        $sql = "INSERT INTO `resources` (player_id) VALUES ";
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        // create 1 worker for each player.
        $sql = "INSERT INTO `workers` (player_id) VALUES ";
        $sql .= implode( ',', $values );        
        self::DbQuery( $sql );

        $this->activeNextPlayer();
        $act_p_id = $this->getActivePlayerId();
        $this->setGameStateValue('first_player', $act_p_id);
        
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
        $cur_p_id = $this->getCurrentPlayerId();    // !! We must only return informations visible by this player !!
        return array(
            'auctions' => $this->Auction->getAllAuctionsFromDB(),
            'players' => $this->getCollectionFromDb( "SELECT `player_id` p_id, `player_score` score, `color_name`, `player_name`, `bid_loc`, `rail_adv` FROM `player` " ),
            'buildings' => $this->Building->getAllBuildings(),
            'can_undo_trades' => (count($this->Log->getLastTransactions($cur_p_id))> 0),
            'cancel_move_ids' => $this->Log->getCancelMoveIds(),
            'current_player' => $cur_p_id, 
            'first_player' => $this->getGameStateValue( 'first_player'),
            'number_auctions' => $this->getGameStateValue( 'number_auctions' ),
            'player_order' => $this->getNextPlayerTable(),
            'player_resources' => $this->getObjectFromDb( "SELECT `player_id` p_id, `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '$cur_p_id'" ),
            'resources' => $this->getCollectionFromDb( "SELECT `player_id` p_id, `workers`, `track` FROM `resources` " ),
            'round_number' => $this->getGameStateValue( 'round_number' ),
            'tracks' => $this->getCollectionFromDb("SELECT `rail_key` r_key, `player_id` p_id FROM `tracks` "),
            'workers' => $this->getCollectionFromDb( "SELECT `worker_key` w_key, `player_id` p_id, `building_key` b_key, `building_slot` b_slot, `selected` FROM `workers`" ),
        );
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
        $game_progress = ($this->getGameStateValue('round_number')-1) * 9;
        $game_progress += $this->getGameStateValue('current_auction');
        return $game_progress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getPlayerName($player_id){
        return($this->loadPlayersBasicInfos()[$player_id]['player_name']);
    }

    function getPlayerColorName($player_id){
        $colors = $this->getCollectionFromDb( "SELECT `player_id`, `color_name` FROM `player`" );
        return($colors[$player_id]['color_name']);
    }
    
    
//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in homesteaders.action.php)
    */

    /*****  Common Methods (loan, trade) *****/
    public function playerTakeLoan()
    {
        $this->checkAction( "takeLoan" );
        $this->Resource->takeLoan($this->getCurrentPlayerId());
    }
    
    public function playerTrade( $tradeAction )
    {
        $this->checkAction( 'trade' );
        $this->Resource->trade($this->getCurrentPlayerId(), $tradeAction);
    }

    /***  place workers phase ***/
    public function playerHireWorker(){
        $this->checkAction( 'hireWorker' );
        $cur_p_id = $this->getCurrentPlayerId();
        $worker_cost = array('trade'=>1,'food'=>1);
        if (!$this->Resource->canPlayerAfford($cur_p_id, $worker_cost))
            throw new BgaUserException( _("You cannot afford to hire a worker"));
        $this->Resource->updateAndNotifyPaymentGroup($cur_p_id, $worker_cost, 'Hire Worker');
        $this->Log->updateResource($cur_p_id, "trade", -1);
        $this->Log->updateResource($cur_p_id, "food", -1);
        $this->Resource->addWorker($cur_p_id, 'hire');
    }

    public function playerSelectWorkerDestination($w_key, $b_key, $building_slot) 
    {
        $this->checkAction( "placeWorker" );
        $cur_p_id = $this->getCurrentPlayerId();
        $w_owner = $this->getUniqueValueFromDB("SELECT `player_id` FROM `workers` WHERE `worker_key`='$w_key'");
        if ($w_owner != $cur_p_id){ throw new BgaUserException("This is not your worker.");}
        $this->notifyAllPlayers( "workerMoved", clienttranslate( '${player_name} moves a ${type} to ${building_name}' ), array(
            'player_id' => $cur_p_id,
            'worker_key' => $w_key,
            'building_key' => $b_key,
            'building_name' => array('type'=> $this->Building->getBuildingTypeFromKey($b_key) ,'str'=>$this->Building->getBuildingNameFromKey($b_key)),
            'building_slot' => $building_slot, 
            'type' => 'worker',
            'player_name' => $this->getCurrentPlayerName(),
        ) );
        $sql = "UPDATE `workers` SET `building_key`= '".$b_key."', `building_slot`='".$building_slot."' WHERE `worker_key`='".$w_key."'";
        $this->DbQuery( $sql );
    }

    public function playerDonePlacingWorkers ()
    {
        $p_id = $this->getCurrentPlayerId();
        $this->notifyAllPlayers( "playerPass", clienttranslate( '${player_name} is done assigning ${type}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->getCurrentPlayerName(),
            'type' => 'worker',
        ) );
        $this->Resource->collectIncome($p_id);
        $this->gamestate->setPlayerNonMultiactive( $this->getCurrentPlayerId() , '' );
    }

    /*** Player Bid Phase ***/
    public function playerConfirmBid($bid_location){
        $this->checkAction( "confirmBid" );
        $this->Bid->confirmBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerPassBid(){
        $this->checkAction( "pass" );
        $this->Bid->passBid();
        $this->Log->passBid($this->getActivePlayerId());
        $this->setGameStateValue('phase', PHASE_BID_PASS );
        $this->gamestate->nextState( "rail" );
    }

    public function playerBuildBuilding($selected_building, $goldAsCow, $goldAsCopper){
        $this->checkAction( "buildBuilding" );
        $act_p_id = $this->getActivePlayerId();
        $this->Building->buildBuilding($act_p_id, $selected_building, $goldAsCow, $goldAsCopper);
        if ($this->Building->doesPlayerOwnBuilding($act_p_id, BLD_FORGE) && 
            $this->Building->getBuildingIdFromKey($selected_building) != BLD_FORGE){
            $this->Resource->updateAndNotifyIncome($act_p_id, 'vp', 1, array('type'=>TYPE_INDUSTRIAL, 'str'=>"Forge") );
            $this->Log->updateResource($act_p_id, 'vp', 1);
        }
        $building_bonus = $this->Building->getOnBuildBonusForBuildingKey($selected_building);
        $this->setGameStateValue('building_bonus', $building_bonus);
        $bonus = $this->Auction->getCurrentAuctionBonus();
        $next_state = 'end_build';
        if ($building_bonus != BUILD_BONUS_NONE){
            $next_state = 'building_bonus';    
        } else if ($bonus != AUC_BONUS_NONE){      
            $next_state = 'auction_bonus'; 
        }
        $this->gamestate->nextState ($next_state);
    }

    public function playerDoNotBuild () {
        $this->checkAction( "doNotBuild" );
        //goto next state;
        $this->gamestate->nextState( "auction_bonus" ); 
        
    }

    public function playerPayWorkers($gold) {
        $this->checkAction( "done" );
        $cur_p_id = $this->getCurrentPlayerId();
        $workers = $this->Resource->getPlayerResourceAmount($cur_p_id,'workers');
        $cost = max($workers - (5*$gold), 0);
        $this->Resource->pay($cur_p_id, $cost, $gold, "workers");
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, "auction" );
    }

    public function playerPayAuction($gold) {
        $this->checkAction( "done" );
        if ($gold <0){ throw new BgaUserException ( _("cannot have negative gold value"));}
        $act_p_id = $this->getActivePlayerId();
        
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->pay($act_p_id, $bid_cost, $gold, "AUCTION ".$auc_no, $auc_no);
        if ($this->Auction->doesCurrentAuctionHaveBuildPhase()){
            $this->gamestate->nextstate( 'build' );
        } else {
            $this->gamestate->nextstate( 'auction_bonus');
        }
        
    }

    public function playerSelectRailBonus($selected_bonus) {
        $act_p_id = $this->getActivePlayerId();
        $options = $this->Resource->getRailAdvBonusOptions($act_p_id);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( "invalid bonus option selected: " );
        } 
        $this->Resource->recieveRailBonus($act_p_id, $selected_bonus);
        $phase = $this->getGameStateValue( 'phase' );
        $next_state = "";
        switch($phase){
            case PHASE_BID_PASS:
                $next_state = "nextBid";
            break;
            case PHASE_BLD_BONUS:
                $next_state = "auctionBonus";
            break;
            case PHASE_AUC_BONUS:
                $next_state = "endAuction";
            break;
        }
        $this->gamestate->nextState( $next_state );
    }

    /**** Building Bonus Player actions *****/
    public function playerFreeHireWorkerBuilding()
    {
        $this->checkAction( "buildBonus" );
        $act_p_id = $this->getActivePlayerId();
        $b_key = $this->getGameStateValue('last_building');
        $b_name = $this->Building->getBuildingNameFromKey($b_key);
        $this->Resource->addWorker($act_p_id, $b_name, 'building', $b_key);
        $this->gamestate->nextState( 'auction_bonus' );
    }

    public function playerPassBuildingBonus () 
    {
        $this->checkAction( "buildBonus" );
        $this->gamestate->nextState( 'auction_bonus' );
    }

    /**** Auction Bonus actions ******/
    public function playerFreeHireWorkerAuction ( $rail ) 
    {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $this->Resource->addWorker($act_p_id, 'auction bonus');
        $next_state = 'done';    
        if ($rail){
            $this->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $auc_no = $this->getGameStateValue( 'current_auction');
            $this->Resource->getRailAdv( $act_p_id, "AUCTION ".$auc_no, 'auction', $auc_no );
            $next_state = 'railBonus';
        }
        $this->gamestate->nextState( $next_state );
    }

    public function playerWoodForTrack (){
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        if (!$this->Resource->canPlayerAfford($act_p_id, array('wood'=> 1))) {
            throw new BgaUserException( _("You need a WOOD to take this action") );
        }
        //$this->Resource->updateAndNotifyPayment($act_p_id, 'wood', 1, 'Auction Bonus', 'auction', $this->getGameStateValue('current_auction'));
        $auc = $this->getGameStateValue('current_auction');
        $this->Resource->specialTrade($act_p_id, array('wood'=>1), array('track'=>1), "AUCTION ".$auc, 'auction', $auc);
        //$this->Resource->addTrack($act_p_id, 'Auction Bonus', 'auction', $auc = $this->getGameStateValue('current_auction'));
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerCopperForVp ($goldAsCopper= false) {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $costType = ($goldAsCopper?'gold':'copper');
        $cost = array($costType=> 1);
        if (!$this->Resource->canPlayerAfford($act_p_id, $cost)){
            throw new BgaUserException( _("You need a ".strtoupper($costType)." to take this action") );
        }
        $auc = $this->getGameStateValue('current_auction');
        
        $this->Resource->specialTrade($act_p_id, $cost, array('vp4'=>1), "AUCTION "+$auc, 'auction', $auc);
        //$this->Resource->updateAndNotifyPayment($act_p_id, 'copper', 1, 'Auction Bonus', 'auction', $auc);
        //$this->Resource->updateAndNotifyIncome($act_p_id, 'vp', 4, 'Auction Bonus', 'auction', $auc);
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerCowForVp ($goldAsCow) {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $cost = array(($goldAsCow?'gold':'cow')=>1);
        if (!$this->Resource->canPlayerAfford($act_p_id,$cost)){
            $costType = ($goldAsCow?'gold':'livestock');
            throw new BgaUserException( _("You need a ".strtoupper($costType)." to take this action ") );
        }
        $auc = $this->getGameStateValue('current_auction');
        $this->Resource->specialTrade($act_p_id, $cost, array('vp4'=>1), "AUCTION "+$auc, 'auction', $auc);
        //$this->Resource->updateAndNotifyPayment($act_p_id, 'cow', 1, 'Auction Bonus', 'auction', $auc);
        //$this->Resource->updateAndNotifyIncome($act_p_id, 'vp', 4, 'Auction Bonus', 'auction', $auc);
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerFoodForVp () {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        if (!$this->Resource->canPlayerAfford($act_p_id, array('food'=> 1))){
            throw new BgaUserException( _("You need a FOOD to take this action ") ); 
        }
        $auc = $this->getGameStateValue('current_auction');
        $this->Resource->specialTrade($act_p_id, array('food'=>1), array('vp2'=>1), "AUCTION "+$auc, 'auction', $auc);
        //$this->Resource->updateAndNotifyPayment($act_p_id, 'food', 1, 'Auction Bonus','auction', $auc);
        //$this->Resource->updateAndNotifyIncome($act_p_id, 'vp', 2, 'Auction Bonus','auction', $auc);
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerPassAuctionBonus () {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $this->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Auction Bonus' ), array(
            'player_id' => $act_p_id,
            'player_name' => $this->getActivePlayerName()));
        $next_state = 'done';
        $auction_bonus = $this->getGameStateValue('auction_bonus');
        if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV) {
            $this->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $auc_no = $this->getGameStateValue('current_auction');
            $this->Resource->getRailAdv( $act_p_id, "AUCTION ".$auc_no, 'auction', $auc_no );
            $next_state = 'railBonus';
        }
        $this->gamestate->nextState( $next_state );
    }

    /*
     * restartTurn: called when a player decide to go back at the beginning of the player build phase
     */
    public function playerCancelPhase () {
        $this->checkAction('undo');
        // undo all actions since beginning of STATE_PAY_AUCTION

        $transactions = $this->Log->getLastActions();
        $move_ids = $this->Log->cancelPhase();
        $this->notifyAllPlayers('cancel', clienttranslate('${player_name} cancels actions'), array(
            'player_name' => $this->getActivePlayerName(),
            'transactions' => $transactions,
            'move_ids' => $move_ids,
            'player_id' => $this->getActivePlayerId()));

        $this->gamestate->nextState('restartTurn');
    }
        
    public function playerCancelTransactions()
    {
        self::checkAction('trade');

        $p_id = $this->getCurrentPlayerId();
        $transactions = $this->Log->getLastTransactions($p_id);
        if ($transactions == null) {
            throw new BgaUserException(_("You have nothing to cancel"));
        }

        // Undo the turn
        $log_ids = $this->Log->cancelTransactions($p_id);
        $this->notifyAllPlayers('cancel', clienttranslate('${player_name} cancels their transactions'), array(
            'player_name' => $this->getPlayerName($p_id),
            'transactions' => $transactions,
            'log_ids' => $log_ids,
            'player_id' => $p_id));
    }

    /** endBuildRound */
    public function playerConfirmChoices (){
        $this->checkAction('done');
        $this->gamestate->nextState( 'done' );
    }

    // endGameActions Actions
    public function playerPayLoan($gold) {
        $this->checkAction('payLoan');
        $cur_p_id = $this->getCurrentPlayerId();    
        $this->Resource->payOffLoan($cur_p_id, $gold);
        $this->Log->payOffLoan($cur_p_id);
    }

    public function playerDoneEndgame() {
        $this->checkAction('done');
        $cur_p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, "" );
    }
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argStartRound(){
        $round_number = $this->getGameStateValue('round_number');
        $auctions = $this->Auction->getCurrentRoundAuctions($round_number);
        return array('round_number'=>$round_number, 'auctions' => $auctions);
    }

    function argPayWorkers()
    {
        $sql = "SELECT `player_id`, `workers` FROM `resources`";
        $worker_counts = $this->getCollectionFromDB($sql);
        return array('worker_counts'=>$worker_counts);
    }

    function argValidBids() {
        $act_p_id = $this->getActivePlayerId();
        $valid_bids = $this->Bid->getValidBids($act_p_id);
        return array("valid_bids"=>$valid_bids );
    }

    function argRailBonus() {
        $act_p_id = $this->getActivePlayerId();
        $rail_options= $this->Resource->getRailAdvBonusOptions($act_p_id);
        return array("rail_options"=>$rail_options);
    }

    function argAuctionCost() {
        $act_p_id = $this->getActivePlayerId();
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        return array("auction_cost"=>$bid_cost);
    }

    function argAllowedBuildings() {
        $act_p_id = $this->getActivePlayerId();
        $build_type_options = $this->Auction->getCurrentAuctionBuildTypeOptions();
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($act_p_id, BLD_RIVER_PORT);
        return(array("allowed_buildings"=> $buildings,
                    "riverPort"=>$ownsRiverPort,));
    }

    function argTrainStationBuildings() {
        $act_p_id = $this->getActivePlayerId();
        $build_type_options = $this->Auction->parseBuildTypeOptions('15');// all
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($act_p_id, BLD_RIVER_PORT);    
        return(array("allowed_buildings"=> $buildings,
                    "riverPort"=>$ownsRiverPort,));
        
    }

    function argBuildingBonus() {
        $building_bonus =$this->getGameStateValue('building_bonus');
        return (array("building_bonus" => $building_bonus));
    }

    function argBonusOption() {
        $auction_bonus = $this->getGameStateValue( 'auction_bonus');
        return (array("auction_bonus"=> $auction_bonus));
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    //Example for game state "MyGameState":

    function stStartRound() {
        $round_number = $this->getGameStateValue('round_number');

        $this->Building->updateBuildingsForRound($round_number);
        // update Auctions.  I think this is already done, trying out removing it here.
        /*if ($round_number>1){
            $last_round = $round_number -1;
            $sql = "UPDATE auctions SET location = '".AUC_LOC_DISCARD."' WHERE position = '$last_round';";
            self::DbQuery( $sql );
            //$this->Auction->updateClientAuctions($round_number);
        }*/
        $this->gamestate->nextState( );
    }

    function stPlaceWorkers() {
        $this->Log->allowTradesAllPlayers();
        $this->gamestate->setAllPlayersMultiactive( );
        
    }

    // removed this state (as it was not necessary)
    /*function stCollectIncome() {
        $this->gamestate->nextState( '' );
    }*/

    function stPayWorkers() 
    {
        $sql = "SELECT `player_id`, `workers`, `gold`, `silver`, `trade` FROM `resources` ";
        $resources = $this->getCollectionFromDB( $sql );
        //$players = array();
        foreach($resources as $player_id => $player){
// currently just auto-paying with silver, 
// TODO: make this toggleable.
            //if ($player['gold'] == 0 && $player['trade'] == 0){//no decisions just pay.
            $silver = $player['silver'];
            $worker_cost = $player['workers'];
            while ($silver < $worker_cost){// forced loan.
                $silver +=2;
                $this->playerTakeLoan($player_id);
            }
            $this->Resource->updateAndNotifyPayment($player_id, 'silver', $player['workers'], array('worker'=>'worker'));
        
            /*} else {
                $players[] = $player_id;
            }*/
        }
        $this->gamestate->nextState('auction');
        //$this->gamestate->setPlayersMultiactive($players, 'auction');
    }
    
    function stBeginAuction() {
        $round_number = $this->getGameStateValue('round_number');
        if ($round_number == 11){
            $this->gamestate->nextState( 'endGame');
        } else{
            $this->Bid->clearBids( );
            $first_player = $this->getGameStateValue('first_player');
            $this->gamestate->changeActivePlayer( $first_player );
            $this->gamestate->nextState( 'auction' );
        }
    }

    function stNextBid()
    { 
        $this->activeNextPlayer( );
        // figure out if bid round is complete, 
        $act_p_id = $this->getActivePlayerId();
        $last_bidder = $this->getGameStateValue( 'last_bidder' );
        // if bidding is complete
        $players_passed = $this->getGameStateValue('players_passed');
        if ($act_p_id == $last_bidder || $players_passed >= $this->getPlayersNumber()) {
            $next_state = "endAuction";
        } else if ($this->Bid->canPlayerBid($act_p_id)) {// if this player can bid.
            $next_state = "playerBid";
        } else { // if not, let next player bid
            $next_state = "skipPlayer";
        }
        $this->gamestate->nextState( $next_state );
    }

    // for states where no backend actions are req, but want to set start turn for trades.
    function stSetupTrade()
    {
        $this->Log->allowTrades($this->getActivePlayerId());
    }

    function stStartTurn()
    {
        $this->Log->startTurn($this->getActivePlayerId());
        $this->Log->allowTrades($this->getActivePlayerId());
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
            if ($current_auction == 1){ // winner of auction 1 gets first player marker.
                $this->setGameStateValue('first_player', $auction_winner_id);
                $this->notifyAllPlayers("moveFirstPlayer", clienttranslate( '${player_name} recieves ${first}'),array(
                    'player_id'=>$auction_winner_id,
                    'player_name'=>$this->getPlayerName($auction_winner_id),
                    'first'=>'First Player'
                ));
            }
            $this->gamestate->changeActivePlayer( $auction_winner_id );
            $next_state = "auctionWon";
        }    
        $this->gamestate->nextState( $next_state );
    }

    function stResolveBuilding()
    { 
        $active_p_id = $this->getActivePlayerId();
        $bonus = $this->getGameStateValue('building_bonus');
        $b_key = $this->getGameStateValue('last_building');
        $b_name = $this->Building->getBuildingNameFromKey($b_key);
        if ($bonus <3){ 
            if ($bonus == BUILD_BONUS_PAY_LOAN){
                $this->Resource->payLoanOrRecieveSilver($active_p_id, $b_name, 'building', $b_key);
            } else if ($bonus == BUILD_BONUS_TRADE){
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 1, $b_name, 'building', $b_key);
                $this->Log->updateResource($active_p_id, 'trade', 1);
            }
            $this->gamestate->nextState("auction_bonus");
        } else if ($bonus == BUILD_BONUS_RAIL_ADVANCE){
            $this->Resource->getRailAdv($active_p_id, $b_name, 'building', $b_key);
            $this->setGameStateValue('phase', PHASE_BLD_BONUS);
            $this->gamestate->nextState('rail_bonus');
        } else if ($bonus == BUILD_BONUS_TRACK_AND_BUILD) {
            $this->Resource->addTrack($active_p_id, $b_name, 'building', $b_key);
            $this->gamestate->nextState('train_station_build');
        }
        //the other case (BUILD_BONUS_WORKER) waits for player_choice so we don't always want to go to next state
    }

    function stGetAuctionBonus()
    {
        $this->Auction->setupCurrentAuctionBonus();
    }

    //
    function stEndBuildRound() {
        $this->Auction->discardAuctionTile();
        $this->Bid->setBidForPlayer($this->getActivePlayerId(), BID_PASS);
        $auc_no = $this->incGameStateValue( 'current_auction', 1);
        $next_state = "nextBuilding";
        if ($auc_no > $this->getGameStateValue( 'number_auctions' )){
            $next_state = "endRound";
        } 
        $this->gamestate->nextState( $next_state );
    }

    function stEndRound(){
        //clean up for new round.
        $this->incGameStateValue( 'round_number', 1 );
        $this->setGameStateValue( 'current_auction', 1);
        $this->Bid->clearBids();
        $this->gamestate->nextState( "nextAuction" );
    }

    function stEndGameActions(){
        $this->Log->startAllPlayerTurns();
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stUpdateScores(){
        $this->Score->UpdateEndgameScores();
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

    function zombieTurn( $state, $act_p_id )
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
            $this->gamestate->setPlayerNonMultiactive( $act_p_id );
            
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
