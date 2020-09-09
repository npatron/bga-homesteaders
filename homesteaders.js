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
],
function (dojo, declare) {

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        constructor: function(){
            console.log('homesteaders constructor');

            // zone control
            this.token_zone = [];
            this.token_zone[-1] = new ebg.zone();
            this.token_div = [];
            // auction tile zones
            this.tile_height = 175;
            this.tile_width = 105;
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_zone_height = 36;
            this.bid_zone_width = 36;
            this.bid_vals = [3,4,5,6,7,9,12,16,21];
            // auction bid zones
            this.bid_zones = [];
            this.auction_zones = [];
            for(var i=1; i<4;i++){
                this.bid_zones[i] = []; 
                this.auction_zones[i]= new ebg.zone();
            }
            for (var i =0; i < this.bid_vals.length; i++){
                this.bid_zones[1][i] = new ebg.zone();
                this.bid_zones[2][i] = new ebg.zone();
                this.bid_zones[3][i] = new ebg.zone();
            }

            this.rail_line_zone = [];
            for(var i=0; i<6;i++){
                this.rail_line_zone[i]= new ebg.zone();
            }

            this.auction_ids = [];

            // storage for buildings
            this.main_building_zone = new ebg.zone
            
            this.player_token_order = [];
            //player zones
            this.player_color = []; // indexed by player id
            this.player_building_zone_id = [];
            this.player_building_zone = [];
            this.building_worker_zones = [];

            this.players_railroad_advancements = [];   // indexed by player id

            this.tile_width = 144;
            this.tile_height = 196;
            
            this.player_count = 0;
            this.goldAmount = 0;
            this.last_worker_selected = 0;
            this.last_bid_selected = "NOBID";
            this.canal_tile_div_id = "";     // Division Id of Canal tile
            this.lastHighlightedBuildingTile = "";
            this.numberOfBidsSelected = 0;
            this.numberOfWorkersSelected = 0;
            this.lastHighlightedBidLocation = "";
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

            this.token_div[-1] = 'limbo';
            this.token_zone[-1].create (this, this.token_div[-1], 50, 50 );
            this.token_zone[-1].setPattern('horizontalfit');

            this.playerCount = 0;
            // Setting up player boards
            for( var player_id in gamedatas.players ) {
                ++this.playerCount;
                var player = gamedatas.players[player_id];
                
                var current_player_color = player.color_name;
                dojo.removeClass("player_zone_"+current_player_color.toString(), "noshow");
                dojo.place(this.format_block( 'jptpl_token', {type: current_player_color.toString(), id: "bid"}),'limbo');
                dojo.byId("player_name_"+current_player_color.toString()).innerText = player.player_name;
                this.token_zone[-1].placeInZone(`token_${current_player_color}_bid`);
                if (current_player_color === 'blue'){
                    this.player_token_order[player_id] = 13;
                } else if (current_player_color === 'green'){
                    this.player_token_order[player_id] = 12;
                } else if (current_player_color === 'yellow'){
                    this.player_token_order[player_id] = 10;
                } else if (current_player_color === 'red'){
                    this.player_token_order[player_id] = 11;
                }
                //this.players_railroad_advancements[player_id] = gamedatas.resources[player_id].rail_adv;
                
                this.player_color[player_id] = current_player_color;
                this.token_div[player_id] = 'token_zone_' + this.player_color[player_id].toString();
                this.token_zone[player_id] = new ebg.zone();
                this.token_zone[player_id].create ( this, this.token_div[player_id] , 50, 50 );

                this.player_building_zone_id[player_id] = 'building_zone_'+ this.player_color[player_id].toString();
                this.player_building_zone[player_id] = new ebg.zone();
                this.player_building_zone[player_id].create(this, this.player_building_zone_id[player_id], this.tile_width, this.tile_height);
                
                if (gamedatas.firstPlayer == player_id){
                    dojo.removeClass("first_player_tile_"+player_id, "noshow");
                }
                if (player_id == this.player_id){
                    dojo.place(`player_zone_${current_player_color}`, 'top_player_zone')
                }
            }

            // Auctions: 
            this.setupAuctionZones(gamedatas.auctions, gamedatas.round_number);
            this.setupBuildingZones(gamedatas.buildings);
            this.setupWorkers(gamedatas.workers);
            var auctionCount = 2;
            if (gamedatas.auctions.len > 20) {auctionCount = 3;}
            this.setupBidZones (auctionCount);

            this.setupRailLines(gamedatas.resources);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupAuctionZones: function (auctions, current_round ) {
            for (var i=1; i <=3; i++){
                this.auction_ids[i] = "auction_tile_zone"+i.toString();
                this.auction_zones[i].create(this, this.auction_ids[i], this.tile_width, this.tile_height);
                this.auction_zones[i].setPattern('diagonal');
            }
            this.showCurrentAuctions(auctions, current_round);
        },

        setupBuildingZones: function(buildings){
            
            this.main_building_zone.create (this, 'main_building_zone', this.tile_width, this.tile_height );
            for (var building_key in buildings){
                var building = buildings[building_key];
                dojo.place(this.format_block( 'jstpl_buildings', {key: building_key, id: building.building_id}), 'future_building_zone');
                if (building.location == 2){
                    this.player_building_zone[building.player_id].placeInZone(`building_tile_${building_key}`, 50-building.building_id);
                    this.addBuildingWorkerSlots(building);
                } else if (building.location == 1) {
                    this.main_building_zone.placeInZone(`building_tile_${building_key}`, 50-building.building_id);
                    this.addBuildingWorkerSlots(building);
                }
            }
        },

        setupWorkers: function(workers) {
            for (var worker_key in workers){
                var worker = workers[worker_key];
                dojo.place(this.format_block( 'jptpl_token', {
                    type: "worker", id: worker_key.toString()}), this.token_div[worker.player_id] );
                if (worker.building_key == 0 ){
                    this.token_zone[worker.player_id].placeInZone( `token_worker_${worker.worker_key}`);
                } else { 
                    this.building_worker_zones[worker.building_key][worker.building_slot].placeInZone(`token_worker_${worker.worker_key}`);
                }
            }
        },

        setupRailLines: function(resources) {
            for(var i =0; i < 6; i++){
                this.rail_line_zone[i].create( this, 'train_advancement_'+i.toString(), 50,50);
                this.rail_line_zone[i].setPattern('horizontalfit');
            }
            for(var player_id in resources){
                var player_rail = 'train_advancement_' + (resources[player_id].rail_adv.toString());
                dojo.place(this.format_block( 'jptpl_token', {
                    type: this.player_color[player_id].toString(), 
                    id: "rail"}),
                player_rail);
                this.rail_line_zone[resources[player_id].rail_adv].placeInZone(`token_${this.player_color[player_id]}_rail`);
            }
        },
        
        setupBidZones: function (auctionCount) {
            for (var bid =0; bid < this.bid_vals.length; bid ++){
                this.bid_zones[1][bid].create(this,'bid_slot_A1_B'+this.bid_vals[bid].toString(), 50, 50);
                this.bid_zones[2][bid].create(this,'bid_slot_A2_B'+this.bid_vals[bid].toString(), 50, 50);
                if (auctionCount == 3){
                    this.bid_zones[3][bid].create(this,'bid_slot_A3_B'+this.bid_vals[bid].toString(), 50, 50);
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
                    //update_Resources();
                    break;
                case 'allocateWorkers':
                    // show workers that are selectable
                    var worker_elements = dojo.query( `#token_zone_${this.player_color[current_player_id]} .token_worker` );
                    worker_elements.removeClass('selectable');
                    worker_elements.connect('onclick', this, 'doNothingEvent');
                    // also make building_slots selectable.
                    
                    var buildings = dojo.query(`#building_zone_${this.player_color[current_player_id]} .selectable`)
                    buildings.removeClass('selectable');
                    buildings.connect('onclick', this, 'doNothingEvent');
                    break;    
                case 'payWorkers':
                    onSelectDoneTrading(null);
                    break;
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
                            this.addActionButton( 'btn_trade', _('Trade'),'tradeActionButton');
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
                        var worker_elements = dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` );
                        worker_elements.addClass('selectable');
                        worker_elements.connect('onclick', this, 'onClickOnWorker');
                        // also make building_slots selectable.
                        var buildings = dojo.query(`#building_zone_${this.player_color[current_player_id]} .worker_slot`)
                        buildings.addClass('selectable');
                        buildings.connect('onclick', this, 'onClickOnWorkerDestination');
                        if (Number(args.trade) >0){
                            this.addActionButton( 'btn_trade',       _('Trade'),           'onSelectTradeActionButton');
                            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'onSelectHireWorkerButton');
                        }
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),       'onSelectTakeLoanButton');
                        this.addActionButton( 'btn_done',        _('Done'),            'onSelectDonePlacingWorkersButton');
                    break;
                    case 'playerBid':
                        for (const bid_key in args.valid_bids) {
                            var bid = args.valid_bids[bid_key];
                            this.numberOfBidsSelected = 0;
                            var bid_loc = this.getBidLocation(bid);
                            var bid_slot = Number(bid_loc.bid_val);
                            console.log("bid_no: "+ bid+", loc: "+bid_loc.auction_no.toString()+", bid_slot:"+ bid_slot)
                            const bid_slot_id = "bid_slot_A" + bid_loc.auction_no.toString() + "_B" + bid_slot;
                            dojo.query("#"+bid_slot_id).addClass("selectable");
                            dojo.query("#"+bid_slot_id).connect('onclick', this, 'doClickOnBidSlot');
                        }
                        this.addActionButton( 'btn_pass',    _('Pass'),    'onSelectPassBidButton', null, false, 'red');
                        this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'onSelectConfirmBidButton');
                    break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        takeLoan: function(){
            if( this.checkAction( 'takeLoan')){
                this.ajaxcall( "/homesteaders/homesteaders/takeLoan.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} );     
            }
        },

        donePayingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePayingWorkers.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} ); 
            }
        },

        donePlacingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} ); 
            }
        },
        

        disableTradeIfNecessary: function() {
            if (dojo.query('#top #trade_board').length ==1){
                this.slideToObject('trade_board', 'bottom');
                // now make the trade options not selectable
                dojo.query('.trade_option').removeClass('selectable');
                dojo.query('.trade_option').connect('onclick', this, 'doNothingEvent' );
                dojo.query('#done_trading').removeClass( 'selectable');
                dojo.query('#done_trading').addClass('noshow');
            }
        },

        onSelectTradeActionButton: function(){
            if( this.checkAction( 'trade' ) ){
            // if trade options already displayed, set done.
            if (dojo.hasClass('trade_done', 'selectable')){ 
                this.onSelectDoneTrading(null);
                return;
            }
            this.slideToObject('trade_board', 'top');
            // now make the trade options selectable
            var options = dojo.query(".trade_option");
            for (var option in options){
                option.addClass('selectable');
                option.connect( 'onclick', this, 'onSelectTradeAction' );
            }
            var done_trading =dojo.query('#done_trading')
            done_trading.addClass('done_trading' , 'selectable');
            done_trading.removeClass('done_trading' , 'noshow');
            done_trading.connect( 'onclick', this, 'onSelectDoneTrading' );
            }
        },

        onSelectHireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },
        
        onSelectPassBidButton: function() {
            if( this.checkAction( 'pass')){
                this.ajaxcall( "/homesteaders/homesteaders/passBid.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },
        
        onSelectConfirmBidButton: function () {
            if( this.checkAction( 'confirmBid')){
                const selected_slot = dojo.query(".bid_slot.selected");
                if (selected_slot.length != 1){
                    this.showMessage( _("You must select 1 bid_slot"), 'error' );
                    return;
                }
                const bid_loc = this.getBidLocFromId(selected_slot[0].id);
                this.ajaxcall( "/homesteaders/homesteaders/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },

        showCurrentAuctions: function (auctions, current_round){
            for (var auction_id in auctions){
                const auction = auctions[auction_id];
                if (auction.location !=0 && auction.position == current_round) {
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: auction_id}), this.auction_ids[auction.location]);
                    this.auction_zones[auction.location].placeInZone(`auction_tile_${auction_id}`);
                }
            }
        },

        clearAuction: function(auction_no){
            const auc_id = dojo.query(`#${this.auction_ids[auction_no]} .auction_tile`)[0].id
            if (auc_id != null){
                this.auction_zones[auction_no].removeFromZone(auc_id, true);
            }
        },

        addBuildingWorkerSlots: function(building){
            const key = building.building_key; 
            const divId = `building_tile_${key}`;
            if (building.worker_slot == 1){
                //console.log(`making 1 slot for building ${key}`)
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, 50, 50 );
            } else if (building.worker_slot > 1){
                //console.log(`making 2 slots for building ${key}`)
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key}), divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, 50, 50 );
                this.building_worker_zones[key][2] = new ebg.zone();
                this.building_worker_zones[key][2].create(this, `slot_2_${key}`, 50, 50 );
            }
        },

        moveBuildingToPlayer: function(building, player){
            this.player_building_zone[player.player_id].placeInZone(`building_tile_${building.building_key}`);
        },

        getBidNo: function(bid_loc_id){
            var split_bid = bid_loc_id.split("_");
            var auc_no = Number(split_bid[2].slice(-1));
            var bid_val = split_bid[3];
            switch(bid_val){
                case 'B3':
                    var bid_no = 1;
                    break;
                case 'B4':
                    var bid_no = 2;
                    break; 
                case 'B5':
                    var bid_no = 3;
                    break;
                case 'B6':
                    var bid_no = 4;
                    break;
                case 'B7':
                    var bid_no = 5;
                    break;
                case 'B9':
                    var bid_no = 6;
                    break;
                case 'B12':
                    var bid_no = 7;
                    break;
                case 'B16':
                    var bid_no = 8;
                    break;
                case 'B21':
                    var bid_no = 9;
                    break;
            }
            console.log( "auc_no -> " + auc_no);
            console.log( "bid_no -> " + bid_no);
            return ((auc_no-1)*10 + bid_no); 
        },

        getBidLocation: function(bid_no){
            var auction_no = 1;
            var bid_val = Number(bid_no);
            if (bid_no > 20){
                auction_no = 3;
                bid_val = bid_val - 20;
            } else if (bid_no > 10){
                auction_no = 2;
                bid_val = bid_val - 10;
                
            }
            switch(bid_val){
                case 1:
                    bid_val = 3;
                    break;
                case 2:
                    bid_val = 4;
                    break;
                case 3:
                    bid_val = 5;
                    break;
                case 4:
                    bid_val = 6;
                    break;
                case 5:
                    bid_val = 7;
                    break;
                case 6:
                    bid_val = 9;
                    break;
                case 7:
                    bid_val = 12;
                    break;
                case 8:
                    bid_val = 16;
                    break;
                case 9:
                    bid_val = 21;
                    break;                                                            
            }
            return {
                auction_no,
                bid_val
            };
        },

        undoBuild: function(building, player) {
            this.main_building_zone.placeInZone(`building_tile_${building.building_key}`);
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
        
        onClickOnWorker: function( evt )
        {
            console.log( 'onClickOnWorker' );
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( ! this.checkAction( 'placeWorker' ) )
            { return; }

            var worker_divId = evt.target.id;
            console.log( 'worker: '+ worker_divId );
            // clear all other selected workers, then select this. 
            var deselect = false;
            if (dojo.hasClass(worker_divId, 'selected')){
                deselect = true;
            } 
            var selected = dojo.query(`.selected`);
            selected.addClass('selectable');
            selected.removeClass('selected');
            if (deselect == false){
                console.log( 'selectable -> selected' );
                dojo.query(`#${worker_divId}`).removeClass("selectable");
                dojo.query(`#${worker_divId}`).addClass("selected");
            }
        },

        doClickOnBidSlot: function (evt) 
        {
            console.log( 'onSelectBidSlot' );
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( ! this.checkAction( 'selectBid' ) )
            { return; }
            
            var bid_loc_id = evt.target.id;
            console.log( 'bid_loc: '+ bid_loc_id );
            // clear all other selected workers, then select this. 
            if (this.numberOfBidsSelected == 1){
                var selected = dojo.query(`.selected`);
                selected.removeClass('selected');
                selected.addClass('selectable');
                if (this.last_bid_selected === bid_loc_id){
                    this.numberOfBidsSelected = 0;
                    this.last_bid_selected = "";
                    return;
                }
            }
            this.numberOfBidsSelected = 1;
            this.last_bid_selected = bid_loc_id;
            console.log( 'selectable -> selected' );
            dojo.query(`#${bid_loc_id}`).removeClass("selectable");
            dojo.query(`#${bid_loc_id}`).addClass("selected");
            
        },

        onClickOnWorkerDestination: function( evt )
        {
            console.log( 'onClickOnWorkerSlot' );
            dojo.stopEvent( evt );
            if( ! this.checkAction( 'placeWorker' ) )
            { return; }
            if (numberOfWorkersSelected!= 1){
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
            }
            
            var target_divId = evt.target.id;
            console.log( `target: ${target_divId}` );
            var building_key = Number(target_divId.split('_')[2]);
            if(target_divId.startsWith('slot_1')){
                var building_slot = 1; 
            } else if(target_divId.startsWith('slot_2')){
                var building_slot = 2;
            }
            const worker_key = last_worker_selected.split('_')[2];
            this.ajaxcall( "/homesteaders/homesteaders/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: worker_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {}, function( is_error) {});

        },

        doNothingEvent: function(evt){
            console.log( 'doNothing' );
            dojo.stopEvent(evt);
        },

        onSelectTradeAction: function( evt){
            console.log( 'onClickOnTradeSlot' );
            dojo.stopEvent( evt );
            if( ! this.checkAction( 'trade' ) )
            { return; }
            if (!dojo.hasClass (evt.target.id, 'selectable'))
            { return; }
            var tradeAction = evt.target.id.substring(6); 
            this.ajaxcall( "/homesteaders/homesteaders/selectWorkerDestination.html", { 
                lock: true, 
                tradeAction: tradeAction
             }, this, function( result ) {}, function( is_error) {});
        },

        onSelectDoneTrading: function( evt){
            console.log( 'doneTrading' );
            if (evt != null) { dojo.stopEvent( evt ); }
            if( ! this.checkAction( 'trade' ) )
            { return; }
            if (!dojo.hasClass ('done_trading', 'selectable'))
            { return; }
            this.slideToObject('trade_board', 'bottom');
            // now make the trade options not selectable
            dojo.query('.trade_option').removeClass('selectable');
            dojo.query('.trade_option').connect('onclick', this, 'doNothingEvent' );
            dojo.query('#done_trading').removeClass( 'selectable');
            dojo.query('#done_trading').addClass('noshow');
        },



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
            
            dojo.subscribe( 'gainWorker', this, "notif_gainWorker" );
            dojo.subscribe( 'workerMoved', this, "notif_workerMoved" );
            dojo.subscribe( 'railAdv', this, "notif_railAdv" );
            dojo.subscribe( 'moveBid', this, "notif_moveBid");

        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods

        /* @Override */
        /*format_string_recursive : function(log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    
                    if (!this.isSpectator)
                        args.You = this.divYou(); // will replace ${You} with colored version

                    // list of other known variables
                    var keys = ['token_name'];
                    
                    for ( var i in keys) {
                        var key = keys[i];
                        if (typeof args[key] == 'string') {
                           args[key] = this.getTokenDiv(key, args);                            
                        }
                    }
                }
            } catch (e) {
                console.error(log,args,"Exception thrown", e.stack);
            }
            return this.inherited(arguments);
        },

        getTokenDiv : function(key, args) {
            // ... implement whatever html you want here, example from sharedcode.js
            var token_id = args[key];
            var logid = "log" + (this.globalid++) + "_" + token_id;
            if (token_id != null && $(token_id)) {
                var clone = dojo.clone($(token_id));
                dojo.attr(clone, "id", logid);
                this.stripPosition(clone);
                dojo.addClass(clone, "logitem");
                return clone.outerHTML;
            }
            var tokenDiv = this.format_block('jstpl_resource_log', {
                "id" : logid,
                "type" : args.type,
                "color" : getPart(token_id,1)});
            return tokenDiv;
       },*/

        notif_workerMoved: function( notif){
            console.log( 'notif_workerMoved' );
            console.log( notif );
            
            this.building_worker_zones[notif.args.building_key][notif.args.building_slot].placeInZone('token_worker_'+notif.args.worker_key.toString());
            if (this.isCurrentPlayerActive() && notif.args.player_id == this.player_id)
            {
                this.numberOfWorkersSelected = 0;
                this.last_worker_selected = "";
                selectedWorker = dojo.query('.selected');
                selectedWorker.removeClass('selected');
                selectedWorker.addClass('selectable');
            }
        },

        notif_railAdv: function( notif ){
            console.log ('notif_railAdv');
            console.log( notif );
            const current_player_color = this.player_color[notif.args.player_id];
            const rail_adv_token_id =  `token_${current_player_color}_rail`;
            this.rail_line_zone[notif.args.rail_destination].placeInZone(rail_adv_token_id);
        }, 

        notif_gainWorker: function( notif ){
            console.log ('notif_gainWorker');
            console.log( notif );
            const worker_id = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_token', {
                type: "worker", id: notif.args.worker_key.toString()}), this.token_div[notif.args.player_id] );
            this.token_zone[notif.args.player_id].placeInZone(worker_id);
        },

        notif_moveBid: function( notif ){
            console.log ('notif_moveBid');
            console.log( notif );
            const current_player_color = this.player_color[notif.args.player_id];
            const bid_token_id = `token_${current_player_color}_bid`;
            
            if (notif.args.bid_location == 10) { // OUTBID
                this.token_zone[-1].placeInZone(bid_token_id);
            } else if(notif.args.bid_location == 20){ // pass
                this.token_zone[notif.args.player_id].placeInZone(bid_token_id);
            } else { //actual bid
                const bid = this.getBidLocation(notif.args.bid_location);
                this.bid_zones[bid.auction_no][bid.bid_val].placeInZone(bid_token_id);
            }
        },
   });             
});
