{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteaderstb implementation : © © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    homesteaderstb_homesteaderstb.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->
<script type="text/javascript">

// Javascript HTML templates

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
