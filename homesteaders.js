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

    const ZONE_PENDING = -1;
    const ZONE_PASSED = -2;

    const BLD_LOC_FUTURE  = 0;
    const BLD_LOC_OFFER   = 1;
    const BLD_LOC_PLAYER  = 2;
    const BLD_LOC_DISCARD = 3;
    const AUC_LOC_FUTURE  = 2;

    // building ID's required for trade
    const BLD_MARKET = 7;
    const BLD_BANK   = 22;

    // string templates for dynamic assets
    const TPL_BLD_TILE = "building_tile";
    const TPL_BLD_STACK = "building_stack_";
    const TPL_BLD_ZONE = "building_zone_";
    const TPL_AUC_TILE = "auction_tile";
    const TPL_AUC_ZONE = "auction_tile_zone_";

    const FIRST_PLAYER_ID = 'first_player_tile';
    const CONFIRM_TRADE_BTN_ID = 'confirm_trade_btn';
    const UNDO_TRADE_BTN_ID = 'undo_trades_btn';

    // arrays for the map between toggle buttons and show/hide zones 
    const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld'];
    const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard'];
    const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container'];
    const TILE_ZONE_DIVID   = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone'];
    
    const TRADE_BOARD_ID = 'trade_board';
    const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
    'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option'};
    

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
    const ASSET_COLORS = {0:'res', 1:'com', 2:'ind', 3:'spe',
                          10:'a4' ,11:'a1',12:'a2',13:'a3'};
    const VP_TOKENS = ['vp2', 'vp3', 'vp4','vp6','vp8'];

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['First', 'Second', 'Third', 'Fourth'];

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
            this.train_token_divId = [];
            this.auction_ids = [];

            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();
            this.roundCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_building_zone_id = [];
            this.player_building_zone = [];
                        
            // storage for buildings
            this.main_building_counts = []; // counts of each building_id in main zone. for use by update Buildings methods.
            
            this.building_worker_ids = [];
            this.resourceCounters = []; // This player's resource counters

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
            this.isTop = false;

            this.b_connect_handler = [];
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
            this.isSpectator = true;
            this.playerCount = 0;
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.playerCount++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            if (!this.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                this.setupPlayerResources(gamedatas.player_resources, gamedatas.resource_info);
                this.setupUseSilverCheckbox(gamedatas.players[this.player_id]['use_silver']);
            } else {
                // when displaying for a spectator remove the player config checkbox.
                dojo.destroy('useSilver_form');
            }
            if (this.playerCount == 2){
                this.player_color[DUMMY_BID] = this.getAvailableColor();
                this.player_color[DUMMY_OPT] = this.player_color[0];
            }
            this.omitImages();
            this.res_info = gamedatas.resource_info;
            this.building_info = gamedatas.building_info;

            // Auctions: 
            this.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings, gamedatas.building_info);
            
            this.setupTracks(gamedatas.tracks);
            

            dojo.place(FIRST_PLAYER_ID, this.player_building_zone_id[gamedatas.first_player]);
            this.first_player = Number(gamedatas.first_player);
            this.addTooltip( FIRST_PLAYER_ID, _('First Player'), '' ); 
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones();
            this.setupBidTokens(gamedatas.bids);

            this.setupRailLines(gamedatas.players);
            this.setupTradeButtons(gamedatas.can_undo_trades);
            this.setupBonusButtons(gamedatas.resource_info);
            this.setupShowButtons();
            this.roundCounter.create('round_number');
            this.roundCounter.setValue( gamedatas.round_number);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);
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
                this.isSpectator = false;
            } 
            this.player_color[p_id] = current_player_color;
            this.token_divId[p_id]  = 'token_zone_' + current_player_color;
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
            let next_pId = this.player_id;    
            for (let i = 0; i < this.playerCount; i++){
                dojo.place(`player_zone_${this.player_color[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
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
         * @param {*} resources 
         * @param {*} info 
         */
        setupPlayerResources: function (resources, info){
            for (const [key, value] of Object.entries(resources)) {
                if (key == "p_id") continue;
                let resourceId = `${key}count_${resources.p_id}`;
                let iconId = `${key}icon_p${resources.p_id}`;
                this.resourceCounters[key] = new ebg.counter();
                this.resourceCounters[key].create(resourceId);
                this.resourceCounters[key].setValue(value);
                this.addTooltipHtml( resourceId, info[key]['tt'] );
                this.addTooltipHtml( iconId, info[key]['tt'] );
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
            this.addTooltipHtmlToClass("token_track", this.res_info['track']['tt']);
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
            if (!(b_info.hasOwnProperty('slot'))) return;
            const b_divId = `${TPL_BLD_TILE}_${key}`;
            if (b_info.slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][1] = `slot_${key}_1`;
                this.addTooltipHtml(  this.building_worker_ids[key][1], b_info['s1_tt'] );
                dojo.connect($(this.building_worker_ids[key][1]), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (b_info.slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: key, id: id}), b_divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][1] = `slot_${key}_1`;
                this.building_worker_ids[key][2] = `slot_${key}_2`;
                this.addTooltipHtml( this.building_worker_ids[key][1], b_info['s1_tt'] );
                this.addTooltipHtml( this.building_worker_ids[key][2], b_info['s2_tt'] );
                dojo.connect($(this.building_worker_ids[key][1]), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(this.building_worker_ids[key][2]), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (b_info.slot == 3){
                // currently
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: key, id: id}), b_divId);
                this.building_worker_ids[key] = [];
                this.building_worker_ids[key][3] = `slot_${key}_3`;
                this.addTooltipHtml( this.building_worker_ids[key][3], b_info['s3_tt'] );
                dojo.style(this.building_worker_ids[key][3], 'max-width', `${(this.worker_width*1.5)}px`);
                dojo.connect($(this.building_worker_ids[key][3]), 'onclick', this, 'onClickOnWorkerSlot');
            }
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
         * connects click actions to buttons for selecting Trade actions (on trade board), 
         * 
         * it also will assign click action to the button for approve trade/undo transactions.
         * it will also unhide the undo transactions buttons if it is possible to take that action.
         * @param {boolean} can_undo_trades 
         */
        setupTradeButtons: function(can_undo_trades){
            const options = dojo.query(`#${TRADE_BOARD_ID} .trade_option`);
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

        /**
         * Connects click actions to the bonus actions for get Rail advancement action.
         * 
         * @param {*} resource_info 
         */
        setupBonusButtons: function(resource_info){
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
            if (tile_count.length == 0){
                dojo.addClass(TOGGLE_BTN_ID[index], 'noshow');
            } else if (dojo.hasClass(TOGGLE_BTN_ID[index], 'noshow')){
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
            
            switch( stateName )
            {
                case 'startRound':
                    this.setupTiles (args.args.round_number, 
                        args.args.auctions);  
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
                    break;
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                    this.clearSelectable('building', true);
                    this.hideUndoTransactionsButtonIfPossible();
                    this.disableTradeIfPossible();
                    break;
                case 'allocateWorkers':
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.hideUndoTransactionsButtonIfPossible();
                    this.disableTradeIfPossible();
                case 'payAuction':
                case 'bonusChoice':
                case 'payWorkers':
                    this.hideUndoTransactionsButtonIfPossible();
                    this.disableTradeIfPossible();
                    break;
                case 'endBuildRound':
                    this.clearAuction();
                    break;
                case 'getRailBonus':
                    this.clearSelectable('bonus', true);
                    const active_train = this.train_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_train, 'animated');
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
                        this.addActionButton( 'btn_done',       _('Done'), 'donePlacingWorkers' );
                        this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
                        this.addTradeLoanButtons();
                    break;
                    case 'payWorkers':    
                        this.silverCost = Number(args.worker_counts[this.player_id].workers);
                        this.goldAmount = 0;
                        this.addPaymentButtons();
                        this.addTradeLoanButtons();
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
                        this.addTradeLoanButtons();
                    break;
                    case 'chooseBuildingToBuild':
                    case 'trainStationBuild':
                        this.showTileZone(BLD_LOC_OFFER);
                        this.last_selected['building']="";
                        //mark buildings as selectable
                        for(let i in args.allowed_buildings){
                            const building = args.allowed_buildings[i];
                            const building_divId = `${TPL_BLD_TILE}_${building.building_key}`;
                            dojo.addClass(building_divId, 'selectable');
                        }
                        this.addActionButton( 'btn_choose_building', _('Build'),     'chooseBuilding');
                        if (args.riverPort){
                            if (this.goldAsCow){
                                this.addActionButton( 'btn_gold_cow', tkn_gold +" <span id='cow_as'>"+_('As')+"</span> " + tkn_cow, 'toggleGoldAsCow', null, false, 'blue');
                            } else {
                                this.addActionButton( 'btn_gold_cow', tkn_gold +" <span id='cow_as' class='no'>"+_('As')+"</span> " + tkn_cow, 'toggleGoldAsCow', null, false, 'red');
                            }
                            if (this.goldAsCopper){
                                this.addActionButton( 'btn_gold_copper', tkn_gold + " <span id='copper_as'>" + _('As') + "</span> " + tkn_copper, 'toggleGoldAsCopper', null, false, 'blue');
                            } else {
                                this.addActionButton( 'btn_gold_copper', tkn_gold + " <span id='copper_as' class='no'>" + _('As') + "</span> " + tkn_copper, 'toggleGoldAsCopper', null, false, 'red');
                            }
                        }
                        this.addActionButton( 'btn_do_not_build', _('Do Not Build'), 'doNotBuild', null, false, 'red');
                        this.addTradeLoanButtons();
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                    break;
                    case 'resolveBuilding':
                        if (args.building_bonus == BUILD_BONUS_WORKER){
                            this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ tkn_worker, 'workerForFreeBuilding');
                            this.addActionButton( 'btn_pass_bonus',   _('Do Not Get Bonus'), 'passBuildingBonus', null, false, 'red');
                            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
                        } //currently only bonus involving a choice is hire worker.
                    break;
                    case 'bonusChoice':
                        const option = Number(args.auction_bonus);
                        switch (option){
                            case AUCBONUS_WORKER:
                            case AUCBONUS_WORKER_RAIL_ADV:
                                this.addActionButton( 'btn_bonus_worker', _('(FREE) Hire ')+ tkn_worker , 'workerForFree');
                            break;
                            case AUCBONUS_WOOD_FOR_TRACK:
                                this.addActionButton( 'btn_wood_track', `${tkn_wood} ${tkn_arrow} ${tkn_track}`, 'woodForTrack');
                            break;
                            case AUCBONUS_COPPER_FOR_VP:
                                this.addActionButton( 'btn_copper_vp', `${tkn_copper} ${tkn_arrow} ${tkn_vp4}`, 'copperFor4VP');
                                if (args.riverPort){
                                    this.addActionButton( 'btn_gold_copper', `${tkn_gold} ${tkn_arrow} ${tkn_vp4}`, 'goldFor4VP');
                                }
                                break;
                            case AUCBONUS_COW_FOR_VP:
                                this.addActionButton( 'btn_cow_vp', `${tkn_cow} ${tkn_arrow} ${tkn_vp4}`, 'cowFor4VP');
                                if (args.riverPort){
                                    this.addActionButton( 'btn_gold_cow', `${tkn_gold} ${tkn_arrow} ${tkn_vp4}`, 'goldFor4VP');
                                }
                                break;
                            case AUCBONUS_6VP_AND_FOOD_VP:
                            case AUCBONUS_FOOD_FOR_VP:
                                this.addActionButton( 'btn_food_vp', `${tkn_food} ${tkn_arrow} ${tkn_vp2}`, 'foodFor2VP');
                                break;
                        }
                        this.addActionButton( 'btn_pass_bonus',       _('Do Not Get Bonus'), 'passBonus', null, false, 'red');
                        this.addTradeLoanButtons();
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),           'cancelTurn', null, false, 'red');
                    break;
                    case 'confirmActions':
                        this.addActionButton( 'btn_done',             _('Confirm'),  'confirmBuildPhase');
                        this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
                    break;
                    case 'endGameActions':
                        this.addActionButton( 'btn_done',          _('Done'),                    'doneEndgameActions');    
                        this.addActionButton( 'btn_pay_loan_silver', _('Pay Loan ') + tkn_silver, 'payLoanSilver', null, false, 'gray');
                        this.addActionButton( 'btn_pay_loan_gold',   _('Pay Loan ') + tkn_gold,   'payLoanGold',   null, false, 'gray');
                        this.addTradeLoanButtons();
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

        setupAuctionTiles: function (auctions, info){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location !=AUCLOC_DISCARD) {
                    let color = ASSET_COLORS[10+Number(auction.location)];
                    dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), `future_auction_${auction.location}`);
                    dojo.style(`${TPL_AUC_TILE}_${a_id}`, 'order', a_id);
                }
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, info[a_id]['tt']);
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
                this.addTooltipHtml( b_divId, b_info['tt'] );
                this.addBuildingWorkerSlots(building, b_info);
            }
            if (building.p_id == this.player_id){
                this.updateHasBuilding(b_id); 
            }
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
                this.addTooltipHtml( b_divId, b_info['tt'] );
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
            this.moveObject(b_divId, `building_stack_${building.b_id}`);
            this.main_building_counts[building.b_id]++;
            this.updateScoreForBuilding(building.p_id, building.b_id, false);
            if (this.player_id == building.p_id){//remove from hasBuilding
                this.hasBuilding.splice(building.b_id, 1); 
            }
            this.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
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

        showUndoTransactionsButtonIfPossible: function(){
            if (this.isCurrentPlayerActive()){
                dojo.removeClass(UNDO_TRADE_BTN_ID,'noshow');
            }
        },

        hideUndoTransactionsButtonIfPossible: function(){
            dojo.addClass(UNDO_TRADE_BTN_ID,'noshow');
        },
        
        disableTradeIfPossible: function() {
            if (dojo.query(`#${TRADE_BOARD_ID} .selectable`).length >0){
                // now make the trade options not selectable
                this.clearSelectable('trade', true);
                if (!dojo.hasClass(CONFIRM_TRADE_BTN_ID, 'noshow') ){
                    dojo.addClass( CONFIRM_TRADE_BTN_ID, 'noshow');
                }
                dojo.addClass('trade_bottom', 'trade_size');
                this.moveObjectAndUpdateClass(TRADE_BOARD_ID, 'trade_bottom', true, 'trade_top', 'noshow');
            }
        },

        enableTradeIfPossible: function() {
            if (!dojo.query(`#${TRADE_BOARD_ID} .selectable`).length >0){
                // make space for it, and move trade board to top.
                dojo.removeClass(`trade_top`, `noshow`);
                this.moveObjectAndUpdateClass(TRADE_BOARD_ID, 'trade_top', false, 'trade_bottom', 'trade_size');
                this.last_selected['trade']='';
                //make the trade options selectable
                dojo.query(`div#${TRADE_BOARD_ID} .trade_option:not([id^="trade_market"]):not([id^="trade_bank"])`).addClass('selectable');
                if (this.hasBuilding[BLD_MARKET] != null){
                    dojo.query(`#${TRADE_BOARD_ID} [id^="trade_market"]`).addClass('selectable');
                }
                if (this.hasBuilding[BLD_BANK] != null){
                    dojo.query(`#${TRADE_BOARD_ID} [id^="trade_bank"]').addClass('selectable`);
                }
            }
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
        addPaymentButtons: function(){
            this.addActionButton( 'btn_pay_done', _("Pay : ") +this.format_block("jstpl_pay_button", {}), 'donePay');
            this.silverCounter.create('pay_silver');
            this.silverCounter.setValue(this.silverCost);
            this.goldCounter.create('pay_gold');
            this.goldCounter.setValue(0);
            const tkn_gold = this.format_block( 'jstpl_resource_inline', {type:'gold'}); 
            this.addActionButton( 'btn_more_gold', _('More ') + tkn_gold, 'raiseGold', null, false, 'gray');
            this.addActionButton( 'btn_less_gold', _('Less ') + tkn_gold, 'lowerGold', null, false, 'gray');
            dojo.addClass( 'btn_less_gold', 'noshow');
            dojo.style( $('btn_less_gold'), 'display', 'none');
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost +=5;
            if (this.silverCost >0){
                dojo.removeClass( 'pay_silver',     'noshow');
                dojo.removeClass( 'pay_silver_tkn', 'noshow');
                dojo.removeClass( 'btn_more_gold',  'noshow');
                dojo.style( $('btn_more_gold'), 'display', 'inline-block');
                this.silverCounter.setValue(this.silverCost);
            }
            if(this.goldAmount == 0){
                dojo.addClass( 'btn_less_gold', 'noshow');
                dojo.addClass( 'pay_gold',      'noshow');
                dojo.addClass( 'pay_gold_tkn',  'noshow');            
                dojo.style( $('btn_less_gold'), 'display', 'none');
            }
        },

        raiseGold: function(){
            if (this.silverCost <0) return;
            dojo.removeClass( 'pay_gold',      'noshow');
            dojo.removeClass( 'pay_gold_tkn',  'noshow');
            dojo.removeClass( 'btn_less_gold', 'noshow');
            dojo.style( $('btn_less_gold'), 'display', 'inline-block');
            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= 5;
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            if (this.silverCost <= 0){
                dojo.addClass( 'pay_silver',     'noshow');
                dojo.addClass( 'pay_silver_tkn', 'noshow');
                dojo.addClass( 'btn_more_gold',  'noshow');
                dojo.style( $('btn_more_gold'), 'display', 'none');
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
        addTradeLoanButtons: function(){
            this.addActionButton( 'btn_trade', "<span id='tr_show'>"+_('Show')+"</span> "+_('Trade'), 'tradeActionButton', null, false, 'gray' );
            this.addActionButton( 'btn_take_loan', _('Take Loan'), 'takeLoan', null, false, 'gray' );
        },

        takeLoan: function(){
            if( this.checkAction( 'takeLoan')){
                this.ajaxcall( "/homesteaders/homesteaders/takeLoan.html", {lock: true}, this, 
                function( result ) {
                }, function( is_error) {} );     
            }
        },
        
        onSelectTradeAction: function( evt){
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            this.updateSelected('trade', evt.target.id);
            if (dojo.hasClass( evt.target.id ,'selected')){
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
             }, this, function( result ) {}, function( is_error) {});
        },

        undoTransactionsButton: function( ){
            if( this.checkAction( 'trade' ) ){
                this.ajaxcall( "/homesteaders/homesteaders/undoTransactions.html", { 
                    lock: true, 
                 }, this, function( result ) {
                    this.hideUndoTransactionsButtonIfPossible();
                 }, function( is_error) {});
            }
        },

        tradeActionButton: function(){
            if( this.checkAction( 'trade' ) ){
                // if trade options already displayed, set done.
                if (dojo.query(`#${TRADE_BOARD_ID} .selectable`).length >0){ 
                    this.disableTradeIfPossible();
                    dojo.addClass('btn_trade','bgabutton_gray');
                    dojo.removeClass('btn_trade','bgabutton_red');
                    $('tr_show').innerText= _('Show');
                    return;
                }
                this.enableTradeIfPossible();
                dojo.removeClass('btn_trade','bgabutton_gray');
                dojo.addClass('btn_trade','bgabutton_red');
                $('tr_show').innerText= _('Hide');
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
                const unassignedWorkers = dojo.query(`#token_zone_${this.player_color[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                this.showMessage( _("You must select 1 worker"), 'error' );
                    return;
                } else {
                    this.last_selected['worker'] = unassignedWorkers[0].id;
            }
        }
        if (document.querySelector(`#${target_divId} .worker_slot`)){
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
        
        /***** PAY WORKERS PHASE *****/
        donePay: function(){
            if( this.checkAction( 'done')){
                this.ajaxcall( "/homesteaders/homesteaders/donePay.html", {
                    gold: this.goldAmount, lock: true}, this, 
                function( result ) { 
                    //this.hidePaymentSection();
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
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/homesteaders/homesteaders/cancelTurn.html", {lock: true}, this, 
                function( result ) { }, function( is_error) { } ); 
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
                if (building_divId == "") {
                    this.showMessage( _("You must select 1 building"), 'error' );
                    return;
                }
                const building_key = Number(building_divId.split("_")[2]);
                this.ajaxcall( "/homesteaders/homesteaders/buildBuilding.html", 
                {building_key: building_key, goldAsCow:this.goldAsCow, goldAsCopper:this.goldAsCopper, lock: true}, this, 
                    function( result ) { }, function( is_error) { } );
            }
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

        updateScoreForBuilding: function (p_id, b_id, up=true) {
            var value = 0;
            if (this.building_info[b_id].vp != null)
                var value = this.building_info[b_id].vp;
            if (up) this.scoreCtrl[p_id].incValue(value);
            else this.scoreCtrl[p_id].incValue(-value);
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

        moveObject: function(mobile_obj, target_obj, position=null, duration=500, delay=0){
            if (position == null) position = "last";
            var animation_id = this.slideToObject( mobile_obj, target_obj, duration, delay );
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_function', {target_obj:target_obj, mobile_obj:mobile_obj, position:position}));
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
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
        },

        bonusTypeForType: function(tradeAway, tradeFor) {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/homesteaders/homesteaders/bonusTypeForType.html", {lock: true, tradeAway: tradeAway, tradeFor: tradeFor}, this, 
                function( result ) { 
                    this.disableTradeIfPossible();
                    this.hideUndoTransactionsButtonIfPossible(); 
                }, function( is_error) { } );
            }
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
                function( result ) {this.showUndoTransactionsButtonIfPossible(); }, 
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
                            args.type = this.getOneResourceAsDiv(args.type);
                        } else { // array with {type,amount} values
                            args.typeStr = args.type.type;
                            args.amount = args.type.amount;
                            args.type = this.getOneResourceAsDiv(args.typeStr, args.amount);
                        }
                    }
                    // multiple types of resources
                    if (args.tradeAway != null){
                        args.tradeAway_arr = args.tradeAway;
                        args.tradeAway = this.getResourceArrayAsDiv(args.tradeAway_arr);
                    }
                    if (args.tradeFor != null){
                        args.tradeFor_arr = args.tradeFor;
                        args.tradeFor = this.getResourceArrayAsDiv(args.tradeFor_arr);
                    }
                    if (args.resources != null){
                        args.resource_arr = args.resources;
                        args.resources = this.getResourceArrayAsDiv(args.resources);
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
                        args.worker = this.getOneResourceAsDiv('worker')
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
                    // format text with font (no color)
                    if (args.text != null && typeof args.text == 'string'){
                        args.text = this.format_block('jstpl_color_log', {color:'', string:args.text});
                    }
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
                            args.reason_string = this.getOneResourceAsDiv('worker');
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

        getOneResourceAsDiv: function(type, amount=1){
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
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            this.moveObject(worker_divId, this.building_worker_ids[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
        },

        notif_railAdv: function( notif ){
            const train_token = this.train_token_divId[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        notif_gainWorker: function( notif ){
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_worker', {id: notif.args.worker_key}), this.token_zone[notif.args.player_id] );
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers" && notif.args.player_id == this.player_id){
                    dojo.addClass(worker_divId, 'selectable');
                }                
            }
        },

        notif_gainTrack: function( notif ){
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: this.player_color[Number(notif.args.player_id)]}),
                    this.token_divId[Number(notif.args.player_id)]);
            this.addTooltipHtml(`token_track_${notif.args.track_key}`, this.res_info['track']['tt']);
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
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        notif_moveFirstPlayer: function (notif ){
            const p_id = Number(notif.args.player_id);
            const tile_id = FIRST_PLAYER_ID;
            if (p_id != this.first_player){
                this.moveObject(tile_id, this.player_building_zone_id[p_id]);
                this.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                this.moveBid(i, BID_PASS);
            }
        },

        notif_buildBuilding: function( notif ){
            this.addBuildingToPlayer(notif.args.building);
            this.updateScoreForBuilding(notif.args.player_id, notif.args.building.b_id);
            
            var destination = `${TPL_BLD_TILE}_${Number(notif.args.building.b_key)}`; 
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone_divId, destination , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
        },

        notif_playerIncome: function( notif ){
            var start = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            for(let i = 0; i < notif.args.amount; i++){
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
            var destination = this.getTargetFromNotifArgs(notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                                for(let i = 0; i < amt; i++){
                                        this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone_divId, destination , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
        },

        notif_trade: function( notif ){
            const player_zone = `player_board_${notif.args.player_id}`;
            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone,TRADE_BOARD_ID , 500 , 100*(delay++) );
                    if (notif.args.player_id == this.player_id){
                        this.resourceCounters[type].incValue(-1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', TRADE_BOARD_ID, player_zone, 500 , 100*(delay++) );
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
            if (notif.args.player_id == this.player_id)
                this.showUndoTransactionsButtonIfPossible();
        },

        notif_loanPaid: function( notif ){
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
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', player_zone_divId,  500 , 0 );
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', player_zone_divId, 500 , 100);
            this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:'silver'}), 'limbo', 'board', player_zone_divId, 500 , 200);
            if (notif.args.player_id == this.player_id){
                this.resourceCounters['loan'].incValue(1);
                this.resourceCounters['silver'].incValue(2);
                this.showUndoTransactionsButtonIfPossible();
            }
        },

        notif_score: function( notif ){
            if (this.isTop == false){
                this.isTop = true;
                this.moveObject('player_zones', 'main_container', 'before');
            }
            const p_id = notif.args.player_id;
            this.scoreCtrl[p_id].setValue(0);
            for(let b_key in notif.args.building){
                const building = notif.args.building[b_key];
                var bld_score = 0;
                if (Number(building.static) >0){
                    bld_score += Number(building.static);
                } 
                if (building.bonus != null && Number(building.bonus) >0){
                    bld_score += Number(building.bonus);
                }
                this.displayScoring( `${TPL_BLD_TILE}_${b_key}`, this.player_color[notif.args.player_id], bld_score, 2000 );
                this.scoreCtrl[p_id].incValue(bld_score);
            } 
            const player_zone_divId = `player_board_${p_id}`;
            dojo.place(`<div id="score_grid_${p_id}" class="score_grid"></div>`, player_zone_divId);
            for(let type in notif.args.resource){
                const amt = notif.args.resource[type];
                this.scoreCtrl[p_id].incValue(amt);
                this.displayScoring( `score_grid_${p_id}`, this.player_color[p_id], amt, 2000 );
            }
        },

        notif_cancel: function( notif ){
            let p_id = notif.args.player_id;
            const isThisPlayer = p_id== this.player_id;
            const player_zone = `player_board_${p_id}`;
            var delay = 0;
            // update values as undone
            for (let i in notif.args.actions){
                let log = notif.args.actions[i];
                switch (log.action){
                    case 'build':
                        this.cancelBuild(log.building);
                        if (isThisPlayer){
                            for(let type in log.cost){
                                let amt = log.cost[type];
                                for(let j = 0; j < amt; j++){
                                    this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, 'board' , 500 , 50*(delay++) );
                                    if (isThisPlayer){
                                        this.resourceCounters[type].incValue(1);
                                    }
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
                        if (log.type != null){
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
                        this.moveObject(train_token, `train_advancement_${(parent_no-1)}`);
                    break;
                    case 'trade':
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', player_zone, TRADE_BOARD_ID , 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[type].incValue(1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.format_block('jstpl_resource_log', {type:type}), 'limbo', TRADE_BOARD_ID, player_zone, 500 , 50*(delay++) );
                                if (isThisPlayer){
                                    this.resourceCounters[type].incValue(-1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
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

            this.cancelNotifications(notif.args.move_ids);
            // mark logs as cancelled.
            
            if ( notif.args.player_id == this.player_id){
                this.hideUndoTransactionsButtonIfPossible();
            }
        },

        getTargetFromNotifArgs: function( notif ){
            var target = `board`;
            if (notif.args.origin == 'auction'){
                target = `${TPL_AUC_ZONE}${Number(notif.args.key)}`;
            } else if (notif.args.origin == 'building'){
                target = `${TPL_BLD_TILE}_${Number(notif.args.key)}`;
            } 
            return target;
        },
   });             
});
