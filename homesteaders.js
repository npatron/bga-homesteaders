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

    const BUILDING_LOC_FUTURE  = 0;
    const BUILDING_LOC_OFFER   = 1;
    const BUILDING_LOC_PLAYER  = 2;
    const BUILDING_LOC_DISCARD = 3;

    const BUILDING_HOMESTEAD_YELLOW = 1;
    const BUILDING_HOMESTEAD_RED = 2;
    const BUILDING_HOMESTEAD_GREEN = 3;
    const BUILDING_HOMESTEAD_BLUE = 4;
    // have ongoing effect
    const BUILDING_MARKET = 7;
    const BUILDING_GENERAL_STORE = 14
    const BUILDING_RIVER_PORT = 17;
    const BUILDING_BANK = 22;
    const BUILDING_FORGE = 24;
    const BUILDING_LAWYER = 27;

    //have on Build bonus should be able to handle in php...
    const BUILDING_BOARDING_HOUSE = 10;
    const BUILDING_RANCH = 12;
    const BUILDING_WORKSHOP = 19;
    const BUILDING_DEPOT = 20;
    const BUILDING_TRAIN_STATION =33;
    const BUILDING_RAIL_YARD = 35;


    const AUCTION_LOC_DISCARD = 0;

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
            this.bid_zone_height = 36;
            this.bid_zone_width = 36;
            this.bid_val_arr = [3,4,5,6,7,9,12,16,21];
            // auction bid zones
            this.bid_zones = [];
            this.bid_zones[-1] = new ebg.zone();
            this.bid_zones[0] = new ebg.zone();
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

            this.rail_adv_zone = [];
            for(var i=0; i<6;i++){
                this.rail_adv_zone[i]= new ebg.zone();
            }

            this.auction_ids = [];

            // storage for buildings
            this.main_building_zone = new ebg.zone();
            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();

            this.roundCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_building_zone_id = [];
            this.player_building_zone = [];
            this.building_worker_zones = [];
            //this.players_railroad_advancements = [];   // indexed by player id
            this.resourceCounters = [];

            this.tile_width = 144;
            this.tile_height = 196;
            this.worker_dimension = 35;
            this.token_dimension = 50;
            
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;

            this.hasBuilding = []; 
            this.last_selected = [];
            this.type_selector = [];
            this.type_selector['bid'] = '.bid_slot';
            this.type_selector['bonus'] = '.train_bonus';
            this.type_selector['worker_slot'] = '.worker_slot';
            this.type_selector['building'] = '.building_tile';
            this.type_selector['worker'] = '.token_worker';
            this.type_selector['trade'] = '.trade_option';
            
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
            for( let p_id in gamedatas.players ) {
                ++this.playerCount;
                const player = gamedatas.players[p_id];
                const current_player_color = player.color_name;
                if( this.player_id == p_id){
                    const player_board_div = $('player_board_'+p_id);
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
                    dojo.place(`player_zone_${current_player_color}`, 'player_zones', "first");
                } 
                dojo.removeClass("player_zone_"+current_player_color.toString(), "noshow");
                dojo.byId("player_name_"+current_player_color.toString()).innerText = player.player_name;
                
                this.player_color[p_id] = current_player_color;
                this.token_divId[p_id] = 'token_zone_' + this.player_color[p_id].toString();
                this.token_zone[p_id] = new ebg.zone();
                this.token_zone[p_id].create ( this, this.token_divId[p_id] , this.token_dimension, this.token_dimension );

                this.player_building_zone_id[p_id] = 'building_zone_'+ this.player_color[p_id].toString();
                this.player_building_zone[p_id] = new ebg.zone();
                this.player_building_zone[p_id].create(this, this.player_building_zone_id[p_id], this.tile_width, this.tile_height);
            }

            this.setupPlayerResources(gamedatas.player_resources);
            // Auctions: 
            this.setupAuctionZones();
            this.showCurrentAuctions(gamedatas.auctions, gamedata.round_number);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);

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
            this.roundCounter.create('round_number');

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

        setupBuildings: function(buildings){
            this.main_building_zone.create (this, 'main_building_zone', this.tile_width, this.tile_height );
            this.main_building_zone.setPattern('custom');
            this.main_building_zone.itemtIdToCoords = function(i, control_width){
                // Settlement (only) row 1
                if (i == 5)return { x: 0, y: 0, w:this.tile_width, h:this.tile_height };
                if (i <= 9){
                    let xoff = 150 + (10* (i%6));
                    let yoff = 0   + (10* (i%6));
                    return { x:xoff , y: yoff, w:this.tile_width, h:this.tile_height }
                }
                if (i <= 12){
                    let xoff = 310 + (10* (i%6));
                    let yoff = 0   + (10* (i%6));
                    return { x:xoff , y: yoff, w:this.tile_width, h:this.tile_height }
                }
                if (i <= 15){
                    let xoff = 470 + (10* (i%6));
                    let yoff = 0   + (10* (i%6));
                    return { x:xoff , y: yoff, w:this.tile_width, h:this.tile_height }
                }
                if (i == 15) return {x: 630, y: 0, w:this.tile_width, h:this.tile_height}
                // SETTLEMENT/TOWN row 2
                if (i == 16) return {x: 0,   y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 17) return {x: 150, y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 18) return {x: 300, y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 19) return {x: 310, y: 230, w:this.tile_width, h:this.tile_height}// stacked 
                if (i == 20) return {x: 450, y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 21) return {x: 600, y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 22) return {x: 610, y: 230, w:this.tile_width, h:this.tile_height}// stacked
                //row 3
                if (i == 23) return {x: 0, y: 430, w:this.tile_width, h:this.tile_height}
                if (i == 24) return {x: 10, y: 440, w:this.tile_width, h:this.tile_height}// stacked
                if (i == 25) return {x: 150, y: 430, w:this.tile_width, h:this.tile_height}
                if (i == 26) return {x: 160, y: 440, w:this.tile_width, h:this.tile_height}// stacked
                if (i == 27) return {x: 300, y: 430, w:this.tile_width, h:this.tile_height}
                if (i == 28) return {x: 310, y: 440, w:this.tile_width, h:this.tile_height}// stacked
                // Town (only) settlement will be gone... so on row 1
                if (i == 29) return { x: 0, y: 0, w:this.tile_width, h:this.tile_height };
                if (i == 30) return { x: 150, y: 0, w:this.tile_width, h:this.tile_height };
                if (i == 31) return { x: 160, y: 10, w:this.tile_width, h:this.tile_height };//stacked
                if (i == 32) return { x: 300, y: 0, w:this.tile_width, h:this.tile_height };
                if (i == 33) return { x: 310, y: 10, w:this.tile_width, h:this.tile_height };//stacked
                if (i == 34) return { x: 450, y: 0, w:this.tile_width, h:this.tile_height };
                if (i == 35) return { x: 600, y: 0, w:this.tile_width, h:this.tile_height };
                // row 4
                if (i == 36) return { x: 0, y: 650, w:this.tile_width, h:this.tile_height };
                if (i == 37) return { x: 150, y: 650, w:this.tile_width, h:this.tile_height };
                if (i == 38) return { x: 160, y: 660, w:this.tile_width, h:this.tile_height };//stacked
                if (i == 39) return { x: 300, y: 650, w:this.tile_width, h:this.tile_height };
                if (i == 40) return { x: 450, y: 650, w:this.tile_width, h:this.tile_height };
                if (i == 41) return { x: 600, y: 650, w:this.tile_width, h:this.tile_height };
                // on end of row 2
                if (i == 42) return { x: 450, y: 430, w:this.tile_width, h:this.tile_height };
                // CITY (only) all other tiles should be gone. so row 1
                if (i == 43) return {x: 0,   y: 0, w:this.tile_width, h:this.tile_height}
                if (i == 44) return {x: 10, y: 10, w:this.tile_width, h:this.tile_height}// stacked 
                if (i == 45) return {x: 150, y: 0, w:this.tile_width, h:this.tile_height}
                if (i == 46) return {x: 300, y: 0, w:this.tile_width, h:this.tile_height}
                if (i == 47) return {x: 310, y: 10, w:this.tile_width, h:this.tile_height}// stacked 
                if (i == 48) return {x: 450, y: 0, w:this.tile_width, h:this.tile_height}
                if (i == 49) return {x: 460, y: 10, w:this.tile_width, h:this.tile_height}// stacked
                // row 2
                if (i == 50) return {x: 0,   y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 51) return {x: 10, y: 230, w:this.tile_width, h:this.tile_height} // stacked 
                if (i == 52) return {x: 150, y: 220, w:this.tile_width, h:this.tile_height}
                if (i == 53) return {x: 300, y: 220, w:this.tile_width, h:this.tile_height}
            };
            
            this.setupInitialHasBuilding();
            for (let b_key in buildings){
                const building = buildings[b_key];
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: building.b_id}), 'future_building_zone');
                const building_divId = `building_tile_${b_key}`;
                if (building.location == BUILDING_LOC_PLAYER){
                    this.player_building_zone[building.p_id].placeInZone(`building_tile_${b_key}`, building.b_id);
                    this.addBuildingWorkerSlots(building);
                    if (building.p_id == this.player_id){
                        this.updateHasBuilding(building.b_id); 
                    }
                } else if (building.location == BUILDING_LOC_OFFER) {
                    this.main_building_zone.placeInZone(`building_tile_${b_key}`, b_key);
                    this.addBuildingWorkerSlots(building);
                    dojo.connect($(building_divId), 'onclick', this, 'onClickOnBuilding' );
                }
            }
        },

        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: this.player_color[track.p_id]}), 'future_building_zone');
                this.player_building_zone[track.p_id].placeInZone(`token_track_${track.r_key}`,50);
            }
        },

        setupInitialHasBuilding: function(){
            this.hasBuilding[BUILDING_MARKET] = false;
            this.hasBuilding[BUILDING_GENERAL_STORE] = false;
            this.hasBuilding[BUILDING_RIVER_PORT] = false;
            this.hasBuilding[BUILDING_FORGE] = false;
            this.hasBuilding[BUILDING_LAWYER] = false;
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
            }
        },

        setupWorkers: function(workers) {
            for (let w_key in workers){
                const worker = workers[w_key];
                dojo.place(this.format_block( 'jptpl_token', {
                    type: "worker", id: w_key.toString()}), this.token_divId[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                if (worker.b_key == 0 ){
                    this.token_zone[worker.p_id].placeInZone(worker_divId );
                } else { 
                    this.building_worker_zones[worker.b_key][worker.b_slot].placeInZone(worker_divId);
                }
                if (worker.p_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        setupBidZones: function (auctionCount) {
            this.token_divId[0] = 'passed_bid_zone';
            this.token_divId[-1] = 'pending_bids';
            this.bid_zones[-1].create (this, this.token_divId[-1], this.token_dimension, this.token_dimension );
            this.bid_zones[-1].setPattern('horizontalfit');
            this.bid_zones[0].create(this, this.token_divId[0], this.token_dimension, this.token_dimension );
            this.bid_zones[0].setPattern('horizontalfit');

            for (let bid =0; bid < this.bid_val_arr.length; bid ++){
                for (let auc = 1; auc <= auctionCount; auc++){
                    const bid_slot_divId = `bid_slot_${auc}_${this.bid_val_arr[bid].toString()}`;
                    this.bid_zones[auc][bid].create(this, bid_slot_divId, this.token_dimension, this.token_dimension);
                    dojo.connect($(bid_slot_divId), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        setupBidTokens: function(resources) {
            for(let player_id in resources){
                const player_bid_loc = resources[player_id].bid_loc;
                const player_color = this.player_color[player_id];
                const player_token_divId = `token_${player_color}_bid`;
                if (player_bid_loc == NO_BID || player_bid_loc == OUTBID){
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color, id: "bid"}), this.token_divId[-1]);
                    this.bid_zones[-1].placeInZone(player_token_divId);
                } else if (player_bid_loc == BID_PASS) {
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color, id: "bid"}), this.token_divId[0]);
                    this.bid_zones[0].placeInZone(player_token_divId);
                } else {
                    const bid_pair  = this.getBidPairFromBidNo(player_bid_loc);
                    const bid_aucNo = bid_pair.auction_no;
                    const bid_index = bid_pair.bid_index;
                    const bid_slot  = this.bid_val_arr[bid_index];
                    const bid_slot_divId = `bid_slot_${bid_aucNo}_${bid_slot}`;
                    dojo.place(this.format_block( 'jptpl_token', {type: player_color, id: "bid"}), bid_slot_divId);
                    this.bid_zones[bid_aucNo][bid_index].placeInZone(player_token_divId);
                }
            }
        },

        setupRailLines: function(resources) {
            for(let i =0; i < 6; i++){
                this.rail_adv_zone[i].create( this, 'train_advancement_'+i.toString(), this.token_dimension, this.token_dimension);
                this.rail_adv_zone[i].setPattern( 'horizontalfit' );
            }
            for(let player_id in resources){
                const player_rail = 'train_advancement_' + (resources[player_id].rail_adv.toString());
                dojo.place(this.format_block( 'jptpl_token', {
                    type: this.player_color[player_id].toString(), 
                    id: "rail"}),
                player_rail);
                this.rail_adv_zone[resources[player_id].rail_adv].placeInZone(`token_${this.player_color[player_id]}_rail`);
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
                    setupTiles (this.gamedatas.round_number, this.gamedatas.auction_tiles, this.gamedatas.buildings);  
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
            
            switch( stateName )
            {
                case 'collectIncome':
                    break;
                case 'allocateWorkers':
                    this.disableTradeIfPossible();
                    if (this.last_selected['worker']){
                        dojo.removeClass(this.last_selected['worker'], 'selected');
                    }
                    const workers = dojo.query( `#player_zone_${this.player_color[current_player_id]} .token_worker` );
                    workers.removeClass('selectable');
                    // also make building_slots selectable.
                    const buildingSlots = dojo.query(`#building_zone_${this.player_color[current_player_id]} .worker_slot`);
                    buildingSlots.removeClass('selectable');
                    break;    
                case 'payWorkers':
                    this.hidePaymentSection();
                    this.disableTradeIfPossible();
                    break;
                case 'playerBid':
                    break;
                case 'payAuction':
                    this.hidePaymentSection();
                    this.disableTradeIfPossible();
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
                        this.addActionButton( 'btn_trade',     _('Trade'), 'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan', _('Take Loan'),      'takeLoan', null, false, 'gray');
                    break;
                    case 'chooseBuildingToBuild':
                        console.log(args.allowed_buildings);
                        //mark buildings as selectable
                        for(let i in args.allowed_buildings){
                            const building = args.allowed_buildings[i];
                            const building_divId = `building_tile_${building.building_key}`;
                            dojo.addClass(building_divId, 'selectable');
                        }
                        this.addActionButton( 'btn_choose_building', _('Build'),     'chooseBuilding');
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                        this.addActionButton( 'btn_do_not_build', _('Do not Buid'), 'doNotBuild', null, false, 'red');
                    break;
                    case 'bonusChoice':
                        const option = args.bonus_option;
                        if(option == WOOD){
                            this.addActionButton( 'btn_wood_track', _('Trade wood for rail track'), 'woodForTrack');
                        } else if (option == COPPER){
                            this.addActionButton( 'btn_copper_vp',  _('Trade Copper for 4 VP'),     'copperFor4VP');
                        } else if (option == COW){
                            this.addActionButton( 'btn_cow_vp',     _('Trade Livestock for 4 VP'),  'cowFor4VP');
                        } else if (option == FOOD){
                            this.addActionButton( 'btn_food_vp',    _('Trade Food for 2 VP'),       'foodFor2VP');
                        }
                        this.addActionButton( 'btn_trade',       _('Trade'),        'tradeActionButton', null, false, 'gray');
                        this.addActionButton( 'btn_take_loan',   _('Take Loan'),    'takeLoan', null, false, 'gray');
                        this.addActionButton( 'btn_pass_bonus', _('Do not Get Bonus'), 'passBonus', null, false, 'red');
                    break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        /*** setup  ***/
        setupTiles: function(round_number, auction_tiles, buildings) {
            this.roundCounter.setValue(round_number);
            this.showCurrentAuctions(auction_tiles, round_number);
            
            if (round_number == 5 || round_number == 9){
                updateBuildingStocks(buildings);
            }

        },

        /***** building utils *****/
        moveBuildingToPlayer: function(building, player){
            this.player_building_zone[player.player_id].placeInZone(`building_tile_${building.building_key}`);
            if (player.player_id == this.player_id){
                const slots = dojo.query(`#building_tile_${building.building_key} .worker_slot`)            
                for(let i in slots){
                    if(slots[i].id != null){
                        dojo.connect($(slots[i].id),'onclick', this, 'onClickOnWorkerSlot');
                    }
                }
            }
        },

        moveBuildingToMainZone: function(building) {
            this.main_building_zone.placeInZone(`building_tile_${building.building_key}`);
        },

        moveBuildingToDiscard: function(building){
            this.main_building_zone.placeInZone(`building_tile_${building.building_key}`);
        },

        updateBuildingStocks: function(buildings){

        },

        updateHasBuilding(b_id) {
            switch (b_id) {
                case BUILDING_MARKET: //for trade options
                    this.hasBuilding[BUILDING_MARKET] = true;
                return;
                case BUILDING_GENERAL_STORE:
                    this.hasBuilding[BUILDING_GENERAL_STORE] = true;
                return;
                case BUILDING_RIVER_PORT: //this needs to be here
                    this.hasBuilding[BUILDING_RIVER_PORT] = true;
                return;
                case BUILDING_FORGE:
                    this.hasBuilding[BUILDING_FORGE] = true;
                return;
                 // I think I can handle bids in php...
                /*case BUILDING_LAWYER:
                    this.hasBuilding[BUILDING_LAWYER] = true;
                return;*/
                case BUILDING_BANK: //for trade options
                    this.hasBuilding[BUILDING_BANK] = true;
                return;
            } 
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

        clearSelectable: function(type, selected = false){
            console.log(`clearing ${type} selectable/selected`);
            
            const selectables = dojo.query(this.type_selector[type]);
            selectables.removeClass('selectable');
            
            if (selected == true && this.last_selected[type] != ""){
                console.log("clearing selected:"+ this.last_selected[type]);
                dojo.removeClass(this.last_selected[type], 'selected');
                this.last_selected[type] = "";
            }
        },
        
        disableTradeIfPossible: function() {
            if (dojo.query('#trade_board .selectable').length >0){
                dojo.removeClass('trade_top', 'trade_size');
                this.slideToObject('trade_board', 'trade_bottom').play();
                // now make the trade options not selectable
                dojo.query(this.type_selector['trade']).removeClass( 'selectable' );
                dojo.removeClass('done_trading', 'selectable' );
            }
        },

        enableTradeIfPossible: function() {
            if (!dojo.query('#trade_board .selectable').length >0){
                // make space for it, and move trade board to top.
                dojo.addClass('trade_top', 'trade_size');
                this.slideToObject( 'trade_board', 'trade_top').play();
                //make the trade options selectable
                dojo.query('div#trade_board .trade_option:not([id^="trade_market"]):not([id^="trade_bank"])').addClass('selectable');
                if (this.hasBuilding[BUILDING_MARKET]){
                    dojo.query('#trade_board .trade_option[id^="trade_market"]').addClass('selectable');
                }
                if (this.hasBuilding[BUILDING_BANK]){
                    dojo.query('#trade_board .trade_option[id^="trade_bank"]').addClass('selectable');
                }
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
                case 'track':  return TRACK;
                case 'worker': return WORKER;
                case 'vp':     return VP;
                case 'silver': return SILVER;
                case 'loan':   return LOAN;
            }
        },

        updateSelected: function(type, selected_id) {
            // if not selectable or selected 
            console.log ('updated selected type: '+type);
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

        hidePaymentSection: function(){
            dojo.removeClass( 'payment_top' , 'payment_size');
            this.slideToObject( 'payment_section', 'payment_bottom' ).play();
        },

        showPaymentSection: function(){
            dojo.addClass( 'payment_top' , 'payment_size');
            this.slideToObject( 'payment_section', 'payment_top' ).play();
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
            if( !this.checkAction( 'trade' )) { return; } 
            var tradeAction = evt.target.id.substring(6);  
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
            this.clearSelectable('bid', true);
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
                this.clearSelectable('bid', true);
            }
        },

        /***** PAY AUCTION PHASE *****/
        donePayAuction: function(){
            if( this.checkAction( 'done' )){
                this.ajaxcall( "/homesteaders/homesteaders/payAuction.html", {gold: this.goldAmount, lock: true}, this, 
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

        /***** BUILD BUILDING PHASE *****/
        onClickOnBuilding: function( evt ){
            console.log( 'onClickOnBuilding' );
            console.log( evt);
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( !dojo.hasClass(evt.target.id,'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                this.updateSelected('building', evt.target.id);
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
                        function( result ) {}, 
                        function( is_error) {} );
            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.confirmationDialog( _('Are you sure you want to not build?'), dojo.hitch( this, function() {
                    this.ajaxcall( "/homesteaders/homesteaders/doNotBuild.html", {lock: true}, this, 
                    function( result ) {}, 
                    function( is_error) {} );
                } ) ); 
                return; 
            }
        },

        /***** Auction Bonus *****/
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
                return; 
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
            dojo.subscribe( 'gainWorker',  this, "notif_gainWorker" );
            dojo.subscribe( 'workerMoved', this, "notif_workerMoved" );
            dojo.subscribe( 'railAdv',     this, "notif_railAdv" );
            dojo.subscribe( 'moveBid',     this, "notif_moveBid");
            dojo.subscribe( 'playerIncome', this, "notif_playerIncome");
            dojo.subscribe( 'playerPayment', this, "notif_playerPayment");
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

        notif_updateAuction: function( notif ) {
            console.log ( 'notif_updateAuction' );
            console.log ( notif );
            if (notif.args.state == 'discard') {
                this.auction_zones[notif.args.auction_no].removeAll();
            } else if (notif.args.state == 'show'){
                for (let i in notif.args.auctions){
                    
                }
            }
        },

        notif_workerMoved: function( notif ){
            console.log ( 'notif_workerMoved' );
            console.log ( notif );
            
            this.building_worker_zones[notif.args.building_key][notif.args.building_slot].placeInZone('token_worker_'+notif.args.worker_key.toString());
            if (notif.args.player_id == this.player_id)
            {
                dojo.removeClass(this.last_selected['worker'] ,'selected');
                this.last_selected['worker'] = "";
            }
        },

        notif_railAdv: function( notif ){
            console.log ('notif_railAdv');
            console.log ( notif );
            const current_player_color = this.player_color[notif.args.player_id];
            const rail_adv_token_id =  `token_${current_player_color}_rail`;
            this.rail_adv_zone[notif.args.rail_destination].placeInZone(rail_adv_token_id);
        }, 

        notif_gainWorker: function( notif ){
            console.log ('notif_gainWorker');
            console.log ( notif );
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_token', {
                type: "worker", id: notif.args.worker_key.toString()}), this.token_divId[notif.args.player_id] );
            this.token_zone[notif.args.player_id].placeInZone(worker_divId);
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
            }
        },

        notif_moveBid: function( notif ){
            console.log ('notif_moveBid');
            console.log ( notif );
            const player_color = this.player_color[notif.args.player_id];
            const bid_divId = `token_${player_color}_bid`;
            console.log("id:" + bid_divId + ", loc:"+ notif.args.bid_location );
            if (notif.args.bid_location == 10) { // OUTBID
                this.bid_zones[-1].placeInZone(bid_divId);
            } else if(notif.args.bid_location == 20){ // pass
                this.bid_zones[0].placeInZone(bid_divId);
            } else { //actual bid
                const bid_pair = this.getBidPairFromBidNo(notif.args.bid_location);
                this.bid_zones[bid_pair.auction_no][bid_pair.bid_index].placeInZone(bid_divId);
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                const player_token_divId = `token_${this.player_color[i]}_bid`;
                this.bid_zones[-1].placeInZone(player_token_divId);
            }
        },

        notif_buyBuilding: function( notif ){
            console.log ('notif_buyBuilding');
            console.log ( notif ); 
            this.player_building_zone[notif.args.player_id].placeInZone(`building_tile_${notif.args.building_key}`);
            if (notif.args.player_id == this.player_id)
                this.updateHasBuilding(notif.args.building_id);
        },


        notif_playerRecieveTrack: function( notif){
            console.log ('notif_playerRecieveTrack');
            console.log ( notif );
            
            const building_zone_divId = `building_zone_${this.player_color[notif.args.player_id]}`;
            const trackToken_divId = `token_track_${notif.args.key}`;
            dojo.place(this.format_block( 'jptpl_track', {id: notif.args.key, color: this.player_color[notif.args.player_id]}), building_zone_divId);
            this.player_building_zone[track.p_id].placeInZone(`token_track_${notif.args.key}`,50);
        },

        notif_playerIncome: function( notif ){
            console.log ('notif_playerIncome');
            console.log ( notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            for(let i = 0; i < notif.args.amount; i++){
                console.log("sending token '"+notif.args.type+"' to player '"+ notif.args.player_name+ "'");
                this.slideTemporaryObject( `<div class="token token_${notif.args.type}"></div>`,'limbo' , 'board', player_zone_divId , 500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.type].incValue(1);
                }
            }  
        },

        notif_playerPayment: function( notif ){
            console.log ('notif_playerPayment');
            console.log ( notif);
            const player_zone_divId = `player_board_${notif.args.player_id}`;
            console.log ( player_zone_divId );
            console.log ( notif.args.amount );
            for(let i = 0; i < notif.args.amount; i++){
                console.log("sending token '"+notif.args.type+"' from player '"+ notif.args.player_name+ "'");
                this.slideTemporaryObject( `<div class="token token_${notif.args.type}"></div>`, 'limbo' , player_zone_divId, 'board',  500 , 100*i );
                if (notif.args.player_id == this.player_id){
                    this.resourceCounters[notif.args.type].incValue(-1);
                }
            }
        }
   });             
});
