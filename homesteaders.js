/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaderstb implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * homesteaders.js
 *
 * homesteaders user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/zone"
],
function (dojo, declare) {

    //===== AUCTIONS =====/
    //== Auction Locations
    var AUCTION_LOC_DECK1   = 1;
    var AUCTION_LOC_DECK2   = 2;
    var AUCTION_LOC_DECK3   = 3;
    var AUCTION_LOC_DISCARD = 4;
    //== Auction Status ==//
    var AUCTION_STATE_FACEDOWN = 0;
    var AUCTION_STATE_FACEUP   = 1;
    //== Auction tiles ==//
    var AUCTION_1_OFFSET = 0;
    var AUCTION_2_OFFSET = 10;
    var AUCTION_3_OFFSET = 20;
    //=== Auction Bid Values ==//
    var BID_VAL_3  = 1;
    var BID_VAL_4  = 2;
    var BID_VAL_5  = 3;
    var BID_VAL_6  = 4;
    var BID_VAL_7  = 5;
    var BID_VAL_9  = 6;
    var BID_VAL_12 = 7;
    var BID_VAL_16 = 8;
    var BID_VAL_21 = 9;
    //===== BUILDING =====//
    var BUILDING_HOMESTEAD  = 1;
    //== Settlement ==//
    var BUILDING_GRAIN_MILL = 2;
    var BUILDING_FARM       = 3;
    var BUILDING_MARKET     = 4;
    var BUILDING_FOUNDRY    = 5;
    var BUILDING_STEEL_MILL = 6;
    //== Settlement and Town ==//
    var BUILDING_BOARDING_HOUSE    = 7;
    var BUILDING_RAILWORKERS_HOUSE = 8;
    var BUILDING_RANCH             = 9;
    var BUILDING_TRADING_POST      = 10;
    var BUILDING_GENERAL_STORE     = 11;
    var BUILDING_GOLD_MINE         = 12;
    var BUILDING_COPPER_MINE       = 13;
    var BUILDING_RIVER_PORT        = 14;
    //== TOWN ==//
    var BUILDING_CHURCH            = 15;
    var BUILDING_WORKSHOP          = 16;
    var BUILDING_DEPOT             = 17;
    var BUILDING_STABLES           = 18;
    var BUILDING_BANK              = 19;
    var BUILDING_MEATPACKING_PLANT = 20;
    var BUILDING_FORGE             = 21;
    var BUILDING_FACTORY           = 22;
    var BUILDING_RODEO             = 23;
    var BUILDING_LAWYER            = 24;
    var BUILDING_FAIRGROUNDS       = 25;
    //== CITY ==//
    var BUILDING_DUDE_RANCH    = 26;
    var BUILDING_TOWN_HALL     = 27;
    var BUILDING_TERMINAL      = 28;
    var BUILDING_RESTARAUNT    = 29;
    var BUILDING_TRAIN_STATION = 30;
    var BUILDING_CIRCUS        = 31;
    var BUILDING_RAIL_YARD     = 32;
    //=== Building Location Mapping ===//
    var BUILDING_LOC_FUTURE   = 0;
    var BUILDING_LOC_OFFER    = 1;
    var BUILDING_LOC_PLAYER   = 2;
    var BUILDING_LOC_DISCARD  = 3;
    //=== Building Stages ===//
    var STAGE_SETTLEMENT = 1;
    var STAGE_SETTLEMENT_TOWN = 2;
    var STAGE_TOWN = 3;
    var STAGE_CITY = 4;
    //=== Building Types ===//
    var TYPE_RESIDENTIAL = 0;
    var TYPE_COMMERCIAL  = 1;
    var TYPE_INDUSTRIAL  = 2;
    var TYPE_SPECIAL     = 3;
    //===== Resources =====//
    var NONE   = 0; // used for buildings with no cost.
    var WOOD   = 1;
    var STEEL  = 2;
    var GOLD   = 3;
    var COPPER = 4;
    var FOOD   = 5;
    var COW    = 6;

    //===== COLORS =====//
    var YELLOW = 1;
    var RED    = 2;
    var BLUE   = 3;
    var GREEN  = 4;


    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        constructor: function(){
            console.log('homesteaderstb constructor');

            // zone control
            this.limbo_zone = new ebg.zone();
            // auction tile zones
            this.auction_zone1 = new ebg.zone();
            this.auction_zone2 = new ebg.zone();
            this.auction_zone3 = new ebg.zone();
            if (playerCount >2) ; // do something with the zone 3.

            // storage for buildings
            

            //player zones
            this.buildings_zone_yellow = new ebg.zone();
            this.buildings_zone_blue   = new ebg.zone();
            this.buildings_zone_red    = new ebg.zone();
            this.buildings_zone_green  = new ebg.zone();
            this.tokens_zone_yellow = new ebg.zone();
            this.tokens_zone_blue   = new ebg.zone();
            this.tokens_zone_red    = new ebg.zone();
            this.tokens_zone_green  = new ebg.zone();
              
            this.buildingTileStocks = [];          // buildings stock indexed by location (no player owned)
            this.playersBuildingStock = [];        // indexed by player id
            this.playersRailroadAdvancements = []; // indexed by player id
            this.auctionStock = [];                // indexed by location

            this.playerCount = 0;
            this.buildingTileCount = 0;
            this.auctionTileCount = 0;
            this.numberOfWorkersSelected = 0;
            this.lastWorkerSelected = "";
            this.canalTileDivId = "";     // Division Id of Canal tile
            this.lastHighlightedBuildingTile = "";
            this.numberOfBidsSelected = 0;
            this.lastHighlightedBidLocation = "";
            this.possibleBids = [];
            this.winningBids = [];
            this.workersCount = 0;
            this.workers = [];
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            
            this.playerCount = 0;
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                
                if (player.color_name == "yellow") {
                    this.tokens_zone_yellow.create ( this, 'token_zone_yellow', 14, 12 );
                    this.tokens_zone_yellow.setPattern( 'grid' );
                    this.buildings_zone_yellow.create (this, 'building_zone_yellow', 500, 550); 
                    this.buildings_zone_yellow.setPattern( 'grid' );
                } else if (player.color_name == "blue") {
                    this.tokens_zone_blue.create ( this, 'token_zone_yellow', 14, 12 );
                    this.tokens_zone_blue.setPattern( 'grid' );
                    this.buildings_zone_blue.create (this, 'building_zone_yellow', 500, 550); 
                    this.buildings_zone_blue.setPattern( 'grid' );
                } else if (player.color_name == "red") {
                    this.tokens_zone_red.create ( this, 'token_zone_yellow', 14, 12 );
                    this.tokens_zone_red.setPattern( 'grid' );
                    this.buildings_zone_red.create (this, 'building_zone_yellow', 500, 550); 
                    this.buildings_zone_red.setPattern( 'grid' );
                } else if (player.color_name == "green") {
                    this.tokens_zone_green.create ( this, 'token_zone_yellow', 14, 12 );
                    this.tokens_zone_green.setPattern( 'grid' );
                    this.buildings_zone_green.create (this, 'building_zone_yellow', 500, 550); 
                    this.buildings_zone_green.setPattern( 'grid' );
                }

                this.auction_zone1.create( this, 'auction1_tile_zone', 112, 174);
                this.auction_zone1.setPattern('diagonal');
                this.auction_zone2.create( this, 'auction2_tile_zone', 112, 174);
                this.auction_zone2.setPattern('diagonal');
                this.auction_zone3.create( this, 'auction3_tile_zone', 112, 174);
                this.auction_zone3.setPattern('diagonal');
                this.limbo_zone.create ( this, 'limbo_zone', 8, 12); 138 + 36
                this.limbo_zone.setPattern ('grid');


                this.playersBuildingStock[player_id] = this.buildTechStock(gamedatas.buildings, 'buildings_'+player_id);
                
                if (gamedatas.firstPlayer == player_id){
                    dojo.removeClass("misc_first_"+player_id, "noshow")
                }

                this.tokenZone[player_id] = "player_token_zone_"+player.color_name;
                
                ++this.playerCount;
            }

            // TODO: Set up your game interface here, according to "gamedatas"
            this.create_building_zones();
 
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        buildBuildingTileStock: function(buildings)
        {
            var stock = new ebg.stock();
            stock.create( this, 20, 98, 144 );
            stock.image_items_per_row = 10;
            stock.setSelectionMode(0);
            stock.setSelectionAppearance('class');

            for(var buildingKey in buildings){
                var building = buildings[buildingKey];
                var imgId = () 
            }

            
        }


        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/homesteaderstb/homesteaderstb/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your homesteaderstb.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
   });             
});
