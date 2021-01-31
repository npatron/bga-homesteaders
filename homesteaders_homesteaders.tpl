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
<div class="anchor">
    <div id="breadcrumbs" class="breadcrumbs wlimit" style="display:block"><span id="breadcrumb_transactions"></span></div>
</div>

<div id="main_container" class="container">
    <div id="currentPlayer" class="noshow"></div>
    <div id="trade_top" class="trade_size noshow"></div>
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
        <a href="#" id="confirm_trade_btn" class="bgabutton bgabutton_blue noshow"><span id='confirmTrade' class="font">{CONFIRM_TRADE}</span></a>
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
    <div id='first_player_tile' class='building_tile fp_tile fp_icon'> </div>
</div>
<!-- Player Buildings section -->
<div id='player_zones' class="players_container">
    <div id ='First'> </div> <div id ='Second'> </div> <div id ='Third'> </div> <div id ='Fourth'> </div>
    <!-- BEGIN this_player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR}" style="margin-top:4px;">
        <span id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</span>
        <a href="#" id="undo_trades_btn" class="bgabutton bgabutton_red noshow"><span id='undoTrade' class="font">{UNDO_TRADE}</span></a>
        <a href="#" id="undo_last_trade_btn" class="bgabutton bgabutton_red noshow"><span id='undoLastTrade' class="font">{UNDO_LAST_TRADE}</span></a>
        <div id="player_resources_{COLOR}" class="this_player_resources">
            <span id="silver_group" class="this_player_resource_group">
                <span id="silvericon_{COLOR}" class="score_token player_silver score"></span>
                <span id="silvercount_{COLOR}" class="player_silver_text player_text">0</span>
                <span class="player_silver_offset offset_text noshow"><span id="silver_sign">+</span><span id="silver_offset">0</span></span>
                <span id="silver_bank" class="player_silver_buy bank_trade noshow"></span>
                <span id="silver_new" class="player_silver_new new_text noshow">0</span>
            </span>
            <span id="trade_group" class="this_player_resource_group">
                <span id="tradeicon_{COLOR}"  class="score_token player_trade score"></span>
                <span id="tradecount_{COLOR}" class="player_trade_text player_text">0</span>
                <span class="player_trade_offset offset_text noshow"><span id="trade_sign">+</span><span id="trade_offset">0</span></span>
                <span id="trade_new" class="player_trade_new new_text noshow">0</span>
            </span>
            <span id="loan_group" class="this_player_resource_group">
                <span id="loanicon_{COLOR}"   class="player_loan score"></span>
                <span id="loancount_{COLOR}" class="player_loan_text player_text_loan">0</span>
                <span id="loan_more" class="buy_loan take_loan noshow"></span>
                <span class="player_loan_offset offset_text_loan noshow"><span id="loan_sign">+</span><span id="loan_offset">0</span></span>
                <span id="loan_new" class="player_loan_new new_text_loan noshow">0</span>
            </span>
            <span id="vp_group" class="this_player_resource_group">
                <span id="vpicon_{COLOR}"   class="score_token player_vp score"></span>
                <span id="vpcount_{COLOR}"  class="player_vp_text player_text">0</span>
                <span class="player_vp_offset offset_text noshow"><span id="vp_sign">+</span><span id="vp_offset">0</span></span>
                <span id="vp_new" class="player_vp_new new_text noshow">0</span>
            </span>
            <span id="wood_group" class="this_player_resource_group">
                <span id="woodicon_{COLOR}"   class="score_token player_wood score"></span>
                <span id="woodcount_{COLOR}" class="player_wood_text player_text">0</span>
                <span id="wood_sell" class="sell_wood sell noshow"></span>
                <span class="player_wood_offset offset_text noshow"><span id="wood_sign">+</span><span id="wood_offset">0</span></span>
                <span id="wood_buy" class="buy_wood buy noshow"></span>
                <span id="wood_new" class="player_wood_new new_text noshow">0</span>
            </span>
            <span id="food_group" class="this_player_resource_group">
                <span id="foodicon_{COLOR}"   class="score_token player_food score"></span>
                <span id="foodcount_{COLOR}" class="player_food_text player_text">0</span>
                <span id="food_market" class="trade_market_food market noshow"></span>
                <span id="food_buy" class="buy_food buy noshow"></span>
                <span class="player_food_offset offset_text noshow"><span id="food_sign">+</span><span id="food_offset">0</span></span>
                <span id="food_sell" class="sell_food sell noshow"></span>
                <span id="food_new" class="player_food_new new_text noshow">0</span>
            </span>
            <span id="steel_group" class="this_player_resource_group">
                <span id="steelicon_{COLOR}"  class="score_token player_steel score"></span>
                <span id="steelcount_{COLOR}" class="player_steel_text player_text">0</span>
                <span id="steel_market" class="trade_market_steel market noshow"></span>
                <span id="steel_buy" class="buy_steel buy noshow"></span>
                <span class="player_steel_offset offset_text noshow"><span id="steel_sign">+</span><span id="steel_offset">0</span></span>
                <span id="steel_sell" class="sell_steel sell noshow"></span>
                <span id="steel_new" class="player_steel_new new_text noshow">0</span>
            </span>
            <span id="gold_group" class="this_player_resource_group">
                <span id="goldicon_{COLOR}"   class="score_token player_gold score"></span>
                <span id="goldcount_{COLOR}" class="player_gold_text player_text">0</span>
                <span id="gold_buy" class="buy_gold buy noshow"></span>
                <span class="player_gold_offset offset_text noshow"><span id="gold_sign">+</span><span id="gold_offset">0</span></span>
                <span id="gold_sell" class="sell_gold sell noshow"></span>
                <span id="gold_new" class="player_gold_new new_text noshow">0</span>
            </span>
            <span id="cow_group" class="this_player_wider_resource_group">
                <span id="cowicon_{COLOR}"    class="score_token player_cow score"></span>
                <span id="cowcount_{COLOR}" class="player_cow_text player_text">0</span>
                <span id="cow_buy" class="buy_cow buy noshow"></span>
                <span class="player_cow_offset offset_text noshow"><span id="cow_sign">+</span><span id="cow_offset">0</span></span>
                <span id="cow_sell" class="sell_cow sell noshow"></span>
                <span id="cow_new" class="player_cow_new new_text noshow">0</span>
            </span>
            <span id="copper_group" class="this_player_wider_resource_group">
                <span id="coppericon_{COLOR}" class="score_token player_copper score"></span>
                <span id="coppercount_{COLOR}" class="player_copper_text player_text">0</span>
                <span id="copper_buy" class="buy_copper buy noshow"></span>
                <span class="player_copper_offset offset_text noshow"><span id="copper_sign">+</span><span id="copper_offset">0</span></span>
                <span id="copper_sell" class="sell_copper sell noshow"></span>
                <span id="copper_new" class="player_copper_new new_text noshow">0</span>
            </span>
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
            
        </div>
        <div id="building_zone_{COLOR}" class="building_zone"> </div>
    </div>
    <!-- END this_player_zone -->
    <!-- BEGIN player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR}" style="margin-top:4px;">
        <div id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</div>
        <div id="player_resources_{COLOR}" class="player_resources">
            <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="silvericon_{COLOR}" class="score_token player_silver score"></span>
                <span id="silvercount_{COLOR}" class="player_silver_text player_text">0</span>
            </span>
                <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="tradeicon_{COLOR}"  class="score_token player_trade score"></span>
            <span id="tradecount_{COLOR}" class="player_trade_text player_text">0</span>
            </span>
                <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="loanicon_{COLOR}"   class="player_loan score"></span>
            <span id="loancount_{COLOR}" class="player_loan_text player_text">0</span>
            </span>
                <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="vpicon_{COLOR}"   class="score_token player_vp score"></span>
            <span id="vpcount_{COLOR}"  class="player_vp_text player_text">0</span>
            </span>
                <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="woodicon_{COLOR}"   class="score_token player_wood score"></span>
            <span id="woodcount_{COLOR}" class="player_wood_text player_text">0</span>
            </span>
            <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="foodicon_{COLOR}"   class="score_token player_food score"></span>
                <span id="foodcount_{COLOR}" class="player_food_text player_text">0</span>
            </span>
            <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="steelicon_{COLOR}"  class="score_token player_steel score"></span>
                <span id="steelcount_{COLOR}" class="player_steel_text player_text">0</span>
            </span>
            <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="goldicon_{COLOR}"   class="score_token player_gold score"></span>
                <span id="goldcount_{COLOR}" class="player_gold_text player_text">0</span>
            </span>
            <span id="silver_group_{COLOR}" class="player_wider_resource_group">
                <span id="cowicon_{COLOR}"    class="score_token player_cow score"></span>
                <span id="cowcount_{COLOR}" class="player_cow_text player_text">0</span>
            </span>
            <span id="silver_group_{COLOR}" class="player_wider_resource_group">
                <span id="coppericon_{COLOR}" class="score_token player_copper score"></span>
                <span id="coppercount_{COLOR}" class="player_copper_text player_text">0</span>
            </span>
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
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
    <div id="silvericon_p${id}" class="score_token score_silver score"></div><span id="silvercount_${id}" class="score_silver_text score_text">0</span>\
    <div id="tradeicon_p${id}"  class="score_token score_trade score"></div><span id="tradecount_${id}" class="score_trade_text score_text">0</span>\
    <div id="woodicon_p${id}"   class="score_token score_wood score"></div><span id="woodcount_${id}" class="score_wood_text score_text">0</span>\
    <div id="foodicon_p${id}"   class="score_token score_food score"></div><span id="foodcount_${id}" class="score_food_text score_text">0</span>\
    <div id="steelicon_p${id}"  class="score_token score_steel score"></div><span id="steelcount_${id}" class="score_steel_text score_text">0</span>\
    <div id="vpicon_p${id}"     class="score_token score_vp score"></div><span id="vpcount_${id}" class="score_vp_text score_text">0</span>\
    <div id="loanicon_p${id}"   class="score_loan score score"></div><span id="loancount_${id}" class="score_loan_text score_text">0</span>\
    <div id="goldicon_p${id}"   class="score_token score_gold score"></div><span id="goldcount_${id}" class="score_gold_text score_text">0</span>\
    <div id="cowicon_p${id}"    class="score_token score_cow score"></div><span id="cowcount_${id}" class="score_cow_text score_text">0</span>\
    <div id="coppericon_p${id}" class="score_token score_copper score"></div><span id="coppercount_${id}" class="score_copper_text score_text">0</span>\
</div></div>';

var jstpl_pay_button = '<span id="pay_gold" class="useFont" style="display:none">0</span> \
 <span id="pay_gold_tkn" class="log_gold token_inline" style="display:none"></span> \
 <span id="pay_silver" class="useFont">0</span> \
 <span id="pay_silver_tkn" class="log_silver token_inline"></span>';
var jstpl_color_log = '<span title="${string}" class="font ${color}">${string}</span>';
var jstpl_color_number_log = '<span class="useFont ${color}" >${string}</span><span class="biggerFont bold ${color}">${number}</span>';
var jstpl_resource_inline = '<div title = "${type}" class="log_${type} token_inline"></div>';
var jstpl_resource_log = '<div title = "${type}" class="log_${type} log_token"></div>';
var jstpl_player_token_log = '<div title = "${type}_${color}" class="${type}_${color} log_${type}"></div>';
var jptpl_track_log = '<div title = "${type}" class="log_inline_${type}" ></div>';
var jptpl_breadcrumb_trade = '<span id="breadcrumb_${id}" class="breadcrumbs_element"><div class="useFont">${text}</div>${away}<span title ="for" class="log_arrow token_inline"></span>${for}</span>'
var jptpl_breadcrumb_income = '<span id="breadcrumb_income" class="breadcrumbs_element"><div class="useFont">${text}</div>${income}</span>'
var jptpl_breadcrumb_building = '<span id="breadcrumb_building" class="breadcrumbs_element"><div class="useFont">${text}</div>${cost}</span>'

</script>  

{OVERALL_GAME_FOOTER}
