<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * homesteaders implementation : © Nick Patron <nick.theboot@gmail.com>
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
            "b_order"           => 20,
            "show_player_info"  => SHOW_PLAYER_INFO,
            "rail_no_build"     => RAIL_NO_BUILD,
        ) );
        
        $this->Log      = new HSDLog($this);
        $this->Bid      = new HSDBid($this);
        $this->Building = new HSDBuilding($this);
        $this->Auction  = new HSDAuction($this);
        $this->Resource = new HSDResource($this);
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
        $this->setGameStateInitialValue( 'last_bidder',    0 );
        $this->setGameStateInitialValue( 'players_passed', 0 );
        $this->setGameStateInitialValue( 'auction_bonus',  0 );
        $this->setGameStateInitialValue( 'building_bonus', 0 );
        $this->setGameStateInitialValue( 'last_building',  0 );
        $this->setGameStateInitialValue( 'b_order' ,       0 );
        
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
        $this->Bid->setupBidDB($players);

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
            'auction_info' => $this->auction_info,
            'players' => $this->getCollectionFromDb( "SELECT `player_id` p_id, `player_score` score, `color_name`, `player_name`, `rail_adv`, `use_silver` FROM `player` " ),
            'buildings' => $this->Building->getAllBuildings(),
            'building_info' => $this->building_info,
            'bids' => $this->getCollectionFromDB( "SELECT `player_id` p_id, `bid_loc` FROM `bids`" ),
            'can_undo_trades' => (count($this->Log->getLastTransactions($cur_p_id)) > 0 && $this->checkAction('trade', false)),
            'cancel_move_ids' => $this->Log->getCancelMoveIds(),
            'current_auctions' => $this->Auction->getCurrentRoundAuctions(), 
            'first_player' => $this->getGameStateValue( 'first_player'),
            'number_auctions' => $this->getGameStateValue( 'number_auctions' ),
            'player_order' => $this->getNextPlayerTable(),
            'player_resources' => $this->getObjectFromDb( "SELECT `player_id` p_id, `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '$cur_p_id'" ),
            'resources' => $this->Resource->getResources(),
            'resource_info' => $this->resource_info,
            'round_number' => $this->getGameStateValue( 'round_number' ),
            'show_player_info' => $this->getShowPlayerInfo(),
            'translation_strings' => $this->translation_strings,
            'tracks' => $this->getCollectionFromDb("SELECT `rail_key` r_key, `player_id` p_id FROM `tracks` "),
            'workers' => $this->getCollectionFromDb( "SELECT `worker_key` w_key, `player_id` p_id, `building_key` b_key, `building_slot` b_slot FROM `workers`" ),
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
        $game_progress =  ((int)$this->getGameStateValue('round_number')  -1 ) * 9;
        $number_auctions = (int)$this->getGameStateValue('number_auctions');
        $current_auction = (int)$this->getGameStateValue('current_auction');
        $game_progress += floor(($current_auction * 10) / $number_auctions);
        return $game_progress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getPlayerName($p_id){
        return (string)($this->loadPlayersBasicInfos()[$p_id]['player_name']);
    }

    function getPlayerColorName($p_id){
        return (string)$this->getUniqueValueFromDB( "SELECT `color_name` FROM `player` WHERE `player_id`=$p_id" );
    }

    function getShowPlayerInfo(){
        if ($this->getGameStateValue('round_number') == 11){
            return true;
        }
        return ($this->getGameStateValue( 'show_player_info' ) == 0);
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
    
    public function playerTrade( $tradeAction_csv, $notActive =false )
    {
        // allow out of turn trade, only when flag is passed during allocateWorkers State.
        if (!($notActive && $this->gamestate->state()['name'] === "allocateWorkers")){
            $this->checkAction( 'trade' );
        }
        $p_id = $this->getCurrentPlayerId();
        $tradeAction_arr = explode(',', $tradeAction_csv);
        foreach( $tradeAction_arr as $key=>$val ){
            $tradeAction = $this->trade_map[$val];
            $this->Resource->trade($p_id, $tradeAction);
        }
    }

    /***  place workers phase ***/
    public function playerHireWorker(){
        $this->checkAction( 'hireWorker' );
        $cur_p_id = $this->getCurrentPlayerId();
        $worker_cost = array('trade'=>1,'food'=>1);
        if (!$this->Resource->canPlayerAfford($cur_p_id, $worker_cost))
            throw new BgaUserException( clienttranslate("You cannot afford to hire a worker"));
        $this->Resource->updateAndNotifyPaymentGroup($cur_p_id, $worker_cost, clienttranslate('Hire Worker'));
        $this->Resource->addWorkerAndNotify($cur_p_id, 'hire');
    }

    public function playerSelectWorkerDestination($w_key, $b_key, $building_slot) 
    {
        $this->checkAction( "placeWorker" );
        $cur_p_id = $this->getCurrentPlayerId();
        $w_owner = $this->getUniqueValueFromDB("SELECT `player_id` FROM `workers` WHERE `worker_key`='$w_key'");
        if ($w_owner != $cur_p_id){ throw new BgaUserException(clienttranslate("The selected worker is not your worker"));}
        $this->notifyAllPlayers( "workerMoved", "", array(
            'i18n' => array( 'building_name' ),
            'player_id' => $cur_p_id,
            'worker_key' => $w_key,
            'building_key' => $b_key,
            'building_slot' => $building_slot,
        ) );
        $sql = "UPDATE `workers` SET `building_key`= '".$b_key."', `building_slot`='".$building_slot."' WHERE `worker_key`='".$w_key."'";
        $this->DbQuery( $sql );
    }

    public function playerDonePlacingWorkers (){
        $this->checkAction('placeWorker');
        $p_id = $this->getCurrentPlayerId();
        $this->Log->donePlacing($p_id);
        $this->Resource->collectIncome($p_id);
        $this->gamestate->setPlayerNonMultiactive( $p_id , 'auction' );
    }

    /*** Player Bid Phase ***/
    public function playerConfirmDummyBid($bid_location){
        $this->checkAction('dummy');
        $this->Bid->confirmDummyBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerConfirmBid($bid_location){
        $this->checkAction( "confirmBid" );
        $this->Bid->confirmBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerPassBid(){
        $this->checkAction( "pass" );
        $this->Bid->passBid();
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
        $this->Score->updatePlayerScore($act_p_id);
        $this->gamestate->nextState ($next_state);
    }

    public function playerDoNotBuild () {
        $this->checkAction( "doNotBuild" );
        //goto next state;
        $this->gamestate->nextState( "auction_bonus" ); 
    }

    public function playerPay($gold) {
        $state = $this->gamestate->state();
        if ($state['name'] === 'payWorkers'){
            $this->payWorkers($gold);
        } else if ($state['name'] === 'allocateWorkers'){ 
            $this->payWorkers($gold, true);
        } else if ($state['name'] === 'payAuction') {
            $this->payAuction($gold);
        } else {
            throw new BgaVisibleSystemException ( clienttranslate("player pay called from wrong state") );
        }
    }

    /**
     * used for playerPay to handle pay workers.
     * it will check if player has already paid, 
     * then if not it will deduct the cost from them, 
     * then it will either 
     * - set them nonMultiactive (pay_workers state)
     * - or update the client, so the pay button will be hidden.
     *  (setPaid will prevent it from being shown on refresh)
     * @var gold  represents amount of gold player wishes to use to pay (may be 0)
     * @var early represents if this is being called while still in allocate workers state (as flow is different)
     */
    public function payWorkers($gold, $early=false) {
        $checkResult = $this->checkAction( "done", !$early);
        if (!$checkResult){
            $this->gamestate->checkPossibleAction("done"); // make sure state does have "done", even if not active.
        }
        if ($gold <0){ 
            throw new BgaUserException ( clienttranslate("cannot have negative gold value"));
        }
        $cur_p_id = $this->getCurrentPlayerId();
        if ($this->Resource->getPaid($cur_p_id) == 0){ // to prevent charging twice.
            $this->Resource->setPaid($cur_p_id);
            $workers = $this->Resource->getPlayerResourceAmount($cur_p_id,'workers');
            $cost = max($workers - (5*$gold), 0);
            $this->Resource->pay($cur_p_id, $cost, $gold, "worker");
        }
        if (!$early){
            $this->gamestate->setPlayerNonMultiactive($cur_p_id, "auction" );
        } else {
            $this->notifyPlayer($cur_p_id, 'workerPaid', "", array());
        }
    }
    
    /** used for playerPay */
    public function payAuction($gold) {
        $this->checkAction( "done" );
        $act_p_id = $this->getActivePlayerId();
        if ($gold <0){ 
            throw new BgaUserException ( clienttranslate("cannot have negative gold value"));
        }
        
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->pay($act_p_id, $bid_cost, $gold, sprintf(clienttranslate("Auction %s"), $auc_no), $auc_no);
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
            throw new BgaUserException( clienttranslate("invalid bonus option selected") );
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
        $this->Resource->addWorkerAndNotify($act_p_id, $b_name, 'building', $b_key);
        $this->gamestate->nextState( 'auction_bonus' );
    }

    public function playerPassBuildingBonus () 
    {
        $this->checkAction( "buildBonus" );
        $this->gamestate->nextState( 'auction_bonus' );
    }

    /**** Auction Bonus actions ******/
    public function playerFreeHireWorkerAuction ( ) 
    {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $auction_bonus = $this->getGameStateValue( 'auction_bonus');
        $auc_no = $this->getGameStateValue( 'current_auction');
        if ($auction_bonus == AUC_BONUS_WORKER) {
            $this->Resource->addWorkerAndNotify($act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no);
            $this->gamestate->nextState( 'done' );
        } else if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV){
            $this->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $this->Resource->addWorkerAndNotify($act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no);
            $this->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $this->gamestate->nextState( 'railBonus' );
        } else {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("Free Hire Worker called, but auction bonus is %s"),$auction_bonus) );
        }
    }

    public function playerTypeForType ($tradeAway, $tradeFor){
        $this->checkAction( "auctionBonus");
        $act_p_id = $this->getActivePlayerId();
        $tradeAwayType = $this->resource_map[$tradeAway];
        if (!$this->Resource->canPlayerAfford($act_p_id, array($tradeAwayType=> 1))) {
            throw new BgaUserException( sprintf(clienttranslate("You need a %s to take this action"),"<div class='log_${tradeAwayType} token_inline'></div>") );
        }
        $tradeForType = 'track'; // default is currently track.
        if ($tradeFor == VP){ // determine if vp2 or vp4.
            if ($tradeAway == FOOD) $tradeForType = 'vp2';
            else $tradeForType = 'vp4';
        }
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->specialTrade($act_p_id, array($tradeAwayType=>1), array($tradeForType=>1), sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no);
        
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
            $this->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $next_state = 'railBonus';
        }
        $this->gamestate->nextState( $next_state );
    }

    public function playerActionCancelAllocateWorkers() {
        $this->gamestate->checkPossibleAction('actionCancel');
        $p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive(array ($p_id), 'error', false);
        $this->Log->cancelWorkerIncomePhase($p_id);
        $this->Resource->setIncomePaid($p_id, 0);
        $this->Resource->setPaid($p_id, 0);
    }

    public function playerActionCancelEndgame() {
        $this->gamestate->checkPossibleAction('actionCancel');
        $p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive(array ($p_id), 'error', false);
    }

    public function playerCancelBidPass () {
        $this->checkAction('undo');
        $this->Bid->cancelPass();
        $this->Log->cancelPass();
        $this->gamestate->nextState('undoPass');
    }

    /*
     * restartTurn: called when a player decide to go back at the beginning of the player build phase
     */
    public function playerCancelPhase () {
        $this->checkAction('undo');
        // undo all actions since beginning of STATE_PAY_AUCTION
        $this->Log->cancelPhase();
        $this->gamestate->nextState('undoTurn');
    }
        
    public function playerCancelTransactions()
    {
        $this->checkAction('trade');

        $p_id = $this->getCurrentPlayerId();
        $transactions = $this->Log->getLastTransactions($p_id);
        if (is_null($transactions)) {
            throw new BgaUserException(clienttranslate("You have nothing to cancel"));
        }

        // Undo the turn
        $this->Log->cancelTransactions($p_id);
    }

    /** endBuildRound */
    public function playerConfirmChoices (){
        $this->checkAction('done');
        $this->Bid->clearBidForPlayer($this->getActivePlayerId());
        $this->gamestate->nextState( 'done' );
    }

    // endGameActions Actions
    public function playerPayLoan($gold) {
        $this->checkAction('payLoan');
        $cur_p_id = $this->getCurrentPlayerId();    
        $this->Resource->payOffLoan($cur_p_id, $gold);
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
        $args = $this->getCollectionFromDB("SELECT `player_id`, `workers` FROM `resources`");
        $paid = $this->getCollectionFromDB("SELECT `player_id`, `paid` has_paid FROM `resources`");
        return array('args'=>$args, 'paid'=>$paid);
    }

    function argDummyValidBids() {
        $dummy_bids = $this->Bid->getDummyBidOptions();
        return array('valid_bids'=>$dummy_bids);
    }

    function argValidBids() {
        $valid_bids = $this->Bid->getValidBids($this->getActivePlayerId());
        return array("valid_bids"=>$valid_bids );
    }

    function argRailBonus() {
        $rail_options= $this->Resource->getRailAdvBonusOptions($this->getActivePlayerId());
        $can_undo = ($this->getGameStateValue('phase') == PHASE_BID_PASS);
        return array("rail_options"=>$rail_options, "can_undo"=>$can_undo);
    }

    function argAuctionCost() {
        $bid_cost = $this->Bid->getBidCost($this->getActivePlayerId());
        return array("auction_cost"=>$bid_cost);
    }

    function argAllowedBuildings() {
        $build_type_options = $this->Auction->getCurrentAuctionBuildTypeOptions();
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($this->getActivePlayerId(), BLD_RIVER_PORT);
        return(array("allowed_buildings"=> $buildings,
                    "riverPort"=>$ownsRiverPort,));
    }

    function argTrainStationBuildings() {
        $build_type_options = array(TYPE_RESIDENTIAL,TYPE_COMMERCIAL,TYPE_INDUSTRIAL,TYPE_SPECIAL);// all
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($this->getActivePlayerId(), BLD_RIVER_PORT);    
        return(array("allowed_buildings"=> $buildings,
                    "riverPort"=>$ownsRiverPort,));
    }

    function argBuildingBonus() {
        $building_bonus =$this->getGameStateValue('building_bonus');
        return (array("building_bonus" => $building_bonus));
    }

    function argBonusOption() {
        $auction_bonus = $this->getGameStateValue( 'auction_bonus');
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($this->getActivePlayerId(), BLD_RIVER_PORT);    
        return (array("auction_bonus"=> $auction_bonus, 
                      "riverPort" => $ownsRiverPort));
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    function stStartRound() {
        $round_number = $this->getGameStateValue('round_number');
        $this->Resource->clearPaid();
        $this->Resource->clearIncomePaid();
        $this->Building->updateBuildingsForRound($round_number);
        $this->gamestate->nextState( );
    }

    function stPlaceWorkers() {
        $this->Log->allowTradesAllPlayers(); // this will also add extra player time.
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stPayWorkers() 
    {
        $resources = $this->getCollectionFromDB( "SELECT `player_id`, `workers`, `gold`, `silver`, `trade`, `paid` FROM `resources` " );
        $pendingPlayers = array();
        foreach($resources as $p_id => $player){
            if ($this->Resource->getPaid($p_id)) continue;
            if ($player['silver'] >= $player['workers'] && $player['gold'] == 0 && $player['trade'] == 0){
                $this->Resource->updateAndNotifyPayment($p_id, 'silver', $player['workers'], 'worker');
            } else { // ask this player to choose payment.
                $pendingPlayers[] = $p_id;
                $this->giveExtraTime($p_id);
            }
        }
        $next_state = "auction";
        if (count($pendingPlayers) == 0){
            $this->gamestate->nextState($next_state);
        } else {
            $this->gamestate->setPlayersMultiactive($pendingPlayers, $next_state);
        }
    }
    
    function stBeginAuction() {
        $round_number = $this->getGameStateValue('round_number');
        if ($round_number == 11){
            $this->gamestate->nextState( 'endGame');
        } else {
            $this->Bid->clearBids( );
            $first_player = $this->getGameStateValue('first_player');
            $this->gamestate->changeActivePlayer( $first_player );
            if ($this->getPlayersNumber() == 2){
                $this->gamestate->nextState( '2p_auction' );
            } else {
                $this->gamestate->nextState( 'auction' );
            }
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
            $this->giveExtraTime( $act_p_id );
        } else { // if not, let next player bid
            $next_state = "skipPlayer";
        }
        $this->gamestate->nextState( $next_state );
    }

    /**
     * for states where no backend actions are req, but want to add savepoint to log for undo transactions.
     */
    function stSetupTrade()
    {
        $this->Log->allowTrades($this->getActivePlayerId());
    }

    function stWinAuction()
    {
        
    }

    function stBuildingPhase()
    {
        $next_state = "";
        $auction_winner_id = $this->Bid->getWinnerOfAuction();
        // determine winner of this auction
        $current_auction = $this->getGameStateValue( 'current_auction' );
        
        if ($auction_winner_id == 0) {
            $next_state = "auctionPassed";
            $this->incStat(1, 'passed');
            if ($current_auction == 1 && $this->getPlayersNumber() == 2){
                $first_p_id = $this->getPlayerAfter($this->getGameStateValue('first_player'));
                $this->setGameStateValue('first_player',$first_p_id);
                $this->notifyAllPlayers("moveFirstPlayer", clienttranslate('${player_name} recieves ${first}'),array(
                    'player_id'=>$first_p_id,
                    'player_name'=>$this->getPlayerName($first_p_id),
                    'first'=>clienttranslate('First Player')));
            }
            $this->Bid->clearBidForPlayer($auction_winner_id);// for dummy bid case.
        } else {
            if ($current_auction == 1){ // winner of auction 1 gets first player marker.
                $this->setGameStateValue('first_player', $auction_winner_id);
                $this->notifyAllPlayers("moveFirstPlayer", clienttranslate('${player_name} recieves ${first}'),array(
                    'player_id'=>$auction_winner_id,
                    'player_name'=>$this->getPlayerName($auction_winner_id),
                    'first'=>clienttranslate('First Player'),
                ));
            }
            $bid_cost = $this->Bid->getBidCost($auction_winner_id);
            $this->Log->winAuction($auction_winner_id, $current_auction, $bid_cost);
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
        switch($bonus){
            case BUILD_BONUS_TRADE_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 2, $b_name, 'building', $b_key);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_PAY_LOAN:
                $this->Resource->payLoanOrRecieveSilver($active_p_id, $b_name, 'building', $b_key);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 1, $b_name, 'building', $b_key);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_RAIL_ADVANCE:
                $this->Resource->getRailAdv($active_p_id, $b_name, 'building', $b_key);
                $this->setGameStateValue('phase', PHASE_BLD_BONUS);
                $this->gamestate->nextState('rail_bonus');
            break;
            case BUILD_BONUS_TRACK_AND_BUILD:
                $this->Resource->addTrackAndNotify($active_p_id, $b_name, 'building', $b_key);
                $this->gamestate->nextState('train_station_build');
            break;
            case BUILD_BONUS_WORKER:
                //the other case (BUILD_BONUS_WORKER) waits for player_choice so we don't want to go to next state
            break;
        }
    }

    function stGetAuctionBonus()
    {
        $this->Auction->setupCurrentAuctionBonus();
    }

    //
    function stEndBuildRound() {
        $this->Auction->discardAuctionTile();
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
        $this->Log->allowTradesAllPlayers(); 
        // ^ gives all players reflection time.
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stUpdateScores(){
        $this->Score->updateEndgameScores();
        $this->gamestate->nextState('');
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
                case 'dummyPlayerBid':
                    $this->Bid->zombieDummyPass();
                    $this->gamestate->nextState("nextBid");
                break;
                case 'playerBid':
                    $this->Bid->zombiePass($act_p_id);
                    $this->gamestate->nextState("nextBid");
                break;
                case 'getRailBonus':
                    $phase = $this->getGameStateValue( 'phase' );
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
                    $this->gamestate->nextState( $next_state);
                break;
                case 'payAuction':
                case 'chooseBuildingToBuild':
                case 'resolveBuilding':
                case 'trainStationBuild':
                case 'bonusChoice':
                case 'confirmActions':
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }
            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $act_p_id , '');
            
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
        
        if ( $from_version <= 2102040920 ){
            $result = self::getUniqueValueFromDB("SHOW COLUMNS FROM `buildings` LIKE 'b_order'");
            if(is_null($result)){
                self::DbQuery("ALTER TABLE buildings ADD b_order INT(3) UNSIGNED NOT NULL DEFAULT '0';");
            }
            $result = self::getUniqueValueFromDB("SHOW COLUMNS FROM `resources` LIKE 'paid'");
            if(is_null($result)){
                self::DbQuery("ALTER TABLE resources ADD paid INT(1) UNSIGNED NOT NULL DEFAULT '0';");
            }
            $result = self::getCollectionFromDB("SELECT global_id, global_value FROM `global` WHERE global_id='20'");
            if(count($result)==0){
                self::DbQuery( "INSERT INTO global (global_id, global_value) VALUES ('20','0');");
            }
            self::DbQuery("UPDATE `player` SET `use_silver`='0'");
        }
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


  /*
   * loadBug: in studio, type loadBug(20762) into the table chat to load a bug report from production
   * client side JavaScript will fetch each URL below in sequence, then refresh the page
   */
  public function loadBug($reportId)
  {
    $db = explode('_', self::getUniqueValueFromDB("SELECT SUBSTRING_INDEX(DATABASE(), '_', -2)"));
    $game = $db[0];
    $tableId = $db[1];
    self::notifyAllPlayers('loadBug', "Trying to load <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a>", [
      'urls' => [
        // Emulates "load bug report" in control panel
        "https://studio.boardgamearena.com/admin/studio/getSavedGameStateFromProduction.html?game=$game&report_id=$reportId&table_id=$tableId",
        
        // Emulates "load 1" at this table
        "https://studio.boardgamearena.com/table/table/loadSaveState.html?table=$tableId&state=1",
        
        // Calls the function below to update SQL
        "https://studio.boardgamearena.com/1/$game/$game/loadBugSQL.html?table=$tableId&report_id=$reportId",
        
        // Emulates "clear PHP cache" in control panel
        // Needed at the end because BGA is caching player info
        "https://studio.boardgamearena.com/admin/studio/clearGameserverPhpCache.html?game=$game",
      ]
    ]);
  }
  
  /*
   * loadBugSQL: in studio, this is one of the URLs triggered by loadBug() above
   */
  public function loadBugSQL($reportId)
  {
    $studioPlayer = self::getCurrentPlayerId();
    $players = self::getObjectListFromDb("SELECT player_id FROM player", true);
  
    // Change for your game
    // We are setting the current state to match the start of a player's turn if it's already game over
    $sql = [
      "UPDATE global SET global_value=20 WHERE global_id=1 AND global_value=99",
      "ALTER TABLE `gamelog` ADD `cancel` TINYINT(1) NOT NULL DEFAULT 0;"
    ];
    foreach ($players as $pId) {
      // All games can keep this SQL
      $sql[] = "UPDATE player SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE global SET global_value=$studioPlayer WHERE global_value=$pId";
      $sql[] = "UPDATE stats SET stats_player_id=$studioPlayer WHERE stats_player_id=$pId";
  
      // Add game-specific SQL update the tables for your game
      $sql[] = "UPDATE resources SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE buildings SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE tracks SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE workers SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE bids SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE log SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE log SET action_arg=REPLACE(action_arg, $pId, $studioPlayer)";
      $sql[] = "UPDATE gamelog SET gamelog_current_player=$studioPlayer WHERE gamelog_current_player = $pId";
  
      // This could be improved, it assumes you had sequential studio accounts before loading
      // e.g., quietmint0, quietmint1, quietmint2, etc. are at the table
      $studioPlayer++;
    }
    
    $msg = "<b>Loaded <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a></b><hr><ul><li>" . implode(';</li><li>', $sql) . ';</li></ul>';
    self::warn($msg);
    self::notifyAllPlayers('message', $msg, []);
  
    foreach ($sql as $q) {
      self::DbQuery($q);
    }
    self::reloadPlayersBasicInfos();
  }

}
