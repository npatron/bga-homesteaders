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
    <div id="auction1_tile_pile"> </div>

    <div id="bid_slot_A2_B3"> </div>
    <div id="bid_slot_A2_B4"> </div>
    <div id="bid_slot_A2_B5"> </div>
    <div id="bid_slot_A2_B6"> </div>
    <div id="bid_slot_A2_B7"> </div>
    <div id="bid_slot_A2_B9"> </div>
    <div id="bid_slot_A2_B12"> </div>
    <div id="bid_slot_A2_B16"> </div>
    <div id="bid_slot_A2_B21"> </div>
    <div id="auction2_tile_pile"> </div>

    <div id="bid_slot_A3_B3"> </div>
    <div id="bid_slot_A3_B4"> </div>
    <div id="bid_slot_A3_B5"> </div>
    <div id="bid_slot_A3_B6"> </div>
    <div id="bid_slot_A3_B7"> </div>
    <div id="bid_slot_A3_B9"> </div>
    <div id="bid_slot_A3_B12"> </div>
    <div id="bid_slot_A3_B16"> </div>
    <div id="bid_slot_A3_B21"> </div>
    <div id="auction3_tile_pile"> </div>



</div>
<!-- BEGIN player -->
    <div class="playertable whiteblock playertable_{DIR}">
        <div class="playertablename" style="color:#{PLAYER_COLOR}">
            {PLAYER_NAME}
        </div>
        <div class="playertablecard" id="playertablecard_{PLAYER_ID}">
        </div>
        <div class="playertablepoints" id="playertablecard_{score}">
        </div>
        
        <div class="playertablesilver" id="player_resource_{silver}">
        </div>
        <div class="playertablegold" id="player_resource_{gold}">
        </div>
        <div class="playertablewood" id="player_resource_{wood}">
        </div>
        <div class="playertablefood" id="player_resource_{food}">
        </div>
        <div class="playertablesteel" id="player_resource_{steel}">
        </div>
        <div class="playertablecopper" id="player_resource_{steel}">
        </div>
        <div class="playertablelivestock" id="player_resource_{steel}">
        </div>
        <div class="playertabledebt" id="player_resource_{debt}">
        </div>
        <div class="playertabletradeTokens" id="player_resource_{tradeTokens}">
        </div>
        <div class="playertablevptokens" id="player_resource_{vPTokens}">
        </div>
    </div>
<!-- END player -->

var jstpl_buildings = '<div class="buildings" id="buildings_${player_id}" style="background-position:-${x}px -${y}px">\
                        </div>';


</script>  

{OVERALL_GAME_FOOTER}
