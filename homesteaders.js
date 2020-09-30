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

    const ZONE_PASS = 0;
    const ZONE_PENDING = -1;

    const TYPE_RESIDENTIAL = 0;
    const TYPE_COMMERCIAL  = 1;
    const TYPE_INDUSTRIAL  = 2;
    const TYPE_SPECIAL     = 3;

    const BUILDING_LOC_FUTURE  = 0;
    const BUILDING_LOC_OFFER   = 1;
    const BUILDING_LOC_PLAYER  = 2;
    const BUILDING_LOC_DISCARD = 3;

    const BUILDING_HOMESTEAD_YELLOW = 1;
    const BUILDING_HOMESTEAD_RED    = 2;
    const BUILDING_HOMESTEAD_GREEN  = 3;
    const BUILDING_HOMESTEAD_BLUE   = 4;
    
    const BUILDING_GRAIN_MILL = 5;
    const BUILDING_FARM       = 6;
    const BUILDING_MARKET     = 7;
    const BUILDING_FOUNDRY    = 8;
    const BUILDING_STEEL_MILL = 9;

    const BUILDING_BOARDING_HOUSE     = 10;
    const BUILDING_RAILWORKERS_HOUSE = 11;
    const BUILDING_RANCH             = 12;
    const BUILDING_TRADING_POST      = 13;
    const BUILDING_GENERAL_STORE     = 14;
    const BUILDING_GOLD_MINE         = 15;
    const BUILDING_COPPER_MINE       = 16;
    const BUILDING_RIVER_PORT        = 17;

    const BUILDING_CHURCH            = 18;
    const BUILDING_WORKSHOP          = 19;
    const BUILDING_DEPOT             = 20;
    const BUILDING_STABLES           = 21;
    const BUILDING_BANK              = 22;
    const BUILDING_MEATPACKING_PLANT = 23;
    const BUILDING_FORGE             = 24;
    const BUILDING_FACTORY           = 25;
    const BUILDING_RODEO             = 26;
    const BUILDING_LAWYER            = 27;
    const BUILDING_FAIRGROUNDS       = 28;

    const BUILDING_DUDE_RANCH    = 29;
    const BUILDING_TOWN_HALL     = 30;
    const BUILDING_TERMINAL      = 31;
    const BUILDING_RESTARAUNT    = 32;
    const BUILDING_TRAIN_STATION = 33;
    const BUILDING_CIRCUS        = 34;
    const BUILDING_RAIL_YARD     = 35;

    // other Auction Locations are the auction number (1-3).
    const AUCTION_LOC_DISCARD = 0;

    const AUCTION_BONUS_NONE            = 0;
    const AUCTION_BONUS_WORKER          = 1;
    const AUCTION_BONUS_WORKER_RAIL_ADV = 2;
    const AUCTION_BONUS_WOOD_FOR_TRACK  = 3;
    const AUCTION_BONUS_COPPER_FOR_VP   = 4;
    const AUCTION_BONUS_COW_FOR_VP      = 5;
    const AUCTION_BONUS_6VP_AND_FOOD_VP = 6;
    const AUCTION_BONUS_FOOD_FOR_VP     = 7;

    const BUILD_BONUS_WORKER = 3;


    const TYPE_SELECTOR = [];
    TYPE_SELECTOR['bid'] = '.bid_slot';
    TYPE_SELECTOR['bonus'] = '.train_bonus';
    TYPE_SELECTOR['worker_slot'] = '.worker_slot';
    TYPE_SELECTOR['building'] = '.building_tile';
    TYPE_SELECTOR['worker'] = '.token_worker';
    TYPE_SELECTOR['trade'] = '.trade_option';

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        constructor: function(){
            console.log('homesteaders constructor');

            // zone control
            this.token_zone = [];
            this.token_zone[-1] = new ebg.zone();
            this.token_divId = [];

            // auction tile zones
            this.tile_height = 175;
            this.tile_width = 105;
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_token_divId =[];
            this.bid_zone_height = 36;
            this.bid_zone_width = 36;
            this.bid_val_arr = [3,4,5,6,7,9,12,16,21];

            // auction bid zones
            this.bid_zones = [];
            this.bid_zones[ZONE_PASS] = new ebg.zone();
            this.bid_zones[ZONE_PENDING] = new ebg.zone();
            this.auction_zones = [];
            for(let i=1; i<4;i++){
                this.bid_zones[i] = []; 
                this.auction_zones[i]= new ebg.zone();
            }
            for (let i =0; i < this.bid_val_arr.length; i++){
                this.bid_zones[1][i] = new ebg.zone();
                this.bid_zones[2][i] = new ebg.zone();
                this.bid_zones[3][i] = new ebg.zone();
            }

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
            // map of tpl id's  used to place the player_zones in turn order.
            this.player_order = ['First', 'Second', 'Third', 'Fourth'];
                        
            // storage for buildings
            this.main_building_diag = []; // zone for each building_id [indexed by building_id]
            this.main_building_counts = []; // counts of each building_id in main zone. for use by update Buildings methods.

            this.building_worker_zones = [];
            this.resourceCounters = []; // This player's resource counters

            this.tile_width = 144;
            this.tile_height = 196;
            this.main_width = 155;
            this.main_height = 210
            this.token_dimension = 50;
            this.bid_height = 52;
            this.bid_width = 50;
            this.worker_dimension = 35;
            this.rail_width = 85;
            this.rail_height = 102
            
            this.player_score_counter = []; // indexed by player_id
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;

            this.hasBuilding = []; 
            this.last_selected = [];
            this.goldAsCopper = false;
            this.goldAsCow = false;            
            
            this.canal_tile_divId = "";     // Division Id of Canal tile
            // on click handlers
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
                const current_player_color = player.color_name;
                dojo.removeClass("player_zone_"+current_player_color, "noshow");
                if( this.player_id == p_id){
                    const player_board_div = $('player_board_'+p_id);
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
                    $isSpectator = false;
                } 
                
                this.player_color[p_id] = current_player_color;
                this.token_divId[p_id] = 'token_zone_' + this.player_color[p_id];
                this.token_zone[p_id] = new ebg.zone();
                this.token_zone[p_id].create ( this, this.token_divId[p_id] , this.rail_width -5, this.rail_height );
                this.player_score_counter[p_id] = new ebg.counter();
                this.player_score_counter[p_id].create(`player_score_${p_id}`);
                this.player_score_counter[p_id].setValue(Number(player.score));

                this.player_building_zone_id[p_id] = 'building_zone_'+ this.player_color[p_id];
                this.player_building_zone[p_id] = new ebg.zone();
                this.player_building_zone[p_id].create(this, this.player_building_zone_id[p_id], this.tile_width, this.tile_height-3);
            }
            if (!$isSpectator)
                this.orientPlayerZones(gamedatas.player_order);
            
            this.setupPlayerResources(gamedatas.player_resources);
            // Auctions: 
            this.setupAuctionZones();
            this.showCurrentAuctions(gamedatas.auctions, gamedatas.round_number);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);

            this.player_building_zone[gamedatas.first_player].placeInZone('first_player_tile', 1);
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones ();
            this.setupBidTokens(gamedatas.players);

            this.setupRailLines(gamedatas.players);
            this.setupTradeButtons();
            this.setupBonusButtons();
            this.setupPaymentSection();
            this.roundCounter.create('round_number');
            this.roundCounter.setValue( gamedatas.round_number);

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        orientPlayerZones: function (order_table){
            let next_pId = this.player_id;    
            for (let i = 0; i < this.playerCount; i++){
                console.log( "next: "+next_pId );
                dojo.place(`player_zone_${this.player_color[next_pId]}`, this.player_order[i] , 'replace');
                next_pId = order_table[this.player_id];
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

        setupAuctionZones: function () {
            for (let i=1; i <=3; i++){
                this.auction_ids[i] = "auction_tile_zone_"+i.toString();
                this.auction_zones[i].create(this, this.auction_ids[i], this.tile_width, this.tile_height);
                this.auction_zones[i].setPattern('diagonal');
            }
        },

        setupBuildings: function(buildings) {
            for (let b_key in buildings){
                const building = buildings[b_key];   
                if (building.location == BUILDING_LOC_PLAYER){
                    this.addBuildingToPlayer(building);
                } else if (building.location == BUILDING_LOC_OFFER) {
                    this.addBuildingToOffer(building);
                }
            }
        },

        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: this.player_color[track.p_id]}), this.token_divId[track.p_id]);
                //this.token_zone[track.p_id].placeInZone(`token_track_${track.r_key}`,50);
            }
        },

        addBuildingWorkerSlots: function(building){
            const key = building.b_key; 
            const id = building.b_id;
            const divId = `building_tile_${key}`;
            if (building.w_slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, this.worker_dimension, this.worker_dimension );
                if (building.p_id == this.player_id){
                    dojo.connect($(`slot_1_${key}`),'onclick', this, 'onClickOnWorkerSlot'); 
                }
            } else if (building.w_slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, this.worker_dimension, this.worker_dimension );
                this.building_worker_zones[key][2] = new ebg.zone();
                this.building_worker_zones[key][2].create(this, `slot_2_${key}`, this.worker_dimension, this.worker_dimension );
                if (building.p_id == this.player_id){
                    dojo.connect($(`slot_1_${key}`),'onclick', this, 'onClickOnWorkerSlot');
                    dojo.connect($(`slot_2_${key}`),'onclick', this, 'onClickOnWorkerSlot');  
                }
            } else if (building.w_slot == 3){
                // currently
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: key, id: id}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][3] = new ebg.zone();
                this.building_worker_zones[key][3].create(this, `slot_3_${key}`, this.worker_dimension, this.worker_dimension );
                dojo.connect($(`slot_3_${key}`),'onclick', this, 'onClickOnWorkerSlot');
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
                }
                if (worker.p_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        setupBidZones: function () {
            this.token_divId[ZONE_PENDING] = 'pending_bids';
            this.bid_zones[ZONE_PENDING].create (this, this.token_divId[ZONE_PENDING], this.bid_height, this.bid_width );
            this.bid_zones[ZONE_PENDING].setPattern('horizontalfit');
            this.token_divId[ZONE_PASS] = 'passed_bid_zone';
            this.bid_zones[ZONE_PASS].create(this, this.token_divId[ZONE_PASS], this.bid_height, this.bid_width );
            this.bid_zones[ZONE_PASS].setPattern('horizontalfit');

            for (let bid =0; bid < this.bid_val_arr.length; bid ++){
                for (let auc = 1; auc <= 3; auc++){
                    const bid_slot_divId = `bid_slot_${auc}_${this.bid_val_arr[bid].toString()}`;
                    this.bid_zones[auc][bid].create(this, bid_slot_divId, this.bid_height, this.bid_width);
                    dojo.connect($(bid_slot_divId), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        setupBidTokens: function(players) {
            for(let p_id in players){
                const player_bid_loc = players[p_id].bid_loc;
                const player_color = this.player_color[p_id];
                this.bid_token_divId[p_id] = `token_bid_${player_color}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: player_color, type: "bid"}), this.token_divId[ZONE_PENDING]);
                this.moveBid(p_id, player_bid_loc);
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

        setupTradeButtons: function(){
            const options = dojo.query("#trade_board .trade_option");
            for(let i in options){
                if (options[i].id != null){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
                }
            }
            //dojo.connect($('done_trading'), 'onclick', this, 'onSelectDoneTrading' );
        },

        setupBonusButtons: function(){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id != null){
                    dojo.connect($(bonus_options[i].id),'onclick', this, 'onSelectBonusOption');
                } 
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
                    this.setupTiles (this.gamedatas.round_number, 
                        this.gamedatas.auctions);  
                    break;
                case 'payWorkers':
                    this.goldAmount = 0;
                    break;
                case 'allocateWorkers':
                    this.last_selected['worker'] ="";
                break;
                case 'playerBid':
                    this.last_selected['bid']    ="";
                    // do something
                    break;
                case 'getRailBonus':
                    this.last_selected['bonus']  ="";
                break;
                case 'payAuction':
                    break;
                case 'chooseBuildingToBuild':
                    this.last_selected['building']="";
                    break;
                case 'auctionBonus':
                    // do something
                    break;
                case 'bonusChoice':
                    break;
                case 'endRound':
                    // do something
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
            
            // I don't think I need to do anything here...
            switch( stateName )
            {
                case 'setupRound':
                break;
                case 'collectIncome':
                    break;
                case 'allocateWorkers':
                    break;    
                case 'payWorkers':
                    break;
                case 'playerBid':
                    break;
                case 'payAuction':
                    break;
                case 'endBuildRound':
                    break;
                case 'endRound':
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
            const current_player_id = this.player_id;
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                    case 'allocateWorkers':
                        // show workers that are selectable
                        console.log(this.player_color[current_player_id]);
                        console.log("pid:" + current_player_id);
                        console.log(this.player_color);
                        const workers = dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` );
                        workers.addClass('selectable');
                        // also make building_slots selectable.
                        const building_slots = dojo.query(`#building_zone_${this.player_color[current_player_id]} .worker_slot`);
                        building_slots.addClass( 'selectable');
                        this.addActionButton( 'btn_done',        _('Done'),            'donePlacingWorkers');
                        this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),       'takeLoan', null, false, 'gray');
                        this.addActionButton( 'btn_trade',       _('Trade'),           'tradeActionButton', null, false, 'gray');
                        break;
                    case 'payWorkers':
                        this.showPaymentSection();
                        console.log(args.worker_counts);
                        console.log(args.worker_counts[this.player_id]);
                        console.log(args.worker_counts[this.player_id].workers);

                        this.silverCost = Number(args.worker_counts[this.player_id].workers);
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        
                        this.addActionButton( 'btn_done',      _('Done'),     'donePayingWorkers');
                        this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'raiseGold', null, false, 'gray');
                        this.addActionButton( 'btn_less_gold', _('Use Less Gold'), 'lowerGold', null, false, 'gray');
                        this.addActionButton( 'btn_trade',     _('Trade'), 'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan', null, false, 'gray');
                        break;
                    case 'playerBid':
                        console.log('entering playerBid');
                        for (let bid_key in args.valid_bids) {
                            const bid = args.valid_bids[bid_key];
                            const bid_pair = this.getBidPairFromBidNo(bid);
                            const bid_slot = this.bid_val_arr[bid_pair.bid_index];
                            const bid_slot_id = `bid_slot_${bid_pair.auction_no}_${bid_slot}`;
                            dojo.addClass(bid_slot_id, "selectable");
                        }
                        this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'onSelectConfirmBidButton');
                        this.addActionButton( 'btn_pass',    _('Pass'),    'onSelectPassBidButton', null, false, 'red');
                    break;
                    case 'getRailBonus':
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
                        dojo.place('payment_section', 'top');
                        this.silverCost = Number(args.auction_cost);
                        this.goldAmount = 0;
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        this.addActionButton( 'btn_done',      _('Done'),           'donePayAuction');
                        this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'raiseGold', null, false, 'gray');
                        this.addActionButton( 'btn_less_gold', _('Use Less Gold'),  'lowerGold', null, false, 'gray');
                        this.addActionButton( 'btn_trade',     _('Trade'),  'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'),      'takeLoan',  null, false, 'gray');
                    break;
                    case 'chooseBuildingToBuild':
                    case 'trainStationBuild':
                        console.log(args.allowed_buildings);
                        //mark buildings as selectable
                        for(let i in args.allowed_buildings){
                            const building = args.allowed_buildings[i];
                            const building_divId = `building_tile_${building.building_key}`;
                            dojo.addClass(building_divId, 'selectable');
                        }
                        this.addActionButton( 'btn_choose_building', _('Build'),     'chooseBuilding');
                        if (args.riverPort){
                            this.addActionButton( 'btn_gold_cow',    _('Use Gold As Cow'),   'toggleGoldAsCow', null, false, 'red');
                            this.addActionButton( 'btn_gold_copper', _('Use Gold as Copper '), 'toggleGoldAsCopper', null, false, 'red');    
                        }
                        this.addActionButton( 'btn_do_not_build', _('Do not Build'), 'doNotBuild', null, false, 'red');
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                    break;
                    case 'resolveBuilding':
                        if (args.building_bonus == BUILD_BONUS_WORKER){
                            this.addActionButton( 'btn_bonus_worker', _('Hire worker (free)'), 'workerForFreeBuilding');
                            this.addActionButton( 'btn_pass_bonus',  _('Pass on free worker'), 'passBuildingBonus', null, false, 'red');
                        }
                    break;
                    case 'bonusChoice':
                        const option = Number(args.auction_bonus);
                        console.log('bonus option: ' + option);
                        switch (option){
                            case AUCTION_BONUS_WORKER:
                                this.addActionButton( 'btn_bonus_worker', _('Hire worker (free)'), 'workerForFree');
                            break;
                            case AUCTION_BONUS_WORKER_RAIL_ADV:
                                this.addActionButton( 'btn_bonus_worker', _('Hire worker (free)'), 'workerForFree2');
                            break;
                            case AUCTION_BONUS_WOOD_FOR_TRACK:
                                this.addActionButton( 'btn_wood_track',   _('Trade wood for rail track'), 'woodForTrack');
                            break;
                            case AUCTION_BONUS_COPPER_FOR_VP:
                                this.addActionButton( 'btn_copper_vp',    _('Trade Copper for 4 VP'),     'copperFor4VP');
                                break;
                            case AUCTION_BONUS_COW_FOR_VP:
                                this.addActionButton( 'btn_cow_vp',       _('Trade Livestock for 4 VP'),  'cowFor4VP');
                                break;
                            case AUCTION_BONUS_FOOD_FOR_VP:
                                this.addActionButton( 'btn_food_vp',      _('Trade Food for 2 VP'),       'foodFor2VP');
                        }
                        this.addActionButton( 'btn_pass_bonus',  _('Do not Get Bonus'), 'passBonus', null, false, 'red');
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                    break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        /*** setup new Round ***/
        setupTiles: function(round_number, auction_tiles, buildings) {
            console.log("r# "+round_number );
            this.roundCounter.setValue(round_number);
            this.showCurrentAuctions(auction_tiles, round_number);
        },

        updateBuildingStocks: function(buildings){
            for (let b_key in buildings){
                const building = buildings[b_key];
                const building_divId = `building_tile_${b_key}`;
                if (building.location == BUILDING_LOC_OFFER) {
                    this.addBuildingToOffer(building);
                } else if (building.location == BUILDING_LOC_DISCARD){
                    if (document.getElementById(building_divId) != null){
                        // may need to remove the stack
                        this.fadeOutAndDestroy( building_divId);
                        this.main_building_counts[building.b_id] --; 
                        if (this.main_building_counts[building.b_id] == 0){
                            this.fadeOutAndDestroy( `building_stack_${building.b_id}`);
                        }
                    }
                }
            }
        },

        // was getCurrentBuildingDupes
        getBuildingDupes: function(buildings){
            let b_id_count_arr = [];
            let b_dupes = [];
            for (let b_key in buildings){
                //if (buildings[b_key].location == BUILDING_LOC_OFFER){
                    const b_id = buildings[b_key].b_id;
                    if (b_id_count_arr[b_id] == null) {
                        b_id_count_arr[b_id] = 1;
                    } else if (b_id_count_arr[b_id] == 1){
                        b_id_count_arr[b_id]++;
                        b_dupes[b_id] = 2;
                    } else {
                        b_dupes[b_id]++;
                    }
                //}
            }
            return b_dupes;
        },


        /***** building utils *****/

        addBuildingToPlayer: function(building){
            const p_id = building.p_id;
            const b_id = building.b_id;
            const b_key = building.b_key;
            const b_divId = `building_tile_${b_key}`;
            if (document.querySelector(`#${this.player_building_zone_id[p_id]} #${b_divId}`) != null){
                console.log(' building already added to player');
                return;
            }
            if (document.getElementById(b_divId) != null){ // if element already exists, just move it.
                const wasInMain = (document.querySelector( `#main_building_zone #${b_divId}`) == null);
                this.player_building_zone[building.p_id].placeInZone(b_divId);
                if (wasInMain){
                    this.main_building_counts[b_id] --;
                    if (this.main_building_counts[building.b_id] == 0){
                        this.fadeOutAndDestroy( `building_stack_${building.b_id}`);
                    }
                }
            } else { // create it as well;
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), 'future_building_zone');
                this.player_building_zone[building.p_id].placeInZone(`building_tile_${b_key}`, b_id);
                this.addBuildingWorkerSlots(building);
                // don't need to connect as there is no selecting buildings owned by players.
            }
            if (building.p_id == this.player_id){
                this.updateHasBuilding(b_id); 
            }
        },

        addBuildingToOffer: function(building){
            const b_key = building.b_key;
            const b_divId = `building_tile_${b_key}`;
            if (document.querySelector(`#main_building_zone #${b_divId}`) != null){
                console.log(' building alredy added to stock');
                return;
            }
            const b_id = building.b_id;
            const zone_id = `building_stack_${b_id}`;
            if (this.main_building_diag[b_id] == null){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                    {id: b_id, order: b_order}), 'main_building_zone');
                this.main_building_diag[b_id] = new ebg.zone();
                this.main_building_diag[b_id].create (this, zone_id);
                this.main_building_diag[b_id].setPattern('diagonal');
                this.main_building_diag[b_id].item_margin = 10;
                this.main_building_counts[b_id] = 0;
            }
            
            if (document.getElementById(b_divId) != null){ // if element already exists, just move it.
                this.main_building_diag[b_id].placeInZone(b_divId);
            } else { //otherwise make the building 
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), 'future_building_zone');
                this.main_building_diag[b_id].placeInZone(b_divId);
                dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                this.addBuildingWorkerSlots(building);
                this.main_building_counts[b_id]++;
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
         * so we can get their mapping using this.bid_val_arr.indexOf 
         * which lists the bid cost values in an array. 
         * @param {*} bidLoc_divId (id of bid location to get bidNo from)
         */
        getBidNoFromSlotId: function(bidLoc_divId){
            const split_bid = bidLoc_divId.split("_");
            console.log( "bidLoc_divId -> " + bidLoc_divId + "split_bid -> " + split_bid);
            const aucNo = Number(split_bid[2]);
            const bid_no = this.bid_val_arr.indexOf(Number(split_bid[3])) + 1;
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
                if (auction.location !=AUCTION_LOC_DISCARD && auction.position == current_round) {
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id}), this.auction_ids[auction.location]);
                    this.auction_zones[auction.location].placeInZone(`auction_tile_${a_id}`);
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
        
        disableTradeIfPossible: function() {
            if (dojo.query('#trade_board .selectable').length >0){
                dojo.place('trade_board', 'trade_bottom', 'first');
                // now make the trade options not selectable
                this.clearSelectable('trade', true);
                if (document.getElementById('confirm_trade_btn') != null){
                    this.fadeOutAndDestroy( 'confirm_trade_btn');
                }
            }
        },

        enableTradeIfPossible: function() {
            if (!dojo.query('#trade_board .selectable').length >0){
                // make space for it, and move trade board to top.
                //dojo.addClass('trade_top', 'trade_size');
                //this.slideToObject( 'trade_board', 'trade_top').play();
                dojo.place('trade_board', 'trade_top', 'first');
                //make the trade options selectable
                dojo.query('div#trade_board .trade_option:not([id^="trade_market"]):not([id^="trade_bank"])').addClass('selectable');
                if (this.hasBuilding[BUILDING_MARKET] != null){
                    dojo.query('#trade_board [id^="trade_market"]').addClass('selectable');
                }
                if (this.hasBuilding[BUILDING_BANK] != null){
                    dojo.query('#trade_board [id^="trade_bank"]').addClass('selectable');
                }
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

        moveBid: function(p_id, bid_loc){
            const bid_divId = this.bid_token_divId[p_id];
            console.log("id:" + bid_divId + ", loc:"+ bid_loc );
            if (bid_loc == OUTBID || bid_loc == NO_BID) {
                this.bid_zones[-1].placeInZone(bid_divId);
            } else if(bid_loc == BID_PASS){
                this.bid_zones[0].placeInZone(bid_divId);
            } else { 
                const bid_pair = this.getBidPairFromBidNo(bid_loc);
                this.bid_zones[bid_pair.auction_no][bid_pair.bid_index].placeInZone(bid_divId);
            }
        },

        getResourceType: function( type ){
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
         * 
         * @param {*} type 
         * @param {*} selected_id 
         */
        updateSelected: function(type, selected_id) {
            // if not selectable or selected 
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
                function( result ) {}, 
                function( is_error) {} );     
            }
        },

        hidePaymentSection: function(){
            //dojo.removeClass( 'payment_top' , 'payment_size');
            //this.slideToObject( 'payment_section', 'payment_bottom' ).play();
            dojo.place('payment_section', 'payment_bottom', 'first');
        },

        showPaymentSection: function(){
            //dojo.addClass( 'payment_top' , 'payment_size');
            //this.slideToObject( 'payment_section', 'payment_top' ).play();
            dojo.place('payment_section', 'payment_top', 'first');
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost +=5;
            this.silverCounter.setValue(Math.max(0,this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
        },
        raiseGold: function(){
            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= 5;
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
        },

        /***** TRADE *****/
        onSelectTradeAction: function( evt){
            console.log( 'onClickOnTradeSlot' );
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            if ( !this.checkAction( 'trade' )) { return; } 
            this.updateSelected('trade', evt.target.id);
            if (dojo.hasClass( evt.target.id ,'selected')){
                console.log( 'trade is selected' );
                if (document.getElementById('confirm_trade_btn') == null){
                    console.log( 'add Button' );
                    this.addActionButton( 'confirm_trade_btn', _('Confirm Trade'), 'confirmTradeButton');
                    dojo.place('confirm_trade_btn', 'btn_trade', 'before');
                } // else button already exists...
            } else if (document.getElementById('confirm_trade_btn') != null){
                this.fadeOutAndDestroy( 'confirm_trade_btn');
            }
        },

        confirmTradeButton: function ( evt ){
            var tradeAction = this.last_selected['trade'].substring(6);  
            this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                lock: true, 
                trade_action: tradeAction
             }, this, function( result ) {}, function( is_error) {});
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

        /***** PLACE WORKERS PHASE *****/
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) { } );                
            }
        },

        donePlacingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
                function( result ) { 
                    this.movePlayerToNormal();
                    this.disableTradeIfPossible();
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                }, function( is_error) {  } ); 
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
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
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
            }
            const w_key = this.last_selected['worker'].split('_')[2];
            this.ajaxcall( "/homesteaders/homesteaders/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: w_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {}, function( is_error) {});
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

        onSelectPassBidButton: function() {
            if( this.checkAction( 'pass')){
                this.ajaxcall( "/homesteaders/homesteaders/passBid.html", {lock: true}, this, 
                function( result ) { this.clearSelectable('bid', true); }, 
                function( is_error) { } );                
            }
        },

        onSelectConfirmBidButton: function () 
        {
            if( this.checkAction( 'confirmBid')){
                const selected_slot = dojo.query(".bid_slot.selected");
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
                    this.disableTradeIfPossible(); }, 
                function( is_error) { } ); 
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
                var bonusSelected = dojo.query(".train_bonus.selected");
                if (bonusSelected.length != 1){ 
                    this.showMessage( _("You must select 1 bonus"), 'error' );
                    return;
                 }
                const type = (bonusSelected[0].id).split('_')[3];
                const typeNum = this.getResourceType(type);
                this.ajaxcall( "/homesteaders/homesteaders/doneSelectingBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { this.clearSelectable('bonus', true); }, 
                    function( is_error) {} ); 
                
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
                this.ajaxcall( "/homesteaders/homesteaders/buildBuilding.html", {building_key: building_key, lock: true}, this, 
                        function( result ) { 
                            this.disableTradeIfPossible();
                            this.clearSelectable('building', true);
                        }, function( is_error) {} );
            }
        },

        toggleGoldAsCopper: function(){
            if (this.goldAsCopper){
                this.goldAsCopper = false;

            } else {
                this.goldAsCopper = true;

            }
        },

        toggleGoldAsCow: function() {
            if (this.goldAsCow) {
                this.goldAsCow = false;

            } else {
                this.goldAsCow = true;

            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.confirmationDialog( _('Are you sure you want to not build?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/doNotBuild.html", {lock: true}, this, 
                    function( result ) { 
                        this.clearSelectable('building', true); 
                        this.disableTradeIfPossible();
                    }, function( is_error) { } );
                } ) ); 
                return; 
            }
        },

        updateScoreForBuilding: function (p_id, b_id) {
            var value = 0;
            switch(b_id){
                case BUILDING_FORGE:
                    value = 1;
                break;
                case BUILDING_GRAIN_MILL: 
                case BUILDING_MARKET:
                case BUILDING_GENERAL_STORE:
                case BUILDING_WORKSHOP:
                case BUILDING_MEATPACKING_PLANT:
                    value = 2;
                break;
                case BUILDING_BANK:
                case BUILDING_DUDE_RANCH:
                case BUILDING_TRAIN_STATION:
                    value = 3;
                break;
                case BUILDING_RODEO:
                case BUILDING_LAWYER:
                    value = 4;
                break;
                case BUILDING_FACTORY:
                case BUILDING_FAIRGROUNDS:
                case BUILDING_TERMINAL:
                case BUILDING_RAIL_YARD:
                    value = 6;
                break;
                case BUILDING_RESTARAUNT:
                case BUILDING_CIRCUS:
                    value = 8;
                    break;
                case BUILDING_CHURCH:
                case BUILDING_TOWN_HALL:
                    value = 10;
                break;
            }
            this.player_score_counter[p_id].incValue(value);
        },

        /***** Building Bonus *****/

        workerForFreeBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
            this.ajaxcall( "/homesteaders/homesteaders/freeHireWorker.html", {lock: true, auction:false}, this, 
            function( result ) {}, 
            function( is_error) {} );}
        },
        
        passBuildingBonus: function (){
            if (this.checkAction( 'buildBonus' )){
                this.confirmationDialog( _('Are you sure you want to pass on bonus?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/passBuildingBonus.html", {lock: true}, this, 
                    function( result ) {}, 
                    function( is_error) {} );
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
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        /**
         * called when auction bonus is worker for free and rail advancement. (it passes rail:true so )
         */
        workerForFree2: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/freeHireWorker.html", {lock: true, rail: true, auction:true}, this, 
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        woodForTrack: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/woodForTrack.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        copperFor4VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/copperForVp.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        cowFor4VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/cowForVp.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        foodFor2VP: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/foodForVp.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} );
            }
        },

        passBonus: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.confirmationDialog( _('Are you sure you want to pass on bonus?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/passAuctionBonus.html", {lock: true}, this, 
                    function( result ) {}, 
                    function( is_error) {} );
                } ) ); 
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
        setupNotifications: function()
        {
            console.log ( 'notifications subscriptions setup' );
            
            dojo.subscribe( 'updateAuction', this, "notif_updateAuction");
            this.notifqueue.setSynchronous('updateAuction', 1000);
            dojo.subscribe( 'updateBuildingStocks', this, "notif_updateBuildingStocks");
            this.notifqueue.setSynchronous('updateBuildingStocks', 1000);
            dojo.subscribe( 'gainWorker',  this, "notif_gainWorker" );
            this.notifqueue.setSynchronous( 'gainWorker', 500 );
            dojo.subscribe( 'gainTrack', this,"notif_gainTrack");
            this.notifqueue.setSynchronous( 'playerRecieveTrack', 1000 );
            dojo.subscribe( 'workerMoved', this, "notif_workerMoved" );
            this.notifqueue.setSynchronous( 'workerMoved', 200 );
            dojo.subscribe( 'railAdv',     this, "notif_railAdv" );
            this.notifqueue.setSynchronous( 'railAdv', 500 );
            dojo.subscribe( 'moveBid',     this, "notif_moveBid");
            this.notifqueue.setSynchronous( 'moveBid', 500 );
            dojo.subscribe( 'buildBuilding', this, "notif_buildBuilding" );
            this.notifqueue.setSynchronous( 'buildBuilding', 1000 );
            dojo.subscribe( 'playerIncome', this, "notif_playerIncome");
            this.notifqueue.setSynchronous( 'playerIncome', 1000 );
            dojo.subscribe( 'playerPayment', this, "notif_playerPayment");
            this.notifqueue.setSynchronous( 'moveBid', 250 );
            dojo.subscribe( 'clearAllBids', this, "notif_clearAllBids");
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

       /** 
        * setupNotifications: function () {
    dojo.subscribe('cardPlayed', this, "notif_cardPlayed");
    this.notifqueue.setSynchronous('cardPlayed');
    
notif_cardPlayed: function (notif) {
    var anim = dojo.fx.combine([
        bla bla bla
    ]);
    anim.play();

    // Wait for animation before handling the next notification.
    this.notifqueue.setSynchronousDuration(anim.duration); */

        notif_updateAuction: function( notif ) {
            console.log ( 'notif_updateAuction' );
            console.log ( notif );
            if (notif.args.state == 'discard') {
                this.auction_zones[notif.args.auction_no].removeAll();
                const bid_token = document.querySelector(`[id^="bid_slot_${notif.args.auction_no}"] [id^="token_bid"]`);
                this.bid_zones[0].placeInZone(bid_token.id);
            } else if (notif.args.state == 'show'){
                for (let i in notif.args.auctions){
                    const auction = notif.args.auctions[i];
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: auction.a_id}), this.auction_ids[auction.location]);
                    this.auction_zones[auction.location].placeInZone(`auction_tile_${auction.a_id}`);
                }
            }
        },

        notif_updateBuildingStocks: function ( notif ){
            console.log ( 'notif_updateBuildings' );
            
            this.updateBuildingStocks(notif.args.buildings);
        },

        notif_workerMoved: function( notif ){
            console.log ( 'notif_workerMoved' );
            console.log ( notif );
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            console.log ( "placing: "+ worker_divId +` in ${Number(notif.args.building_key)}:${Number(notif.args.building_slot)}`);
            const worker_slot_divId = `slot_${Number(notif.args.building_slot)}_${Number(notif.args.building_key)}`;
            this.building_worker_zones[Number(notif.args.building_key)][Number(notif.args.building_slot)].placeInZone(worker_divId);
            this.slideToObject(worker_divId, worker_slot_divId).play();
            if (notif.args.building_slot == 3){
                dojo.style(`slot_3_${Number(notif.args.building_key)}`, 'width', 70);
            }
        },

        notif_railAdv: function( notif ){
            console.log ('notif_railAdv');
            console.log ( notif );
            const train_token = this.train_token_divId[notif.args.player_id]
            this.rail_adv_zone[notif.args.rail_destination].placeInZone(train_token);
        }, 

        notif_gainWorker: function( notif ){
            console.log ('notif_gainWorker');
            console.log ( notif );
            const worker_divId = `token_worker_${Number(notif.args.worker_key)}`;
            dojo.place(this.format_block( 'jptpl_token', 
                    {type: "worker", id: Number(notif.args.worker_key)}), 
                    this.token_divId[Number(notif.args.player_id)] );
            //this.token_zone[notif.args.player_id].placeInZone(worker_divId);
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
            
            //const trackToken_divId = `token_track_${Number(notif.args.key)}`;
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.key), color: this.player_color[Number(notif.args.player_id)]}),
                    this.token_divId[Number(notif.args.player_id)]);
            //this.player_building_zone[notif.args.player_id].placeInZone(trackToken_divId,50);
        },

        notif_moveBid: function( notif ){
            console.log ('notif_moveBid');
            console.log ( notif );
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                const player_token_divId = this.bid_token_divId[i];
                this.bid_zones[-1].placeInZone(player_token_divId);
            }
        },

        notif_buildBuilding: function( notif ){
            console.log ('notif_buildBuilding');
            console.log ( notif ); 

            this.addBuildingToPlayer(notif.args.building);
            this.updateScoreForBuilding(notif.args.player_id, notif.args.building['b_id']);
        },

        notif_playerIncome: function( notif ){
            console.log ('notif_playerIncome');
            console.log ( notif);

            var start = `building_zone_${this.player_color[notif.args.player_id]}`;
            if (notif.args.origin == 'auction'){
                start = `auction_tile_${Number(notif.args.key)}`;
            } else if (notif.args.origin == 'building'){
                start = `building_tile_${Number(notif.args.key)}`;
            } 
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            for(let i = 0; i < notif.args.amount; i++){
                console.log("sending token '"+notif.args.type+"' to player '"+ notif.args.player_name+ "'");
                this.slideTemporaryObject( `<div class="token token_${notif.args.type}"></div>`, 'limbo', start , player_zone_divId , 500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.type].incValue(1);
                }
            }  
        },

        notif_playerPayment: function( notif ){
            console.log ('notif_playerPayment');
            console.log ( notif);
            
            var destination = 'board';
            if (notif.args.origin == 'auction'){
                destination = `auction_tile_${Number(notif.args.key)}`;
            } else if  (notif.args.origin == 'building'){
                destination = `building_tile_${Number(notif.args.key)}`;
            } 
            const player_zone_divId = `player_board_${notif.args.player_id}`;

            for(let i = 0; i < notif.args.amount; i++){
                console.log("sending token '"+notif.args.type+"' from player '"+ notif.args.player_name+ "'");
                this.slideTemporaryObject( `<div class="token token_${notif.args.type}"></div>`, 'limbo' , player_zone_divId, destination,  500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.type].incValue(-1);
                }
            }
        }
   });             
});
