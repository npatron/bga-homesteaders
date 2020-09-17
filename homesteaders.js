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
    const RAIL_LINE= 8;
    const WORKER   = 9;
    const VP       = 10;
    const SILVER   = 11;
    const LOAN     = 12;

    const BUILDING_LOC_FUTURE  = 0;
    const BUILDING_LOC_OFFER   = 1;
    const BUILDING_LOC_PLAYER  = 2;
    const BUILDING_LOC_DISCARD = 3;

    const AUCTION_LOC_DISCARD = 0;

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
            this.bid_val_arr = [3,4,5,6,7,9,12,16,21];
            // auction bid zones
            this.bid_zones = [];
            this.auction_zones = [];
            for(var i=1; i<4;i++){
                this.bid_zones[i] = []; 
                this.auction_zones[i]= new ebg.zone();
            }
            for (var i =0; i < this.bid_val_arr.length; i++){
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
            this.main_building_zone = new ebg.zone();
            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_building_zone_id = [];
            this.player_building_zone = [];
            this.building_worker_zones = [];
            //this.players_railroad_advancements = [];   // indexed by player id
            this.resourceCounters = [];

            this.tile_width = 144;
            this.tile_height = 196;
            
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;

            this.last_selected = [];
            this.last_selected['bid'] = "";
            this.last_selected['worker'] = "";
            this.last_selected['bonus'] = "";
            
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

            this.playerCount = 0;
            // Setting up player boards
            for( let player_id in gamedatas.players ) {
                ++this.playerCount;
                const player = gamedatas.players[player_id];
                const current_player_color = player.color_name;
                if( this.player_id == player_id){
                    const player_board_div = $('player_board_'+player_id);
                    dojo.place( this.format_block('jstpl_player_board', {id: player_id} ), player_board_div );
                    dojo.place(`player_zone_${current_player_color}`, 'player_zones', "first");
                } 
                dojo.removeClass("player_zone_"+current_player_color.toString(), "noshow");
                dojo.byId("player_name_"+current_player_color.toString()).innerText = player.player_name;
                
                this.player_color[player_id] = current_player_color;
                this.token_div[player_id] = 'token_zone_' + this.player_color[player_id].toString();
                this.token_zone[player_id] = new ebg.zone();
                this.token_zone[player_id].create ( this, this.token_div[player_id] , 50, 50 );

                this.player_building_zone_id[player_id] = 'building_zone_'+ this.player_color[player_id].toString();
                this.player_building_zone[player_id] = new ebg.zone();
                this.player_building_zone[player_id].create(this, this.player_building_zone_id[player_id], this.tile_width, this.tile_height);
            }

            this.setupPlayerResources(gamedatas.player_resources);
            // Auctions: 
            this.setupAuctionZones(gamedatas.auctions, gamedatas.round_number);
            this.setupBuildingZones(gamedatas.buildings);

            this.player_building_zone[gamedatas.first_player].placeInZone('first_player_tile', 1);
            this.setupWorkers(gamedatas.workers);
            var auctionCount = 2;
            if (gamedatas.auctions.len > 20) {auctionCount = 3;}
            this.setupBidZones (auctionCount);
            this.setupBidTokens(gamedatas.resources);

            this.setupRailLines(gamedatas.resources);
            this.setupTradeButtons();
            this.setupBonusButtons();
            this.setupPaymentSection();

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupPlayerResources: function (resources){
            for (const [key, value] of Object.entries(resources)) {
                //console.log(`${key}: ${value}`);
                if (key == "player_id") continue;
                this.resourceCounters[key] = new ebg.counter();
                this.resourceCounters[key].create(`${key}count_${resources.player_id}`);
                this.resourceCounters[key].setValue(value);
            }
        },

        setupAuctionZones: function (auctions, current_round ) {
            for (let i=1; i <=3; i++){
                this.auction_ids[i] = "auction_tile_zone_"+i.toString();
                this.auction_zones[i].create(this, this.auction_ids[i], this.tile_width, this.tile_height);
                this.auction_zones[i].setPattern('diagonal');
            }
            this.showCurrentAuctions(auctions, current_round);
        },

        setupBuildingZones: function(buildings){
            this.main_building_zone.create (this, 'main_building_zone', this.tile_width, this.tile_height );
            for (let building_key in buildings){
                const building = buildings[building_key];
                dojo.place(this.format_block( 'jstpl_buildings', {key: building_key, id: building.building_id}), 'future_building_zone');
                if (building.location == BUILDING_LOC_PLAYER){
                    this.player_building_zone[building.player_id].placeInZone(`building_tile_${building_key}`, 50-building.building_id);
                    this.addBuildingWorkerSlots(building);
                } else if (building.location == BUILDING_LOC_OFFER) {
                    this.main_building_zone.placeInZone(`building_tile_${building_key}`, 50-building.building_id);
                    this.addBuildingWorkerSlots(building);
                }
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
                if (building.player_id == this.player_id){
                    dojo.connect($(`slot_1_${key}`),'onclick', this, 'onClickOnWorkerSlot'); 
                }
            } else if (building.worker_slot > 1){
                //console.log(`making 2 slots for building ${key}`)
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key}), divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key}), divId);
                this.building_worker_zones[key] = [];
                this.building_worker_zones[key][1] = new ebg.zone();
                this.building_worker_zones[key][1].create(this, `slot_1_${key}`, 50, 50 );
                this.building_worker_zones[key][2] = new ebg.zone();
                this.building_worker_zones[key][2].create(this, `slot_2_${key}`, 50, 50 );
                if (building.player_id == this.player_id){
                    dojo.connect($(`slot_1_${key}`),'onclick', this, 'onClickOnWorkerSlot');
                    dojo.connect($(`slot_2_${key}`),'onclick', this, 'onClickOnWorkerSlot');  
                }
            }
        },

        setupWorkers: function(workers) {
            for (let worker_key in workers){
                const worker = workers[worker_key];
                dojo.place(this.format_block( 'jptpl_token', {
                    type: "worker", id: worker_key.toString()}), this.token_div[worker.player_id] );
                const worker_divId = `token_worker_${worker.worker_key}`;
                if (worker.building_key == 0 ){
                    this.token_zone[worker.player_id].placeInZone(worker_divId );
                } else { 
                    this.building_worker_zones[worker.building_key][worker.building_slot].placeInZone(worker_divId);
                }
                if (worker.player_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        setupBidZones: function (auctionCount) {
            this.token_div[-1] = 'bid_limbo';
            this.token_zone[-1].create (this, this.token_div[-1], 50, 50 );
            this.token_zone[-1].setPattern('horizontalfit');

            for (let bid =0; bid < this.bid_val_arr.length; bid ++){
                for (let auc = 1; auc <= auctionCount; auc++){
                    let bid_slot_divId = `bid_slot_${auc}_${this.bid_val_arr[bid].toString()}`;
                    this.bid_zones[auc][bid].create(this, bid_slot_divId, 50, 50);
                    dojo.connect($(bid_slot_divId), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        setupBidTokens: function(resources) {
            for(let player_id in resources){
                const player_bid_loc = resources[player_id].bid_loc;
                const player_color = this.player_color[player_id];
                if (player_bid_loc == NO_BID || player_bid_loc == OUTBID){
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color.toString(), id: "bid"}),'bid_limbo');
                    this.token_zone[-1].placeInZone(`token_${player_color}_bid`);
                } else if (player_bid_loc == BID_PASS) {
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color.toString(), id: "bid"}),'token_zone_'+player_color);
                    this.token_zone[player_id].placeInZone(`token_${player_color}_bid`);
                } else {
                    const bid_pair = this.getBidPairFromBidNo(player_bid_loc);
                    const bid_aucNo = bid_pair.auction_no;
                    const bid_slot = this.bid_val_arr[bid_pair.bid_index];
                    //console.log(`bid_no: ${player_bid_loc}, loc: ${bid_aucNo}, bid_slot: ${bid_slot}`);
                    const bid_slot_divId = `bid_slot_${bid_aucNo}_${bid_slot}`;
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color.toString(), id: "bid"}), bid_slot_divId);
                    this.bid_zones[bid_aucNo][bid_pair.bid_index].placeInZone(`token_${player_color}_bid`);
                }
            }
        },

        setupRailLines: function(resources) {
            for(let i =0; i < 6; i++){
                this.rail_line_zone[i].create( this, 'train_advancement_'+i.toString(), 50,50);
                this.rail_line_zone[i].setPattern('horizontalfit');
            }
            for(let player_id in resources){
                const player_rail = 'train_advancement_' + (resources[player_id].rail_adv.toString());
                dojo.place(this.format_block( 'jptpl_token', {
                    type: this.player_color[player_id].toString(), 
                    id: "rail"}),
                player_rail);
                this.rail_line_zone[resources[player_id].rail_adv].placeInZone(`token_${this.player_color[player_id]}_rail`);
            }
        },

        setupTradeButtons: function(){
            const options = dojo.query("#trade_board .trade_option");
            for(let i in options){
                if (options[i].id != null){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
                }
            }
            dojo.connect($('done_trading'), 'onclick', this, 'onSelectDoneTrading' );
        },

        setupBonusButtons: function(){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id != null){
                    //console.log('bonus:'+ bonus_options[i].id);
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
                    setupTiles (this.gamedatas.round_number);  
                    break;
                case 'payWorkers':
                    this.silverCost = Number(args.workerCost[this.player_id]);
                    this.goldAmount = 0;
                    break;
                case 'nextBid':
                    // do something
                    break;
                case 'buildingPhase':
                    // do something
                    break;
                case 'payAuction':
                    this.silverCost = Number(args.auction_cost);
                    this.goldAmount = 0;
                    break;
                case 'chooseBuildingToBuild':
                    // do something
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
            
            switch( stateName )
            {
                case 'collectIncome':
                    break;
                case 'allocateWorkers':
                    break;    
                case 'payWorkers':
                    this.disableTradeIfPossible();
                    break;
                case 'playerBid':
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
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        dojo.place('payment_section', 'top');
                        this.addActionButton( 'btn_trade',     _('Trade'), 'tradeActionButton');
                        this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'raiseGold');
                        this.addActionButton( 'btn_less_gold', _('Use Less Gold'), 'lowerGold');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan');
                        this.addActionButton( 'btn_done',      _('Done'),     'donePayingWorkers');
                    break;
                    case 'allocateWorkers':
                        // show workers that are selectable
                        const workers = dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` );
                        workers.addClass('selectable');
                        // also make building_slots selectable.
                        const buildingSlots = dojo.query(`#building_zone_${this.player_color[current_player_id]} .worker_slot`)
                        buildingSlots.addClass('selectable');
                        if (Number(args.trade) >0){
                            this.addActionButton( 'btn_trade',       _('Trade'),           'tradeActionButton');
                            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton');
                        }
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),       'takeLoan');
                        this.addActionButton( 'btn_done',        _('Done'),            'donePlacingWorkers');
                    break;
                    case 'playerBid':
                        console.log('entering playerBid');
                        for (let bid_key in args.valid_bids) {
                            let bid = args.valid_bids[bid_key];
                            const bid_pair = this.getBidPairFromBidNo(bid);
                            const bid_slot = this.bid_val_arr[bid_pair.bid_index];
                            const bid_slot_id = `bid_slot_${bid_pair.auction_no}_${bid_slot}`;
                            dojo.addClass(bid_slot_id, "selectable");
                            
                        }
                        this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'onSelectConfirmBidButton');
                        this.addActionButton( 'btn_pass',    _('Pass'),    'onSelectPassBidButton', null, false, 'red');
                    break;
                    case 'getRailBonus':
                        var bonus_ids = new Array();
                        bonus_ids.push('train_bonus_1_trade');
                        if (args.rail_options.includes(RAIL_LINE)){
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
                            dojo.addClass($(id),'selectable');
                            this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingBonus');
                        }
                    break;
                    case 'payAuction':
                        dojo.place('payment_section', 'top');
                        this.silverCost = args.auction_cost;
                        this.silverCounter.setValue(Math.max(0 , this.silverCost));
                        this.goldCounter.setValue(this.goldAmount);
                        this.addActionButton( 'btn_trade', _('Trade'), 'tradeActionButton');
                        this.addActionButton( 'btn_more_gold', _('Use More Gold '), 'raiseGold');
                        this.addActionButton( 'btn_less_gold', _('Use Less Gold'),  'lowerGold');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'),      'takeLoan');
                        this.addActionButton( 'btn_done',      _('Done'),           'donePayingAuction');
                    break;
                    case 'chooseBuildingToBuild':
                        
                    break;
                    case 'auctionBonus':
                        
                    break;
                    case 'bonusChoice':
                        
                    break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        /***** building utils *****/
        moveBuildingToPlayer: function(building, player){
            this.player_building_zone[player.player_id].placeInZone(`building_tile_${building.building_key}`);
            if (player.player_id == this.player_id){
                var slots = dojo.query(`#building_tile_${building.building_key} .worker_slot`)            
                for(i in slots){
                    if(slots[i].id != null){
                    dojo.connect($(slots[i].id),'onclick', this, 'onClickOnWorkerSlot');
                    }
                }
            }
        },

        moveBuildingToMainZone: function(building) {
            this.main_building_zone.placeInZone(`building_tile_${building.building_key}`);
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
            for (var auction_id in auctions){
                const auction = auctions[auction_id];
                if (auction.location !=AUCTION_LOC_DISCARD && auction.position == current_round) {
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: auction_id}), this.auction_ids[auction.location]);
                    this.auction_zones[auction.location].placeInZone(`auction_tile_${auction_id}`);
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
        
        disableTradeIfPossible: function() {
            if (dojo.query('#top #trade_board').length ==1){
                this.slideToObject('trade_board', 'bottom');
                // now make the trade options not selectable
                dojo.query('.trade_option').removeClass( 'selectable' );
                dojo.query('#done_trading').removeClass( 'selectable' );
            }
        },

        updateMainBuildingStock: function(buildings){
            // todo make this for transitions where building stock changes [new round most likely]
        
            // use this probably: removeFromStockById( id, to, noupdate );
            // addToStockWithId( type, id, from );
            // get getPresentTypeList();
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
                case 'track':  return RAIL_LINE;
                case 'worker': return WORKER;
                case 'vp':     return VP;
                case 'silver': return SILVER;
                case 'loan':   return LOAN;
            }
        },

        updateSelected: function(type, selected_id) {
            // if not selectable or selected 
            if (!( dojo.hasClass (selected_id, 'selectable')))
            { return; }
            // clear previously selected
            if (! this.last_selected[type] ==""){
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

        lowerGold: function(){
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost += Number(5);
            this.silverCounter.setValue(Math.max(0,this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
        },
        raiseGold: function(){
            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= Number(-5);
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            console.log ('gold -> '+ this.goldAmount+' silver ->'+this.silverCost);
        },

        /***** TRADE *****/
        onSelectTradeAction: function( evt){
            console.log( 'onClickOnTradeSlot' );
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            if( !this.checkAction( 'trade' )) { return; } 
            const tradeAction = evt.target.id.substring(6);  
            // THIS ISN'T DONE YET! //
            // TODO FINISH TRADE ACTION //
            this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                lock: true, 
                tradeAction: tradeAction
             }, this, function( result ) {}, function( is_error) {});
        },
        tradeActionButton: function(){
            if( this.checkAction( 'trade' ) ){
                // if trade options already displayed, set done.
                if (dojo.query('#top #trade_board').length ==1){ 
                    this.disableTradeIfPossible();
                    return;
                }
                this.slideToObject('trade_board', 'top');
                // now make the trade options selectable
                var options = dojo.query(".trade_option");
                options.addClass('selectable');
                const done_trading = dojo.query('#done_trading')
                done_trading.addClass('done_trading' , 'selectable');
                done_trading.removeClass('done_trading' , 'noshow');
                }
        },
        onSelectDoneTrading: function( evt){
            console.log( 'doneTrading' );
            if (evt != null) { dojo.stopEvent( evt ); }
            if ( !dojo.hasClass ('done_trading', 'selectable')) { return; }
            if( !this.checkAction( 'trade' ) ) { return; }
            this.disableTradeIfPossible();
        },

        /***** PLACE WORKERS PHASE *****/
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },

        donePlacingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} ); 
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
            if (!dojo.hasClass(target_divId, "selectable")) { return; }
            if( ! this.checkAction( 'placeWorker' ) )
            { return; }

            if (this.last_selected['worker'] == ""){
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
            }
            console.log( `target: ${target_divId}` );
            const building_key = Number(target_divId.split('_')[2]);
            if(target_divId.startsWith('slot_1')){
                var building_slot = 1; 
            } else if(target_divId.startsWith('slot_2')){
                var building_slot = 2;
            }
            const worker_key = this.last_selected['worker'].split('_')[2];
            this.ajaxcall( "/homesteaders/homesteaders/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: worker_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {}, function( is_error) {});
        },
        /***** PAY WORKERS PHASE *****/
        donePayingWorkers: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePayingWorkers.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} ); 
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
                this.ajaxcall( "/homesteaders/homesteaders/passBid.html", {lock: true}, this, function( result ) {
                }, function( is_error) { } );                
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
                this.ajaxcall( "/homesteaders/homesteaders/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, function( result ) {
                }, function( is_error) { } );                
            }
        },

        /***** PAY AUCTION PHASE *****/
        donePayingAuction: function(){
            if( this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/donePayingAuction.html", {lock: true}, this, 
                function( result ) {}, 
                function( is_error) {} ); 
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
                    function( result ) {}, 
                    function( is_error) {} ); 
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
            console.log( 'notifications subscriptions setup' );
            
            dojo.subscribe( 'gainWorker',  this, "notif_gainWorker" );
            dojo.subscribe( 'workerMoved', this, "notif_workerMoved" );
            dojo.subscribe( 'railAdv',     this, "notif_railAdv" );
            dojo.subscribe( 'moveBid',     this, "notif_moveBid");
            dojo.subscribe( 'playerIncome', this, "notif_playerIncome");

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

        notif_workerMoved: function( notif ){
            console.log( 'notif_workerMoved' );
            console.log( notif );
            
            this.building_worker_zones[notif.args.building_key][notif.args.building_slot].placeInZone('token_worker_'+notif.args.worker_key.toString());
            if (notif.args.player_id == this.player_id)
            {
                dojo.removeClass(this.last_selected['worker'] ,'selected');
                this.last_selected['worker'] = "";
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
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_token', {
                type: "worker", id: notif.args.worker_key.toString()}), this.token_div[notif.args.player_id] );
            this.token_zone[notif.args.player_id].placeInZone(worker_divId);
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
            }
        },

        notif_moveBid: function( notif ){
            console.log ('notif_moveBid');
            console.log( notif );
            const player_color = this.player_color[notif.args.player_id];
            const bid_divId = `token_${player_color}_bid`;
            console.log("id:" + bid_divId + ", loc:"+ notif.args.bid_location );
            if (notif.args.player_id == this.player_id){
                var bids = dojo.query('.bid_loc');
                for(i in bids){
                    if (!bids[i].id == null){
                        dojo.removeClass($(bids[i].id) ,'selectable');
                    }
                }
                if (this.last_selected['bid'].id != null)
                    dojo.removeClass($(this.last_selected['bid'].id), 'selected');
                this.last_selected['bid'] = "";
            }
            if (notif.args.bid_location == 10) { // OUTBID
                this.token_zone[-1].placeInZone(bid_divId);
            } else if(notif.args.bid_location == 20){ // pass
                this.token_zone[notif.args.player_id].placeInZone(bid_divId);
            } else { //actual bid
                let bid_pair = this.getBidPairFromBidNo(notif.args.bid_location);
                this.bid_zones[bid_pair.auction_no][bid_pair.bid_index].placeInZone(bid_divId);
            }
        },

        notif_buyBuilding: function( notif ){
            console.log ('notif_buyBuilding');
            console.log ( notif ); 
            this.player_building_zone[notif.args.player_id].placeInZone(`building_tile_${notif.args.building_key}`);
        },

        notif_playerIncome: function( notif ){
            console.log ('notif_playerIncome');
            console.log ( notif);
            for(let i = 0; i < notif.args.amount; i++){
                console.log("sending token '"+notif.args.type+"' to player '"+ notif.args.player_id+ "'");
                this.slideTemporaryObject( `<div class="token token_${notif.args.type}"`,'limbo' , 'board', `player_zone_${this.player_color[notif.args.player_id]}` , 500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.type].incValue(1);
                }
            }  
        },
   });             
});
