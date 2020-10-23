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
    function override_addMoveToLog(logId, moveId) {
        // [Undocumented] Called by BGA framework on new log notification message
        // Handle cancelled notifications
        this.inherited(override_addMoveToLog, arguments);
        if (this.gamedatas.cancel_move_ids && this.gamedatas.cancel_move_ids.includes(+moveId)) {
          dojo.addClass('log_' + logId, 'cancel');
        }
      }
    const DUMMY_BID= 0;
    const DUMMY_OPT= -1;
    
    const NO_BID   = 0;
    const OUTBID   = 10;
    const BID_PASS = 20;
    //Resource maps
    const NONE     = 0;
    const WOOD     = 1;
    const STEEL    = 2;
    const GOLD     = 3;
    const COPPER   = 4;
    const FOOD     = 5;
    const COW      = 6;
    const TRADE    = 7;
    const TRACK    = 8;
    const WORKER   = 9;
    const VP       = 10;
    const SILVER   = 11;
    const LOAN     = 12;

    const ZONE_PENDING = -1;

    const TYPE_RESIDENTIAL = 0;
    const TYPE_COMMERCIAL  = 1;
    const TYPE_INDUSTRIAL  = 2;
    const TYPE_SPECIAL     = 3;

    const BLD_LOC_FUTURE  = 0;
    const BLD_LOC_OFFER   = 1;
    const BLD_LOC_PLAYER  = 2;
    const BLD_LOC_DISCARD = 3;

    const BLD_HOMESTEAD_YELLOW = 1;
    const BLD_HOMESTEAD_RED    = 2;
    const BLD_HOMESTEAD_GREEN  = 3;
    const BLD_HOMESTEAD_BLUE   = 4;
    
    const BLD_GRAIN_MILL = 5;
    const BLD_FARM       = 6;
    const BLD_MARKET     = 7;
    const BLD_FOUNDRY    = 8;
    const BLD_STEEL_MILL = 9;

    const BLD_BOARDING_HOUSE     = 10;
    const BLD_RAILWORKERS_HOUSE = 11;
    const BLD_RANCH             = 12;
    const BLD_TRADING_POST      = 13;
    const BLD_GENERAL_STORE     = 14;
    const BLD_GOLD_MINE         = 15;
    const BLD_COPPER_MINE       = 16;
    const BLD_RIVER_PORT        = 17;

    const BLD_CHURCH            = 18;
    const BLD_WORKSHOP          = 19;
    const BLD_DEPOT             = 20;
    const BLD_STABLES           = 21;
    const BLD_BANK              = 22;
    const BLD_MEATPACKING_PLANT = 23;
    const BLD_FORGE             = 24;
    const BLD_FACTORY           = 25;
    const BLD_RODEO             = 26;
    const BLD_LAWYER            = 27;
    const BLD_FAIRGROUNDS       = 28;

    const BLD_DUDE_RANCH    = 29;
    const BLD_TOWN_HALL     = 30;
    const BLD_TERMINAL      = 31;
    const BLD_RESTARAUNT    = 32;
    const BLD_TRAIN_STATION = 33;
    const BLD_CIRCUS        = 34;
    const BLD_RAIL_YARD     = 35;

    // string templates for dynamic assets
    const TPL_BLD_TILE = "building_tile_";
    const TPL_BLD_STACK = "building_stack_";
    const TPL_BLD_ZONE = "building_zone_";
    const TPL_AUC_TILE = "auction_tile_";
    const TPL_AUC_ZONE = "auction_tile_zone_";

    const FIRST_PLAYER_ID = 'first_player_tile';
    const CONFIRM_TRADE_BTN_ID = 'confirm_trade_btn';
    const UNDO_TRADE_BTN_ID = 'undo_trades_btn';
    const PAYMENT_SECTION_ID = 'payment_section';
    const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
    'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option'};
    const BUILDING_ZONE_DIVID = ['future_building_zone', 'main_building_zone', '', 'past_building_zone'];


    // other Auction Locations are the auction number (1-3).
    const AUCLOC_DISCARD = 0;

    const AUCBONUS_NONE            = 0;
    const AUCBONUS_WORKER          = 1;
    const AUCBONUS_WORKER_RAIL_ADV = 2;
    const AUCBONUS_WOOD_FOR_TRACK  = 3;
    const AUCBONUS_COPPER_FOR_VP   = 4;
    const AUCBONUS_COW_FOR_VP      = 5;
    const AUCBONUS_6VP_AND_FOOD_VP = 6;
    const AUCBONUS_FOOD_FOR_VP     = 7;

    // only one with player action required
    const BUILD_BONUS_WORKER = 3; 

    const BID_VAL_ARR = [3,4,5,6,7,9,12,16,21];//note: starts at 0.
    const BID_VAL_ARR_BACK = {3:0, 4:1, 5:2, 6:3, 7:4, 9:5, 12:6, 16:7, 21:8};
    const ASSET_COLORS = {0:'lightgreen', 1:'darksalmon', 2:'royalblue', 3:'gold',
                          11:'lightseagreen',12:'orange',13:'hotpink'};
    const VP_TOKENS = ['vp2','vp4','vp6','vp8'];

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['First', 'Second', 'Third', 'Fourth'];
            

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){
            console.log('homesteaders constructor');

            // zone control
            this.token_zone = [];
            this.token_zone[ZONE_PENDING] = new ebg.zone();
            this.token_divId = [];

            // auction tile zones
            this.tile_height = 175;
            this.tile_width = 105;
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_token_divId =[];
            
            // auction bid zones
            this.bid_zones = [];
            this.auction_zones = [];

            this.train_token_divId = [];
            this.rail_adv_zone = [];
            for(let i=0; i<6;i++){
                this.rail_adv_zone[i]= new ebg.zone();
            }

            this.auction_ids = [];

            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();
            this.roundCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_building_zone_id = [];
            this.player_building_zone = [];
                        
            // storage for buildings
            this.main_building_diag = []; // zone for each building_id [indexed by building_id]
            this.main_building_counts = []; // counts of each building_id in main zone. for use by update Buildings methods.
            
            this.building_worker_zones = [];
            this.resourceCounters = []; // This player's resource counters

            this.tile_width = 144;
            this.tile_height = 196;

            this.token_dimension = 50;

            this.bid_height = 52;
            this.bid_width = 46;
            this.worker_height = 35;
            this.worker_width = 33;
            
            this.player_score_counter = []; // indexed by player_id
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;
            this.first_player = 0;

            this.hasBuilding = []; 
            this.last_selected = [];
            this.goldAsCopper = false;
            this.goldAsCow = false;
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

            $isSpectator = true;
            this.playerCount = 0;
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.playerCount++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            if (!$isSpectator)
                this.orientPlayerZones(gamedatas.player_order);
            console.log("#players: "+this.playerCount);
            if (this.playerCount == 2){
                this.player_color[DUMMY_BID] = this.getAvailableColor();
                this.player_color[DUMMY_OPT] =this.player_color[0];
            }

            this.setupPlayerResources(gamedatas.player_resources);
            // Auctions: 
            this.setupAuctionZones(gamedatas.number_auctions);
            this.setupAuctionTiles(gamedatas.auctions);
            this.showCurrentAuctions(gamedatas.auctions, gamedatas.round_number);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);

            this.player_building_zone[gamedatas.first_player].placeInZone(FIRST_PLAYER_ID, 0);
            this.first_player = Number(gamedatas.first_player);
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones();
            this.setupBidTokens(gamedatas.bids);

            this.setupRailLines(gamedatas.players);
            this.setupTradeButtons(gamedatas.can_undo_trades);
            this.setupBonusButtons();
            this.setupShowButtons();
            this.setupPaymentSection();
            this.roundCounter.create('round_number');
            this.roundCounter.setValue( gamedatas.round_number);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupPlayerAssets: function (player){
            const current_player_color = player.color_name;
            const p_id = player.p_id;            
            dojo.removeClass("player_zone_"+current_player_color, "noshow");
            if( this.player_id == p_id){
                const player_board_div = 'player_board_'+p_id;
                dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
                $isSpectator = false;
            } 
            this.player_color[p_id] = current_player_color;
            this.token_divId[p_id] = 'token_zone_' + current_player_color;
            this.token_zone[p_id] = new ebg.zone();
            this.token_zone[p_id].create ( this, 'worker_zone_'+ current_player_color , this.worker_width, this.worker_height );

            this.player_score_counter[p_id] = new ebg.counter();
            this.player_score_counter[p_id].create(`player_score_${p_id}`);
            this.player_score_counter[p_id].setValue(Number(player.score));

            this.player_building_zone_id[p_id] = TPL_BLD_ZONE+ this.player_color[p_id];
            this.player_building_zone[p_id] = new ebg.zone();
            this.player_building_zone[p_id].create(this, this.player_building_zone_id[p_id], this.tile_width, this.tile_height-3);
        },

        orientPlayerZones: function (order_table){
            let next_pId = this.player_id;    
            for (let i = 0; i < this.playerCount; i++){
                console.log( "next: "+next_pId );
                dojo.place(`player_zone_${this.player_color[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
        },

        getAvailableColor: function(){
            let player_color_option = ['purple', 'blue', 'yellow', 'green', 'red'];
            for(let i in player_color_option){
                if (!this.player_color.includes(player_color_option[i]))
                {   
                    console.log(player_color_option[i]);
                    return player_color_option[i];
                }
            }
        },

        setupPlayerResources: function (resources){
            for (const [key, value] of Object.entries(resources)) {
                //console.log(`${key}: ${value}`);
                if (key == "p_id") continue;
                this.resourceCounters[key] = new ebg.counter();
                this.resourceCounters[key].create(`${key}count_${resources.p_id}`);
                this.resourceCounters[key].setValue(value);
            }
        },

        setupAuctionZones: function (auction_count) {
            for (let i=1; i <=auction_count; i++){
                this.auction_ids[i] = `${TPL_AUC_ZONE}${i}`;
                this.auction_zones[i]= new ebg.zone();
                this.auction_zones[i].create(this, this.auction_ids[i], this.tile_width, this.tile_height);
                this.auction_zones[i].setPattern('diagonal');
            }
        },

        setupBuildings: function(buildings) {
            for (let b_key in buildings){
                const building = buildings[b_key];   
                if (building.location == BLD_LOC_PLAYER){
                    this.addBuildingToPlayer(building);
                } else {
                    this.addBuildingToOffer(building);
                } 
            }
        },

        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: this.player_color[track.p_id]}), this.token_divId[track.p_id]);
            }
        },

        addBuildingWorkerSlots: function(building){
            const key = building.b_key; 
            const id = building.b_id;
            const divId = `${TPL_BLD_TILE}${key}`;
            if (building.w_slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, this.worker_width, this.worker_height );
                dojo.connect($(`slot_1_${key}`), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (building.w_slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, this.worker_width, this.worker_height );
                this.building_worker_zones[key][2] = new ebg.zone();
                this.building_worker_zones[key][2].create(this, `slot_2_${key}`, this.worker_width, this.worker_height );
                dojo.connect($(`slot_1_${key}`), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(`slot_2_${key}`), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (building.w_slot == 3){
                // currently
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][3] = new ebg.zone();
                this.building_worker_zones[key][3].create(this, `slot_3_${key}`, this.worker_width, this.worker_height );
                this.building_worker_zones[key][3].setPattern('horizontalfit');
                dojo.style(`slot_3_${key}`, 'max-width', `${(this.worker_width*1.5)}px`);
                dojo.connect($(`slot_3_${key}`), 'onclick', this, 'onClickOnWorkerSlot');
            }
        },

        setupWorkers: function(workers) {
            for (let w_key in workers){
                const worker = workers[w_key];
                dojo.place(this.format_block( 'jptpl_token', {
                    type: "worker", id: w_key.toString()}), this.token_divId[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                if (worker.b_key != 0 ){ 
                    this.building_worker_zones[worker.b_key][worker.b_slot].placeInZone(worker_divId);
                } else {
                    this.token_zone[worker.p_id].placeInZone(worker_divId);
                }
                if (worker.p_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        setupBidZones: function () {
            this.token_divId[ZONE_PENDING] = 'pending_bids';
            this.bid_zones[ZONE_PENDING] = new ebg.zone();
            this.bid_zones[ZONE_PENDING].create (this, this.token_divId[ZONE_PENDING], this.bid_height, this.bid_width );
            this.bid_zones[ZONE_PENDING].setPattern('horizontalfit');
            
            for (let auc = 1; auc <= 3; auc++){
                this.bid_zones[auc] = []; 
                for (let bid =0; bid < BID_VAL_ARR.length; bid ++){
                    const bid_slot_divId = `bid_slot_${auc}_${BID_VAL_ARR[bid]}`;
                    this.bid_zones[auc][bid] = new ebg.zone();
                    this.bid_zones[auc][bid].create(this, bid_slot_divId, this.bid_height, this.bid_width);
                    this.bid_zones[auc][bid].setPattern('horizontalfit');
                    dojo.connect($(bid_slot_divId), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        setupBidTokens: function(bids) {
            for(let p_id in bids){
                const token_bid_loc = bids[p_id].bid_loc;
                const token_color = this.player_color[p_id];
                if( p_id == DUMMY_OPT) {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}_dummy`;
                    dojo.place(this.format_block( 'jptpl_dummy_player_token', {color: token_color, type: "bid"}), this.token_divId[ZONE_PENDING]);
                } else {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}`;
                    dojo.place(this.format_block( 'jptpl_player_token', {color: token_color, type: "bid"}), this.token_divId[ZONE_PENDING]);
                }
                
                if (token_bid_loc == OUTBID || token_bid_loc == NO_BID|| token_bid_loc == BID_PASS) {
                    this.bid_zones[ZONE_PENDING].placeInZone(this.bid_token_divId[p_id]);
                } else { 
                    const bid_pair = this.getBidPairFromBidNo(token_bid_loc);
                    this.bid_zones[bid_pair.auction_no][bid_pair.bid_index].placeInZone(this.bid_token_divId[p_id]);
                }
            }
        },

        setupRailLines: function(players) {
            for(let i =0; i < 6; i++){
                this.rail_adv_zone[i].create( this, 'train_advancement_'+i.toString(), this.token_dimension, this.token_dimension);
                this.rail_adv_zone[i].setPattern( 'horizontalfit' );
            }
            // place tokens.
            for(let p_id in players){
                const player_rail_adv = players[p_id].rail_adv;
                this.train_token_divId[p_id] = `token_train_${this.player_color[p_id]}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: this.player_color[p_id].toString(), type: "train"}), 'train_advancement_0');
                this.rail_adv_zone[player_rail_adv].placeInZone(this.train_token_divId[p_id]);
            }
        },

        setupTradeButtons: function(can_undo_trades){
            const options = dojo.query("#trade_board .trade_option");
            for(let i in options){
                if (options[i].id != null){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
            }   }
            dojo.connect($(CONFIRM_TRADE_BTN_ID), 'onclick', this, 'confirmTradeButton' );
            dojo.addClass(CONFIRM_TRADE_BTN_ID,'noshow');
            dojo.connect($(UNDO_TRADE_BTN_ID), 'onclick', this, 'undoTransactionsButton');
            if (!this.isCurrentPlayerActive() || !can_undo_trades){
                dojo.addClass(UNDO_TRADE_BTN_ID,'noshow');
            }
        },

        setupBonusButtons: function(){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id != null){
                    dojo.connect($(bonus_options[i].id),'onclick', this, 'onSelectBonusOption');
                } 
            }
        },

        setupShowButtons: function(){
            // future auctions (don't need to do anything)
            dojo.connect($(`tgl_future_auc`), 'onclick', this, 'toggleShowAuctions');
            // discard buildings
            dojo.connect($(`tgl_past_bld`),  'onclick', this, 'toggleShowBldDiscard');
            // future buildings 
            dojo.connect($(`tgl_future_bld`),  'onclick', this, 'toggleShowBldFuture');
            this.showHideButtons();
        },

        showHideButtons: function(){
            let discard_buildings = dojo.query(`#${BUILDING_ZONE_DIVID[BLD_LOC_DISCARD]} .building_tile`);
            if (discard_buildings.length == 0){
                dojo.addClass('tgl_past_bld', 'noshow');
            } else if (dojo.hasClass('tgl_past_bld', 'noshow')){
                dojo.removeClass('tgl_past_bld', 'noshow');
            }
            let future_buildings = dojo.query(`#${BUILDING_ZONE_DIVID[BLD_LOC_FUTURE]} .building_tile`);
            if (future_buildings.length == 0){
                dojo.addClass('tgl_future_bld', 'noshow');
            } else if (dojo.hasClass('tgl_future_bld', 'noshow')){
                dojo.removeClass('tgl_future_bld', 'noshow');
            }
        },

        /**
         * payment section counters for gold/silver
         * they live in <div id='payment_section'>
         */
        setupPaymentSection: function(){
            this.goldCounter.create('gold_cost');
            this.goldCounter.setValue(0);
            this.silverCounter.create('silver_cost');
            this.silverCounter.setValue(0);
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
                    console.log(args);
                    this.setupTiles (args.args.round_number, 
                        args.args.auctions);  
                    break;
                case 'payWorkers':
                    this.goldAmount = 0;
                    break;
                case 'allocateWorkers':                    
                break;

                case 'dummyPlayerBid':
                    const dummy_bid_id = this.bid_token_divId[DUMMY_BID];
                    dojo.addClass(dummy_bid_id, 'animated');
                break;
                case 'playerBid':
                    const active_bid_id = this.bid_token_divId[this.getActivePlayerId()];
                    dojo.addClass(active_bid_id, 'animated');
                    break;
                case 'getRailBonus':
                case 'payAuction':
                case 'chooseBuildingToBuild':
                case 'auctionBonus':
                case 'bonusChoice':
                case 'endRound':
                    break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            const current_player_id = this.player_id;
            
            switch( stateName )
            {
                case 'setupRound':
                case 'collectIncome':
                case 'payWorkers':
                    break;
                case 'dummyPlayerBid':
                    const dummy_bid_id = this.bid_token_divId[DUMMY_BID];
                    dojo.removeClass(dummy_bid_id, 'animated');
                break;
                case 'playerBid':
                    const active_bid_id = this.bid_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_bid_id, 'animated');
                    break;
                case 'allocateWorkers':
                case 'payAuction':
                case 'endBuildRound':
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                case 'bonusChoice':
                    this.hideUndoTransactionsButtonIfPossible();
                    break;
                case 'endRound':
                case 'dummy':
                    break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            const current_player_id = this.player_id;
            console.log( 'onUpdateActionButtons: '+stateName );
            const tkn_arrow = this.format_block( 'jstpl_resource_inline', {type:'arrow'}, ); 
            const tkn_copper = this.format_block( 'jstpl_resource_inline', {type:'copper'}, );
            const tkn_cow  = this.format_block( 'jstpl_resource_inline', {type:'cow'}, );
            const tkn_food = this.format_block( 'jstpl_resource_inline', {type:'food'}, );     
            const tkn_gold = this.format_block( 'jstpl_resource_inline', {type:'gold'}); 
            const tkn_silver = this.format_block( 'jstpl_resource_inline', {type:'silver'});     
            const tkn_track = this.format_block( 'jstpl_resource_inline', {type:'track'}, ); 
            const tkn_worker = this.format_block( 'jstpl_resource_inline', {type:'worker'}, );
            const tkn_wood = this.format_block( 'jstpl_resource_inline', {type:'wood'}, ); 
            const tkn_vp4 = this.format_block( 'jstpl_resource_inline', {type:'vp4'}, ); 
            const tkn_vp2 = this.format_block( 'jstpl_resource_inline', {type:'vp2'}, ); 
                     
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'allocateWorkers':
                        this.last_selected['worker'] ="";
                        // show workers that are selectable
                        const workers = dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` );
                        workers.addClass('selectable');
                        // also make building_slots selectable.
                        const building_slots = dojo.query( `#${TPL_BLD_ZONE}${this.player_color[current_player_id]} .worker_slot` );
                        building_slots.addClass( 'selectable' );
                        this.addActionButton( 'btn_done',       _('Done'),       'donePlacingWorkers' );
                        this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
                        this.addActionButton( 'btn_trade',     _('Trade'), 'tradeActionButton', null, false, 'gray' );
                        this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan', null, false, 'gray' );
                    break;
                    case 'payWorkers':    
                        this.showPaymentSection();
                        this.silverCost = Number(args.worker_counts[this.player_id].workers);
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        
                        this.addActionButton( 'btn_done',      _('Done'),     'donePayingWorkers');
                        this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'raiseGold', null, false, 'gray');
                        this.addActionButton( 'btn_trade',     _('Trade'), 'tradeActionButton', null, false, 'gray' );
                        this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan', null, false, 'gray' );
                    break;
                    case 'dummyPlayerBid'://2-player dummy bid phase
                        console.log (args);
                        for (let bid_key in args.valid_bids) {
                            const bid = args.valid_bids[bid_key];
                            const bid_pair = this.getBidPairFromBidNo(bid);
                            const bid_slot = BID_VAL_ARR[bid_pair.bid_index];
                            const bid_slot_id = `bid_slot_${bid_pair.auction_no}_${bid_slot}`;
                            dojo.addClass(bid_slot_id, "selectable" );
                        }
                        this.addActionButton( 'btn_confirm', _('Confirm Dummy Bid'), 'confirmDummyBidButton' );
                    break;
                    case 'playerBid':
                        console.log('entering playerBid');
                        for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                            const bid = args.valid_bids[bid_key];
                            const bid_pair = this.getBidPairFromBidNo(bid);
                            const bid_slot = BID_VAL_ARR[bid_pair.bid_index];
                            const bid_slot_id = `bid_slot_${bid_pair.auction_no}_${bid_slot}`;
                            dojo.addClass(bid_slot_id, "selectable" );
                        }
                        this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'confirmBidButton' );
                        this.addActionButton( 'btn_pass',    _('Pass'),    'passBidButton', null, false, 'red' );
                    break;
                    case 'getRailBonus':
                        this.last_selected['bonus']  ="";
                        const bonus_ids = new Array();
                        bonus_ids.push('train_bonus_1_trade');
                        if (args.rail_options.includes(TRACK)){
                            bonus_ids.push('train_bonus_2_track');
                        } if (args.rail_options.includes(WORKER)){
                            bonus_ids.push('train_bonus_3_worker');
                        } if (args.rail_options.includes(WOOD)){
                            bonus_ids.push('train_bonus_4_wood');
                        } if (args.rail_options.includes(FOOD)){
                            bonus_ids.push('train_bonus_4_food');
                        } if (args.rail_options.includes(STEEL)){
                            bonus_ids.push('train_bonus_4_steel');
                        } if (args.rail_options.includes(GOLD)){
                            bonus_ids.push('train_bonus_4_gold');
                        } if (args.rail_options.includes(COPPER)){
                            bonus_ids.push('train_bonus_4_copper');
                        } if (args.rail_options.includes(COW)){
                            bonus_ids.push('train_bonus_4_cow');
                        } if (args.rail_options.includes(VP)){
                            bonus_ids.push('train_bonus_5_vp');
                        }
                        for(let i in bonus_ids){
                            const id = bonus_ids[i];
                            console.log(`${i}: ${id}`);
                            dojo.addClass(id,'selectable');
                        }
                        this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingBonus');
                    break;
                    case 'payAuction':
                        dojo.place(PAYMENT_SECTION_ID, 'top');
                        this.silverCost = Number(args.auction_cost);
                        this.goldAmount = 0;
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        this.addActionButton( 'btn_done',      _('Done'),           'donePayAuction');
                        this.addActionButton( 'btn_more_gold', _('Use More ') +tkn_gold , 'raiseGold', null, false, 'gray');
                        this.addActionButton( 'btn_trade',     _('Trade'),  'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'),      'takeLoan',  null, false, 'gray');
                    break;
                    case 'chooseBuildingToBuild':
                    case 'trainStationBuild':
                        this.last_selected['building']="";
                        console.log(args.allowed_buildings);
                        //mark buildings as selectable
                        for(let i in args.allowed_buildings){
                            const building = args.allowed_buildings[i];
                            const building_divId = `${TPL_BLD_TILE}${building.building_key}`;
                            dojo.addClass(building_divId, 'selectable');
                        }
                        this.addActionButton( 'btn_choose_building', _('Build'),     'chooseBuilding');
                        if (args.riverPort){
                            this.addActionButton( 'btn_gold_cow',    tkn_gold +_(' As ') + tkn_cow,   'toggleGoldAsCow', null, false, 'red');
                            this.addActionButton( 'btn_gold_copper', tkn_gold +_(' As ') + tkn_copper, 'toggleGoldAsCopper', null, false, 'red');
                        }
                        this.addActionButton( 'btn_do_not_build', _('Do not Build'), 'doNotBuild', null, false, 'red');
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                        this.addActionButton( 'btn_redo_build_phase', _('Redo turn'),  'cancelTurn', null, false, 'red');
                    break;
                    case 'resolveBuilding':
                        if (args.building_bonus == BUILD_BONUS_WORKER){
                            this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+tkn_worker, 'workerForFreeBuilding');
                            this.addActionButton( 'btn_pass_bonus',  _('Pass on bonus'), 'passBuildingBonus', null, false, 'red');
                            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                        }
                    break;
                    case 'bonusChoice':
                        const option = Number(args.auction_bonus);
                        console.log('bonus option: ' + option);
                         
                        switch (option){
                            case AUCBONUS_WORKER:
                                this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ tkn_worker , 'workerForFree');
                            break;
                            case AUCBONUS_WORKER_RAIL_ADV:
                                this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ tkn_worker, 'workerForFree2');
                            break;
                            case AUCBONUS_WOOD_FOR_TRACK:
                                this.addActionButton( 'btn_wood_track', tkn_wood+" "+tkn_arrow+" "+tkn_track, 'woodForTrack');
                            break;
                            case AUCBONUS_COPPER_FOR_VP:
                                this.addActionButton( 'btn_copper_vp', tkn_copper+" "+tkn_arrow+" "+tkn_vp4, 'copperFor4VP');
                                if (args.riverPort){
                                    this.goldAsCopper = false;
                                    this.addActionButton( 'btn_gold_copper', tkn_gold +_(' As ') + tkn_copper, 'toggleGoldAsCopper', null, false, 'red');
                                }
                                break;
                            case AUCBONUS_COW_FOR_VP:
                                this.addActionButton( 'btn_cow_vp', tkn_cow+" "+tkn_arrow+" "+tkn_vp4, 'cowFor4VP');
                                if (args.riverPort){
                                    this.goldAsCow = false;
                                    this.addActionButton( 'btn_gold_cow',    tkn_gold +_(' As ') + tkn_cow,   'toggleGoldAsCow', null, false, 'red');
                                }
                                break;
                            case AUCBONUS_6VP_AND_FOOD_VP:
                            case AUCBONUS_FOOD_FOR_VP:
                                this.addActionButton( 'btn_food_vp', tkn_food+" "+tkn_arrow+" "+tkn_vp2, 'foodFor2VP');
                                break;
                        }
                        this.addActionButton( 'btn_pass_bonus',  _('Do not Get Bonus'), 'passBonus', null, false, 'red');
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                    break;
                    case 'confirmActions':
                        this.addActionButton( 'btn_done',   _('Done'),  'confirmBuildPhase');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'), 'cancelTurn', null, false, 'gray');
                    break;
                    case 'endGameActions':
                        this.addActionButton( 'btn_pay_loan_silver', _('Pay Loan ')+ tkn_silver, 'payLoanSilver', null, false, 'gray');
                        this.addActionButton( 'btn_pay_loan_gold', _('Pay Loan ')+ tkn_gold,   'payLoanGold', null, false, 'gray');
                        this.addActionButton( 'btn_trade',         _('Trade'),             'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_done',          _('Done'),              'doneEndgameActions');
                    break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        /***** Animations helper methods. *****/
        toggleAnimations: function(){
            if (this.animations){
                this.animations = false;
            } else {
                this.animations = true;
            }
        },

        movePlayerToTop: function (){
            const player_zone_divId = `player_zone_${this.player_color[this.player_id]}`;
            dojo.place(player_zone_divId, 'player_top', 'first');
        },

        movePlayerToNormal: function (){
            const player_zone_divId = `player_zone_${this.player_color[this.player_id]}`;
            dojo.place(player_zone_divId, 'player_zones', 'first');
        },

        /*** setup new Round ***/
        setupTiles: function(round_number, auction_tiles) {
            console.log("r# "+round_number );
            this.roundCounter.setValue(round_number);
            this.showCurrentAuctions(auction_tiles, round_number);
        },

        /**
         * Update the main building stock to match the current state.  
         * It should only be called on round 5 & 8, but could be called more.
         * @param {Array} buildings 
         */
        updateBuildingStocks: function(buildings){
            for (let b_key in buildings){
                const building = buildings[b_key];
                if (building.location == BLD_LOC_OFFER || building.location == BLD_LOC_DISCARD) {
                    this.addBuildingToOffer(building);
                }
            }
        },

        setupAuctionTiles: function (auctions){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location !=AUCLOC_DISCARD) {
                    color = ASSET_COLORS[10+Math.ceil(a_id/10)];
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), 'future_auction_zone');
                    dojo.style(`${TPL_AUC_TILE}${a_id}`, 'order', a_id);
                }
            }
        },


        /**
         * setup auction cards for the current round in the Auction board.
         * The intent is that this will be called when a new round is started,
         * as well as on initial setup once the auction_zones have been configured.
         * 
         * @param {Array} auctions 
         * @param {Number} current_round 
         */
        showCurrentAuctions: function (auctions, current_round){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location !=AUCLOC_DISCARD && auction.position == current_round) {
                    this.auction_zones[auction.location].placeInZone(`${TPL_AUC_TILE}${a_id}`);
                }
            }
        },

        /**
         * The plan is for this to be called after each auction tile is resolved (building & bonuses)
         * it should remove the auction tile at auction_no, so that it is clear what state we are at. 
         * @param {Number} auction_no 
         */
        clearAuction: function(auction_no){
            const auc_id = dojo.query(`#${this.auction_ids[auction_no]} .auction_tile`)[0].id
            if (auc_id != null){
                this.auction_zones[auction_no].removeFromZone(auc_id, true);
            }
        },

        /***** building utils *****/

        addBuildingToPlayer: function(building){
            const b_id = building.b_id;
            const b_key = building.b_key;
            const b_divId = `${TPL_BLD_TILE}${b_key}`;
            if ($(this.player_building_zone_id[building.p_id]).parentElement.id.startsWith(TPL_BLD_ZONE) ){
                return;
            }
            if ($(b_divId) != null){ // if element already exists, just move it.
                const wasInMain = (dojo.query( `#${BUILDING_ZONE_DIVID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
                if (wasInMain){
                    this.main_building_diag[b_id].removeFromZone(b_divId);
                    this.player_building_zone[building.p_id].placeInZone(b_divId, b_key);
                    if ((this.main_building_counts[building.b_id]--) == 1){
                        this.removeBuildingZone(b_id);
                    }
                } else {
                    this.player_building_zone[building.p_id].placeInZone(b_divId, b_key);
                }
            } else { // create it as well;
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), BUILDING_ZONE_DIVID[BLD_LOC_FUTURE]);
                this.player_building_zone[building.p_id].placeInZone(`${TPL_BLD_TILE}${b_key}`, b_key);
            }
            this.addBuildingWorkerSlots(building);
            if (building.p_id == this.player_id){
                this.updateHasBuilding(b_id); 
            }
        },

        addBuildingToOffer: function(building){
            const b_divId = `${TPL_BLD_TILE}${building.b_key}`;
            const b_loc = BUILDING_ZONE_DIVID[building.location];
            if (document.querySelector(`#${b_loc} #${b_divId}`) != null){ 
                return; //if already correct, do nothing.
            }
            this.createBuildingZoneIfMissing(building);
            const zone_id = `${TPL_BLD_STACK}${building.b_id}`;
            if (document.querySelector(`#${b_loc} #${zone_id}`) == null){
                dojo.place(zone_id, b_loc);
            }
            if ($(b_divId) == null){ //if missing make the building 
                dojo.place(this.format_block( 'jstpl_buildings', {key: building.b_key, id: building.b_id}), b_loc);
                this.main_building_diag[building.b_id].placeInZone(b_divId);
                dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                this.main_building_counts[building.b_id]++;
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (this.main_building_diag[b_id] == null){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), BUILDING_ZONE_DIVID[building.location]);
                this.main_building_diag[b_id] = new ebg.zone();
                this.main_building_diag[b_id].create (this, `${TPL_BLD_STACK}${building.b_id}`);
                this.main_building_diag[b_id].setPattern('diagonal');
                this.main_building_diag[b_id].item_margin = 10;
                this.main_building_counts[b_id] = 0;
            }
        },

        removeBuildingZone(b_id){
            this.fadeOutAndDestroy( `${TPL_BLD_STACK}${b_id}`);
            this.main_building_diag[b_id]= null;
        },

        cancelBuild: function(building){
            const b_divId = `${TPL_BLD_TILE}${building.b_key}`;
            this.createBuildingZoneIfMissing(building);
            this.player_building_zone[p_id].removeFromZone(b_divId);
            this.main_building_diag[building.b_id].item_margin.placeInZone(b_divId);
            this.main_building_counts[building.b_id]++;
            if (this.player_id == building.p_id){//remove from hasBuilding
                this.hasBuilding.splice(building.b_id, 1); 
            }
        },
        
        updateHasBuilding(b_id) {
            if (this.hasBuilding[b_id] == null)
                this.hasBuilding[b_id] = true;
        },

        /***** Bid utils *****/
        /**(see constants.inc for BidlocationMapping)
         * but in general we want bid_slot_1_3 to map to 1 (BID_A1_B3 ==1 in constants...)
         * of note the bids from auction 1 are 1-9 (that's why I use this:(aucNo-1)*10)
         * and there are 9 bid slots, 
         * so we can get their mapping using BID_VAL_ARR.indexOf 
         * which lists the bid cost values in an array. 
         * @param {String} bidLoc_divId (id of bid location to get bidNo from)
         */
        getBidNoFromSlotId: function(bidLoc_divId){
            const split_bid = bidLoc_divId.split("_");
            console.log( "bidLoc_divId -> " + bidLoc_divId + "split_bid -> " + split_bid);
            const aucNo = Number(split_bid[2]);
            const bid_no = BID_VAL_ARR.indexOf(Number(split_bid[3])) + 1;
            // bids start at 1 
            console.log( "aucNo -> " + aucNo + " bid_no -> " + bid_no);
            return ((aucNo-1)*10 + bid_no);
        },

        /**
         * the goal of this is to allow getting values for working with
         * this.bid_zones
         * allowing you to know which values to use to select the correct zone.
         * ex:  
         *      const bid_val = getBidPairFromBidNo(bid_no);
         *      this.bid_zones[bid_val.auction_no][bid_pair.bid_index].placeInZone();
         * 
         * @param {Number} bid_no to get auction_no and bid_index from
         */
        getBidPairFromBidNo: function(bid_no){
            const auction_no = Math.ceil(bid_no/10);
            const bid_index = Number(bid_no%10) -1;
            return {
                auction_no,
                bid_index,
            };
        },

        showUndoTransactionsButtonIfPossible: function(){
            dojo.removeClass(UNDO_TRADE_BTN_ID, 'noshow');
        },

        hideUndoTransactionsButtonIfPossible: function(){
            dojo.addClass(UNDO_TRADE_BTN_ID, 'noshow');
        },
        
        disableTradeIfPossible: function() {
            if (dojo.query('#trade_board .selectable').length >0){
                dojo.place('trade_board', 'trade_bottom', 'first');
                // now make the trade options not selectable
                this.clearSelectable('trade', true);
                if (!dojo.hasClass(CONFIRM_TRADE_BTN_ID, 'noshow') ){
                    dojo.addClass( CONFIRM_TRADE_BTN_ID, 'noshow');
                }
            }
        },

        enableTradeIfPossible: function() {
            if (!dojo.query('#trade_board .selectable').length >0){
                // make space for it, and move trade board to top.
                dojo.place('trade_board', 'trade_top', 'first');
                this.last_selected['trade']='';
                //make the trade options selectable
                dojo.query('div#trade_board .trade_option:not([id^="trade_market"]):not([id^="trade_bank"])').addClass('selectable');
                if (this.hasBuilding[BLD_MARKET] != null){
                    dojo.query('#trade_board [id^="trade_market"]').addClass('selectable');
                }
                if (this.hasBuilding[BLD_BANK] != null){
                    dojo.query('#trade_board [id^="trade_bank"]').addClass('selectable');
                }
            }
        },

        moveBid: function(p_id, bid_loc){
            const bid_divId = this.bid_token_divId[p_id];
            console.log("id:" + bid_divId + ", loc:"+ bid_loc );
            const parent_id = document.querySelector(`#${bid_divId}`).parentElement.id;
            if (bid_loc == OUTBID || bid_loc == NO_BID|| bid_loc == BID_PASS) {
                this.bid_zones[ZONE_PENDING].placeInZone(bid_divId);
            } else { 
                const bid_pair = this.getBidPairFromBidNo(bid_loc);
                this.bid_zones[bid_pair.auction_no][bid_pair.bid_index].placeInZone(bid_divId);
            }
            if (parent_id.startsWith('bid_slot_')){
                const split_Id = parent_id.toString().split("_");
                this.bid_zones[split_Id[2]][BID_VAL_ARR_BACK[split_Id[3]]].removeFromZone(bid_divId);
                dojo.style( parent_id , 'height', this.bid_height+'px');
            } else {
                this.bid_zones[ZONE_PENDING].removeFromZone(bid_divId);
            }
        },

        getResourceTypeAsInt: function( type ){
            switch (type){
                case 'wood':   return WOOD;
                case 'steel':  return STEEL;
                case 'gold':   return GOLD;
                case 'copper': return COPPER;
                case 'food':   return FOOD;
                case 'cow':    return COW;
                case 'trade':  return TRADE;
                case 'track':  return TRACK;
                case 'worker': return WORKER;
                case 'vp':     return VP;
                case 'silver': return SILVER;
                case 'loan':   return LOAN;
            }
        },

        /**
         * This will clear the selectable and selected (if true) flags from assets by type.
         * type locators are set in global TYPE_SELECTOR.
         * if selected is true it will also clear the last_selected[] for this type
         */
        clearSelectable: function(type, selected = false){
            console.log(`clearing ${type} selectable/selected`);
            
            const selectables = dojo.query(TYPE_SELECTOR[type]);
            selectables.removeClass('selectable');
            
            if (selected == true && this.last_selected[type] != ""){
                console.log("clearing selected:"+ this.last_selected[type]);
                dojo.removeClass(this.last_selected[type], 'selected');
                this.last_selected[type] = "";
            }
        },

        /**
         * this will toggle selection of element of type defined by type;
         * @param {*} type 
         * @param {*} selected_id 
         */
        updateSelected: function(type, selected_id) {
            // if not selectable, ignore the call.
            console.log ('updated selected type: '+type);
            if (!( dojo.hasClass (selected_id, 'selectable')))
            { return; }
            // clear previously selected
            if (! this.last_selected[type] == ""){
                dojo.removeClass(this.last_selected[type], 'selected');
                if (this.last_selected[type] == selected_id){
                    this.last_selected[type] = "";
                    return;
                }
            }
            // select newly selected
            dojo.addClass(selected_id, 'selected');
            this.last_selected[type] = selected_id;
        },

        ///////////////////////////////////////////////////
        //// Player's action

        /***** COMMON ACTIONS (multiple states) *****/
        takeLoan: function(){
            if( this.checkAction( 'takeLoan')){
                this.ajaxcall( "/homesteaders/homesteaders/takeLoan.html", {lock: true}, this, 
                function( result ) {
                    this.showUndoTransactionsButtonIfPossible();
                }, function( is_error) {} );     
            }
        },

        hidePaymentSection: function(){
            dojo.place(PAYMENT_SECTION_ID, 'payment_bottom', 'first');
        },

        showPaymentSection: function(){
            dojo.place(PAYMENT_SECTION_ID, 'payment_top', 'first');
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost +=5;
            this.silverCounter.setValue(Math.max(0,this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
            if(this.goldAmount == 0){
                this.fadeOutAndDestroy( 'btn_less_gold' );
            }
        },
        raiseGold: function(){
            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= 5;
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
            if($('btn_less_gold') == null){
                const tkn_gold = this.format_block( 'jstpl_resource_inline', {type:'gold'}, ); 
                this.addActionButton( 'btn_less_gold', _('Use Less ')+ tkn_gold, 'lowerGold', null, false, 'gray');
                dojo.place('btn_less_gold', 'btn_more_gold', 'after');
            }
        },

        /***** TRADE *****/
        onSelectTradeAction: function( evt){
            console.log( 'onClickOnTradeSlot' );
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            this.updateSelected('trade', evt.target.id);
            if (dojo.hasClass( evt.target.id ,'selected')){
                console.log( 'trade is selected' );
                if (dojo.hasClass(CONFIRM_TRADE_BTN_ID, 'noshow')){
                    dojo.removeClass(CONFIRM_TRADE_BTN_ID, 'noshow');    
                }
            } else if (!dojo.hasClass(CONFIRM_TRADE_BTN_ID, 'noshow') ){
                dojo.addClass(CONFIRM_TRADE_BTN_ID, 'noshow');
            }
        },

        confirmTradeButton: function ( evt ){
            if (this.last_selected['trade'] == "") { return; }
            var tradeAction = this.last_selected['trade'].substring(6);
            this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                lock: true, 
                trade_action: tradeAction
             }, this, function( result ) {
                this.showUndoTransactionsButtonIfPossible();
             }, function( is_error) {});
        },

        undoTransactionsButton: function( ){
            if( this.checkAction( 'trade' ) ){
                this.ajaxcall( "/homesteaders/homesteaders/undoTransactions.html", { 
                    lock: true, 
                 }, this, function( result ) {
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible();
                 }, function( is_error) {});
            }
        },

        tradeActionButton: function(){
            if( this.checkAction( 'trade' ) ){
                // if trade options already displayed, set done.
                if (dojo.query('#trade_board .selectable').length >0){ 
                    this.disableTradeIfPossible();
                    return;
                }
                this.enableTradeIfPossible();
            }
        },

        toggleShowAuctions: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            if(dojo.hasClass('future_auction_zone','noshow')){
                dojo.removeClass('auction_string', 'noshow');
                dojo.removeClass('future_auction_zone','noshow');
            } else {
                dojo.addClass('auction_string', 'noshow');
                dojo.addClass('future_auction_zone','noshow');
            }
        },

        toggleShowBldDiscard: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            if(dojo.hasClass(BUILDING_ZONE_DIVID[BLD_LOC_DISCARD],'noshow')){
                $('bld_discard').innerText = _('Hide Discarded Buildings');
                dojo.removeClass(BUILDING_ZONE_DIVID[BLD_LOC_DISCARD],'noshow');
            } else {
                $('bld_discard').innerText = _('Show Discarded Buildings');
                dojo.addClass(BUILDING_ZONE_DIVID[BLD_LOC_DISCARD],'noshow');
            }
        },

        toggleShowBldFuture: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            if(dojo.hasClass(BUILDING_ZONE_DIVID[BLD_LOC_FUTURE],'noshow')){
                $('bld_future').innerText = _('Hide Future Buildings');
                dojo.removeClass(BUILDING_ZONE_DIVID[BLD_LOC_FUTURE],'noshow');
            } else {
                $('bld_future').innerText = _('Show Future Buildings');
                dojo.addClass(BUILDING_ZONE_DIVID[BLD_LOC_FUTURE],'noshow');
            }
        },

        /***** PLACE WORKERS PHASE *****/
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, 
                function( result ) {
                    this.showUndoTransactionsButtonIfPossible();
                }, 
                function( is_error) { } );                
            }
        },

        donePlacingWorkers: function(){
            if( this.checkAction( 'done')){
                const tokenZone = this.token_divId[this.player_id];
                if (dojo.query(`#${tokenZone} .token_worker`).length >0 ){
                    this.confirmationDialog( _('You still have workers to assign, Continue?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
                    function( result ) { 
                    this.disableTradeIfPossible();
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.hideUndoTransactionsButtonIfPossible();
                }, 
                function( is_error) { } );
                } ) );
            } else {
                this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.hideUndoTransactionsButtonIfPossible();
                    }, function( is_error) {  } ); 
                }
            }
        },
        
        onClickOnWorker: function( evt )
        {
            console.log( 'onClickOnWorker' );
            evt.preventDefault();
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            if ( !this.checkAction( 'placeWorker' ) ) { return; }

            this.updateSelected('worker', evt.target.id);
        },

        onClickOnWorkerSlot: function( evt )
        {
            console.log( 'onClickOnWorkerSlot' );
            dojo.stopEvent( evt );
            const target_divId = evt.target.id;
            if (target_divId.startsWith('token_worker')){// call click on worker
                return this.onClickOnWorker(evt);
            }
            if (!dojo.hasClass(target_divId, "selectable")) { 
                if (evt.target.parentNode.classList.contains('selectable')){
                    return this.onClickOnBuilding(evt, true);
                }
                return; }
            if( ! this.checkAction( 'placeWorker' ) )
            { return; }

            if (this.last_selected['worker'] == ""){
                const unassignedWorkers = dojo.query(`#token_zone_${this.player_color[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
                } else {
                    this.last_selected['worker'] = unassignedWorkers[0].id;
            }
        }
        if (document.querySelector(`#${target_divId} .worker_slot`)){
                if (!target_divId.startsWith('slot_3')){
                    this.showMessage(_("You have already assigned a worker there"), 'error');
                    return;
                }
            }
            console.log( `target: ${target_divId}` );
            const building_key = Number(target_divId.split('_')[2]);
            if(target_divId.startsWith('slot_1')){
                var building_slot = 1; 
            } else if(target_divId.startsWith('slot_2')){
                var building_slot = 2;
            } else {
                var building_slot = 3;
            }
            const w_key = this.last_selected['worker'].split('_')[2];
            this.ajaxcall( "/homesteaders/homesteaders/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: w_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {
                dojo.removeClass(this.last_selected['worker'], 'selected');
                this.last_selected['worker'] = '';
             }, function( is_error) { });
        },
        /***** PAY WORKERS PHASE *****/
        donePayingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/payWorkers.html", {
                    gold: this.goldAmount, lock: true}, this, 
                function( result ) { 
                    this.hidePaymentSection();
                    this.disableTradeIfPossible(); }, 
                function( is_error) { } ); 
            }
        },

        confirmDummyBidButton: function ( evt )
        {
            if( this.checkAction( 'dummy' )){
                if (this.last_selected['bid'] == ""){
                    this.showMessage( _("You must select 1 bid_slot"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(this.last_selected['bid']);
                this.ajaxcall( "/homesteaders/homesteaders/confirmDummyBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        /***** PLAYER BID PHASE *****/
        onClickOnBidSlot: function ( evt ) 
        {
            console.log( 'onSelectBidSlot' );
            evt.preventDefault();
            dojo.stopEvent( evt );
            var bid_loc_divId = evt.target.id;
            if (bid_loc_divId.startsWith('token')) { // if clicked on token in bid_slot
                bid_loc_divId = evt.target.parentNode.id; 
            }
            if ( !dojo.hasClass(bid_loc_divId, "selectable")) { return; }
            if ( !this.checkAction( 'selectBid' )) { return; }
            this.updateSelected('bid', bid_loc_divId);
        },

        passBidButton: function() {
            if( this.checkAction( 'pass')){
                this.ajaxcall( "/homesteaders/homesteaders/passBid.html", {lock: true}, this, 
                function( result ) { this.clearSelectable('bid', true); }, 
                function( is_error) { } );                
            }
        },

        confirmBidButton: function () 
        {
            if( this.checkAction( 'confirmBid')){
                if (this.last_selected['bid'] == ""){
                    this.showMessage( _("You must select 1 bid_slot"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(this.last_selected['bid']);
                this.ajaxcall( "/homesteaders/homesteaders/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        /***** PAY AUCTION PHASE *****/
        donePayAuction: function(){
            if( this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/payAuction.html", {gold: this.goldAmount, lock: true}, this, 
                function( result ) { 
                    this.hidePaymentSection();
                    this.disableTradeIfPossible(); 
                    this.hideUndoTransactionsButtonIfPossible();
                }, function( is_error) { } ); 
            }
        },

        cancelTurn: function() {
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/homesteaders/homesteaders/cancelTurn.html", {lock: true}, this, 
                function( result ) { 
                    this.hideUndoTransactionsButtonIfPossible();    
                }, function( is_error) { } ); 
            }
        },

        /***** CHOOSE BONUS OPTION *****/
        onSelectBonusOption: function( evt ){
            console.log( 'onSelectBonusOption' );
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( !dojo.hasClass(evt.target.id,'selectable')){ return; }
            if( this.checkAction( 'chooseBonus' )) {
                this.updateSelected('bonus', evt.target.id);
            }
        },

        doneSelectingBonus: function(){
            if (this.checkAction( 'chooseBonus' )){
                if (this.last_selected['bonus'] == ""){ 
                    this.showMessage( _("You must select 1 bonus"), 'error' );
                    return;
                 }
                const type = this.last_selected['bonus'].split('_')[3];
                const typeNum = this.getResourceTypeAsInt(type);
                this.ajaxcall( "/homesteaders/homesteaders/doneSelectingBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.disableTradeIfPossible();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
                
            }
        },

        /***** BUILD BUILDING PHASE *****/
        onClickOnBuilding: function( evt , parent=false){
            console.log( 'onClickOnBuilding' );
            console.log( evt);
            evt.preventDefault();
            dojo.stopEvent( evt );
            let target_id = evt.target.id;
            if (parent) {target_id = evt.target.parentNode.id;}
            else if (target_id.startsWith('token_worker'))
            { return this.onClickOnWorker( evt ); }
            else if (target_id.startsWith('slot_')){
                return this.onClickOnWorkerSlot( evt ); 
            }
            if( !dojo.hasClass(target_id, 'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                this.updateSelected('building', target_id);
            }
        },

        chooseBuilding: function () {
            if (this.checkAction( 'buildBuilding')){
                const building_divId = this.last_selected['building'];
                console.log(building_divId);
                if (building_divId == "") {
                    this.showMessage( _("You must select 1 building"), 'error' );
                    return;
                }
                const building_key = Number(building_divId.split("_")[2]);
                this.ajaxcall( "/homesteaders/homesteaders/buildBuilding.html", 
                {building_key: building_key, goldAsCow:this.goldAsCow, goldAsCopper:this.goldAsCopper, lock: true}, this, 
                        function( result ) { 
                            this.disableTradeIfPossible();
                            this.clearSelectable('building', true);
                            this.hideUndoTransactionsButtonIfPossible();
                        }, function( is_error) { } );
            }
        },

        toggleGoldAsCopper: function(){
            if (this.goldAsCopper){
                this.goldAsCopper = false;
                dojo.removeClass('btn_gold_copper', 'bgabutton_blue');
                dojo.addClass('btn_gold_copper', 'bgabutton_red');
            } else {
                this.goldAsCopper = true;
                dojo.removeClass('btn_gold_copper', 'bgabutton_red');
                dojo.addClass('btn_gold_copper', 'bgabutton_blue');
            }
        },

        toggleGoldAsCow: function() {
            if (this.goldAsCow) {
                this.goldAsCow = false;
                dojo.removeClass('btn_gold_cow', 'bgabutton_blue');
                dojo.addClass('btn_gold_cow', 'bgabutton_red');
            } else {
                this.goldAsCow = true;
                dojo.removeClass('btn_gold_cow', 'bgabutton_red');
                dojo.addClass('btn_gold_cow', 'bgabutton_blue');
            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.confirmationDialog( _('Are you sure you want to not build?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/doNotBuild.html", {lock: true}, this, 
                    function( result ) { 
                        this.clearSelectable('building', true); 
                        this.disableTradeIfPossible();
                        this.hideUndoTransactionsButtonIfPossible();
                    }, function( is_error) { } );
                } ) ); 
                return; 
            }
        },

        updateScoreForBuilding: function (p_id, b_id) {
            var value = 0;
            switch(b_id){
                case BLD_FORGE:
                    value = 1;
                break;
                case BLD_GRAIN_MILL: 
                case BLD_MARKET:
                case BLD_GENERAL_STORE:
                case BLD_WORKSHOP:
                case BLD_MEATPACKING_PLANT:
                    value = 2;
                break;
                case BLD_BANK:
                case BLD_DUDE_RANCH:
                case BLD_TRAIN_STATION:
                    value = 3;
                break;
                case BLD_RODEO:
                case BLD_LAWYER:
                    value = 4;
                break;
                case BLD_FACTORY:
                case BLD_FAIRGROUNDS:
                case BLD_TERMINAL:
                case BLD_RAIL_YARD:
                    value = 6;
                break;
                case BLD_RESTARAUNT:
                case BLD_CIRCUS:
                    value = 8;
                    break;
                case BLD_CHURCH:
                case BLD_TOWN_HALL:
                    value = 10;
                break;
            }
            this.player_score_counter[p_id].incValue(value);
        },

        /***** Building Bonus *****/

        workerForFreeBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
            this.ajaxcall( "/homesteaders/homesteaders/freeHireWorker.html", {lock: true, auction:false}, this, 
            function( result ) { }, 
            function( is_error) { } );}
        },
        
        passBuildingBonus: function (){
            if (this.checkAction( 'buildBonus' )){
                this.confirmationDialog( _('Are you sure you want to pass on bonus?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/passBuildingBonus.html", {lock: true}, this, 
                    function( result ) { }, 
                    function( is_error) { } );
                } ) );
            } 
        },

        /***** Auction Bonus *****/
        /**
         * called when auction bonus is only worker for Free
         */
        workerForFree: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/freeHireWorker.html", {lock: true, rail: false, auction:true }, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        /**
         * called when auction bonus is worker for free and rail advancement. (it passes rail:true so )
         */
        workerForFree2: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/freeHireWorker.html", {lock: true, rail: true, auction:true}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        woodForTrack: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/woodForTrack.html", {lock: true}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        copperFor4VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                var useGold = false;
                if (this.goldAsCopper)
                    useGold = true;
                this.ajaxcall( "/homesteaders/homesteaders/copperForVp.html", {lock: true, useGold: useGold}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        cowFor4VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                var useGold = false;
                if (this.goldAsCow)
                    useGold = true;
                this.ajaxcall( "/homesteaders/homesteaders/cowForVp.html", {lock: true, useGold: useGold}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        foodFor2VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/foodForVp.html", {lock: true}, this, 
                function( result ) {
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        passBonus: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.confirmationDialog( _('Are you sure you want to pass on bonus?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/passAuctionBonus.html", {lock: true}, this, 
                    function( result ) { 
                        this.disableTradeIfPossible();
                        this.hideUndoTransactionsButtonIfPossible(); }, 
                    function( is_error) { } );
                } ) ); 
            }
        },

        /***** endBuildRound *****/
        confirmBuildPhase: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/confirmChoices.html", {lock: true}, this, 
                    function( result ) { }, 
                    function( is_error) { } );
            }
        },

        /***** END game actions *****/
        payLoanSilver: function() {
            if (this.checkAction( 'payLoan' )){
                this.ajaxcall( "/homesteaders/homesteaders/payLoan.html", {lock: true, gold:false}, this, 
                function( result ) { }, 
                function( is_error) { } );
            }
        },

        payLoanGold: function () {
            if (this.checkAction( 'payLoan' )){
                this.ajaxcall( "/homesteaders/homesteaders/payLoan.html", {lock: true, gold:true}, this, 
                function( result ) { }, 
                function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/doneEndgameActions.html", {lock: true}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your homesteaders.game.php file.
        
        */
       
        setupNotifications: function(cancel_move_ids)
        {
            console.log ( 'notifications subscriptions setup' );
            var notifs = [
                ['updateAuction', 500],
                ['updateBuildingStocks', 1000],
                ['gainWorker', 200],
                ['gainTrack', 200],
                ['workerMoved', 200],
                ['railAdv', 250],
                ['moveBid', 250],
                ['moveFirstPlayer', 100],
                ['buildBuilding', 1000],
                ['playerIncome', 200],
                ['playerIncomeGroup', 500],
                ['playerPayment', 200],
                ['playerPaymentGroup', 500],
                ['trade', 200],
                ['loanTaken', 500],
                ['loanPaid', 500],
                ['clearAllBids', 250],
                ['cancel', 500],
              ];

            notifs.forEach(notif => {
                dojo.subscribe(notif[0], this, "notif_" + notif[0]);
                this.notifqueue.setSynchronous(notif[0], notif[1]);
            });        
        },  
        
        /** Override this function to inject html for log items  */

        /* @Override */
        format_string_recursive: function (log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    
                    if (!this.isSpectator)
                        args.You = this.divYou(); // will replace ${You} with colored version
                    
                    // other known variables
                    if (args.type != null){
                        if (typeof (args.type) == "string"){
                            args.amount = 1;
                            args.typeStr = args.type;
                            args.type = this.getOneResourceAsDiv(args.type, 1);
                        } else {
                            args.typeStr = args.type.type;
                            args.amount = args.type.amount;
                            args.type = this.getOneResourceAsDiv(args.typeStr, args.amount);
                        }
                    }
                    if (args.arrow != null){
                        args.arrow = this.format_block('jstpl_resource_inline', {type: 'arrow'});
                    }
                    if (args.track != null && typeof args.track == 'string'){
                        args.track = this.format_block('jptpl_track_log', {type: 'track'});
                    }
                    if (args.loan != null && typeof args.loan == 'string'){
                        args.loan = this.format_block('jptpl_track_log', {type: 'loan'});
                    }    

                    if (args.token != null && typeof (args.null != "string")){
                        if (args.token.color != null) {
                            var color = args.token.color;
                        } else {
                            var color = this.player_color[args.token.player_id];
                        }
                        if (args.token.type != null) {
                            var type = args.token.type;
                        } else {
                            var type = args.token.token;
                        }
                        args.token = this.format_block('jstpl_player_token_log', {"color" : color, "type" : type});
                    }
                    if (args.reason_string != null && typeof (args.reason_string) != "string"){
                        if (args.reason_string.type != null){
                            let color = ASSET_COLORS[Number(args.reason_string.type)];
                            args.reason_string = this.addColor(args.reason_string.str, color);
                        } else if (args.reason_string.token != null) {
                            const color = this.player_color[args.reason_string.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string.token});
                        } else if (args.reason_string.worker != null) {
                            args.reason_string = this.getOneResourceAsDiv('worker', 1);
                        } else if (args.reason_string.track != null) {
                            args.reason_string = this.format_block('jptpl_track_log', {type:'track'});
                        }
                    }
                    if (args.building_name != null && typeof (args.building_name) != "string"){
                        let color = ASSET_COLORS[Number(args.building_name.type)];
                        args.building_name = this.addColor(args.building_name.str, color);
                    }
                    if (args.auction != null && typeof (args.auction) != 'string'){
                        let color = ASSET_COLORS[Number(args.auction.key)+10];
                        args.auction = this.addColor(args.auction.str, color);
                    }
                    
                    if (args.tradeAway != null){
                        args.tradeAway_arr = args.tradeAway;
                        args.tradeFor_arr = args.tradeFor;
                        args.tradeAway = this.getResourceArrayAsDiv(args.tradeAway_arr);
                        args.tradeFor = this.getResourceArrayAsDiv(args.tradeFor_arr);
                    }
                    
                    if (args.resources != null){
                        args.resource_arr = args.resources;
                        args.resources = this.getResourceArrayAsDiv(args.resources);
                    }
                }
            } catch (e) {
                console.error(log,args,"Exception thrown", e.stack);
            }
            return this.inherited(arguments);
        },

        divYou : function() {
            var color = this.gamedatas.players[this.player_id].color;
            var color_bg = "";
            if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
                color_bg = "background-color:#" + this.gamedatas.players[this.player_id].color_back + ";";
            }
            var you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + __("lang_mainsite", "You") + "</span>";
            return you;
        },
            
        addColor: function(string, color) {
            return this.format_block('jstpl_color_log', {string:string, color:color});
        },

        getOneResourceAsDiv: function(type, amount){
            var resString = '<div class="log_container">';
            if (amount > 0){ 
                var tokenDiv = this.format_block('jstpl_resource_log', {type : type});
                for(let i=0; i < amount; i++){
                    resString += `${tokenDiv}`;
                }
            }
            return resString +"</div>";
        },

        getResourceArrayAsDiv: function( array){
            var aggregateString = '<div class="log_container">';
            for (let type in array){
                let amt = array[type];
                if (amt > 0){ 
                    var tokenDiv = this.format_block('jstpl_resource_log', {"type" : type});
                    for(let i=0; i < amt; i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + "</div>";
        },

        notif_updateAuction: function( notif ) {
            console.log ( 'notif_updateAuction' );
            console.log ( notif );
            if (notif.args.state == 'discard') {
                this.auction_zones[notif.args.auction_no].removeAll();
                const bid_token = dojo.query(`[id^="bid_slot_${notif.args.auction_no}"] [id^="token_bid"]`);
                for(let i in bid_token){
                    if (bid_token[i].id != null){
                        this.bid_zones[ZONE_PENDING].placeInZone(bid_token[i].id);
                    }
                }
            } else if (notif.args.state == 'show'){
                for (let i in notif.args.auctions){
                    const auction = notif.args.auctions[i];
                    this.auction_zones[auction.location].placeInZone(`${TPL_AUC_TILE}${auction.a_id}`);
                }
            }
        },

        notif_updateBuildingStocks: function ( notif ){
            console.log ( 'notif_updateBuildings' );
            this.updateBuildingStocks(notif.args.buildings);
            this.showHideButtons();
        },

        notif_playerPass: function( notif ){
            console.log ( 'notif_playerPass' );
        },

        notif_workerMoved: function( notif ){
            console.log ( 'notif_workerMoved' );
            console.log ( notif );
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            const parent_id =  $(worker_divId).parentElement.id;
            this.building_worker_zones[Number(notif.args.building_key)][Number(notif.args.building_slot)].placeInZone(worker_divId);
            if (parent_id.startsWith("slot_")){
                const split_Id = parent_id.toString().split("_");  
                this.building_worker_zones[Number(split_Id[2])][Number(split_Id[1])].removeFromZone(worker_divId);
                dojo.style( parent_id , 'height', this.worker_height.toString()+'px');
            } else {
                this.token_zone[notif.args.player_id].removeFromZone(worker_divId);
            } 
            if (notif.args.building_slot == 3){
            }
        },

        notif_railAdv: function( notif ){
            console.log ('notif_railAdv');
            console.log ( notif );
            const train_token = this.train_token_divId[notif.args.player_id];
            const parent_no = $(train_token).parentNode.id.split("_")[2];
            this.rail_adv_zone[parent_no].removeFromZone(train_token);
            this.rail_adv_zone[notif.args.rail_destination].placeInZone(train_token);
        }, 

        notif_gainWorker: function( notif ){
            console.log ('notif_gainWorker');
            console.log ( notif );
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_token', 
                    {type:'worker', id: notif.args.worker_key}), 
                    this.token_divId[Number(notif.args.player_id)] );
            this.token_zone[notif.args.player_id].placeInZone(worker_divId);
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers" && notif.args.player_id == this.player_id){
                    dojo.addClass(worker_divId, 'selectable');
                }                
            }
        },

        notif_gainTrack: function( notif ){
            console.log ('notif_gainTrack');
            console.log ( notif );
            
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: this.player_color[Number(notif.args.player_id)]}),
                    this.token_divId[Number(notif.args.player_id)]);
            
            if (notif.args.tradeAway_arr != null){
                var destination = this.getTargetFromNotifArgs(notif);
                const player_zone_divId = `player_board_${notif.args.player_id}`;
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo' , player_zone_divId, destination,  500 , 100*i );
                        if (notif.args.player_id == this.player_id){
                            this.resourceCounters[type].incValue(-1);
                        }
                    }
                }
            }
        },

        notif_moveBid: function( notif ){
            console.log ('notif_moveBid');
            console.log ( notif );
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        notif_moveFirstPlayer: function (notif ){
            console.log ('notif_moveFirstPlayer');
            const p_id = Number(notif.args.player_id);
            const tile_id = FIRST_PLAYER_ID;
            if (p_id != this.first_player){
                this.player_building_zone[this.first_player].removeFromZone(tile_id);
                this.player_building_zone[p_id].placeInZone(tile_id, 0);
                this.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                this.moveBid(i, BID_PASS);
            }
        },

        notif_buildBuilding: function( notif ){
            console.log ('notif_buildBuilding');
            //console.log ( notif ); 

            this.addBuildingToPlayer(notif.args.building);
            this.updateScoreForBuilding(notif.args.player_id, notif.args.building['b_id']);
            
            var destination = `${TPL_BLD_TILE}${Number(notif.args.building.b_key)}`; 
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            var delay = 0;
            console.log(notif.args.resource_arr);
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                console.log(`${type}: ${amt} `);
                for(let i = 0; i < amt; i++){
                    console.log("sending token '"+type+"' to '"+ destination+ "'");
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone_divId, destination , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
        },

        notif_playerIncome: function( notif ){
            console.log ('notif_playerIncome');
            //console.log ( notif);

            var start = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            for(let i = 0; i < notif.args.amount; i++){
                console.log(`sending token '${notif.args.type}' from '${start}' to '${player_zone_divId}'`);
                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:String(notif.args.typeStr)}), 'limbo', start , player_zone_divId , 500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    if (VP_TOKENS.includes(notif.args.typeStr)){
                        this.resourceCounters['vp'].incValue(Number(notif.args.typeStr.charAt(2)));    
                    } else{ // normal case
                        this.resourceCounters[notif.args.typeStr].incValue(1);
                    }
                    
                }
            }  
        },

        notif_playerIncomeGroup: function( notif ){
            console.log ('notif_playerIncomeGroup');
            console.log ( notif);

            var start = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', start , player_zone_divId , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        if (VP_TOKENS.includes(notif.args.typeStr)){
                            this.resourceCounters['vp'].incValue(Number(notif.args.typeStr.charAt(2)));    
                        } else{ // normal case
                            this.resourceCounters[type].incValue(1);
                        }
                    }
                }   
            }
        },

        notif_playerPayment: function( notif ){
            console.log ('notif_playerPayment');
            //console.log ( notif);
            
            var destination = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:notif.args.typeStr}), 'limbo' , player_zone_divId, destination,  500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.typeStr].incValue(-1);
                }
            }
        },

        notif_playerPaymentGroup: function( notif ){
            console.log ('notif_playerPaymentGroup');
            console.log ( notif );

            var destination = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            var delay = 0;
            console.log(notif.args.resource_arr);
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                console.log(`${type}: ${amt} `);
                for(let i = 0; i < amt; i++){
                    console.log("sending token '"+type+"' to '"+ destination+ "'");
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone_divId, destination , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
        },

        notif_trade: function( notif ){
            console.log ('notif_trade');

            const trade_board = `trade_board`;
            const player_zone = `player_board_${notif.args.player_id}`;

            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, trade_board , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', trade_board, player_zone, 500 , 100*(delay++) );
                }   
                if (notif.args.player_id == this.player_id){
                    if (VP_TOKENS.includes(type)){
                        amt = amt * Number(type.charAt(2));
                        this.resourceCounters['vp'].incValue(amt);
                    } else {
                        this.resourceCounters[type].incValue(amt);
                    }
                    
                }
            }
            if (notif.args.undo == null){
                this.showUndoTransactionsButtonIfPossible();
            } else {
                this.hideUndoTransactionsButtonIfPossible();
            }
        },

        notif_loanPaid: function( notif ){
            console.log ('notif_loanPaid');
            console.log (notif);

            const player_board_div = `player_board_${notif.args.player_id}`;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , player_board_div, destination,  500 , 0 );
            if (notif.args.player_id == this.player_id){
                this.resourceCounters['loan'].incValue(-1);
            }
            if (notif.args.type != null ){
                if (notif.args.typeStr == 'gold'){
                    this.slideTemporaryObject( notif.args.type , 'limbo', player_board_div, 'board', 500, 100);
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters['gold'].incValue(-1);
                    }
                } else {
                    for (let i = 0; i < 5; i++){
                        this.slideTemporaryObject( notif.args.type, 'limbo', player_board_div, 'board', 500, 100 +(i*100)); 
                    }
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters['silver'].incValue(-5);
                    }
                }
            }
        },

        notif_loanTaken: function( notif ){
            console.log ('notif_loanTaken');

            const player_zone_divId = `player_board_${notif.args.player_id}`;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', player_zone_divId,  500 , 0 );
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', player_zone_divId, 500 , 100);
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', player_zone_divId, 500 , 200);
            if (notif.args.player_id == this.player_id){
                this.resourceCounters['loan'].incValue(1);
                this.resourceCounters['silver'].incValue(2);
            }            
        },

        notif_cancel: function( notif ){
            console.log ("notif_cancel");
            console.log (notif.args);

            let p_id = notif.args.player_id;
            const isThisPlayer = p_id== this.player_id;
            const player_zone = `player_board_${p_id}`;
            var delay = 0;
            // update values as undone
            for (let i in notif.args.actions){
                let log = notif.args.actions[i];
                console.log (log);
                switch (log.action){
                    case 'build':
                        this.cancelBuild(log.building);
                    break;
                    case 'gainWorker':
                        console.log ('gainWorker');
                        this.fadeOutAndDestroy(`token_worker_${log.w_key}`);
                    break;
                    case 'gainTrack':
                        this.fadeOutAndDestroy(`token_track_${log.t_key}`);
                    break;
                    case 'loan':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , player_zone, 'board', 500 , 50 * (delay++) );
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        if (isThisPlayer){
                            this.resourceCounters['loan'].incValue(-1);
                            this.resourceCounters['silver'].incValue(-2);
                        }    
                    break;
                    case 'loanPaid':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', player_zone, 500 , 0 );
                        if (isThisPlayer){
                            this.resourceCounters['loan'].incValue(1);
                        }
                        if (type in log){
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo', player_zone, 'board', 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[log.type].incValue(1);
                                }
                            }
                        }
                    break;
                    case 'railAdv':
                        const train_token = this.train_token_divId[p_id];
                        const parent_no = $(train_token).parentNode.id.split("_")[2];
                        this.rail_adv_zone[parent_no].removeFromZone(train_token);
                        this.rail_adv_zone[parent_no-1].placeInZone(train_token);
                    break;
                    case 'trade':
                        const trade_board = `trade_board`;
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, trade_board , 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[type].incValue(1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', trade_board, player_zone, 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[type].incValue(-1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
                        console.log ('updateResource');
                        if (log.amt < 0){
                            for(let j = 0; j < Math.abs(log.amt); j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo' , player_zone, 'board', 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[log.type].incValue(-1);
                                }
                            }
                        } else {
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo', 'board', player_zone, 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[log.type].incValue(1);
                                }
                            }
                        }
                    break;
                }
            }

            // mark logs as cancelled.
            for (let log_id in notif.args.log_ids){
                if (!dojo.hasClass('log_'+log_id, 'cancel')) {
                    dojo.addClass('log_' + log_id, 'cancel');
                }
            }
        },

        getTargetFromNotifArgs: function( notif ){
            var target = `board`;
            if (notif.args.origin == 'auction'){
                target = `${TPL_AUC_ZONE}${Number(notif.args.key)}`;
            } else if (notif.args.origin == 'building'){
                target = `${TPL_BLD_TILE}${Number(notif.args.key)}`;
            } 
            return target;
        },
   });             
});
