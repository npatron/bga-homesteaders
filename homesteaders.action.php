<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Homesteaders implementation : © <Your name here> <Your email address here>
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

    public function takeLoan () {
      self::setAjaxMode( );
      $this->game->playerTakeLoan ();
      self::ajaxResponse( );
    }

    public function donePayingWorkers() {
      self::setAjaxMode( );
      $this->game->playerDonePlacingWorkers();
      self::ajaxResponse( );
    }

    public function hireWorker() {
      self::setAjaxMode( );
      $this->game->playerHireWorker();
      self::ajaxResponse( );
    }

    public function selectWorkerDestination( ) {
      self::setAjaxMode();
      $building_key = self::getArg('building_key', AT_alphanum, true);
      $building_slot = self::getArg('building_slot', AT_alphanum, true, null);
      $this->game->selectWorkerDestination( $worker_key, $place_id, $choices );
      self::ajaxResponse( );
   }

   public function doNotBuild() {
      self::setAjaxMode( );
      $this->game->playerDoNotBuild( );
      self::ajaxResponse( );
   }

  public function donePlacingWorkers() {
    self::setAjaxMode( );
    $this->game->playerDonePlacingWorkers( );
    self::ajaxResponse( );
 }

   /*public function donePlacingWorker()
   {
       self::setAjaxMode();     

       // Retrieve argument (key of order card to discard)
       $orderCardKey = self::getArg( "orderCard", AT_posint, true );

       // Perform the discard
       $this->game->discardOrderCard( $orderCardKey );

       self::ajaxResponse( );
   }*/
  	
  	// TODO: defines your action entry points there



  }
  

