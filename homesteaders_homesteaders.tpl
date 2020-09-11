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
<div id ="top"> </div>
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
</div>



<div id="building_zone"> 
    <div class="building_stock"> Buildings Stock 
    </div>
    <div id="main_building_zone"> </div>
</div>

<!--
    Player Buildings section
-->
<div id='top_player_zone'>
</div>

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




<!-- BEGIN player -->
<!--<div class="playertable whiteblock playertable_{PLAYER_ID}">
    <div class="playertablename" style="color:#{COLOR}">
        {PLAYER_NAME}
    </div>
    <div class="playertable_card" id="playertablecard_{PLAYER_ID}">
    </div>
    <div id="buildings_zone_{PLAYER_ID}" style="margin-top:4px;>
    </div>
    <div id="token_zone_{PLAYER_ID}" style="margin-top:4px;">
    </div>

    <div class="score" id="playertable_{score}">
    </div>
    <div class="playertable_silver" id="player_resource_{silver}">
    </div>
    <div class="playertable_gold" id="player_resource_{gold}">
    </div>
    <div class="playertable_wood" id="player_resource_{wood}">
    </div>
    <div class="playertable_food" id="player_resource_{food}">
    </div>
    <div class="playertable_steel" id="player_resource_{steel}">
    </div>
    <div class="playertable_copper" id="player_resource_{steel}">
    </div>
    <div class="playertable_livestock" id="player_resource_{steel}">
    </div>
    <div class="playertable_debt" id="player_resource_{debt}">
    </div>
    <div class="playertable_tradeTokens" id="player_resource_{tradeTokens}">
    </div>
    <div class="playertable_vptokens" id="player_resource_{vPTokens}">
    </div>
    <div id="first_player_tile_{player_ID}"class="first_player_tile"> 
    </div>
</div> -->
<!-- END player -->

<script type="text/javascript">

// templates
var jstpl_buildings='<div id="building_tile_${key}" class="building_tile build_tile_${id}"></div>';

var jstpl_building_slot='<div id="slot_${slot}_${key}" class="worker_slot slot_${slot} key_${key}"></div>'; 

var jstpl_auction_tile='<div id="auction_tile_${auc}" class="auction_tile"> </div>';

var jptpl_token='<div id="token_${type}_${id}" class="token token_${type}"> </div>';

var jstpl_resource_log = '<div title = "${type}" class="inlineblock token token_${type}"> </div>';

var jstpl_ipiece='<div class="${type} ${type}_${color} inlineblock" aria-label="${name}" title="${name}"></div>';

</script>  

{OVERALL_GAME_FOOTER}
