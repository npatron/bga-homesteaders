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
    "dijit/form/CheckBox"
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
    const RESOURCES = {'wood':WOOD, 'steel':STEEL, 'gold':GOLD, 'copper':COPPER, 'food':FOOD, 'cow':COW,
        'trade':TRADE, 'track':TRACK, 'worker':WORKER, 'vp':VP, 'silver':SILVER, 'loan':LOAN}

    const ZONE_PENDING = -1;
    const ZONE_PASSED = -2;

    const VP_B_RESIDENTIAL = 0; 
    const VP_B_COMMERCIAL = 1; 
    const VP_B_INDUSTRIAL = 2; 
    const VP_B_SPECIAL = 3; 
    const VP_B_WORKER = 4; 
    const VP_B_TRACK = 5; 
    const VP_B_BUILDING = 6;
    const VP_B_WRK_TRK = 7; //Workers & TRACK Bonus

    const BLD_LOC_FUTURE  = 0;
    const BLD_LOC_OFFER   = 1;
    const BLD_LOC_PLAYER  = 2;
    const BLD_LOC_DISCARD = 3;
    const AUC_LOC_FUTURE  = 2;

    const TRADE_BUTTON_SHOW    = 0;
    const TRADE_BUTTON_HIDE    = 1;
    const TRADE_BUTTON_CONFIRM = 2;

    // building ID's required for trade
    const BLD_MARKET = 7;
    const BLD_GENERAL_STORE = 14;
    const BLD_RIVER_PORT = 17;
    const BLD_BANK   = 22;
    const BLD_RODEO  = 26;

    // string templates for dynamic assets
    const TPL_BLD_TILE = "building_tile";
    const TPL_BLD_STACK = "building_stack_";
    const TPL_BLD_ZONE = "building_zone_";
    const TPL_BLD_CLASS ="build_tile_";
    const TPL_AUC_TILE = "auction_tile";
    const TPL_AUC_ZONE = "auction_tile_zone_";

    const FIRST_PLAYER_ID = 'first_player_tile';
    const CONFIRM_TRADE_BTN_ID = 'confirm_trade_btn';
    const UNDO_TRADE_BTN_ID = 'undo_trades_btn';
    const UNDO_LAST_TRADE_BTN_ID = 'undo_last_trade_btn';
    const TRADE_BUTTON_ID = 'btn_trade';

    // arrays for the map between toggle buttons and show/hide zones 
    const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld'];
    const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard'];
    const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container'];
    const TILE_ZONE_DIVID   = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone'];
    
    const TRADE_MAP = {'buy_wood':0,  'buy_food':1,  'buy_steel':2, 'buy_gold':3, 'buy_copper':4, 'buy_cow':5,
                       'sell_wood':6, 'sell_food':7, 'sell_steel':8, 'sell_gold':9, 'sell_copper':10, 'sell_cow':11, 
                       'market_food':12, 'market_steel':13, 'bank':14, 'loan':15, 'payloan_silver':16, 'payloan_gold':17};
    
    const MARKET_FOOD_DIVID = 'trade_market_wood_food';
    const MARKET_STEEL_DIVID ='trade_market_food_steel';
    const BANK_DIVID = 'trade_bank_trade_silver';

    const TRADE_BOARD_ID = 'trade_board';
    const BUY_BOARD_ID = 'buy_board';
    const SELL_BOARD_ID = 'sell_board';
    const TRADE_BOARD_ACTION_SELECTOR = `#${TRADE_BOARD_ID} .trade_option`;
    const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
    'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option',
    'track':'.token_track'};

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
    const ASSET_COLORS = {0:'res', 1:'com', 2:'ind', 3:'spe', 4:'any', 6:'',
                          10:'a4' ,11:'a1',12:'a2',13:'a3'};
    const VP_TOKENS = ['vp2', 'vp3', 'vp4','vp6','vp8'];

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['currentPlayer','First', 'Second', 'Third', 'Fourth',];

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){
            // zone control
            this.token_zone = [];
            this.token_divId = [];
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_token_divId =[];
            // auction bid zones
            this.bid_zone_divId= [];
            this.auction_zones = [];
            this.train_token_divId = []; // rail adv train token id.
            this.auction_ids = [];

            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();
            this.roundCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_score_zone_id = [];
            this.player_building_zone_id = [];
            this.player_building_zone = [];
                        
            // storage for buildings
            this.main_building_counts = []; // counts of each building_id in main zone. for use by update Buildings methods.
            
            this.building_worker_ids = [];
            this.score_resourceCounters = []; // player's resource counters
            
            // only this.player_id used for trade/loans/etc.
            this.board_resourceCounters = []; 
            this.pos_offset_resourceCounter = [];
            this.neg_offset_resourceCounter = [];
            this.new_resourceCounter = [];
            this.transactionCost = [];
            this.transactionLog = [];
            this.buildingCost = [];
            this.allowTrade = false;
            this.tradeEnabled = false;
            this.showPay = false;
            this.showConfirmTrade = false; // should only matter for using resources mid phase (hiring workers) so place_workers/end_round
            this.can_cancel = false;

            this.token_dimension = 50;
            this.bid_height = 52;
            this.bid_width = 46;
            this.worker_height = 35;
            this.worker_width = 33;
            
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;
            this.first_player = 0;
            // for tracking current auction (for title update)
            this.current_auction = 1;
            this.number_auctions = 0;
            this.income_arr = [];

            this.b_connect_handler = [];
            this.hasBuilding = []; 
            this.last_selected = [];
            this.show_player_info = false;
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
            this.isSpectator = true;
            this.playerCount = 0;
            this.show_player_info = gamedatas.show_player_info;
            this.resource_info = gamedatas.resource_info;
            
            this.building_info = gamedatas.building_info;
            this.asset_strings = gamedatas.translation_strings;
            this.setupResourceTokens();
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.playerCount++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            this.setupPlayerResources(gamedatas.player_resources, gamedatas.resources, gamedatas.resource_info);
            if (!this.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                //this.setupUseSilverCheckbox(gamedatas.players[this.player_id]['use_silver']);
                this.setupTradeButtons();
            } else {
                this.spectatorFormatting();
            }
            dojo.destroy('useSilver_form');
            if (this.playerCount == 2){
                this.player_color[DUMMY_BID] = this.getAvailableColor();
                this.player_color[DUMMY_OPT] = this.player_color[0];
            }
            this.omitImages();
            
            // Auctions: 
            this.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings, gamedatas.building_info);
            this.setupTracks(gamedatas.tracks);

            dojo.place(FIRST_PLAYER_ID, this.player_score_zone_id[gamedatas.first_player]);
            this.first_player = Number(gamedatas.first_player);
            this.addTooltipHtml( FIRST_PLAYER_ID, `<span class="font caps">${_('First Bid in Next Auction')}</span><span class="fp_tile building_tile" style="display:block"></span>` ); 
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones();
            this.setupBidTokens(gamedatas.bids);

            this.setupRailLines(gamedatas.players);
            this.setupRailAdvanceButtons(gamedatas.resource_info);
            this.setupShowButtons();
            if (gamedatas.round_number ==11){
                dojo.destroy('#round_number');
                $("round_text").innerHTML=_('Final Income and Scoring Round');
            } else {
                this.roundCounter.create('round_number');
                this.roundCounter.setValue(gamedatas.round_number);
            }
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);
            this.can_cancel = gamedatas.can_undo_trades;
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupPlayerAssets: function (player){
            const current_player_color = player.color_name;
            const p_id = player.p_id;            
            dojo.removeClass("player_zone_"+current_player_color, "noshow");
            if (this.player_id == p_id) {
                this.isSpectator = false;
            }
            const player_board_div = 'player_board_'+p_id;
            this.player_score_zone_id[p_id] = player_board_div;
            this.player_color[p_id] = current_player_color;
            if( this.player_id == p_id || this.show_player_info){
                dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
                this.token_divId[p_id]  = `player_resources_${current_player_color}`;
                dojo.destroy(`token_zone_${current_player_color}`);
            } else {
                this.token_divId[p_id]  = 'token_zone_' + current_player_color;  
                dojo.place(`worker_zone_${current_player_color}`, this.token_divId[p_id]);
                dojo.destroy(`player_resources_${current_player_color}`, 'noshow');
            }
            
            this.token_zone[p_id]   = 'worker_zone_'+ current_player_color;

            this.player_building_zone_id[p_id] = TPL_BLD_ZONE + this.player_color[p_id];
        },
        
        setupUseSilverCheckbox: function(checked){
            $('checkbox1').checked = (checked == 1);
            dojo.connect($('checkbox1'), 'change', this, 'toggleCheckbox');
        },

        toggleCheckbox: function(event) {
            this.ajaxcall( "/homesteaders/homesteaders/toggleCheckbox.html", {lock: true, checked:(event.target.checked)}, this, 
                function( result ) { }, 
                function( is_error) { } );
        },

        /**
         * should only be called when not spectator, 
         * This will orient the player zones by player order (with this.player_id first)
         * @param {array} order_table 
         */
        orientPlayerZones: function (order_table){
            dojo.place(`player_zone_${this.player_color[this.player_id]}`, PLAYER_ORDER[0] , 'replace');
            let next_pId = order_table[this.player_id];
            for (let i = 1; i < this.playerCount; i++){
                dojo.place(`player_zone_${this.player_color[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
            for(let i = this.playerCount; i < PLAYER_ORDER.length; i++){
                dojo.destroy(PLAYER_ORDER[i]);
            }
        },

        spectatorFormatting: function (order_table){
            dojo.place(TRADE_BOARD_ID, "bottom", 'first');
            dojo.place(`top`, "board_area", 'first');
            dojo.style('top', 'flex-direction', 'row');
        },

        /**
         * this is used to get color for dummy tokens 
         * Currently it should always be purple, but if purple is allowed as player color this will matter.
         */
        getAvailableColor: function(){
            let player_color_option = ['purple', 'blue', 'yellow', 'green', 'red'];
            for(let i in player_color_option){
                if (!this.player_color.includes(player_color_option[i]))
                {   
                    return player_color_option[i];
                }
            }
        },

        /**
         * temporary solution to speed up loading, may want to remove for release.
         */
        omitImages: function() {
            this.dontPreloadImage( 'exp_building_144x196.png' );
        },

        /**
         * should only be called when not spectator, 
         * It will put the player resources in the player Score area.
         * @param {*} player_resources - if hide player resources & not-spectator, fill resources with this
         * @param {*} resources        - otherwise use this to fill all resources.
         * @param {*} info 
         */
        setupPlayerResources: function (player_resources, resources, info){
            if (this.show_player_info){
                for (let player_res in resources){
                    this.setupOnePlayerResources(resources[player_res], info);
                }
            } else if (!this.isSpectator){
                this.setupOnePlayerResources(player_resources, info);
            }
        },

        incResCounter(p_id, type, value){
            this.board_resourceCounters[p_id][type].incValue(value);
            this.score_resourceCounters[p_id][type].incValue(value);
        },

        /**
         * Resource array for this person.
         * @param {array} resource 
         * @param {*} info 
         */
        setupOnePlayerResources: function (resource, info) {
            this.board_resourceCounters[resource.p_id] = [];
            this.score_resourceCounters[resource.p_id] = [];
            for (const [key, value] of Object.entries(resource)) {
                //console.log(resource, key, value);
                if (key == "p_id" || key == "workers" || key == "track") continue;
                let tooltip_html = this.format_block('jptpl_res_tt', {value:this.replaceTooltipStrings(info[key]['tt'])});
                
                let resourceId = `${key}count_${resource.p_id}`;
                this.addTooltipHtml( resourceId, tooltip_html);
                let iconId = `${key}icon_p${resource.p_id}`;
                this.addTooltipHtml( iconId, tooltip_html );

                this.score_resourceCounters[resource.p_id][key] = new ebg.counter();
                this.score_resourceCounters[resource.p_id][key].create(resourceId);
                this.score_resourceCounters[resource.p_id][key].setValue(value);

                let boardResourceId = `${key}count_${this.player_color[resource.p_id]}`;
                this.addTooltipHtml( boardResourceId, tooltip_html );
                let boardIconId = `${key}icon_${this.player_color[resource.p_id]}`;
                this.addTooltipHtml( boardIconId, tooltip_html );

                this.board_resourceCounters[resource.p_id][key] = new ebg.counter();
                this.board_resourceCounters[resource.p_id][key].create(boardResourceId);
                this.board_resourceCounters[resource.p_id][key].setValue(value);
            }
        },

        /**
         * Setup the Building Tiles, 
         * both in player areas as well as in the offer areas 
         * (main,discard,future)
         * @param {*} buildings 
         * @param {*} info 
         */
        setupBuildings: function(buildings, info) {
            for (let b_key in buildings){
                const building = buildings[b_key];  
                if (building.location == BLD_LOC_PLAYER){
                    this.addBuildingToPlayer(building, info[building.b_id]);
                } else {
                    this.addBuildingToOffer(building, info[building.b_id]);
                }
            }
        },

        /**
         * Setup the existing Tracks tokens (in player building section) built by players 
         * @param {*} tracks 
         */
        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: this.player_color[track.p_id]}), this.token_divId[track.p_id]);
            }
            this.addTooltipHtmlToClass("token_track", `<div style="text-align:center;">${this.replaceTooltipStrings(this.resource_info['track']['tt'])}</div>`);
        },

        /**
         * Create Building worker slots 
         * that are used for assigning workers to buildings (when owned by players)
         * @param {*} building - information about the building to add slots to
         * @param {*} b_info - info from material.inc for building_id 
         */
        addBuildingWorkerSlots: function(building, b_info){
            const key = building.b_key; 
            const id = building.b_id;
            const b_divId = `${TPL_BLD_TILE}_${key}`;
            if (id == BLD_BANK){
                dojo.place(`<div id="${BANK_DIVID}" class="trade_option"></div>`, b_divId,'last');
                dojo.connect($(BANK_DIVID), 'onclick', this, 'onBankResource');
            }
            if (!(b_info.hasOwnProperty('slot'))) return;
            if (b_info.slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][1] = `slot_${key}_1`;
                this.addTooltipHtml( this.building_worker_ids[key][1], this.formatWorkerSlotTooltip(b_info ,1));
                dojo.connect($(this.building_worker_ids[key][1]), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (b_info.slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), b_divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][1] = `slot_${key}_1`;
                this.building_worker_ids[key][2] = `slot_${key}_2`;
                this.addTooltipHtml( this.building_worker_ids[key][1], this.formatWorkerSlotTooltip(b_info, 1));
                this.addTooltipHtml( this.building_worker_ids[key][2], this.formatWorkerSlotTooltip(b_info, 2));
                dojo.connect($(this.building_worker_ids[key][1]), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(this.building_worker_ids[key][2]), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (b_info.slot == 3){
                // currently
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][3] = `slot_${key}_3`;
                this.addTooltipHtml( this.building_worker_ids[key][3], this.formatWorkerSlotTooltip(b_info, 3));
                dojo.style(this.building_worker_ids[key][3], 'max-width', `${(this.worker_width*1.5)}px`);
                dojo.connect($(this.building_worker_ids[key][3]), 'onclick', this, 'onClickOnWorkerSlot');
            }
            if (id == BLD_MARKET){
                dojo.place(`<div id="${key}_${MARKET_FOOD_DIVID}" class="trade_option"> </div><div id="${key}_${MARKET_STEEL_DIVID}" class="trade_option"> </div>`, b_divId,'last');
                dojo.connect($(key+"_"+MARKET_FOOD_DIVID), 'onclick', this, 'onMarketResource');
                dojo.connect($(key+"_"+MARKET_STEEL_DIVID), 'onclick', this, 'onMarketResource');
            }
        
    
        },
        
        formatWorkerSlotTooltip(b_info, slot_no){
            var tt = this.getOneResourceHtml('worker');
            if (slot_no == 3) { tt += this.getOneResourceHtml('worker'); }
            tt += " " + this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtml(b_info['s'+slot_no], true);
            return tt;
        },

        /**
         * Create Workers that are hired by players, and place them in worker slots, if currently assigned.
         * @param {*} workers 
         */
        setupWorkers: function(workers) {
            for (let w_key in workers){
                const worker = workers[w_key];
                dojo.place(this.format_block( 'jptpl_worker', {id: w_key.toString()}), 
                        this.token_divId[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                if (worker.b_key != 0 ){ 
                    dojo.place(worker_divId, this.building_worker_ids[worker.b_key][worker.b_slot]);
                } else {
                    dojo.place(worker_divId, this.token_zone[worker.p_id]);
                }
                if (worker.p_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        /**
         * connect actions to the Bid Slots, used for bids.
         */
        setupBidZones: function () {
            this.bid_zone_divId[ZONE_PENDING] = 'pending_bids';
            this.bid_zone_divId[ZONE_PASSED] = 'passed_bids';
            
            for (let auc = 1; auc <= 3; auc++){
                this.bid_zone_divId[auc] = [];
                for (let bid =0; bid < BID_VAL_ARR.length; bid ++){
                    this.bid_zone_divId[auc][bid] = `bid_slot_${auc}_${BID_VAL_ARR[bid]}`;
                    dojo.connect($(this.bid_zone_divId[auc][bid]), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        /**
         * Creates the player Bid Tokens (Boot) and puts them in locations mapping to their position on auction board.
         * @param {*} bids 
         */
        setupBidTokens: function(bids) {
            for(let p_id in bids){
                const token_bid_loc = bids[p_id].bid_loc;
                const token_color = this.player_color[p_id];
                if( p_id == DUMMY_OPT) {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}_dummy`;
                    dojo.place(this.format_block( 'jptpl_dummy_player_token', {color: token_color, type: "bid"}), this.bid_zone_divId[ZONE_PENDING]);
                } else {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}`;
                    dojo.place(this.format_block( 'jptpl_player_token', {color: token_color, type: "bid"}), this.bid_zone_divId[ZONE_PENDING]);
                }
                //pending is default.
                if (token_bid_loc == BID_PASS) {
                    dojo.place(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PASSED]);
                } else if (token_bid_loc != NO_BID){ 
                    dojo.place(this.bid_token_divId[p_id], this.getBidLocDivIdFromBidNo(token_bid_loc));
                }
            }
        },

        /**
         * Creates, and places the player train tokens on the auction board.
         * @param {*} players 
         */
        setupRailLines: function(players) {
            for(let p_id in players){
                const player_rail_adv = players[p_id].rail_adv;
                this.train_token_divId[p_id] = `token_train_${this.player_color[p_id]}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: this.player_color[p_id].toString(), type: "train"}), `train_advancement_${player_rail_adv}`);
            }
        },

        /**
         * connects click actions to buttons for selecting Trade actions, 
         * should only be called if not spectator.
         * 
         * it also will assign click action to the button for approve trade/undo transactions.
         */
        setupTradeButtons: function(){
            dojo.connect($(UNDO_TRADE_BTN_ID), 'onclick', this, 'undoTransactionsButton');
            dojo.connect($(UNDO_LAST_TRADE_BTN_ID), 'onclick', this, 'undoLastTransaction');
            const options = dojo.query(`#${TRADE_BOARD_ID} .trade_option`);
            for(let i in options){
                if (options[i].id != null){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
            }   }
            // create new and offset counters
            for (const [key, value] of Object.entries(this.resource_info)) {
                if ( key == "workers" || key == "track") continue;
                this.pos_offset_resourceCounter[key] = new ebg.counter();
                this.pos_offset_resourceCounter[key].create(`${key}_pos`);
                this.pos_offset_resourceCounter[key].setValue(0);
                this.neg_offset_resourceCounter[key] = new ebg.counter();
                this.neg_offset_resourceCounter[key].create(`${key}_neg`);
                this.neg_offset_resourceCounter[key].setValue(0);
                this.new_resourceCounter[key] = new ebg.counter();
                this.new_resourceCounter[key].create(`${key}_new`);
                this.new_resourceCounter[key].setValue(0);
            }
            this.resetTradeVals();
        },

        /**
         * Connects click actions to the bonus actions for get Rail advancement action.
         * 
         * @param {*} resource_info 
         */
        setupRailAdvanceButtons: function(resource_info){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id != null){
                    dojo.connect($(bonus_options[i].id),'onclick', this, 'onSelectBonusOption');
                    let type = bonus_options[i].id.split('_')[3];
                    if (type in resource_info)
                        this.addTooltipHtml(resource_info[type].tt);
                } 
            }
        },

        setupResourceTokens(){
            this.tkn_html = [];
            for(let type in RESOURCES){
                this.tkn_html[type] = this.format_block( 'jstpl_resource_inline', {type:type}, );
            }
            this.tkn_html['arrow'] = this.format_block( 'jstpl_resource_inline', {type:'arrow'}, );
            for (let i in VP_TOKENS){
                this.tkn_html[VP_TOKENS[i]] = this.format_block( 'jstpl_resource_inline', {type:VP_TOKENS[i]}, );
            }        
        },

        /**
         * Connect the actions for 
         *   the future auctions button
         *   the building discard button
         *   the future building button
         * and then call the method that will show/hide them based upon if those areas have buildings/auctions in them.
         */
        setupShowButtons: function(){
            dojo.connect($(TOGGLE_BTN_ID[AUC_LOC_FUTURE]), 'onclick', this, 'toggleShowAuctions');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_OFFER]), 'onclick', this, 'toggleShowBldMain');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_DISCARD]),  'onclick', this, 'toggleShowBldDiscard');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_FUTURE]),  'onclick', this, 'toggleShowBldFuture');
            this.showHideButtons();
        },

        showHideToggleButton: function(index, tileId = TPL_BLD_TILE){
            let tile_count = dojo.query(`#${TILE_ZONE_DIVID[index]} .${tileId}`);
            //console.log(`showHideToggleButton`, tile_count);
            if (tile_count.length == 0){
                dojo.addClass(TOGGLE_BTN_ID[index], 'noshow');
            } else if (dojo.hasClass(TOGGLE_BTN_ID[index], 'noshow')){
                dojo.removeClass(TOGGLE_BTN_ID[index], 'noshow');
                dojo.query(`#${TILE_CONTAINER_ID[index]}:not(.noshow)`).addClass('noshow');
            }
        },

        /**
         * show/hide the 
         *   the future auctions button
         *   the building discard button
         *   the future building button
         *   the Main building button
         * such that if the areas have building tiles or auction tiles in them, they will be shown.
         */
        showHideButtons: function(){
            this.showHideToggleButton(AUC_LOC_FUTURE, TPL_AUC_TILE);
            this.showHideToggleButton(BLD_LOC_DISCARD);
            this.showHideToggleButton(BLD_LOC_FUTURE);
            this.showHideToggleButton(BLD_LOC_OFFER);
        },

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            this.currentState = stateName;
            //console.log('onEnteringState', stateName);
            switch( stateName )
            {
                case 'startRound':
                    this.setupTiles (args.args.round_number, 
                        args.args.auctions);  
                    this.allowTrade = false;
                    this.can_cancel = false;
                    break;
                case 'payWorkers':
                    this.setupBidsForNewRound();
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
                    dojo.style(TRADE_BOARD_ID, 'order', 4);
                    break;
                case 'getRailBonus':
                    const active_train = this.train_token_divId[this.getActivePlayerId()];
                    dojo.addClass(active_train, 'animated');
                    break;
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
            const current_player_id = this.player_id;
            //console.log('onLeavingState', stateName);
            switch( stateName )
            {
                case 'setupRound':
                case 'collectIncome':
                    break;
                case 'dummyPlayerBid':
                    const dummy_bid_id = this.bid_token_divId[DUMMY_BID];
                    dojo.removeClass(dummy_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                break;
                case 'playerBid':
                    const active_bid_id = this.bid_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                    this.showPay = false;
                    break;
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                    this.orderZone(BLD_LOC_OFFER, 8);
                    this.clearSelectable('building', true);
                    this.destroyBuildingBreadcrumb();
                    this.fixBuildingOrder();
                    this.buildingCost = [];
                    this.disableTradeIfPossible();
                    break;
                case 'allocateWorkers':
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.showConfirmTrade = false;
                    this.can_cancel = false;
                    this.destroyIncomeBreadcrumb();
                    this.income_arr=[];
                    this.disableTradeIfPossible();
                case 'payAuction':
                case 'bonusChoice':
                    this.disableTradeIfPossible();
                    break;
                case 'payWorkers':
                    this.showPay = false;
                    this.silverCost = 0;
                    this.goldAmount = 0;
                    this.destroyPaymentBreadcrumb();
                    this.disableTradeIfPossible();
                    this.clearOffset();
                    break;
                case 'endBuildRound':
                    this.clearAuction();
                    break;
                case 'confirmActions':
                    this.can_cancel = false;
                case 'getRailBonus':
                    this.clearSelectable('bonus', true);
                    const active_train = this.train_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_train, 'animated');
                    this.disableTradeIfPossible();
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
                     
            if( this.isCurrentPlayerActive() )
            {           
                //console.log("onUpdateActionButtons", stateName, args); 
                switch( stateName )
                {
                    case 'allocateWorkers':
                        this.last_selected['worker'] ="";
                        // show workers that are selectable
                        dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` ).addClass('selectable');
                        // also make building_slots selectable.
                        dojo.query( `#${TPL_BLD_ZONE}${this.player_color[current_player_id]} .worker_slot` ).addClass( 'selectable' );
                        
                        this.addActionButton( 'btn_done',_('Confirm'), 'donePlacingWorkers' );
                        this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
                        this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
                        this.tradeEnabled = false;
                        this.showConfirmTrade = true;
                        this.addTradeActionButton();
                        this.setOffsetForIncome();
                        this.destroyPaymentBreadcrumb();
                    break;
                    case 'payWorkers':
                        this.silverCost = this.getPlayerWorkerCount(this.player_id);
                        this.goldAmount = 0;
                        this.addPaymentButtons(true);
                        this.addTradeActionButton();
                        this.setOffsetForPaymentButtons();
                    break;
                    case 'dummyPlayerBid'://2-player dummy bid phase
                        this.last_selected['bid'] = '';
                        for (let bid_key in args.valid_bids) {
                            const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                            dojo.addClass(bid_slot_id, "selectable" );
                        }
                        this.addActionButton( 'btn_confirm', _('Confirm Dummy Bid'), 'confirmDummyBidButton' );
                    break;
                    case 'playerBid':
                        this.last_selected['bid'] = '';
                        for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                            const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
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
                            dojo.addClass(id,'selectable');
                        }
                        this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingBonus');
                    break;
                    case 'payAuction':
                        this.silverCost = Number(args.auction_cost);
                        this.goldAmount = 0;
                        this.addPaymentButtons();
                        this.addTradeActionButton();
                        this.setOffsetForPaymentButtons();
                    break;
                    case 'chooseBuildingToBuild':
                    case 'trainStationBuild':
                        this.updateBuildingAffordability();
                        this.showTileZone(BLD_LOC_OFFER);
                        this.orderZone(BLD_LOC_OFFER, 0);
                        this.last_selected['building']="";
                        //mark buildings as selectable
                        this.makeBuildingsSelectable(args.allowed_buildings);
                        this.addActionButton( 'btn_choose_building', _('Build ') + '<span id="bld_name"></span>', 'chooseBuilding');
                        dojo.addClass('btn_choose_building' ,'disabled');
                        if (args.riverPort){
                            if (this.goldAsCow){
                                this.addActionButton( 'btn_gold_cow', this.tkn_html['gold'] +" <span id='cow_as'>"+_('As')+"</span> " + this.tkn_html['cow'], 'toggleGoldAsCow', null, false, 'blue');
                            } else {
                                this.addActionButton( 'btn_gold_cow', this.tkn_html['gold'] +" <span id='cow_as' class='no'>"+_('As')+"</span> " + this.tkn_html['cow'], 'toggleGoldAsCow', null, false, 'red');
                            }
                            if (this.goldAsCopper){
                                this.addActionButton( 'btn_gold_copper', `${this.tkn_html['gold']} <span id='copper_as'>${_('As')}</span> ${this.tkn_html['copper']}`, 'toggleGoldAsCopper', null, false, 'blue');
                            } else {
                                this.addActionButton( 'btn_gold_copper', this.tkn_html['gold'] + " <span id='copper_as' class='no'>" + _('As') + "</span> " + this.tkn_html['copper'], 'toggleGoldAsCopper', null, false, 'red');
                            }
                        }
                        this.addActionButton( 'btn_do_not_build', _('Do Not Build'), 'doNotBuild', null, false, 'red');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                        this.can_cancel = true;
                        this.addTradeActionButton();
                    break;
                    case 'resolveBuilding':
                        if (args.building_bonus == BUILD_BONUS_WORKER){
                            this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ this.tkn_html['worker'], 'workerForFreeBuilding');
                            this.addActionButton( 'btn_pass_bonus',   _('Do Not Get Bonus'), 'passBuildingBonus', null, false, 'red');
                            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                            this.can_cancel = true;
                        } //currently only bonus involving a choice is hire worker.
                    break;
                    case 'bonusChoice':
                        const option = Number(args.auction_bonus);
                        switch (option){
                            case AUCBONUS_WORKER:
                            case AUCBONUS_WORKER_RAIL_ADV:
                                this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ this.tkn_html['worker'] , 'workerForFree');
                            break;
                            case AUCBONUS_WOOD_FOR_TRACK:
                                this.addActionButton( 'btn_wood_track', `${this.tkn_html['wood']} ${this.tkn_html['arrow']} ${this.tkn_html['track']}`, 'woodForTrack');
                            break;
                            case AUCBONUS_COPPER_FOR_VP:
                                this.addActionButton( 'btn_copper_vp', `${this.tkn_html['copper']} ${this.tkn_html['arrow']} ${this.tkn_html['vp4']}`, 'copperFor4VP');
                                if (args.riverPort){
                                    this.addActionButton( 'btn_gold_copper', `${this.tkn_html['gold']} ${this.tkn_html['arrow']} ${this.tkn_html['vp4']}`, 'goldFor4VP');
                                }
                                break;
                            case AUCBONUS_COW_FOR_VP:
                                this.addActionButton( 'btn_cow_vp', `${this.tkn_html['cow']} ${this.tkn_html['arrow']} ${this.tkn_html['vp4']}`, 'cowFor4VP');
                                if (args.riverPort){
                                    this.addActionButton( 'btn_gold_cow', `${this.tkn_html['gold']} ${this.tkn_html['arrow']} ${this.tkn_html['vp4']}`, 'goldFor4VP');
                                }
                                break;
                            case AUCBONUS_6VP_AND_FOOD_VP:
                            case AUCBONUS_FOOD_FOR_VP:
                                this.addActionButton( 'btn_food_vp', `${this.tkn_html['food']} ${this.tkn_html['arrow']} ${this.tkn_html['vp2']}`, 'foodFor2VP');
                                break;
                        }
                        this.addActionButton( 'btn_pass_bonus',       _('Do Not Get Bonus'), 'passBonus', null, false, 'red');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),           'cancelTurn', null, false, 'red');
                        this.addTradeActionButton();
                    break;
                    case 'confirmActions':
                        this.updateBuildingAffordability();
                        this.addActionButton( 'btn_done',             _('Confirm'),  'confirmBuildPhase');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
                        this.can_cancel = true;
                    break;
                    case 'endGameActions':
                        this.addActionButton( 'btn_done',          _('Done'),                    'doneEndgameActions');    
                        this.addActionButton( 'btn_pay_loan_silver', _('Pay Loan ') + this.tkn_html['silver'], 'payLoanSilver', null, false, 'gray');
                        this.addActionButton( 'btn_pay_loan_gold',   _('Pay Loan ') + this.tkn_html['gold'],   'payLoanGold',   null, false, 'gray');
                        this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
                        this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
                        this.addTradeActionButton();
                        this.showConfirmTrade = true;
                    break;
                }
            } else if (!this.isSpectator) {
                switch( stateName ) {
                    case 'allocateWorkers':
                        if (args.args[this.player_id].paid==0){
                            this.allowTrade = true;
                            this.silverCost = this.getPlayerWorkerCount(this.player_id);
                            this.goldAmount = 0;
                            this.addPaymentButtons(true);
                            this.addTradeActionButton();
                            this.setOffsetForPaymentButtons();
                        }
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

        /*** setup new Round ***/
        setupTiles: function(round_number, auction_tiles) {
            if (round_number == 11){
                dojo.destroy('#round_number');
                $("round_text").innerHTML=_('Final Income and Scoring Round');
                dojo.query(`#${TILE_ZONE_DIVID[BLD_LOC_OFFER]}`).addClass('noshow')
            } else {
                this.roundCounter.setValue(round_number);
            }
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

        setupAuctionTiles: function (auctions, info){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location !=AUCLOC_DISCARD) {
                    let color = ASSET_COLORS[10+Number(auction.location)];
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), `future_auction_${auction.location}`);
                    dojo.style(`${TPL_AUC_TILE}_${a_id}`, 'order', a_id);
                }
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, this.formatTooltipAuction(info, a_id));
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
        showCurrentAuctions: function (auctions){
            this.current_auction = 0;
            for (let i in auctions){
                const auction = auctions[i];
                this.moveObject(`${TPL_AUC_TILE}_${auction.a_id}`, `${TPL_AUC_ZONE}${auction.location}`)
                if (this.current_auction == 0) 
                    this.current_auction = auction.location;

            }
        },

        /**
         * The plan is for this to be called after each auction tile is resolved (building & bonuses)
         * it should remove the auction tile at auction_no, so that it is clear what state we are at. 
         */
        clearAuction: function(){
            const auc_id = dojo.query(`#${TPL_AUC_ZONE}${this.current_auction} .auction_tile`)[0].id;
            if (auc_id != null){
                dojo.destroy(auc_id);
            }

            const bid_token = dojo.query(`[id^="bid_slot_${this.current_auction}"] [id^="token_bid"]`);
            for(let i in bid_token){
                if (bid_token[i].id != null){
                    const bid_color = bid_token[i].id.split('_')[2];                        
                    for(let p_id in this.player_color){
                        if (p_id == DUMMY_OPT) continue;
                        if (this.player_color[p_id] == bid_color){
                            this.moveBid(p_id, BID_PASS);
                        }
                    }
                }
            }
            if (this.current_auction < this.number_auctions){ this.current_auction++;}
            else { this.current_auction = 1; }
        },

        /***** building utils *****/
        addBuildingToPlayer: function(building, b_info = null){
            const b_id = building.b_id;
            const b_key = building.b_key;
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if ($(this.player_building_zone_id[building.p_id]).parentElement.id.startsWith(TPL_BLD_ZONE) ){
                return;
            }
            if ($(b_divId) != null){ // if element already exists, just move it.
                const wasInMain = (dojo.query( `#${TILE_ZONE_DIVID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
                if (wasInMain){
                    this.moveObject(`${TPL_BLD_TILE}_${b_key}`, this.player_building_zone_id[building.p_id]);
                    dojo.disconnect(this.b_connect_handler[b_key]);
                    if ((this.main_building_counts[building.b_id]--) == 1){
                        this.removeBuildingZone(b_id);
                    }
                } else {
                    this.moveObject(`${TPL_BLD_TILE}_${b_key}`, this.player_building_zone_id[building.p_id]);
                }
            } else { // create it as well;
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), this.player_building_zone_id[building.p_id]);
                this.addTooltipHtml( b_divId, this.formatTooltipBuilding(b_info) );
                this.addBuildingWorkerSlots(building, b_info);
            }
            dojo.query(`#${b_divId}`).style(`order`,`${building.b_order}`);
            this.updateHasBuilding(building.p_id, b_id); 
        },

        formatTooltipBuilding:function (b_info){
            var vp = 'vp'+ ( b_info.vp == null?'0':(Number(b_info.vp)==1)?'':Number(b_info.vp));

            return this.format_block('jptpl_bld_tt', {
                type:  ASSET_COLORS[b_info.type],
                name: b_info.name,
                vp:   vp,
                COST: _('cost:'),
                cost_vals: this.getResourceArrayHtml(b_info.cost, true),
                desc: this.formatBuildingDescription(b_info),
                INCOME: _('income: '),
                inc_vals: this.formatBuildingIncome(b_info),
            });
        },

        formatTooltipAuction: function (a_info, a_id){
            var tt = '<div style="text-align: center;" class="font">';
            var auction_no = Math.ceil(a_id/10); // (1-10) = 1; (11-20) = 2; etc...
            if (auction_no== 1) {// order fixed in A-1
                var title = `<span class="font caps bold a1">${_("Round")} ${a_id}</span><hr>`;
            } else { //order by phase in other auctions
                if ((a_id-1)%10 <4){
                    var phase = _("Settlement");
                } else if ((a_id-1)%10 >7){
                    var phase = _("City");
                } else {
                    var phase = _("Town");
                }
                var title = `<span class="font bold a${auction_no}">${phase}</span><hr>`
            }
            tt += title ;
            if (a_info[a_id].build != null){// there is a build
                var build = "";
                let build_arr = a_info[a_id].build;
                if (build_arr.length == 4){//any
                    build += _(" Build: ")+ this.format_block('jstpl_color_log', {'string':this.asset_strings[4], 'color':ASSET_COLORS[4]}); _(' type');
                } else {
                    let build_html = [];
                    for(let i in build_arr){
                        let b_type = build_arr[i];
                        build_html[i]= _(" Build: ")+ this.format_block('jstpl_color_log', {'string':this.asset_strings[b_type], 'color':ASSET_COLORS[b_type]}); _(' type');
                    }
                    build += build_html.join(this.format_block('jptpl_tt_break', {text:_("OR")}));
                }
                tt += build;
            }

            if (a_info[a_id].bonus != null) {// there is a bonus;
                var bonus_html = "";
                if (a_info[a_id].build != null){
                    bonus_html = this.format_block('jptpl_tt_break', {text:_("AND")});
                }
                switch (a_info[a_id].bonus){
                    case AUCBONUS_WORKER:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free)"));
                    break;
                    case AUCBONUS_WORKER_RAIL_ADV:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free)")) 
                                   + this.format_block('jptpl_tt_break', {text:_("AND")})
                                   + this.replaceTooltipStrings(_("Advance on Railroad track"));
                    break;
                    case AUCBONUS_WOOD_FOR_TRACK:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${wood} for ${track}(once)"));
                    break;
                    case AUCBONUS_COPPER_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${copper} for ${vp4}(once)"));
                    break;
                    case AUCBONUS_COW_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${cow} for ${vp4}(once)"));
                    break;
                    case AUCBONUS_6VP_AND_FOOD_VP:
                        bonus_html += this.replaceTooltipStrings(_("Gain ${vp6}"))
                                   + this.format_block('jptpl_tt_break', {text:_("AND")})
                                   + this.replaceTooltipStrings(_("May trade ${food} for ${vp2}(once)"));
                    break;
                    case AUCBONUS_FOOD_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${food} for ${vp2}(once)"));
                    break;
                }
                tt += bonus_html;
            }

            var end_div = '</div>';
            return tt + end_div;
        },

        /**
         * This method will update inputString then return the updated version.
         * 
         * Any patterns of `${val}` will be replaced with a html token of type `val`
         * It will also replace any `\n` in inputString with a newline `<br>`
         * 
         * @param {String} inputString 
         * @returns {String} updatedString
         */
        replaceTooltipStrings(inputString){
            // required to allow js functions to access file wide globals (in this case `this.tkn_html`).
            let _this = this;
            var updatedString = inputString.replaceAll(/\${(.*?)}/g, 
                    function(f){ return _this.tkn_html[f.substr(2, f.length -3)];});
            updatedString = updatedString.replaceAll(/(\\n)/g, '<br>');
            return updatedString;
        },

        formatBuildingDescription: function(b_info){
            var full_desc = '';
            
            if (b_info.desc != null){
                full_desc =  this.replaceTooltipStrings(b_info.desc);
            }

            if (b_info.on_b != null){
                const GAIN = _(' gain ');
                var on_build_desc = _("When built: ");
                switch(b_info.on_b){
                    case 1: //BUILD_BONUS_PAY_LOAN
                        on_build_desc += _("Pay off ")+this.tkn_html['loan'];
                        break;
                    case 2: //BUILD_BONUS_TRADE
                        on_build_desc += GAIN + this.tkn_html['trade'];
                        break;
                    case 3: //BUILD_BONUS_WORKER
                        on_build_desc += GAIN + this.tkn_html['worker'];
                        break;
                    case 4: //BUILD_BONUS_RAIL_ADVANCE
                        on_build_desc += _('advance on Railroad track');
                        break;
                    case 5: //BUILD_BONUS_TRACK_AND_BUILD
                        on_build_desc += this.tkn_html['track'] +'<br>' + _('You may also build another building of ') + this.format_block('jstpl_color_log', {'string':this.asset_strings[4], 'color':ASSET_COLORS[4]}); _(' type');
                        break;
                    case 6: //BUILD_BONUS_SILVER_SILVER
                        on_build_desc += this.getOneResourceHtml('silver',2);
                        break;
                    case 7: //BUILD_BONUS_SILVER_WORKERS
                        on_build_desc +=  this.tkn_html['silver'] + _(' per ') + this.tkn_html['worker'] + '<br>'+ _('When you gain ')+ this.tkn_html['worker'] +_(' gain ') + this.tkn_html['silver'];
                        break;
                    case 8: //BUILD_BONUS_PLACE_RESOURCES

                }
                full_desc = on_build_desc +'<br>'+ full_desc;
            }
            if (b_info.vp_b != null){
                const END = _("End: ");
                let vp_b = END + this.getOneResourceHtml('vp', 1, true) + this.asset_strings[7];
                switch(b_info.vp_b){
                    case 0: //VP_B_RESIDENTIAL
                    case 1: //VP_B_COMMERCIAL
                    case 2: //VP_B_INDUSTRIAL
                    case 3: //VP_B_SPECIAL
                    case 6: //VP_B_BUILDING
                        vp_b += this.format_block('jstpl_color_log', {string: this.asset_strings[b_info.vp_b], color:ASSET_COLORS[b_info.vp_b]}) + "<br>";
                        break;
                    case 4: //VP_B_WORKER
                        vp_b += this.getOneResourceHtml('worker') + "<br>";
                        break;
                    case 7: //VP_B_WRK_TRK
                        vp_b += this.getOneResourceHtml('worker') + "<br>";
                        vp_b += END + this.getOneResourceHtml('vp', 1, true) + this.asset_strings[7];
                    case 5: //VP_B_TRACK
                        vp_b += this.getOneResourceHtml('track', 1, true) + "<br>";
                        break;
                    case 8: //VP_B_PAID_LOAN (expansion)
                        vp_b += this.format_block('jptpl_track_log', {type: 'loan'}) + "<br>";
                        break;
                }
                full_desc += vp_b;
            }
            return full_desc;
        },

        formatBuildingIncome: function(b_info){
            var inc_vals = '';
            const worker = this.getOneResourceHtml('worker', 1, true);
            if (b_info.inc != null){
                if (b_info.inc.silver =='x'){
                    inc_vals = this.getOneResourceHtml('silver', 1, true) +this.asset_strings[7]+ worker +_('(max 5)') + '<br>';
                } else if (b_info.inc.loan == '-1') {
                    inc_vals = _('Pay off ')+ this.format_block('jptpl_track_log', {type: 'loan'}) + '<br>';
                } else {
                    inc_vals = this.getResourceArrayHtmlBigVp(b_info.inc, true) + '<br>';
                }
            }
            if (b_info.slot != null){
                if (b_info.slot ==1){
                    inc_vals +=  worker + " " + this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtmlBigVp(b_info.s1, true) +'<br>';
                }
                if (b_info.slot ==2){
                    inc_vals += worker + " " + this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtmlBigVp(b_info.s1, true) +'<br>' 
                              + worker + " " + this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtmlBigVp(b_info.s2, true) +'<br>';
                }
                if (b_info.slot ==3){
                    inc_vals += worker + worker + " "+ this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtmlBigVp(b_info.s3, true) +'<br>';
                }
            }
            return inc_vals;
        },

        addBuildingToOffer: function(building, b_info = null){
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            const b_loc = TILE_ZONE_DIVID[building.location];
            if (document.querySelector(`#${b_loc} #${b_divId}`) != null){ 
                return; //if already correct, do nothing.
            }
            this.createBuildingZoneIfMissing(building);
            const zone_id = `${TPL_BLD_STACK}${building.b_id}`;
            if (document.querySelector(`#${b_loc} #${zone_id}`) == null){
                dojo.place(zone_id, b_loc);
            }
            if ($(b_divId) == null){ //if missing make the building 
                dojo.place(this.format_block( 'jstpl_buildings', {key: building.b_key, id: building.b_id}), zone_id);
                this.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                this.addTooltipHtml( b_divId, this.formatTooltipBuilding(b_info) );
                this.addBuildingWorkerSlots(building, b_info);
                this.main_building_counts[building.b_id]++;
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (this.main_building_counts[b_id] == 0 || this.main_building_counts[b_id] == null){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), TILE_ZONE_DIVID[building.location]);
                this.main_building_counts[b_id] = 0;
            }
        },

        removeBuildingZone(b_id){
            this.fadeOutAndDestroy( `${TPL_BLD_STACK}${b_id}`);
        },

        cancelBuild: function(building){
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            building.location=BLD_LOC_OFFER;
            this.createBuildingZoneIfMissing(building);
            this.moveObject(b_divId, `${TPL_BLD_STACK}${building.b_id}`);
            this.main_building_counts[building.b_id]++;
            
            //remove from hasBuilding
            this.hasBuilding[building.p_id].splice(building.b_id, 1);

            this.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
        },
        
        updateHasBuilding(p_id, b_id) {
            if (this.hasBuilding[p_id] == null){
                this.hasBuilding[p_id] = [];
            }
            if (this.hasBuilding[p_id][b_id] == null)
                this.hasBuilding[p_id][b_id] = true;
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
            const aucNo = Number(split_bid[2]);
            const bid_no = BID_VAL_ARR.indexOf(Number(split_bid[3])) + 1;
            // bids start at 1 
            return ((aucNo-1)*10 + bid_no);
        },

        /**
         * the goal of this is to allow getting div_id for moving bids to bid_zones
         * return the bid_loc_id for the zone defined by bid_no.
         * 
         * @param {Number} bid_no to get slot_divId from
         */
        getBidLocDivIdFromBidNo: function(bid_no){
            return this.bid_zone_divId[Math.ceil(bid_no/10)][Number(bid_no%10) -1];
        },

        moveBid: function(p_id, bid_loc){
            if (bid_loc == OUTBID || bid_loc == NO_BID) {
                this.moveObject(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PENDING]);
            } else if (bid_loc == BID_PASS) {
                this.moveObject(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PASSED]);
            } else { 
                this.moveObject(this.bid_token_divId[p_id], this.getBidLocDivIdFromBidNo(bid_loc));
            }
        },

        /**
         * This will clear the selectable and selected (if true) flags from assets by type.
         * type locators are set in global TYPE_SELECTOR.
         * if selected is true it will also clear the last_selected[] for this type
         */
        clearSelectable: function(type, selected = false){
            const selectables = dojo.query(TYPE_SELECTOR[type]);
            selectables.removeClass('selectable');
            
            if (selected == true && this.last_selected[type] != "" && this.last_selected[type] != null){
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
        addPaymentButtons: function( ){
            this.addActionButton( 'btn_pay_done', _("Pay : ") +this.format_block("jstpl_pay_button", {}), 'donePay');
            
            this.showPay = true;
            this.silverCounter.create('pay_silver');
            this.silverCounter.setValue(this.silverCost);
            this.goldCounter.create('pay_gold');
            this.goldCounter.setValue(this.goldAmount);
            this.addActionButton( 'btn_more_gold', _('More ') + this.tkn_html['gold'], 'raiseGold', null, false, 'gray');
            this.addActionButton( 'btn_less_gold', _('Less ') + this.tkn_html['gold'], 'lowerGold', null, false, 'gray');
            dojo.style( $('btn_less_gold'), 'display', 'none');
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost +=5;
            if (this.silverCost >0){
                dojo.style( $('pay_silver'), 'display', 'inline-block');
                dojo.style( $('pay_silver_tkn'), 'display', 'inline-block');
                dojo.style( $('btn_more_gold'), 'display', 'inline-block');
                this.silverCounter.setValue(this.silverCost);
            }
            if(this.goldAmount == 0){
                dojo.style( $('pay_gold'), 'display', 'none');
                dojo.style( $('pay_gold_tkn'), 'display', 'none');
                dojo.style( $('btn_less_gold'), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        raiseGold: function(){
            if (this.silverCost <0) return;
            dojo.style( $('pay_gold'), 'display', 'inline-block');
            dojo.style( $('pay_gold_tkn'), 'display', 'inline-block');
            dojo.style( $('btn_less_gold'), 'display', 'inline-block');

            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= 5;
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            if (this.silverCost <= 0){
                dojo.style( $('pay_silver'), 'display', 'none');
                dojo.style( $('pay_silver_tkn'), 'display', 'none');
                dojo.style( $('btn_more_gold'), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        /**
         * Set offset & New values to include cost & transactions.
         */
        setOffsetForPaymentButtons: function( ) {
            // silver
            let silver_offset_neg = this.getOffsetNeg('silver');
            if (this.silverCost >0){
                silver_offset_neg += this.silverCost;
            } 
            this.setOffsetNeg('silver', silver_offset_neg);
            let silver_offset_pos = this.getOffsetPos('silver');
            let silver_new = this.board_resourceCounters[this.player_id].silver.getValue() - silver_offset_neg + silver_offset_pos;
            this.newPosNeg('silver', silver_new);

            // gold
            let gold_offset_neg = this.getOffsetNeg('gold');
            let gold_offset_pos = this.getOffsetPos('gold');
            if (this.goldAmount >0){
                gold_offset_neg += this.goldAmount;
            }
            this.setOffsetNeg('gold', gold_offset_neg);
            let gold_new = this.board_resourceCounters[this.player_id].gold.getValue() - gold_offset_neg + gold_offset_pos;
            this.newPosNeg('gold', gold_new);
            this.updateBuildingAffordability();
            
            this.createPaymentBreadcrumb({'silver':Math.min(0,(-1 *this.silverCost)), 'gold':Math.min(0,(-1 *this.goldAmount))});
        },

        /***** BREADCRUMB METHODS *****/
        createTradeBreadcrumb: function(id, text, tradeAway, tradeFor, loan=false){
            let forOffset = loan?'9px':'2px';
            dojo.place(this.format_block( 'jptpl_breadcrumb_trade', 
            {
                id: id, 
                text:text, 
                away:this.getResourceArrayHtml(tradeAway, true, "position: relative; top: 9px;"),
                off: forOffset,
                for:this.getResourceArrayHtml(tradeFor, true, `position: relative; top: ${forOffset};`)}
                ), `breadcrumb_transactions`, 'before');
        },

        destroyTradeBreadcrumb: function(id){
            if (dojo.query(`#breadcrumb_${id}`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_${id}`);
                this.fadeOutAndDestroy(`breadcrumb_${id}_1`);
            }
        },

        createIncomeBreadcrumb: function(id) {
            if (!(id in this.income_arr)) return;
            let name = `<div title="Rail Tracks" class="bread_track"></div>`;
            let order = 1;
            if (id != -1){
                name = this.format_block('jstpl_color_log', {'string':this.building_info[id].name, 'color':ASSET_COLORS[this.building_info[id].type]});
                let bld = dojo.query(`#${TPL_BLD_ZONE}${this.player_color[this.player_id]} .${TPL_BLD_CLASS}${id}`);
                if (bld[0].style != null){
                    order = Number(bld[0].style.order) + 2;
                }
            }
            let args = {text:name, 'id':id, style:`order:${order};`, income:this.getResourceArrayHtml(this.income_arr[id], true, "position: relative; top: 9px;")};
            if (dojo.query(`#breadcrumb_income_${id}`).length>=1){
                dojo.destroy(`breadcrumb_income_tokens_${id}`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumb_income_${id}`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumbs`, 'first');
            }
        },

        destroyIncomeBreadcrumb: function(){
            for(let id in this.income_arr){
                if (dojo.query(`#breadcrumb_income_${id}`).length == 1){
                    this.fadeOutAndDestroy(`breadcrumb_income_${id}`);
                    this.fadeOutAndDestroy(`breadcrumb_income_tokens_${id}`);
                }
            }
        },

        createPaymentBreadcrumb: function( cost ){
            if (dojo.query('#breadcrumb_payment').length==1){
                dojo.destroy(`breadcrumb_payment_tokens`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_payment', 
                {text:_("Payment"), cost:this.getResourceArrayHtml(cost, true, "position: relative; top: 9px;")}), `breadcrumb_payment`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_payment', 
                {text:_("Payment"), cost:this.getResourceArrayHtml(cost, true, "position: relative; top: 9px;")}), `breadcrumbs`, 'last');
            }
        },

        destroyPaymentBreadcrumb: function(){
            if (dojo.query(`#breadcrumb_payment`).length == 1){
                this.fadeOutAndDestroy('breadcrumb_payment');
                this.fadeOutAndDestroy('breadcrumb_payment_tokens');
            }
        },

        createBuildingBreadcrumb: function(b_name, b_type, cost){
            let b_name_html = this.format_block('jstpl_color_log', {'string':b_name, 'color':ASSET_COLORS[b_type]});
            let b_html = this.format_block( 'jptpl_breadcrumb_building', {text:_("Build ")+b_name_html, cost:this.getResourceArrayHtml(this.invertArray(cost), true, "position: relative; top: 9px;")})
            if (dojo.query('#breadcrumb_building').length==1){
                dojo.destroy('breadcrumb_bldCost');
                dojo.place(b_html, 'breadcrumb_building', 'replace');
            } else {
                dojo.place(b_html, `breadcrumbs`, 'last');
            }
        },
        
        destroyBuildingBreadcrumb: function(){
            if (dojo.query(`#breadcrumb_building`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_building`);
                this.fadeOutAndDestroy(`breadcrumb_bldCost`);
            }
        },

        updateIncomeArr: function(){
            this.income_arr = [];
            const playerBuildingZone = this.player_building_zone_id[this.player_id];
            for(let b_id in this.hasBuilding[this.player_id]){
                this.income_arr[b_id] = [];
                // building base income
                if (this.building_info[b_id].inc != null){
                    // special income
                    if (b_id == BLD_RODEO){
                        this.income_arr[b_id].silver = Math.min(5, this.getPlayerWorkerCount(this.player_id));
                    } else{
                        for(let type in this.building_info[b_id].inc){
                            if (type == 'vp2'){
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp',(2* this.building_info[b_id].inc.vp2));
                            } else {
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type,this.building_info[b_id].inc[type]);
                            }
                        }
                    }
                }
                // building worker income
                if (this.building_info[b_id].slot != null){
                    if (this.building_info[b_id].slot == 3){
                        if (dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot .token_worker`).length == 2){
                            for (type in this.building_info[b_id].s3){
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s3[type]);
                            }
                        }
                    } else {
                        let slots = dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot:not(:empty)`);
                        for(let i in slots){
                            if (slots[i].id == null) continue;
                            if (slots[i].id.split('_')[2] == 1){
                                for (type in this.building_info[b_id].s1){
                                    if (type == 'vp2'){
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp', (2* this.building_info[b_id].s1.vp2));
                                    } else {
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s1[type]);
                                    }
                                }
                            }
                            if (slots[i].id.split('_')[2] == 2){
                                for (type in this.building_info[b_id].s2){
                                    if (type == 'vp2'){
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp', (2* this.building_info[b_id].s2.vp2));
                                    } else {
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s2[type]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // railroad track income
            let tracks = this.getPlayerTrackCount(this.player_id);
            if (tracks >0){
                this.income_arr[-1] = {'silver':tracks};
            }
        },
        
        getIncomeOffset: function(type){
            let amt = 0;
            for (let id in this.income_arr){
                if (this.income_arr[id][type] != null){
                    amt += this.income_arr[id][type];
                }
            }
            return amt;
        },

        setOffsetForIncome: function() {
            this.updateIncomeArr();
            for (let id in this.income_arr){
                for (let type in this.income_arr[id]){
                    if (this.income_arr[id][type]!= 0){
                        let income = this.income_arr[id][type];
                        this.offsetPosNeg(type, income, true);
                        this.newPosNeg(type, income, true);
                        this.updateBuildingAffordability();
                    }
                }
                this.createIncomeBreadcrumb(id);
            }
        },

        clearOffset: function() {
            //console.log("clearOffset");
            for(type in this.pos_offset_resourceCounter){
                this.pos_offset_resourceCounter[type].setValue(0);
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
                this.neg_offset_resourceCounter[type].setValue(0);
                dojo.query(`.${type}.neg:not(.noshow)`).addClass('noshow');
                dojo.query(`#${type}_new:not(.noshow)`).addClass("noshow");
            }
        },

        /****** 
         * cancelNotifications: 
         * cancel past notification log messages with the given move IDs (from sharedcode)
        ********/
        cancelNotifications: function(moveIds) {
            for (var logId in this.log_to_move_id) {
                var moveId = +this.log_to_move_id[logId];
                if (moveIds.includes(moveId)) {
                    dojo.addClass('log_' + logId, 'cancel');
                }
            }
        },

        /***** TRADE *****/
        /**
         * if log has 0 hide all undo buttons.
         * if log has 1 show undo last.
         * if log has 2+ show both undo
         */
        setupUndoTransactionsButtons: function(){
            if (this.transactionLog.length == 0){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');   
            } else if (this.transactionLog.length == 1){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            } else {
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
                dojo.query(`#${UNDO_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            }
        },

        addTradeActionButton: function( ){
            this.addActionButton( 'btn_take_loan', _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
            this.addActionButton( TRADE_BUTTON_ID, "<span id='tr_show'>"+_('Show')+"</span> "+_('Trade'), 'tradeActionButton', null, false, 'gray' );
            dojo.style(TRADE_BOARD_ID, 'order', 2);
            this.resetTradeVals();
            if (this.board_resourceCounters[this.player_id].trade.getValue() ==0) {
                this.tradeEnabled = false;
                dojo.query(`#${TRADE_BUTTON_ID}`).addClass('noshow');
            } else {
                this.enableTradeBoardActions();
            }
        },

        enableTradeBoardActions: function(){
            dojo.query(`#building_zone_${this.player_color[this.player_id]} .trade_option:not(.selectable)`).addClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}:not(.selectable)`).addClass('selectable');
        },

        disableTradeBoardActions: function(){
            dojo.query(`#building_zone_${this.player_color[this.player_id]} .trade_option.selectable`).removeClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}.selectable`).removeClass('selectable');
        },

        /**
         *  primary trade button (can be in 3 states)
         * show trade 
         *  - if have at least 1 trade token, on trade enabled state
         *  - bgabutton_gray
         * hide trade 
         *  - if trade buttons already displayed, but no trades selected
         *  - bgabutton_red
         * Confirm Trade (only if this.showConfirmTrade = true;)
         *  - If trade is selected.
         *  - bgabutton_blue
         */
        tradeActionButton: function( evt){
            if( this.checkAction( 'trade' ) ){
                if (dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_blue`).length > 0){// confirm
                    // confirm trade
                    this.confirmTrades( evt );
                    this.setTradeButtonTo( TRADE_BUTTON_HIDE );
                    return;
                }
                if (dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).length > 0){// hide
                    this.disableTradeIfPossible();
                    this.setTradeButtonTo( TRADE_BUTTON_SHOW );
                    return;
                }
                // show trade
                this.enableTradeIfPossible(); 
                this.setTradeButtonTo( TRADE_BUTTON_HIDE );
            }
        },
        
        /** Enable Trade
         * 
         */
        enableTradeIfPossible: function() {
            if (dojo.query(`#${BUY_BOARD_ID}`).length == 0){
                dojo.place(this.format_block('jptpl_buy_sell_board',{}), `building_zone_${this.player_color[this.player_id]}`, 'first');
                for(let i = 0; i <12; i++) {
                    let buy_sell = (i<6?'buy':'sell');
                    let id = `tr${buy_sell.substr(0,3)}_${Object.keys(TRADE_MAP).find(key => TRADE_MAP[key] === i)}`;
                    dojo.place(`<div id="${id}" class="${buy_sell}_option selectable"></div>`, `${buy_sell}_board`, 'last');
                    dojo.connect($(id),'onclick', this, 'onSelectTradeAction');
                }
            }
            this.tradeEnabled = true;
        },

        disableTradeIfPossible: function() {
            this.tradeEnabled = false;
            if(dojo.query(`#${BUY_BOARD_ID}`).length >0){
                dojo.destroy($(BUY_BOARD_ID));
            }
            if(dojo.query(`#${SELL_BOARD_ID}`).length >0){
                dojo.destroy($(SELL_BOARD_ID));
            }
        },

        hideResources: function(){
            // if no building selected, or income displayed, hide stuff
            let thisPlayer = `player_zone_${this.player_color[this.player_id]}`;
            dojo.query(`#${thisPlayer} .new_text:not(.noshow)`).addClass('noshow');
            dojo.query(`#${thisPlayer} .player_text.noshow`).removeClass('noshow');
            
            let hasOffset = [];
            for(let type in this.buildingCost)   { hasOffset[type] = true; }
            for(let i in this.transactionCost)
                for(let type in this.transactionCost[i]) { hasOffset[type] = true; }
            for(let id in this.income_arr)
                for(let type in this.income_arr[id])
                if (this.income_arr[id][type]!= 0)   { hasOffset[type] = true; }
            if (this.silverCost >0){ hasOffset.silver = true; }
            if (this.goldAmount >0){ hasOffset.gold = true; }
            for(let type in hasOffset){
                dojo.query(`#${thisPlayer} .player_${type}_new.noshow`).removeClass('noshow');
            }
        },

        confirmTrades: function ( evt ){
            if (this.transactionLog.length == 0) { return; }
            this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                lock: true, 
                trade_action: this.transactionLog.join(',')
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeVals();
                 this.can_cancel = true;
             }, function( is_error) {});
        },

        getOffsetNeg: function(type){
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i] && this.transactionCost[i][type] < 0){
                    value += this.transactionCost[i][type];
                }
            }
            return Math.abs(value);
        },
        
        getOffsetPos: function(type){
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i] && this.transactionCost[i][type]>0){
                    value += this.transactionCost[i][type];
                }
            }
            return value;
        },

        getOffsetValue: function(type) {
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i]){
                    value += this.transactionCost[i][type];
                }
            }
            return value;
        },

        /**
         * update the offset & new values to be correct 
         * values are board_resourceCounters + offset from pending transactions.
         */
        resetTradeVals: function() {
            for(let type in this.board_resourceCounters[this.player_id]){
                let offset = 0;
                offset -= this.setOffsetNeg(type, this.getOffsetNeg(type));
                offset += this.setOffsetPos(type, this.getOffsetPos(type));

                this.newPosNeg(type, this.board_resourceCounters[this.player_id][type].getValue() + offset);
            }
        },

        onSelectTradeAction: function( evt ){
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            var tradeAction = evt.target.id.substring(6);
            if (TRADE_MAP[tradeAction] < 6){ //buy
                this.onBuyResource ( evt , evt.target.id.substring(10));
            } else { //sell
                this.onSellResource( evt , evt.target.id.substring(11));
            }
        },

        onBuyResource: function ( evt , type = ""){
            //console.log('onBuyResource');
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (type == ""){
                type = evt.target.id.split('_')[0];
            }
            //console.log(type);
            // when buying, trade costs trade_val, so make it negative.
            let tradeChange = [];
            tradeChange = this.invertArray(this.resource_info[type].trade_val);
            tradeChange[type] = 1;
            tradeChange.trade = -1;
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(this.resource_info[type].trade_val);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] = 1;
                this.createTradeBreadcrumb(this.transactionLog.length, _("Buy"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`buy_${type}`]);
                this.updateBuildingAffordability();
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade)
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
            }
        },

        onSellResource: function ( evt , type = "" ){
            //console.log('onSellResource');
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (type == ""){
                type = evt.target.id.split('_')[0];
            }
            //console.log(type);
            let tradeChange = this.copyArray(this.resource_info[type].trade_val); 
            tradeChange[type] = -1;
            tradeChange.trade = -1;
            tradeChange.vp = 1;
            if (this.hasBuilding[this.player_id][BLD_GENERAL_STORE]){
                tradeChange = this.addOrSetArrayKey(tradeChange, 'silver', 1);
            }
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {trade:-1};
                tradeAway[type] = -1;
                let tradeFor = this.copyArray(this.resource_info[type].trade_val);
                tradeFor.vp = 1;
                if (this.hasBuilding[this.player_id][BLD_GENERAL_STORE]){
                    tradeFor = this.addOrSetArrayKey(tradeFor, 'silver', 1);
                }
                this.createTradeBreadcrumb(this.transactionLog.length, _("Sell"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`sell_${type}`]);
                this.updateBuildingAffordability();
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade)
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
            }
        },

        onMoreLoan: function ( evt ){
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' )) { return; }
            if(this.canAddTrade({'loan':1, 'silver':2})){
                this.updateTrade({'loan':1, 'silver':2});
                // add breadcrumb
                this.createTradeBreadcrumb(this.transactionLog.length, "Take Dept", {loan:1}, {silver:2}, true);

                this.transactionCost.push({'loan':1, 'silver':2});
                this.transactionLog.push(TRADE_MAP.loan);
                this.updateBuildingAffordability();
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade)
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
            }
        },

        onMarketResource: function ( evt ){
            //console.log('onMarketResource');
            dojo.stopEvent( evt );
            if (!dojo.hasClass(evt.target.id, "selectable")) { 
                if (evt.target.parentNode.classList.contains('selectable'))
                {   return this.onClickOnBuilding(evt, true); }
                return; }
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            let type = evt.target.id.split('_')[4];
            let tradeChange = this.invertArray(this.resource_info[type].market);
            tradeChange.trade = -1;
            tradeChange[type] = 1;
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(this.resource_info[type].market);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] =1;
                this.createTradeBreadcrumb(this.transactionLog.length, _("Market"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`market_${type}`]);
                this.updateBuildingAffordability();
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade)
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
            }
        },

        onBankResource: function ( evt ){
            //console.log('onBankResource');
            dojo.stopEvent( evt );
            if (!dojo.hasClass(evt.target.id, "selectable")) { 
                if (evt.target.parentNode.classList.contains('selectable'))
                {   return this.onClickOnBuilding(evt, true); }
                return; }
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if(this.canAddTrade({'silver':1, 'trade':-1})){
                this.updateTrade({'silver':1, 'trade':-1});              
                this.createTradeBreadcrumb(this.transactionLog.length, _('Bank'), {trade:1}, {silver:1});

                this.transactionCost.push({'silver':1, 'trade':-1});
                this.transactionLog.push(TRADE_MAP.bank);
                this.updateBuildingAffordability();
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade)
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
            }
        },

        canAddTrade: function( change){
            let can_afford = true;
            for (let type in change){
                let avail_res = this.board_resourceCounters[this.player_id][type].getValue()+ this.getOffsetValue(type);
                can_afford &= (change[type] >0 || (avail_res + change[type] )>=0);
            }
            return can_afford;
        },

        /**
         * show building cost and breadcrumb for building with b_id.
         * if b_id = 0 it will instead remove any existing cost and breadcrumb
         * @param {int} b_id 
         */
        showBuildingCost: function( b_id ) {
            this.updateTrade(this.buildingCost, true);
            let cost = [];
            if (b_id > 0 && this.building_info[b_id].cost != null){
                cost = this.invertArray(this.building_info[b_id].cost);
            }
            this.buildingCost = cost;
            this.updateTrade(cost);
            if (b_id == 0){
                this.destroyBuildingBreadcrumb();
            } else {
                this.createBuildingBreadcrumb(this.building_info[b_id].name, this.building_info[b_id].type, this.invertArray(cost));
            }
        },

        /**
         * change to apply to offsets. if undo is true will instead remove an offset of change.
         * @param {*} change 
         * @param {*} undo 
         */
        updateTrade: function( change , undo = false) {
            //console.log('updateTrade');
            for (let type in change){
                let offset = change[type];
                //console.log(type, offset);
                if (offset > 0){
                    this.setOffsetPos(type, (undo?(-1 * offset):offset), true);
                } else {
                    this.setOffsetNeg(type, (undo?offset:(-1 * offset)), true);
                }
                let offset_value = this.pos_offset_resourceCounter[type].getValue() - this.neg_offset_resourceCounter[type].getValue();
                this.newPosNeg(type, this.board_resourceCounters[this.player_id][type].getValue() + offset_value);
            }
            return true;
        },

        showResource: function(type){
            let showNew = false;
            if (this.pos_offset_resourceCounter[type].getValue() != 0){
                dojo.query(`.${type}.pos.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
            }
            if (this.neg_offset_resourceCounter[type].getValue() != 0){
                dojo.query(`.${type}.neg.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.neg:not(.noshow)`).addClass('noshow');
            }
            if (showNew){
                dojo.query(`#${type}_new.noshow`).removeClass("noshow");
            } else {
                dojo.query(`#${type}_new:not(.noshow)`).addClass("noshow");
            }         
        },

        newPosNeg: function(type, new_value, inc= false){   
            if (inc){
                new_value = this.new_resourceCounter[type].incValue(new_value);
            } else {
                this.new_resourceCounter[type].setValue(new_value);
            }         
            
            if(new_value < 0){
                dojo.query(`#${type}_new`).addClass('negative');
            } else {
                dojo.query(`#${type}_new`).removeClass('negative');
            }
            this.showResource(type);
            return new_value;
        },

        /**
         * update pos offset counter if offset_value is positive, or 
         * update neg offset counter if offset_value is negative.
         * if inc is true, it will increment instead of setting the offset.
         * @param {*} type 
         * @param {*} offset_value 
         * @param {*} inc 
         */
        offsetPosNeg: function(type, offset_value, inc= false){
            if (offset_value > 0){
                this.setOffset(true, type, offset_value, inc);
            } else {
                this.setOffset(false, type, (-1 * offset_value), inc);
            }
        },

        /**
         * update pos offset counter 
         * if inc is true, it will increment instead of setting the offset.
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         */
        setOffsetPos: function(type, offset_value, inc= false){
            return this.setOffset(true, type, offset_value, inc);
        },

        /**
         * update neg offset counter
         * if inc is true, it will increment instead of setting the offset.
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         */
        setOffsetNeg:function(type, offset_value, inc= false){
            return this.setOffset(false, type, offset_value, inc);
        },
        
        /**
         * update the offset counter of `type` with `offset_value`  
         * if inc is true, it will increment instead of setting the offset.
         * 
         * if the resulting value is not 0 it will display the counter.
         * if the resulting value is 0 it will hide the counter.
         * @param {Boolean} pos
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         * @returns the new offset value
         */
        setOffset:function(pos, type, offset_value, inc= false){
            let counter = this.neg_offset_resourceCounter[type];
            if (pos){
                counter = this.pos_offset_resourceCounter[type];
            } 
            if (inc) {
                offset_value = counter.incValue(offset_value);
            } else {
                counter.setValue(offset_value);
            } 
            this.showResource(type);
            return offset_value;
        },
        
        // called after executing trades.
        clearTransactionLog: function() {
            for(let i in this.transactionLog){
                this.destroyTradeBreadcrumb(i);
            }
            this.transactionCost = [];
            this.transactionLog = [];
            this.setupUndoTransactionsButtons();
        },

        undoTransactionsButton: function( ){
            if (this.transactionCost.length ==0) return;
            while (this.transactionLog.length>0){
                this.destroyTradeBreadcrumb(this.transactionCost.length-1);
                this.transactionLog.pop();
                this.updateTrade(this.transactionCost.pop(), true);
                this.updateBuildingAffordability();
            }
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        undoLastTransaction: function() {
            if (this.transactionCost.length ==0) return;
            this.destroyTradeBreadcrumb(this.transactionCost.length-1);
            this.transactionLog.pop();
            this.updateTrade(this.transactionCost.pop(), true);
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        resetTradeButton: function(){
            if(this.transactionLog.length == 0){
                if (this.tradeEnabled){
                    this.setTradeButtonTo(TRADE_BUTTON_HIDE);
                } else {
                    this.setTradeButtonTo(TRADE_BUTTON_SHOW);
                }
            }
        },

        setTradeButtonTo: function( toVal){
            switch(toVal){
                case TRADE_BUTTON_SHOW:
                    dojo.addClass(TRADE_BUTTON_ID,'bgabutton_gray');
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).removeClass('bgabutton_red');
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_blue`).removeClass('bgabutton_blue');
                    $('tr_show').innerText= _('Show');
                    break;
                case TRADE_BUTTON_HIDE:
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_gray`).removeClass('bgabutton_gray');
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_blue`).removeClass('bgabutton_blue');
                    dojo.addClass(TRADE_BUTTON_ID,'bgabutton_red');
                    $('tr_show').innerText= _('Hide');
                    break;
                case TRADE_BUTTON_CONFIRM:
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_gray`).removeClass('bgabutton_gray');
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).removeClass('bgabutton_red');
                    dojo.addClass(TRADE_BUTTON_ID,'bgabutton_blue');
                    $('tr_show').innerText= _('Confirm');
                    break;
            }
        },

        /** Show/Hide Tile Zones */
        toggleShowButton: function (index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                this.showTileZone(index);
            } else {
                this.hideTileZone(index);
            }
        },
        
        hideTileZone: function(index){
            if (!dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                $(TOGGLE_BTN_STR_ID[index]).innerText = _('Show');
                dojo.addClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        showTileZone: function(index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                $(TOGGLE_BTN_STR_ID[index]).innerText = _('Hide');
                dojo.removeClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        orderZone: function(index, order){
            dojo.style(TILE_CONTAINER_ID[index], 'order', order);
        },

        toggleShowAuctions: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(AUC_LOC_FUTURE);
        },

        toggleShowBldMain: function (evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_OFFER);
        },

        toggleShowBldDiscard: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_DISCARD);
        },

        toggleShowBldFuture: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_FUTURE);
        },

        /***** PLACE WORKERS PHASE *****/
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/homesteaders/homesteaders/hireWorker.html", {lock: true}, this, 
                function( result ) {/*this.setupUndoTransactionsButtons();*/}, 
                function( is_error) { } );                
            }
        },
        
        donePlacingWorkers: function( ){
            if( this.checkAction( 'done')){
                const tokenZone = this.token_divId[this.player_id];
                const playerBuildingZone = this.player_building_zone_id[this.player_id];
                if (dojo.query(`#${tokenZone} .token_worker`).length > 0 && dojo.query(`#${playerBuildingZone} .worker_slot:empty`).length > 0){
                    this.confirmationDialog( _('You still have workers to assign, Continue?'), 
                    dojo.hitch( this, function() {
                        this.ajaxDonePlacingWorkers()
                    } ) );
                    return;
                } else {
                    this.ajaxDonePlacingWorkers();
                }
            }
        },

        ajaxDonePlacingWorkers: function(){
            this.ajaxcall( "/homesteaders/homesteaders/donePlacingWorkers.html", {lock: true}, this, 
            function( result ) { 
                this.clearSelectable('worker', true); 
                this.clearSelectable('worker_slot', false);
                this.disableTradeBoardActions();
                this.destroyIncomeBreadcrumb();
                this.income_arr= [];
                this.disableTradeIfPossible();
                this.clearOffset();
            }, function( is_error) { } );
        },
        
        onClickOnWorker: function( evt )
        {
            evt.preventDefault();
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            if ( !this.checkAction( 'placeWorker' ) ) { return; }

            this.updateSelected('worker', evt.target.id);
        },

        onClickOnWorkerSlot: function( evt )
        {
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
                const unassignedWorkers = dojo.query(`#worker_zone_${this.player_color[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
                } else {
                    this.last_selected['worker'] = unassignedWorkers[0].id;
            }
        }
        if (document.querySelector(`#${target_divId} .worker_slot:not(empty)`)){
                if (!target_divId.startsWith('slot_17_3')){
                    this.showMessage(_("You have already assigned a worker there"), 'error');
                    return;
                }
            }
            const building_key = Number(target_divId.split('_')[1]);
            const building_slot = Number(target_divId.split('_')[2]);

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

        /**remove all buttons... 
         * be careful...
         */
        removeButtons: function () {
            dojo.query(`#generalactions .bgabutton`).destroy();
        },

        /***** PAY WORKERS PHASE *****/
        // donePayWorker: function() {
        //     this.donePay(!this.isCurrentPlayerActive());
        // },
        
        /***** PAY WORKERS or PAY AUCTION PHASE *****/
        donePay: function( ){
            if (this.allowTrade){
                if (!this.validPay()){
                    this.showMessage( _("You can't afford to pay, make trades or take loans"), 'error' );
                    return;
                }
                let args = {gold: this.goldAmount, lock: true};
                if (this.transactionLog.length >0){ // makeTrades first.
                    this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                        lock: true, 
                        allowTrade:true,
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxCallDonePay(args);
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallDonePay(args);
                }
            } else if (this.checkAction( 'done')){
                if (!this.validPay()){
                    this.showMessage( _("You can't afford to pay, make trades or take loans"), 'error' );
                    return;
                }
                let args = {gold: this.goldAmount, lock: true};
                if (this.transactionLog.length >0){ // makeTrades first.
                    this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxCallDonePay(args);
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallDonePay(args);
                }
            }
        },

        ajaxCallDonePay: function( args){
            this.ajaxcall( "/homesteaders/homesteaders/donePay.html", args , this, 
                function( result ) { 
                    this.showPay = false;
                    this.disableTradeBoardActions();
                    this.destroyPaymentBreadcrumb();
                    this.resetTradeVals();
                    this.silverCost = 0;
                    this.goldAmount = 0;
                    this.disableTradeIfPossible();
                    this.allowTrade = false;
                }, function( is_error) { } );
        },

        validPay:function(){
            if (this.new_resourceCounter.silver.getValue() < 0)
                return false;
            if (this.new_resourceCounter.gold.getValue() < 0)
                return false;
            return true;
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

        setupBidsForNewRound: function ()
        {
            for(let p_id in this.player_color){
                if (p_id == DUMMY_OPT) continue;
                this.moveBid(p_id, NO_BID);
            }
        },

        /***** PLAYER BID PHASE *****/
        onClickOnBidSlot: function ( evt ) 
        {
            evt.preventDefault();
            dojo.stopEvent( evt );
            var target_divId = evt.target.id;
            if (target_divId.startsWith('token')) { // if clicked on token in bid_slot
                target_divId = evt.target.parentNode.id; 
            }
            if ( !dojo.hasClass(target_divId, "selectable")) { return; }
            if ( !this.checkAction( 'selectBid' )) { return; }
            this.updateSelected('bid', target_divId);
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

        /***** cancel back to PAY AUCTION PHASE *****/
        cancelTurn: function() {
            this.undoTransactionsButton();
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/homesteaders/homesteaders/cancelTurn.html", {lock: true}, this, 
                function( result ) {
                    this.resetTradeVals();
                }, function( is_error) { } ); 
            }
        },

        /***** CHOOSE BONUS OPTION *****/
        onSelectBonusOption: function( evt ){
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
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/homesteaders/homesteaders/doneSelectingBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.disableTradeIfPossible();
                        this.disableTradeBoardActions();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },

        /***** BUILD BUILDING PHASE *****/
        makeBuildingsSelectable: function (allowed_buildings){
            this.allowed_building_stack = [];
            //console.log('makeBuildingsSelectable');
            for(let i in allowed_buildings){
                const building = allowed_buildings[i];
                const building_divId = `${TPL_BLD_TILE}_${building.building_key}`;
                dojo.addClass(building_divId, 'selectable');
                if (!this.allowed_building_stack.includes(building.building_id)){
                    this.allowed_building_stack.push(building.building_id);
                }
            }
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(this.building_info[b_id].type)) + Number(b_id) - 100;
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
        },

        fixBuildingOrder: function(){
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(this.building_info[b_id].type)) + Number(b_id);
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
            this.allowed_building_stack=[];
        },

        updateBuildingAffordability: function(showIncomeCost = false){
            //console.log('updateBuildingAffordability');
            if (this.isSpectator) return;
            let buildings = dojo.query(`#${TILE_CONTAINER_ID[0]} .${TPL_BLD_TILE}, #${TILE_CONTAINER_ID[1]} .${TPL_BLD_TILE}`);
            for (let i in buildings){
                let bld_html= buildings[i];
                if (bld_html.id == null) continue;
                let b_id = $(bld_html.id).className.split(' ')[1].split('_')[2];
                if (this.hasBuilding[this.player_id][b_id]) { //can't buy it twice, mark it un-affordable.
                    dojo.query(`#${bld_html.id}`).removeClass('affordable').removeClass('tradeable').addClass('unaffordable');
                    continue;
                }
                let afford = this.isBuildingAffordable(b_id, showIncomeCost);
                if (afford==1){// affordable
                    dojo.query(`#${bld_html.id}`).addClass('affordable').removeClass('tradeable').removeClass('unaffordable');
                } else if (afford ==0){//tradeable
                    dojo.query(`#${bld_html.id}`).removeClass('affordable').addClass('tradeable').removeClass('unaffordable');
                } else {//unaffordable
                    dojo.query(`#${bld_html.id}`).removeClass('affordable').removeClass('tradeable').addClass('unaffordable');
                }
            }
        },

        /**
         * Checks if building is affordable
         * @param {*} b_id building Id of building to check
         * @returns affordability
         *         -1 if un-affordable (even with trades + loans)
         *          0 if potentially affordable (via trades + loans)
         *          1 if can currently afford (no trades required)
         */
        isBuildingAffordable: function(b_id){
            if (this.building_info[b_id].cost == null) return 1;// no cost, can afford.
            if (this.building_info[b_id].cost.length == 0) return 1;// no cost, can afford.
            
            const p_id = this.player_id;
            let cost = this.building_info[b_id].cost;
            let off_gold = this.getOffsetValue('gold');
            let gold = this.board_resourceCounters[p_id].gold.getValue() + off_gold + this.getIncomeOffset('gold') - this.goldAmount;
            //console.log('gold', gold, this.board_resourceCounters[p_id].gold.getValue(),  off_gold, this.getIncomeOffset('gold'), -this.goldAmount);
            let adv_cost = 0;
            let trade_cost = 0;
            for(let type in cost){
                let res_amt = this.board_resourceCounters[p_id][type].getValue() + this.getOffsetValue(type) + this.getIncomeOffset(type);
                switch(type){
                    case 'wood':
                    case 'food':
                    case 'steel':
                        if (cost[type] > res_amt){
                            trade_cost += (cost[type] - res_amt);
                        }
                    break;
                    case 'gold':
                        if (cost.gold > gold){
                            trade_cost += (cost.gold - gold);
                            gold = 0;
                        } else {
                            gold -= cost.gold;
                        }
                    break;
                    case 'copper':
                    case 'cow':
                        if (cost[type] > res_amt){
                            adv_cost += (cost[type] - res_amt);
                        }
                    break;
                }
            }
            if (this.hasBuilding[p_id][BLD_RIVER_PORT] && gold > 0){
                if (adv_cost > gold){ //buy gold for each missing one.
                    trade_cost += (adv_cost - gold);
                }
            } else {
                trade_cost += adv_cost;
                if (adv_cost > gold){
                    trade_cost += (adv_cost - gold);
                }
            }
            let trade_avail = this.board_resourceCounters[p_id].trade.getValue() + this.getOffsetValue('trade') + this.getIncomeOffset('trade');
            //console.log(this.building_info[b_id].name, 'trade_Cost', trade_cost, 'trade_avail', trade_avail);
            if (trade_cost <= 0)// no trades required.
                return 1;
            if (trade_avail >= trade_cost) 
                return 0;
            else
                return -1;
        },

        /**
         * Triggered when user clicks on building,
         * if this is called with the flag 'parent' == true, then the id in the evt is the child of this building.(clicked on worker slot or trade_option).  
         * If the building is marked as 'selectable' we will attempt to select it, and update the UI accordingly.
         */
        onClickOnBuilding: function( evt , parent= false){
            evt.preventDefault();
            dojo.stopEvent( evt );
            let target_id = evt.target.id;
            if (parent) {target_id = evt.target.parentNode.id;}
            else if (target_id.startsWith('token_worker')){ 
                return this.onClickOnWorker( evt ); 
            } else if (target_id.startsWith('slot_')){
                return this.onClickOnWorkerSlot( evt ); 
            } else if (target_id.startsWith('trade_')){
                return this.onSelectTradeAction( evt ); 
            }
            if( !dojo.hasClass(target_id, 'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                let b_id = $(target_id).className.split(' ')[1].split('_')[2];
                if (dojo.hasClass(target_id, 'selected')){
                    dojo.addClass('btn_choose_building', 'disabled');
                    $('bld_name').innerText = '';
                    this.showBuildingCost(0);
                } else {
                    dojo.removeClass('btn_choose_building', 'disabled');
                    if (this.building_info[b_id].cost == null) {
                        $('bld_name').innerText = this.building_info[b_id].name;    
                    } else {
                        $('bld_name').innerText = this.building_info[b_id].name;
                        this.showBuildingCost(b_id);
                    }
                }
                this.updateSelected('building', target_id);
            }
        },

        chooseBuilding: function () {
            if (this.checkAction( 'buildBuilding')){
                const building_divId = this.last_selected['building'];
                if (building_divId == "") {
                    this.showMessage( _("You must select 1 building"), 'error' );
                    return;
                }
                const building_key = Number(building_divId.split("_")[2]);
                let args = {building_key: building_key, goldAsCow:this.goldAsCow, goldAsCopper:this.goldAsCopper, lock: true};
                if (this.transactionLog.length >0){ // makeTrades first.
                    this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxCallBuildBuilding( args);
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallBuildBuilding( args );
                }
            }
        },

        ajaxCallBuildBuilding: function ( args ) {
            this.ajaxcall( "/homesteaders/homesteaders/buildBuilding.html", args, this, 
            function( result ) {
                this.buildingCost = [];
                this.resetTradeVals();
                this.disableTradeIfPossible();
                this.disableTradeBoardActions();
                this.destroyBuildingBreadcrumb();
             }, function( is_error) { } );
        },

        toggleGoldAsCopper: function(){
            if (this.goldAsCopper){
                this.goldAsCopper = false;
                dojo.removeClass('btn_gold_copper', 'bgabutton_blue');
                dojo.addClass('btn_gold_copper', 'bgabutton_red');
                dojo.addClass('copper_as', 'no');
            } else {
                this.goldAsCopper = true;
                dojo.removeClass('btn_gold_copper', 'bgabutton_red');
                dojo.addClass('btn_gold_copper', 'bgabutton_blue');
                dojo.removeClass('copper_as', 'no');
                if (this.buildingCost['copper']==1){
                }
            }
            if (this.last_selected.building != ""){
                let b_id = $(this.last_selected.building).className.split(' ')[1].split('_')[2];
                this.showBuildingCost(b_id);
            }
        },

        toggleGoldAsCow: function() { 
            if (this.goldAsCow) {
                this.goldAsCow = false;
                dojo.removeClass('btn_gold_cow', 'bgabutton_blue');
                dojo.addClass('btn_gold_cow', 'bgabutton_red');
                dojo.addClass('cow_as', 'no');
            } else {
                this.goldAsCow = true;
                dojo.removeClass('btn_gold_cow', 'bgabutton_red');
                dojo.addClass('btn_gold_cow', 'bgabutton_blue');
                dojo.removeClass('cow_as', 'no');
            }
            if (this.last_selected.building != ""){
                let b_id = $(this.last_selected.building).className.split(' ')[1].split('_')[2];
                this.showBuildingCost(b_id);
            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.confirmationDialog( _('Are you sure you want to not build?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/doNotBuild.html", {lock: true}, this, 
                    function( result ) { 
                        this.clearSelectable('building', true); 
                        this.disableTradeIfPossible();
                        this.disableTradeBoardActions();
                        this.setupUndoTransactionsButtons();
                    }, function( is_error) { } );
                } ) ); 
                return; 
            }
        },

        updateScore: function (p_id, score) {
            this.scoreCtrl[p_id].setValue(score);
        },

        calculateAndUpdateScore: function(p_id) {
            var score = this.calculateBuildingScore(p_id);
            if (this.show_player_info){
                score += this.board_resourceCounters[p_id]['vp'].getValue();
            }
            this.updateScore(p_id,score);
        },

        calculateBuildingScore: function(p_id) {
            let score = 0;
            let bld_type = [0,0,0,0,0,0,0];// count of bld of types: [res,com,ind,spe]
            let vp_b =     [0,0,0,0,0,0,0];//vp_b [Res, Com, Ind, Spe, Wrk, Trk, Bld]
            for(let b_id in this.hasBuilding[p_id]){
                if (this.building_info[b_id].vp != null){
                    score += this.building_info[b_id].vp;
                }
                if (this.building_info[b_id].vp_b != null){
                    if (this.building_info[b_id].vp_b == VP_B_WRK_TRK){
                        vp_b[VP_B_WORKER] ++;
                        vp_b[VP_B_TRACK] ++;
                    } else {
                        vp_b[this.building_info[b_id].vp_b]++;
                    }
                }
                bld_type[this.building_info[b_id].type] ++;
                bld_type[VP_B_BUILDING]++;
            }
            
            bld_type[VP_B_WORKER] = this.getPlayerWorkerCount(p_id);
            bld_type[VP_B_TRACK] = this.getPlayerTrackCount(p_id);
            for (let i in vp_b){
                score += (bld_type[i] * vp_b[i]);
            }
            
            return score;
        },

        getPlayerWorkerCount:function(p_id){
            const playerZone = `player_zone_${this.player_color[p_id]}`;
            const workerSelector = TYPE_SELECTOR['worker'];
            return dojo.query(`#${playerZone} ${workerSelector}`).length;
        },

        getPlayerTrackCount:function(p_id){
            const playerZone = `player_zone_${this.player_color[p_id]}`;
            const trackSelector = TYPE_SELECTOR['track'];
            return dojo.query(`#${playerZone} ${trackSelector}`).length;
        },

        /***** Building Bonus *****/

        workerForFreeBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
            this.ajaxcall( "/homesteaders/homesteaders/freeHireWorkerBuilding.html", {lock: true}, this, 
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
        
        moveObjectAndUpdateClass: function(mobile_obj, target_obj, addClass, update, className){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0);
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_hide', {target_obj:target_obj, mobile_obj:mobile_obj, addClass:addClass, update:update, className:className}));
            animation_id.play();
        },

        callback_hide: function (params) {
            dojo.place (params.mobile_obj, params.target_obj);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
            if (params.addClass){
                dojo.addClass(params.update, params.className);
            } else {
                dojo.removeClass(params.update, params.className);
            }
        },

        moveObjectAndUpdateValues: function(mobile_obj, target_obj){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0);
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_update', {target_obj:target_obj, mobile_obj:mobile_obj, position:"last"}));
            animation_id.play();
        },

        callback_update: function (params) {
            dojo.place (params.mobile_obj, params.target_obj, params.position);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
            this.resetTradeVals();
            this.setOffsetForIncome();
        },

        moveObject: function(mobile_obj, target_obj){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0 );
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_function', {target_obj:target_obj, mobile_obj:mobile_obj, position:"last"}));
            animation_id.play();
        },

        callback_function: function(params) {
            dojo.place (params.mobile_obj, params.target_obj, params.position);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
        },
         

        /***** Auction Bonus *****/
        /** called (directly) when auction bonus is only worker for Free */
        /** called when auction bonus is worker for free and rail advancement. */
        workerForFree: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/freeHireWorkerAuction.html", {lock: true }, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.setupUndoTransactionsButtons();
                }, function( is_error) { } );
            }
        },

        bonusTypeForType: function(tradeAway, tradeFor) {
            if (this.checkAction( 'auctionBonus' )){
                let args = {lock: true, tradeAway: tradeAway, tradeFor: tradeFor};
                if (this.transactionLog.length >0){
                    this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.clearOffset();
                        this.ajaxBonusTypeForType( args );
                     }, function( is_error) {});   
                } else{
                    this.ajaxBonusTypeForType( args );
                }
            }
        },

        ajaxBonusTypeForType(args){
            this.ajaxcall( "/homesteaders/homesteaders/bonusTypeForType.html", args, this, function( result ) { 
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.setupUndoTransactionsButtons();
                }, function( is_error) { } );
        },

        woodForTrack: function() {
            this.bonusTypeForType(WOOD, TRACK);
        },

        goldFor4VP: function() {
            this.bonusTypeForType(GOLD, VP);
        },

        copperFor4VP: function() {
            this.bonusTypeForType(COPPER, VP);
        },

        cowFor4VP: function() {
            this.bonusTypeForType(COW, VP);
        },

        foodFor2VP: function() {
            this.bonusTypeForType(FOOD, VP);
        },

        passBonus: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.confirmationDialog( _('Are you sure you want to pass on bonus?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/passAuctionBonus.html", {lock: true}, this, 
                    function( result ) { 
                        this.clearTransactionLog();
                        this.disableTradeIfPossible();
                        this.resetTradeVals();
                        this.disableTradeBoardActions();
                        this.setupUndoTransactionsButtons(); }, 
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
        payLoanSilver: function( evt ) {
            if (!this.checkAction( 'payLoan' )){return;}
            
            let tradeChange = {'silver':-5,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {'silver':-5};
                let tradeFor = {'loan':-1};
                this.createTradeBreadcrumb(this.transactionLog.length, _("Pay Dept"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP.payloan_silver);
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade){}   
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
                }
            /*  this.ajaxcall( "/homesteaders/homesteaders/payLoan.html", {lock: true, gold:false}, this, 
                function( result ) { }, 
                function( is_error) { } );*/
        },

        payLoanGold: function () {
            if (!this.checkAction( 'payLoan' )){return;}
            let tradeChange = {'gold':-1,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {'gold':-1};
                let tradeFor = {'loan':-1};
                this.createTradeBreadcrumb(this.transactionLog.length, _("Pay Dept"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP.payloan_gold);
                this.setupUndoTransactionsButtons();
                if (this.showConfirmTrade){
                    this.setTradeButtonTo(TRADE_BUTTON_CONFIRM);
                }
            }
            /*  this.ajaxcall( "/homesteaders/homesteaders/payLoan.html", {lock: true, gold:true}, this, 
                function( result ) {}, 
                function( is_error) { } );*/
        },

        cancelUndoTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/undoTransactions.html", {lock: true}, this, 
                function( result ) {
                this.resetTradeVals();
                this.disableTradeIfPossible();
                }, function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                if(this.transactionLog.length >0){
                    this.ajaxcall( "/homesteaders/homesteaders/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.resetTradeVals();
                        this.ajaxDoneEndgame();
                     }, function( is_error) {}); 
                } else {
                    this.ajaxDoneEndgame();
                }
                
            }
        },

        ajaxDoneEndgame: function ( ){
            this.ajaxcall( "/homesteaders/homesteaders/doneEndgameActions.html", {lock: true}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.setupUndoTransactionsButtons(); 
                }, function( is_error) { } );
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
            var notifs = [
                ['autoPay', 50],
                ['buildBuilding', 1000],
                ['cancel', 500],
                ['clearAllBids', 250],
                ['gainWorker', 200],
                ['gainTrack', 200],
                ['loanPaid', 500],
                ['loanTaken', 500],
                ['moveBid', 250],
                ['moveFirstPlayer', 100],
                ['playerIncome', 200],
                ['playerIncomeGroup', 500],
                ['playerPayment', 200],
                ['playerPaymentGroup', 500],
                ['railAdv', 250],
                ['score', 2000],
                ['trade', 200],
                ['updateBuildingStocks', 1000],
                ['workerMoved', 200],
                ['workerPaid', 200],
              ];

            notifs.forEach(notif => {
                dojo.subscribe(notif[0], this, "notif_" + notif[0]);
                this.notifqueue.setSynchronous(notif[0], notif[1]);
            });
            this.notifqueue.setSynchronous('displayScoring', 250);
        },  
        
        /** Override this function to inject html for log items  */

        /* @Override */
        format_string_recursive: function (log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    
                    if (!this.isSpectator)
                        args.You = this.divYou(); // will replace ${You} with colored version
                    
                    // begin -> resource args
                    // only one type of resource.
                    if (args.type != null){
                        if (typeof (args.type) == "string"){ // not an array just type as string
                            args.typeStr = args.type;
                            args.amount = 1;
                            args.type = this.getOneResourceHtml(args.type, 1, false);
                        } else { // array with {type,amount} values
                            args.typeStr = args.type.type;
                            args.amount = args.type.amount;
                            args.type = this.getOneResourceHtml(args.typeStr, args.amount, false);
                        }
                    }
                    // multiple types of resources
                    if (args.tradeAway != null){
                        args.tradeAway_arr = args.tradeAway;
                        args.tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                    }
                    if (args.tradeFor != null){
                        args.tradeFor_arr = args.tradeFor;
                        args.tradeFor = this.getResourceArrayHtml(args.tradeFor_arr);
                    }
                    if (args.resources != null){
                        args.resource_arr = args.resources;
                        args.resources = this.getResourceArrayHtml(args.resources);
                    }
                    // end -> resource args

                    // begin -> specific token args 
                    if (args.arrow != null){
                        args.arrow = this.format_block('jstpl_resource_inline', {type: 'arrow'});
                    }
                    if (args.track != null && typeof args.track == 'string'){
                        args.track = this.format_block('jptpl_track_log', {type: 'track'});
                    }
                    if (args.loan != null && typeof args.loan == 'string'){
                        args.loan = this.format_block('jptpl_track_log', {type: 'loan'});
                    }
                    if (args.worker != null && typeof args.worker == 'string'){
                        args.worker = this.getOneResourceHtml('worker', 1, false);
                    }
                    // handles player_tokens
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
                    // end -> specific token args

                    // begin -> add font only args
                    // format onOff with font (no color)
                    if (args.onOff != null && typeof args.onOff == 'string'){
                        args.onOff_val = (args.onOff == 'on'?true:false);
                        args.onOff = this.format_block('jstpl_color_log', {color:'', string:args.onOff});
                    }
                    // format text with font (no color) this changes the chat log, so disabling it...
                    /*if (args.text != null && typeof args.text == 'string'){
                        args.text = this.format_block('jstpl_color_log', {color:'', string:args.text});
                    }*/
                    // formats args.building_name to have the building Color by type
                    if (args.building_name != null && typeof (args.building_name) != "string"){
                        let color = ASSET_COLORS[Number(args.building_name.type)];
                        args.building_name = this.format_block('jstpl_color_log', {string:args.building_name.str, color:color});
                    }
                    if (args.bidVal != null && typeof(args.bidVal) == 'string'){
                        let color = ASSET_COLORS[Number(args.auction.key)+10];
                        args.bidVal = this.format_block('jstpl_color_log', {string:args.bidVal, color:color});
                    }
                    // this will always set `args.auction` (allowing it to be used in the Title)
                    if (args.auction != null && typeof (args.auction) != 'string'){
                        let color = ASSET_COLORS[Number(args.auction.key)+10];
                        args.auction = this.format_block('jstpl_color_log', {string:args.auction.str, color:color});
                    } else {
                        let color = ASSET_COLORS[Number(this.current_auction)+10];
                        args.auction = this.format_block('jstpl_color_number_log', {color:color, string:"AUCTION ", number:this.current_auction});
                    }
                    // end -> add font only args

                    // handles Building & Auctions, player_tokens, worker, or track
                    if (args.reason_string != null && typeof (args.reason_string) != "string"){
                        if (args.reason_string.type != null){ //Building & Auctions
                            let color = ASSET_COLORS[Number(args.reason_string.type)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string.str, color:color});
                        } else if (args.reason_string.token != null) { // player_tokens (bid/train)
                            const color = this.player_color[args.reason_string.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string.token});
                        } else if (args.reason_string.worker != null) { // worker token
                            args.reason_string = this.getOneResourceHtml('worker', 1, false);
                        } else if (args.reason_string.track != null) { // track 
                            args.reason_string = this.format_block('jptpl_track_log', {type:'track'});
                        }
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

        getOneResourceHtml: function(type, amount=1, asSpan = false, style=""){
            let html_type = asSpan ? 'span': 'div';
            var resString = `<${html_type} class="log_container" style="${style}">`;
            if (amount > 0){ 
                var tokenDiv = this.format_block('jstpl_resource_log', {type : type});
                for(let i=0; i < amount; i++){
                    resString += `${tokenDiv}`;
                }
            }
            return resString + `</${html_type}>`;
        },

        getResourceArrayHtmlBigVp: function (array, asSpan=false) {
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container">`;
            for (let type in array){
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    if (type == 'loan' || type == 'track'){
                        var tokenDiv = this.format_block('jptpl_track_log', {type: type_no});
                    } else if (type == 'vp' || VP_TOKENS.includes(type)) {
                        var tokenDiv = this.format_block('jstpl_resource_log', {"type" : type_no + " bld_vp"});
                    } else {
                        var tokenDiv = this.format_block('jstpl_resource_log', {"type" : type_no});
                    }
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        getResourceArrayHtml: function( array, asSpan=false, style=""){
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container" style="${style}">`;
            for (let type in array){
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    if (type == 'loan' || type == 'track'){
                        var tokenDiv = this.format_block('jptpl_track_log', {type: type_no});
                    } else {
                        var tokenDiv = this.format_block('jstpl_resource_log', {"type" : type_no});
                    }
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        notif_autoPay: function (notif){
            if (this.player_id == notif.args.player_id){
                $('checkbox1').checked = notif.args.onOff_val;
            }
        },

        notif_updateBuildingStocks: function ( notif ){
            this.updateBuildingStocks(notif.args.buildings);
            this.showHideButtons();
        },

        notif_workerMoved: function( notif ){
            //console.log('notif_workerMoved');
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            if (this.player_id == notif.args.player_id){
                this.moveObjectAndUpdateValues(worker_divId, this.building_worker_ids[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            } else {
                this.moveObject(worker_divId, this.building_worker_ids[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            }
        },

        notif_railAdv: function( notif ){
            //console.log('notif_railAdv');
            const train_token = this.train_token_divId[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        notif_gainWorker: function( notif ){
            //console.log('notif_gainWorker');
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_worker', {id: notif.args.worker_key}), this.token_zone[notif.args.player_id] );
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers"){
                    dojo.addClass(worker_divId, 'selectable');
                    this.resetTradeVals();
                    this.setOffsetForIncome();
                }                
            }
            this.calculateAndUpdateScore(notif.args.player_id);
        },

        notif_workerPaid: function( notif ){
            this.showPay = false;
            let buttons = dojo.query(`#generalactions a`);
            for (let btn in buttons){
                if (buttons[btn].id != null){
                    this.fadeOutAndDestroy(buttons[btn].id);
                }
            }
            this.resetTradeVals();
        },

        notif_gainTrack: function( notif ){
            //console.log('notif_gainTrack');
            const p_id = Number(notif.args.player_id);
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: this.player_color[Number(notif.args.player_id)]}),
                    this.token_divId[p_id]);
            this.addTooltipHtml(`token_track_${notif.args.track_key}`, this.resource_info['track']['tt']);
            if (notif.args.tradeAway_arr != null){
                var destination = this.getTargetFromNotifArgs(notif);
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 100*i );
                        if (p_id == this.player_id || this.show_player_info){
                            this.incResCounter(p_id, type, -1);
                        }
                    }
                }
            }
        },

        notif_moveBid: function( notif ){
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        notif_moveFirstPlayer: function (notif ){
            const p_id = Number(notif.args.player_id);
            const tile_id = FIRST_PLAYER_ID;
            if (p_id != this.first_player){
                this.moveObject(tile_id, this.player_score_zone_id[p_id]);
                this.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                this.moveBid(i, BID_PASS);
            }
        },

        notif_buildBuilding: function( notif ){
            this.buildingCost = [];
            const p_id = notif.args.player_id;
            this.addBuildingToPlayer(notif.args.building);
            
            var destination = `${TPL_BLD_TILE}_${Number(notif.args.building.b_key)}`; 
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', this.player_score_zone_id[p_id], destination , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            this.hideResources();
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerIncome: function( notif ){
            //console.log('notif_playerIncome');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:String(notif.args.typeStr)}), 'limbo', start , this.player_score_zone_id[p_id] , 500 , 100*i );
            if (p_id == this.player_id || this.show_player_info){
                    if (VP_TOKENS.includes(notif.args.typeStr)){
                        this.incResCounter(p_id, 'vp',Number(notif.args.typeStr.charAt(2)));
                    } else{ // normal case
                        this.incResCounter(p_id, notif.args.typeStr, 1);
                    }
                }
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerIncomeGroup: function( notif ){
            //console.log('notif_playerIncomeGroup');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', start , this.player_score_zone_id[p_id] , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        if (VP_TOKENS.includes(notif.args.typeStr)){
                            this.incResCounter(p_id, 'vp', Number(notif.args.typeStr.charAt(2)));    
                        } else{ // normal case
                            this.incResCounter(p_id, type, 1);
                        }
                    }
                }   
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerPayment: function( notif ){         
            //console.log('notif_playerPayment');
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:notif.args.typeStr}), 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 100*i );
                if (p_id == this.player_id || this.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1);
                }
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerPaymentGroup: function( notif ){
            //console.log('notif_playerPaymentGroup');
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                    for(let i = 0; i < amt; i++){
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', this.player_score_zone_id[p_id], destination , 500 , 100*(delay++) );
                        if (p_id == this.player_id || this.show_player_info){
                            this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_trade: function( notif ){
            //console.log('notif_trade');
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', this.player_score_zone_id[p_id], TRADE_BOARD_ID , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', TRADE_BOARD_ID, this.player_score_zone_id[p_id], 500 , 100*(delay++) );
                }   
                if (p_id == this.player_id || this.show_player_info){
                    if (VP_TOKENS.includes(type)){
                        amt = amt * Number(type.charAt(2));
                        this.incResCounter(p_id, 'vp', amt);
                    } else {
                        this.incResCounter(p_id, type, amt);
                    }
                }
            }
            if (p_id == this.player_id)
                this.resetTradeVals();
            this.calculateAndUpdateScore(p_id);
        },

        notif_loanPaid: function( notif ){
            //console.log('notif_loanPaid');
            const p_id = notif.args.player_id;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 0 );
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', -1);
            }
            if (notif.args.type != null ){
                if (notif.args.typeStr == 'gold'){
                    this.slideTemporaryObject( notif.args.type , 'limbo', this.player_score_zone_id[p_id], 'board', 500, 100);
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'gold', -1);
                    }
                } else {
                    for (let i = 0; i < 5; i++){
                        this.slideTemporaryObject( notif.args.type, 'limbo', this.player_score_zone_id[p_id], 'board', 500, 100 +(i*100)); 
                    }
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'silver', -5);
                    }
                }
            }
            if (p_id == this.player_id){
                this.resetTradeVals();
            }
        },

        notif_loanTaken: function( notif ){
            //console.log('notif_loanTaken');
            const p_id = notif.args.player_id;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', this.player_score_zone_id[p_id],  500 , 0 );
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', this.player_score_zone_id[p_id], 500 , 100);
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', this.player_score_zone_id[p_id], 500 , 200);
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', 1);
                this.incResCounter(p_id, 'silver', 2);
            }
        },

        notif_score: function( notif ){
            //console.log('notif_score');
            const p_id = notif.args.player_id;
            this.scoreCtrl[p_id].setValue(0);
            for(let b_key in notif.args.building){
                const building = notif.args.building[b_key];
                var bld_score = 0;
                if (building.static && Number(building.static) >0){
                    bld_score += Number(building.static);
                } 
                if (building.bonus != null && Number(building.bonus) >0){
                    bld_score += Number(building.bonus);
                }
                this.displayScoring( `${TPL_BLD_TILE}_${b_key}`, this.player_color[notif.args.player_id], bld_score, 2000 );
                this.scoreCtrl[p_id].incValue(bld_score);
            } 
            dojo.place(`<div id="score_grid_${p_id}" class="score_grid"></div>`, this.player_score_zone_id[p_id]);
            for(let type in notif.args.resource){
                const amt = notif.args.resource[type];
                this.scoreCtrl[p_id].incValue(amt);
            }
        },

        notif_cancel: function( notif ){
            //console.log('notif_cancel');
            const p_id = notif.args.player_id;
            const updateResource = (p_id == this.player_id) || this.show_player_info;
            const player_zone = this.player_score_zone_id[p_id];
            var delay = 0;
            // update values as undone
            for (let i in notif.args.actions){
                let log = notif.args.actions[i];
                switch (log.action){
                    case 'build':
                        this.cancelBuild(log.building);
                        this.updateScore(p_id, log.score);
                        if (updateResource){
                            for(let type in log.cost){
                                let amt = log.cost[type];
                                for(let j = 0; j < amt; j++){
                                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, 'board' , 500 , 50*(delay++) );
                                    this.incResCounter(p_id,type,1);
                                }   
                            }
                        }
                    break;
                    case 'gainWorker':
                        this.fadeOutAndDestroy(`token_worker_${log.w_key}`);
                    break;
                    case 'gainTrack':
                        this.fadeOutAndDestroy(`token_track_${log.t_key}`);
                    break;
                    case 'loan':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , player_zone, 'board', 500 , 50 * (delay++) );
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        if (updateResource){
                            this.incResCounter(p_id, 'loan', -1);
                            this.incResCounter(p_id, 'silver', -2);
                        }    
                    break;
                    case 'loanPaid':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', player_zone, 500 , 0 );
                        if (updateResource){
                            this.incResCounter(p_id, 'loan', 1);
                        }
                        if (log.type != null){
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo', player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'railAdv':
                        const train_token = this.train_token_divId[p_id];
                        const parent_no = $(train_token).parentNode.id.split("_")[2];
                        this.moveObject(train_token, `train_advancement_${(parent_no-1)}`);
                    break;
                    case 'trade':
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, TRADE_BOARD_ID , 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, 1);
                                }
                                if (log.type == 'vp'){
                                    this.scoreCtrl[p_id].incValue(1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', TRADE_BOARD_ID, player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, -1);
                                }
                                if (log.type == 'vp'){
                                    this.scoreCtrl[p_id].incValue(-1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
                        if (log.amt < 0){
                            for(let j = 0; j < Math.abs(log.amt); j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo' , player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, -1);
                                    if (log.type == 'vp'){
                                        this.scoreCtrl[p_id].incValue(-1);
                                    }
                                }
                            }
                        } else {
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:log.type}), 'limbo', 'board', player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                                if (log.type == 'vp'){
                                    this.scoreCtrl[p_id].incValue(1);
                                }
                            }
                        }
                    break;
                }
            }

            this.cancelNotifications(notif.args.move_ids);
            this.clearTransactionLog();
            this.calculateAndUpdateScore(p_id);
        },

        /**
         * gets the target for moving tokens in notifications based upon 
         * notif.args.origin 
         *  -- currently only accounts for `auction` and `building` otherwise it returns `board`.
         * @param {object} notif 
         */
        getTargetFromNotifArgs: function( notif ){
            var target = `board`;
            if (notif.args.origin == 'auction'){
                target = `${TPL_AUC_ZONE}${Number(notif.args.key)}`;
            } else if (notif.args.origin == 'building'){
                target = `${TPL_BLD_TILE}_${Number(notif.args.key)}`;
            } 
            return target;
        },

        /***** UTILITIES FOR USING ARRAYS *****/
        copyArray: function (array){
            let new_array = [];
            for (let i in array){
                new_array[i] = array[i];
            }
            return new_array;
        },
        /**
         * make all positive values in array negative, and all negative values positive.
         * @param {object} array 
         */
        invertArray: function( array){
            let new_array = [];
            for (let i in array){
                new_array[i] = array[i] * -1;
            }
            return new_array;
        },
        /**
         * allows adding to array by key, without having to have exisiting value.
         * @param {object} arr to edit
         * @param {string} key in array to add to or create (if not existing)
         * @param {int} inc value to increment by, or create at (if not previously existing)
         */
        addOrSetArrayKey: function (arr, key, inc){
            if (arr[key] == null){
                arr[key] = inc;
            } else {
                arr[key] += inc;
            }
            return arr;
        },
   });             
});
