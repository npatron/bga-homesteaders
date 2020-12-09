{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteaderstb implementation : © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

-->
<div id="main_container" class="container">
    <div id ="top">
        <span id="top_texts">
            <span id="round_text" class="useFont">{ROUND_STRING}<span id="round_number" class="biggerFont">{ROUND_NUMBER}  </span>  </span>
            <div id='useSilver_form'> 
                <tr>
                    <input type="checkbox" id="checkbox1"/>
                    <label for="checkbox1" name="checkbox1_lbl" class="font bold">
                        {PAY} <span aria="worker" title="worker" class="log_worker token_inline"></span>
                        {WITH} <span aria="silver" title="silver" class="log_silver token_inline"></span>
                    </label>
                </tr>
            </div>         
        </span>
        <a href="#" id="undo_trades_btn" class="bgabutton bgabutton_red"><span id='undoTrade' class="font">{UNDO_TRADE}</span></a>
        <a href="#" id="tgl_future_auc" class="bgabutton bgabutton_gray">
            <span id='auc_future' class="font">{SHOW} </span><span class="font"> {FUTURE_AUCTION}</span>
        </a>
        <a href="#" id="tgl_main_bld" class="bgabutton bgabutton_gray">
            <span id="bld_main" class="font">{HIDE} </span><span class="font"> {MAIN_BUILDING}</span>
        </a>
        <a href="#" id="tgl_past_bld" class="bgabutton bgabutton_gray">
            <span id="bld_discard" class="font">{SHOW} </span><span class="font"> {BUILDING_DISCARD}</span>
        </a>
        <a href="#" id="tgl_future_bld" class="bgabutton bgabutton_gray">
            <span id="bld_future" class="font">{SHOW} </span><span class="font"> {FUTURE_BUILDING}</span>
        </a>
        <a href="#" id="confirm_trade_btn" class="bgabutton bgabutton_blue"><span id='confirmTrade' class="font">{CONFIRM_TRADE}</span></a>
    </div>
    <!-- Auction Board -->
    <div id="board" class="shadow">
        <div id="pending_bids" class="bid_token_zone"> </div>
        <!-- BEGIN bid_slot -->
        <div id="bid_slot_{A}_{B}" class="bid_slot"> </div>
        <!-- END bid_slot -->

        <!-- BEGIN auction_stacks -->
        <div id="auction_tile_zone_{A}" class="auction_tiles_zone"> </div>
        <!-- END auction_stacks -->

        <!-- BEGIN train_advancement -->
        <div id="train_advancement_{I}" class="train_advance"> </div>
        <!-- END train_advancement -->

        <div id="train_bonus_1_trade" class="train_bonus"> </div>
        <div id="train_bonus_2_track" class="train_bonus"> </div>
        <div id="train_bonus_3_worker" class="train_bonus"> </div>
        <div id="train_bonus_4_wood" class="train_bonus"> </div>
        <div id="train_bonus_4_food" class="train_bonus"> </div>
        <div id="train_bonus_4_steel" class="train_bonus"> </div>
        <div id="train_bonus_4_gold" class="train_bonus"> </div>
        <div id="train_bonus_4_copper" class="train_bonus"> </div>
        <div id="train_bonus_4_cow" class="train_bonus"> </div>
        <div id="train_bonus_5_vp" class="train_bonus"> </div>
        <div id="passed_bids" class="bid_token_zone"> </div>
    </div>
    <div id="trade_top" class="trade_size noshow">
    </div>
</div>
<div id='building_location' class='tile_container'>
    <div id='future_auction_container' class='whiteblock border_a1 noshow'>
        <!-- BEGIN auction_string -->
        <span class="auction_string biggerFont {COLOR}" style="left: {OFFSET}%;"> {AUCTION} {A}</span>
        <!-- END auction_string -->
        <br><br>
        <!-- BEGIN future_auction_zones -->
        <div id="future_auction_{A}" class="main_building_zone future_auction_zone" style="width: {PCT}%;"> </div>
        <!-- END future_auction_zones -->
        </div>
    </div>
    <div id='past_building_container' class="whiteblock border_white noshow">
        <span class="biggerFont">{BUILDING_DISCARD}</span>
        <div id='past_building_zone' class="main_building_zone"> </div>
    </div>
    <div id='future_building_container' class="whiteblock border_gray noshow">
        <span class="biggerFont">{FUTURE_BUILDING}</span> 
        <div id='future_building_zone' class="main_building_zone"> </div>
    </div>
    <div id="main_building_container" class="whiteblock border_black">
        <span class="biggerFont">{BUILDING_STOCK}</span>
        <div id="main_building_zone" class="main_building_zone"> </div>
    </div>
</div>

<!-- Token limbo -->
<div id="limbo"> 
    <div id='first_player_tile' class='building_tile'> </div>
</div>
<!-- Player Buildings section -->
<div id='player_zones' class="players_container">
    <div id ='First'> </div> <div id ='Second'> </div> <div id ='Third'> </div> <div id ='Fourth'> </div>
    <!-- BEGIN player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR}" style="margin-top:4px;">
        <div id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="building_zone_{COLOR}" class="building_zone"> </div>
    </div>
    <!-- END player_zone -->
</div>

<!-- bottom area for non-active sections. -->
<div id ="bottom"> 
    <div id="trade_bottom">
        <div id="trade_board" class="">
            <!-- Trade Helper Board -->
            <div id="trade_buy_wood" class="trade_option"> </div>
            <div id="trade_buy_food" class="trade_option"> </div>
            <div id="trade_buy_steel" class="trade_option"> </div>
            <div id="trade_buy_gold" class="trade_option"> </div>
            <div id="trade_buy_copper" class="trade_option"> </div>
            <div id="trade_buy_livestock" class="trade_option"> </div>

            <div id="trade_sell_wood" class="trade_option"> </div>
            <div id="trade_sell_food" class="trade_option"> </div>
            <div id="trade_sell_steel" class="trade_option"> </div>
            <div id="trade_sell_gold" class="trade_option"> </div>
            <div id="trade_sell_copper" class="trade_option"> </div>
            <div id="trade_sell_livestock" class="trade_option"> </div>

            <div id="trade_market_wood_food" class="trade_option"> </div>
            <div id="trade_market_food_steel" class="trade_option"> </div>
            <div id="trade_bank_trade_silver" class="trade_option"> </div>
        </div>
    </div>
</div>

<script type="text/javascript">

var jstpl_building_stack= '<div id="building_stack_${id}" class="building_zone_diag" style="order: ${order}"></div>';
var jstpl_buildings='<div id="building_tile_${key}" class="building_tile build_tile_${id}"></div>';
var jstpl_building_slot='<div id="slot_${key}_${slot}" class="worker_slot slot_${id}_${slot} key_${key}"></div>'; 

var jstpl_auction_tile='<div id="auction_tile_${auc}" class="auction_tile border_${color}"> </div>';

var jptpl_worker='<div id="token_worker_${id}" class="token_worker"> </div>';
var jptpl_player_token='<div id="token_${type}_${color}" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_dummy_player_token='<div id="token_${type}_${color}_dummy" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_track='<div id="token_track_${id}" class="token_track border_${color}"> </div>';

var jstpl_player_board = '\<div class="cp_board">\
    <div class="score_group">\
    <div id="silvericon_p${id}" class="score_token score_silver score"></div><span id="silvercount_${id}" class="player_silver score_text">0</span>\
    <div id="tradeicon_p${id}"  class="score_token score_trade score"></div><span id="tradecount_${id}" class="player_trade score_text">0</span>\
    <div id="woodicon_p${id}"   class="score_token score_wood score"></div><span id="woodcount_${id}" class="player_wood score_text">0</span>\
    <div id="foodicon_p${id}"   class="score_token score_food score"></div><span id="foodcount_${id}" class="player_food score_text">0</span>\
    <div id="steelicon_p${id}"  class="score_token score_steel score"></div><span id="steelcount_${id}" class="player_steel score_text">0</span>\
    <div id="vpicon_p${id}"     class="score_token score_vp score"></div><span id="vpcount_${id}" class="player_vp score_text">0</span>\
    <div id="loanicon_p${id}"   class="score_loan score score"></div><span id="loancount_${id}" class="player_loan score_text">0</span>\
    <div id="goldicon_p${id}"   class="score_token score_gold score"></div><span id="goldcount_${id}" class="player_gold score_text">0</span>\
    <div id="cowicon_p${id}"    class="score_token score_cow score"></div><span id="cowcount_${id}" class="player_cow score_text">0</span>\
    <div id="coppericon_p${id}" class="score_token score_copper score"></div><span id="coppercount_${id}" class="player_copper score_text">0</span>\
</div></div>';

var jstpl_pay_button = '<span id="pay_gold" class="noshow useFont">0</span> \
 <span id="pay_gold_tkn" class="noshow log_gold token_inline"></span> \
 <span id="pay_silver" class="useFont">0</span> \
<span id="pay_silver_tkn" class="log_silver token_inline"></span>';
var jstpl_color_log = '<span title="${string}" class="font ${color}">${string}</span>';
var jstpl_color_number_log = '<span class="font ${color}" >${string}</span><span class="biggerFont bold ${color}">${number}</span>';
var jstpl_resource_inline = '<div title = "${type}" class="log_${type} token_inline"></div>';
var jstpl_resource_log= '<div title = "${type}" class="log_${type} log_token"></div>';
var jstpl_player_token_log= '<div title = "${type}_${color}" class="${type}_${color} log_${type}"></div>';
var jptpl_track_log= '<div title = "${type}" class="log_inline_${type}" ></div>';
var jptpl_x_loan= '<div title ="pay_loan" class="x_out log_inline_loan" ></div>';

var jptpl_bld_tt = '<span class="font bold ${type}">${name}</span><p class="alignright"><span aria="${vp}" title="${vp}" class="log_${vp} token_inline"></span></p><br>\
    <p class="useFont">${COST}${cost_vals}</p><hr>\
    <div style="text-align: center;" class="useFont">${}</div><hr>\
    <span class="income">${INCOME}<br></span>\
    <div style="text-align: center;" class="useFont">${inc_vals}<div>';
</script>  

{OVERALL_GAME_FOOTER}
