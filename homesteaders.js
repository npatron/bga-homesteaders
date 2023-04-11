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
    const RESOURCE_ORDER = ['vp0', 'vp', 'vp2', 'vp3', 'vp4', 'vp6', 'vp8','vp10', 
                            'loan','cow','copper','gold','steel','food','wood','silver','trade'];

    const ZONE_PENDING = -1;
    const ZONE_PASSED = -2;
    const ZONE_PENDING_ID = 'pending_bids';
    const ZONE_PASSED_ID = 'passed_bids';
    const BID_ZONE_ID  = []; 

    const VP_B_RESIDENTIAL = 0; 
    const VP_B_COMMERCIAL = 1; 
    const VP_B_INDUSTRIAL = 2; 
    const VP_B_SPECIAL = 3; 
    const VP_B_WORKER = 4; 
    const VP_B_TRACK = 5; 
    const VP_B_BUILDING = 6; // 
    const VP_B_WRK_TRK = 7; //Workers & TRACK Bonus
    const VP_B_PAID_LOAN = 8; // post office

    // indexes for location (in _ID arrays)
        // SQL `building` `location` map
            const BLD_LOC_FUTURE  = 0;
            const BLD_LOC_OFFER   = 1;
            const BLD_LOC_PLAYER  = 2; // <-- not used in _ID arrays
            const BLD_LOC_DISCARD = 3;
        const AUC_LOC_FUTURE  = 2;
        const EVT_LOC_MAIN    = 4;
        const EVT_LOC_DISCARD = 5;

    // arrays for the map between toggle buttons and show/hide zones 
            // [upcomingBuildings, currentBuildings, upcomingAuctions, buildingDiscard, upcomingEvents, eventsDiscard];
        const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld', 'tgl_events', 'tgl_discard'];
        const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard', 'evt_main', 'gen_discard'];
        const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container', 'events_container', 'discard_container'];
        const TILE_ZONE_DIV_ID  = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone', 'events_zone', 'discard_zone'];

    /* ***** LOT STATE Bitwise Mapping ***** */
        const LOT_STATE_BUILD     = 1;
        const LOT_STATE_AUC_BONUS = 2;
        const LOT_STATE_EVT_BONUS = 4;

    /* ***** building ID's required for trade ***** */
        const BLD_MARKET = 7;
        const BLD_GENERAL_STORE = 14;
        const BLD_RIVER_PORT = 17;
        const BLD_BANK   = 22;
        const BLD_RODEO  = 26;
        const BLD_LUMBER_MILL = 36;
        const BLD_WAREHOUSE = 40;

    /* ***** string templates for dynamic assets ***** */
        const TPL_BLD_TILE  = "building_tile";
        const TPL_BLD_STACK = "building_stack_";
        const TPL_BLD_ZONE  = "building_zone_";
        const TPL_BLD_CLASS = "build_tile_";
        const TPL_AUC_TILE  = "auction_tile";
        const TPL_AUC_ZONE  = "auction_tile_zone_";
        const TPL_EVT_TILE  = "event_tile";
        const TPL_EVT_ZONE  = "event_tile_zone_";
        const FIRST_PLAYER_ID = 'first_player_tile';

        const [MESSAGE_ADVANCE_TRACK, MESSAGE_ALREADY_BUILT, MESSAGE_UNAFFORDABLE, MESSAGE_TRADEABLE, MESSAGE_AFFORDABLE] = [7, 9, 10, 11, 12];

        const [MESSAGE_CHOOSE_DIFFERENT_BUILDING, MESSAGE_BUILD, MESSAGE_BUILD_CONFIRM, MESSAGE_AUCTION_BONUS, MESSAGE_EVENT_BONUS] = [31, 32, 33, 34, 35];

        const [MESSAGE_FINAL_ROUND, MESSAGE_CANCEL, MESSAGE_CONFIRM_WORKERS, MESSAGE_CONFIRM_WORKERS_TRADES ,MESSAGE_UNDO_PASS]   = [50, 51, 52, 53, 54];
        const [MESSAGE_UNDO_INCOME, MESSAGE_WAIT, MESSAGE_DONE, MESSAGE_CONFIRM, MESSAGE_CONFIRM_DONE] = [55, 56, 57, 58, 59];

        const [MESSAGE_CONFIRM_PASS, MESSAGE_CONFIRM_BID, MESSAGE_CONFIRM_DUMMY_BID, MESSAGE_PASS, MESSAGE_TRADE_HIDE] = [60, 61, 62, 63, 64];
        const [MESSAGE_TRADE_SHOW, MESSAGE_CONFIRM_TRADE, MESSAGE_TRADE_UNDO, MESSAGE_TAKE_DEBT, MESSAGE_DEBT_PAY] = [65, 66, 67, 68, 69];

        const [MESSAGE_X_FOR_Y, MESSAGE_X_FOR_Y_CONFIRM] = [70, 71];
        const [MESSAGE_HIRE, MESSAGE_HIRE_FREE, MESSAGE_BONUS_PASS] = [72, 73, 74];
        const [MESSAGE_BONUS_CHOOSE, MESSAGE_EVENT_SILVER_RAIL_ADVANCE, MESSAGE_EVENT_SILVER_RAIL_ADVANCE_CONFIRM, MESSAGE_EVENT_STEEL_BUILD, MESSAGE_EVENT_STEEL_BUILD_CONFIRM] = [75, 76, 77, 78, 79];

        const [MESSAGE_EVENT_DONE, MESSAGE_EVENT_DONE_CONFIRM, MESSAGE_START_SELL, MESSAGE_DO_NOT_BUILD, MESSAGE_DO_NOT_BUILD_ALT] = [80, 81, 82, 83, 84];
        const [MESSAGE_PAY_LOAN_3_SILVER, MESSAGE_PAY_OFF_LESS_LOAN, MESSAGE_PAY_AMT, MESSAGE_USE_MORE_GOLD, MESSAGE_USE_LESS_GOLD] = [85, 86, 87, 88, 89];

        const [MESSAGE_MORE_WOOD_STEEL, MESSAGE_LESS_WOOD_STEEL, MESSAGE_GOLD_AS_TYPE, MESSAGE_PAY_DEBT_GOLD, MESSAGE_PAY_DEBT_FOOD] = [90, 91, 92, 93, 94];
        const [MESSAGE_BUILD_DISCOUNT, MESSAGE_DISCOUNT_RESOURCE, MESSAGE_SELECT_BUILDING, MESSAGE_TRADE_BUTTON_TEMPLATE] = [95, 96, 97, 98];

        /* ***** allocate workers ***** */
        const BTN_ID_CONFIRM_WORKERS = 'btn_confirm_workers'; 
        const METHOD_CONFIRM_WORKERS = 'donePlacingWorkers';
        const OBJECT_CONFIRM_WORKERS = {
            id: BTN_ID_CONFIRM_WORKERS, method:METHOD_CONFIRM_WORKERS, 
            default:MESSAGE_CONFIRM_WORKERS, confirm: MESSAGE_CONFIRM_WORKERS_TRADES
        };

    const BTN_ID_WAIT = 'btn_wait';
    const METHOD_WAIT = 'waitForPlayerOrder';
    
    /* ***** common buttons ***** */
        const BTN_ID_UNDO_PASS    = 'btn_undo_pass';
        // 'onUnPass_preEventTrade', 'onUndoBidPass', 'onUnPass_endGameActions' 
        
        const BTN_ID_ON_PASS_EVENT_DONE = 'btn_done_pass_event';
        const METHOD_ON_PASS_EVENT_DONE = 'donePassEvent';
        const OBJECT_PASS_EVENT_DONE = {
            id: BTN_ID_ON_PASS_EVENT_DONE, method: METHOD_ON_PASS_EVENT_DONE, 
            message: MESSAGE_DONE, message_confirm: MESSAGE_CONFIRM_DONE
        };

        const BTN_ID_CANCEL       = 'btn_cancel_button';
        // 'cancelUndoTransactions', 'cancelEventTransactions', 'cancelHiddenUndoTransactions',
        const BTN_ID_REDO_AUCTION = 'btn_redo_build_phase';
        const METHOD_CANCEL_TURN = 'cancelTurn';

    /* ***** Bid Buttons ***** */
    const BTN_ID_CONFIRM_BID = 'btn_confirm_bid';
        // confirmBidButton
    const BTN_ID_CONFIRM_DUMMY_BID = 'btn_confirm_dummy_bid';
        // confirmDummyBidButton
        const BTN_ID_PASS_BID     = 'btn_pass';
        // passBidButton
        /** Confirm Lot Actions **/
    const BTN_ID_CONFIRM_ACTIONS = 'btn_confirm';
        // confirmBuildPhase
    /* ***** trade buttons ***** */
        const BTN_ID_TRADE_TOGGLE     = 'btn_trade';
        const METHOD_TRADE_TOGGLE     = "tradeActionButton";
    
        const BTN_ID_CONFIRM_TRADE = 'confirm_trade_btn';
        const METHOD_CONFIRM_TRADE = 'confirmTradeButton';
    
        const BTN_ID_UNDO_TRADE    = 'undo_trades_btn';
        const METHOD_UNDO_TRADE    = 'undoTransactionsButton';
        
        const BTN_ID_HIRE_WORKER  = 'btn_hire_worker';
        const METHOD_HIRE_WORKER  = 'hireWorkerButton';

        const BTN_ID_TAKE_LOAN    = 'btn_take_loan';
        const METHOD_TAKE_LOAN    = 'onMoreLoan';
        
        const BLD_ID_MARKET_FOOD  = 'trade_market_wood_food';
        const BLD_ID_MARKET_STEEL = 'trade_market_food_steel';
        const BLD_METHOD_MARKET   = 'onClickOnMarketTrade';

        const BLD_ID_TRADE_BANK     = 'trade_bank_trade_silver';
        const BLD_METHOD_TRADE_BANK = 'onClickOnBankTrade';
        const BTN_ID_TRADE_BANK     = 'btn_trade_bank';
        const METHOD_TRADE_BANK     = 'onClickOnBankTrade';
        
    /* ***** Auction Bonus buttons ***** */
        const BTN_ID_FOOD_VP = 'btn_food_vp';
        const METHOD_FOOD_VP = 'foodFor2VP';
        const ARR_FOOD_VP    = {resource1:'${food}', resource2:'${vp2}', arrow:'${arrow}'};
        const OBJECT_FOOD_VP = {id:BTN_ID_FOOD_VP, method:METHOD_FOOD_VP, arr:ARR_FOOD_VP};
        const BTN_ID_COW_VP  = 'btn_cow_vp';
        const METHOD_COW_VP  = 'cowFor4VP';
        const ARR_COW_VP     = {resource1:'${cow}', resource2:'${vp4}', arrow:'${arrow}'};
        const OBJECT_COW_VP  = {id:BTN_ID_COW_VP, method:METHOD_COW_VP, arr:ARR_COW_VP};
        const BTN_ID_COPPER_VP = 'btn_copper_vp';
        const METHOD_COPPER_VP = 'copperFor4VP';
        const ARR_COPPER_VP    = {resource1:'${copper}', resource2:'${vp4}', arrow:'${arrow}'};
        const OBJECT_COPPER_VP = {id:BTN_ID_COPPER_VP, method:METHOD_COPPER_VP, arr:ARR_COPPER_VP};
        const BTN_ID_GOLD_VP = 'btn_gold_vp';
        const METHOD_GOLD_VP = 'goldFor4VP'; 
        const ARR_GOLD_VP    = {resource1:'${gold}', resource2:'${vp4}', arrow:'${arrow}'};
        const OBJECT_GOLD_VP = {id:BTN_ID_GOLD_VP, method:METHOD_GOLD_VP, arr:ARR_GOLD_VP};
        const BTN_ID_WOOD_TRACK = 'btn_wood_track';
        const METHOD_WOOD_TRACK = 'woodForTrack';
        const ARR_WOOD_TRACK    = {resource1:'${wood}', resource2:'${track}', arrow:'${arrow}'};
        const OBJECT_WOOD_TRACK = {id:BTN_ID_WOOD_TRACK, method:METHOD_WOOD_TRACK, arr:ARR_WOOD_TRACK};
        const TRANSITION_OBJECTS_X_FOR_Y = [OBJECT_FOOD_VP, OBJECT_COW_VP, OBJECT_COPPER_VP, OBJECT_GOLD_VP, OBJECT_WOOD_TRACK];

        const BTN_ID_BONUS_WORKER = 'btn_bonus_worker'; 
        // 'workerForFreeBuilding', 'workerForFreeAuction', 'workerForFreeEvent', 'workerForFreeLotEvent

        const BTN_ID_PASS_BONUS   = 'btn_pass_bonus';   
        // 'passBonusBuilding', 'passBonusAuction', 'passBonusLotEvent'
        const METHOD_PASS_BONUS   = 'passBonusEvent';

    /* ***** Rail Bonus ***** */
        const METHOD_BOARD_SELECT_BONUS = 'onSelectBonusOption'
        // BTN_ID_SELECT_BONUS = `btn_bonus_${type}`; // DYNAMIC
        const METHOD_SELECT_BONUS = 'selectBonusButton';
        const BTN_ID_CHOOSE_BONUS = 'btn_choose_bonus'; 
        const METHOD_CHOOSE_BONUS = 'doneSelectingRailBonus';
        const METHOD_CHOOSE_BONUS_EVENT = 'doneSelectingRailBonusEvent';
        
    /* ***** Event Bonus buttons ***** */
        /* *** Event Lot buttons *** */
            /* * EVENT_RAILROAD_CONTRACTS * */
            const BTN_ID_EVENT_SILVER_RAIL_ADVANCE = 'btn_silver_rail_advance';
            const METHOD_EVENT_SILVER_RAIL_ADVANCE = 'silver2ForRailAdvance';
            const OBJECT_EVENT_SILVER_RAIL_ADVANCE = {
                id: BTN_ID_EVENT_SILVER_RAIL_ADVANCE, method: METHOD_EVENT_SILVER_RAIL_ADVANCE,
                default: MESSAGE_EVENT_SILVER_RAIL_ADVANCE, confirm: MESSAGE_EVENT_SILVER_RAIL_ADVANCE_CONFIRM,
            }
            /* * EVENT_INDUSTRIALIZATION * */
            const BTN_ID_EVENT_STEEL_BUILD = 'btn_steel_build';
            const METHOD_EVENT_STEEL_BUILD = 'steelBuildBuilding';
            const OBJECT_EVENT_STEEL_BUILD = {
                id: BTN_ID_EVENT_STEEL_BUILD, method: METHOD_EVENT_STEEL_BUILD,
                default: MESSAGE_EVENT_STEEL_BUILD, confirm: MESSAGE_EVENT_STEEL_BUILD_CONFIRM,
            }
    
        /* ***  PRE-EVENT TRADE PHASE *** */
        const BTN_ID_EVENT_DONE_TRADING = 'btn_done_trading';
        const METHOD_EVENT_DONE_TRADING = 'doneTradingEvent';
        const OBJECT_EVENT_DONE_TRADING = {
            id: BTN_ID_EVENT_DONE_TRADING, method: METHOD_EVENT_DONE_TRADING, 
            default : MESSAGE_EVENT_DONE, confirm : MESSAGE_EVENT_DONE_CONFIRM 
        };
            /* * EVENT_STATE_FAIR * note: state-fair is done incorrectly, trades should be open, but in turn order. */
            const BTN_ID_EVENT_DONE_HIDDEN_TRADING = 'btn_done_hidden_trading';
            const METHOD_EVENT_DONE_HIDDEN = 'doneHiddenTradingEvent';
            const OBJECT_EVENT_DONE_HIDDEN = {
                id: BTN_ID_EVENT_DONE_HIDDEN_TRADING, method: METHOD_EVENT_DONE_HIDDEN, 
                default : MESSAGE_PASS,confirm : MESSAGE_CONFIRM_PASS 
            };
            const BTN_ID_CONFIRM_TRADE_HIDDEN = 'confirm_trade_btn_hidden';
            const METHOD_CONFIRM_TRADE_HIDDEN = 'confirmHiddenTradeButton';
            /* * EVENT_WARTIME_DEMAND * */
            const BTN_ID_EVENT_START_SELL = 'btn_start_sell';
            const BTN_ID_UNDO_SELL_EVENT = 'btn_undo_sell_event';
            const METHOD_UNDO_SELL_EVENT = 'undoTransactionsButton_sellEvent';
            const BTN_ID_BACK_SELL_EVENT = 'btn_back_sell_event';
            const METHOD_BACK_SELL_EVENT = 'backToTradesButton_sellEvent';
            /* * EVENT_SHARECROPPING * */
            const BTN_ID_PAY_LOAN_FOOD = 'btn_pay_loan_food';
            const METHOD_PAY_LOAN_FOOD = 'payLoanWithFood';
        /* *** on Pass Event button *** */
            /** EVENT_NELSON_ACT **/
            const BTN_ID_PAY_LOAN_3_SILVER = 'btn_loan_3_silver';
            const METHOD_PAY_LOAN_3_SILVER = 'payLoan3Silver';
            const BTN_ID_PAY_LESS_LOAN     = 'btn_less_loan';
            const METHOD_PAY_LESS_LOAN     = 'payLoan3SilverLess';

    /* ** Choose Lot Action ** */
        const BTN_LOT_ACTION_BUILD  = 'btn_build';
        const METHOD_LOT_ACTION_BUILD  = 'lotGoToBuild';
        const BTN_LOT_ACTION_EVENT  = 'btn_event';
        const METHOD_LOT_ACTION_EVENT  = 'lotGoToEvent';
        const BTN_LOT_ACTION_AUCTION  = 'btn_auction';
        const METHOD_LOT_ACTION_AUCTION  = 'lotGoToAuction';
        const BTN_LOT_ACTION_PASS  = 'btn_pass';
        const METHOD_LOT_ACTION_PASS  = 'lotGoToConfirm';

    /* *** Client state - Sell: Action ** */
        const BTN_ID_AUCTION_DONE_TRADING = 'btn_done_trading_auction';
        const METHOD_AUCTION_DONE_TRADING = 'doneTradingAuction';
        const OBJECT_AUCTION_DONE_TRADING = {
            id: BTN_ID_AUCTION_DONE_TRADING, method: METHOD_AUCTION_DONE_TRADING,
            default : MESSAGE_PASS, confirm : MESSAGE_CONFIRM_PASS
        }
        const BTN_ID_UNDO_SELL_AUCTION = 'btn_undo_trades_sell_auction';
        const METHOD_UNDO_SELL_AUCTION = 'undoTransactionsButton_sellAuction';

    /* ** Build Building ** */
        const BTN_ID_BUILD_BUILDING = 'btn_choose_building';
        const METHOD_BUILD_BUILDING = 'chooseBuilding';
        const BUILDING_NAME_ID    = 'bld_name';
        const BTN_ID_DO_NOT_BUILD = 'btn_do_not_build'; 
        // 'doNotBuild'
    /* *  build building cost replacement * */
        const REPLACER_ZONE_ID   = 'replacers';
        const BTN_ID_GOLD_COW    = 'btn_gold_cow';      // riverport
        const METHOD_GOLD_COW    = 'toggleGoldAsCow';   // riverport 
        const BTN_ID_GOLD_COPPER = 'btn_gold_copper';   // riverport
        const METHOD_GOLD_COPPER = 'toggleGoldAsCopper';// riverport
        const BTN_ID_MORE_STEEL  = 'btn_more_steel'; // lumbermill
        const METHOD_MORE_STEEL  = 'raiseWoodSteel'; // lumbermill
        const BTN_ID_LESS_STEEL  = 'btn_less_steel'; // lumbermill
        const METHOD_LESS_STEEL  = 'lowerWoodSteel'; // lumbermill
    /* * Pay cost update buttons * */
        const BTN_ID_MORE_GOLD = 'btn_more_gold';
        const METHOD_MORE_GOLD = 'raiseGold';
        const PAY_GOLD_TEXT    = 'pay_gold';
        const PAY_GOLD_TOKEN   = 'pay_gold_tkn';
        const BTN_ID_LESS_GOLD = 'btn_less_gold';
        const METHOD_LESS_GOLD = 'lowerGold';
        const PAY_SILVER_TEXT  = 'pay_silver';
        const PAY_SILVER_TOKEN = 'pay_silver_tkn';
        const BTN_ID_PAY_DONE  = 'btn_pay_done';
        const METHOD_DONE_PAY  = 'donePay';

    /* ** Endgame buttons ** */
        const BTN_ID_DONE             = 'btn_done';
        const METHOD_ENDGAME_DONE     = 'doneEndgameActions';
        const OBJECT_DONE = {id: BTN_ID_DONE, method: METHOD_ENDGAME_DONE, default : MESSAGE_PASS, confirm : MESSAGE_CONFIRM_PASS };
        const BTN_ID_PAY_LOAN_SILVER  = 'btn_pay_loan_silver';
        const METHOD_PAY_LOAN_SILVER  = 'payLoanSilver'; 
        const BTN_ID_PAY_LOAN_GOLD    = 'btn_pay_loan_gold';
        const METHOD_PAY_LOAN_GOLD    = 'payLoanGold';

        const SPECIAL_TRANSITION_BUTTONS = [
            BTN_ID_PAY_DONE, BTN_ID_BUILD_BUILDING, 
        ];
        const TRANSITION_OBJECTS = [
            OBJECT_DONE, OBJECT_AUCTION_DONE_TRADING,OBJECT_EVENT_DONE_TRADING, 
            OBJECT_EVENT_DONE_HIDDEN, OBJECT_PASS_EVENT_DONE, OBJECT_CONFIRM_WORKERS,
            OBJECT_EVENT_STEEL_BUILD, OBJECT_EVENT_SILVER_RAIL_ADVANCE,
        ];

    /* ** transaction constants ** */
        const BUY               = 1;
        const SELL              = 2;
        const MARKET            = 3;
        const BANK              = 4;
        const TAKE_LOAN         = 5;
        const PAY_LOAN_GOLD     = 6;
        const PAY_LOAN_SILVER   = 7;
        const PAY_LOAN_SILVER_3 = 8;
        const PAY_LOAN_FOOD     = 9;
    
        const TRADE_MAP = {'buy_wood':0,  'buy_food':1,  'buy_steel':2, 'buy_gold':3, 'buy_copper':4, 'buy_cow':5,
                           'sell_wood':6, 'sell_food':7, 'sell_steel':8, 'sell_gold':9, 'sell_copper':10, 'sell_cow':11, 
                           'market_food':12, 'market_steel':13, 'bank':14, 'loan':15, 
                           'payLoan_silver':16, 'payLoan_gold':17,'payLoan_3silver':18, 'payLoan_food':19,
                           'sellfree_wood':20, 'sellfree_food':21, 'sellfree_steel':22, 'sellfree_gold':23, 'sellfree_copper':24, 'sellfree_cow':25, };
    
    /* ** warehouse buttons ** */
        const WAREHOUSE_RES_ID = 'warehouse_resources';
        const WAREHOUSE_DESCRIPTION_ID = 'warehouse_description';
    /* ** bonus options mapping ** */
    const BONUS_OPTIONS = { 7:'train_bonus_1_trade', 8:'train_bonus_2_track', 9:'train_bonus_3_worker',
        1:'train_bonus_4_wood', 5:'train_bonus_4_food', 2:'train_bonus_4_steel', 3:'train_bonus_4_gold',
        4:'train_bonus_4_copper', 6:'train_bonus_4_cow', 10:'train_bonus_5_vp'};

    /* * trade id's (for "show trade") * */
        const TRADE_BOARD_ID = 'trade_top';
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
                           'building':'.building_tile', 'worker':'.token_worker', 
                           'trade':'.trade_option', 'track':'.token_track'};

    /* ** auction bonus map to constants ** */
        const AUC_BONUS_NONE            = 0;
        const AUC_BONUS_WORKER          = 1;
        const AUC_BONUS_WORKER_RAIL_ADV = 2;
        const AUC_BONUS_WOOD_FOR_TRACK  = 3;
        const AUC_BONUS_COPPER_FOR_VP   = 4;
        const AUC_BONUS_COW_FOR_VP      = 5;
        const AUC_BONUS_6VP_AND_FOOD_VP = 6;
        const AUC_BONUS_FOOD_FOR_VP     = 7;
        // auc 4 events (expansion)
        const AUC_BONUS_NO_AUCTION     = 8;
        const AUC_BONUS_TRACK_RAIL_ADV = 9;
        const AUC_BONUS_4DEPT_FREE     = 10;
        const AUC_BONUS_3VP_SELL_FREE  = 11;
    /* ** event id mapping ** */
        const EVENT_EAGER_INVESTORS    = 4;
        const EVENT_MIGRANT_WORKERS    = 6;
        const EVENT_RAILROAD_CONTRACTS = 7;
        const EVENT_INDUSTRIALIZATION  = 13;
        const EVENT_SHARECROPPING      = 15;
        const EVENT_STATE_FAIR         = 16;
        const EVENT_TIMBER_CULTURE_ACT = 18;
        const EVENT_WARTIME_DEMAND     = 19;
        const EVENT_NELSON_ACT         = 23;

    /* ** notif and color variables ** */
        const ALREADY_BUILT = 9;
        const UNAFFORDABLE = 10;
        const TRADEABLE    = 11;
        const AFFORDABLE   = 12;
        const COLOR_MAP = {9:'black', 10:'black', 11:'blue', 12:'darkgreen'};
        const AFFORDABILITY_CLASSES = {9:'unaffordable', 10:'unaffordable', 11:'tradeable', 12:'affordable'}
    
    // only Build bonus with player action required
    const BUILD_BONUS_WORKER = 3; 

    const BID_VAL_ARR = [3,4,5,6,7,9,12,16,21];//note: starts at 0.
    const ASSET_COLORS = {0:'res', 1:'com', 2:'ind', 3:'spe', 4:'any', 6:'any', 7:'adv_track',
                        10:'a0',11:'a1', 12:'a2', 13:'a3', 14:'a4'};
    const VP_TOKENS = ['vp0', 'vp2', 'vp3', 'vp4','vp6','vp8', 'vp10'];
    const WAREHOUSE_MAP = {1:'wood',2:'food',4:'steel',8:'gold',16:'copper',32:'cow',}

    const COST_REPLACE_TYPE = {'steel':{'wood':1,'vp':1}, 'cow':{'gold':1}, 'copper':{'gold':1}, 'gold':{'silver':5}};

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['currentPlayer','First', 'Second', 'Third', 'Fourth',];
    
    /* *** TOKEN ARRAYS *** */
        
        /* *** html tokens *** */
            const TOKEN_HTML = [];

        /* zone control */
        const TRACK_TOKEN_ZONE  = [];
        const WORKER_TOKEN_ZONE = [];
        const TRAIN_TOKEN_ID = [];//indexed by p_id
        const BID_TOKEN_ID = [];

        /* player_info */
        const PLAYER_COLOR            = [];
        const PLAYER_SCORE_ZONE_ID    = [];
        const PLAYER_BUILDING_ZONE_ID = [];
        /* PLAYER resources and score counters */
        const BOARD_RESOURCE_COUNTERS = [];
        const BOARD_RESOURCE_ICON = [];
        const RESOURCE_ARRAY = [];
        const OFFSET_RESOURCE_AMOUNT = [];
        const NEW_RESOURCE_AMOUNT = [];
        const INCOME_ARRAY = []; // current round income (for updating breadcrumbs/offset).

        /* ** Score counters ** */
        const SCORE_RESOURCE_COUNTERS = [];
        const SCORE_LEFT_COUNTER = [];
        const SCORE_RIGHT_COUNTER = [];
        /* ** onClick Connect Handlers ** */
        const BUILDING_CONNECT_HANDLER = [];
        const TRADE_CONNECT_HANDLER = [];

        /* **last selected client values ** */
        const LAST_SELECTED = [];

        /* ** queues for pending trades ** */
            const TRANSACTION_LOG  = [];
            const TRANSACTION_COST = [];
            const HIDDEN_AWAY_COST = [];
            const HIDDEN_FOR_COST = [];

        /* ** storage for buildings ** */
            const MAIN_BUILDING_COUNTS = []; // counts of each building_id in main zone. for use by update Buildings methods.
            const BUILDING_WORKER_IDS  = [];
            const HAS_BUILDING         = [];

        /* ** from backend (material.inc) ** */
            const RESOURCE_INFO = [];
            const EVENT_INFO    = [];
            const BUILDING_INFO = [];
            
        /* ** translation strings ** */
            const MESSAGE_STRINGS = [];
            const STAGE_STRINGS = [];
            const AUCTION_BONUS_STRINGS = [];
            const BUILD_BONUS_STRINGS = [];

    return declare("bgagame.homesteaders", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){

            this.allowTrade = false;
            this.tradeEnabled = false;
            this.showPay = true;
            this.can_cancel = false;

            this.worker_height = 35;
            this.worker_width = 33;
            this.warehouse_state = 0;
            
            this.player_count = 0;
            this.goldCost = 0;
            this.silverCost = 0;
            this.first_player = 0;
            // for tracking current auction (for title update)
            this.current_auction = 1;
            this.number_auctions = 0;

            this.show_player_info = false;
            this.goldAsCopper = false;
            this.goldAsCow = false;
            this.undoPay = false;

            this.GOLD_COUNTER = new ebg.counter();
            this.SILVER_COUNTER = new ebg.counter();
            this.ROUND_COUNTER  = new ebg.counter();
            
            //new vars from expansion,
            this.cost_replace = [];
            this.building_discount = false;
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
            this.player_id = this.player_id;
            this.show_player_info = gamedatas.show_player_info;
            this.use_events = gamedatas.use_events;
            this.events = gamedatas.events;
            this.current_round = Number(gamedatas.round_number);
            
            this.rail_no_build = gamedatas.rail_no_build;
            this.loans_paid = gamedatas.loans_paid;
            
            this.fillArray(RESOURCE_INFO, gamedatas.resource_info);
            this.fillArray(EVENT_INFO, gamedatas.event_info);
            this.fillArray(BUILDING_INFO, gamedatas.building_info);
            this.fillArray(MESSAGE_STRINGS, gamedatas.translation_strings);
            this.fillArray(STAGE_STRINGS, gamedatas.stage_strings);
            this.fillArray(AUCTION_BONUS_STRINGS, gamedatas.auction_bonus_strings);
            this.fillArray(BUILD_BONUS_STRINGS, gamedatas.build_bonus_strings)
            
            this.setupResourceTokens();
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.player_count++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            if (this.player_count == 2){
                PLAYER_COLOR[DUMMY_BID] = this.getAvailableColor();
                PLAYER_COLOR[DUMMY_OPT] = PLAYER_COLOR[0];
            }
            this.setupPlayerResources(gamedatas.player_resources, gamedatas.resources);
            if (!this.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                this.setupTradeButtons();
            } else {
                this.spectatorFormatting();
            }
            if (this.player_count <5){
                this.hideBoard2();
            }
            
            // Auctions: 
            this.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);
            if (this.use_events){
                this.createEventCards(Number(gamedatas.round_number));
                this.updateEventBanner(Number(gamedatas.round_number));
            }

            dojo.place(FIRST_PLAYER_ID, PLAYER_SCORE_ZONE_ID[gamedatas.first_player]);
            this.first_player = Number(gamedatas.first_player);
            this.addTooltipHtml( FIRST_PLAYER_ID, `<span class="font caps">${_('First Bid in Next Auction')}</span><span class="fp_tile building_tile" style="display:block"></span>` ); 
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones();
            this.setupBidTokens(gamedatas.bids);

            this.setupRailLines(gamedatas.players);
            this.setupRailAdvanceButtons(gamedatas.resource_info);
            this.setupShowButtons();
            if (Number(gamedatas.round_number ==11)){
                dojo.destroy('#round_number');
                $("round_text").innerHTML=_(MESSAGE_FINAL_ROUND);
            } else {
                this.ROUND_COUNTER.create('round_number');
                this.ROUND_COUNTER.setValue(Number(gamedatas.round_number));
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
            dojo.query("#player_zone_"+current_player_color).removeClass("noshow");
            if (this.player_id == p_id) {
                this.isSpectator = false;
            }
            const player_board_div     = 'player_board_'+p_id;
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

        hideBoard2: function (){
            dojo.style("board_2", 'display', 'none');
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
            BOARD_RESOURCE_ICON[resource.p_id] = [];
            SCORE_RESOURCE_COUNTERS[resource.p_id] = [];
            for (const [key, value] of Object.entries(resource)) {
                //console.log(resource, key, value);
                if (key == "p_id" || key == "workers" || key == "track") continue;
                var translatedString = _(RESOURCE_INFO[key]['tt']);
                let tooltip_html = this.format_block('jptpl_res_tt', {value:this.replaceTooltipStrings(translatedString)});

                let resourceId = `${key}count_${resource.p_id}`;
                this.addTooltipHtml( resourceId, tooltip_html);
                let iconId = `${key}icon_p${resource.p_id}`;
                this.addTooltipHtml( iconId, tooltip_html );

                SCORE_RESOURCE_COUNTERS[resource.p_id][key] = new ebg.counter();
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].create(resourceId);
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].setValue(value);

                let boardResourceId = `${key}Num_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardResourceId, tooltip_html );
                let boardIconId = `${key}icon_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardIconId, tooltip_html );
                BOARD_RESOURCE_ICON[resource.p_id][key] = boardIconId;

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
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: PLAYER_COLOR[track.p_id]}), TRACK_TOKEN_ZONE[track.p_id], 'last');
            }
            var translatedString = _(RESOURCE_INFO['track']['tt']);
            this.addTooltipHtmlToClass("token_track", `<div style="text-align:center;">${this.replaceTooltipStrings(translatedString)}</div>`);
        },

        /**
         * Create Building Trade Actions and Worker Slots 
         * Trade actions that are used for queueing trades
         * Worker slots are used for assigning workers to buildings (when owned by players)
         * 
         * @param {*} building - information about the building to add slots to
         * @param {*} b_info - info from material.inc for building_id 
         */
         addBuildingTradeActionsAndWorkerSlots: function(b_id, b_key){
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if (b_id == BLD_BANK){
                dojo.place(`<div id="${BLD_ID_TRADE_BANK}" class="bank trade_option"></div>`, b_divId,'last');
            } else if (b_id == BLD_MARKET){
                dojo.place(`<div id="${b_key}_${BLD_ID_MARKET_FOOD}" class="market_food trade_option"> </div><div id="${b_key}_${BLD_ID_MARKET_STEEL}" class="market_steel trade_option"> </div>`, b_divId,'last');
            } else if (b_id == BLD_WAREHOUSE){
                dojo.place(`<div id="${WAREHOUSE_RES_ID}"></div>`, b_divId, 'last');
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
                dojo.connect($(BLD_ID_TRADE_BANK), 'onclick', this, BLD_METHOD_TRADE_BANK);
            } else if (b_id == BLD_MARKET){
                dojo.connect($(`${b_key}_${BLD_ID_MARKET_FOOD}`),  'onclick', this, BLD_METHOD_MARKET);
                dojo.connect($(`${b_key}_${BLD_ID_MARKET_STEEL}`), 'onclick', this, BLD_METHOD_MARKET);
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
            BID_ZONE_ID[ZONE_PENDING] = ZONE_PENDING_ID;
            BID_ZONE_ID[ZONE_PASSED] = ZONE_PASSED_ID;
            let auc_end = (this.player_count==5?4:3);

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

        showScoreTooltips: function( players ) {
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
            const options = dojo.query(`#${TRADE_BOARD_ID} .trade_option`);
            for(let i in options){
                if (options[i].id){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
            }   }
            // create new and offset counters
            for (const [key, value] of Object.entries(RESOURCE_INFO)) {
                if ( key == "workers" || key == "track") continue;
                RESOURCE_ARRAY[key] = key+"Num_"+ PLAYER_COLOR[this.player_id];
                OFFSET_RESOURCE_AMOUNT[key] = 0;
                NEW_RESOURCE_AMOUNT[key] = BOARD_RESOURCE_COUNTERS[this.player_id][key].getValue();
            }
            this.resetTradeValues();
        },

        setupWarehouseButtons: function(){
            let warehouseResources = this.getWarehouseResources();

            dojo.place(dojo.create('br',{}), 'generalactions', 'last');
            let buttonDiv = dojo.create('div', {id:"choose_warehouse_buttons", style:'display: inline-flex;justify-content: center;'});
            dojo.place(buttonDiv, 'generalactions', 'last');
            let warehouseText = dojo.create('span', {class:"font caps com", id:'warehouse_text'});
            dojo.place(warehouseText, "choose_warehouse_buttons", 'first');
            warehouseText.innerText = _(BUILDING_INFO[BLD_WAREHOUSE].name+": ");
            for (let type in warehouseResources){
                if (type == 'length') continue;
                this.addActionButton( `btn_warehouse_${type}`, TOKEN_HTML[type], `onClickWarehouseResource`, null, false, 'gray');
                dojo.place(`btn_warehouse_${type}`,'choose_warehouse_buttons', 'last');
                this.warehouse = type;
            }
            dojo.query(`#btn_warehouse_${this.warehouse}:not(.bgabutton_blue)`).addClass('bgabutton_blue' );
            dojo.query(`#btn_warehouse_${this.warehouse}.bgabutton_gray`).removeClass('bgabutton_gray');
            
        },
        
        onClickWarehouseResource: function( evt ){
            let target_id = evt.target.id;
            let target_type = target_id.split('_')[2];
            dojo.removeClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_blue');
            dojo.addClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_gray');
            this.warehouse = target_type;
            dojo.addClass(`btn_warehouse_${target_type}`, 'bgabutton_blue');
            dojo.removeClass(`btn_warehouse_${target_type}`, 'bgabutton_gray');
            
            this.resetTradeValues();
            this.setOffsetForIncome();
        },

        /**
         * Connects click actions to the bonus actions for get Rail advancement action.
         * 
         * @param {*} resource_info 
         */
        setupRailAdvanceButtons: function(){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id){
                    dojo.connect($(bonus_options[i].id),'onclick', this, METHOD_BOARD_SELECT_BONUS);
                    let type = bonus_options[i].id.split('_')[3];
                    if (type in RESOURCE_INFO){
                        this.addTooltipHtml(_(RESOURCE_INFO[type].tt));
                    }
                } 
            }
        },

        /**
         * Create the HTML tokens and put them in TOKEN_HTML
         */
        setupResourceTokens(){
            for(let type in RESOURCES){ // make the resource tokens (normal/big/x(crossed out))
                TOKEN_HTML[type] = this.format_block( 'jstpl_resource_inline', {type:type, title:type});
                TOKEN_HTML["big_"+type] = this.format_block( 'jstpl_resource_inline', {type:"big_"+type, title:type});
                TOKEN_HTML["x_"+type] = `<span title = "${type}" class="log_${type} crossout token_inline" style="top: 9px;"></span>`;
            }
            let types = ['arrow', 'big_arrow', 'inc_arrow'];
            for(let i in types){ // make the arrow tokens
                TOKEN_HTML[types[i]] = this.format_block( 'jstpl_resource_inline', {type:types[i], title:types[i]});
            }
            for (let i in VP_TOKENS){ // add VP tokens 
                let amt = VP_TOKENS[i].charAt(VP_TOKENS.length-1);
                TOKEN_HTML[VP_TOKENS[i]] = this.format_block( 'jstpl_resource_inline', {type:VP_TOKENS[i], title:VP_TOKENS[i]});
                TOKEN_HTML["bld_"+VP_TOKENS[i]] = this.format_block('jstpl_resource_inline', {"type" : VP_TOKENS[i] + " bld_vp",title:VP_TOKENS[i]});
            }
            TOKEN_HTML.bld_vp = this.format_block('jstpl_resource_inline', {"type" : "vp bld_vp", title:'vp1'});
            TOKEN_HTML.track = this.getOneResourceHtml('track', 1, true);
            TOKEN_HTML.loan = this.format_block( 'jptpl_track_log', {type:'loan'}, );
            TOKEN_HTML.end = this.format_block('jstpl_color_log', {'string':_("End"), 'color':ASSET_COLORS[6]}); 
            
            types = {'and':_("AND"), 'or':_("OR"), 'dot':"•"};
            for(let i in types){ // creating the html for tooltip and/or/dot
                TOKEN_HTML[i] = this.format_block('jptpl_tt_break', {text:types[i], type:'dot'==i?'dot':'break'});
            }
            
            types = {0:0, 1:1, 2:2, 3:3, 4:4, 7:7}; 
            // from ASSET_COLORS res,com, ind, spe, any, adv_track  
            for (let i in types){ 
                TOKEN_HTML[ASSET_COLORS[i]] = this.format_block('jstpl_color_log', 
                {'string':_(MESSAGE_STRINGS[i]), 'color':ASSET_COLORS[i]});
                // ex TOKEN_HTML.res = translation string for 'Residential' with underline of color
            }
            types = {10:'4', 11:'1', 12:'2', 13:'3'};
            for (let i in types){ // 'a1', 'a2', 'a3', 'a4'
                TOKEN_HTML['a'+types[i]] = this.format_block('jstpl_color_log', 
                {'string':dojo.string.substitute(_("Auction ${a}"),{a:types[i]}), 'color': 'auc'+types[i]} );
            }
            TOKEN_HTML.click = `img class="imgtext" src="https://en.1.studio.boardgamearena.com:8083/data/themereleases/210929-0932/img/layout/help_click.png" alt="action"></img>`
            console.log("TOKEN_HTML", TOKEN_HTML);
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
            dojo.connect($(TOGGLE_BTN_ID[EVT_LOC_MAIN]),  'onclick', this, 'toggleShowEvents');
            dojo.connect($(TOGGLE_BTN_ID[EVT_LOC_DISCARD]),  'onclick', this, 'toggleShowDiscard');
            this.showHideButtons();
        },

        showHideToggleButton: function(index, tileId = TPL_BLD_TILE){
            let tile_count = dojo.query(`#${TILE_ZONE_DIV_ID[index]} .${tileId}`).length;
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
            this.showHideToggleButton(EVT_LOC_MAIN, TPL_EVT_TILE);
            this.showHideToggleButton(EVT_LOC_DISCARD, TPL_EVT_TILE);
        },

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            if (args && args.args) {
                if (args.args.hidden){
                    this.gamedatas.gamestate.description = this.gamedatas.gamestate.descriptionhidden;
                    this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturnhidden;
                    this.updatePageTitle();
                } else if (args.args.pre_trade) {
                    this.gamedatas.gamestate.description = this.gamedatas.gamestate.descriptiontrade;
                    this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturntrade;
                    this.updatePageTitle();
                } else if (args.args.alternate) {
                    this.gamedatas.gamestate.description = this.gamedatas.gamestate.descriptionalternate;
                    this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturnalternate;
                    this.updatePageTitle();
                } else if (args.args.sell_free) {
                    this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturnsellfree;
                    this.updatePageTitle();
                }
            }
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
                    this.goldCost = 0;
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
                    break;
                case 'getRailBonus':
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    //rail bonus.
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
                    dojo.addClass(active_train, 'animated');
                    break;
                case 'pass_event':
                case 'payLot':
                    //build building
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                case 'chooseBuildingToBuild_event':
                    // choose bonus
                case 'bonusChoice_build':
                case 'bonusChoice_event':
                case 'bonusChoice_eventRail':
                case 'bonusChoice_auction':
                    if (!this.isSpectator){
                        dojo.style(TRADE_BOARD_ID, 'order', -2);
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
                case 'chooseBuildingToBuild_event':
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
                case 'payLot':
                case 'bonusChoice':
                    this.disableTradeIfPossible();
                    break;
                case 'payWorkers':
                    this.showPay = false;
                    this.silverCost = 0;
                    this.goldCost = 0;
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
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    this.clearSelectable('bonus', true);
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
                    dojo.removeClass(active_train, 'animated');
                    this.disableTradeIfPossible();
                    break;
                case 'pass_event':
                    this.destroyPaymentBreadcrumb();
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
            this.current_args = args;
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
                    case 'endGameActions' :
                    case 'preEventTrade'  :
                        var methodName = "onUpdateActionButtons_" + stateName + "_notActive";
                        console.log('Calling ' + methodName, args);
                        this[methodName](args);
                    break;
                }
            } 
        }, 

        ///////////////////////////////////////////////////
        //// onUpdateActionButtons

        onUpdateActionButtons_allocateWorkers: function(args){
            this.active_p_id = args.active_p_id;
            LAST_SELECTED['worker'] ="";
            // show workers that are selectable
            dojo.query( `#player_zone_${PLAYER_COLOR[this.player_id]} .token_worker` ).addClass('selectable');
            // also make building_slots selectable.
            dojo.query( `#${TPL_BLD_ZONE}${PLAYER_COLOR[this.player_id]} .worker_slot` ).addClass( 'selectable' );

            if (this.player_id !== args.next_player ) {
                this.addActionButton( BTN_ID_WAIT, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_WAIT])), METHOD_WAIT );
            }
            this.addActionButton( BTN_ID_CONFIRM_WORKERS, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_CONFIRM_WORKERS])), METHOD_CONFIRM_WORKERS );
            this.addActionButton( BTN_ID_CANCEL, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), 'cancelUndoTransactions', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            let color = this.canAddTrade({'food':-1,'trade':-1})?'blue':'gray'; 
            this.addActionButton( BTN_ID_HIRE_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE])), METHOD_HIRE_WORKER, null, false, color );

            this.tradeEnabled = false;
            this.addTradeActionButton( false );
            if (HAS_BUILDING[this.player_id][BLD_WAREHOUSE]){
                this.setupWarehouseButtons();
            }
            this.resetTradeValues();
            this.setOffsetForIncome();
            this.destroyPaymentBreadcrumb();
            dojo.query(`#${BTN_ID_UNDO_PASS}`).forEach(dojo.destroy); // removes undo button if displayed.
        },
        // -non-active-
        onUpdateActionButtons_allocateWorkers_notActive(args){
            if (args.is_waiting){
                return;
            }
            if ((args.paid[this.player_id].has_paid==0 || this.undoPay) && this.showPay){
                this.allowTrade = true;
                this.silverCost = this.getPlayerWorkerCount(this.player_id);
                this.goldCost = 0;
                this.addPaymentButtons();
                this.addTradeActionButton();
                this.setOffsetForPaymentButtons();
            } 
            if (dojo.query(`#${BTN_ID_UNDO_PASS}`).length !=1){
                this.addActionButton(BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_INCOME]), 'onUnPass_allocateWorkers', null, false, 'red');
                dojo.place(BTN_ID_UNDO_PASS, 'generalactions', 'first');
            }
        },

        onUpdateActionButtons_payWorkers: function(){
            this.silverCost = this.getPlayerWorkerCount(this.player_id);
            this.goldCost = 0;
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
            this.addActionButton( BTN_ID_CONFIRM_DUMMY_BID, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_DUMMY_BID]), 'confirmDummyBidButton' );
        },
        onUpdateActionButtons_playerBid: function(args){
            LAST_SELECTED['bid'] = '';
            for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( BTN_ID_CONFIRM_BID, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_BID]), 'confirmBidButton' );
            this.addActionButton( BTN_ID_PASS_BID,    _(MESSAGE_STRINGS[MESSAGE_PASS]),    'passBidButton', null, false, 'red' );
        },
        onUpdateActionButtons_pass_event: function (args) {
            // state for pass bid event triggers.
            this.addActionButton( BTN_ID_ON_PASS_EVENT_DONE, _(MESSAGE_STRINGS[MESSAGE_DONE]), METHOD_ON_PASS_EVENT_DONE, null, false, 'blue');
            this.addActionButton( BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_PASS]), 'onUndoBidPass', null, false, 'red');
            if (args.event_pass == EVENT_NELSON_ACT){
                dojo.place(dojo.create("br"), 'generalactions', 'last');
                this.addActionButton( BTN_ID_PAY_LOAN_3_SILVER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_PAY_LOAN_3_SILVER])), METHOD_PAY_LOAN_3_SILVER, null, false, 'blue');
                
                this.addActionButton( BTN_ID_PAY_LESS_LOAN, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_PAY_OFF_LESS_LOAN])), METHOD_PAY_LESS_LOAN, null, false, 'blue');
                dojo.style( $( BTN_ID_PAY_LESS_LOAN ), 'display', 'none');
                this.addActionButton( BTN_ID_MORE_GOLD, this.replaceTooltipStrings( _(MESSAGE_STRINGS[MESSAGE_USE_MORE_GOLD])), METHOD_MORE_GOLD, null, false, 'gray');
                dojo.style( $( BTN_ID_MORE_GOLD ), 'display', 'none');
                this.addActionButton( BTN_ID_LESS_GOLD, this.replaceTooltipStrings( _(MESSAGE_STRINGS[MESSAGE_USE_LESS_GOLD])), METHOD_LESS_GOLD, null, false, 'gray');
                dojo.style( $( BTN_ID_LESS_GOLD ), 'display', 'none');

                dojo.place(dojo.create("div", {id:'cost_location', style:'display: inline-flex; align-content: center;'}), 'generalactions', 'last');
                this.loanCount = 0;
                
                dojo.place(dojo.create('span', {id:PAY_GOLD_TEXT, style:'display: none;', class:'font caps noshow'}), 'cost_location', 'last');
                dojo.place(dojo.create('span', {id:PAY_GOLD_TOKEN, style:'display: none;', class:'log_gold token_inline noshow'}), 'cost_location', 'last');
                $(PAY_GOLD_TEXT).innerHTML=0;
                this.goldCost = 0;
                this.GOLD_COUNTER.create(PAY_GOLD_TEXT);
                this.GOLD_COUNTER.setValue(this.goldCost);
                
                dojo.place(dojo.create('span', {id:PAY_SILVER_TEXT, style:'display: none;', class:'font caps noshow'}), 'cost_location', 'last');
                dojo.place(dojo.create('span', {id:PAY_SILVER_TOKEN, style:'display: none;', class:'log_silver token_inline noshow'}), 'cost_location', 'last');
                $(PAY_SILVER_TEXT).innerHTML=0;
                this.silverCost = 0;
                this.SILVER_COUNTER.create(PAY_SILVER_TEXT);
                this.SILVER_COUNTER.setValue(this.silverCost);

            } 
            this.addTradeActionButton();
        },
        onUpdateActionButtons_getRailBonus: function(args){
            this.addActionButton( BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_PASS]), 'onUndoBidPass', null, false, 'red');
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_auction: function(args){
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.can_cancel = true;
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_build: function(args){
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.can_cancel = true;
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_event: function(args){
            this.setupButtonsForRailBonus(args);
        },
        // does buttons for these
        setupButtonsForRailBonus: function (args){
            LAST_SELECTED.bonus  ="";
            for(let i in args.rail_options){
                let type = this.getKeyByValue(RESOURCES, args.rail_options[i]);
                const id = BONUS_OPTIONS[args.rail_options[i]];
                dojo.addClass(id, 'selectable');
                if (type == 'vp'){
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML.vp3, METHOD_SELECT_BONUS, null, false, 'gray');
                } else {
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML[type], METHOD_SELECT_BONUS, null, false, 'gray');
                }
            }
            this.addActionButton( BTN_ID_CHOOSE_BONUS, _(MESSAGE_STRINGS[MESSAGE_BONUS_CHOOSE]), METHOD_CHOOSE_BONUS);
            dojo.addClass( BTN_ID_CHOOSE_BONUS, 'disabled');
        },
        onUpdateActionButtons_payLot: function(args){
            this.silverCost = Number(args.lot_cost);
            this.goldCost = 0;
            this.addPaymentButtons(true);
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },
        onUpdateActionButtons_chooseLotAction: function(args){
            if ((args.lot_state & LOT_STATE_BUILD) >0){
                this.addActionButton( BTN_LOT_ACTION_BUILD, _(MESSAGE_STRINGS[MESSAGE_BUILD]), METHOD_LOT_ACTION_BUILD);
            }
            if ((args.lot_state & LOT_STATE_EVT_BONUS) >0){
                this.addActionButton( BTN_LOT_ACTION_EVENT, _(MESSAGE_STRINGS[MESSAGE_EVENT_BONUS]), METHOD_LOT_ACTION_EVENT);
            }
            if ((args.lot_state & LOT_STATE_AUC_BONUS) >0){
                this.addActionButton( BTN_LOT_ACTION_AUCTION, _(MESSAGE_STRINGS[MESSAGE_AUCTION_BONUS]), METHOD_LOT_ACTION_AUCTION);
            }
            this.addActionButton( BTN_LOT_ACTION_PASS, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_LOT_ACTION_PASS , null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
        },
        onUpdateActionButtons_chooseBuildingToBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            this.building_discount = args.event_discount;
            this.genericSetupBuildBuildings();
        },
        onUpdateActionButtons_trainStationBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            this.building_discount = false;
            this.genericSetupBuildBuildings();
        },
        // currently only bonus involving a choice is hire worker.
        onUpdateActionButtons_bonusChoice_build: function (args) {
            if (args.building_bonus == BUILD_BONUS_WORKER){
                this.addActionButton( BTN_ID_BONUS_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE_FREE])), 'workerForFreeBuilding');
            } 
            this.addActionButton( BTN_ID_PASS_BONUS,   _(MESSAGE_STRINGS[MESSAGE_BONUS_PASS]), 'passBonusBuilding', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]),  METHOD_CANCEL_TURN, null, false, 'red');
                this.can_cancel = true;
        },
        onUpdateActionButtons_bonusChoice_auction: function (args) {
            const option = Number(args.auction_bonus);
            switch (option){
                case AUC_BONUS_WORKER:
                case AUC_BONUS_WORKER_RAIL_ADV:
                    this.addActionButton( BTN_ID_BONUS_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE_FREE])) , 'workerForFreeAuction');
                break;
                case AUC_BONUS_WOOD_FOR_TRACK:
                    this.addActionButton( BTN_ID_WOOD_TRACK, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_WOOD_TRACK)), METHOD_WOOD_TRACK);
                break;
                case AUC_BONUS_COPPER_FOR_VP:
                    this.addActionButton( BTN_ID_COPPER_VP, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_COPPER_VP)), METHOD_COPPER_VP);
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( BTN_ID_GOLD_VP, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_GOLD_VP)), METHOD_GOLD_VP);
                    }
                    break;
                case AUC_BONUS_COW_FOR_VP:
                    this.addActionButton( BTN_ID_COW_VP, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_COW_VP)), METHOD_COW_VP);
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( BTN_ID_GOLD_VP, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_GOLD_VP)), METHOD_GOLD_VP);
                    }
                    break;
                case AUC_BONUS_6VP_AND_FOOD_VP:
                case AUC_BONUS_FOOD_FOR_VP:
                    this.addActionButton( BTN_ID_FOOD_VP, this.replaceTooltipStrings(dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]), ARR_FOOD_VP)), METHOD_FOOD_VP);
                    break;
                case AUC_BONUS_4DEPT_FREE:
                    break;
                case AUC_BONUS_3VP_SELL_FREE:
                    this.addActionButton( BTN_ID_EVENT_START_SELL, _(MESSAGE_STRINGS[MESSAGE_START_SELL]), 'clientState_sellAuction', null, false, 'blue');
                    break;
                case AUC_BONUS_TRACK_RAIL_ADV: // should not come here
                    break;
            }
            this.addActionButton( BTN_ID_PASS_BONUS, _(MESSAGE_STRINGS[MESSAGE_BONUS_PASS]), 'passBonusAuction', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.addTradeActionButton();
        },
        onUpdateActionButtons_confirmActions: function () {
            this.updateBuildingAffordability();
            this.addActionButton( BTN_ID_CONFIRM_ACTIONS, _(MESSAGE_STRINGS[MESSAGE_CONFIRM]), 'confirmBuildPhase');
            this.addActionButton( BTN_ID_REDO_AUCTION,    _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_endGameActions: function () {
            this.addActionButton( BTN_ID_DONE,   _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_ENDGAME_DONE);    
            this.addActionButton( BTN_ID_CANCEL, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), 'cancelUndoTransactions', null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions', 'last');
            
            this.addActionButton( BTN_ID_PAY_LOAN_SILVER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_PAY_DEBT_SILVER])), METHOD_PAY_LOAN_SILVER, null, false, 'blue' );
            this.addActionButton( BTN_ID_PAY_LOAN_GOLD, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_PAY_DEBT_GOLD])), METHOD_PAY_LOAN_GOLD, null, false, 'blue' );
            this.addActionButton( BTN_ID_HIRE_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE])), METHOD_HIRE_WORKER, null, false, 'blue' );
            this.addTradeActionButton( false );
        },
        onUpdateActionButtons_endGameActions_notActive: function () {
            this.addActionButton( BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_PASS]), 'onUnPass_endGameActions', null, false, 'red');
        },

        ////////////////////
        //// EVENTS onUpdateActionButtons states 
        ////////////////////
        onUpdateActionButtons_chooseBuildingToBuild_event: function (args) {
            this.allowed_buildings = args.allowed_buildings;
            this.building_discount = false;
            this.genericSetupBuildBuildings();
        },

        onUpdateActionButtons_preEventTrade: function (args) {
            let bonus_id = Number(args.bonus_id);
            this.current_args = args;
            //console.log(args, bonus_id);
            switch(bonus_id){
                case EVENT_WARTIME_DEMAND:
                    console.log('wartime_demand');
                    this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturntrade;
                    this.addActionButton( BTN_ID_EVENT_START_SELL, _(MESSAGE_STRINGS[MESSAGE_START_SELL]), 'clientState_sellEvent', null, false, 'blue');
                    this.addActionButton( BTN_ID_EVENT_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_EVENT_DONE]), METHOD_EVENT_DONE_TRADING, null, false, 'blue');
                    dojo.place(dojo.create('br'),'generalactions','last');
                    this.addActionButton( BTN_ID_TRADE_TOGGLE,_(MESSAGE_STRINGS[MESSAGE_TRADE_SHOW]),  METHOD_TRADE_TOGGLE, null, false, 'gray' );
                    this.addActionButton( BTN_ID_TAKE_LOAN,  _(MESSAGE_STRINGS[MESSAGE_TAKE_LOAN]), METHOD_TAKE_LOAN, null, false, 'gray' );
                    this.addActionButton( BTN_ID_UNDO_TRADE, _(MESSAGE_STRINGS[MESSAGE_TRADE_UNDO]), METHOD_UNDO_TRADE, null, false, 'red' );
                    this.updateConfirmAndUndoTradeButtons();
                    this.updateTradeAffordability();
                    this.resetTradeValues();
                    this.enableTradeBoardActions();
                    break;
                case EVENT_SHARECROPPING:
                    console.log('sharecropping');
                    this.addActionButton( BTN_ID_PAY_LOAN_FOOD, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_PAY_DEBT_FOOD])), METHOD_PAY_LOAN_FOOD, null, false, 'blue' );
                    this.addActionButton( BTN_ID_EVENT_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_EVENT_DONE_TRADING, null, false, 'blue');
                    this.addTradeActionButton();
                    this.addActionButton( BTN_ID_CANCEL, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), 'cancelEventTransactions', null, false, 'red');
                    break;
                case EVENT_STATE_FAIR:
                    console.log('state_fair');
                    this.addActionButton( BTN_ID_EVENT_DONE_HIDDEN_TRADING, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_EVENT_DONE_HIDDEN, null, false, 'blue');
                    dojo.place(dojo.create('br'),'generalactions','last');
                    this.addActionButton( BTN_ID_TRADE_TOGGLE, _(MESSAGE_STRINGS[MESSAGE_TRADE_SHOW]), METHOD_TRADE_TOGGLE, null, false, 'gray' );
                    this.addActionButton( BTN_ID_TAKE_LOAN, _(MESSAGE_STRINGS[MESSAGE_TAKE_LOAN]), METHOD_TAKE_LOAN, null, false, 'gray' );
                    this.addActionButton( BTN_ID_UNDO_TRADE, _(MESSAGE_STRINGS[MESSAGE_TRADE_UNDO]), METHOD_UNDO_TRADE, null, false, 'red' );
                    this.addActionButton( BTN_ID_CONFIRM_TRADE_HIDDEN, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_TRADE]), METHOD_CONFIRM_TRADE_HIDDEN);
                    //this.updateConfirmAndUndoTradeButtons();
                    this.addActionButton( BTN_ID_CANCEL, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), 'cancelHiddenUndoTransactions', null, false, 'red');

                    this.updateTradeAffordability();
                    this.enableTradeBoardActions();
                    this.resetTradeValues();
                    this.setHiddenTrades(args._private);
                    
                    // players get trade opportunity (trades are hidden during this phase).
                    // then reveal amount of Copper+Cow
                    // the player(s) with the most (at least 1) get a gold.
                    break;
                case EVENT_EAGER_INVESTORS:
                case EVENT_TIMBER_CULTURE_ACT:
                default:
                    console.log('default');
                    this.addActionButton( BTN_ID_EVENT_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_EVENT_DONE_TRADING, null, false, 'blue');
                    this.addTradeActionButton();
                    this.addActionButton( BTN_ID_CANCEL, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), 'cancelEventTransactions', null, false, 'red');
            }
        },
        onUpdateActionButtons_preEventTrade_notActive: function (args){
            let bonus_id = args.bonus_id;
            this.current_args = args;
            switch(bonus_id){
                case EVENT_WARTIME_DEMAND:
                    this.addActionButton( BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_PASS]), 'onUnPass_preEventTrade', null, false, 'red');
                    break;
                case EVENT_STATE_FAIR:
                    this.addActionButton( BTN_ID_UNDO_PASS, _(MESSAGE_STRINGS[MESSAGE_UNDO_PASS]), 'onUnPass_preEventTrade', null, false, 'red');
                    this.resetTradeValues();
                    this.setHiddenTrades(args._private);
                    break;
            }
        },

        onUpdateActionButtons_bonusChoice_eventBuild: function (args){
            this.onUpdateActionButtons_bonusChoice_build(args);
        },

        onUpdateActionButtons_bonusChoice_eventRail: function (args) {
            // 'EVENT_BANK_FAVORS' & 'EVENT_RESIDENTIAL_DOMINANCE' get track adv
            this.setupButtonsForRailBonus(args.args[this.player_id]);
            // replace the choose_bonus button with event specific choose_bonus button
            dojo.destroy(BTN_ID_CHOOSE_BONUS);
            this.addActionButton( BTN_ID_CHOOSE_BONUS, _(MESSAGE_STRINGS[MESSAGE_BONUS_CHOOSE]), METHOD_CHOOSE_BONUS_EVENT);
            if (LAST_SELECTED.bonus == ""){
                dojo.addClass(BTN_ID_CHOOSE_BONUS, 'disabled');
            } else {
                let type = LAST_SELECTED.bonus;
                let btn_id = `btn_bonus_${type}`;
                dojo.toggleClass(btn_id, 'bgabutton_blue');
                dojo.toggleClass(btn_id, 'bgabutton_gray');
            }
        },

        onUpdateActionButtons_bonusChoice_event: function (args){
            this.addActionButton( BTN_ID_BONUS_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE_FREE])), 'workerForFreeEvent');
            this.addActionButton( BTN_ID_PASS_BONUS, _(MESSAGE_STRINGS[MESSAGE_BONUS_PASS]), METHOD_PASS_BONUS, null, false, 'red');
        },

        onUpdateActionButtons_eventPay: function (args){
            this.silverCost= args.cost[this.player_id];
            this.goldCost = 0;
            this.addPaymentButtons(true);
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },
        onUpdateActionButtons_bonusChoice_lotEvent: function (args){ 
            let option = Number(args.event);
            switch (option){
                case EVENT_RAILROAD_CONTRACTS: // auction winners can pay 2 silver for advance railroad track
                    this.addActionButton( BTN_ID_EVENT_SILVER_RAIL_ADVANCE,this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_EVENT_SILVER_RAIL_ADVANCE])) , METHOD_EVENT_SILVER_RAIL_ADVANCE);
                break;
                case EVENT_MIGRANT_WORKERS: // Auc 1 also gives worker
                    this.addActionButton( BTN_ID_BONUS_WORKER, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_HIRE_FREE])), 'workerForFreeLotEvent');
                break;
                case EVENT_INDUSTRIALIZATION:
                    this.addActionButton( BTN_ID_EVENT_STEEL_BUILD, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_EVENT_STEEL_BUILD])) , METHOD_EVENT_STEEL_BUILD);
                break;
            }
            this.addActionButton( BTN_ID_PASS_BONUS, _(MESSAGE_STRINGS[MESSAGE_BONUS_PASS]), 'passBonusLotEvent', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.addTradeActionButton();
        },
        
        ////////////////////
        //// END updateActionButtons
        ///////////////////////////////////////////////////

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
                $("round_text").innerHTML=_(MESSAGE_STRINGS[MESSAGE_FINAL_ROUND]);
                dojo.query(`#${TILE_CONTAINER_ID[BLD_LOC_OFFER]}`).addClass('noshow');
            } else {
                this.ROUND_COUNTER.setValue(round_number);
            }
                this.showCurrentAuctions(auction_tiles, round_number);
            if (this.use_events){
                this.updateEventBanner(round_number);
                this.updateEventCards(round_number);
            }
            this.showHideButtons();
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

        /***** Auction utils ******/
        setupAuctionTiles: function (auctions, info){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location != 0 /* AUC_LOC_DISCARD */) {
                    this.createAuctionTile(a_id, auction.location, info);
                }
            }
        },

        createAuctionTile: function (a_id, location, info){
            let color = ASSET_COLORS[10+Number(location)];
            let text_auction_html = this.format_block('jptpl_auction_card', {auc: a_id, color:color, 'card':this.formatTooltipAuction(info, a_id)});
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), `future_auction_${location}`);
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, text_auction_html);
            } else {
                dojo.place(text_auction_html, `future_auction_${location}`);
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
            this.current_auction = 0;
            if (round_number){// not null.
                if (round_number == 11 || auctions.length == 0){
                    this.current_auction = 1;
                    return;
                }
            }
            // determine current auction (if in middle of build phase)
            let first_avail_auction = 4;
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

        /***** events utils ******/
        createEventCards: function(current_round){
            for (let i in this.events){
                let e_id = this.events[i].e_id;
                let event = EVENT_INFO[e_id];
                let position = Number(this.events[i].position);
                let destination_loc = (position >= current_round)?TILE_ZONE_DIV_ID[EVT_LOC_MAIN]:TILE_ZONE_DIV_ID[EVT_LOC_DISCARD];

                if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                    dojo.place(this.format_block( 'jstpl_event_tile', {'KEY': e_id, 'POS':this.events[i].position}), destination_loc);
                    this.addTooltipHtml( `${TPL_EVT_TILE}_${e_id}`, 
                        this.format_block('jptpl_evt_tt',  
                        {
                            KEY: "",
                            POS: position, 
                            TITLE: _("Round ") + position + ":<br>" + this.replaceTooltipStrings(event.name), 
                            DESC: this.replaceTooltipStrings(event.tt)
                        }));
                } else {
                    dojo.place(this.format_block('jptpl_evt_tt', 
                    {
                        KEY: this.events[i].e_id,
                        POS: this.events[i].position, 
                        TITLE: _("Round ") + this.events[i].position + ":<br>" + this.replaceTooltipStrings(event.name), 
                        DESC: this.replaceTooltipStrings(event.tt)
                    }), destination_loc,'last');
                }
            }
        },

        updateEventBanner: function(current_round){
            for(var i in this.events){
                if (Number(this.events[i].position) == current_round){
                    break;  
                }
            }
            
            if (this.events[i] != null){
                let currentEvent = EVENT_INFO[this.events[i].e_id];
                let eventName = this.replaceTooltipStrings(_(currentEvent.name));
                let eventText = this.replaceTooltipStrings(_(currentEvent.tt));
                dojo.place(`<div id="eventsBar" class="font"><span class="bold">${eventName}: </span>${eventText}</div>`, 'eventsBar', 'replace');
                if (this.events[i].e_id == 2){
                    let tile = dojo.query(`#${TPL_AUC_ZONE}1 .auction_tile`);
                    tile.addClass('unavailable');
                }
            } else {
                dojo.style(`eventsBar`,'display', 'none');
            }
        },

        updateEventCards: function (current_round){
            for(var i in this.events){
                const position = Number(this.events[i].position);
                const e_id = Number(this.events[i].e_id);
                if (position < current_round){
                    console.log(`${TPL_EVT_TILE}_${e_id}`, `${TILE_ZONE_DIV_ID[EVT_LOC_DISCARD]}`);
                    this.moveObject(`${TPL_EVT_TILE}_${e_id}`, `${TILE_ZONE_DIV_ID[EVT_LOC_DISCARD]}`, 'last');
                }
            }
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
                const wasInMain = (dojo.query( `#${TILE_ZONE_DIV_ID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
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
            if (b_id == BLD_WAREHOUSE && building.state != 0){
                this.updateWarehouseState(building.state);
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
            this.addActionButton( BTN_ID_BUILD_BUILDING, dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_BUILD]), 
                {building_name:`<span id="${BUILDING_NAME_ID}"></span>`}), METHOD_BUILD_BUILDING);
            dojo.addClass(BTN_ID_BUILD_BUILDING ,'disabled');
            const noBuildMessage = this.rail_no_build?this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_DO_NOT_BUILD_ALT])):_(MESSAGE_STRINGS[MESSAGE_DO_NOT_BUILD]);
            this.addActionButton( BTN_ID_DO_NOT_BUILD, noBuildMessage, 'doNotBuild', null, false, 'red');
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            this.can_cancel = true;
            this.addTradeActionButton();

            replacers = dojo.create('div', {id:REPLACER_ZONE_ID, style:'display:inline-flex;'});
            dojo.place(replacers, 'generalactions', 'last');
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                let goldAsString = _(MESSAGE_STRINGS[MESSAGE_GOLD_AS_TYPE]); 
                if (this.goldAsCow){
                    this.addActionButton( BTN_ID_GOLD_COW, dojo.string.substitute(goldAsString, {begin:"<div id='cow_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), METHOD_GOLD_COW, null, false, 'blue');
                } else {
                    this.addActionButton( BTN_ID_GOLD_COW, dojo.string.substitute(goldAsString, {begin:"<div id='cow_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), METHOD_GOLD_COW, null, false, 'red');
                }
                if (this.goldAsCopper){
                    this.addActionButton( BTN_ID_GOLD_COPPER, dojo.string.substitute(goldAsString, {begin:"<div id='copper_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), METHOD_GOLD_COPPER, null, false, 'blue');
                } else {
                    this.addActionButton( BTN_ID_GOLD_COPPER, dojo.string.substitute(goldAsString, {begin:"<div id='copper_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), METHOD_GOLD_COPPER, null, false, 'red');
                }
                dojo.place(BTN_ID_GOLD_COW, REPLACER_ZONE_ID, 'last');
                dojo.style(BTN_ID_GOLD_COW, 'display', 'none');
                dojo.place(BTN_ID_GOLD_COPPER, REPLACER_ZONE_ID, 'last');
                dojo.style(BTN_ID_GOLD_COPPER, 'display', 'none');
            }
            if (HAS_BUILDING[this.player_id][BLD_LUMBER_MILL]){
                this.lumberMill_WoodVP_Steel=0;
                this.addActionButton( BTN_ID_MORE_STEEL, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_MORE_WOOD_STEEL])), METHOD_MORE_STEEL, null, false, 'gray');
                this.addActionButton( BTN_ID_LESS_STEEL, this.replaceTooltipStrings(_(MESSAGE_STRINGS[MESSAGE_LESS_WOOD_STEEL])), METHOD_LESS_STEEL, null, false, 'gray');
                dojo.place(BTN_ID_MORE_STEEL, REPLACER_ZONE_ID, 'last');
                dojo.style( $(BTN_ID_MORE_STEEL), 'display', 'none');
                dojo.place(BTN_ID_LESS_STEEL, REPLACER_ZONE_ID, 'last');
                dojo.style( $(BTN_ID_LESS_STEEL), 'display', 'none');
            }
        },

        addBuildingToOffer: function(building){
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            const b_loc = TILE_ZONE_DIV_ID[building.location];
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

        formatTooltipBuilding: function(b_id, b_key, msg_id = null){
            let b_info = BUILDING_INFO[b_id];
            var vp = 'vp'+ ( b_info.vp == null?'0':(Number(b_info.vp)==1)?'':Number(b_info.vp));

            var msg = (msg_id == null? "": 
                `<div class="tt_flex"><span class="tt tt_top" style="color:${COLOR_MAP[msg_id]};">${_(MESSAGE_STRINGS[msg_id])}</span></div><hr>`);
            return this.format_block('jptpl_bld_tt', {
                msg: msg,
                type:  ASSET_COLORS[b_info.type],
                stage: _(STAGE_STRINGS[b_info.stage]),
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

        // auction
        formatTooltipAuction: function(a_info, a_id){
            var tt = '<div style="text-align: center;" class="font">';
            var auction_no = Math.ceil(a_id/10); // (1-10) = 1; (11-20) = 2; etc...
            if (auction_no== 1) {// order fixed in A-1
                let round_string = dojo.string.substitute(_('Round ${a_id}'),{a_id:a_id});
                var title = `<span class="font caps bold a1">${round_string} </span><hr>`;
            } else { //order by phase in other auctions
                if ((a_id-1)%10 <4){
                    var phase = _(STAGE_STRINGS[1]);
                } else if ((a_id-1)%10 >7){
                    var phase = _(STAGE_STRINGS[4]);
                } else {
                    var phase = _(STAGE_STRINGS[3]);
                }
                var title = `<span class="font caps bold a${auction_no}">${phase}</span><hr>`
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
                if (a_info[a_id].bonus){
                    bonus_html += this.replaceTooltipStrings(_(AUCTION_BONUS_STRINGS[a_info[a_id].bonus]));
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
        replaceTooltipStrings: function(inputString){
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
            
            if ('desc' in b_info){
                full_desc += this.replaceTooltipStrings(_(b_info.desc));
            } 

            if ('on_b' in b_info){
                let on_build_desc = "";
                if (b_info.on_b){
                    if (b_info.on_b == 8){ //BUILD_BONUS_PLACE_RESOURCES
                        on_build_desc += `<div id="${WAREHOUSE_DESCRIPTION_ID}">`;
                        on_build_desc += this.replaceTooltipStrings(_(BUILD_BONUS_STRINGS[b_info.on_b]));
                        on_build_desc += `</div>`;
                        on_build_desc += `<div id="${WAREHOUSE_RES_ID}"></div>`;
                    } else {
                        on_build_desc += this.replaceTooltipStrings(_(BUILD_BONUS_STRINGS[b_info.on_b]));
                    }
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
                        var vp_b = dojo.string.substitute(END, {end:TOKEN_HTML.end, vp:TOKEN_HTML.vp, type:this.format_block('jstpl_color_log', {string: MESSAGE_STRINGS[b_info.vp_b], color:ASSET_COLORS[b_info.vp_b]} )} );
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
                        var vp_b = dojo.string.substitute(_("End: ${vp} per ${loan} paid off (during endgame actions, loans paid during game are ignored)"), {vp:TOKEN_HTML.vp, loan:TOKEN_HTML.loan} );
                        break;
                }
                full_desc += vp_b +'<br>';
            }
            if ('trade' in b_info){
                switch(b_info.trade){
                    case 1: //MARKET
                        var translatedString = _("Allows trades: ${start}${trade}${wood} ${arrow}${food}${mid}${trade}${food} ${arrow} ${steel}${end}");
                        full_desc += dojo.string.substitute(translatedString, 
                        {start: `<div id="${b_key}_${BLD_ID_MARKET_FOOD}" class="market_food trade_option">`,
                         mid:   `</div><div id="${b_key}_${BLD_ID_MARKET_STEEL}" class="market_steel trade_option">`,
                         end:   "</div>",
                         trade: TOKEN_HTML.trade, 
                         wood:  TOKEN_HTML.wood, 
                         arrow: TOKEN_HTML.arrow, 
                         food:  TOKEN_HTML.food,
                         steel: TOKEN_HTML.steel,});
                    break;
                    case 2: //BANK
                        var translatedString = _("Allows trades: ${start}${trade} ${arrow} ${silver}${end}");
                        full_desc += dojo.string.substitute(translatedString, 
                        {start:  `<div id="${BLD_ID_TRADE_BANK}" class="trade_option">`,
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
            if (!('inc' in b_info) && !('slot' in b_info)){
                income_values = this.format_block('jstpl_color_log', {string:_("none"), color:''});
            }
            if ('inc' in b_info){
                if (b_info.inc.silver =='x'){
                    income_values = this.replaceTooltipStrings(_('${silver} per ${worker} (max 5)'));
                } else if (b_info.inc.loan == '-1') {
                    income_values = dojo.string.substitute(_('Pay off ${loan}'), {loan:TOKEN_HTML.loan}) + '<br>';
                } else if (b_info.inc.special == '1') {
                    income_values = dojo.string.substitute(_('Take one resource from Warehouse'));
                } else {
                    income_values = this.getResourceArrayHtmlBigVp(b_info.inc, true);
                }
            }
            if ('slot' in b_info){
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
            let text_building_html = this.formatTooltipBuilding(b_id, b_key);
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), destination);
                this.addTooltipHtml( `${TPL_BLD_TILE}_${b_key}`, text_building_html);
                this.addBuildingTradeActionsAndWorkerSlots(b_id, b_key);
                this.setupBuildingWorkerSlots(b_id, b_key);
            } else { // use text instead of art.
                dojo.place(this.format_block('jptpl_bld_text', {key: b_key, id: b_id, 'card':text_building_html}), destination);
                this.setupBuildingWorkerSlots(b_id, b_key);
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (MAIN_BUILDING_COUNTS[b_id] == 0 || !(b_id in MAIN_BUILDING_COUNTS)){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), TILE_ZONE_DIV_ID[building.location]);
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
        
        updateWarehouseState: function(state, p_id=null){
            let new_state = state;
            let old_state = this.warehouse_state;
            let stateDiff = new_state ^ old_state;
            for(let bit = 1; bit <=stateDiff; bit <<= 1){
                if (stateDiff & old_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], false, p_id);
                } else if (stateDiff & new_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], true, p_id);
                }
            }
            this.warehouse_state = state;
        },

        updateWarehouseResource: function(type, add, p_id){
            let origin = 'limbo';
            if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                dojo.query(`#${WAREHOUSE_DESCRIPTION_ID}`).addClass('noshow');
                dojo.style( $( WAREHOUSE_RES_ID ), 'position', 'unset');
            }
            if (add){
                let tkn_id = `warehouse_${type}`;
                let resToken = dojo.create('span', {class: `log_${type} token_inline`, title:type, id:tkn_id});
                dojo.style(resToken,'order', this.getKeyByValue(WAREHOUSE_MAP, type));
                if (p_id){
                    origin = TRACK_TOKEN_ZONE[p_id];
                    this.incResCounter(p_id, type, -1);
                }
                dojo.place(resToken, origin, 'first');
                this.moveObject(tkn_id, WAREHOUSE_RES_ID);
            } else {
                if (p_id){
                    origin = TRACK_TOKEN_ZONE[p_id];
                    this.incResCounter(p_id, type, 1);
                }
                this.slideToObjectAndDestroy(`warehouse_${type}`, origin, 500, 0 );
            }
        },

        getWarehouseResources: function (){
            let state = this.warehouse_state;
            let resources = [];
            for(let bit = 1; bit <=state; bit <<= 1){
                if (state & bit){
                    let type = WAREHOUSE_MAP[bit];
                    resources[type] = 1;
                } 
            }
            return resources;
        },
        
        updateHasBuilding: function (p_id, b_id, state = true) {
            if (!(p_id in HAS_BUILDING)){
                HAS_BUILDING[p_id] = [];
            }
            if (!(b_id in HAS_BUILDING[p_id])){
                HAS_BUILDING[p_id][b_id] = state;
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
         * type locators are set in this TYPE_SELECTOR.
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
        addPaymentButtons: function( bypass= false ){
            if (!bypass && !this.showPay) return;
            this.addActionButton( BTN_ID_PAY_DONE, dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_PAY_AMT]), {amt:this.format_block("jstpl_pay_button", {})}), METHOD_DONE_PAY);
            
            this.SILVER_COUNTER.create(PAY_SILVER_TEXT);
            this.SILVER_COUNTER.setValue(this.silverCost);
            this.GOLD_COUNTER.create(PAY_GOLD_TEXT);
            this.GOLD_COUNTER.setValue(this.goldCost);
            this.addActionButton( BTN_ID_MORE_GOLD, this.replaceTooltipStrings( _(MESSAGE_STRINGS[MESSAGE_USE_LESS_GOLD])), METHOD_MORE_GOLD, null, false, 'gray');
            this.addActionButton( BTN_ID_LESS_GOLD, this.replaceTooltipStrings( _(MESSAGE_STRINGS[MESSAGE_USE_MORE_GOLD])), METHOD_LESS_GOLD, null, false, 'gray');
            dojo.style( $( BTN_ID_LESS_GOLD ), 'display', 'none');
        },
        //METHOD_LESS_GOLD
        lowerGold: function(){
            if (this.goldCost <1){return;}
            this.goldCost --;
            this.GOLD_COUNTER.setValue(this.goldCost);
            this.silverCost +=5;
            if (this.silverCost >0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'inline-flex');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'inline-flex');
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'inline-flex');
                this.SILVER_COUNTER.setValue(this.silverCost);
            }
            if(this.goldCost == 0){
                dojo.style( $(PAY_GOLD_TEXT), 'display', 'none');
                dojo.style( $(PAY_GOLD_TOKEN), 'display', 'none');
                dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },
        //METHOD_MORE_GOLD
        raiseGold: function(){
            if (this.silverCost <0) return;
            dojo.style( $(PAY_GOLD_TEXT), 'display', 'inline-flex');
            dojo.style( $(PAY_GOLD_TOKEN), 'display', 'inline-flex');
            dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'inline-flex');

            this.goldCost++;
            this.GOLD_COUNTER.setValue(this.goldCost);
            this.silverCost -= 5;
            this.SILVER_COUNTER.setValue(Math.max(0 , this.silverCost));
            if (this.silverCost <= 0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'none');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'none');
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        /** METHOD_MORE_STEEL
         * lumbermill build cost replace button
         */
        raiseWoodSteel: function(){
            this.raiseCostReplace('steel');
        },
        
        /** METHOD_LESS_STEEL
         * lumbermill build cost replace button
         */
        lowerWoodSteel: function() {
            this.lowerCostReplace('steel');
        },

        resetCostReplace: function() {
            for (let type in COST_REPLACE_TYPE){
                this.cost_replace[type] = 0;
            }
        },

        raiseCostReplace: function (type) {
            if (!(type in this.buildingCost) || this.buildingCost[type] >= 0) return;
            dojo.style( $(`btn_less_${type}`), 'display', 'inline-flex');

            this.addOrSetArrayKey(this.cost_replace, type, 1);
            this.createBuildingBreadcrumb();
            if (this.buildingCost[type] == 0){//can't replace any more.
                dojo.style( $(`btn_more_${type}`), 'display', 'none');
            }
        },

        lowerCostReplace: function (type) {
            if (!(type in this.buildingCost) || !(type in this.cost_replace) || this.cost_replace[type]<=0 ) return;
            
            dojo.style( $(`btn_more_${type}`), 'display', 'inline-flex');

            this.addOrSetArrayKey(this.cost_replace, type, -1);
            if (this.cost_replace[type] == 0){//can't replace any less.
                dojo.style( $(`btn_less_${type}`), 'display', 'none');
            }
            this.createBuildingBreadcrumb();
        },

        /**
         * Set offset & New values to include cost & transactions.
         */
        setOffsetForPaymentButtons: function( ) {
            // silver
            let silver_offset = this.getOffsetValue('silver');
            if (this.silverCost >0){
                silver_offset -= this.silverCost;
            } 
            this.setOffset('silver', silver_offset);

            // gold
            let gold_offset = this.getOffsetValue('gold');
            if (this.goldCost >0){
                gold_offset -= this.goldCost;
            }
            this.setOffset('gold', gold_offset);

            let loan_offset = this.getOffsetValue('loan');
            if (this.loanCount){
                loan_offset -= this.loanCount;
            }
            this.setOffset('loan', loan_offset);

            this.updateBuildingAffordability();
            this.updateTradeAffordability();
            
            this.createPaymentBreadcrumb({
                'silver':Math.min(0,(-1 * this.silverCost)), 
                'gold':  Math.min(0,(-1 * this.goldCost)),
                'loan':  Math.min(0,(-1 * this.loanCount?? 0)),
            });
        },

        /***** BREADCRUMB METHODS *****/
        createTradeBreadcrumb: function(id, text, tradeAway, tradeFor){
            dojo.place(this.format_block( 'jptpl_breadcrumb_trade', 
            {
                id: id, 
                text:text, 
                away:this.getResourceArrayHtml(tradeAway, true, "position: relative; top: 9px;"),
                for:this.getResourceArrayHtml(tradeFor, true, `position: relative; top: 9px;`)}
                ), `breadcrumb_transactions`, 'before');
                TRADE_CONNECT_HANDLER[id] = dojo.connect($(`x_${id}`), 'onclick', this, 'undoTransaction' );
        },

        createFreeTradeBreadcrumb: function(id, text, tradeAway, tradeFor){
            dojo.place(this.format_block( 'jptpl_breadcrumb_trade', 
            {
                id: id, 
                text:text, 
                away:this.getResourceArrayHtml(tradeAway, true, "position: relative; top: 9px;"),
                for:this.getResourceArrayHtml(tradeFor, true, `position: relative; top: 9px;`)}
                ), `breadcrumb_transactions`, 'before');
                TRADE_CONNECT_HANDLER[id] = dojo.connect($(`x_${id}`), 'onclick', this, 'undoSellFreeTransaction' );
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

        createBuildingBreadcrumb: function(){
            // defaults are ??? building with no cost. (when no building is selected)
            let b_id = 0;
            let b_name=_("???"); 
            let b_type=4; 
            let cost={};
            if (LAST_SELECTED.building != ''){
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
                    } else if (b_id == BLD_WAREHOUSE){
                        if (this.warehouse != ''){
                            INCOME_ARRAY[b_id][this.warehouse] = 1;
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
                        this.incOffset(type, income);
                        this.updateBuildingAffordability();
                        this.updateTradeAffordability();
                    }
                }
                this.createIncomeBreadcrumb(id);
            }
        },

        clearOffset: function(type = null) {
            if (type){
                dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}.income`).removeClass('income');
            } else {
                for(type in RESOURCE_ARRAY){
                    dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}.income`).removeClass('income');
                    OFFSET_RESOURCE_AMOUNT[type]=0;
                    NEW_RESOURCE_AMOUNT[type] = BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue();
                }
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
         * if log has 1+ show undo
         */
        setupUndoTransactionsButtons: function(){
            this.setupTransitionButton();
            this.updateConfirmAndUndoTradeButtons();
        },

        setupTransitionButton: function( ){
            const noTrade = TRANSACTION_LOG.length == 0;
            SPECIAL_TRANSITION_BUTTONS.forEach(button_id => {
                if (dojo.query(`#${button_id}`).length == 1){
                    if (button_id === BTN_ID_PAY_DONE){
                        if (noTrade) {
                                var button_text = dojo.string.substitute(_("Pay: ${amt}"), {amt:this.format_block("jstpl_pay_button", {})});
                            } else {
                                var button_text = dojo.string.substitute(_("Confirm Trade(s) & Pay: ${amt}"), {amt:this.format_block("jstpl_pay_button", {})});
                            }
                        var button_method = METHOD_DONE_PAY;
                            dojo.query(`#${button_id}`).forEach(dojo.destroy);
                            this.addActionButton( button_id, button_text, button_method);
                            dojo.place(button_id, 'generalactions', 'first');
                            this.SILVER_COUNTER.create(PAY_SILVER_TEXT);
                            this.SILVER_COUNTER.setValue(Math.max(0 , this.silverCost));
                            if (this.silverCost <= 0){
                                dojo.style( $(PAY_SILVER_TEXT), 'display', 'none');
                                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'none');
                                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'none');
                            }
                            this.GOLD_COUNTER.create(PAY_GOLD_TEXT);
                            this.GOLD_COUNTER.setValue(this.goldCost);
                            if(this.goldCost > 0){
                            dojo.style( $(PAY_GOLD_TEXT), 'display', 'inline-flex');
                            dojo.style( $(PAY_GOLD_TOKEN), 'display', 'inline-flex');
                            dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'inline-flex');
                            }
                            //console.log(this.silverCost, this.goldCost);
                        return;
                    }
                    if (button_id === BTN_ID_BUILD_BUILDING){
                        let b_name = '';
                        if (LAST_SELECTED.building != ''){
                            let b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                            b_name = _(BUILDING_INFO[b_id].name); 
                        }
                        if (noTrade) {
                            var button_text = dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_BUILD]), {building_name:`<span id="${BUILDING_NAME_ID}">${b_name}</span>`});
                        } else {
                            var button_text = dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_BUILD_CONFIRM]), {building_name:`<span id="${BUILDING_NAME_ID}">${b_name}</span>`});
                        }
                        var button_method = METHOD_BUILD_BUILDING;
                            dojo.query(`#${button_id}`).forEach(dojo.destroy);
                        this.addActionButton( button_id, button_text, button_method);
                        dojo.place(button_id, 'generalactions', 'first');
                        return;
                    }
                }
            });
            TRANSITION_OBJECTS.forEach(transition_group => {
                const button_id = transition_group.id;
                if (dojo.query(`#${button_id}`).length == 1){
                    if (button_id == BTN_ID_ON_PASS_EVENT_DONE){ // for nelson act bug.
                        var message = (noTrade && !this.loanCount) ? _(transition_group.default) : _(transition_group.confirm);
                    } else {
                        var message = noTrade ? _(transition_group.default) : _(transition_group.confirm);
                    }
                    const button_text = this.replaceTooltipStrings(message, transition_group.sub);
                    const button_method = transition_group.method;
                    dojo.query(`#${button_id}`).forEach(dojo.destroy);
                    this.addActionButton( button_id, button_text, button_method);
                    dojo.place(button_id, 'generalactions', 'first');
                    return;
                }
            });
            TRANSITION_OBJECTS_X_FOR_Y.forEach(transition_group => {
                const button_id = transition_group.id;
                if (dojo.query(`#${button_id}`).length == 1){
                    const message = noTrade ? _(MESSAGE_STRINGS[MESSAGE_X_FOR_Y]) : _(MESSAGE_STRINGS[MESSAGE_X_FOR_Y_CONFIRM]);
                    const button_text = this.replaceTooltipStrings( dojo.string.substitute(message, transition_group.arr));
                    const button_method = transition_group.method;
                    dojo.query(`#${button_id}`).forEach(dojo.destroy);
                    this.addActionButton( button_id, button_text, button_method);
                    dojo.place(button_id, 'generalactions', 'first');
                    return;
                }
            });
        },
            
        addTradeActionButton: function( addBreak = true ){
            if (addBreak){
                dojo.place(dojo.create('br'),'generalactions','last');
            }
            this.addActionButton( BTN_ID_TRADE_TOGGLE, _(MESSAGE_STRINGS[MESSAGE_TRADE_SHOW]), METHOD_TRADE_TOGGLE, null, false, 'gray' );
            this.addActionButton( BTN_ID_TAKE_LOAN,    _(MESSAGE_STRINGS[MESSAGE_TAKE_LOAN]),  METHOD_TAKE_LOAN,  null, false, 'gray' );
            this.addActionButton( BTN_ID_UNDO_TRADE,   _(MESSAGE_STRINGS[MESSAGE_TRADE_UNDO]), METHOD_UNDO_TRADE, null, false, 'red'  );
            this.addActionButton( BTN_ID_CONFIRM_TRADE, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_TRADE]), METHOD_CONFIRM_TRADE, null, false, 'blue' );
            this.updateConfirmAndUndoTradeButtons();
            
            dojo.style(TRADE_BOARD_ID, 'order', 2);
            this.updateTradeAffordability();
            this.resetTradeValues();
            this.enableTradeBoardActions();
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
         * METHOD_TRADE_TOGGLE
         *  primary trade button (can be in 2 states)
         * show trade 
         *  - if have at least 1 trade token, on trade enabled state
         *  - bgabutton_gray
         * hide trade 
         *  - if trade buttons already displayed, but no trades selected
         *  - bgabutton_red
         */
        tradeActionButton: function( ){
            if(  (this.currentState=='allocateWorkers' && this.allowTrade) || this.checkAction( 'trade' ) ){
                this.setTradeButtonToShow( this.tradeEnabled );
                if (this.tradeEnabled){// hide trade
                    this.disableTradeIfPossible();
                } else {// show trade
                this.enableTradeIfPossible(); 
                }
            }
        },
       
        /** 
         * Enable Trade
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
                var translatedString = _("Buy:");
                buy_text.innerText = translatedString;
                let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:zone_style});
                dojo.place(sell_zone, TRADE_ZONE_ID, 'last');
                let sell_text = dojo.create('span', {class:"biggerfont", id:SELL_TEXT_ID});
                dojo.place(sell_text, SELL_ZONE_ID, 'first');
                var translatedString = _("Sell:");
                sell_text.innerText = translatedString;
                
                let types = ['wood','food','steel','gold','cow','copper'];
                types.forEach(type=> {
                    var tradeAwayTokens = this.getResourceArrayHtml(this.getBuyAway(type));
                    var tradeForTokens = this.getResourceArrayHtml(this.getBuyFor(type));
                    var arrow = TOKEN_HTML.arrow;
                    this.addActionButton( `btn_buy_${type}`, `${tradeAwayTokens} ${arrow} ${tradeForTokens}`, 'onBuyResource', null, false, 'blue');
                    dojo.place(`btn_buy_${type}`, BUY_ZONE_ID, 'last');
                    tradeAwayTokens = this.getResourceArrayHtml(this.getSellAway(type));
                    tradeForTokens = this.getResourceArrayHtml(this.getSellFor(type));
                    this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${arrow} ${tradeForTokens}`, 'onSellResource', null, false, 'blue');
                    dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
                });
                if (HAS_BUILDING[this.player_id][BLD_MARKET] || HAS_BUILDING[this.player_id][BLD_BANK]){
                    let special_zone = dojo.create('div', {id:SPECIAL_ZONE_ID, style:zone_style});
                    dojo.place(special_zone, TRADE_ZONE_ID, 'first');
                }
                if (HAS_BUILDING[this.player_id][BLD_MARKET]){
                    let mkt_text = dojo.create('span', {class:"biggerfont", id:MARKET_TEXT_ID, style:"width: 100px;"});
                    dojo.place(mkt_text, SPECIAL_ZONE_ID, 'first');
                    var translatedString = _("Market:");
                    mkt_text.innerText = translatedString;
                    let types = ['food','steel'];
                    types.forEach(type => {
                        var tradeAwayTokens = this.getResourceArrayHtml(this.getMarketAway(type));
                        var tradeForTokens = this.getResourceArrayHtml(this.getMarketFor(type));
                        var arrow = TOKEN_HTML.arrow;
                        let mkt_btn_id = `btn_market_${type}`;
                        this.addActionButton( mkt_btn_id, `${tradeAwayTokens} ${arrow} ${tradeForTokens}`, `onMarketTrade_${type}`, null, false, 'blue');
                        dojo.place(mkt_btn_id, SPECIAL_ZONE_ID, 'last');
                    });
                }
                if (HAS_BUILDING[this.player_id][BLD_BANK]){
                    let bank_text = dojo.create('span', {class:"biggerfont", id:BANK_TEXT_ID, style:"width: 100px;"});
                    dojo.place(bank_text, SPECIAL_ZONE_ID, 'last');
                    var translatedString = _("Bank:"); 
                    bank_text.innerText = translatedString;
                    var tradeAwayTokens = this.getResourceArrayHtml({'trade':-1});
                    var tradeForTokens = this.getResourceArrayHtml({'silver':1});
                    this.addActionButton( BTN_ID_TRADE_BANK, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, METHOD_TRADE_BANK, null, false, 'blue');
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

        // METHOD_CONFIRM_TRADE
        confirmTradeButton: function ( ){
            if((this.currentState=='allocateWorkers' && !this.isCurrentPlayerActive())){
                // confirm trade
                this.confirmTrades( true );
            } else if (this.checkAction( 'trade' )) {
                this.confirmTrades( false );
            }
        },

        confirmHiddenTradeButton: function(){
            if (this.checkAction( 'event' ) && this.checkAction( 'trade' )) {
                if (TRANSACTION_LOG.length == 0) { return; }
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/tradeHidden.html", { 
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.can_cancel = true;
                    this.calculateAndUpdateScore(this.player_id);
                }, function( is_error) {});
            }
        },

        clientState_sellEvent: function() {
            this.removeButtons();
            this.tradeEnabled=false;
            this.pendingSpecialTradeAmount = TRANSACTION_LOG.length;
            if (this.pendingSpecialTradeAmount>0){ // at least 1 transaction queued.
                this.addActionButton( BTN_ID_EVENT_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_PASS]), METHOD_EVENT_DONE_TRADING, null, false, 'blue');
            } else {  // no transactions queued.
                this.addActionButton( BTN_ID_EVENT_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_EVENT_DONE_TRADING, null, false, 'blue');
            }
            this.addActionButton( BTN_ID_BACK_SELL_EVENT, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_BACK_SELL_EVENT, null, false, 'red' );
            dojo.place(dojo.create('br'),'generalactions','last');
            
            let zone_style = 'display: flex; justify-content: center; flex-wrap: wrap;';
            let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:zone_style});
            dojo.place(sell_zone, 'generalactions', 'last');
            let sell_text = dojo.create('span', {class:"biggerfont", id:SELL_TEXT_ID});
            dojo.place(sell_text, SELL_ZONE_ID, 'first');
            var translatedString = _("Sell:");
            sell_text.innerText = translatedString;
            
            let types = ['wood','food','steel','gold','cow','copper'];
            types.forEach(type=> {
                var arrow = TOKEN_HTML.arrow;
                tradeAwayTokens = this.getResourceArrayHtml(this.getSellAwayFree(type));
                tradeForTokens = this.getResourceArrayHtml(this.getSellFor(type));
                this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${arrow} ${tradeForTokens}`, 'onFreeSellResource', null, false, 'blue');
                dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
            });
            this.addActionButton( BTN_ID_UNDO_SELL_EVENT, _(MESSAGE_STRINGS[MESSAGE_TRADE_UNDO_EVENT]), METHOD_UNDO_SELL_EVENT, null, false, 'red' );
            dojo.query(`#${BTN_ID_UNDO_SELL_EVENT}`).addClass('disabled');
            
            this.updateUndoButtons_sellFree();
            this.updateTradeAffordability_sellFree();
        }, 

        clientState_sellAuction: function() {
            this.removeButtons();
            this.tradeEnabled=false;
            this.pendingSpecialTradeAmount = TRANSACTION_LOG.length;
            if (this.pendingSpecialTradeAmount>0){ // at least 1 transaction queued.
                this.addActionButton( BTN_ID_AUCTION_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_CONFIRM_PASS]), METHOD_AUCTION_DONE_TRADING, null, false, 'blue');
            } else {  // no transactions queued.
                this.addActionButton( BTN_ID_AUCTION_DONE_TRADING, _(MESSAGE_STRINGS[MESSAGE_PASS]), METHOD_AUCTION_DONE_TRADING, null, false, 'blue');
            }
            this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            dojo.place(dojo.create('br'),'generalactions','last');
            
            let zone_style = 'display: flex; justify-content: center; flex-wrap: wrap;';
            let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:zone_style});
            dojo.place(sell_zone, 'generalactions', 'last');
            let sell_text = dojo.create('span', {class:"biggerfont", id:SELL_TEXT_ID});
            dojo.place(sell_text, SELL_ZONE_ID, 'first');
            var translatedString = _("Sell:");
            sell_text.innerText = translatedString;
            
            let types = ['wood','food','steel','gold','cow','copper'];
            types.forEach(type=> {
                var arrow = TOKEN_HTML.arrow;
                tradeAwayTokens = this.getResourceArrayHtml(this.getSellAwayFree(type));
                tradeForTokens = this.getResourceArrayHtml(this.getSellFor(type));
                this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${arrow} ${tradeForTokens}`, 'onFreeSellResource', null, false, 'blue');
                dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
            });
            this.addActionButton( BTN_ID_UNDO_SELL_AUCTION, _(MESSAGE_STRINGS[MESSAGE_TRADE_UNDO]), METHOD_UNDO_SELL_AUCTION, null, false, 'red' );
            
            this.updateUndoButtons_sellFree();
            this.updateTradeAffordability_sellFree();
        }, 

        /** METHOD_BACK_SELL_EVENT (Wartime Demand)
         * event specific button method for 
         *    cancel all transaction
         *        AND / OR 
         *    back to start of actions. 
         * specific to the sell Event 
         */
        backToTradesButton_sellEvent: function () {
            this.undoTransactionsButton();//clear all pending transactions.
            this.removeButtons();
            this.onUpdateActionButtons_preEventTrade(this.current_args);
        },
        
        // make existing undo buttons use `undoSellFreeTransaction` instead.
        updateUndoButtons_sellFree: function () {
            for (let i =0; i <this.pendingSpecialTradeAmount; i++){
                dojo.disconnect(TRADE_CONNECT_HANDLER[i]);
                TRADE_CONNECT_HANDLER[i] = dojo.connect($(`x_${i}`), 'onclick', this, 'undoSellFreeTransaction' );
            }
        },

        /** implementation of updateTradeAffordability
         * specific to the sell Event (Wartime Demand) client state
         * in which only sell actions are available.
         * (so buy/market/bank/etc. are omitted.) 
         */
        updateTradeAffordability_sellFree: function(){
            for (let trade_id = 0; trade_id < 6; trade_id++){
                var type = this.getKeyByValue(TRADE_MAP, trade_id).split('_')[1];
                
                // sell - not enabling the trade_card actions.
                var btn_id   = `#btn_sell_${type}`;
                if (this.canAddTrade(this.getSellChangeFree(type))){
                    this.updateButtonAffordability(btn_id, AFFORDABLE);
                } else {// can not afford
                    this.updateButtonAffordability(btn_id, UNAFFORDABLE);
                }
            }
        },

        /** METHOD_UNDO_SELL_EVENT
         * undo transactions specific to sell Event (Wartime Demand) interim client state.
         */
        undoTransactionsButton_sellEvent: function( ){
            if (TRANSACTION_COST.length <= this.pendingSpecialTradeAmount) return;
            while (TRANSACTION_LOG.length > this.pendingSpecialTradeAmount){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
            }
            this.updateBuildingAffordability();
            this.updateTradeAffordability_sellFree();
            this.setupUndoTransactionsButtons_sellEvent();
        },

        /** METHOD_UNDO_SELL_AUCTION
         * undo transactions specific to sell Free Auction (City Auc 4) interim client state.
         */
         undoTransactionsButton_sellAuction: function( ){
            while (TRANSACTION_LOG.length > 0){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
            }
            this.removeButtons();
            return this.onUpdateActionButtons(this.currentState, this.current_args);
        },

        // (Wartime Demand)
        setupUndoTransactionsButtons_sellEvent: function( ){
            if (TRANSACTION_LOG.length < this.pendingSpecialTradeAmount){
                dojo.query(`#${BTN_ID_UNDO_SELL_EVENT}:not(.disabled)`).addClass('disabled');
            } else {
                dojo.query(`#${BTN_ID_UNDO_SELL_EVENT}.disabled`).removeClass('disabled');
            }
            this.setupTransitionButton();
        },

        /** 
         * event (Wartime Demand) specific button method for 
         *    add transaction
         * specific to the sell (for free) Event.
         */
        addTransaction_sellEvent: function (type){
            var transactions = {name:dojo.string.substitute(_("Sell(${no_trade})"), {'no_trade':TOKEN_HTML.x_trade}), map:TRADE_MAP[`sellfree_${type}`],
                away:this.getSellAwayFree(type), for:this.getSellFor(type), change:this.getSellChangeFree(type)};
            if(this.canAddTrade(transactions.change)){
                this.updateTrade(transactions.change);
                // add breadcrumb
                this.createFreeTradeBreadcrumb(TRANSACTION_LOG.length, transactions.name, transactions.away, transactions.for);
    
                TRANSACTION_COST.push(transactions.change);
                TRANSACTION_LOG.push(transactions.map);
                this.updateBuildingAffordability();
                this.updateTradeAffordability_sellFree();
                this.setupUndoTransactionsButtons_sellEvent();
                this.updateConfirmAndUndoTradeButtons();
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        /** METHOD_PAY_LOAN_FOOD -> Sharecropping
         *  add transaction to pay loan with food.
         */
        payLoanWithFood: function() {
            this.addTransaction(PAY_LOAN_FOOD);
        },
        
        /** helper method. 
         * Will hide all offset and New text values that don't have pending changes.
         */
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
            if (this.goldCost >0)  { hasOffset.gold = true; }
            for(let type in hasOffset){
                dojo.query(`#${thisPlayer} .player_${type}_new.noshow`).removeClass('noshow');
            }
        },
        /** onButtonClick "Confirm Trades" 
         * @arg notActive - required for the 1 case in which user IS allowed to trade while notActive
         *  (in the pseudo state where a player has allocated workers for income, but can do their trades & pay workers during the same state)
         */
        confirmTrades: function ( notActive= false ){
            if (TRANSACTION_LOG.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                lock: true, 
                trade_action: TRANSACTION_LOG.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 this.can_cancel = true;
                 dojo.query(`#${BTN_ID_CANCEL}`).removeClass('disabled');
                 this.calculateAndUpdateScore(this.player_id);
                 
                 if (this.currentState == 'allocateWorkers' && !notActive){
                    this.setOffsetForIncome();
                 }
                 this.updateTradeAffordability();
             }, function( is_error) {});
        },

        /** helper method that calculates total offset for resource of type */
        getOffsetValue: function(type) {
            let value = 0;
            for(let i in TRANSACTION_COST){
                value += TRANSACTION_COST[i][type]??0;
            }
            return value;
        },

        /**
         * update the offset & new values to be correct 
         * values are board_resourceCounters + offset from pending transactions.
         */
        resetTradeValues: function() {
            for(let type in BOARD_RESOURCE_COUNTERS[this.player_id]){
                this.setOffset(type, this.getOffsetValue(type));
            }
        },

        clearHiddenTrades: function(){
            console.log('clearHiddenTrades');
            if (TRANSACTION_COST.hiddenAway){
                this.updateTrade(TRANSACTION_COST.hiddenAway, true);
            }
            HIDDEN_AWAY_COST.length=0;
            delete TRANSACTION_COST.hiddenAway;
            if (TRANSACTION_COST.hiddenFor){
                this.updateTrade(TRANSACTION_COST.hiddenFor, true);
            }
            delete TRANSACTION_COST.hiddenFor;
            HIDDEN_FOR_COST.length=0;
        },

        setHiddenTrades: function (trade_result){
            for (let type in trade_result.trade_away) {
                HIDDEN_AWAY_COST[type] = -trade_result.trade_away[type];
            }
            for (let type in trade_result.trade_for) {
                HIDDEN_FOR_COST[type] = trade_result.trade_for[type];
            }
            this.showHiddenTrades();
        },

        updateHiddenTrades: function(trade_result){
            for (let type in trade_result.trade_away) {
                this.addOrSetArrayKey(HIDDEN_AWAY_COST, type, -trade_result.trade_away[type]);
            }
            for (let type in trade_result.trade_for) {
                this.addOrSetArrayKey(HIDDEN_FOR_COST, type, trade_result.trade_for[type]);
            }
            this.showHiddenTrades();
        },

        showHiddenTrades: function(){
            if (TRANSACTION_COST.hiddenAway){
                this.updateTrade(TRANSACTION_COST.hiddenAway, true);
            }
            TRANSACTION_COST.hiddenAway = HIDDEN_AWAY_COST??[];
            this.updateTrade(TRANSACTION_COST.hiddenAway);
            if (TRANSACTION_COST.hiddenFor){
                this.updateTrade(TRANSACTION_COST.hiddenFor, true);
            }
            TRANSACTION_COST.hiddenFor = HIDDEN_FOR_COST??[];
            this.updateTrade(TRANSACTION_COST.hiddenFor);
            this.updateTradeAffordability();
        },

        addTransaction: function (action, type=''){
            var transactions = {};
            switch(action){
                case BUY:
                    transactions = {name:_("Buy"), map:TRADE_MAP[`buy_${type}`],
                            away:this.getBuyAway(type), for:this.getBuyFor(type), change:this.getBuyChange(type)};
                break;
                case SELL:
                    transactions = {name:_("Sell"), map:TRADE_MAP[`sell_${type}`],
                            away:this.getSellAway(type), for:this.getSellFor(type), change:this.getSellChange(type)};
                break;
                case MARKET:
                    transactions = {name:_("Market"), map:TRADE_MAP[`market_${type}`],
                            away:this.getMarketAway(type), for:this.getMarketFor(type), change:this.getMarketChange(type)};
                break;
                case BANK:
                    transactions = {name:_('Bank'), map:TRADE_MAP.bank,
                            away:{'trade':-1}, for:{'silver':1}, change:{'trade':-1,'silver':1}};
                break;
                case TAKE_LOAN:
                    transactions = {name:_(MESSAGE_STRINGS[MESSAGE_TAKE_DEBT]), map:TRADE_MAP.loan,
                            away:{'loan':1}, for:{'silver':2}, change:{'silver':2,'loan':1}};
                break;
                case PAY_LOAN_GOLD:
                    transactions = {name:_(MESSAGE_STRINGS[MESSAGE_DEBT_PAY]), map:TRADE_MAP.payLoan_gold,
                            away:{'gold':-1}, for:{'loan':-1}, change:{'gold':-1, 'loan':-1}};
                break;
                case PAY_LOAN_SILVER:
                    transactions = {name:_(MESSAGE_STRINGS[MESSAGE_DEBT_PAY]), map:TRADE_MAP.payLoan_silver,
                            away:{'silver':-5}, for:{'loan':-1}, change:{'silver':-5, 'loan':-1}};
                break;
                case PAY_LOAN_SILVER_3:
                    transactions = {name:_(MESSAGE_STRINGS[MESSAGE_DEBT_PAY]), map:TRADE_MAP.payLoan_3silver,
                            away:{'silver':-3}, for:{'loan':-1}, change:{'silver':-3,'loan':-1}};
                break;
                case PAY_LOAN_FOOD:
                    transactions = {name:_(MESSAGE_STRINGS[MESSAGE_DEBT_PAY]), map:TRADE_MAP.payLoan_food,
                            away:{'food':-1}, for:{'loan':-1}, change:{'food':-1,'loan':-1}};
                break;
            }
            if(this.canAddTrade(transactions.change)){
                this.updateTrade(transactions.change);
                // add breadcrumb
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, transactions.name, transactions.away, transactions.for);
    
                TRANSACTION_COST.push(transactions.change);
                TRANSACTION_LOG.push(transactions.map);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmAndUndoTradeButtons();
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        checkActionTrade: function( evt){
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return {valid:false}; }
            if ((evt.target.classList.contains("bgabutton"))) {
                return {valid:true, parent:false, button:true};
            }
            if (evt.target.classList.contains('selectable')) { 
                return {valid:true, parent:false, button:false};
            }
            if (evt.target.parent.classList.contains('selectable')){
                return {valid:true, parent:true, button:false};
            }
            return {valid:false, parent:false, button:false};
        },

        /** OnClick Handler 
         * mapped to trade_option will call associates buy or sell methods.
         */
        onSelectTradeAction: function( evt ){
            dojo.stopEvent( evt );
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            let target_divId = evt.target.id;
            if (tradeable.parent){
                target_divId = evt.target.parentNode.id;
            }
            var tradeAction = target_divId.substring(6);
            if (TRADE_MAP[tradeAction] < 6){ //buy
                this.onBuyResource ( evt , target_divId.substring(10));
            } else { //sell
                this.onSellResource( evt , target_divId.substring(11));
            }
        },

        /** OnClick Handler (buy action buttons)
         * will add Buy transaction to transactionLog (and update offset/breadcrumbs)
         */
        onBuyResource: function ( evt , type = ""){
            //console.log('onBuyResource');
            if (type == ""){ // didn't come from onSelectTradeAction.
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (evt.target.classList.contains('bgabutton')){
                type = evt.target.id.split('_')[2];
            } else { return; }
            }
            this.addTransaction(BUY, type);
        },

        /** get function tradeAway for Buy transactions */
        getBuyAway: function (type){
            let buyAway = this.invertArray(RESOURCE_INFO[type].trade_val);
            buyAway.trade = -1;
            return buyAway;
        },
        /** get function tradeFor for Buy transactions */
        getBuyFor: function (type){
            let buyFor = [];
            buyFor[type] = 1;
            return buyFor;
        },
        /** get function tradeChange(For & Away) for Buy transactions */
        getBuyChange: function(type) {
            let buyChange = this.getBuyAway(type);
            buyChange[type] = 1;
            return buyChange;
        },

        /** OnClick Handler (Sell action buttons)
         * will add Sell transaction to transactionLog (and update offset/breadcrumbs)
         */
        onSellResource: function ( evt , type = "" ){
            //console.log('onSellResource');
            if (type == ""){
                dojo.stopEvent( evt );
                if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
                if (evt.target.classList.contains('bgabutton')){
                type = evt.target.id.split('_')[2];
                } else { return; }
            }
            this.addTransaction(SELL, type);
        },
        /** OnClick Handler (Free Sell action buttons)
         * will add Sell transaction to transactionLog (and update offset/breadcrumbs)
         */
        onFreeSellResource: function ( evt, type = "") {
            if (type == ""){
                dojo.stopEvent( evt );
                if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
                if (evt.target.classList.contains('bgabutton')){
                    type = evt.target.id.split('_')[2];
                } else { return; }
                }
            this.addTransaction_sellEvent(type);
        },
        /** get function tradeAway for Sell transactions */
        getSellAway: function (type){
            let tradeAway = {trade:-1};
            tradeAway[type] = -1;
            return tradeAway;
        },
        /** get function tradeAway for Sell transactions (no trade token) */
        getSellAwayFree: function (type){
            let tradeAway = {};
            tradeAway[type] = -1;
            return tradeAway;
        },
        /** get function tradeFor for Sell transactions */
        getSellFor: function (type){
            //console.log('getSellFor', type);
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
        /** get function tradeChange for Sell transactions (no trades token) */
        getSellChangeFree: function ( type ) {
            let tradeChange = this.getSellFor(type);
            tradeChange[type] = -1;
            return tradeChange;
        },

        /** METHOD_TAKE_LOAN
         * OnClick Handler Take Loan/debt action buttons
         * will add takeLoan transaction to transactionLog (and update offset/breadcrumbs)
         */
        onMoreLoan: function ( evt ){
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            this.addTransaction(TAKE_LOAN);
        },

        onMarketTrade_food: function (evt){
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            this.addTransaction(MARKET, 'food'); 
        },
        onMarketTrade_steel: function (evt){
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            this.addTransaction(MARKET, 'steel'); 
        },
        
        /** BLD_METHOD_MARKET
         * OnClick Handler Market Trade Actions 
         * will add takeLoan transaction to transactionLog (and update offset/breadcrumbs)
         */
        onClickOnMarketTrade: function ( evt){
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            let target = (tradeable.parent?evt.target.parentNode:evt.target);//if tradeable.parent fix target
            if (target.classList.contains('market_food')){
                type = 'food';
            } else if (target.classList.contains('market_steel')){
                type = 'steel';
            } else {return;}
            this.addTransaction(MARKET, type);            
        },

        /** get function tradeAway for Market transactions */
        getMarketAway: function (type){
            let tradeAway = this.invertArray(RESOURCE_INFO[type].market);
            tradeAway.trade = -1;
            return tradeAway;
        },
        /** get function tradeFor for Market transactions */
        getMarketFor: function (type){
            let tradeFor = [];
            tradeFor[type] = 1;
            return tradeFor;
        },
        /** get function tradeChange for Market transactions */
        getMarketChange: function (type) {
            let tradeChange = this.getMarketAway(type);
            tradeChange[type] = 1;
            return tradeChange;
        },
        
        /** BLD_METHOD_TRADE_BANK 
         * OnClick Handler Bank Trade Action
         * will add BankTrade actions to transactionLog (trade -> silver)
         */
        onClickOnBankTrade: function ( evt ){
            //console.log('onClickOnBankTrade');
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            this.addTransaction(BANK);
        },

        /** helper will make sure player would not go to negative values making the intended change 
         * @param change [Object object] of {type:offsetAmount} of requested change
         */
        canAddTrade: function( change ){
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
            if (LAST_SELECTED.building != ''){
                b_id= $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2]??0;
            }
            let cost = this.invertArray(BUILDING_INFO[b_id].cost??{});
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                if (cost.cow<0){
                    dojo.style(BTN_ID_GOLD_COW, 'display', 'inline-flex');
                } else {
                    dojo.style(BTN_ID_GOLD_COW, 'display', 'none');
                }
                if (cost.copper<0){
                    dojo.style(BTN_ID_GOLD_COPPER, 'display', 'inline-flex');
                } else {
                    dojo.style(BTN_ID_GOLD_COPPER, 'display', 'none');
                }
            }
            if (HAS_BUILDING[this.player_id][BLD_LUMBER_MILL]){
                if (cost.steel<0){
                    dojo.style(BTN_ID_MORE_STEEL, 'display', 'inline-flex');
                    dojo.style(BTN_ID_LESS_STEEL, 'display', 'none');
                } else {
                    dojo.style(BTN_ID_MORE_STEEL, 'display', 'none');
                    dojo.style(BTN_ID_LESS_STEEL, 'display', 'none');
                }
            }
        },

        /** helper function 
         * get cost of building by Building_id.
         * this will take into account cost replacement flags
         * (this.goldAsCow & this.goldAsCopper & this.cost_replace)
         * @param {int} b_id - building_id
         * @returns [Object object] of {type:amt,type2:amt2}
         */
         getBuildingCost: function( b_id =0) {
            if (b_id == 0){// if b_id not set use last_selected.building
                if (LAST_SELECTED.building != ''){
                    b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                }
            }
            cost = this.invertArray(BUILDING_INFO[b_id].cost);
            for(let type in this.cost_replace){
                let max_loop = Math.max(this.cost_replace[type], cost[type]);
                for(let i =0; i< max_loop;i++ ){
                    for(let replace_type in COST_REPLACE_TYPE[type]){
                        cost = this.addOrSetArrayKey(cost, replace_type, -COST_REPLACE_TYPE[type][replace_type]);
                        if (cost[replace_type] == 0){
                            delete cost[replace_type];
                        }
                    }
                    cost = this.addOrSetArrayKey(cost, type, 1);
                }
            }
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
            for (let type in change){
                let offset = change[type];
                this.incOffset(type, (undo?(-1 * offset):offset));
            }
            return true;
        },

        
        showResource: function(type){
            let offset = OFFSET_RESOURCE_AMOUNT[type];

            console.log('showResource: ', type, 'offset', offset, BOARD_RESOURCE_ICON[this.player_id][type]);
            document.getElementById(BOARD_RESOURCE_ICON[this.player_id][type]).setAttribute('income', offset);
            if (offset != 0) {
                dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}:not(.income)`).addClass('income');
            } else {
                dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}.income`).removeClass('income');
            }
            if (offset < 0){
                dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}:not(.negative)`).addClass('negative');
            } else {
                dojo.query(`#${BOARD_RESOURCE_ICON[this.player_id][type]}.negative`).removeClass('negative');
            }         
        },

        incOffset:function(type, offset_value){
            console.log('incOffset-args:', type, offset_value);
            
            let old_value = OFFSET_RESOURCE_AMOUNT[type];
            OFFSET_RESOURCE_AMOUNT[type] = (old_value + offset_value);
            NEW_RESOURCE_AMOUNT[type] = BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + OFFSET_RESOURCE_AMOUNT[type];
            this.showResource(type);
        },
        
        /**
         * update the offset counter of `type` with `offset_value`  
         * if inc is true, it will increment instead of setting the offset.
         * 
         * if the resulting value is not 0 it will display the counter.
         * if the resulting value is 0 it will hide the counter.
         * 
         * @param {String} type 
         * @param {int} offset_value 
         */
        setOffset:function(type, offset_value){
            console.log('setOffset-args:', type, offset_value);
            OFFSET_RESOURCE_AMOUNT[type] = offset_value;
            NEW_RESOURCE_AMOUNT[type] = (BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + offset_value);
            this.showResource(type);
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

        changeStateCleanup: function(){
            this.clearTransactionLog();
            this.disableTradeIfPossible();
            this.resetTradeValues();
            this.disableTradeBoardActions();
            this.setupUndoTransactionsButtons();
            this.updateBuildingAffordability();
        },

        //METHOD_UNDO_TRADE
        undoTransactionsButton: function( ){
            if (TRANSACTION_COST.length ==0) return;
            while (TRANSACTION_LOG.length>0){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
            }
            this.updateBuildingAffordability();
            this.updateTradeAffordability();
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        undoTransaction: function( evt ) {
            dojo.stopEvent( evt );
            if (TRANSACTION_COST.length ==0) return;
            let log_no = evt.target.id.split("_")[1];
            if (log_no == 0){
                return this.undoTransactionsButton();
            } 
            if (log_no > TRANSACTION_COST.length) return;
            while (TRANSACTION_LOG.length > log_no){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);    
            }
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons();
            this.updateTradeAffordability();
        },

        undoSellFreeTransaction: function( evt ) {
            dojo.stopEvent( evt );
            if (TRANSACTION_COST.length ==0) return;
            let log_no = evt.target.id.split("_")[1];
            if (log_no > TRANSACTION_COST.length) return;
            while (TRANSACTION_COST.length > log_no){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
                }
            if (log_no < this.pendingSpecialTradeAmount){
                this.pendingSpecialTradeAmount = log_no;
                this.removeButtons();
                return this.onUpdateActionButtons(this.currentState, this.current_args);
                }
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons_sellEvent();
            this.updateTradeAffordability_sellFree();
        },

        resetTradeButton: function(){
            this.setTradeButtonToShow(!this.tradeEnabled);
            this.updateConfirmAndUndoTradeButtons();
        },

        // update text for Show/Hide trade Button
        setTradeButtonToShow: function( show ){
            if (show){
                var translatedString = _(MESSAGE_STRINGS[MESSAGE_TRADE_SHOW]);
            } else {
                var translatedString = _(MESSAGE_STRINGS[MESSAGE_TRADE_HIDE]);                    
            }
            dojo.query(`#${BTN_ID_TRADE_TOGGLE}`).forEach(element => element.innerText= translatedString);
        },

        // set enabled/disabled states for confirm/undo trades buttons
        updateConfirmAndUndoTradeButtons: function( ){
            if (TRANSACTION_LOG.length >0) {
                dojo.query(`#${BTN_ID_CONFIRM_TRADE}.disabled`).removeClass('disabled');
                dojo.query(`#${BTN_ID_CONFIRM_TRADE_HIDDEN}.disabled`).removeClass('disabled');
                dojo.query(`#${BTN_ID_UNDO_TRADE}.disabled`).removeClass('disabled');
            } else {
                dojo.query(`#${BTN_ID_CONFIRM_TRADE}:not(.disabled)`).addClass('disabled');
                dojo.query(`#${BTN_ID_CONFIRM_TRADE_HIDDEN}:not(.disabled)`).addClass('disabled');
                dojo.query(`#${BTN_ID_UNDO_TRADE}:not(.disabled)`).addClass('disabled');
            }
        },

        /** Show/Hide Tile Zones */
        toggleShowButton: function (index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                this.showTileZone(index);
                document.getElementById(TILE_CONTAINER_ID[index]).scrollIntoView({behavior:'smooth'});
            } else {
                this.hideTileZone(index);
            }
        },
        
        hideTileZone: function(index){
            if (!dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                // this maps to MESSAGE_SHOW_XXX_YYY which are 15-20 
                var translatedString = _(MESSAGE_STRINGS[index+15]);  
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
                dojo.addClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        showTileZone: function(index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                // this maps to MESSAGE_HIDE_XXX_YYY which are 25-30 
                var translatedString = _(MESSAGE_STRINGS[index+25]);
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
        toggleShowEvents: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(EVT_LOC_MAIN);
        },
        toggleShowDiscard: function (evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(EVT_LOC_DISCARD);
        },

        /***** PLACE WORKERS PHASE *****/
        /** METHOD_HIRE_WORKER
         * method for button 'hire Worker'
         */ 
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){ 
                if (TRANSACTION_LOG.length >0){ // make Trades first.
                    this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/trade.html", { 
                        lock: true, allowTrade:true, trade_action: TRANSACTION_LOG.join(',')
                    }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/hireWorker.html", {lock: true}, this, 
                            function( result ) {}, function( is_error) { } );
                    }, function( is_error) {});    
                } else { // if no trades, just Hire.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/hireWorker.html", {lock: true}, this, 
                        function( result ) {}, function( is_error) { } );
                }
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

        waitForPlayerOrder: function() {
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/wait.html", 
            { lock: true }, 
            this, function( result ) { 
                this.clearSelectable('worker', true); 
                this.clearSelectable('worker_slot', false);
                this.disableTradeBoardActions();
                this.destroyIncomeBreadcrumb();
                INCOME_ARRAY.length=0;
                this.disableTradeIfPossible();
                this.clearOffset();
                this.showPay = true;
            }, function( is_error) { })
        },

        ajaxDonePlacingWorkers: function(){
            let warehouse_num = RESOURCES[this.warehouse];
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/donePlacingWorkers.html", 
            {lock: true, warehouse:warehouse_num}, this, 
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
        
        onUnPass_preEventTrade: function () {
            this.ajaxcall("/" + this.game_name + "/" +  this.game_name + "/actionCancelEventDone.html", {lock:true}, this, function( result ) {}); 
        },

        onUnPass_endGameActions: function (evt) {
            this.ajaxcall("/" + this.game_name + "/" +  this.game_name + "/actionCancelDone.html", {lock:true}, this, function( result ) {}); 
        },

        onUnPass_allocateWorkers: function (evt) {
            this.ajaxcall("/" + this.game_name + "/" +  this.game_name + "/actionCancelAllocateWorkers.html", {lock:true}, this, function( result ) {
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
            if( this.checkAction( 'undoPass' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/cancelBidPass.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        /** METHOD_PAY_LOAN_3_SILVER 
         * players who pass can pay loan for 3 silver.
          this button is for choosing more loans to pay off
         */
        payLoan3Silver: function() {
            // this.addTransaction(PAY_LOAN_SILVER_3);
            this.loanCount ++;
            this.silverCost += 3;
            if (this.silverCost >0){
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'inline-flex');
                this.SILVER_COUNTER.setValue(this.silverCost);
            }

            dojo.style($(BTN_ID_PAY_LESS_LOAN), 'display', 'inline-flex');
            this.setOffsetForPaymentButtons();
        },
        /** METHOD_PAY_LESS_LOAN
         * players who pass can pay loan for 3 silver.
         * this button is for choosing less loans to pay off
         */
        payLoan3SilverLess: function () {
            if (this.loanCount <= 0) return;

            this.loanCount --;
            if (this.loanCount == 0){
                dojo.style($(BTN_ID_PAY_LESS_LOAN), 'display', 'none');
                this.silverCost = 0;
                this.goldCost = 0;
            } else {
                this.silverCost -= 3;
            }

            this.SILVER_COUNTER.setValue(Math.max(0, this.silverCost));
            if (this.silverCost < -5 && this.goldCost >0){
                this.silverCost += 5;
                this.goldCost --;
                if(this.goldCost == 0){
                    dojo.style( $(BTN_ID_LESS_GOLD), 'display', 'none');
                }
            }
            if (this.silverCost <= 0){
                dojo.style( $(BTN_ID_MORE_GOLD), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
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
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectWorkerDestination.html", { 
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
            dojo.query(`#generalactions .bgabutton`).forEach(dojo.destroy);
            dojo.query(`#generalactions br`).forEach(dojo.destroy);
            dojo.query(`#generalactions div`).forEach(dojo.destroy);
        },

        /***** PAY WORKERS or PAY AUCTION PHASE *****/
        // METHOD_DONE_PAY
        donePay: function( ){
            if (this.allowTrade || this.checkAction( 'done' , true)){
                if (!this.validPay()){
                    this.showMessage( _("You can't afford to pay, make trades or take loans"), 'error' );
                    return;
                }
                this.ajaxcall( "/" + this.game_name + "/" +  this.game_name + "/donePay.html", 
                { //args 
                        lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                    gold: this.goldCost,
                        allowTrade:true,
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.showPay = false;
                    this.silverCost = 0;
                    this.goldCost = 0;
                    this.destroyPaymentBreadcrumb();
                    this.changeStateCleanup();
                    if (this.currentState == "allocateWorkers"){
                        dojo.query(`#generalactions br`).forEach(dojo.destroy);
                        dojo.place(BTN_ID_UNDO_PASS, 'pagemaintitletext', 'after');
                    }
                }, function( is_error) {});   
            }
        },

        validPay:function(){
            if (NEW_RESOURCE_AMOUNT.silver < 0)
                return false;
            if (NEW_RESOURCE_AMOUNT.gold < 0)
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
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmDummyBid.html", {lock: true, bid_loc: bid_loc}, this, 
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

        // METHOD_AUCTION_DONE_TRADING
        doneTradingAuction: function() {
            if (this.checkAction('auctionBonus')){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doneTradingAuction.html", { lock: true, 
                    trade_action: TRANSACTION_LOG.join(',')
                }, this, function( result ) {
                        this.clearTransactionLog();
                        this.resetTradeValues();
                     }, function( is_error) {});   
            }
        },

        /***** EVENT PHASES *****/
        // METHOD_EVENT_DONE_TRADING
        doneTradingEvent: function(){
            if (this.checkAction('event')){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doneTradingEvent.html", { lock: true, 
                    trade_action: TRANSACTION_LOG.join(',')
                    }, this, function( result ) {
                    this.clearTransactionLog();
                    this.resetTradeValues();
                    }, function( is_error) {});   
            }
        },

        doneHiddenTradingEvent: function(){
            if (this.checkAction('event')){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doneHiddenTradeEvent.html", 
                { //args
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.can_cancel = true;
                    this.calculateAndUpdateScore(this.player_id);
                }, function( is_error) {});   
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
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBid.html", {lock: true}, this, 
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
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        /*** LOT choose Actions ***/
        lotGoToBuild: function() {
            if( this.checkAction( 'chooseLotAction' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/lotGoToBuild.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        lotGoToEvent: function() {
            if( this.checkAction( 'chooseLotAction' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/lotGoToEvent.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        lotGoToAuction: function() {
            if( this.checkAction( 'chooseLotAction' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/lotGoToAuction.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        lotGoToConfirm: function() {
            if( this.checkAction( 'chooseLotAction' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/lotGoToConfirm.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        /***** cancel back to PAY AUCTION PHASE (METHOD_CANCEL_TURN) *****/
        cancelTurn: function() {
            this.undoTransactionsButton();
            if( this.checkAction( 'undoLot' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/cancelTurn.html", {lock: true}, this, 
                function( result ) {
                    this.showPay = true;
                    this.resetTradeValues();
                    this.updateTradeAffordability();
                }, function( is_error) { } ); 
            }
        },

        /***** METHOD_BOARD_SELECT_BONUS (`btn_bonus_${type}`) *****/
        onSelectBonusOption: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( !dojo.hasClass(evt.target.id,'selectable')){ return; }
            if( this.checkAction( 'chooseBonus' )) {
                let type = evt.target.id.split('_')[3];
                this.updateSelectedBonus(type);
            }
        },
        /**  METHOD_SELECT_BONUS (`btn_bonus_${type}`) **/
        selectBonusButton: function( evt ) {
            if (this.checkAction( 'chooseBonus' )){
                let target_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
                let type = target_id.split("_")[2];
                this.updateSelectedBonus(type);
            }
        },
        /**  METHOD_CHOOSE_BONUS (BTN_ID_CHOOSE_BONUS) **/
        doneSelectingRailBonus: function(){
            if (this.checkAction( 'chooseBonus' )){
                if (LAST_SELECTED['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = LAST_SELECTED['bonus'].split('_')[3];
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectRailBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.changeStateCleanup();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },
        /**  METHOD_CHOOSE_BONUS_EVENT (BTN_ID_CHOOSE_BONUS) **/
        doneSelectingRailBonusEvent: function (){
            if (this.checkAction( 'eventChooseBonus' )){
                if (LAST_SELECTED['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = LAST_SELECTED['bonus'].split('_')[3];
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectRailBonusEvent.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.changeStateCleanup();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },
         
        updateSelectedBonus: function(type){
            //console.log(type);
            let btn_id = `btn_bonus_${type}`;
            let option_id = BONUS_OPTIONS[RESOURCES[type]];
            if (LAST_SELECTED.bonus =='' || LAST_SELECTED.bonus == option_id){
                dojo.toggleClass(btn_id, 'bgabutton_blue');
                dojo.toggleClass(btn_id, 'bgabutton_gray');
                dojo.toggleClass(BTN_ID_CHOOSE_BONUS, 'disabled');
           } else { //other thing was selected.
                let lastSelected_id =  `btn_bonus_${LAST_SELECTED.bonus.split('_')[3]}`;
                dojo.toggleClass(lastSelected_id, 'bgabutton_blue');
                dojo.toggleClass(lastSelected_id, 'bgabutton_gray');
                dojo.toggleClass(btn_id, 'bgabutton_blue');
                dojo.toggleClass(btn_id, 'bgabutton_gray');
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
            if (this.isSpectator) return;
            for (let trade_id = 0; trade_id < 6; trade_id++){
                var type = this.getKeyByValue(TRADE_MAP, trade_id).split('_')[1];

                // buy
                var afford = this.isAffordable(this.getBuyChange(type));
                this.updateAffordability(`#trade_buy_${type}`, afford);
                this.updateButtonAffordability(`#btn_buy_${type}`, afford);
                // sell
                afford = this.isAffordable(this.getSellChange(type));
                this.updateAffordability(`#trade_sell_${type}`, afford);
                this.updateButtonAffordability(`#btn_sell_${type}`, afford);
            }
            // market
            if (HAS_BUILDING[this.player_id][BLD_MARKET]){
                // food
                var afford = this.isAffordable(this.getMarketChange('food'));
                this.updateAffordability(`#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .market_food`, afford);
                this.updateButtonAffordability(`#btn_market_food`, afford);
                // steel
                afford = this.isAffordable(this.getMarketChange('steel'));
                this.updateAffordability(`#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .market_steel`, afford);
                this.updateButtonAffordability(`#btn_market_steel`, afford);
            }
            // bank 
            if (HAS_BUILDING[this.player_id][BLD_BANK]){
                var afford = this.canAddTrade({'trade':-1,'silver':1})?AFFORDABLE:UNAFFORDABLE;
                this.updateAffordability(`#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .bank`, afford);
                this.updateButtonAffordability(`#${BTN_ID_TRADE_BANK}`, afford);
                }

            this.updateButtonAffordability(`#${BTN_ID_PAY_LOAN_SILVER}`, this.isAffordable({'silver':-5, 'loan':-1}));
            this.updateButtonAffordability(`#${BTN_ID_PAY_LOAN_GOLD}`, this.isAffordable({'gold':-1, 'loan':-1}));
            // BTN_ID_PAY_LOAN_3_SILVER is handled separately
            this.updateButtonAffordability(`#${BTN_ID_PAY_LOAN_3_SILVER}`, this.isAffordable({loan:-1, 'silver':-3}));
            this.updateButtonAffordability(`#${BTN_ID_HIRE_WORKER}`, this.isAffordable({'trade':-1, 'food':-1}));
        },

        /** checks if canAddTrade(change) is true,
         * and returns AFFORDABLE or UNAFFORDABLE (CONST) 
         */
        isAffordable: function (change){
            return this.canAddTrade(change)?AFFORDABLE:UNAFFORDABLE;
        },
        
        /**
         * applies the class for affordable state to node at locator.
         * this is mostly used for buildings
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

        /**
         * applies/removes the class 'disabled' from button to denote affordability.
         * @param {*} button_id 
         * @param {*} afford_val 
         */
        updateButtonAffordability: function(button_id, afford_val){
            switch(afford_val){
                case AFFORDABLE:
                    dojo.query(button_id)
                        .removeClass('disabled');
                    break;
                case UNAFFORDABLE:
                    dojo.query(button_id)
                          .addClass('disabled');
                    break;
            }
        },

        /** updates all buildings affordability (based upon projected resources after pending trades) */
        updateBuildingAffordability: function(showIncomeCost = false){
            //console.log('updateBuildingAffordability');
            if (this.isSpectator) return;
            let buildings = dojo.query(`#${TILE_CONTAINER_ID[BLD_LOC_FUTURE]} .${TPL_BLD_TILE}, #${TILE_CONTAINER_ID[BLD_LOC_OFFER]} .${TPL_BLD_TILE}`);
            for (let i in buildings){
                let bld_html= buildings[i];
                if (bld_html.id == null) continue;
                let b_key = Number(bld_html.id.split('_')[2]);
                let b_id = $(bld_html.id).className.split(' ')[1].split('_')[2];
                let b_loc = `#${bld_html.id}`;
                if (HAS_BUILDING[this.player_id][b_id]) { //can't buy it twice, mark it un-affordable.
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[ALREADY_BUILT]};">${_(MESSAGE_STRINGS[ALREADY_BUILT])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, ALREADY_BUILT));
                    }
                    continue;
                }
                let afford = this.isBuildingAffordable(b_id, showIncomeCost);

                if (afford==1){// affordable
                    this.updateAffordability(b_loc, AFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[AFFORDABLE]};">${_(MESSAGE_STRINGS[AFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, AFFORDABLE));
                    }
                } else if (afford ==0){//tradeable
                    this.updateAffordability(b_loc, TRADEABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[TRADEABLE]};">${_(MESSAGE_STRINGS[TRADEABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, TRADEABLE));
                    }
                } else {
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[UNAFFORDABLE]};">${_(MESSAGE_STRINGS[UNAFFORDABLE])}</div>`);
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
            if (BUILDING_INFO[b_id].cost == null) return 1;// no cost, can afford.
            if (BUILDING_INFO[b_id].cost.length == 0) return 1;// no cost, can afford.
            const p_id = this.player_id;
            let cost = BUILDING_INFO[b_id].cost;
            let gold_off   = Number(this.getOffsetValue('gold'));
            let gold_board = Number(BOARD_RESOURCE_COUNTERS[p_id].gold.getValue());
            let gold_income = Number(this.getIncomeOffset('gold'));
            let gold_cost = Number(this.goldCost);
            let gold = gold_board + gold_off + gold_income - gold_cost;
            let adv_cost = 0;
            let trade_cost = 0;
            for(let type in cost){
                let res_offset = Number(this.getOffsetValue(type));
                let res_income = Number(this.getIncomeOffset(type));
                let res_board = Number(BOARD_RESOURCE_COUNTERS[p_id][type].getValue());
                let res_amt = res_board + res_offset + res_income;
                switch(type){
                    case 'wood':
                    case 'food':
                    case 'steel':
                        if (Number(cost[type]) > res_amt){
                            trade_cost += (cost[type] - res_amt);
                        }
                    break;
                    case 'gold':
                        if (Number(cost.gold) > gold){
                            trade_cost += (cost.gold - gold);
                            gold = 0;
                        } else {
                            gold -= cost.gold;
                        }
                    break;
                    case 'copper':
                    case 'cow':
                        if (Number(cost[type]) > res_amt){
                            adv_cost += (cost[type] - res_amt);
                        }
                    break;
                }
            }
            trade_cost += (adv_cost - Math.min(gold, adv_cost));
            if (!(HAS_BUILDING[p_id][BLD_RIVER_PORT])){
                trade_cost += adv_cost;
            }
            let trade_avail = BOARD_RESOURCE_COUNTERS[p_id].trade.getValue() + this.getOffsetValue('trade') + this.getIncomeOffset('trade');
            trade_cost -=  (this.building_discount?1:0);
            if (trade_cost <= 0){// no trades required.
                return 1;
            } if (trade_avail >= trade_cost){
                return 0;
            } else {
                return -1;
            }
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
            } else if (target_id.endsWith(BLD_ID_MARKET_STEEL) || target_id.endsWith(BLD_ID_MARKET_FOOD)){
                return this.onClickOnMarketTrade( evt ); 
            } else if (target_id.startsWith('trade_')){
                return this.onSelectTradeAction( evt ); 
            }
            if( !evt.target.classList.contains( 'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                let b_id = $(target_id).className.split(' ')[1].split('_')[2];
                this.updateSelected('building', target_id);
                if (!dojo.hasClass(target_id, 'selected')){
                    dojo.addClass(BTN_ID_BUILD_BUILDING, 'disabled');
                    $(BUILDING_NAME_ID).innerText = '';
                    this.createBuildingBreadcrumb();
                    this.showHideBuildingOffsetButtons();
                } else {
                    dojo.removeClass(BTN_ID_BUILD_BUILDING, 'disabled');
                    this.setBuildingName(b_id);
                    if (BUILDING_INFO[b_id].cost != null) {
                        this.createBuildingBreadcrumb();
                        this.showHideBuildingOffsetButtons();
                    }
                }
            }
        },

        // METHOD_BUILD_BUILDING
        chooseBuilding: function () {
            if (this.checkAction( 'buildBuilding')){
                const building_divId = LAST_SELECTED['building'];
                if (building_divId == "") {
                    this.showMessage( _(MESSAGE_STRINGS[MESSAGE_SELECT_BUILDING]), 'error' );
                    return;
                }
                if (this.building_discount){
                    this.chooseBuildingWithDiscount();
                } else {
                    const building_key = Number(building_divId.split("_")[2]);
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/buildBuilding.html",
                    {   // args
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(','), 
                        building_key: building_key,         
                        goldAsCow:this.goldAsCow?1:0, 
                        goldAsCopper:this.goldAsCopper?1:0, 
                        steelReplace:(this.cost_replace.steel??0),
                    }, this, function( result ) {
                        this.clearTransactionLog();
                        this.changeStateCleanup();
                        this.destroyBuildingBreadcrumb();
                        this.updateAffordability(`#${TPL_BLD_TILE}_${building_key}`, 0);
                     }, function( is_error) {});    
                }
            }
        },

        chooseBuildingWithDiscount: function(){
            console.log('chooseBuildingWithDiscount');
            let building_cost = this.getBuildingCost();
            if (Object.keys(building_cost).length == 0){
                // building has no cost, so just use normal build.
                this.building_discount = false;
                this.chooseBuilding();
                return;
            }
            if (Object.keys(building_cost).length == 1){
                const building_key = Number(LAST_SELECTED.building.split("_")[2]);
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/buildBuildingDiscount.html", 
                    { // args
                        lock: true,
                        trade_action: TRANSACTION_LOG.join(','), 
                        building_key: building_key, 
                        goldAsCow:this.goldAsCow?1:0, 
                        goldAsCopper:this.goldAsCopper?1:0, 
                        steelReplace:(this.cost_replace.steel??0), 
                        discount:RESOURCES[Object.keys(building_cost)[0]], 
                    }, this, function( result ) {
                        this.clearTransactionLog();
                        LAST_SELECTED.building_discount="";
                        this.building_discount = false;
                        this.changeStateCleanup();
                        this.updateAffordability(`#${TPL_BLD_TILE}_${building_key}`, 0);
                    }, function( is_error) { } );
            } else {
                // update buttons for clientstate - choose discount.
                let last_building = LAST_SELECTED.building;
                this.gamedatas.gamestate.descriptionmyturn = _(MESSAGE_STRINGS[MESSAGE_DISCOUNT_RESOURCE]);
                this.updatePageTitle();
                this.removeButtons();
                LAST_SELECTED.building = last_building;
                this.createBuildingBreadcrumb();
                LAST_SELECTED.building_discount = "";
                for(let type in building_cost){
                    this.addActionButton( `btn_resource_${type}`, TOKEN_HTML[type], 'selectBuildingDiscountResource', null, false, 'gray');
                }
                this.addActionButton( 'btn_choose_resource', dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_BUILD_DISCOUNT]),
                    {'building_name': `<span id="${BUILDING_NAME_ID}"></span>`,'resource':"<span id='build_discount_icon'></span>"}), 'doneSelectingBuildingDiscount');
                dojo.addClass('btn_choose_resource' ,'disabled');
                let b_id = $(last_building).className.split(' ')[1].split('_')[2];
                this.setBuildingName(b_id);
                this.addActionButton( 'btn_choose_again', _(MESSAGE_STRINGS[MESSAGE_CHOOSE_DIFFERENT_BUILDING]), 'undoChooseBuilding', null, false, 'red');
                this.addActionButton( BTN_ID_REDO_AUCTION, _(MESSAGE_STRINGS[MESSAGE_CANCEL]), METHOD_CANCEL_TURN, null, false, 'red');
            }
        },

        undoChooseBuilding: function( evt){
            dojo.removeClass(LAST_SELECTED.building, 'selected');
            this.gamedatas.gamestate.descriptionmyturn = _('${you} may choose a building to build');
            this.updatePageTitle();
        },

        setBuildingName: function(b_id){
            var translatedString = _(BUILDING_INFO[b_id].name);
            $(BUILDING_NAME_ID).innerText = translatedString;
            var bld_type = BUILDING_INFO[b_id].type;
            dojo.replaceClass(BUILDING_NAME_ID, `font caps ${ASSET_COLORS[bld_type]}`);
        },

        selectBuildingDiscountResource: function( evt ) {
            console.log('selectBuildingDiscountResource', evt);
            let btn_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
            // handles click events on sub-elements (tokens)
            let type = btn_id.split("_")[2];

            if (LAST_SELECTED.building_discount ==''){ //nothing was selected
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass('btn_choose_resource', 'disabled');
                LAST_SELECTED.building_discount = type;
                dojo.place(TOKEN_HTML[type], 'build_discount_icon');
            } else if (LAST_SELECTED.building_discount == type) { //this was selected
                dojo.removeClass(btn_id, 'bgabutton_blue');
                dojo.addClass('btn_choose_resource', 'disabled');
                dojo.query(`#build_discount_icon .token_inline`).forEach(dojo.destroy);
                LAST_SELECTED.building_discount = '';
            } else { //other thing was selected.
                let lastSelected_id =  `btn_resource_${LAST_SELECTED.building_discount}`;
                dojo.removeClass(lastSelected_id, 'bgabutton_blue');
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.query(`#build_discount_icon .token_inline`).forEach(dojo.destroy);
                dojo.place(TOKEN_HTML[type], 'build_discount_icon');
                LAST_SELECTED.building_discount = type;
            }        
        },

        doneSelectingBuildingDiscount: function( evt ){
            if (LAST_SELECTED.building_discount === ''){
                console.error("ERROR in: doneSelectingBuildingDiscount, no discount selected");
                return;
            }
            if (LAST_SELECTED.building === ''){
                console.error("ERROR in: doneSelectingBuildingDiscount, no building selected");
                return;
            }
            const building_key = Number(LAST_SELECTED.building.split("_")[2]);
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/buildBuildingDiscount.html", 
            { // args
                lock: true,
                trade_action: TRANSACTION_LOG.join(','), 
                building_key: building_key, 
                goldAsCow:this.goldAsCow?1:0, 
                goldAsCopper:this.goldAsCopper?1:0, 
                steelReplace:(this.cost_replace.steel??0), 
                discount:RESOURCES[LAST_SELECTED.building_discount], 
            }, this, function( result ) {
                this.clearTransactionLog();
                LAST_SELECTED.building_discount="";
                this.building_discount = false;
                this.changeStateCleanup();
                this.updateAffordability(`#${TPL_BLD_TILE}_${building_key}`, 0);
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
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doNotBuild.html", {lock: true}, this, 
                function( result ) { 
                    this.clearSelectable('building', true); 
                    this.changeStateCleanup();
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
                let total_score = score_noLoan + loan_pts;
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

        calculateBuildingScore: function (p_id) {
            let static = 0;
            // count of amount of each type (for bonus)
            let type_count = { [VP_B_RESIDENTIAL]:0, [VP_B_COMMERCIAL]:0, [VP_B_INDUSTRIAL]:0, [VP_B_SPECIAL]:0,
                [VP_B_WORKER]:0, [VP_B_TRACK]: 0, [VP_B_BUILDING]:0, [VP_B_PAID_LOAN]: 0};
            // count of building bonuses
            let vp_b =     { [VP_B_RESIDENTIAL]:0, [VP_B_COMMERCIAL]:0, [VP_B_INDUSTRIAL]:0, [VP_B_SPECIAL]:0,
                [VP_B_WORKER]:0, [VP_B_TRACK]: 0, [VP_B_BUILDING]:0, [VP_B_PAID_LOAN]: 0};
            
            for(let b_id in HAS_BUILDING[p_id]){
                if ('vp' in BUILDING_INFO[b_id]){
                    static += BUILDING_INFO[b_id].vp;
                }
                if ('vp_b' in BUILDING_INFO[b_id]){
                    if (BUILDING_INFO[b_id].vp_b == VP_B_PAID_LOAN){
                        vp_b[VP_B_PAID_LOAN] = 1;
                    } else if (BUILDING_INFO[b_id].vp_b == VP_B_WRK_TRK){
                        vp_b[VP_B_WORKER] ++;
                        vp_b[VP_B_TRACK] ++;
                    } else {
                        vp_b[BUILDING_INFO[b_id].vp_b]++;
                    }
                }
                type_count[BUILDING_INFO[b_id].type] ++;
                type_count[VP_B_BUILDING]++;
            }
            type_count[VP_B_PAID_LOAN] = Number(this.loans_paid[p_id]);
            type_count[VP_B_WORKER] = this.getPlayerWorkerCount(p_id);
            type_count[VP_B_TRACK] = this.getPlayerTrackCount(p_id);
            
            let bonus = 0;
            for (let i in vp_b){
                bonus += (type_count[i] * vp_b[i]);
            }
            return {static, bonus};
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
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerBuilding.html", {lock: true}, this, 
            function( result) {this.changeStateCleanup();}, function( is_error) { } );}
        },
        
        passBonusBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusBuilding.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
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

        moveObjectAndUpdateValues: function(mobile_obj, target_obj, position="last"){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0);
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_update', {target_obj:target_obj, mobile_obj:mobile_obj, position:position}));
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

        moveObject: function(mobile_obj, target_obj, position="last"){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0 );
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
        workerForFreeAuction: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerAuction.html", {lock: true }, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        bonusTypeForType: function(tradeAway, tradeFor) {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/bonusTypeForType.html", 
                    { //args
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(','),
                        tradeAway: tradeAway, 
                        tradeFor: tradeFor
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.clearOffset();
                        this.changeStateCleanup();
                     }, function( is_error) {});   
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

        passBonusAuction: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusAuction.html", {lock: true}, this, 
                    function( result ) { this.changeStateCleanup();},function( is_error) { } );
            }
        },

        /***** eventBonus ******/

        workerForFreeEvent: function() {
            if (this.checkAction( 'eventBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        workerForFreeLotEvent: function() {
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },
        //METHOD_EVENT_SILVER_RAIL_ADVANCE
        silver2ForRailAdvance: function(){
            if (!this.canAddTrade({silver:-2})){
                this.showMessage( _("You cannot afford this"), 'error' );
                return;
            }
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/silver2forRailAdvanceEvent.html", 
                { //args
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.changeStateCleanup();
                }, function( is_error) {});   
            }
        },
        //METHOD_EVENT_STEEL_BUILD
        steelBuildBuilding: function() {
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/steelBuildBuilding.html", 
                { //args
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.changeStateCleanup();
                }, function( is_error) {}); 
            }
        },

        /*** BTN_ID_PASS_BONUS ***/
        passBonusLotEvent: function() {
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusLotEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        /*** METHOD_PASS_BONUS ***/
        passBonusEvent: function() {
            if (this.checkAction( 'eventBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },
        // METHOD_ON_PASS_EVENT_DONE
        donePassEvent: function(){
            if (this.checkAction( 'payLoanEvent' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/donePassEvent.html", 
                { //args
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                    loans: this.loanCount??0,
                    gold: this.goldCost??0,
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.changeStateCleanup();
                    
                }, function( is_error) {}); 
            }
        },

        /***** endBuildRound *****/
        confirmBuildPhase: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmChoices.html", {lock: true}, this, 
                    function( result ) { }, 
                    function( is_error) { } );
            }
        },

        /***** END game actions *****/
        // METHOD_PAY_LOAN_SILVER
        payLoanSilver: function( evt ) {
            if (!this.checkAction( 'payLoan' )){return;}
            this.addTransaction(PAY_LOAN_SILVER);
        },

        // METHOD_PAY_LOAN_GOLD
        payLoanGold: function () {
            if (!this.checkAction( 'payLoan' )){return;}
            this.addTransaction(PAY_LOAN_GOLD);
        },

        cancelUndoTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/undoTransactions.html", 
                { //args
                    lock: true
                }, this, function( result ) {
                this.resetTradeValues();
                this.disableTradeIfPossible();
                if (this.currentState == 'allocateWorkers'){
                    this.setOffsetForIncome();
                }
                    this.updateTradeAffordability();
                }, function( is_error) { } );
            }
        },

        cancelEventTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'event' ) && this.checkAction( 'trade' )) {
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/undoEventTransactions.html", 
                { // args
                    lock: true
                }, this, function( result ) {
                    this.resetTradeValues();
                    this.removeButtons();
                    this.onUpdateActionButtons_preEventTrade(this.current_args);
                    this.updateTradeAffordability();
                }, function( is_error) { } );
            }
        },

        cancelHiddenUndoTransactions: function () {
            if (this.checkAction( 'event' ) && this.checkAction( 'trade' )) {
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/undoHiddenTransactions.html", 
                { //args
                    lock: true
                }, this, function( result ) {
                    HIDDEN_FOR_COST.length = 0;
                    HIDDEN_AWAY_COST.length = 0;
                    this.resetTradeValues();
                    this.disableTradeIfPossible();
                    this.updateTradeAffordability();
                }, function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doneEndgameActions.html", 
                { //args
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(','),
                }, this, function( result ) {
                    this.clearTransactionLog();
                    this.resetTradeValues();
                    this.changeStateCleanup();
                }, function( is_error) {}); 
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
                ['auctionLoanPaid', 500],
                ['buildBuilding', 1000],
                ['cancel', 500],
                ['cancelHiddenTrade', 20],
                ['clearHiddenTrades', 20],
                ['clearAllBids', 250],
                ['gainWorker', 20],
                ['gainTrack', 20],
                ['hiddenTrade', 20],
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
                ['updateWarehouseState', 20],
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

        // NOTE: this method will ALWAYS be run first on all notifications (args) before their `notif_xxx` method, updating the args values accordingly.
        // (from BGA wiki https://en.doc.boardgamearena.com/BGA_Studio_Cookbook)
        /* @Override */
        format_string_recursive: function (log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    
                    if (!this.isSpectator){
                        args.You = this.divYou(); // will replace ${You} with colored version
                    }

                    // replace args.token with appropriate html token (if possible)
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

                    // The following 5 if statements are for handling old version notifications, and may be removable, when releasing new version (testing required).

                    // make args.building_name that is not string (expected Object array) fit expected args format
                    if (args.building_name && typeof (args.building_name) != "string"){ // make building name color coded
                        args.b_type = args.building_name.type;
                        args.building_name = args.building_name.str;
                    }
                    // make args.auction that is not string (expected Object array) fit expected args format
                    if (args.auction && typeof (args.auction) != 'string'){
                        args.key = Number(args.auction.key);
                        args.auction = args.auction.str;
                    }
                    // this (and next) is for handling cases where tradeFor is an Object[Object] and tradeFor_arr is not passed
                    // it will make tradeFor_arr use tradeFor.  
                    if (args.tradeFor && typeof (args.tradeFor) != 'string'){
                        args.tradeFor_arr = args.tradeFor;
                    }
                    // this is for handling cases where tradeAway is an Object[Object] and tradeAway_arr is not passed
                    if (args.tradeAway && typeof (args.tradeAway) != 'string'){
                        args.tradeAway_arr = args.tradeAway;
                    }

                    // replace args.reason_string with token, if appropriate.
                    if (args.reason_string){
                        if (args.origin == "building" ){
                            let color = ASSET_COLORS[Number(args.b_type??0)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string, color:color});
                        } else if (args.origin == "auction"){
                            let color = ASSET_COLORS[Number(args.key??0)+10];
                            args.reason_string = this.format_block('jstpl_color_number_log', {string:_('AUCTION '), color:color, number:args.key});
                        } else if (args.origin == "event"){
                            args.reason_string = this.replaceTooltipStrings(args.reason_string);
                        } else if (args.reason_string == 'train' || args.reason_string == 'bid') { // player_tokens (bid/train)
                            let color = PLAYER_COLOR[args.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string});
                        } else if (args.reason_string == 'worker') { // worker token
                            args.reason_string = TOKEN_HTML.worker;
                        } else if (args.reason_string == 'track') { // track 
                            args.reason_string = TOKEN_HTML.track;
                        }   
                    }
                    // only one type of resource, make into token(s)
                    if (args.type){
                        if (args.amount == null){
                            args.amount = 1;
                        }
                        args.typeStr = args.type;
                        args.type = this.getOneResourceHtml(args.type, args.amount, false);
                    }
                    
                    // trade 
                    // multiple types of resources (args.tradeAway, args.tradeFor, args.resource, args.resources) 
                    // so must use `this.getResourceArrayHtml` to parse resourceArray
                    if (args.tradeAway && args.tradeAway_arr){
                        args.tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                    }
                    if (args.tradeFor && args.tradeFor_arr){
                        args.tradeFor = this.getResourceArrayHtml(args.tradeFor_arr);
                    }
                    if (args.resource && args.tradeFor_arr && args.tradeAway_arr){ // Buy/Sell/Market/Bank
                        //console.log('in Buy/Sell/Market/Bank', args.resource, args.tradeFor_arr, args.tradeAway_arr);
                        let tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                        let tradeFor  = this.getResourceArrayHtml(args.tradeFor_arr);
                        args.resource = dojo.string.substitute(_(MESSAGE_STRINGS[MESSAGE_TRADE_BUTTON_TEMPLATE]),{tradeAway:tradeAway, arrow:TOKEN_HTML.arrow, tradeFor:tradeFor});
                    } 
                    if (args.resources){//income or payment group
                        if (!args.resource_arr){ // for show player resources (last round)
                            args.resource_arr = args.resources;
                        }
                        args.resources = this.getResourceArrayHtml(args.resource_arr);
                    }

                    // begin -> replace specific args with respective tokens
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
                    // end -> replace specific args with respective tokens
                    
                    // begin -> update font args
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
                    if (args.auction){ //if key given, use that
                        let color = ASSET_COLORS[Number(args.key)+10]??'';
                        args.auction = this.format_block('jstpl_color_number_log', {string:_("AUCTION "), color:color, number:args.key});
                    } else { // otherwise use current_auction
                        let color = ASSET_COLORS[Number(this.current_auction)+10]??'';
                        args.auction = this.format_block('jstpl_color_number_log', {color:color, string:_("AUCTION "), number:this.current_auction});
                    }
                    // end -> update font args
                }
            } catch (e) {
                console.error(log,args,"Exception thrown", e.stack);
            }
            return this.inherited(arguments);
        },

        // You font update (from BGA wiki https://en.doc.boardgamearena.com/BGA_Studio_Cookbook)
        divYou : function() {
            var color = this.gamedatas.players[this.player_id].color;
            var color_bg = "";
            if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
                color_bg = "background-color:#" + this.gamedatas.players[this.player_id].color_back + ";";
            }
            var you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + __("lang_mainsite", "You") + "</span>";
            return you;
        },

        // return set of resources (of one type) as tokens in a log_container
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

        /**
         * getter method for token array processing.
         * This method will use BigVp tokens, instead of normal vp tokens.
         * This primarily for use in building tiles.
         * 
         * @argument array - object array with resources to show
         * @argument asSpan - boolean define if container should be span(true), or div(false)
         * @return set of resources (of more than 1 type) as tokens in a log_container div or span
         */
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

        /**
         * getter method for token array processing.
         * 
         * @argument array - object array with resources to show
         * @argument asSpan - boolean define if container should be span(true), or div(false)
         * @return set of resources (of more than 1 type) as tokens in a log_container div or span
         */
        getResourceArrayHtml: function( array ={}, asSpan=false, style=""){
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

        /////////////////////////
        //Begin `notif_xxx` methods

        // for transition between rounds, (moving build-able buildings)
        notif_updateBuildingStocks: function ( notif ){
            this.updateBuildingStocks(notif.args.buildings);
            this.showHideButtons();
        },

        // for moving workers between building worker slots.
        notif_workerMoved: function( notif ){
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            if (this.player_id == notif.args.player_id){
                this.moveObjectAndUpdateValues(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            } else {
                this.moveObject(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            }
        },

        // for moving train tokens on rail advancement track
        notif_railAdv: function( notif ){
            const train_token = TRAIN_TOKEN_ID[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        // for gain worker events (not assigned to building by default)
        notif_gainWorker: function( notif ){
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
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
        },

        // for pay worker action.  Has faux transition to new state, removing action buttons except for `undo`
        notif_workerPaid: function( notif ){
            this.showPay = false;
            let buttons = dojo.query(`#generalactions a`);
            for (let btn in buttons){
                if (buttons[btn].id){
                    this.fadeOutAndDestroy(buttons[btn].id);
                }
            }
            this.resetTradeValues();
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
        },

        // for gaining railroad Track
        notif_gainTrack: function( notif ){
            const p_id = Number(notif.args.player_id);
            var delay = 0;
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: PLAYER_COLOR[Number(notif.args.player_id)]}),
                    TRACK_TOKEN_ZONE[p_id]);
                    this.addTooltipHtml(`token_track_${notif.args.track_key}`, `<div style="text-align:center;">${this.replaceTooltipStrings(RESOURCE_INFO['track']['tt'])}</div>`);
            if (notif.args.tradeAway_arr){
                var destination = this.getTargetFromNotifArgs(notif);
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( TOKEN_HTML[type], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 50*(delay++) );
                        if (p_id == this.player_id || this.show_player_info){
                            this.incResCounter(p_id, type, -1);
                        }
                    }
                }
            }
        },

        // for moving a player's bid token (Boot)
        notif_moveBid: function( notif ){
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        // for moving first player token
        notif_moveFirstPlayer: function (notif ){
            const p_id = Number(notif.args.player_id);
            const tile_id = FIRST_PLAYER_ID;
            if (p_id != this.first_player){
                this.moveObject(tile_id, PLAYER_SCORE_ZONE_ID[p_id]);
                this.first_player = p_id;
            }
        },

        // for moving all bids to Pass area (bottom of Auction board)
        notif_clearAllBids: function( notif ){
            for (let i in PLAYER_COLOR){
                this.moveBid(i, BID_PASS);
            }
        },

        // for moving a building from Stock to player area.
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

        // set/update player resource amounts (if visible) when they gain income (1 resource type)
        notif_playerIncome: function( notif ){
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( TOKEN_HTML[String(notif.args.typeStr)], 'limbo', start , PLAYER_SCORE_ZONE_ID[p_id] , 500 , 50*(delay++) );
                if (p_id == this.player_id || this.show_player_info){
                    if (VP_TOKENS.includes(notif.args.typeStr)){
                        this.incResCounter(p_id, 'vp',Number(notif.args.typeStr.charAt(2)));
                    } else{ // normal case
                        this.incResCounter(p_id, notif.args.typeStr, 1);
                    }
                }
            }
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        // set/update player resource amounts (if visible) when they gain income (multiple resource types)
        notif_playerIncomeGroup: function( notif ){
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
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        // set/update warehouse state (resources available)
        notif_updateWarehouseState: function (notif){
            console.log('notif_updateWarehouseState', notif.args);
            let origin = null;
            if (notif.args.income = true){
                origin = notif.args.p_id;
            }
            this.updateWarehouseState(notif.args.state, origin);
        },

        // set/update player resource amounts (if visible) when they make payment (1 resource type)
        notif_playerPayment: function( notif ){  
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( TOKEN_HTML[notif.args.typeStr], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 100*i );
                if (p_id == this.player_id || this.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1);
                }
            }
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        // set/update player resource amounts (if visible) when they make payment (multiple resource types)
        notif_playerPaymentGroup: function( notif ){
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
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        // show hidden/pending trades (only to this player).
        notif_hiddenTrade: function ( notif ){
            console.log('notif_hiddenTrade', notif);
            this.updateHiddenTrades({trade_away:notif.args.tradeAway_arr, trade_for:notif.args.tradeFor_arr});
        },

        // clear hidden/pending trades (only shown to this player).
        notif_cancelHiddenTrade: function (notif ){
            console.log('notif_cancelHiddenTrade', notif);
            this.clearHiddenTrades();
            this.updateTradeAffordability();
        },

        notif_clearHiddenTrades: function(notif){
            console.log('notif_clearHiddenTrades', notif);
            this.clearHiddenTrades();
            this.changeStateCleanup();
        },

        // update player resources when a trade is done.
        notif_trade: function( notif ){
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], TRADE_BOARD_ID , 500 , 50*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', TRADE_BOARD_ID, PLAYER_SCORE_ZONE_ID[p_id], 500 , 50*(delay++) );
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
            if (p_id == this.player_id){
                this.resetTradeValues();
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_auctionLoanPaid: function( notif){
            console.log('notif_auctionLoanPaid', notif);
            const p_id = notif.args.player_id;
            var destination = this.getTargetFromNotifArgs(notif);
            let amt_loan = notif.args.resource_arr.loan;
            let amt_silver = notif.args.resource_arr.silver;
            var delay = 0;
            for (let i =0; i > amt_loan; i--){
                this.slideTemporaryObject(TOKEN_HTML.loan, 'limbo', PLAYER_SCORE_ZONE_ID[p_id], destination , 500 , 50*(delay++) );
                this.incResCounter(p_id, 'loan', -1);
            }
            for (let i =0; i < amt_silver; i++){
                this.slideTemporaryObject(TOKEN_HTML.silver, 'limbo', destination, PLAYER_SCORE_ZONE_ID[p_id], 500 , 50*(delay++) );
                this.incResCounter(p_id, 'silver', 1);
            }
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
            this.calculateAndUpdateScore(p_id);
        },

        // update player resources when a loan is paid
        notif_loanPaid: function( notif ){
            const p_id = notif.args.player_id;
            var delay = 0;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( TOKEN_HTML.loan, 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 50*(delay++) );
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', -1);
            }
            if (notif.args.type ){
                for (let i = 0; i < notif.args.amount; i++){
                    this.slideTemporaryObject( TOKEN_HTML[notif.args.typeStr] , 'limbo', PLAYER_SCORE_ZONE_ID[p_id], 'board', 500, 50*(delay++));
                    }
                    if (p_id == this.player_id || this.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1*(notif.args.amount));
                }
            }
            if (p_id == this.player_id){
                this.resetTradeValues();
            }
            this.loans_paid[p_id] = Number(notif.args.loans_paid);
            this.calculateAndUpdateScore(p_id);
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
        },

        notif_loanTaken: function( notif ){
            var delay = 0;
            const p_id = notif.args.player_id;
            this.slideTemporaryObject( TOKEN_HTML.loan, 'limbo' , 'board', PLAYER_SCORE_ZONE_ID[p_id],  500 , 50*(delay++) );
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 50*(delay++));
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 50*(delay++));
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', 1);
                this.incResCounter(p_id, 'silver', 2);
            }
            this.calculateAndUpdateScore(p_id);
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
        },

        // update player score
        notif_score: function( notif ){
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

        // for use when in non-show resources game, when reaching round 11 (where all player resources are revealed)
        notif_showResources: function( notif ){
            if (this.show_player_info) return;// already showing player resources.
            this.show_player_info = true;
            for(let p_id in notif.args.resource_arr){
                if (this.isSpectator || (this.player_id != p_id)){
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), PLAYER_SCORE_ZONE_ID[p_id] );
                    dojo.query(`#player_resources_${PLAYER_COLOR[p_id]} .player_resource_group`).removeClass('noshow');
                    this.setupOnePlayerResources(notif.args.resource_arr[p_id]);
                }
                this.calculateAndUpdateScore(p_id);
            }
        },

        // complex action that undoes other notifications, as well as board states associated with those actions.
        notif_cancel: function( notif ){
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
                    case 'buildingState':
                        let oldState = this.getWarehouseResources();
                        //console.log('oldState', oldState);
                        if (log.b_id == BLD_WAREHOUSE){ //currently only building using state
                            this.updateWarehouseState(log.state);
                        }
                        if (dojo.query('#choose_warehouse_buttons').length >0){    
                            let newState = this.getWarehouseResources();
                            //console.log('newState', newState);
                            for(let type in newState){
                                //console.log('checking', type);
                                if (!(type in oldState)){
                                    //console.log('found missing', type);
                                    this.addActionButton( `btn_warehouse_${type}`, TOKEN_HTML[type], `onClickWarehouseResource`, null, false, 'gray');
                                    dojo.place(`btn_warehouse_${type}`,'choose_warehouse_buttons', 'last');
                                    this.onClickWarehouseResource( {target:{id:`btn_warehouse_${type}`}});
                                }
                            }
                        }
                        dojo.query(`#btn_warehouse_${this.warehouse}:not(.bgabutton_blue)`).addClass('bgabutton_blue' );
                        dojo.query(`#btn_warehouse_${this.warehouse}.bgabutton_gray`).removeClass('bgabutton_gray');
                    break;
                    case 'passBid':
                        this.moveBid(p_id, log.last_bid);
                    break;
                }
            }
            this.loans_paid[p_id] = Number(notif.args.loans_paid);

            this.resetTradeValues();
            this.cancelNotifications(notif.args.move_ids);
            this.clearTransactionLog();
            this.calculateAndUpdateScore(p_id);
            if (p_id == this.player_id){
                this.updateTradeAffordability();
            }
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
