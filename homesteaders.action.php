<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Homesteaders implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * homesteaders.action.php
 *
 * Homesteaders main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/homesteaders/homesteaders/myAction.html", ...)
 *
 */
  
  
class action_homesteaders extends APP_GameAction
{ 
  // Constructor: please do not modify
  public function __default()
  {
      if( self::isArg( 'notifwindow') )
      {
          $this->view = "common_notifwindow";
          $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
      }
      else
      {
          $this->view = "homesteaders_homesteaders";
          self::trace( "Complete reinitialization of board game" );
    }
  } 
  // common actions
  public function takeLoan () {
    self::setAjaxMode( );
    $this->game->playerTakeLoan ();
    self::ajaxResponse( );
  }

  public function trade(){
    self::setAjaxMode( );
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $allowTrade = self::getArg( "allowTrade", AT_bool, false);
    $this->game->playerTrade($trade_action, $allowTrade);
    self::ajaxResponse( );
  }

  public function undoTransactions(){
    self::setAjaxMode( );
    $this->game->playerCancelTransactions();
    self::ajaxResponse( );
  }

  // pay workers
  public function donePay() {
    self::setAjaxMode( );
    $gold = self::getArg( "gold", AT_posint, true);
    $this->game->playerPay($gold);
    self::ajaxResponse( );
  }

  public function cancelTurn() {
    self::setAjaxMode( );
    $this->game->playerCancelPhase();
    self::ajaxResponse( );
  }

  public function confirmChoices() {
    self::setAjaxMode( );
    $this->game->playerConfirmChoices();
    self::ajaxResponse( );
  }

  // place worker actions
  public function donePlacingWorkers() {
    self::setAjaxMode( );
    $this->game->playerDonePlacingWorkers( );
    self::ajaxResponse( );
  }

  public function hireWorker() {
    self::setAjaxMode( );
    $this->game->playerHireWorker();
    self::ajaxResponse( );
  }

  public function selectWorkerDestination() {
    self::setAjaxMode( );
    $worker_key = self::getArg( "worker_key", AT_posint, true);
    $building_key = self::getArg( "building_key", AT_posint, true); 
    $building_slot = self::getArg( "building_slot", AT_posint, true);
    $this->game->playerSelectWorkerDestination( $worker_key, $building_key, $building_slot );
    self::ajaxResponse( );
  }

  // bid actions
  public function confirmBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->playerConfirmBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function confirmDummyBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->playerConfirmDummyBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function passBid (){
    self::setAjaxMode( );
    $this->game->playerPassBid( );
    self::ajaxResponse( );
  }
  
  // DONE actions
  public function doNotBuild() {
    self::setAjaxMode( );
    $this->game->playerDoNotBuild( );
    self::ajaxResponse( );
   }

  public function buildBuilding(){
    self::setAjaxMode( );
    $building_key = self::getArg( "building_key", AT_posint, true);
    $goldAsCow = self::getArg( "goldAsCow", AT_bool, true);
    $goldAsCopper = self::getArg( "goldAsCopper", AT_bool, true);
    
    $this->game->playerBuildBuilding( $building_key, $goldAsCow, $goldAsCopper );
    self::ajaxResponse( );
  }
  
  public function doneSelectingBonus (){
    self::setAjaxMode();
    $bonus = self::getArg( "bonus", AT_posint, true);
    $this->game->playerSelectRailBonus( $bonus );
    self::ajaxResponse( );
  }

  public function passBuildingBonus() {
    self::setAjaxMode( );
    $this->game->playerPassBuildingBonus( );
    self::ajaxResponse( );
  }

  public function freeHireWorkerAuction (){
    self::setAjaxMode( );
    $this->game->playerFreeHireWorkerAuction();
    self::ajaxResponse( );
  }

  public function freeHireWorkerBuilding (){
    self::setAjaxMode( );
    $this->game->playerFreeHireWorkerBuilding();
    self::ajaxResponse( );
  }

  public function bonusTypeForType (){
    self::setAjaxMode( );
    $tradeAway = self::getArg( "tradeAway", AT_int, true);
    $tradeFor = self::getArg( "tradeFor", AT_int, true);
    $this->game->playerTypeForType($tradeAway, $tradeFor);
    self::ajaxResponse( );
  }

  public function passAuctionBonus (){
    self::setAjaxMode( );
    $this->game->playerPassAuctionBonus( );
    self::ajaxResponse( );
  }

  public function payLoan(){
    self::setAjaxMode( );
    $gold = self::getArg( 'gold', AT_bool, true);
    $this->game->playerPayLoan( $gold);
    self::ajaxResponse( );
  }

  public function doneEndgameActions(){
    self::setAjaxMode( );
    $this->game->playerDoneEndgame();
    self::ajaxResponse( );
  }

  public function toggleCheckbox(){
    self::setAjaxMode( );
    $checked = self::getArg( 'checked', AT_bool, true);
    $this->game->playerToggleCheckbox($checked);
    self::ajaxResponse( );
  }

}