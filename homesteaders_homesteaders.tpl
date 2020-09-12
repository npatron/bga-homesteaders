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
<div id ="top"><span id="round_number">{ROUND_STRING}{ROUND_NUMBER}</span>
 </div>
<!-- Auction Board -->
<div id="board" class="shadow">
    <div id="bid_limbo" class= "token_zone"> </div>

    <div id="bid_slot_1_9" class="bid_slot"> </div>
    <div id="bid_slot_1_12" class="bid_slot"> </div>
    <div id="bid_slot_1_16" class="bid_slot"> </div>
    <div id="bid_slot_1_21" class="bid_slot"> </div>
    <div id="bid_slot_1_7" class="bid_slot"> </div>
    <div id="bid_slot_1_6" class="bid_slot"> </div>
    <div id="bid_slot_1_5" class="bid_slot"> </div>
    <div id="bid_slot_1_4" class="bid_slot"> </div>
    <div id="bid_slot_1_3" class="bid_slot"> </div>
    <div id="auction_tile_zone_1" class="auction_tiles_zone"> </div>
    
    <div id="bid_slot_2_9" class="bid_slot"> </div>
    <div id="bid_slot_2_12" class="bid_slot"> </div>
    <div id="bid_slot_2_16" class="bid_slot"> </div>
    <div id="bid_slot_2_21" class="bid_slot"> </div>
    <div id="bid_slot_2_7" class="bid_slot"> </div>
    <div id="bid_slot_2_6" class="bid_slot"> </div>
    <div id="bid_slot_2_5" class="bid_slot"> </div>
    <div id="bid_slot_2_4" class="bid_slot"> </div>
    <div id="bid_slot_2_3" class="bid_slot"> </div>
    <div id="auction_tile_zone_2" class="auction_tiles_zone"> </div>

    <div id="bid_slot_3_9" class="bid_slot"> </div>
    <div id="bid_slot_3_12" class="bid_slot"> </div>
    <div id="bid_slot_3_16" class="bid_slot"> </div>
    <div id="bid_slot_3_21" class="bid_slot"> </div>
    <div id="bid_slot_3_7" class="bid_slot"> </div>
    <div id="bid_slot_3_6" class="bid_slot"> </div>
    <div id="bid_slot_3_5" class="bid_slot"> </div>
    <div id="bid_slot_3_4" class="bid_slot"> </div>
    <div id="bid_slot_3_3" class="bid_slot"> </div>
    <div id="auction_tile_zone_3" class="auction_tiles_zone"> </div>

    <div id="train_advancement_0" class="train_advance"> </div>
    <div id="train_advancement_1" class="train_advance"> </div>
    <div id="train_advancement_2" class="train_advance"> </div>
    <div id="train_advancement_3" class="train_advance"> </div>
    <div id="train_advancement_4" class="train_advance"> </div>
    <div id="train_advancement_5" class="train_advance"> </div>

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

</div>

<!-- token limbo -->
<div id="limbo" style="display: block"> 
    <div id='future_building_zone'> </div>
    <div id='first_player_tile' class=' building_tile'> </div>
</div>

<div id="building_zone"> 
    <div class="building_stock"> Buildings Stock 
    </div>
    <div id="main_building_zone"> </div>
</div>

<!--
    Player Buildings section
-->
<div id='player_zones'>
    <div id="player_zone_yellow" class="noshow whiteblock res_yellow" style="margin-top:4px;">
        <div id="player_name_yellow" class="boardheader" style="color: yellow;">yellow</div>
        <div id="token_zone_yellow" class="token_zone"> </div>
        <div id="building_zone_yellow"> </div>
    </div>
    <div id="player_zone_red" class="noshow whiteblock res_red" style="margin-top:4px;">
        <div id="player_name_red" class="boardheader" style="color: red;">red</div>
        <div id="token_zone_red" class="token_zone"> </div>
        <div id="building_zone_red"> </div>
    </div>
    <div id="player_zone_green" class="noshow whiteblock res_green" style="margin-top:4px;">
        <div id="player_name_green" class="boardheader" style="color: green;">green</div>
        <div id="token_zone_green" class="token_zone"> </div>
        <div id="building_zone_green" class="building_zone"> </div>
    </div>
    <div id="player_zone_blue" class="noshow whiteblock res_blue" style="margin-top:4px;">
        <div id="player_name_blue" class="boardheader" style="color: blue;">blue</div>
        <div id="token_zone_blue" class="token_zone"> </div>
        <div id="building_zone_blue"> </div>
    </div>
</div>

<!-- Trade Helper Board -->
<div id ="bottom"> 
    <div id="trade_board" class="">
        <div id="done_trading" class="noshow"> </div>
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
    </div>
</div>

<script type="text/javascript">

// templates
var jstpl_buildings='<div id="building_tile_${key}" class="building_tile build_tile_${id}"></div>';

var jstpl_building_slot='<div id="slot_${slot}_${key}" class="worker_slot slot_${slot} key_${key}"></div>'; 

var jstpl_auction_tile='<div id="auction_tile_${auc}" class="auction_tile"> </div>';

var jptpl_token='<div id="token_${type}_${id}" class="token token_${type}"> </div>';

var jstpl_player_board = '\<div class="cp_board">\
    <div class="score_group">\
    <div id="vpicon_p${id}"     class="token_vp icon score player_vp"></div><span id="vpcount_${id}" class="score_text">0</span>\
    <div id="silvericon_p${id}" class="token_silver icon score player_silver"></div><span id="silvercount_${id}" class="score_text">0</span>\
    <div id="tradeicon_p${id}"  class="token_trade icon score player_trade"></div><span id="tradecount_${id}" class="score_text">0</span>\
    <div id="loanicon_p${id}"   class="token_loan icon score player_loan"></div><span id="loancount_${id}" class="score_text">0</span>\
    <div id="woodicon_p${id}"   class="token_wood icon score player_wood"></div><span id="woodcount_${id}" class="score_text">0</span>\
    </div><div class="score_group">\
    <div id="steelicon_p${id}"  class="token_steel icon score player_steel"></div><span id="steelcount_${id}" class="score_text">0</span>\
    <div id="goldicon_p${id}"   class="token_gold icon score player_gold"></div><span id="goldcount_${id}" class="score_text">0</span>\
    <div id="coppericon_p${id}" class="token_copper icon score player_copper"></div><span id="coppercount_${id}" class="score_text">0</span>\
    <div id="foodicon_p${id}"   class="token_food icon score player_food"></div><span id="foodcount_${id}" class="score_text">0</span>\
    <div id="cowicon_p${id}"    class="token_cow icon score player_cow"></div><span id="cowcount_${id}" class="score_text">0</span>\
<div></div>';

var jstpl_otherplayer_board = '\<div class="cp_board">\
    <div id="scoreicon_p${id}" class="scoreicon icon"></div><span id="scoreCount_p${id}">0</span>\
</div>';

var jstpl_resource_log = '<div title = "${type}" class="inlineblock token token_${type}"> </div>';

var jstpl_ipiece='<div class="${type} ${type}_${color} inlineblock" aria-label="${name}" title="${name}"></div>';

</script>  

{OVERALL_GAME_FOOTER}
