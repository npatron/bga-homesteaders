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

<div id="board" class="shadow">

    <div id="bid_slot_A1_B9" class="bid_slot"> </div>
    <div id="bid_slot_A1_B12" class="bid_slot"> </div>
    <div id="bid_slot_A1_B16" class="bid_slot"> </div>
    <div id="bid_slot_A1_B21" class="bid_slot"> </div>
    <div id="bid_slot_A1_B7" class="bid_slot"> </div>
    <div id="bid_slot_A1_B6" class="bid_slot"> </div>
    <div id="bid_slot_A1_B5" class="bid_slot"> </div>
    <div id="bid_slot_A1_B4" class="bid_slot"> </div>
    <div id="bid_slot_A1_B3" class="bid_slot"> </div>
    <div id="auction1_tile_zone" class="auction_tiles_zone"> </div>
    
    <div id="bid_slot_A2_B9" class="bid_slot"> </div>
    <div id="bid_slot_A2_B12" class="bid_slot"> </div>
    <div id="bid_slot_A2_B16" class="bid_slot"> </div>
    <div id="bid_slot_A2_B21" class="bid_slot"> </div>
    <div id="bid_slot_A2_B7" class="bid_slot"> </div>
    <div id="bid_slot_A2_B6" class="bid_slot"> </div>
    <div id="bid_slot_A2_B5" class="bid_slot"> </div>
    <div id="bid_slot_A2_B4" class="bid_slot"> </div>
    <div id="bid_slot_A2_B3" class="bid_slot"> </div>
    <div id="auction2_tile_zone" class="auction_tiles_zone"> </div>

    <div id="bid_slot_A3_B9" class="bid_slot"> </div>
    <div id="bid_slot_A3_B12" class="bid_slot"> </div>
    <div id="bid_slot_A3_B16" class="bid_slot"> </div>
    <div id="bid_slot_A3_B21" class="bid_slot"> </div>
    <div id="bid_slot_A3_B7" class="bid_slot"> </div>
    <div id="bid_slot_A3_B6" class="bid_slot"> </div>
    <div id="bid_slot_A3_B5" class="bid_slot"> </div>
    <div id="bid_slot_A3_B4" class="bid_slot"> </div>
    <div id="bid_slot_A3_B3" class="bid_slot"> </div>
    <div id="auction3_tile_zone" class="auction_tiles_zone"> </div>

    
    <div id="train_advancement_0" class="train_advance"> </div>
    <div id="train_advancement_1" class="train_advance"> </div>
    <div id="train_advancement_2" class="train_advance"> </div>
    <div id="train_advancement_3" class="train_advance"> </div>
    <div id="train_advancement_4" class="train_advance"> </div>
    <div id="train_advancement_5" class="train_advance"> </div>

</div>
<!-- token limbo -->
<div id="limbo" style="display: block"> 
</div>

<div id="building_zone"> 
    <div class="building_stock"> Buildings Stock 
    </div>
    <div id="main_building_zone"> </div>
</div>

<!--
    Player Buildings section
-->
<div id="player_zone_yellow" class="noshow" style="margin-top:4px;">
    <div id="building_zone_yellow">
        <div class="boardheader" style="color: yellow;">yellow</div>
    </div>
    <div id="token_zone_yellow" class="token_zone"> </div>
</div>

<div id="player_zone_red" class="noshow" style="margin-top:4px;">
    <div id="building_zone_red">
        <div class="boardheader" style="color: red;">red</div>
    </div>
    <div id="token_zone_red" class="token_zone"> </div>
</div>

<div id="player_zone_green" class="noshow" style="margin-top:4px;">
    <div id="building_zone_green" class="building_zone">
        <div class="boardheader" style="color: green;">green</div>
    </div>
    <div id="token_zone_green" class="token_zone"> </div>
</div>

<div id="player_zone_blue" class="noshow" style="margin-top:4px;">
    <div id="building_zone_blue">
        <div class="boardheader" style="color: blue;">blue</div>
    </div>
    <div id="token_zone_blue" class="token_zone"> </div>
</div>


<!-- BEGIN player -->
<div class="playertable whiteblock playertable_{PLAYER_ID}">
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
</div>
<!-- END player -->

<script type="text/javascript">

// templates
var jstpl_bidslot='<div id="bid_slot_A{AUC}_B{BID}"></div>';

var jstpl_buildings='<div id="building_tile_{BUILD_KEY}" class="building_tile build_tile_{BUILD_ID}"></div>';
var jstpl_workerSlot='<div id="building_{key}_worker_zone_{slot}" class="slot_{slot}"> </div>';

var jstpl_auction='<div id="auction_tile_{auc}" class="auction_tile"> </div>';

var jstpl_ipiece='<div class="${type} ${type}_${color} inlineblock" aria-label="${name}" title="${name}"></div>';

</script>  

{OVERALL_GAME_FOOTER}
