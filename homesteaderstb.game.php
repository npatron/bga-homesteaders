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
  * homesteaderstb.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class homesteaderstb extends Table
{
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
            "round_number" => 10,
            "selected_worker" => 11,
            "building_selected" => 12,
            "bid_selected" => 13,
            "phase" => 14,
        ) );        

//        $this->buildings = self::getNew("module.common.building")
//        $this->buildings = init( "building" );
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
        $sql = "INSERT INTO player (player_id, player_color, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$start_points','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'round_number', 0 );
        self::setGameStateInitialValue( 'selected_worker', 0 );
        self::setGameStateInitialValue( 'building_selected', 0 );
        self::setGameStateInitialValue( 'bid_selected', 0 );
        self::setGameStateInitialValue( 'phase', 0 );
        
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


        // TODO: setup the initial game situation here
        // create building Tiles (in sql)
        $sql = "INSERT INTO buildings (building_name, building_type, building_stage, building_location) VALUES ";
        $values=array();
        // homestead
        for($i = 1; $i <count($players); $i++) {
            $values[] = "('Homestead','r', '1', '$i')";
        }
        // for 2 player remove all duplicates except farm market, and foundry
        for($i = 0; $i <count($players) && $i <3; $i++) {
            $values[] = "('Farm','r', '1', '0')";
            $values[] = "('Foundry','i', '1', '0')";
            $values[] = "('Market','c', '1', '0')";
        }
        //has 2 copies in 3-4 player
        for($i = 1; $i <count($players) && $i <3; $i++) {
            $values[] = "('Ranch','r', '2', '0')";
            $values[] = "('General Store','c', '2', '0')";
            $values[] = "('Gold Mine','i', '2', '0')";
            $values[] = "('Copper Mine','i', '2', '0')";
            $values[] = "('River Port','i', '2', '0')";

            $values[] = "('Workshop','r', '3', '0')";
            $values[] = "('Depot','c', '3', '0')";
            $values[] = "('Forge','i', '3', '0')";

            $values[] = "('Dude Ranch','r', '4', '0')";
            $values[] = "('Restaraunt','c', '4', '0')";
            $values[] = "('Terminal','c', '4', '0')";
            $values[] = "('Train Station','i', '4', '0')";
        }
        $values[] = "('Grain Mill','c','1', '0')";
        $values[] = "('Steel Mill','i','1', '0')";
        $values[] = "('Boarding House','r','2', '0')";
        $values[] = "('Railworkers House','r','2', '0')";
        $values[] = "('Grain Mill','c','2', '0')";

        $values[] = "('Church','r','3', '0')";
        $values[] = "('Bank','c','3', '0')";
        $values[] = "('Stables','c','3', '0')";
        $values[] = "('Meatpacking Plant','i','3', '0')";
        $values[] = "('Rodeo','s','3', '0')";
        $values[] = "('Factory','s','3', '0')";
        $values[] = "('Fairgrounds','s','3', '0')";
        $values[] = "('Lawyer','s','3', '0')";

        $values[] = "('Town Hall','r','4', '0')";
        $values[] = "('Circus','s','4', '0')";
        $values[] = "('Rail Yard','s','4', '0')";
        
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );

        $sql = "INSERT INTO auction_one ( token_order, token_state ) VALUES ";
        $values=array();
        for ($i = 0; $i <10; $i++){
            $values[] = "('$i','1')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );

        $sql = "INSERT INTO auction_two (token_order, token_state) VALUES ";
        $values=array();
        $order1 = array("0","1","2","3");
        $order2 = array("4","5","6","7");
        $order3 = array("8","9");
        shuffle($order1);
        shuffle($order2);
        shuffle($order3);
        for ($i = 0; $i <4; $i++){
            $values[] = "(".$order1[$i]."', '0')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "('".$order2[$i]."','0')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "('".$order3[$i]."','0')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );

        $sql = "INSERT INTO auction_three (token_order, token_state) VALUES ";
        $values=array();
        shuffle($order1);
        shuffle($order2);
        shuffle($order3);
        for ($i = 0; $i <4; $i++){
            $values[] = "(1,'".$order1[$i]."','0')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "(2,'".$order2[$i]."','0')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "(3,'".$order3[$i]."','0')";
        }        
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

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
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
  
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
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in homesteaderstb.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    
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
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_START_ROUND );
    }    

    function stPlaceWorkers()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_INCOME );
    }

    function stCollectIncome()
    {
        // collect income
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_PAY_WORKERS );
    }

    function stPayWorkers()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_AUCTION );
    }

    function stNextBid()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_PLAYER_BID );
    }

    function stBuildingPhase()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_BEGIN_BUILDING );
    }

    function stBuild()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_RESOLVE_BUILDING );
    }

    function stGetBonus()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_CHOOSE_BONUS );
    }

    function stChooseBonus()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_NEXT_BUILDING );
    }

    function stEndRound()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( STATE_END_GAME );
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
