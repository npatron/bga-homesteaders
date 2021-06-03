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

    //user preferences Values
    const USE_ART_USER_PREF = 100;
    const ENABLED_USER_PREF = 0;
    const DISABLED_USER_PREF = 1;

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
    const RESOURCES = {'wood':1, 'steel':2, 'gold':3, 'copper':4, 'food':5, 'cow':6,
        'trade':7, 'track':8, 'worker':9, 'vp':10, 'silver':11, 'loan':12};
    const RESOURCE_ORDER = ['vp','loan','cow','copper','gold','steel','food','wood','silver','trade'];

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
    const TPL_BLD_TILE  = "building_tile";
    const TPL_BLD_STACK = "building_stack_";
    const TPL_BLD_ZONE  = "building_zone_";
    const TPL_BLD_CLASS = "build_tile_";
    const TPL_AUC_TILE  = "auction_tile";
    const TPL_AUC_ZONE  = "auction_tile_zone_";

    const FIRST_PLAYER_ID       = 'first_player_tile';
    const CONFIRM_TRADE_BTN_ID  = 'confirm_trade_btn';
    const UNDO_TRADE_BTN_ID     = 'undo_trades_btn';
    const UNDO_LAST_TRADE_BTN_ID= 'undo_last_trade_btn';
    
    // button ids
    /*** can be trade + transition ***/
    const BTN_ID_DONE        = 'btn_done'; // allocate workers/ endgame 
    const WORKER_DONE_STRING = _('Confirm ${worker} Placement');
    const CONFIRM_WORKER_DONE_STRING= _('Confirm Trades & ${worker} Placement');
    const BTN_ID_CONFIRM     = 'btn_confirm';
    const WORKER_DONE_STRING = _('Confirm ${worker} Placement');
    const CONFIRM_WORKER_DONE_STRING= _('Confirm Trades & ${worker} Placement');
    const BTN_ID_BUILD       = 'btn_choose_building';
    
    const BTN_ID_FOOD_VP     = 'btn_food_vp';
    const BTN_ID_COW_VP      = 'btn_cow_vp';
    const BTN_ID_COPPER_VP   = 'btn_copper_vp';
    const BTN_ID_WOOD_TRACK  = 'btn_wood_track';
    const BTN_ID_BONUS_WORKER= 'btn_bonus_worker'; // free worker bonus 
    
    /*** transition to next ***/
    const BTN_ID_CONFIRM     = 'btn_confirm'; // Confirm bid or Confirm Auction Lot Actions (no trades)
    const BTN_ID_PASS_BID    = 'btn_pass';  // pass bid

    const BTN_ID_DO_NOT_BUILD= 'btn_do_not_build'; // pass build
    const BTN_ID_PASS_BONUS  = 'btn_pass_bonus';   // pass on bonus
    const BTN_ID_CHOOSE_BONUS= 'btn_choose_bonus'; //rail bonus

    /*** transition back ***/
    const BTN_ID_UNDO_PASS= 'btn_undo_pass';
    const BTN_ID_CANCEL = 'btn_cancel_button';
    const BTN_ID_REDO_AUCTION = 'btn_redo_build_phase';
    /*** non-transition actions ***/
    const BTN_ID_HIRE_WORKER = 'btn_hire_worker';
    const BTN_ID_TAKE_LOAN      = 'btn_take_loan';
    const BTN_ID_MORE_GOLD      = 'btn_more_gold';
    const BTN_ID_LESS_GOLD      = 'btn_less_gold';
    const BTN_ID_PAY_DONE       = 'btn_pay_done';
    const PAY_GOLD_TEXT         = 'pay_gold';
    const PAY_GOLD_TOKEN        = 'pay_gold_tkn';
    const PAY_SILVER_TEXT       = 'pay_silver';
    const PAY_SILVER_TOKEN      = 'pay_silver_tkn';
    const BTN_ID_PAY_LOAN_SILVER = 'btn_pay_loan_silver';
    const BTN_ID_PAY_LOAN_GOLD = 'btn_pay_loan_gold';
    const BTN_ID_TRADE       = 'btn_trade';
    const BTN_ID_TRADE_BANK  = 'btn_trade_bank';
    const BTN_ID_GOLD_COW       = 'btn_gold_cow';
    const BTN_ID_GOLD_COPPER    = 'btn_gold_copper';

    // arrays for the map between toggle buttons and show/hide zones 
    const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld'];
    const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard'];
    const TOGGLE_SHOW_STRING= ['Show Upcoming Buildings', 'Show Current Buildings', 'Show Upcoming Auctions', 'Show Building Discard'];
    const TOGGLE_HIDE_STRING= ['Hide Upcoming Buildings', 'Hide Current Buildings', 'Hide Upcoming Auctions', 'Hide Building Discard'];
    const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container'];
    const TILE_ZONE_DIVID   = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone'];
    
    const TRADE_MAP = {'buy_wood':0,  'buy_food':1,  'buy_steel':2, 'buy_gold':3, 'buy_copper':4, 'buy_cow':5,
                       'sell_wood':6, 'sell_food':7, 'sell_steel':8, 'sell_gold':9, 'sell_copper':10, 'sell_cow':11, 
                       'market_food':12, 'market_steel':13, 'bank':14, 'loan':15, 'payloan_silver':16, 'payloan_gold':17};
    
    const MARKET_FOOD_DIVID  = 'trade_market_wood_food';
    const MARKET_STEEL_DIVID = 'trade_market_food_steel';
    const BANK_DIVID         = 'trade_bank_trade_silver';
    const BONUS_OPTIONS = { 7:'train_bonus_1_trade', 8:'train_bonus_2_track', 9:'train_bonus_3_worker',
        1:'train_bonus_4_wood', 5:'train_bonus_4_food', 2:'train_bonus_4_steel', 3:'train_bonus_4_gold',
        4:'train_bonus_4_copper', 6:'train_bonus_4_cow', 10:'train_bonus_5_vp'};

    const TRADE_BOARD_ID = 'trade_board';
    // trade id's (for "show trade")
    const TRADE_ZONE_ID  = 'trades_zone';
    const BUY_ZONE_ID    = 'buy_zone';
    const BUY_TEXT_ID    = 'buy_text';
    const SELL_ZONE_ID   = 'sell_zone';
    const SELL_TEXT_ID   = 'sell_text';
    const SPECIAL_ZONE_ID= 'special_zone';// market + bank
    const MARKET_TEXT_ID = 'market_text';
    const BANK_TEXT_ID   = 'bank_text';

    const TRADE_BOARD_ACTION_SELECTOR = `#${TRADE_BOARD_ID} .trade_option`;
    const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
    'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option',
    'track':'.token_track'};

    // other Auction Locations are the auction number (1-3).
    const AUC_LOC_DISCARD = 0;

    const AUC_BONUS_NONE            = 0;
    const AUC_BONUS_WORKER          = 1;
    const AUC_BONUS_WORKER_RAIL_ADV = 2;
    const AUC_BONUS_WOOD_FOR_TRACK  = 3;
    const AUC_BONUS_COPPER_FOR_VP   = 4;
    const AUC_BONUS_COW_FOR_VP      = 5;
    const AUC_BONUS_6VP_AND_FOOD_VP = 6;
    const AUC_BONUS_FOOD_FOR_VP     = 7;

    const ALREADY_BUILT = 9;
    const UNAFFORDABLE = 10;
    const TRADEABLE    = 11;
    const AFFORDABLE   = 12;
    const COLOR_MAP = {9:'black', 10:'black', 11:'blue', 12:'darkgreen'};
    const AFFORDABILITY_CLASSES = {9:'unaffordable', 10:'unaffordable', 11:'tradeable', 12:'affordable'}
    
    // only one with player action required
    const BUILD_BONUS_WORKER = 3; 

    const BID_VAL_ARR = [3,4,5,6,7,9,12,16,21];//note: starts at 0.
    const ASSET_COLORS = {0:'res', 1:'com', 2:'ind', 3:'spe', 4:'any', 6:'any',
                          10:'a4', 11:'a1',12:'a2',13:'a3', 14:'a4'};
    const VP_TOKENS = ['vp0', 'vp2', 'vp3', 'vp4','vp6','vp8','vp10'];

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['currentPlayer','First', 'Second', 'Third', 'Fourth',];
    
    const TOKEN_HTML = [];
    // global arrays useful if we add other js files.
    /* const GLOBAL = []; */
    // zone control
    const TRACK_TOKEN_ZONE  = [];
    const WORKER_TOKEN_ZONE = [];
    const TRAIN_TOKEN_ID = [];//indexed by p_id
    const BID_TOKEN_ID = [];
    const BID_ZONE_ID  = []; 

    // player_info
    const PLAYER_COLOR            = [];
    const PLAYER_SCORE_ZONE_ID    = [];
    const PLAYER_BUILDING_ZONE_ID = [];
    // PLAYER resources and score counters
    const BOARD_RESOURCE_COUNTERS = [];
    const POSITIVE_RESOURCE_COUNTERS = [];
    const NEGATIVE_RESOURCE_COUNTERS = [];
    const NEW_RESOURCE_COUNTERS = [];
    const GOLD_COUNTER   = new ebg.counter();
    const SILVER_COUNTER = new ebg.counter();
    const ROUND_COUNTER  = new ebg.counter();
    const INCOME_ARRAY = []; // current round income (for updating breadcrumbs/offset).

    const SCORE_RESOURCE_COUNTERS = [];
    const SCORE_LEFT_COUNTER = [];
    const SCORE_RIGHT_COUNTER = [];
    const BUILDING_CONNECT_HANDLER = [];

    const LAST_SELECTED = [];

    // queues for pending trades
    const TRANSACTION_LOG  = [];
    const TRANSACTION_COST = [];

    // storage for buildings
    const MAIN_BUILDING_COUNTS = []; // counts of each building_id in main zone. for use by update Buildings methods.
    const BUILDING_WORKER_IDS  = [];
    const HAS_BUILDING         = [];

    // from backend (material.inc)
    const RESOURCE_INFO = [];
    const BUILDING_INFO = [];
    const ASSET_STRINGS = [];

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){

            // only this.player_id used for trade/loans/etc.
            this.buildingCost = [];
            this.allowTrade = false;
            this.tradeEnabled = false;
            this.showPay = true;
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

            this.show_player_info = false;
            this.goldAsCopper = false;
            this.goldAsCow = false;
            this.undoPay = false;

             // Load production bug report handler
            dojo.subscribe("loadBug", this, function loadBug(n) {
                function fetchNextUrl() {
                var url = n.args.urls.shift();
                console.log("Fetching URL", url);
                dojo.xhrGet({
                    url: url,
                    load: function (success) {
                    console.log("Success for URL", url, success);
                    if (n.args.urls.length > 0) {
                        fetchNextUrl();
                    } else {
                        console.log("Done, reloading page");
                        window.location.reload();
                    }
                    },
                });
                }
                console.log("Notif: load bug", n.args);
                fetchNextUrl();
            });
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
            this.show_player_info = gamedatas.show_player_info;
            this.fillArray(RESOURCE_INFO, gamedatas.resource_info);
            this.fillArray(BUILDING_INFO, gamedatas.building_info);
            this.fillArray(ASSET_STRINGS, gamedatas.translation_strings);
            
            this.setupResourceTokens();
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.player_count++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            this.setupPlayerResources(gamedatas.player_resources, gamedatas.resources);
            if (!this.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                this.setupTradeButtons();
            } else {
                this.spectatorFormatting();
            }
            if (this.player_count == 2){
                PLAYER_COLOR[DUMMY_BID] = this.getAvailableColor();
                PLAYER_COLOR[DUMMY_OPT] = PLAYER_COLOR[0];
            }
            this.omitImages();
            
            // Auctions: 
            this.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);

            dojo.place(FIRST_PLAYER_ID, PLAYER_SCORE_ZONE_ID[gamedatas.first_player]);
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
                ROUND_COUNTER.create('round_number');
                ROUND_COUNTER.setValue(gamedatas.round_number);
            }
            this.showScoreTooltips(gamedatas.players);

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);
            this.updateBuildingAffordability();
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
            PLAYER_SCORE_ZONE_ID[p_id] = player_board_div;
            PLAYER_COLOR[p_id]         = current_player_color;
            if( this.player_id == p_id || this.show_player_info){
                dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
            } else {
                dojo.query(`#player_resources_${current_player_color} .player_resource_group`).addClass('noshow');
            }
            TRACK_TOKEN_ZONE[p_id]        = `token_zone_${current_player_color}`;
            WORKER_TOKEN_ZONE[p_id]       = `worker_zone_${current_player_color}`;
            PLAYER_BUILDING_ZONE_ID[p_id] = TPL_BLD_ZONE + PLAYER_COLOR[p_id];
        },
        
        setupUseSilverCheckbox: function(checked){
            $('checkbox1').checked = (checked == 1);
            dojo.connect($('checkbox1'), 'change', this, 'toggleCheckbox');
        },

        /**
         * should only be called when not spectator, 
         * This will orient the player zones by player order (with this.player_id first)
         * @param {array} order_table 
         */
        orientPlayerZones: function (order_table){
            dojo.place(`player_zone_${PLAYER_COLOR[this.player_id]}`, PLAYER_ORDER[0] , 'replace');
            let next_pId = order_table[this.player_id];
            for (let i = 1; i < this.player_count; i++){
                dojo.place(`player_zone_${PLAYER_COLOR[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
            for(let i = this.player_count; i < PLAYER_ORDER.length; i++){
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
                if (!PLAYER_COLOR.includes(player_color_option[i]))
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
        setupPlayerResources: function (player_resources, resources){
            if (this.show_player_info){
                for (let player_res in resources){
                    this.setupOnePlayerResources(resources[player_res]);
                }
            } else if (!this.isSpectator){
                this.setupOnePlayerResources(player_resources);
            }
        },

        incResCounter(p_id, type, value){
            BOARD_RESOURCE_COUNTERS[p_id][type].incValue(value);
            SCORE_RESOURCE_COUNTERS[p_id][type].incValue(value);
        },

        /**
         * Resource array for this person.
         * @param {array} resource 
         */
        setupOnePlayerResources: function (resource) {
            //console.log('setupOnePlayerResources');
            BOARD_RESOURCE_COUNTERS[resource.p_id] = [];
            SCORE_RESOURCE_COUNTERS[resource.p_id] = [];
            for (const [key, value] of Object.entries(resource)) {
                //console.log(resource, key, value);
                if (key == "p_id" || key == "workers" || key == "track") continue;
                let tooltip_html = this.format_block('jptpl_res_tt', {value:this.replaceTooltipStrings(_(RESOURCE_INFO[key]['tt']))});
                //console.log(RESOURCE_INFO[key]['tt']);
                //console.log(this.replaceTooltipStrings(_(RESOURCE_INFO[key]['tt'])));
                let resourceId = `${key}count_${resource.p_id}`;
                this.addTooltipHtml( resourceId, tooltip_html);
                let iconId = `${key}icon_p${resource.p_id}`;
                this.addTooltipHtml( iconId, tooltip_html );

                SCORE_RESOURCE_COUNTERS[resource.p_id][key] = new ebg.counter();
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].create(resourceId);
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].setValue(value);

                let boardResourceId = `${key}count_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardResourceId, tooltip_html );
                let boardIconId = `${key}icon_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardIconId, tooltip_html );

                BOARD_RESOURCE_COUNTERS[resource.p_id][key] = new ebg.counter();
                BOARD_RESOURCE_COUNTERS[resource.p_id][key].create(boardResourceId);
                BOARD_RESOURCE_COUNTERS[resource.p_id][key].setValue(value);
            }

            let old_score_id = `player_score_${resource.p_id}`;
            dojo.query(`#${old_score_id}`).addClass('noshow');

            let new_score_id = `p_score_${resource.p_id}`;
            dojo.place(`<span id="${new_score_id}" class="player_score_value">0</span>`, old_score_id, 'after');
            SCORE_LEFT_COUNTER[resource.p_id] = new ebg.counter();
            SCORE_LEFT_COUNTER[resource.p_id].create(new_score_id);
            SCORE_LEFT_COUNTER[resource.p_id].setValue(0);

            let scoreLoanId = `player_total_score_${resource.p_id}`;
            dojo.place(`<span id="${scoreLoanId}" class="player_score_value_loan">0</span>`, new_score_id, 'after');
            SCORE_RIGHT_COUNTER[resource.p_id] = new ebg.counter();
            SCORE_RIGHT_COUNTER[resource.p_id].create(scoreLoanId);
            SCORE_RIGHT_COUNTER[resource.p_id].setValue(0);
        },

        /**
         * Setup the Building Tiles, 
         * both in player areas as well as in the offer areas 
         * (main,discard,future)
         * @param {*} buildings 
         * @param {*} info 
         */
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

        /**
         * Setup the existing Tracks tokens (in player building section) built by players 
         * @param {*} tracks 
         */
        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
               //console.log(track, PLAYER_COLOR[track.p_id], TRACK_TOKEN_ZONE[track.p_id]);
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: PLAYER_COLOR[track.p_id]}), TRACK_TOKEN_ZONE[track.p_id], 'last');
            }
            this.addTooltipHtmlToClass("token_track", `<div style="text-align:center;">${this.replaceTooltipStrings(_(RESOURCE_INFO['track']['tt']))}</div>`);
        },

        /**
         * Create Building worker slots 
         * that are used for assigning workers to buildings (when owned by players)
         * @param {*} building - information about the building to add slots to
         * @param {*} b_info - info from material.inc for building_id 
         */
        addBuildingWorkerSlots: function(b_id, b_key){
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if (b_id == BLD_BANK){
                dojo.place(`<div id="${BANK_DIVID}" class="bank trade_option"></div>`, b_divId,'last');
            } else if (b_id == BLD_MARKET){
                dojo.place(`<div id="${b_key}_${MARKET_FOOD_DIVID}" class="market_food trade_option"> </div><div id="${b_key}_${MARKET_STEEL_DIVID}" class="market_steel trade_option"> </div>`, b_divId,'last');
            }
            if (!(BUILDING_INFO[b_id].hasOwnProperty('slot'))) return;
            let b_slot = BUILDING_INFO[b_id].slot;
            if (b_slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: b_key, id: b_id}), b_divId);
            } else if (b_slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: b_key, id: b_id}), b_divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: b_key, id: b_id}), b_divId);
            } else if (b_slot == 3){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: b_key, id: b_id}), b_divId);
            }
        },

        setupBuildingWorkerSlots: function(b_id, b_key){
            if (b_id == BLD_BANK){
                dojo.connect($(BANK_DIVID), 'onclick', this, 'onClickOnBankTrade');
            } else if (b_id == BLD_MARKET){
                dojo.connect($(`${b_key}_${MARKET_FOOD_DIVID}`), 'onclick', this, 'onClickOnMarketTrade');
                dojo.connect($(`${b_key}_${MARKET_STEEL_DIVID}`), 'onclick', this, 'onClickOnMarketTrade');
            }
            let b_info = BUILDING_INFO[b_id];
            if (!(b_info.hasOwnProperty('slot'))) return;
            let b_slot = b_info.slot;
            if (b_slot == 1){
                BUILDING_WORKER_IDS[b_key] = [];
                BUILDING_WORKER_IDS[b_key][1] = `slot_${b_key}_1`;
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][1], this.formatWorkerSlotTooltip(b_info ,1));
                dojo.connect($(BUILDING_WORKER_IDS[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (b_slot == 2){
                BUILDING_WORKER_IDS[b_key] = [];
                BUILDING_WORKER_IDS[b_key][1] = `slot_${b_key}_1`;
                BUILDING_WORKER_IDS[b_key][2] = `slot_${b_key}_2`;
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][1], this.formatWorkerSlotTooltip(b_info, 1));
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][2], this.formatWorkerSlotTooltip(b_info, 2));
                dojo.connect($(BUILDING_WORKER_IDS[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(BUILDING_WORKER_IDS[b_key][2]), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (b_slot == 3){
                BUILDING_WORKER_IDS[b_key] = {1:`slot_${b_key}_3`, 2:`slot_${b_key}_3`, 3:`slot_${b_key}_3`};
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][3], this.formatWorkerSlotTooltip(b_info, 3));
                if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                    dojo.style(BUILDING_WORKER_IDS[b_key][3], 'max-width', `${(this.worker_width*1.5)}px`);
                }
                dojo.connect($(BUILDING_WORKER_IDS[b_key][3]), 'onclick', this, 'onClickOnWorkerSlot');
            }
        },
        
        formatWorkerSlotTooltip(b_info, slot_no){
            var tt = '<span class="worker_slot"></span>';
            if (slot_no == 3) { tt += '<span class="worker_slot"></span>'; }
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
                WORKER_TOKEN_ZONE[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                //console.log(worker.b_key, worker.b_slot, BUILDING_WORKER_IDS);
                if (worker.b_key != 0 ){ 
                    dojo.place(worker_divId, BUILDING_WORKER_IDS[worker.b_key][worker.b_slot]);
                } else {
                    dojo.place(worker_divId, WORKER_TOKEN_ZONE[worker.p_id]);
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
            BID_ZONE_ID[ZONE_PENDING] = 'pending_bids';
            BID_ZONE_ID[ZONE_PASSED] = 'passed_bids';
            
            let auc_end = 3;
            for (let auc = 1; auc <= auc_end; auc++){
                BID_ZONE_ID[auc] = [];
                for (let bid =0; bid < BID_VAL_ARR.length; bid ++){
                    BID_ZONE_ID[auc][bid] = `bid_slot_${auc}_${BID_VAL_ARR[bid]}`;
                    dojo.connect($(BID_ZONE_ID[auc][bid]), 'onclick', this, 'onClickOnBidSlot');
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
                const token_color = PLAYER_COLOR[p_id];
                if( p_id == DUMMY_OPT) {
                    BID_TOKEN_ID[p_id] = `token_bid_${token_color}_dummy`;
                    dojo.place(this.format_block( 'jptpl_dummy_player_token', {color: token_color, type: "bid"}), BID_ZONE_ID[ZONE_PENDING]);
                } else {
                    BID_TOKEN_ID[p_id] = `token_bid_${token_color}`;
                    dojo.place(this.format_block( 'jptpl_player_token', {color: token_color, type: "bid"}), BID_ZONE_ID[ZONE_PENDING]);
                }
                //pending is default.
                if (token_bid_loc == BID_PASS) {
                    dojo.place(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PASSED]);
                } else if (token_bid_loc != NO_BID){ 
                    dojo.place(BID_TOKEN_ID[p_id], this.getBidLocDivIdFromBidNo(token_bid_loc));
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
                TRAIN_TOKEN_ID[p_id] = `token_train_${PLAYER_COLOR[p_id]}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: PLAYER_COLOR[p_id].toString(), type: "train"}), `train_advancement_${player_rail_adv}`);
            }
        },

        showScoreTooltips: function(players) {
            for(let p_id in players){
                this.calculateAndUpdateScore(p_id);
            }
        },

        /**
         * connects click actions to buttons for selecting Trade actions, 
         * should only be called if not spectator.
         * 
         * it also will assign click action to the button for approve trade/undo transactions.
         */
        setupTradeButtons: function(){
            /* removing these, adding them to actions bar.
            dojo.connect($(UNDO_TRADE_BTN_ID), 'onclick', this, 'undoTransactionsButton');
            dojo.connect($(UNDO_LAST_TRADE_BTN_ID), 'onclick', this, 'undoLastTransaction');
            */
            const options = dojo.query(`#${TRADE_BOARD_ID} .trade_option`);
            for(let i in options){
                if (options[i].id){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
            }   }
            // create new and offset counters
            for (const [key, value] of Object.entries(RESOURCE_INFO)) {
                if ( key == "workers" || key == "track") continue;
                POSITIVE_RESOURCE_COUNTERS[key] = new ebg.counter();
                POSITIVE_RESOURCE_COUNTERS[key].create(`${key}_pos`);
                POSITIVE_RESOURCE_COUNTERS[key].setValue(0);
                NEGATIVE_RESOURCE_COUNTERS[key] = new ebg.counter();
                NEGATIVE_RESOURCE_COUNTERS[key].create(`${key}_neg`);
                NEGATIVE_RESOURCE_COUNTERS[key].setValue(0);
                NEW_RESOURCE_COUNTERS[key] = new ebg.counter();
                NEW_RESOURCE_COUNTERS[key].create(`${key}_new`);
                NEW_RESOURCE_COUNTERS[key].setValue(0);
            }
            this.resetTradeValues();
        },

        /**
         * Connects click actions to the bonus actions for get Rail advancement action.
         * 
         * @param {*} resource_info 
         */
        setupRailAdvanceButtons: function(resource_info){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id){
                    dojo.connect($(bonus_options[i].id),'onclick', this, 'onSelectBonusOption');
                    let type = bonus_options[i].id.split('_')[3];
                    if (type in resource_info)
                        this.addTooltipHtml(_(resource_info[type].tt));
                } 
            }
        },

        setupResourceTokens(){
            for(let type in RESOURCES){
                TOKEN_HTML[type] = this.format_block( 'jstpl_resource_inline', {type:type}, );
                TOKEN_HTML["big_"+type] = this.format_block( 'jstpl_resource_inline', {type:"big_"+type}, );
            }
            TOKEN_HTML.arrow = this.format_block( 'jstpl_resource_inline', {type:'arrow'}, );
            TOKEN_HTML.inc_arrow = this.format_block( 'jstpl_resource_inline', {type:'inc_arrow'}, );
            for (let i in VP_TOKENS){
                TOKEN_HTML[VP_TOKENS[i]] = this.format_block( 'jstpl_resource_inline', {type:VP_TOKENS[i]}, );
                TOKEN_HTML["bld_"+VP_TOKENS[i]] = this.format_block('jstpl_resource_log', {"type" : VP_TOKENS[i] + " bld_vp"});
            }
            TOKEN_HTML.bld_vp = this.format_block('jstpl_resource_log', {"type" : "vp bld_vp"});
            TOKEN_HTML.track = this.getOneResourceHtml('track', 1, true);
            TOKEN_HTML.loan = this.format_block( 'jptpl_track_log', {type:'loan'}, );
            TOKEN_HTML.end = this.format_block('jstpl_color_log', {'string':_(_("End")), 'color':ASSET_COLORS[6]}); 
            
            let types = {'and':_("AND"), 'or':_("OR"), 'dot':"•"};
            for(let i in types){
                TOKEN_HTML[i] = this.format_block('jptpl_tt_break', {text:types[i], type:'dot'==i?'dot':'break'});
            }
            types = [0,1,2,3,4,11,12,13,14]; // from ASSET_COLORS
            for (let i=0; i< 5; i++){
                TOKEN_HTML[ASSET_COLORS[i]] = this.format_block('jstpl_color_log', 
                {'string':_(ASSET_STRINGS[i]), 'color':ASSET_COLORS[i]});
            }
            types = {10:'4', 11:'1', 12:'2', 13:'3'};
            for (let i in types){
                TOKEN_HTML['a'+types[i]] = this.format_block('jstpl_color_log', 
                {'string':dojo.string.substitute(_("Auction ${a}"),{a:types[i]}), 'color': 'auc'+types[i]} );
            }
            TOKEN_HTML.adv_track = _(ASSET_STRINGS[7]);
            //console.log(TOKEN_HTML);
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
            let tile_count = dojo.query(`#${TILE_ZONE_DIVID[index]} .${tileId}`).length;
            if (tile_count == 0){
                dojo.addClass(TOGGLE_BTN_ID[index], 'noshow');
                dojo.query(`#${TILE_CONTAINER_ID[index]}`).addClass('noshow');
            } else {
                dojo.removeClass(TOGGLE_BTN_ID[index], 'noshow');

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
                    this.showPay = true;
                break;

                case 'dummyPlayerBid':
                    const dummy_bid_id = BID_TOKEN_ID[DUMMY_BID];
                    dojo.addClass(dummy_bid_id, 'animated');
                break;
                case 'playerBid':
                    const active_bid_id = BID_TOKEN_ID[this.getActivePlayerId()];
                    dojo.addClass(active_bid_id, 'animated');
                    dojo.style(TRADE_BOARD_ID, 'order', 4);
                    break;
                case 'getRailBonus':
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
                    dojo.addClass(active_train, 'animated');
                    break;
                case 'payAuction':
                case 'chooseBuildingToBuild':
                case 'auctionBonus':
                case 'bonusChoice':
                    if (!this.isSpectator){
                        dojo.style(TRADE_BOARD_ID, 'order', 2);
                    }
                case 'endRound':
                    break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            //console.log('onLeavingState', stateName);
            switch( stateName )
            {
                case 'setupRound':
                case 'collectIncome':
                    break;
                case 'dummyPlayerBid':
                    const dummy_bid_id = BID_TOKEN_ID[DUMMY_BID];
                    dojo.removeClass(dummy_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                break;
                case 'playerBid':
                    const active_bid_id = BID_TOKEN_ID[this.getActivePlayerId()];
                    dojo.removeClass(active_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                    this.showPay = false;
                    break;
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                    this.buildingCost = [];
                    this.resetTradeValues();    
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.destroyBuildingBreadcrumb();
                    this.orderZone(BLD_LOC_OFFER, 8);

                    this.clearSelectable('building', true);
                    this.destroyBuildingBreadcrumb();
                    this.fixBuildingOrder();
                    break;
                case 'allocateWorkers':
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.can_cancel = false;
                    this.destroyIncomeBreadcrumb();
                    INCOME_ARRAY.length=0;
                    this.disableTradeIfPossible();
                    if (dojo.query(`#${BTN_ID_UNDO_PASS}`).length ==1){
                        this.fadeOutAndDestroy(BTN_ID_UNDO_PASS);
                    }
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
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
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
            if( this.isCurrentPlayerActive() )
            {               
                // Call appropriate method
                var methodName = "onUpdateActionButtons_" + stateName;
                if (this[methodName] !== undefined) {    
                    console.log('Calling ' + methodName, args);
                    this[methodName](args);
                }
            } else if (!this.isSpectator) {
                switch( stateName ) {
                    case 'allocateWorkers':
                        var methodName = "onUpdateActionButtons_" + stateName + "_notActive";
                        console.log('Calling ' + methodName, args);
                        this[methodName](args);
                    break;
                }
            } 
        }, 

        ///////////////////////////////////////////////////
        //// onUpdateActionButtons

        onUpdateActionButtons_allocateWorkers: function(){
            LAST_SELECTED['worker'] ="";
            // show workers that are selectable
            dojo.query( `#player_zone_${PLAYER_COLOR[this.player_id]} .token_worker` ).addClass('selectable');
            // also make building_slots selectable.
            dojo.query( `#${TPL_BLD_ZONE}${PLAYER_COLOR[this.player_id]} .worker_slot` ).addClass( 'selectable' );

            this.addActionButton( BTN_ID_CONFIRM,_('Confirm'), 'donePlacingWorkers' );
            this.addActionButton( BTN_ID_CANCEL, _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            this.tradeEnabled = false;
            this.addActionButton( BTN_ID_HIRE_WORKER, _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addTradeActionButton();
            this.setOffsetForIncome();
            this.destroyPaymentBreadcrumb();
            dojo.query(`#${BTN_ID_UNDO_PASS}`).forEach(dojo.destroy); // removes undo button if displayed.
        },
        // -non-active-
        onUpdateActionButtons_allocateWorkers_notActive(args){
            if ((args.paid[this.player_id].has_paid==0 || this.undoPay) && this.showPay){
                this.allowTrade = true;
                this.silverCost = this.getPlayerWorkerCount(this.player_id);
                this.goldAmount = 0;
                this.addPaymentButtons();
                this.addTradeActionButton();
                this.setOffsetForPaymentButtons();
            } 
            if (dojo.query(`#${BTN_ID_UNDO_PASS}`).length !=1){
                this.addActionButton(BTN_ID_UNDO_PASS, _('undo'), 'onUnPass', null, false, 'red');
                dojo.place(BTN_ID_UNDO_PASS, 'generalactions', 'first');
            }
        },

        onUpdateActionButtons_payWorkers: function(){
            this.silverCost = this.getPlayerWorkerCount(this.player_id);
            this.goldAmount = 0;
            this.addPaymentButtons();
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },
        //2-player dummy bid phase
        onUpdateActionButtons_dummyPlayerBid: function(args){
            LAST_SELECTED['bid'] = '';
            for (let bid_key in args.valid_bids) {
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( BTN_ID_CONFIRM, _('Confirm Dummy Bid'), 'confirmDummyBidButton' );
        },
        onUpdateActionButtons_playerBid: function(args){
            LAST_SELECTED['bid'] = '';
            for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( BTN_ID_CONFIRM, _('Confirm Bid'), 'confirmBidButton' );
            this.addActionButton( BTN_ID_PASS_BID,_('Pass'),    'passBidButton', null, false, 'red' );
        },
        onUpdateActionButtons_getRailBonus: function(args){
            if (args.can_undo){
                this.addActionButton( BTN_ID_UNDO_PASS, _('Undo'), 'onUndoBidPass', null, false, 'red');
            }
            LAST_SELECTED.bonus  ="";
            for(let i in args.rail_options){
                let type = this.getKeyByValue(RESOURCES, args.rail_options[i]);
                const id = BONUS_OPTIONS[args.rail_options[i]];
                dojo.addClass(id, 'selectable');
                if (type == 'vp'){
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML.vp3, 'selectBonusButton', null, false, 'gray');
                } else {
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML[type], 'selectBonusButton', null, false, 'gray');
                }
            }
            this.addActionButton( BTN_ID_CHOOSE_BONUS, _('Choose Bonus'), 'doneSelectingBonus');
            dojo.addClass( BTN_ID_CHOOSE_BONUS, 'disabled');
        },
        onUpdateActionButtons_payAuction: function(args){
            this.showPay = true;
            this.silverCost = Number(args.auction_cost);
            this.goldAmount = 0;
            this.addPaymentButtons();
            dojo.place(dojo.create('br'),'generalactions','last');
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },
        onUpdateActionButtons_chooseBuildingToBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            this.genericSetupBuildBuildings();
        },
        onUpdateActionButtons_trainStationBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            this.genericSetupBuildBuildings();
        },
        // currently only bonus involving a choice is hire worker.
        onUpdateActionButtons_resolveBuilding: function (args) {
            if (args.building_bonus == BUILD_BONUS_WORKER){
                this.addActionButton( BTN_ID_BONUS_WORKER, dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}), 'workerForFreeBuilding');
                this.addActionButton( BTN_ID_PASS_BONUS,   _('Do Not Get Bonus'), 'passBuildingBonus', null, false, 'red');
                this.addActionButton( BTN_ID_REDO_AUCTION, _('Cancel'),  'cancelTurn', null, false, 'red');
                this.can_cancel = true;
            } 
        },
        onUpdateActionButtons_bonusChoice: function (args) {
            const option = Number(args.auction_bonus);
            switch (option){
                case AUC_BONUS_WORKER:
                case AUC_BONUS_WORKER_RAIL_ADV:
                    this.addActionButton( BTN_ID_BONUS_WORKER, dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}) , 'workerForFree');
                break;
                case AUC_BONUS_WOOD_FOR_TRACK:
                    this.addActionButton( BTN_ID_WOOD_TRACK, `${TOKEN_HTML.wood} ${TOKEN_HTML.arrow} ${TOKEN_HTML.track}`, 'woodForTrack');
                break;
                case AUC_BONUS_COPPER_FOR_VP:
                    this.addActionButton( BTN_ID_COPPER_VP, `${TOKEN_HTML.copper} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'copperFor4VP');
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( BTN_ID_GOLD_COPPER, `${TOKEN_HTML.gold} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_COW_FOR_VP:
                    this.addActionButton( BTN_ID_COW_VP, `${TOKEN_HTML.cow} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'cowFor4VP');
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( BTN_ID_GOLD_COW, `${TOKEN_HTML.gold} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_6VP_AND_FOOD_VP:
                case AUC_BONUS_FOOD_FOR_VP:
                    this.addActionButton( BTN_ID_FOOD_VP, `${TOKEN_HTML.food} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp2}`, 'foodFor2VP');
                    break;
                case AUC_BONUS_4DEPT_FREE:
                    break;
                case AUC_BONUS_3VP_SELL_FREE:
                    // sell for free (no trade)
                    break;
                case AUC_BONUS_TRACK_RAIL_ADV: // should not come here
                    break;
                
            }
            this.addActionButton( BTN_ID_PASS_BONUS,   _('Do Not Get Bonus'), 'passBonus', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _('Cancel'),           'cancelTurn', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            this.addTradeActionButton();
        },
        onUpdateActionButtons_confirmActions: function () {
            this.updateBuildingAffordability();
            this.addActionButton( BTN_ID_CONFIRM,         _('Confirm'),  'confirmBuildPhase');
            this.addActionButton( BTN_ID_REDO_AUCTION, _('Cancel'),   'cancelTurn', null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_endGameActions: function () {
            this.addActionButton( BTN_ID_DONE,          _('Done'),                    'doneEndgameActions');    
            this.addActionButton( BTN_ID_CANCEL, _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            this.addActionButton( BTN_ID_PAY_LOAN_SILVER, dojo.string.substitute(_('Pay Loan ${type}'), {type:TOKEN_HTML.silver}), 'payLoanSilver', null, false, 'gray');
            this.addActionButton( BTN_ID_PAY_LOAN_GOLD,   dojo.string.substitute(_('Pay Loan ${type}'), {type:TOKEN_HTML.gold}),'payLoanGold',   null, false, 'gray');
            this.addActionButton( BTN_ID_HIRE_WORKER, _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addTradeActionButton();
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
                dojo.query(`#${TILE_CONTAINER_ID[BLD_LOC_OFFER]}`).addClass('noshow');
            } else {
                ROUND_COUNTER.setValue(round_number);
                this.showCurrentAuctions(auction_tiles, round_number);
            }
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
                if (auction.location !=AUC_LOC_DISCARD) {
                    this.createAuctionTile(a_id, auction.location, info);
                }
            }
        },

        createAuctionTile: function (a_id, location, info){
            let color = ASSET_COLORS[10+Number(location)];
            if (this.prefs[100].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), `future_auction_${location}`);
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, this.formatTooltipAuction(info, a_id));
            } else {
                let text_auction_html = this.formatTooltipAuction(info, a_id);
                dojo.place(this.format_block('jptpl_auction_text', {auc: a_id, color:color, 'card':text_auction_html}), `future_auction_${location}`);
            }
            dojo.style(`${TPL_AUC_TILE}_${a_id}`, 'order', a_id);
        },

        /**
         * setup auction cards for the current round in the Auction board.
         * The intent is that this will be called when a new round is started,
         * as well as on initial setup once the auction_zones have been configured.
         * 
         * @param {Array} auctions 
         * @param {Number} current_round 
         */
        showCurrentAuctions: function (auctions, round_number= null){
            if (round_number){// not null.
                if (round_number == 11 || auctions.length == 0){
                    this.current_auction = 1;
                    return;
                }
            }
            let first_avail_auction = 3;
            for (let i in auctions){
                const auction = auctions[i];
                this.moveObject(`${TPL_AUC_TILE}_${auction.a_id}`, `${TPL_AUC_ZONE}${auction.location}`)
                if (first_avail_auction > auction.location){
                    first_avail_auction = auction.location;
                }
            }
            this.current_auction = first_avail_auction;
        },

        /**
         * The plan is for this to be called after each auction tile is resolved (building & bonuses)
         * it should remove the auction tile at auction_no, so that it is clear what state we are at. 
         */
        clearAuction: function(){
            const auc_id = dojo.query(`#${TPL_AUC_ZONE}${this.current_auction} .auction_tile`)[0].id;
            if (auc_id){
                dojo.destroy(auc_id);
            }

            const bid_token = dojo.query(`[id^="bid_slot_${this.current_auction}"] [id^="token_bid"]`);
            for(let i in bid_token){
                if (bid_token[i].id){
                    const bid_color = bid_token[i].id.split('_')[2];                        
                    for(let p_id in PLAYER_COLOR){
                        if (p_id == DUMMY_OPT) continue;
                        if (PLAYER_COLOR[p_id] == bid_color){
                            this.moveBid(p_id, BID_PASS);
                        }
                    }
                }
            }
            if (this.current_auction < this.number_auctions){ this.current_auction++;}
            else { this.current_auction = 1; }
        },

        /***** building utils *****/
        addBuildingToPlayer: function(building){
            const b_id = building.b_id;
            const b_key = building.b_key;
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if ($(PLAYER_BUILDING_ZONE_ID[building.p_id]).parentElement.id.startsWith(TPL_BLD_ZONE) ){
                return;
            }
            if ($(b_divId)){ // if element already exists, just move it.
                const wasInMain = (dojo.query( `#${TILE_ZONE_DIVID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
                if (wasInMain){
                    this.moveObject(`${b_divId}`, PLAYER_BUILDING_ZONE_ID[building.p_id]);
                    dojo.disconnect(BUILDING_CONNECT_HANDLER[b_key]);
                    if ((MAIN_BUILDING_COUNTS[building.b_id]--) == 1){
                        this.removeBuildingZone(b_id);
                    }
                } else {
                    this.moveObject(`${b_divId}`, PLAYER_BUILDING_ZONE_ID[building.p_id]);
                }
            } else { // create it as well;
                this.createBuildingTile(b_id, b_key, PLAYER_BUILDING_ZONE_ID[building.p_id]);
            }
            // remove any afford-ability flags
            this.updateAffordability(`#${b_divId}`, 0);
            dojo.query(`#${b_divId}`).style(`order`,`${building.b_order}`);
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                this.addTooltipHtml(b_divId, this.formatTooltipBuilding(b_id, b_key));
            } else {
                this.removeTooltip( b_divId );
            }
            this.updateHasBuilding(building.p_id, b_id); 
        },

        genericSetupBuildBuildings: function( ){
            this.updateBuildingAffordability();
            this.showTileZone(BLD_LOC_OFFER);
            this.orderZone(BLD_LOC_OFFER, 0);
            LAST_SELECTED['building']="";
            this.createBuildingBreadcrumb();
            this.makeBuildingsSelectable(this.allowed_buildings);
            this.addActionButton( BTN_ID_BUILD, dojo.string.substitute(_('Build ${building_name}'), {building_name:'<span id="bld_name"></span>'}), 'chooseBuilding');
            this.addActionButton( BTN_ID_DO_NOT_BUILD, _('Do Not Build'), 'doNotBuild', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _('Cancel'),   'cancelTurn', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            this.can_cancel = true;
            this.addTradeActionButton();
            dojo.addClass(BTN_ID_BUILD ,'disabled');
            replacers = dojo.create('div', {id:'replacers', style:'display:inline-block;'});
            dojo.place(replacers, 'generalactions', 'last');
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                if (this.goldAsCow){
                    this.addActionButton( BTN_ID_GOLD_COW, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'blue');
                } else {
                    this.addActionButton( BTN_ID_GOLD_COW, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'red');
                }
                if (this.goldAsCopper){
                    this.addActionButton( BTN_ID_GOLD_COPPER, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'blue');
                } else {
                    this.addActionButton( BTN_ID_GOLD_COPPER, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'red');
                }
                dojo.place(BTN_ID_GOLD_COW, 'replacers', 'last');
                dojo.style(BTN_ID_GOLD_COW, 'display', 'none');
                dojo.place(BTN_ID_GOLD_COPPER, 'replacers', 'last');
                dojo.style(BTN_ID_GOLD_COPPER, 'display', 'none');
            }
        },

        addBuildingToOffer: function(building){
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            const b_loc = TILE_ZONE_DIVID[building.location];
            if (document.querySelector(`#${b_loc} #${b_divId}`)){ 
                return; //if already correct, do nothing.
            }
            this.createBuildingZoneIfMissing(building);
            const zone_id = `${TPL_BLD_STACK}${building.b_id}`;
            if (document.querySelector(`#${b_loc} #${zone_id}`) == null){
                dojo.place(zone_id, b_loc);
            }
            if ($(b_divId) == null){ //if missing make the building 
                this.createBuildingTile(building.b_id, building.b_key, zone_id);
                BUILDING_CONNECT_HANDLER[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                MAIN_BUILDING_COUNTS[building.b_id]++;
            }
        },

        formatTooltipBuilding:function (b_id, b_key, msg_id = null){
            let b_info = BUILDING_INFO[b_id];
            var vp = 'vp'+ ( b_info.vp == null?'0':(Number(b_info.vp)==1)?'':Number(b_info.vp));

            var msg = (msg_id == null? "": 
                `<div class="tt_flex"><span class="tt tt_top" style="color:${COLOR_MAP[msg_id]};">${_(ASSET_STRINGS[msg_id])}</span></div><hr>`);
            return this.format_block('jptpl_bld_tt', {
                msg: msg,
                type:  ASSET_COLORS[b_info.type],
                name: _(b_info.name),
                vp:   vp,
                COST: _('cost:'),
                cost_vals: this.getResourceArrayHtml(b_info.cost, true),
                desc: this.formatBuildingDescription(b_id, b_key),
                INCOME: _('income: '),
                inc_vals: this.formatBuildingIncome(b_id, b_key),
                hr: TOKEN_HTML.dot,
            });
        },

        formatTooltipAuction: function (a_info, a_id){
            var tt = '<div style="text-align: center;" class="font">';
            var auction_no = Math.ceil(a_id/10); // (1-10) = 1; (11-20) = 2; etc...
            if (auction_no== 1) {// order fixed in A-1
                let round_string = dojo.string.substitute(_('Round ${a_id}'),{a_id:a_id});
                var title = `<span class="font caps bold a1">${round_string} </span><hr>`;
            } else { //order by phase in other auctions
                if ((a_id-1)%10 <4){
                    var phase = _("Settlement");
                } else if ((a_id-1)%10 >7){
                    var phase = _("City");
                } else {
                    var phase = _("Town");
                }
                var title = `<span class="font caps bold a${auction_no}">${phase}</span><hr>`;
            }
            tt += title ;
            if (a_info[a_id].build){// there is a build
                var build = "";
                let build_arr = a_info[a_id].build;
                if (build_arr.length == 4){//any
                    build += this.replaceTooltipStrings(_(" Build: ${any} type"));
                } else {
                    let build_html = [];
                    for(let i in build_arr){
                        let b_type = build_arr[i];
                        build_html[i]= dojo.string.substitute(_(" Build: ${building_type}"), {building_type:TOKEN_HTML[ASSET_COLORS[b_type]]} );
                    }
                    build += build_html.join(TOKEN_HTML.or);
                }
                tt += build;
            }

            if (a_info[a_id].bonus) {// there is a bonus;
                var bonus_html = "";
                if (a_info[a_id].build){
                    bonus_html = TOKEN_HTML.and;
                }
                switch (a_info[a_id].bonus){
                    case AUC_BONUS_WORKER:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free)"));
                    break;
                    case AUC_BONUS_WORKER_RAIL_ADV:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free) ${and} Advance the Railroad track"));
                    break;
                    case AUC_BONUS_WOOD_FOR_TRACK:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${wood} for ${track}(once)"));
                    break;
                    case AUC_BONUS_COPPER_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${copper} for ${vp4}(once)"));
                    break;
                    case AUC_BONUS_COW_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${cow} for ${vp4}(once)"));
                    break;
                    case AUC_BONUS_6VP_AND_FOOD_VP:
                        bonus_html += this.replaceTooltipStrings(_("Gain ${vp6} ${and} May trade ${food} for ${vp2}(once)"))
                    break;
                    case AUC_BONUS_FOOD_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${food} for ${vp2}(once)"));
                    break;
                }
                tt += bonus_html;
            }

            return tt + '</div>';
        },

        /**
         * This method will update inputString then return the updated version.
         * 
         * Any patterns of `${val}` will be replaced with a html token of type `val`
         * 
         * @param {String} inputString 
         * @returns {String} updatedString
         */
        replaceTooltipStrings(inputString){
            // required to allow js functions to access file wide globals (in this case `TOKEN_HTML`).
            let _this = TOKEN_HTML;
            try{ // this will detect ${var} and replace it with TOKEN_HTML[var];
                var updatedString = inputString.replaceAll(/\${(.*?)}/g, 
                function(f){ return _this[f.substr(2, f.length -3)];});
                return updatedString;
            } catch (error){
                console.error(error);
                console.log('unable to format tooltip string '+inputString);
                return inputString;
            }
        },

        formatBuildingDescription: function(b_id, b_key){
            let b_info = BUILDING_INFO[b_id];
            var full_desc = '';
            
            if (b_info.desc){
                full_desc += this.replaceTooltipStrings(_(b_info.desc));
            } 

            if (b_info.on_b){
                switch(b_info.on_b){
                    case 1: //BUILD_BONUS_PAY_LOAN
                        var on_build_desc = this.replaceTooltipStrings(_("When built: Pay off ${loan}"));
                        break;
                    case 2: //BUILD_BONUS_TRADE
                        var on_build_desc = dojo.string.substitute(_("When built: Gain ${token}"),
                                    {token:TOKEN_HTML.trade});
                        break;
                    case 3: //BUILD_BONUS_WORKER
                        var on_build_desc = dojo.string.substitute(_("When built: Gain ${token}"),
                                    {token:TOKEN_HTML.worker});
                        break;
                    case 4: //BUILD_BONUS_RAIL_ADVANCE
                        var on_build_desc = _('When built: Advance the Railroad track');
                        break;
                    case 5: //BUILD_BONUS_TRACK_AND_BUILD
                        var on_build_desc = this.replaceTooltipStrings(_('When built: Recieve ${track}<br>You may also build another building of ${any} type'));
                        break;
                    case 6: //BUILD_BONUS_TRADE_TRADE
                        var on_build_desc = this.replaceTooltipStrings(_("When built: ${trade}${trade}"));
                        break;
                    case 7: //BUILD_BONUS_SILVER_WORKERS
                        var on_build_desc = this.replaceTooltipStrings(_('When built: Recieve ${silver} per ${worker}<br>When you gain a ${worker} gain a ${silver}'));
                        break;
                    case 8: //BUILD_BONUS_PLACE_RESOURCES
                        var on_build_desc = this.replaceTooltipStrings(_('When built: place ${wood}${food}${steel}${gold}${copper}${cow} on Warehouse'));
                        break;
                    default:
                        var on_build_desc = "";
                }
                full_desc = on_build_desc +'<br>'+ full_desc;
            }
            if ('vp_b' in b_info){
                const END = _("${end}: ${vp} per ${type}");
                switch(b_info.vp_b){
                    case 0: //VP_B_RESIDENTIAL
                    case 1: //VP_B_COMMERCIAL
                    case 2: //VP_B_INDUSTRIAL
                    case 3: //VP_B_SPECIAL
                    case 6: //VP_B_BUILDING
                        var vp_b = dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:this.format_block('jstpl_color_log', {string: ASSET_STRINGS[b_info.vp_b], color:ASSET_COLORS[b_info.vp_b]} )} );
                        break;
                    case 4: //VP_B_WORKER
                        var vp_b = dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:TOKEN_HTML.worker} );
                        break;
                    case 5: //VP_B_TRACK
                        var vp_b = dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:this.getOneResourceHtml('track', 1, true)} );
                        break;
                    case 7: //VP_B_WRK_TRK
                        var vp_b = dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:TOKEN_HTML.worker} ) + '<br>' 
                                 + dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:this.getOneResourceHtml('track', 1, true)} );
                        break;
                    case 8: //VP_B_PAID_LOAN (expansion)
                    var vp_b = dojo.string.substitute(_("${end}: ${vp} per ${loan} paid off (during endgame actions, loans paid during game are ignored)"), {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, loan:TOKEN_HTML.loan} );
                        break;
                }
                full_desc += vp_b +'<br>';
            }
            if (b_info.trade){
                switch(b_info.trade){
                    case 1: //MARKET
                        full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade}${wood} ${arrow}${food}${mid}${trade}${food} ${arrow} ${steel}${end}", 
                        {start: `<div id="${b_key}_${MARKET_FOOD_DIVID}" class="market_food trade_option">`,
                         mid:   `</div><div id="${b_key}_${MARKET_STEEL_DIVID}" class="market_steel trade_option">`,
                         end:   "</div>",
                         trade: TOKEN_HTML.trade, 
                         wood:  TOKEN_HTML.wood, 
                         arrow: TOKEN_HTML.arrow, 
                         food:  TOKEN_HTML.food,
                         steel: TOKEN_HTML.steel,});
                    break;
                    case 2: //BANK
                        full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade} ${arrow} ${silver}${end}", 
                        {start:  `<div id="${BANK_DIVID}" class="trade_option">`,
                         end:    "</div>",
                         trade:  TOKEN_HTML.trade,
                         arrow:  TOKEN_HTML.arrow, 
                         silver: TOKEN_HTML.silver,});
                    break;
                }
            }
            return full_desc;
        },

        formatBuildingIncome: function(b_id, b_key){
            let b_info = BUILDING_INFO[b_id];
            var income_values = '';
            if (b_info.inc == null && b_info.slot == null){
                income_values = this.format_block('jstpl_color_log', {string:_("none"), color:''});
            }
            if (b_info.inc){
                if (b_info.inc.silver =='x'){
                    income_values = this.replaceTooltipStrings(_('${silver} per ${worker} (max 5)'));
                } else if (b_info.inc.loan == '-1') {
                    income_values = dojo.string.substitute(_('Pay off ${loan}'), {loan:TOKEN_HTML.loan}) + '<br>';
                } else {
                    income_values = this.getResourceArrayHtmlBigVp(b_info.inc, true);
                }
            }
            if (b_info.slot){
                if (b_info.slot ==1){
                    income_values += dojo.string.substitute("${start}${worker} ${inc_arrow} ${income}${end}", 
                    {   start:'<div class="w_slot">',
                        end:  '</div>',
                        worker:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}),
                        inc_arrow:TOKEN_HTML.inc_arrow, 
                        income:this.getResourceArrayHtmlBigVp(b_info.s1, true)
                    });
                }
                if (b_info.slot ==2){
                    income_values += dojo.string.substitute("${start}${worker1} ${inc_arrow} ${income1}${mid}${worker2} ${inc_arrow} ${income2}${end}", 
                    {   start:'<div class="w_slot">',
                        mid:  '</div><div class="w_slot">',
                        end:  '</div>',
                        worker1:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}), 
                        worker2:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:2}),
                        inc_arrow:TOKEN_HTML.inc_arrow, 
                        income1:this.getResourceArrayHtmlBigVp(b_info.s1, true),
                        income2:this.getResourceArrayHtmlBigVp(b_info.s2, true),
                    });
                }
                if (b_info.slot ==3){
                    income_values += dojo.string.substitute("${start}${worker1}${worker2}${mid} ${inc_arrow} ${income}${end}", 
                    {   start:`<div class="w_slot"><span id="slot_${b_key}_3" class="worker_slot">`,
                        mid:  '</span>',
                        end:  '</div>',
                        worker1:this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:1}),
                        worker2:this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:2}),
                        inc_arrow:TOKEN_HTML.inc_arrow, 
                        income:this.getResourceArrayHtmlBigVp(b_info.s3, true)
                    });
                }
            }
            return income_values;
        },

        createBuildingTile(b_id, b_key, destination){
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), destination);
                this.addTooltipHtml( `${TPL_BLD_TILE}_${b_key}`, this.formatTooltipBuilding(b_id, b_key));
                this.addBuildingWorkerSlots(b_id, b_key);
                this.setupBuildingWorkerSlots(b_id, b_key);
            } else { // use text instead of art.
                let text_building_html = this.formatTooltipBuilding(b_id, b_key);
                dojo.place(this.format_block('jptpl_bld_text', {key: b_key, id: b_id, 'card':text_building_html}), destination);
                this.setupBuildingWorkerSlots(b_id, b_key);
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (MAIN_BUILDING_COUNTS[b_id] == 0 || MAIN_BUILDING_COUNTS[b_id] == null){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), TILE_ZONE_DIVID[building.location]);
                MAIN_BUILDING_COUNTS[b_id] = 0;
            }
        },

        removeBuildingZone(b_id){
            this.fadeOutAndDestroy( `${TPL_BLD_STACK}${b_id}`);
        },

        cancelBuild: function(building){
            //console.log('cancelBuild', building.p_id);
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            dojo.removeAttr( $(b_divId), 'style');
            building.location=BLD_LOC_OFFER;
            this.createBuildingZoneIfMissing(building);
            this.moveObject(b_divId, `${TPL_BLD_STACK}${building.b_id}`);
            MAIN_BUILDING_COUNTS[building.b_id]++;
            //remove from hasBuilding
            delete HAS_BUILDING[building.p_id][building.b_id];
            BUILDING_CONNECT_HANDLER[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
        },
        
        updateHasBuilding(p_id, b_id) {
            if (HAS_BUILDING[p_id] == null){
                HAS_BUILDING[p_id] = [];
            }
            if (HAS_BUILDING[p_id][b_id] == null){
                HAS_BUILDING[p_id][b_id] = true;
            }
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
            return BID_ZONE_ID[Math.ceil(bid_no/10)][Number(bid_no%10) -1];
        },

        moveBid: function(p_id, bid_loc){
            if (bid_loc == OUTBID || bid_loc == NO_BID) {
                this.moveObject(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PENDING]);
            } else if (bid_loc == BID_PASS) {
                this.moveObject(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PASSED]);
            } else { 
                this.moveObject(BID_TOKEN_ID[p_id], this.getBidLocDivIdFromBidNo(bid_loc));
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
            
            if (selected == true && LAST_SELECTED[type] != "" && LAST_SELECTED[type]){
                dojo.removeClass(LAST_SELECTED[type], 'selected');
                LAST_SELECTED[type] = "";
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
            if (! LAST_SELECTED[type] == ""){
                dojo.removeClass(LAST_SELECTED[type], 'selected');
                if (LAST_SELECTED[type] == selected_id){
                    LAST_SELECTED[type] = "";
                    return;
                }
            }
            // select newly selected
            dojo.addClass(selected_id, 'selected');
            LAST_SELECTED[type] = selected_id;
        },

        ///////////////////////////////////////////////////
        //// Player's action

        /***** COMMON ACTIONS (multiple states) *****/
        addPaymentButtons: function( ){
            if (!this.showPay) return;
            this.addActionButton( BTN_ID_PAY_DONE, dojo.string.substitute(_("Pay: ${amt}"), {amt:this.format_block("jstpl_pay_button", {})}), 'donePay');
            
            SILVER_COUNTER.create(PAY_SILVER_TEXT);
            SILVER_COUNTER.setValue(this.silverCost);
            GOLD_COUNTER.create(PAY_GOLD_TEXT);
            GOLD_COUNTER.setValue(this.goldAmount);
            this.addActionButton( BTN_ID_MORE_GOLD, dojo.string.substitute(_('Use More ${gold}'), {gold: TOKEN_HTML['gold']}), 'raiseGold', null, false, 'gray');
            this.addActionButton( BTN_ID_LESS_GOLD, dojo.string.substitute(_('Use Less ${gold}'), {gold: TOKEN_HTML['gold']}), 'lowerGold', null, false, 'gray');
            dojo.style( $( BTN_ID_LESS_GOLD ), 'display', 'none');
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            GOLD_COUNTER.setValue(this.goldAmount);
            this.silverCost +=5;
            if (this.silverCost >0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'inline-block');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'inline-block');
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'inline-block');
                SILVER_COUNTER.setValue(this.silverCost);
            }
            if(this.goldAmount == 0){
                dojo.style( $(PAY_GOLD_TEXT), 'display', 'none');
                dojo.style( $(PAY_GOLD_TOKEN), 'display', 'none');
                dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        raiseGold: function(){
            if (this.silverCost <0) return;
            dojo.style( $(PAY_GOLD_TEXT), 'display', 'inline-block');
            dojo.style( $(PAY_GOLD_TOKEN), 'display', 'inline-block');
            dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'inline-block');

            this.goldAmount++;
            GOLD_COUNTER.setValue(this.goldAmount);
            this.silverCost -= 5;
            SILVER_COUNTER.setValue(Math.max(0 , this.silverCost));
            if (this.silverCost <= 0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'none');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'none');
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'none');
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
            let silver_new = BOARD_RESOURCE_COUNTERS[this.player_id].silver.getValue() - silver_offset_neg + silver_offset_pos;
            this.newPosNeg('silver', silver_new);

            // gold
            let gold_offset_neg = this.getOffsetNeg('gold');
            let gold_offset_pos = this.getOffsetPos('gold');
            if (this.goldAmount >0){
                gold_offset_neg += this.goldAmount;
            }
            this.setOffsetNeg('gold', gold_offset_neg);
            let gold_new = BOARD_RESOURCE_COUNTERS[this.player_id].gold.getValue() - gold_offset_neg + gold_offset_pos;
            this.newPosNeg('gold', gold_new);
            this.updateBuildingAffordability();
            this.updateTradeAffordability();
            
            this.createPaymentBreadcrumb({'silver':Math.min(0,(-1 *this.silverCost)), 'gold':Math.min(0,(-1 *this.goldAmount))});
        },

        /***** BREADCRUMB METHODS *****/
        createTradeBreadcrumb: function(id, text, tradeAway, tradeFor, loan=false){
            dojo.place(this.format_block( 'jptpl_breadcrumb_trade', 
            {
                id: id, 
                text:text, 
                away:this.getResourceArrayHtml(tradeAway, true, "position: relative; top: 9px;"),
                for:this.getResourceArrayHtml(tradeFor, true, `position: relative; top: 9px;`)}
                ), `breadcrumb_transactions`, 'before');
        },

        destroyTradeBreadcrumb: function(id){
            if (dojo.query(`#breadcrumb_${id}`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_${id}`);
                this.fadeOutAndDestroy(`breadcrumb_${id}_1`);
            }
        },

        createIncomeBreadcrumb: function(id) {
            if (!(id in INCOME_ARRAY)) return;
            let name = `<div title="Rail Tracks" class="bread_track"></div>`;
            let order = 1;
            if (id != -1){
                name = this.format_block('jstpl_color_log', {'string':_(BUILDING_INFO[id].name), 'color':ASSET_COLORS[BUILDING_INFO[id].type]});
                let bld = dojo.query(`#${TPL_BLD_ZONE}${PLAYER_COLOR[this.player_id]} .${TPL_BLD_CLASS}${id}`);
                if (bld[0].style){
                    order = Number(bld[0].style.order) + 2;
                }
            }
            let args = {text:name, 'id':id, style:`order:${order};`, income:this.getResourceArrayHtml(INCOME_ARRAY[id], true, "position: relative; top: 9px;")};
            if (dojo.query(`#breadcrumb_income_${id}`).length>=1){
                dojo.destroy(`breadcrumb_income_tokens_${id}`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumb_income_${id}`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumbs`, 'first');
            }
        },

        destroyIncomeBreadcrumb: function(){
            for(let id in INCOME_ARRAY){
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

        createBuildingBreadcrumb: function(){ // defaults are ??? building with no cost.
            // defaults are ??? building with no cost. (when no building is selected)
            let b_id = 0;
            let b_name=_("???"); 
            let b_type=4; 
            let cost={};
            if (LAST_SELECTED.building!=''){
                b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                b_name = _(BUILDING_INFO[b_id].name);
                b_type = BUILDING_INFO[b_id].type;
                cost = this.getBuildingCost(b_id);
            }
            let b_name_html = this.format_block('jstpl_color_log', {'string':_(b_name), 'color':ASSET_COLORS[b_type]});
            let b_html = this.format_block( 'jptpl_breadcrumb_building', {text:dojo.string.substitute(_("Build ${building_name}"),{building_name:b_name_html}), cost:this.getResourceArrayHtml(this.invertArray(cost), true, "position: relative; top: 9px;")})
            if (dojo.query('#breadcrumb_building').length==1){
                this.updateTrade(this.buildingCost, true);
                dojo.destroy('breadcrumb_bldCost');
                dojo.place(b_html, 'breadcrumb_building', 'replace');
            } else {
                dojo.place(b_html, `breadcrumbs`, 'last');
            }
            this.buildingCost = cost;
            this.updateTrade(cost);
        },
        
        destroyBuildingBreadcrumb: function(){
            if (dojo.query(`#breadcrumb_building`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_building`);
                this.fadeOutAndDestroy(`breadcrumb_bldCost`);
            }
        },

        updateIncomeArr: function(){
            INCOME_ARRAY.length = 0;
            const playerBuildingZone = PLAYER_BUILDING_ZONE_ID[this.player_id];
            for(let b_id in HAS_BUILDING[this.player_id]){
                INCOME_ARRAY[b_id] = [];
                // building base income
                if (BUILDING_INFO[b_id].inc){
                    // special income
                    if (b_id == BLD_RODEO){
                        INCOME_ARRAY[b_id].silver = Math.min(5, this.getPlayerWorkerCount(this.player_id));
                    } else if (b_id == BLD_BANK){
                        if (BOARD_RESOURCE_COUNTERS[this.player_id].loan.getValue() == 0){
                            this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'silver', 2);
                        } else {
                            this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'loan', -1);
                        }
                    } else {
                        for(let type in BUILDING_INFO[b_id].inc){
                            if (type == 'vp2'){
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp',(2* BUILDING_INFO[b_id].inc.vp2));
                            } else {
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type,BUILDING_INFO[b_id].inc[type]);
                            }
                        }
                    }
                }
                // building worker income
                if (BUILDING_INFO[b_id].slot){
                    if (BUILDING_INFO[b_id].slot == 3){
                        if (dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot .token_worker`).length == 2){
                            for (type in BUILDING_INFO[b_id].s3){
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s3[type]);
                            }
                        }
                    } else {
                        let slots = dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot:not(:empty)`);
                        for(let i in slots){
                            if (slots[i].id == null) continue;
                            if (slots[i].id.split('_')[2] == 1){
                                for (type in BUILDING_INFO[b_id].s1){
                                    if (type == 'vp2'){
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp', (2* BUILDING_INFO[b_id].s1.vp2));
                                    } else {
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s1[type]);
                                    }
                                }
                            }
                            if (slots[i].id.split('_')[2] == 2){
                                for (type in BUILDING_INFO[b_id].s2){
                                    if (type == 'vp2'){
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp', (2* BUILDING_INFO[b_id].s2.vp2));
                                    } else {
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s2[type]);
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
                INCOME_ARRAY[-1] = {'silver':tracks};
            }
        },
        
        getIncomeOffset: function(type){
            let amt = 0;
            for (let id in INCOME_ARRAY){
                if (INCOME_ARRAY[id][type]){
                    amt += INCOME_ARRAY[id][type];
                }
            }
            return amt;
        },

        setOffsetForIncome: function() {
            this.updateIncomeArr();
            //console.log('setOffsetForIncome', INCOME_ARRAY);
            for (let id in INCOME_ARRAY){
                for (let type in INCOME_ARRAY[id]){
                    if (INCOME_ARRAY[id][type]!= 0){
                        let income = INCOME_ARRAY[id][type];
                        this.offsetPosNeg(type, income, true);
                        this.newPosNeg(type, income, true);
                        this.updateBuildingAffordability();
                        this.updateTradeAffordability();
                    }
                }
                this.createIncomeBreadcrumb(id);
            }
        },

        clearOffset: function() {
            //console.log("clearOffset");
            for(type in POSITIVE_RESOURCE_COUNTERS){
                POSITIVE_RESOURCE_COUNTERS[type].setValue(0);
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
                NEGATIVE_RESOURCE_COUNTERS[type].setValue(0);
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
            if (TRANSACTION_LOG.length == 0){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.disabled)`).addClass('disabled');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}:not(.disabled)`).addClass('disabled');   
                this.setupTransitionButton(false);
            } /*else if (TRANSACTION_LOG.length == 1){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.disabled)`).addClass('disabled');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.disabled`).removeClass('disabled');
            } */else {
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.disabled`).removeClass('disabled');
                dojo.query(`#${UNDO_TRADE_BTN_ID}.disabled`).removeClass('disabled');
                this.setupTransitionButton(true);
            }
            
        },

        setupTransitionButton: function( andTrade ){
             
            let transitions = [BTN_ID_DONE, BTN_ID_BUILD, BTN_ID_FOOD_VP, BTN_ID_COW_VP, BTN_ID_COPPER_VP, BTN_ID_WOOD_TRACK, BTN_ID_BONUS_WORKER];
            let transition_button = '';
            transitions.forEach(button=> {
                if (dojo.query(`#${button}`).length == 1){
                    transition_button = button;
                }
            });
            switch (transition_button){
                case BTN_ID_DONE:
                    break;

                case BTN_ID_BUILD:
                    break;

                case BTN_ID_FOOD_VP:
                    break;

                case BTN_ID_COW_VP:
                    break;
                
                case BTN_ID_COPPER_VP:
                    break;

                case BTN_ID_WOOD_TRACK:
                    break;

            }
            
        },
            

        addTradeActionButton: function( ){
            this.addActionButton( BTN_ID_TRADE, _("Show Trade"),'tradeActionButton', null, false, 'gray' );
            this.addActionButton( BTN_ID_TAKE_LOAN, _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
            this.addActionButton( UNDO_LAST_TRADE_BTN_ID, _("Undo Last Trade/Dept"),'undoLastTransaction', null, false, 'red' );
            dojo.addClass(UNDO_LAST_TRADE_BTN_ID, 'disabled');
            this.addActionButton( UNDO_TRADE_BTN_ID, _("Undo All Trade/Dept"), 'undoTransactionsButton', null, false, 'red' );
            dojo.addClass(UNDO_TRADE_BTN_ID, 'disabled');

            this.addActionButton( CONFIRM_TRADE_BTN_ID, _("Confirm Trade"),'confirmTradeButton', null, false, 'blue' );
            dojo.addClass(CONFIRM_TRADE_BTN_ID, 'disabled');
            
            dojo.style(TRADE_BOARD_ID, 'order', 2);
            this.updateTradeAffordability();
            this.resetTradeValues();
            if (BOARD_RESOURCE_COUNTERS[this.player_id].trade.getValue() ==0) {
                this.tradeEnabled = false;
                dojo.query(`#${BTN_ID_TRADE}`).addClass('disabled');
            } else {
                this.enableTradeBoardActions();
            }
        },

        enableTradeBoardActions: function(){
            dojo.query(`#building_zone_${PLAYER_COLOR[this.player_id]} .trade_option:not(.selectable)`).addClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}:not(.selectable)`).addClass('selectable');
        },

        disableTradeBoardActions: function(){
            dojo.query(`#building_zone_${PLAYER_COLOR[this.player_id]} .trade_option.selectable`).removeClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}.selectable`).removeClass('selectable');
        },

        /**
         *  primary trade button (can be in 2 states)
         * show trade 
         *  - if have at least 1 trade token, on trade enabled state
         *  - bgabutton_gray
         * hide trade 
         *  - if trade buttons already displayed, but no trades selected
         *  - bgabutton_red
         */
        tradeActionButton: function( evt){
            if(  (this.currentState=='allocateWorkers' && this.allowTrade) || this.checkAction( 'trade' ) ){
                if (this.tradeEnabled){// hide
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
            //console.log('enableTradeIfPossible');
            if (!this.tradeEnabled){
                this.tradeEnabled = true;

                dojo.place(dojo.create('br'),'generalactions','last');
                let trade_zone = dojo.create('div', {id:TRADE_ZONE_ID, style:'display: inline-flex;flex-direction: column;'});
                dojo.place(trade_zone, 'generalactions', 'last');
                let zone_style = 'display: flex; justify-content: center; flex-wrap: wrap;';
                let buy_zone = dojo.create('div', {id:BUY_ZONE_ID, style:zone_style});
                dojo.place(buy_zone, TRADE_ZONE_ID, 'first');
                let buy_text = dojo.create('span', {class:"biggerfont", id:BUY_TEXT_ID});
                dojo.place(buy_text, BUY_ZONE_ID, 'first');
                buy_text.innerText = _("Buy:");
                let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:zone_style});
                dojo.place(sell_zone, TRADE_ZONE_ID, 'last');
                let sell_text = dojo.create('span', {class:"biggerfont", id:SELL_TEXT_ID});
                dojo.place(sell_text, SELL_ZONE_ID, 'first');
                sell_text.innerText =_("Sell:");
                    
                let types = ['wood','food','steel','gold','cow','copper'];
                types.forEach(type=> {
                    let tradeAwayTokens = this.getResourceArrayHtml(this.getBuyAway(type));
                    let tradeForTokens = this.getResourceArrayHtml(this.getBuyFor(type));
                    this.addActionButton( `btn_buy_${type}`, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, 'onBuyResource', null, false, 'blue');
                    dojo.place(`btn_buy_${type}`, BUY_ZONE_ID, 'last');
                    tradeAwayTokens = this.getResourceArrayHtml(this.getSellAway(type));
                    tradeForTokens = this.getResourceArrayHtml(this.getSellFor(type));
                    this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, 'onSellResource', null, false, 'blue');
                    dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
                });
                if (HAS_BUILDING[this.player_id][BLD_MARKET] || HAS_BUILDING[this.player_id][BLD_BANK]){
                    let special_zone = dojo.create('div', {id:SPECIAL_ZONE_ID, style:zone_style});
                    dojo.place(special_zone, TRADE_ZONE_ID, 'first');
                }
                if (HAS_BUILDING[this.player_id][BLD_MARKET]){
                    let mkt_text = dojo.create('span', {class:"biggerfont", id:MARKET_TEXT_ID, style:"width: 100px;"});
                    dojo.place(mkt_text, SPECIAL_ZONE_ID, 'first');
                    mkt_text.innerText = _("Market:");
                    let types = ['food','steel'];
                    types.forEach((type) => {
                        tradeAwayTokens = this.getResourceArrayHtml(this.getMarketAway(type));
                        tradeForTokens = this.getResourceArrayHtml(this.getMarketFor(type));
                        let mkt_btn_id = `btn_market_${type}`;
                        this.addActionButton( mkt_btn_id, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, `onMarketTrade_${type}`, null, false, 'blue');
                        dojo.place(mkt_btn_id, SPECIAL_ZONE_ID, 'last');
                    } );
                }
                if (HAS_BUILDING[this.player_id][BLD_BANK]){
                    let bank_text = dojo.create('span', {class:"biggerfont", id:BANK_TEXT_ID, style:"width: 100px;"});
                    dojo.place(bank_text, SPECIAL_ZONE_ID, 'last');
                    bank_text.innerText = _("Bank:");
                    tradeAwayTokens = this.getResourceArrayHtml({'trade':-1});
                    tradeForTokens = this.getResourceArrayHtml({'silver':1});
                    this.addActionButton( BTN_ID_TRADE_BANK, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, `onClickOnBankTrade`, null, false, 'blue');
                    dojo.place(BTN_ID_TRADE_BANK, SPECIAL_ZONE_ID, 'last');
                }
            }
            this.updateTradeAffordability();
        },
        
        disableTradeIfPossible: function() {
            if (this.tradeEnabled){
                this.tradeEnabled = false;
                dojo.query(`#${TRADE_ZONE_ID}`).forEach(dojo.destroy);
                dojo.query('#generalactions br:nth-last-of-type(1)').forEach(dojo.destroy);
            }
        },

        confirmTradeButton: function ( ){
            if((this.currentState=='allocateWorkers' && !this.isCurrentPlayerActive())){
                // confirm trade
                this.confirmTrades( true );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            } else if (this.checkAction( 'trade' )) {
                this.confirmTrades( false );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            }
        },

        hideResources: function(){
            // if no building selected, or income displayed, hide stuff
            let thisPlayer = `player_zone_${PLAYER_COLOR[this.player_id]}`;
            dojo.query(`#${thisPlayer} .new_text:not(.noshow)`).addClass('noshow');
            dojo.query(`#${thisPlayer} .player_text.noshow`).removeClass('noshow');
            
            let hasOffset = [];
            for(let type in this.getBuildingCost())  { hasOffset[type] = true; }
            for(let i in TRANSACTION_COST)
                for(let type in TRANSACTION_COST[i]) { hasOffset[type] = true; }
            for(let id in INCOME_ARRAY)
                for(let type in INCOME_ARRAY[id])
                if (INCOME_ARRAY[id][type]!= 0)   { hasOffset[type] = true; }
            if (this.silverCost >0){ hasOffset.silver = true; }
            if (this.goldAmount >0){ hasOffset.gold = true; }
            for(let type in hasOffset){
                dojo.query(`#${thisPlayer} .player_${type}_new.noshow`).removeClass('noshow');
            }
        },

        confirmTrades: function ( notActive ){
            if (TRANSACTION_LOG.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                lock: true, 
                trade_action: TRANSACTION_LOG.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 this.can_cancel = true;
                 if (this.currentState == 'allocateWorkers' && !notActive){
                    this.setOffsetForIncome();
                 }
                 this.calculateAndUpdateScore(this.player_id);
             }, function( is_error) {});
        },

        getOffsetNeg: function(type){
            let value = 0;
            for(let i in TRANSACTION_COST){
                if (type in TRANSACTION_COST[i] && TRANSACTION_COST[i][type] < 0){
                    value += TRANSACTION_COST[i][type];
                }
            }
            return Math.abs(value);
        },
        
        getOffsetPos: function(type){
            let value = 0;
            for(let i in TRANSACTION_COST){
                if (type in TRANSACTION_COST[i] && TRANSACTION_COST[i][type]>0){
                    value += TRANSACTION_COST[i][type];
                }
            }
            return value;
        },

        getOffsetValue: function(type) {
            let value = 0;
            for(let i in TRANSACTION_COST){
                if (type in TRANSACTION_COST[i]){
                    value += TRANSACTION_COST[i][type];
                }
            }
            return value;
        },

        /**
         * update the offset & new values to be correct 
         * values are board_resourceCounters + offset from pending transactions.
         */
        resetTradeValues: function() {
            for(let type in BOARD_RESOURCE_COUNTERS[this.player_id]){
                let offset = 0;
                offset -= this.setOffsetNeg(type, this.getOffsetNeg(type));
                offset += this.setOffsetPos(type, this.getOffsetPos(type));

                this.newPosNeg(type, BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + offset);
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
                if (evt.target.classList.contains('bgabutton')){
                    type = evt.target.id.split('_')[2];
                } else { return; }
            }
            //console.log(type);
            // when buying, trade costs trade_val, so make it negative.
            let tradeChange = this.getBuyChange(type) 
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(RESOURCE_INFO[type].trade_val);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] = 1;
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Buy"), tradeAway, tradeFor);

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP[`buy_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        /** get function tradeAway for Buy transactions */
        getBuyAway (type){
            let buyAway = this.invertArray(RESOURCE_INFO[type].trade_val);
            buyAway.trade = -1;
            return buyAway;
        },
        /** get function tradeFor for Buy transactions */
        getBuyFor (type){
            let buyFor = [];
            buyFor[type] = 1;
            return buyFor;
        },
        /** get function tradeChange(For & Away) for Buy transactions */
        getBuyChange (type) {
            let buyChange = this.getBuyAway(type);
            buyChange[type] = 1;
            return buyChange;
        },

        onSellResource: function ( evt , type = "" ){
            //console.log('onSellResource');
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (type == ""){
                if (evt.target.classList.contains('bgabutton')){
                type = evt.target.id.split('_')[2];
                } else { return; }
            }
            //console.log(type);
            let tradeChange = this.getSellChange (type);
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {trade:-1};
                tradeAway[type] = -1;
                let tradeFor = this.copyArray(RESOURCE_INFO[type].trade_val);
                tradeFor.vp = 1;
                if (HAS_BUILDING[this.player_id][BLD_GENERAL_STORE]){
                    tradeFor = this.addOrSetArrayKey(tradeFor, 'silver', 1);
                }
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Sell"), tradeAway, tradeFor);

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP[`sell_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },
        /** get function tradeAway for Sell transactions */
        getSellAway (type){
            let tradeAway = {trade:-1};
            tradeAway[type] = -1;
            return tradeAway;
        },
        /** get function tradeFor for Sell transactions */
        getSellFor (type){
            let tradeFor = this.copyArray(RESOURCE_INFO[type].trade_val);
            tradeFor.vp = 1;
            if (HAS_BUILDING[this.player_id][BLD_GENERAL_STORE]){
                tradeFor = this.addOrSetArrayKey(tradeFor, 'silver', 1);
            }
            return tradeFor;
        },
         /** get function tradeChange for Sell transactions */
        getSellChange: function ( type ) {
            let tradeChange = this.getSellFor(type);
            tradeChange.trade = -1;
            tradeChange[type] = -1;
            return tradeChange;
        },

        onMoreLoan: function ( evt ){
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' )) { return; }
            if(this.canAddTrade({'loan':1, 'silver':2})){
                this.updateTrade({'loan':1, 'silver':2});
                // add breadcrumb
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, "Take Dept", {loan:1}, {silver:2}, true);

                TRANSACTION_COST.push({'loan':1, 'silver':2});
                TRANSACTION_LOG.push(TRADE_MAP.loan);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        onMarketTrade_food: function (evt){
            return this.onClickOnMarketTrade(evt, 'food');
        },
        onMarketTrade_steel: function (evt){
            return this.onClickOnMarketTrade(evt, 'steel');
        },

        onClickOnMarketTrade: function ( evt, type=''){
            //console.log('onClickOnMarketTrade');
            //console.log(evt);
            dojo.stopEvent( evt );
            if (type == ''){
                if (evt.target.classList.contains("selectable")) { 
                    if (evt.target.classList.contains('market_food')){
                        var type = 'food';
                    } else if (evt.target.classList.contains('market_steel')){
                        var type = 'steel';
                    } else { return; }
                } else {// check parentNode (click on token in div)
                    if (!evt.target.parentNode.classList.contains('selectable')) { return; } 
                    if (evt.target.parentNode.classList.contains('market_food')){
                        var type = 'food';
                    } else if (evt.target.parentNode.classList.contains('market_steel')){
                        var type = 'steel';
                    } else { return; }
                }
            }
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            
            let tradeChange = this.getMarketChange(type);
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(RESOURCE_INFO[type].market);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] =1;
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Market"), tradeAway, tradeFor);

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP[`market_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        /** get function tradeAway for Market transactions */
        getMarketAway (type){
            let tradeAway = this.invertArray(RESOURCE_INFO[type].market);
            tradeAway.trade = -1;
            return tradeAway;
        },
        /** get function tradeFor for Market transactions */
        getMarketFor (type){
            let tradeFor = [];
            tradeFor[type] =1;
            return tradeFor;
        },
        /** get function tradeChange for Market transactions */
            getMarketChange (type) {
            let tradeChange = this.getMarketAway(type);
            tradeChange[type] = 1;
            return tradeChange;
        },

        onClickOnBankTrade: function ( evt ){
            //console.log('onClickOnBankTrade');
            dojo.stopEvent( evt );
            if (!(evt.target.classList.contains("selectable")) && !(evt.target.parentNode.classList.contains('selectable')) && !(evt.target.classList.contains("bgabutton")))
            {   return; }
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if(this.canAddTrade({'silver':1, 'trade':-1})){
                this.updateTrade({'silver':1, 'trade':-1});              
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _('Bank'), {trade:1}, {silver:1});

                TRANSACTION_COST.push({'silver':1, 'trade':-1});
                TRANSACTION_LOG.push(TRADE_MAP.bank);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        canAddTrade: function( change){
            let can_afford = true;
            for (let type in change){
                let avail_res = BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue()+ this.getOffsetValue(type);
                can_afford &= (change[type] >0 || (avail_res + change[type] )>=0);
            }
            return can_afford;
        },

         /** called when building is selected.
         * will show or hide goldAsCow/goldAsCopper toggles if selected building has those in cost.
         * same for steel with lumberMill
         */
          showHideBuildingOffsetButtons: function () {
            let b_id = 0;
            if (LAST_SELECTED.building!=''){
                b_id= $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2]??0;
            }
            let cost = this.invertArray(BUILDING_INFO[b_id].cost??{});
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                if (cost.cow<0){
                    dojo.style(BTN_ID_GOLD_COW, 'display', 'inline-block');
                } else {
                    dojo.style(BTN_ID_GOLD_COW, 'display', 'none');
                }
                if (cost.copper<0){
                    dojo.style(BTN_ID_GOLD_COPPER, 'display', 'inline-block');
                } else {
                    dojo.style(BTN_ID_GOLD_COPPER, 'display', 'none');
                }
            }
        },

        /** helper function 
         * get cost of building by Building_id.
         * this will take into account cost replacement flags
         * (this.goldAsCow & this.goldAsCopper)
         * @param {int} b_id - building_id
         * @returns [Object object] of {type:amt,type2:amt2}
         */
         getBuildingCost: function( b_id =0) {
            if (b_id == 0){// if b_id not set use last_selected.building
                if (LAST_SELECTED.building!=''){
                    b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                }
            }
            cost = this.invertArray(BUILDING_INFO[b_id].cost);
            if (this.goldAsCopper && ('copper' in cost)){
                this.addOrSetArrayKey(cost, 'gold', cost.copper);
                delete cost.copper;
            } 
            if (this.goldAsCow && ('cow' in cost)){
                this.addOrSetArrayKey(cost, 'gold', cost.cow);
                delete cost.cow;
            }
            return cost;
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
                let offset_value = POSITIVE_RESOURCE_COUNTERS[type].getValue() - NEGATIVE_RESOURCE_COUNTERS[type].getValue();
                this.newPosNeg(type, BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + offset_value);
            }
            return true;
        },

        showResource: function(type){
            let showNew = false;
            if (POSITIVE_RESOURCE_COUNTERS[type].getValue() != 0){
                dojo.query(`.${type}.pos.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
            }
            if (NEGATIVE_RESOURCE_COUNTERS[type].getValue() != 0){
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
                new_value = NEW_RESOURCE_COUNTERS[type].incValue(new_value);
            } else {
                NEW_RESOURCE_COUNTERS[type].setValue(new_value);
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
            let counter = NEGATIVE_RESOURCE_COUNTERS[type];
            if (pos){
                counter = POSITIVE_RESOURCE_COUNTERS[type];
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
            for(let i in TRANSACTION_LOG){
                this.destroyTradeBreadcrumb(i);
            }
            TRANSACTION_COST.length=0;
            TRANSACTION_LOG.length=0;
            this.setupUndoTransactionsButtons();
        },

        undoTransactionsButton: function( ){
            if (TRANSACTION_COST.length ==0) return;
            while (TRANSACTION_LOG.length>0){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
            }
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        undoLastTransaction: function() {
            if (TRANSACTION_COST.length ==0) return;
            this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
            TRANSACTION_LOG.pop();
            this.updateTrade(TRANSACTION_COST.pop(), true);
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
            this.updateTradeAffordability();
        },

        resetTradeButton: function(){
            if(TRANSACTION_LOG.length == 0){
                if (this.tradeEnabled){
                    this.setTradeButtonTo(TRADE_BUTTON_HIDE);
                } else {
                    this.setTradeButtonTo(TRADE_BUTTON_SHOW);
                }
                if (TRANSACTION_LOG.length >0){
                    this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
                } else {
                    this.updateConfirmTradeButton(TRADE_BUTTON_HIDE);
                }
            }
        },

        setTradeButtonTo: function( toVal){
            switch(toVal){
                case TRADE_BUTTON_SHOW:
                    //dojo.addClass(BTN_ID_TRADE,'bgabutton_gray');
                    //dojo.query(`#${BTN_ID_TRADE}.bgabutton_red`).removeClass('bgabutton_red');
                    $(BTN_ID_TRADE).innerText= _('Show Trade');
                    break;
                case TRADE_BUTTON_HIDE:
                    //dojo.query(`#${BTN_ID_TRADE}.bgabutton_gray`).removeClass('bgabutton_gray');
                    //dojo.addClass(BTN_ID_TRADE,'bgabutton_red');
                    $(BTN_ID_TRADE).innerText= _('Hide Trade');
                    break;
            }
        },
        updateConfirmTradeButton: function( show){
            switch(show){
                case TRADE_BUTTON_SHOW:
                    dojo.removeClass(CONFIRM_TRADE_BTN_ID, 'disabled');
                    break;
                case TRADE_BUTTON_HIDE:
                    dojo.addClass(CONFIRM_TRADE_BTN_ID, 'disabled');
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
                let translatedString = _(ASSET_STRINGS[index+15])
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
                dojo.addClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        showTileZone: function(index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                let translatedString = _(ASSET_STRINGS[index+20]);
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
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
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/hireWorker.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } );                
            }
        },
        
        donePlacingWorkers: function( ){
            if( this.checkAction( 'done')){
                const tokenZone = TRACK_TOKEN_ZONE[this.player_id];
                const playerBuildingZone = PLAYER_BUILDING_ZONE_ID[this.player_id];
                if (dojo.query(`#${tokenZone} .token_worker`).length > 0 && dojo.query(`#${playerBuildingZone} .worker_slot:empty`).length > 0){
                    this.confirmationDialog( _('You still have workers to assign, Continue?'), 
                    dojo.hitch( this, function() {
                        this.ajaxDonePlacingWorkers();
                    } ) );
                    return;
                } else {
                    this.ajaxDonePlacingWorkers();
                }
            }
        },

        ajaxDonePlacingWorkers: function(){
            this.ajaxcall("/" + this.game_name + "/" +  this.game_name + "/donePlacingWorkers.html", 
            {lock: true}, this, 
            function( result ) { 
                this.clearSelectable('worker', true); 
                this.clearSelectable('worker_slot', false);
                this.disableTradeBoardActions();
                this.destroyIncomeBreadcrumb();
                INCOME_ARRAY.length=0;
                this.disableTradeIfPossible();
                this.clearOffset();
                this.showPay = true;
            }, function( is_error) { } );
        },
        
        onUnPass: function (evt) {
            this.ajaxcall("/" + this.game_name + "/" +  this.game_name + "/actionCancel.html", {}, this, function( result ) {
                INCOME_ARRAY.length=0;
                this.clearOffset();
                this.clearTransactionLog();
                this.resetTradeValues();
                this.destroyPaymentBreadcrumb();
                this.setOffsetForIncome();
                this.showPay = true;
                this.undoPay = true;
                dojo.query(`#${BTN_ID_UNDO_PASS}`).forEach(dojo.destroy);
            }); 
            // no checkAction! (because player is not active)
        },

        onUndoBidPass: function (evt) {
            this.undoTransactionsButton();
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/cancelBidPass.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
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
            //console.log('onClickOnWorkerSlot');
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

            if (LAST_SELECTED['worker'] == ""){
                const unassignedWorkers = dojo.query(`#worker_zone_${PLAYER_COLOR[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                    this.showMessage( _("You must select a worker"), 'error' );
                    return;
                } else {
                    LAST_SELECTED['worker'] = unassignedWorkers[0].id;
                }
            }
            //console.log(target_divId);
            let target_workers = dojo.query(`#${target_divId} .token_worker`).length;
            if (target_workers ==1 && !target_divId.endsWith('_3') || target_workers ==2 && target_divId.endsWith('_3') ){
                this.showMessage(_("You cannot place additional workers there"), 'error');
                return;
            } 
            const building_key = Number(target_divId.split('_')[1]);
            const building_slot = Number(target_divId.split('_')[2]);

            const w_key = LAST_SELECTED['worker'].split('_')[2];
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: w_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {
                dojo.removeClass(LAST_SELECTED['worker'], 'selected');
                LAST_SELECTED['worker'] = '';
             }, function( is_error) { });
        },

        /**remove all buttons... 
         * be careful...
         */
        removeButtons: function () {
            let buttons = dojo.query(`#generalactions .bgabutton`);
            for (let i in buttons){
                this.fadeOutAndDestroy(buttons[i].id);
            }
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
                if (TRANSACTION_LOG.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                        lock: true, 
                        allowTrade:true,
                        trade_action: TRANSACTION_LOG.join(',')
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
                if (TRANSACTION_LOG.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                        lock: true, 
                        allowTrade:this.allowTrade,
                        trade_action: TRANSACTION_LOG.join(',')
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
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/donePay.html", args , this, 
                function( result ) { 
                    this.showPay = false;
                    this.disableTradeBoardActions();
                    this.destroyPaymentBreadcrumb();
                    this.resetTradeValues();
                    this.silverCost = 0;
                    this.goldAmount = 0;
                    this.disableTradeIfPossible();
                    this.allowTrade = false;
                    if (this.currentState == "allocateWorkers"){
                        dojo.place(BTN_ID_UNDO_PASS, 'pagemaintitletext', 'after');
                    }
                }, function( is_error) { } );
        },

        validPay:function(){
            if (NEW_RESOURCE_COUNTERS.silver.getValue() < 0)
                return false;
            if (NEW_RESOURCE_COUNTERS.gold.getValue() < 0)
                return false;
            return true;
        },

        confirmDummyBidButton: function ( evt )
        {
            if( this.checkAction( 'dummy' )){
                if (LAST_SELECTED['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(LAST_SELECTED['bid']);
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/confirmDummyBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        setupBidsForNewRound: function ()
        {
            for(let p_id in PLAYER_COLOR){
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
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/passBid.html", {lock: true}, this, 
                function( result ) { this.clearSelectable('bid', true); }, 
                function( is_error) { } );                
            }
        },

        confirmBidButton: function () 
        {
            if( this.checkAction( 'confirmBid')){
                if (LAST_SELECTED['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(LAST_SELECTED['bid']);
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        /***** cancel back to PAY AUCTION PHASE *****/
        cancelTurn: function() {
            this.undoTransactionsButton();
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/cancelTurn.html", {lock: true}, this, 
                function( result ) {
                    this.showPay = true;
                    this.resetTradeValues();
                }, function( is_error) { } ); 
            }
        },

        /***** CHOOSE BONUS OPTION *****/
        onSelectBonusOption: function( evt ){
            //console.log('onSelectBonusOption', evt);
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( !dojo.hasClass(evt.target.id,'selectable')){ return; }
            if( this.checkAction( 'chooseBonus' )) {
                let type = evt.target.id.split('_')[3];
                this.updateSelectedBonus(type);
            }
        },

        doneSelectingBonus: function(){
            if (this.checkAction( 'chooseBonus' )){
                if (LAST_SELECTED['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = LAST_SELECTED['bonus'].split('_')[3];
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/doneSelectingBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.disableTradeIfPossible();
                        this.disableTradeBoardActions();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },

        selectBonusButton: function( evt ) {
            //console.log('selectBonusButton', evt);
            if (this.checkAction( 'chooseBonus' )){
                let target_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
                let type = target_id.split("_")[2];
                this.updateSelectedBonus(type);
            }
        },
         
        updateSelectedBonus: function(type){
            //console.log(type);
            let btn_id = `btn_bonus_${type}`;
            let option_id = BONUS_OPTIONS[RESOURCES[type]];
            if (LAST_SELECTED.bonus ==''){
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                dojo.removeClass(BTN_ID_CHOOSE_BONUS, 'disabled');
            } else if (LAST_SELECTED.bonus == option_id) { //this was selected
                dojo.removeClass(btn_id, 'bgabutton_blue');
                dojo.addClass(btn_id, 'bgabutton_gray');
                dojo.addClass(BTN_ID_CHOOSE_BONUS, 'disabled');
            } else { //other thing was selected.
                let lastSelected_id =  `btn_bonus_${LAST_SELECTED.bonus.split('_')[3]}`;
                dojo.removeClass(lastSelected_id, 'bgabutton_blue');
                dojo.addClass(lastSelected_id, 'bgabutton_gray');
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
            }
            this.updateSelected('bonus', option_id);
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
                let order = (30*Number(BUILDING_INFO[b_id].type)) + Number(b_id) - 100;
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
        },

        fixBuildingOrder: function(){
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(BUILDING_INFO[b_id].type)) + Number(b_id);
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
            this.allowed_building_stack= [];
        },

        updateTradeAffordability: function(){
            //console.log('updateTradeAffordability');

            if (this.isSpectator) return;
            for (let trade_id = 0; trade_id < 6; trade_id++){
                let type =  this.getKeyByValue(TRADE_MAP, trade_id).split('_')[1];
                //console.log('type', type);
                // buy
                let node_loc = `#trade_buy_${type}`;
                let btn_id   = `#btn_buy_${type}`;
                if (this.canAddTrade(this.getBuyChange(type))){
                    this.updateAffordability(node_loc,     AFFORDABLE);
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc,     UNAFFORDABLE);
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }
                // sell
                node_loc = `#trade_sell_${type}`;
                btn_id   = `#btn_sell_${type}`;
                if (this.canAddTrade(this.getSellChange(type))){
                    this.updateAffordability(node_loc,     AFFORDABLE);
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc,     UNAFFORDABLE);
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }
            }
            // market
            if (HAS_BUILDING[this.player_id][BLD_MARKET]){
                // food
                let node_loc = `#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .market_food`;
                let btn_id = `#btn_market_food`;
                if (this.canAddTrade(this.getMarketChange('food'))){
                    this.updateAffordability(node_loc,     AFFORDABLE);
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc,     UNAFFORDABLE);
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }
                // steel
                node_loc = `#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .market_steel`;
                btn_id = `#btn_market_steel`;
                if (this.canAddTrade(this.getMarketChange('steel'))){
                    this.updateAffordability(node_loc,     AFFORDABLE);
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc,     UNAFFORDABLE);
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }   
            }
            // bank 
            if (HAS_BUILDING[this.player_id][BLD_BANK]){
                let node_loc =  `#${BANK_DIVID}`;
                let btn_id   = `#BTN_ID_TRADE_BANK`;
                if (this.canAddTrade({trade:-1})){ // can afford
                    this.updateAffordability(node_loc, AFFORDABLE);
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }
            }
        },
        
        /**
         * applies the class for affordable state to node at locator.
         * @param {*} node 
         * @param {*} afford_val 
         */
        updateAffordability: function(node_locator, afford_val){
            switch(afford_val){
                case AFFORDABLE:
                    dojo.query(node_locator)
                           .addClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                case UNAFFORDABLE:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                          .addClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                case TRADEABLE:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                           .addClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                default:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
            }
        },

        updateButtonAffordability(button_id, afford_val){
            switch(afford_val){
                case AFFORDABLE:
                    dojo.query(button_id)
                           .addClass('bgabutton_blue')
                        .removeClass('bgabutton_gray');
                    break;
                case UNAFFORDABLE:
                    dojo.query(button_id)
                        .removeClass('bgabutton_blue')
                          .addClass('bgabutton_gray');
                    break;
            }
        },

        updateBuildingAffordability: function(showIncomeCost = false){
            //console.log('updateBuildingAffordability');
            if (this.isSpectator) return;
            let buildings = dojo.query(`#${TILE_CONTAINER_ID[0]} .${TPL_BLD_TILE}, #${TILE_CONTAINER_ID[1]} .${TPL_BLD_TILE}`);
            for (let i in buildings){
                let bld_html= buildings[i];
                if (bld_html.id == null) continue;
                let b_key = Number(bld_html.id.split('_')[2]);
                let b_id = $(bld_html.id).className.split(' ')[1].split('_')[2];
                let b_loc = `#${bld_html.id}`;
                if (HAS_BUILDING[this.player_id][b_id]) { //can't buy it twice, mark it un-affordable.
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[ALREADY_BUILT]};">${_(ASSET_STRINGS[ALREADY_BUILT])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, ALREADY_BUILT));
                    }
                    continue;
                }
                let afford = this.isBuildingAffordable(b_id, showIncomeCost);

                if (afford==1){// affordable
                    this.updateAffordability(b_loc, AFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[AFFORDABLE]};">${_(ASSET_STRINGS[AFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, AFFORDABLE));
                    }
                } else if (afford ==0){//tradeable
                    this.updateAffordability(b_loc, TRADEABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[TRADEABLE]};">${_(ASSET_STRINGS[TRADEABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, TRADEABLE));
                    }
                } else {
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[UNAFFORDABLE]};">${_(ASSET_STRINGS[UNAFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, UNAFFORDABLE));
                    }
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
            //console.log("isBuildingAffordable", b_id);
            if (BUILDING_INFO[b_id].cost == null) return 1;// no cost, can afford.
            if (BUILDING_INFO[b_id].cost.length == 0) return 1;// no cost, can afford.
            const p_id = this.player_id;
            let cost = BUILDING_INFO[b_id].cost;
            let gold = BOARD_RESOURCE_COUNTERS[p_id].gold.getValue() + this.getOffsetValue('gold') + this.getIncomeOffset('gold') - this.goldAmount;
            //console.log('gold', gold, BOARD_RESOURCE_COUNTERS[p_id].gold.getValue(),  off_gold, this.getIncomeOffset('gold'), -this.goldAmount);
            let adv_cost = 0;
            let trade_cost = 0;
            for(let type in cost){
                let res_amt = BOARD_RESOURCE_COUNTERS[p_id][type].getValue() + this.getOffsetValue(type) + this.getIncomeOffset(type);
                //console.log('cost', {res_amt:res_amt, type:type, cost:cost, trade_cost:trade_cost});
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
            let trade_avail = BOARD_RESOURCE_COUNTERS[p_id].trade.getValue() + this.getOffsetValue('trade') + this.getIncomeOffset('trade');
            trade_cost += (adv_cost - Math.min(gold, adv_cost));
            if (!(HAS_BUILDING[p_id][BLD_RIVER_PORT])){
                trade_cost += adv_cost;
            }
            
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
            } else if (target_id.endsWith('trade_market_food_steel') || target_id.endsWith('trade_market_wood_food')){
                return this.onClickOnMarketTrade( evt ); 
            } else if (target_id.startsWith('trade_')){
                return this.onSelectTradeAction( evt ); 
            }
            if( !evt.target.classList.contains( 'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                let b_id = $(target_id).className.split(' ')[1].split('_')[2];
                this.updateSelected('building', target_id);
                if (!dojo.hasClass(target_id, 'selected')){
                    dojo.addClass(BTN_ID_BUILD, 'disabled');
                    $('bld_name').innerText = '';
                    this.createBuildingBreadcrumb();
                    this.showHideBuildingOffsetButtons();
                } else {
                    dojo.removeClass(BTN_ID_BUILD, 'disabled');
                    if (BUILDING_INFO[b_id].cost == null) {
                        $('bld_name').innerText = _(BUILDING_INFO[b_id].name);
                    } else {
                        $('bld_name').innerText = _(BUILDING_INFO[b_id].name);
                        this.createBuildingBreadcrumb();
                        this.showHideBuildingOffsetButtons();
                    }
                }
            }
        },

        chooseBuilding: function () {
            if (this.checkAction( 'buildBuilding')){
                const building_divId = LAST_SELECTED['building'];
                if (building_divId == "") {
                    this.showMessage( _("You must select a building"), 'error' );
                    return;
                }
                const building_key = Number(building_divId.split("_")[2]);
                let args = {building_key: building_key, goldAsCow:this.goldAsCow, goldAsCopper:this.goldAsCopper, lock: true};
                if (TRANSACTION_LOG.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxCallBuildBuilding( args );
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallBuildBuilding( args );
                }
            }
        },

        ajaxCallBuildBuilding: function ( args ) {
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/buildBuilding.html", args, this, 
            function( result ) {
                this.buildingCost = [];
                this.resetTradeValues();
                this.disableTradeIfPossible();
                this.disableTradeBoardActions();
                this.destroyBuildingBreadcrumb();
                this.updateAffordability(`#${TPL_BLD_TILE}_${args.building_key}`, 0);
             }, function( is_error) { } );
        },

        toggleGoldAsCopper: function(){
            if (this.goldAsCopper){
                this.goldAsCopper = false;
                dojo.removeClass(BTN_ID_GOLD_COPPER, 'bgabutton_blue');
                dojo.addClass(BTN_ID_GOLD_COPPER, 'bgabutton_red');
                dojo.addClass('copper_as', 'no');
            } else {
                this.goldAsCopper = true;
                dojo.removeClass(BTN_ID_GOLD_COPPER, 'bgabutton_red');
                dojo.addClass(BTN_ID_GOLD_COPPER, 'bgabutton_blue');
                dojo.removeClass('copper_as', 'no');
                if (this.buildingCost['copper']==1){
                }
            }
            if (LAST_SELECTED.building != ""){
                this.createBuildingBreadcrumb();
            }
        },

        toggleGoldAsCow: function() { 
            if (this.goldAsCow) {
                this.goldAsCow = false;
                dojo.removeClass(BTN_ID_GOLD_COW, 'bgabutton_blue');
                dojo.addClass(BTN_ID_GOLD_COW, 'bgabutton_red');
                dojo.addClass('cow_as', 'no');
            } else {
                this.goldAsCow = true;
                dojo.removeClass(BTN_ID_GOLD_COW, 'bgabutton_red');
                dojo.addClass(BTN_ID_GOLD_COW, 'bgabutton_blue');
                dojo.removeClass('cow_as', 'no');
            }
            if (LAST_SELECTED.building != ""){
                this.createBuildingBreadcrumb();
            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/doNotBuild.html", {lock: true}, this, 
                function( result ) { 
                    this.clearSelectable('building', true); 
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.setupUndoTransactionsButtons();
                }, function( is_error) { } );
            }
        },

        updateScore: function (p_id, score_left, score_right = null) {
            if (p_id in SCORE_LEFT_COUNTER){    // when we have their resources.
                SCORE_LEFT_COUNTER[p_id].setValue(score_left);
            } else if (this.scoreCtrl[p_id] != undefined){ // non-active player in `dont-show resources`
                this.scoreCtrl[p_id].setValue(score_left);
            }
            if (score_right == null){   // hide this for end game or not included etc.
                dojo.query(`player_total_score_${p_id}`).addClass('noshow');
            } else if (score_right!=null){ //otherwise update it.
                dojo.query(`player_total_score_${p_id}`).removeClass('noshow');
                SCORE_RIGHT_COUNTER[p_id].setValue(score_right);
            }
            
        },

        calculateAndUpdateScore: function(p_id) {
            var bld_arr = this.calculateBuildingScore(p_id);
            let bld_score = bld_arr.static + bld_arr.bonus
            let left_score = bld_score;
            var right_score = null;
            let row_Vp = this.replaceTooltipStrings(_("${vp} tokens:"));
            let row_BldSt = this.replaceTooltipStrings(_("${vp} from buildings (static)"));
            let row_BldBo = this.replaceTooltipStrings(_("${vp} from buildings (bonus)"));
            let row_GlCwCp = this.replaceTooltipStrings(_("${vp} from ${gold}${cow}${copper}")); 
            let row_loan = this.replaceTooltipStrings(_("${vp} from ${loan}"));
            let row_total = this.replaceTooltipStrings(_("${vp} Total"));
            let row_subTotal = this.replaceTooltipStrings(_("${vp} Subtotal"));

            if (this.show_player_info || p_id == this.player_id){
                let vp_pts     = BOARD_RESOURCE_COUNTERS[p_id]['vp'].getValue();
                let gold_pts   = BOARD_RESOURCE_COUNTERS[p_id]['gold'].getValue() * 2;
                let cow_pts    = BOARD_RESOURCE_COUNTERS[p_id]['cow'].getValue()  * 2;
                let copper_pts = BOARD_RESOURCE_COUNTERS[p_id]['copper'].getValue() * 2;
                let glCwCp_pts = gold_pts + cow_pts + copper_pts;
                let loan_count = BOARD_RESOURCE_COUNTERS[p_id]['loan'].getValue();
               
                let loan_pts = 0;
                for (let i =1; i <= loan_count; i++){
                    loan_pts -= (i);
                }
                let score_noLoan = bld_score + vp_pts + gold_pts + cow_pts + copper_pts;
                total_score = score_noLoan + loan_pts;
                if (this.show_player_info){
                    var tt_right = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{   
                        row_1:row_Vp,     val_1:vp_pts,
                        row_2:row_BldSt,  val_2:bld_arr.static,
                        row_3:row_BldBo,  val_3:bld_arr.bonus,
                        row_4:row_GlCwCp, val_4:glCwCp_pts,
                        row_5:row_loan,   val_5:loan_pts,
                        row_6:row_total,  val_6:total_score,
                    });
                    var tt_left = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><th>${row_5}</th><th>${val_5}</th></tr>'+
                    '<tr><td>${row_6}</td><td>${val_6}</td></tr><tr><th>${row_7}</th><th>${val_7}</th></tr></table></div>',{
                        row_1:row_Vp,       val_1:vp_pts,
                        row_2:row_BldSt,    val_2:bld_arr.static,
                        row_3:row_BldBo,    val_3:bld_arr.bonus,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_subTotal, val_5:score_noLoan,
                        row_6:row_loan,     val_6:loan_pts,
                        row_7:row_total,    val_7:total_score,
                    });
                    left_score = score_noLoan;
                    right_score = total_score;
                } else { //this player in don't show resources game.
                    var tt_left = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><th>${row_3}</th><th>${val_3}</th></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{   
                        row_1:row_BldSt,    val_1:bld_arr.static,
                        row_2:row_BldBo,    val_2:bld_arr.bonus,
                        row_3:row_subTotal, val_3:bld_score,
                        row_4:row_Vp,       val_4:vp_pts,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_loan,     val_5:loan_pts,
                        row_6:row_total,    val_6:total_score,
                    });
                    var tt_right = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{
                        row_1:row_BldSt,    val_1:bld_arr.static,
                        row_2:row_BldBo,    val_2:bld_arr.bonus,
                        row_3:row_Vp,       val_3:vp_pts,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_loan,     val_5:loan_pts,
                        row_6:row_total,    val_6:total_score,
                    });
                    left_score = bld_score;
                    right_score = total_score;
                }
                this.addTooltipHtml(`p_score_${p_id}`, tt_left);
                this.addTooltipHtml(`player_total_score_${p_id}`, tt_right); 
            } else {
                let tt = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><th>${row_3}</th><th>${val_3}</th></tr>'+
                '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+ 
                '<tr><td>${row_6}</td><td>${val_6}</td></tr></table></div>',{
                    row_1:row_BldSt,    val_1:bld_arr.static,
                    row_2:row_BldBo,    val_2:bld_arr.bonus,
                    row_3:row_subTotal, val_3:bld_score,
                    row_4:row_Vp,       val_4:_("???"),
                    row_5:row_GlCwCp,   val_5:_("???"),
                    row_6:row_loan,     val_6:_("???"),});
                this.addTooltipHtml(`player_score_${p_id}`, tt);
            }
            this.updateScore(p_id, left_score, right_score);
        },

        calculateBuildingScore: function(p_id) {
            let static = 0;
            let bld_type = [0,0,0,0,0,0,0];// count of bld of types: [res,com,ind,spe]
            let vp_b =     [0,0,0,0,0,0,0];//vp_b [Res, Com, Ind, Spe, Wrk, Trk, Bld]
            for(let b_id in HAS_BUILDING[p_id]){
                if (BUILDING_INFO[b_id].vp){
                    static += BUILDING_INFO[b_id].vp;
                }
                if ('vp_b' in BUILDING_INFO[b_id]){
                    if (BUILDING_INFO[b_id].vp_b == VP_B_WRK_TRK){
                        vp_b[VP_B_WORKER] ++;
                        vp_b[VP_B_TRACK] ++;
                    } else {
                        vp_b[BUILDING_INFO[b_id].vp_b]++;
                    }
                }
                bld_type[BUILDING_INFO[b_id].type] ++;
                bld_type[VP_B_BUILDING]++;
            }
            
            bld_type[VP_B_WORKER] = this.getPlayerWorkerCount(p_id);
            bld_type[VP_B_TRACK] = this.getPlayerTrackCount(p_id);
            let bonus = 0;
            for (let i in vp_b){
                bonus += (bld_type[i] * vp_b[i]);
            }
            return {static:static, bonus:bonus};
        },

        getPlayerWorkerCount:function(p_id){
            const playerZone = `player_zone_${PLAYER_COLOR[p_id]}`;
            const workerSelector = TYPE_SELECTOR['worker'];
            return dojo.query(`#${playerZone} ${workerSelector}`).length;
        },

        getPlayerTrackCount:function(p_id){
            const playerZone = `player_zone_${PLAYER_COLOR[p_id]}`;
            const trackSelector = TYPE_SELECTOR['track'];
            return dojo.query(`#${playerZone} ${trackSelector}`).length;
        },

        /***** Building Bonus *****/

        workerForFreeBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/freeHireWorkerBuilding.html", {lock: true}, this, 
            function( result ) { }, 
            function( is_error) { } );}
        },
        
        passBuildingBonus: function (){
            if (this.checkAction( 'buildBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/passBuildingBonus.html", {lock: true}, this, 
                function( result ) { }, 
                function( is_error) { } );
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
            this.resetTradeValues();
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
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/freeHireWorkerAuction.html", {lock: true }, this, 
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
                if (TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
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
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/bonusTypeForType.html", args, this, function( result ) { 
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
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/passAuctionBonus.html", {lock: true}, this, 
                function( result ) { 
                    this.clearTransactionLog();
                    this.disableTradeIfPossible();
                    this.resetTradeValues();
                    this.disableTradeBoardActions();
                    this.setupUndoTransactionsButtons(); }, 
                function( is_error) { } ); 
            }
        },

        /***** endBuildRound *****/
        confirmBuildPhase: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/confirmChoices.html", {lock: true}, this, 
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
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Pay Dept"), tradeAway, tradeFor);

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP.payloan_silver);
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        payLoanGold: function () {
            if (!this.checkAction( 'payLoan' )){return;}
            let tradeChange = {'gold':-1,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {'gold':-1};
                let tradeFor = {'loan':-1};
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Pay Dept"), tradeAway, tradeFor);

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP.payloan_gold);
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            }
        },

        cancelUndoTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/undoTransactions.html", {lock: true}, this, 
                function( result ) {
                this.resetTradeValues();
                this.disableTradeIfPossible();
                if (this.currentState == 'allocateWorkers'){
                    this.setOffsetForIncome();
                }
                }, function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                if(TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.resetTradeValues();
                        this.ajaxDoneEndgame();
                     }, function( is_error) {}); 
                } else {
                    this.ajaxDoneEndgame();
                }
                
            }
        },

        ajaxDoneEndgame: function ( ){
            this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/doneEndgameActions.html", {lock: true}, this, 
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
                ['gainWorker', 20],
                ['gainTrack', 20],
                ['loanPaid', 500],
                ['loanTaken', 500],
                ['moveBid', 250],
                ['moveFirstPlayer', 100],
                ['playerIncome', 20],
                ['playerIncomeGroup', 50],
                ['playerPayment', 20],
                ['playerPaymentGroup', 50],
                ['railAdv', 25],
                ['score', 2000],
                ['showResources', 25],
                ['trade', 20],
                ['updateBuildingStocks', 100],
                ['workerMoved', 5],
                ['workerPaid', 20],
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
                    
                    if (!this.isSpectator){
                        args.You = this.divYou(); // will replace ${You} with colored version
                    }
                    let copyArgs = this.copyArray(args);
                    //console.log(log, copyArgs , args);
                    // begin legacy (extra) so existing logs will mostly work, (can remove in July)
                    if (args.track && typeof args.track == 'string'){
                        args.track = TOKEN_HTML.track;
                    }
                    if (args.resources && !args.resource_arr){
                        args.resource_arr = args.resources;
                        args.resources = this.getResourceArrayHtml(args.resource_arr);
                    }
                    if (args.token){
                        let color = '';
                        let type = '';
                        if ( typeof(args.token) != "string"){
                            if (args.token.color) {
                                color = args.token.color;
                            } else {
                                color = PLAYER_COLOR[args.token.player_id];
                            }
                            if (args.token.type) {
                                type = args.token.type;
                            }
                        }
                        if (args.color) {
                            color = args.color;
                        } else {
                            type = args.token.token;
                            color = PLAYER_COLOR[args.player_id];
                        }
                        args.token = this.format_block('jstpl_player_token_log', {"color" : color, "type" : type});
                    }
                    if (args.building_name && typeof (args.building_name) != "string"){
                        args.b_type = args.building_name.type;
                        args.building_name = args.building_name.str;
                    }
                    if (args.auction && typeof (args.auction) != 'string'){
                        args.key = Number(args.auction.key);
                        args.auction = args.auction.str;
                    }
                    if (args.tradeFor && typeof (args.tradeFor) != 'string'){
                        args.tradeFor_arr = args.tradeFor;
                    }
                    if (args.tradeAway && typeof (args.tradeAway) != 'string'){
                        args.tradeAway_arr = args.tradeAway;
                    }
                    if (args.type && typeof (args.type) != 'string'){
                        if (args.type.amount == null){
                            args.amount = 1;
                        } else {
                            args.amount = args.type.amount;
                        }
                        args.type = args.type.type;
                    }

                    // legacy, so existing logs will mostly work, (can remove in July)
                    if (args.reason_string && typeof (args.reason_string) != "string"){
                        if (args.reason_string.type){ //Building & Auctions
                            let color = ASSET_COLORS[Number(args.reason_string.type)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string.str, color:color});
                        } else if (args.reason_string.token) { // player_tokens (bid/train)
                            const color = PLAYER_COLOR[args.reason_string.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string.token});
                        } else if (args.reason_string.worker) { // worker token
                            args.reason_string = this.getOneResourceHtml('worker', 1, false);
                        } else if (args.reason_string.track) { // track 
                            args.reason_string = TOKEN_HTML.track;
                        }
                        // end legacy translators.
                    } else if (args.reason_string){
                        if (args.origin == "building" ){
                            let color = ASSET_COLORS[Number(args.b_type??0)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string, color:color});
                        } else if (args.origin == "auction"){
                            let color = ASSET_COLORS[Number(args.key??0)+10];
                            args.reason_string = this.format_block('jstpl_color_number_log', {string:_('AUCTION '), color:color, number:args.key});
                        } else if (args.reason_string == 'train' || args.reason_string == 'bid') { // player_tokens (bid/train)
                            let color = PLAYER_COLOR[args.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string});
                        } else if (args.reason_string == 'worker') { // worker token
                            args.reason_string = TOKEN_HTML.worker;
                        } else if (args.reason_string == 'track') { // track 
                            args.reason_string = TOKEN_HTML.track;
                        }   
                    }
                   

                    // begin -> resource args
                    // only one type of resource.
                    if (args.type){
                        if (args.amount == null){
                            args.amount = 1;
                        }
                        args.typeStr = args.type;
                        args.type = this.getOneResourceHtml(args.type, args.amount, false);
                    }
                    // multiple types of resources 
                    // legacy
                    if (typeof(args.tradeAway) != 'string' && !args.tradeAway_arr){
                        args.tradeAway_arr = args.tradeAway;
                    }
                    if (args.tradeAway && args.tradeAway_arr){
                        args.tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                    }
                    // legacy
                    if (typeof(args.tradeFor) != 'string' && !args.tradeFor_arr){
                        args.tradeFor_arr = args.tradeFor;
                    }
                    if (args.tradeFor && args.tradeFor_arr){
                        args.tradeFor = this.getResourceArrayHtml(args.tradeFor_arr);
                    }
                    
                    // trade 
                    if (args.resource && args.tradeFor_arr && args.tradeAway_arr){
                        let tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                        let tradeFor  = this.getResourceArrayHtml(args.tradeFor_arr);
                        let arrow = TOKEN_HTML.arrow;
                        args.resource = tradeAway + " " + arrow + " " + tradeFor;
                    } 
                    if (args.resources && args.resource_arr){
                        args.resources = this.getResourceArrayHtml(args.resource_arr);
                    }
                    // end -> resource args

                    // begin -> specific token args 
                    if (args.arrow){
                        args.arrow = TOKEN_HTML.arrow;
                    }
                    if (args.track){
                        args.track = TOKEN_HTML.track;
                    }
                    if (args.loan){
                        args.loan = TOKEN_HTML.loan;
                    }
                    if (args.worker){
                        args.worker = TOKEN_HTML.worker;
                    }
                    if (args.train){
                        args.train = this.format_block('jstpl_player_token_log', {"color" : PLAYER_COLOR[args.player_id], "type" :'train'});
                    }
                    if (args.bid){
                        let color = PLAYER_COLOR[args.player_id];
                        args.bid = this.format_block('jstpl_player_token_log', {"color" : color, "type" : 'bid'});
                    }
                    
                    // end -> specific token args

                    /* formats args.building_name to have the building Color by type, 
                     * and add resources if cost included.
                     */
                    if (args.building_name && args.b_type){
                        let color = ASSET_COLORS[Number(args.b_type??0)];
                        args.building_name = this.format_block('jstpl_color_log', {string:args.building_name, color:color});
                        if (args.resource_arr){
                            args.building_name += TOKEN_HTML.arrow + " " + this.getResourceArrayHtml(args.resource_arr);
                        }
                    }
                    if (args.bidVal){
                        let color = ASSET_COLORS[Number(args.key??0)+10]??'';
                        args.bidVal = this.format_block('jstpl_color_log', {string:"$"+args.bidVal, color:color + ' biggerFont'});
                    }
                    // this will always set `args.auction` (allowing it to be used in the Title)
                    if (args.auction){
                        let color = ASSET_COLORS[Number(args.key)+10]??'';
                        args.auction = this.format_block('jstpl_color_number_log', {string:_("AUCTION "), color:color, number:args.key});
                    } else {
                        let color = ASSET_COLORS[Number(this.current_auction)+10]??'';
                        args.auction = this.format_block('jstpl_color_number_log', {color:color, string:_("AUCTION "), number:this.current_auction});
                    }
                    // end -> add font only args              
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
                var tokenDiv = TOKEN_HTML[type];
                for(let i=0; i < amount; i++){
                    resString += `${tokenDiv}`;
                }
            }
            return resString + `</${html_type}>`;
        },

        getResourceArrayHtmlBigVp: function (array ={}, asSpan=false) {
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container">`;
            for (let i in RESOURCE_ORDER){
                let type = RESOURCE_ORDER[i];
                if (!(type in array)) continue;
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    if (type == 'vp' || VP_TOKENS.includes(type)) {
                        var tokenDiv = TOKEN_HTML["bld_"+type_no];
                    } else {
                        var tokenDiv = TOKEN_HTML[type_no];
                    }
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        getResourceArrayHtml: function( array={}, asSpan=false, style=""){
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container" style="${style}">`;
            for (let i in RESOURCE_ORDER){
                let type = RESOURCE_ORDER[i];
                if (!(type in array)) continue;
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    var tokenDiv = TOKEN_HTML[type];
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
                this.moveObjectAndUpdateValues(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            } else {
                this.moveObject(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            }
        },

        notif_railAdv: function( notif ){
            //console.log('notif_railAdv');
            const train_token = TRAIN_TOKEN_ID[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        notif_gainWorker: function( notif ){
            //console.log('notif_gainWorker', notif);
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_worker', {id: notif.args.worker_key}), WORKER_TOKEN_ZONE[notif.args.player_id] );
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers"){
                    dojo.addClass(worker_divId, 'selectable');
                    this.resetTradeValues();
                    this.setOffsetForIncome();
                }                
            }
            this.calculateAndUpdateScore(notif.args.player_id);
        },

        notif_workerPaid: function( notif ){
            this.showPay = false;
            let buttons = dojo.query(`#generalactions a`);
            for (let btn in buttons){
                if (buttons[btn].id){
                    this.fadeOutAndDestroy(buttons[btn].id);
                }
            }
            this.resetTradeValues();
        },

        notif_gainTrack: function( notif ){
            //console.log('notif_gainTrack');
            const p_id = Number(notif.args.player_id);
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: PLAYER_COLOR[Number(notif.args.player_id)]}),
                    TRACK_TOKEN_ZONE[p_id]);
            this.addTooltipHtml(`token_track_${notif.args.track_key}`, `<div style="text-align:center;">${this.replaceTooltipStrings(_(RESOURCE_INFO['track']['tt']))}</div>`);
            if (notif.args.tradeAway_arr){
                var destination = this.getTargetFromNotifArgs(notif);
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( TOKEN_HTML[type], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 100*i );
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
                this.moveObject(tile_id, PLAYER_SCORE_ZONE_ID[p_id]);
                this.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in PLAYER_COLOR){
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
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], destination , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            if (p_id == this.player_id){
                this.hideResources();
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerIncome: function( notif ){
            //console.log('notif_playerIncome');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( TOKEN_HTML[String(notif.args.typeStr)], 'limbo', start , PLAYER_SCORE_ZONE_ID[p_id] , 500 , 100*i );
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
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', start , PLAYER_SCORE_ZONE_ID[p_id] , 500 , 100*(delay++) );
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
                this.slideTemporaryObject( TOKEN_HTML[notif.args.typeStr], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 100*i );
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
                        this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], destination , 500 , 100*(delay++) );
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
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], TRADE_BOARD_ID , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', TRADE_BOARD_ID, PLAYER_SCORE_ZONE_ID[p_id], 500 , 100*(delay++) );
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
                this.resetTradeValues();
            this.calculateAndUpdateScore(p_id);
        },

        notif_loanPaid: function( notif ){
            //console.log('notif_loanPaid');
            const p_id = notif.args.player_id;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 0 );
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', -1);
            }
            if (notif.args.type ){
                if (notif.args.typeStr == 'gold'){
                    this.slideTemporaryObject( notif.args.type , 'limbo', PLAYER_SCORE_ZONE_ID[p_id], 'board', 500, 100);
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'gold', -1);
                    }
                } else {
                    for (let i = 0; i < 5; i++){
                        this.slideTemporaryObject( notif.args.type, 'limbo', PLAYER_SCORE_ZONE_ID[p_id], 'board', 500, 100 +(i*100)); 
                    }
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'silver', -5);
                    }
                }
            }
            if (p_id == this.player_id){
                this.resetTradeValues();
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_loanTaken: function( notif ){
            //console.log('notif_loanTaken');
            const p_id = notif.args.player_id;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', PLAYER_SCORE_ZONE_ID[p_id],  500 , 0 );
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 100);
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 200);
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', 1);
                this.incResCounter(p_id, 'silver', 2);
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_score: function( notif ){
            //console.log('notif_score', notif);
            const p_id = notif.args.player_id;
            this.scoreCtrl[p_id].setValue(0);
            for(let b_key in notif.args.building){
                const building = notif.args.building[b_key];
                var bld_score = 0;
                if (building.static && Number(building.static) >0){
                    bld_score += Number(building.static);
                } 
                if (building.bonus && Number(building.bonus) >0){
                    bld_score += Number(building.bonus);
                }
                this.displayScoring( `${TPL_BLD_TILE}_${b_key}`, PLAYER_COLOR[notif.args.player_id], bld_score, 2000 );
                this.scoreCtrl[p_id].incValue(bld_score);
            } 
            dojo.place(`<div id="score_grid_${p_id}" class="score_grid"></div>`, PLAYER_SCORE_ZONE_ID[p_id]);
            for(let type in notif.args.resource){
                const amt = notif.args.resource[type];
                this.scoreCtrl[p_id].incValue(amt);
            }
            this.updateScore(p_id, score);
        },

        notif_showResources: function( notif ){
            //console.log('notif_showResources');
            //console.log(notif);
            if (this.show_player_info) return;// already showing player resources.
            this.show_player_info = true;
            for(let p_id in notif.args.resources){
                if (this.isSpectator || (this.player_id != p_id)){
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), PLAYER_SCORE_ZONE_ID[p_id] );
                    dojo.query(`#player_resources_${PLAYER_COLOR[p_id]} .player_resource_group`).removeClass('noshow');
                    this.setupOnePlayerResources(notif.args.resources[p_id]);
                }
                this.calculateAndUpdateScore(p_id);
            }
        },

        notif_cancel: function( notif ){
           //console.log('notif_cancel', notif);
            const p_id = notif.args.player_id;
            const updateResource = (p_id == this.player_id) || this.show_player_info;
            const player_zone = PLAYER_SCORE_ZONE_ID[p_id];
            var delay = 0;
            // update values as undone
            for (let i in notif.args.actions){
                let log = notif.args.actions[i];
                switch (log.action){
                    case 'build':
                        this.cancelBuild(log.building);
                        if (updateResource){
                            for(let type in log.cost){
                                let amt = log.cost[type];
                                for(let j = 0; j < amt; j++){
                                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', player_zone, 'board' , 500 , 50*(delay++) );
                                    this.incResCounter(p_id,type,1);
                                }   
                            }
                        }
                        this.updateBuildingAffordability();
                    break;
                    case 'gainWorker':
                        this.fadeOutAndDestroy(`token_worker_${log.w_key}`);
                    break;
                    case 'gainTrack':
                        this.fadeOutAndDestroy(`token_track_${log.t_key}`);
                    break;
                    case 'loan':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , player_zone, 'board', 500 , 50 * (delay++) );
                        this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
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
                        if (log.type){
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo', player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'railAdv':
                        const train_token = TRAIN_TOKEN_ID[p_id];
                        const parent_no = $(train_token).parentNode.id.split("_")[2];
                        this.moveObject(train_token, `train_advancement_${(parent_no-1)}`);
                    break;
                    case 'trade':
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', player_zone, TRADE_BOARD_ID , 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, 1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', TRADE_BOARD_ID, player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, -1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
                        if (log.amt < 0){
                            for(let j = 0; j < Math.abs(log.amt); j++){
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo' , player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, -1);
                                }
                            }
                        } else {
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo', 'board', player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'passBid':
                        this.moveBid(p_id, log.last_bid);
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

        fillArray: function (targetArray, fromArray){
            for (let i in fromArray){
                targetArray[i]=fromArray[i];
            }
        },
        /**
         * make all positive values in array negative, and all negative values positive.
         * @param {object} array 
         */
        invertArray: function( array){
            let new_array = {};
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

        getKeyByValue: function (object, value) {
            return Object.keys(object).find(key => object[key] === value);
        },

   });             
});
