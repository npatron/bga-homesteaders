/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaders implementation : © Nick Patron <nick.theboot@gmail.com>
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
    "ebg/zone",
    "ebg/stock"
],
function (dojo, declare) {

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        constructor: function(){
            console.log('homesteaders constructor');

            // zone control
            this.token_stock = new ebg.stock();
            // auction tile zones
            this.tile_height = 175;
            this.tile_width = 105;
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_zone_height = 36;
            this.bid_zone_width = 36;
            this.bid_vals = [3,4,5,6,7,9,12,16,21];
            // auction bid zones
            this.bid_zonesA1_B = []; 
            this.bid_zonesA2_B = []; 
            this.bid_zonesA3_B = []; 
            for (var i =0; i < this.bid_vals.length; i++){
                this.bid_zonesA1_B[i] = new ebg.zone();
                this.bid_zonesA2_B[i] = new ebg.zone();
                this.bid_zonesA3_B[i] = new ebg.zone();
            }
            
            this.auction_stock_1 = new ebg.stock();
            this.auction_stock_2 = new ebg.stock();
            this.auction_stock_3 = new ebg.stock();
           
            // storage for buildings
            this.main_building_stock = new ebg.stock();
            
            this.player_number = [];
            this.player_token_order = [];
            //player zones
            this.player_color = []; // indexed by player id
            this.player_token_stock = []; 
            this.player_building_stock = [];

            this.players_railroad_advancements = [];   // indexed by player id

            this.tile_width = 144;
            this.tile_height = 196;
            
            this.player_count = 0;
            this.building_tile_count = 0;
            this.auction_tile_count = 0;
            this.number_of_workers_selected = 0;
            this.last_worker_selected = "";
            this.canal_tile_div_id = "";     // Division Id of Canal tile
            this.lastHighlightedBuildingTile = "";
            this.numberOfBidsSelected = 0;
            this.lastHighlightedBidLocation = "";
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

            this.token_stock.create ( this, $('limbo') , 30, 30 );
            this.token_stock.image_items_per_row = 10;

            this.playerCount = 0;
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                ++this.playerCount;
                var player = gamedatas.players[player_id];
                
                var current_player_color = player.color_name;
                dojo.removeClass("player_zone_"+current_player_color.toString(), "noshow");
                if (current_player_color === 'blue'){
                    this.player_token_order[player_id] = 0;
                } else if (current_player_color === 'green'){
                    this.player_token_order[player_id] = 1;
                } else if (current_player_color === 'yellow'){
                    this.player_token_order[player_id] = 7;
                } else if (current_player_color === 'red'){
                    this.player_token_order[player_id] = 6;
                }
                this.token_stock.addItemType(player_id, current_player_color , g_gamethemeurl+'img/30_30_tokens.png', this.player_token_order[player_id]);
                this.token_stock.addToStock(player_id);
                
                this.player_number[player_id] = this.playerCount;
                this.player_color[player_id] = current_player_color;

                this.player_token_stock[player_id] = new ebg.stock();
                this.player_token_stock[player_id].create ( this, $('token_zone_' + this.player_color[player_id].toString()) , 48, 48 );
                this.player_token_stock[player_id].image_items_per_row = 6;
                this.player_building_stock[player_id] = new ebg.stock();
                this.player_building_stock[player_id].create (this, $('building_zone_'+ this.player_color[player_id].toString()), this.tile_width, this.tile_height); 
                this.player_building_stock[player_id].image_items_per_row = 9;
                
                if (gamedatas.firstPlayer == player_id){
                    dojo.removeClass("first_player_tile_"+player_id, "noshow");
                }
                
            }

            // Auctions: 
            this.auction_stock_1.create( this,$("auction1_tile_zone"), this.tile_width, this.tile_height);
            this.auction_stock_1.image_items_per_row = 10;
            this.auction_stock_2.create( this,$("auction2_tile_zone"), this.tile_width, this.tile_height);
            this.auction_stock_2.image_items_per_row = 10;
            var auctionCount = 2;
            if (gamedatas.auctions.len > 20){
                auctionCount = 3;
                this.auction_stock_3.create( this,$("auction3_tile_zone"), this.tile_width, this.tile_height);
                this.auction_stock_3.image_items_per_row = 10;
            }

            for( var auction_id in gamedatas.auctions){
                var auction = gamedatas.auctions[auction_id];
                if(auction_id <10){
                    this.auction_stock_1.addItemType( auction.auction_id, auction.position, g_gamethemeurl+'img/auctionTiles_144x196.png', auction.auction_id -1);
                    if (auction.position == gamedatas.round_number){
                        this.auction_stock_1.addToStock ( auction.auction_id);
                    }
                } else if (auction_id < 20){
                    this.auction_stock_2.addItemType( auction.auction_id, auction.position, g_gamethemeurl+'img/auctionTiles_144x196.png', auction.auction_id - 1);
                    if (auction.position == gamedatas.round_number){
                        this.auction_stock_2.addToStock ( auction.auction_id);
                    }
                } else {
                    this.auction_stock_3.addItemType( auction.auction_id, auction.position, g_gamethemeurl+'img/auctionTiles_144x196.png', auction.auction_id - 1);
                    if (auction.position == gamedatas.round_number){
                        this.auction_stock_3.addToStock ( auction.auction_id);
                    }
                }
            }
            
            this.main_building_stock.create( this, $('main_building_zone') , this.tile_width, this.tile_height );
            this.main_building_stock.image_items_per_row = 9;
            this.main_building_stock.setOverlap( 80, 20 );
            for (var building_key in gamedatas.buildings){
                var building = gamedatas.buildings[building_key];
                if (building.location == 2){
                    this.player_building_stock[building.player_id].addItemType( building.building_key , building.building_id, g_gamethemeurl+'img/buildingTiles_144x196.png', building.building_id -1 );
                    this.player_building_stock[building.player_id].addToStock ( building.building_key );
                } else if (building.location == 1) {
                    this.main_building_stock.addItemType( building.building_key, building.building_id, g_gamethemeurl+'img/buildingTiles_144x196.png', building.building_id -1 );
                    this.main_building_stock.addToStock ( building.building_key);
                }
            }
 
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
            this.currentState = stateName;
            
            switch( stateName )
            {
                case 'startRound':
                    // clean up tiles?     
                    setupTiles (this.gamedatas.round_number); 
                    break;
                case 'allocateWorkers':
                    
                    break;
                case 'payWorkers':

                    break;
                case 'playerBid':
                    if( this.isCurrentPlayerActive() )/*
                        {
                            var player_bid_token = "bid_token_"+current_player_color;
                            // mark bids as selectable
                            for (var bid_loc in args.args.bid_location){
                                var bid_auc = NUMBER(bid_loc['auction']);
                                var bid_slot = NUMBER(bid_loc['slot']);
                                const bid_slot_div = "bid_slot_A" + bid_auc + "_B" + bid_slot;
                                dojo.addClass(bid_slot_div, "selectable");
                            }
                            this.addActionButton( 'btn_pass',    _('pass'),    'passBid');
                            this.addActionButton( 'btn_confirm', _('Confirm'), 'makeBid');
                        }*/
                    break;
                case 'getPassBenefits':

                    break;
                case 'nextBid':

                    break;
                case 'buildingPhase':

                    break;
                case 'payAuction':

                    break;
                case 'chooseBuildingToBuild':

                    break;
                case 'getBonus':

                    break;
                case 'bonusChoice':

                    break;
                case 'endRound':

                    break;
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
                case 'collectIncome':
                    update_Resources();
                    break;
            
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
            
            var current_player_id = this.gamedatas.player_resources['player_id'];
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'allocateWorkers':
                        if( this.isCurrentPlayerActive() )
                        {
                            // show workers that are selectable
                            for (var worker in args.args.workers){
                                if(NUMBER(worker['player_id']) == current_player_id){
                                    var worker_key = NUMBER(worker['worker_key']);
                                    const worker_div = "worker_" + worker_key;
                                    dojo.addClass(worker_div, "selectable");
                                }
                            }
                            // also show building_slots
                            for (var building in args.args.buildings){
                                if (NUMBER(building.player_id) == current_player_id && building.worker_slot != 0){
                                    const building_div = "build_tile_"+building.building_id;
                                    dojo.addClass(worker_div, "selectable");
                                }
                            }
                            this.addActionButton( 'btn_trade',       _('Trade'),           'tradeAction');
                            this.addActionButton( 'btn_take_loan',   _('Take Loan'),       'takeLoan');
                            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorker');
                            this.addActionButton( 'btn_done',        _('Done'),            'donePlacingWorkers');
                        }
                    break;
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

            this.ajaxcall( "/homesteaders/homesteaders/myAction.html", { 
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
                  your homesteaders.game.php file.
        
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

        setupNewAuction: function( auction_div, auction_id, auction_loc)
        {
            //this.addTooltip()
            dojo.place(this.format_block( ''))
        }
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
