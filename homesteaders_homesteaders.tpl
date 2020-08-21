{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteaderstb implementation : © © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    homesteaderstb_homesteaders.tpl
-->
<script type="text/javascript">


<div id="board" class="shadow">
    <div id="bid_slot_A1_B3"> </div>
    <div id="bid_slot_A1_B4"> </div>
    <div id="bid_slot_A1_B5"> </div>
    <div id="bid_slot_A1_B6"> </div>
    <div id="bid_slot_A1_B7"> </div>
    <div id="bid_slot_A1_B9"> </div>
    <div id="bid_slot_A1_B12"> </div>
    <div id="bid_slot_A1_B16"> </div>
    <div id="bid_slot_A1_B21"> </div>
    <div id="auction1_tile_zone" class="auction_tiles"> </div>

    <div id="bid_slot_A2_B3"> </div>
    <div id="bid_slot_A2_B4"> </div>
    <div id="bid_slot_A2_B5"> </div>
    <div id="bid_slot_A2_B6"> </div>
    <div id="bid_slot_A2_B7"> </div>
    <div id="bid_slot_A2_B9"> </div>
    <div id="bid_slot_A2_B12"> </div>
    <div id="bid_slot_A2_B16"> </div>
    <div id="bid_slot_A2_B21"> </div>
    <div id="auction2_tile_zone" class="auction_tiles"> </div>

    <div id="bid_slot_A3_B3"> </div>
    <div id="bid_slot_A3_B4"> </div>
    <div id="bid_slot_A3_B5"> </div>
    <div id="bid_slot_A3_B6"> </div>
    <div id="bid_slot_A3_B7"> </div>
    <div id="bid_slot_A3_B9"> </div>
    <div id="bid_slot_A3_B12"> </div>
    <div id="bid_slot_A3_B16"> </div>
    <div id="bid_slot_A3_B21"> </div>
    <div id="auction3_tile_zone" class="auction_tiles"> </div>

    <div id="train_advancement_1" class="train_advance"> </div>
    <div id="train_advancement_2" class="train_advance"> </div>
    <div id="train_advancement_3" class="train_advance"> </div>
    <div id="train_advancement_4" class="train_advance"> </div>
    <div id="train_advancement_5" class="train_advance"> </div>

</div>
<div id="building_zone"> 
    <div id="build_tile_{BUILD_ID}" class="building_tile"> </div>
</div>

<!-- BEGIN player -->
    <div class="playertable whiteblock playertable_{DIR}">
        <div class="playertablename" style="color:#{PLAYER_COLOR}">
            {PLAYER_NAME}
        </div>
        <div class="playertable_card" id="playertablecard_{PLAYER_ID}">
        </div>
        <div id="buildings_zone_{player_ID}" style="margin-top:4px;">
        </div>
        <div id="token_zone_{player_ID}" style="margin-top:4px;">
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
        <div class="first_player_tile"> </div>
    </div>
<!-- END player -->
<!--
    Player Buildings section
-->
    

<!-- token limbo -->
<div id="limbo" style="display: block">

</div>

var jstpl_buildings = '<div class="buildings" id="buildings_${player_id}" style="background-position:-${x}px -${y}px">\
                        </div>';


</script>  

{OVERALL_GAME_FOOTER}
