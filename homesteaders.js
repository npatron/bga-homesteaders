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
            this.token_stock = [];
            this.token_stock[-1] = new ebg.stock();
            this.token_div = [];
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
            
            this.auction_stock = [];
            this.auction_stock[1] = new ebg.stock();
            this.auction_stock[2] = new ebg.stock();
            this.auction_stock[3] = new ebg.stock();

            this.auction_div = [];
            this.auction_zones = [];

            // storage for buildings
            this.main_building_stock = new ebg.stock();
            
            this.player_number = [];
            this.player_token_order = [];
            //player zones
            this.player_color = []; // indexed by player id

            this.player_building_stock = [];
            this.player_building_div = [];
            this.building_worker_stock = [];

            this.players_railroad_advancements = [];   // indexed by player id

            this.tile_width = 144;
            this.tile_height = 196;
            
            this.player_count = 0;
            this.building_tile_count = 0;
            this.auction_tile_count = 0;
            this.number_of_workers_selected = 0;
            this.goldAmount = 0;
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

            this.token_div[-1] = $('limbo');
            this.token_stock[-1].create (this, this.token_div[-1] , 50, 50 );
            this.token_stock[-1].image_items_per_row = 5;
            this.token_stock[-1].setSelectionMode(0);

            this.playerCount = 0;
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                ++this.playerCount;
                var player = gamedatas.players[player_id];
                
                var current_player_color = player.color_name;
                dojo.removeClass("player_zone_"+current_player_color.toString(), "noshow");
                if (current_player_color === 'blue'){
                    this.player_token_order[player_id] = 13;
                } else if (current_player_color === 'green'){
                    this.player_token_order[player_id] = 12;
                } else if (current_player_color === 'yellow'){
                    this.player_token_order[player_id] = 10;
                } else if (current_player_color === 'red'){
                    this.player_token_order[player_id] = 11;
                }
                this.token_stock[-1].addItemType(player_id, current_player_color , g_gamethemeurl+'img/tokens_50x50.png', this.player_token_order[player_id]);
                this.token_stock[-1].addToStock(player_id);
                
                this.player_number[player_id] = this.playerCount;
                this.player_color[player_id] = current_player_color;
                this.token_div[player_id] = $('token_zone_' + this.player_color[player_id].toString());
                this.token_stock[player_id] = new ebg.stock();
                this.token_stock[player_id].create ( this, this.token_div[player_id] , 50, 50 );
                this.token_stock[player_id].image_items_per_row = 5;
                this.token_stock[player_id].addItemType( 1, 1, g_gamethemeurl+'img/tokens_50x50.png', 8);
                this.token_stock[player_id].setSelectionMode(0);
                

                this.player_building_div[player_id] = $('building_zone_'+ this.player_color[player_id].toString());
                this.player_building_stock[player_id] = new ebg.stock();
                this.player_building_stock[player_id].create (this, this.player_building_div[player_id], this.tile_width, this.tile_height); 
                this.player_building_stock[player_id].image_items_per_row = 9;
                
                // TODO: add railroad advancement.
                // TODO: add bid_locations.
                if (gamedatas.firstPlayer == player_id){
                    dojo.removeClass("first_player_tile_"+player_id, "noshow");
                }
            }

            // Auctions: 
            this.setupAuctionStocks(gamedatas.auctions, gamedatas.current_round);
            //this.showCurrentAuctions(gamedatas.auctions, gamedatas.round_number);
            this.setupBuildingStocks(gamedatas.buildings);
            this.setupWorkers(gamedatas.workers);
            var auctionCount = 2;
            if (gamedatas.auctions.len > 20) {auctionCount = 3;}
            this.setupBidZones (auctionCount);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupAuctionStocks: function ( auctions, current_round ) {
            for (var i=1; i <=3; i++){
                this.auction_div[i] = $("auction_tile_zone"+i.toString());
                this.auction_stock[i].create( this, this.auction_div[i], this.tile_width, this.tile_height);
                this.auction_stock[i].image_items_per_row = 10;
            }
            for (var auction_id in auctions){
                var auction = auctions[auction_id];
                if (auction.location >0){
                    this.auction_stock[auction.location].addItemType( auction.auction_id, (10- auction.priority), g_gamethemeurl+'img/auctionTiles_144x196.png', auction.auction_id - 1);
                    if (auction.position == current_round){
                        this.auction_stock[auction.location].addToStockWithId ( auction.auction_id, auction.auction_id );
                    }
                } 
            }
        },

        setupBuildingStocks: function(buildings){
            this.main_building_stock.create( this, $('main_building_zone') , this.tile_width, this.tile_height );
            this.main_building_stock.image_items_per_row = 9;
            this.main_building_stock.setOverlap( 80, 20 );
            for (var i = 0; i < 36; i++){
                this.main_building_stock.addItemType( i, i, g_gamethemeurl+'img/buildingTiles_144x196.png', i);
            }
            for (var building_key in buildings){
                var building = buildings[building_key];
                if (building.location == 2){
                    this.player_building_stock[building.player_id].addItemType( building.building_id, building.building_id , g_gamethemeurl+'img/buildingTiles_144x196.png', building.building_id -1 );
                    this.player_building_stock[building.player_id].addToStockWithId (building.building_id, building.building_key );
                    this.addBuildingWorkerSlots(building);
                } else if (building.location == 1) {
                    this.main_building_stock.addToStockWithId ( building.building_id, building.building_key);
                } 
            }
        },

        setupWorkers: function(workers) {
            for (var worker_key in workers){
                var worker = workers[worker_key];
                this.token_stock[worker.player_id].addToStockWithId( 1, worker_key);
                var worker_div = $(this.token_stock[worker.player_id].getItemDivId(worker_key));
                dojo.addClass(worker_div, "res_"+this.gamedatas.players[worker.player_id].color_name);
                
            }
        },

        /*updateWorkers: function(workers) {
              
        },*/
        
        setupBidZones: function (auctionCount) {
            for (var bid =0; bid < this.bid_vals.length; bid ++){
                this.bid_zonesA1_B[bid].create(this,$('bid_slot_A1_B'+this.bid_vals[bid]), 50, 50);
                this.bid_zonesA2_B[bid].create(this,$('bid_slot_A2_B'+this.bid_vals[bid]), 50, 50);
                if (auctionCount == 3){
                    this.bid_zonesA3_B[bid].create(this,$('bid_slot_A3_B'+this.bid_vals[bid]), 50, 50);
                }
            }
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
                    setupTiles (this.gamedatas.round_number);  
                    break;
                case 'payWorkers':
                    this.goldAmount = 0;
                    break;
                case 'playerBid':
                    if( this.isCurrentPlayerActive() )
                        {
                            var player_bid_token = "bid_token_"+current_player_color;
                            // mark bids as selectable
                            for (var bid_loc in args.args.bid_location){
                                var bid_auc = Number(bid_loc['auction']);
                                var bid_slot = Number(bid_loc['slot']);
                                const bid_slot_div = "bid_slot_A" + bid_auc + "_B" + bid_slot;
                                dojo.addClass(bid_slot_div, "selectable");
                            }
                            this.addActionButton( 'btn_pass',    _('pass'),    'passBid');
                            this.addActionButton( 'btn_confirm', _('Confirm'), 'makeBid');
                        }
                    break;
                case 'getPassBenefits':

                    break;
                case 'nextBid':

                    break;
                case 'buildingPhase':

                    break;
                case 'payAuction':
                    this.goldAmount = 0;
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
           
           
            case 'dummy':
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
                    case 'payWorkers':
                        if (Number(args.trade) >0){
                            this.addActionButton( 'btn_trade', _('Trade'),'tradeAction');
                        }
                        if (Number(args.gold) > this.goldAmount){
                            this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'lowerGold');
                        }
                        if (this.goldAmount >0 ) {
                            this.addActionButton( 'btn_less_gold', _('Use Less Gold'), 'lowerGold');
                        }
                        this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan');
                        this.addActionButton( 'btn_done',      _('Done'),     'donePayingWorkers');
                    break;
                    case 'allocateWorkers':
                        // show workers that are selectable
                        this.token_stock[current_player_id].setSelectionMode(1);
                        // also make building_slots selectable.
                        this.player_building_stock[current_player_id].setSelectionMode(1);                            
                        if (Number(args.trade) >0){
                            this.addActionButton( 'btn_trade',       _('Trade'),           'tradeAction');
                            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorker');
                        }
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),       'takeLoan');
                        this.addActionButton( 'btn_done',        _('Done'),            'donePlacingWorkers');
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

        takeLoan: function(){
            if( this.checkAction( 'takeLoan')){
                this.ajaxcall( "/homesteaders/homesteaders/takeLoan.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );     
            }
        },

        donePayingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePayingWorkers.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } ); 
            }
        },
        

        tradeAction: function(){
            if( this.checkAction( 'trade' ) ){
                //disable other buttons
            //open trade menu, (not sure how yet)
            }
        },

        hireWorker: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },

        showCurrentAuctions: function (){
            for(var auction_id in this.gamedatas.auctions){
                var auction = this.gamedatas.auctions[auction_id]; 
                if (auction.position == this.gamedatas.round_number && auction.location !=0){
                    this.auction_stock[auction.location].addToStock ( auction_id ); 
                }
            }
        },

        clearAuction: function(auction_no){
            this.auction_stock[auction_no].removeAll();
        },

        addBuildingWorkerSlots: function(building){
            var divId = this.player_building_stock[building.player_id].getItemDivId(building.building_id-1);
            this.building_worker_stock[building.building_key] = [];
            if (building.worker_slot>0){
                dojo.place( this.format_block( 'jstpl_workerSlot', {key: building_key, slot: "1"}), divId, 50, 50 );
                this.building_worker_stock[building_key][1] = new ebg.stock();
                this.building_worker_stock[building_key][1].create( this, $('building_'+building_key+'_worker_zone_1'));
            } else if (building.worker_slot == 2){
                dojo.place( this.format_block( 'jstpl_workerSlot', {key: building_key, slot: "2"}), divId, 50, 50 );
                this.building_worker_stock[building_key][2] = new ebg.stock();
                this.building_worker_stock[building_key][2].create(this, $('building_'+building_key+'_worker_zone_2'));
            }
        },

        moveBuildingToPlayer: function(building, player){
            this.player_building_stock[player.player_id].addToStockWithId(building.building_id, building.building_key, $('main_building_zone'));
        },

        undoBuild: function(building, player) {
            this.main_building_stock.addToStockWithId(building.building_id, building.building_key, $('player_building_'+player.player_color));
        },

        updateMainBuildingStock: function(buildings){
            // todo make this for transitions where building stock changes [new round most likely]
        
            // use this probably: removeFromStockById( id, to, noupdate );
            // addToStockWithId( type, id, from );
            // get getPresentTypeList();
        },


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
