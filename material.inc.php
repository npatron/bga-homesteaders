<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaderstb implementation : © Nick Patron <nick.theboot@gmail.com>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * homesteaders game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

$this->resource_map = array(
  WOOD=>  'wood', 
  STEEL=> 'steel',
  GOLD=>  'gold',
  COPPER=>'copper',
  FOOD=>  'food',
  COW=>   'cow',
  TRADE=> 'trade',
  VP=>    'vp',
  SILVER=>'silver',
  LOAN=>  'loan',
);

$this->special_resource_map = array(
  'vp2' => array('vp'=>2),
  'vp3' => array('vp'=>3),
  'vp4' => array('vp'=>4),
  'vp6' => array('vp'=>6),
  'vp8' => array('vp'=>8),
);

$this->resource_info = array(
  'silver' => array(
    'name'   => _("Silver"),
    'db_int' => SILVER,
    'tt'     => "<span class='score_token score_silver tt'></span>".
            CENTER_DIV._("Silver:")."<br>".
            _("Used to pay ").WORKER_HTML."<br>".
            _("and to pay for Auction costs").END_DIV,
  ),
  'workers' => array(
    'name'   => _("Worker"),
    'db_int' => WORKER,
    'tt'     => WORKER_HTML."<br>".
    CENTER_DIV._("Worker:")."<br>".
            _("Produces resources when assigned to buildings").END_DIV,
  ),   
  'track' => array(
    'name'   => _("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => TRACK_HTML.CENTER_DIV._("Track:")."<br>".
                _(" Produces ").SILVER_HTML._(" each round").END_DIV,
  ),
  'wood' => array(
    'name'   => _("Wood"),
    'db_int' => WOOD,
    'tt'     => "<div class='score_token score_wood tt'></div>".
            CENTER_DIV._("Wood:")."<br>".
            _(" Required to build some buildings").END_DIV,
  ),
  'food' => array(
    'name'   => _("Food"),
    'db_int' => FOOD,
    'tt'     => "<div class='score_token score_food tt'></div>".
            CENTER_DIV._("Food:")."<br>".
            _(" Required to build some buildings")."<br>".
            _(" Used to Hire new ").WORKER_HTML.END_DIV,
  ),
  'steel' => array(
    'name'   => _("Steel"),
    'db_int' => STEEL,
    'tt'     => "<div class='score_token score_steel tt'></div>".
              CENTER_DIV._("Steel:")."<br>".
              _(" Required to build some buildings").END_DIV,
  ),
  'gold' => array(
    'name'   => _("Gold"),
    'db_int' => GOLD,
    'tt'     => "<div class='score_token score_gold tt'></div>".
            CENTER_DIV._("Gold:")."<br>"._(" Required to build some buildings")."<br>".
            _("Can be used to pay Workers / Auction costs(as 5 silver)")."<br>".
            _("End: Worth ").VP2_HTML.END_DIV,
  ),
  'copper' => array(
    'name'   => _("Copper"),
    'db_int' => COPPER,
    'tt'     => "<div class='score_token score_copper tt'></div>".
              CENTER_DIV._("Copper:")."<br>".
                _(" Required to build some buildings")."<br>".
                _("End: Worth ").VP2_HTML.END_DIV,
  ),
  'cow' => array(
    'name'   => _("Livestock"),
    'db_int' => COW,
    'tt'     => '<div class="score_token score_cow tt"></div>'.
                CENTER_DIV._("Livestock:")."<br>".
                _(" Required to build some buildings")."<br>".
                _("End: Worth ").VP2_HTML.END_DIV,
  ),
  'loan' => array(
    'name'   => _("Debt"),
    'db_int' => LOAN,
    'tt'     => '<div aria="debt" title="debt" class="tt_loan tt"></div><p>'.CENTER_DIV.
              _("Debt:")."<br>".
              _(" Costs 5 Silver (or 1 Gold) to pay off")."<br>".
              _("End: Penalty for unpaid Debt:")."<br>".END_DIV.LEFT_DIV.
              LOAN_HTML." ".ARROW_HTML._(" Lose ").VP_HTML."<br>".
              LOAN_HTML.LOAN_HTML." ".ARROW_HTML._(" Lose ").VP3_HTML."<br>".
              LOAN_HTML.LOAN_HTML.LOAN_HTML." ".ARROW_HTML._(" Lose ").VP6_HTML."<br>".
              LOAN_HTML.LOAN_HTML.LOAN_HTML.LOAN_HTML." ".ARROW_HTML._(" Lose ").VP10_HTML."<br>".
              _(" (etc...)").END_DIV,
  ),
  'trade' => array(
    'name'   => _("Trade Token"),
    'db_int' => TRADE,
    'tt'     => "<div class='score_token score_trade tt'></div>".
    CENTER_DIV._("Trade:")."<br>".
                _(" Required for any trade")."<br>".
                _(" Used to Hire new ").WORKER_HTML.END_DIV,
  ),
  'vp' => array(
    'name'   => _("VP Token"),
    'db_int' => VP,
    'tt'     => "<div class='score_token score_vp tt'></div>".
              CENTER_DIV._("VP Token:")."<br>".
              _("End: Worth 1 VP").END_DIV,
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array_merge(
  array_fill_keys( 
    array(BLD_HOMESTEAD_YELLOW, BLD_HOMESTEAD_RED, BLD_HOMESTEAD_GREEN, BLD_HOMESTEAD_BLUE, BLD_HOMESTEAD_PURPLE), 
    array(
      'name' => _("Homestead"),
      'tt'   => RES_SPAN._("Homestead").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
                "<hr>".INCOME.CENTER_DIV._("Produce:  ").SILVER_HTML.SILVER_HTML.
                "<br>".WORKER_HTML._(" Can Produce:  ").WOOD_HTML.
                "<br>".WORKER_HTML._(" Can Produce:  ").VP_HTML.END_DIV,
      'type' => TYPE_RESIDENTIAL,
      'stage'=> 0,
      'inc'  => array('silver'=>2),
      'slot' => 2,
      's1'   => array('wood'=>1),
      's1_tt'=> _("Produces ").WOOD_HTML,
      's2'   => array('vp'=>1),
      's2_tt'=> _("Produces ").VP_HTML,
      'amt'  => 0,
  )),
  array(
   BLD_GRAIN_MILL => array(
    'name' => _("Grain Mill"),
    'tt'   => RES_SPAN._("Grain Mill").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. WOOD_HTML ." ". STEEL_HTML. END_P.
              "<hr>".INCOME.CENTER_DIV.
              _(" Produce ").FOOD_HTML._(" each round").END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1,'steel'=>1),
    'vp'   => 2,
    'inc'  => array('food'=>1),
    'amt'  => 1,
   ),
   BLD_FARM => array(
    'name' => _("Farm"),
    'tt'   => RES_SPAN._("Farm").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST.WOOD_HTML.END_P."<hr>".
              INCOME.CENTER_DIV.WORKER_HTML._(" Can Produce: ").TRADE_HTML.SILVER_HTML.SILVER_HTML."<br>".
              WORKER_HTML._(" Can Produce: ").FOOD_HTML.END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'slot' => 2,
    's1'   => array('silver'=>2,'trade'=>1),
    's1_tt'=> _("Produces ").TRADE_HTML.SILVER_HTML.SILVER_HTML,
    's2'   => array('food'=>1),
    's2_tt'=> _("Produces ").FOOD_HTML,
    'amt'  => 3,
   ),
   BLD_MARKET => array(
    'name' => _("Market"),
    'desc' => clienttranslate('Allows trades\n ${trade}${wood} ${arrow} ${food}\n${trade}${food} ${arrow} ${steel}'),
    'tt'   => COM_SPAN._("Market").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST.WOOD_HTML.END_P.
              CENTER_DIV.ALLOW_TRADE. TRADE_HTML. WOOD_HTML." ".ARROW_HTML." ".FOOD_HTML.
              "<br>".TRADE_HTML.FOOD_HTML." ".ARROW_HTML." ".STEEL_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").TRADE_HTML._(" each round.").
              "<br>".WORKER_HTML._(" Can produce ").SILVER_HTML.SILVER_HTML.END_DIV,
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'slot' => 1,
    's1'   => array('silver'=>2),
    's1_tt'=> _("Produces ").SILVER_HTML.SILVER_HTML,
    'amt'  => 3,
   ),
   BLD_FOUNDRY => array(
    'name' => _("Foundry"),
    'tt'   => IND_SPAN._("Foundry").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST.END_P."<hr>".
              INCOME.CENTER_DIV.WORKER_HTML._(" Can produce: ").STEEL_HTML.END_DIV,
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array(),
    'slot' => 1,
    's1'   => array('steel'=>1),
    's1_tt'=> _("Produces ").STEEL_HTML,
    'amt'  => 3,
   ),
   BLD_STEEL_MILL => array(
    'name' => _("Steel Mill"),
    'tt'   => RES_SPAN._("Steel Mill").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. WOOD_HTML." ". WOOD_HTML." ". GOLD_HTML. END_P."<hr>".
              INCOME.CENTER_DIV._(" Produces ").STEEL_HTML._(" each round").END_DIV,
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>2,'gold'=>1),
    'inc'  => array('steel'=>1),
    'amt'  => 1,
   ),
   BLD_BOARDING_HOUSE => array(
    'name' => _("Boarding House"),
    'tt'   => IND_SPAN._("Boarding House").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. WOOD_HTML." ". WOOD_HTML. END_P."<hr>".
              CENTER_DIV._(" When Built: Pay off ").LOAN_HTML.
              "<br>"._(" End: ").VP_HTML." ".ARROW_HTML." ".I_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").SILVER_HTML.SILVER_HTML._(" each round").END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>2),
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('silver'=>2),
    'amt'  => 1,
    'on_b' => BUILD_BONUS_PAY_LOAN,
   ),
   BLD_RAILWORKERS_HOUSE => array(
    'name' => _("Railworkers House"),
    'tt'   => RES_SPAN._("Railworkers House").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. STEEL_HTML." ". STEEL_HTML. END_P."<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".TRACK_HTML.
              "<br>"._(" End: ").VP_HTML." ".ARROW_HTML."  ".WORKER_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").TRADE_HTML.SILVER_HTML._(" each round").END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>2),
    'vp_b' => VP_B_WRK_TRK,
    'inc'  => array('trade'=>1, 'silver'=>1),
    'amt'  => 1,
   ),
   BLD_RANCH => array(
    'name' => _("Ranch"),
    'tt'   => RES_SPAN.("Ranch").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST.WOOD_HTML." ". STEEL_HTML." ". FOOD_HTML. END_P."<hr>".
              CENTER_DIV._(" When Built: gain").TRADE_HTML.END_DIV.
              INCOME.CENTER_DIV.WORKER_HTML._(" Can produce ").COW_HTML.END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1,'steel'=>1,'food'=>1),
    'slot' => 1,
    's1'   => array('cow'=>1),
    's1_tt'=> clienttranslate("Produces ").COW_HTML,
    'amt'  => 2,
    'on_b' => BUILD_BONUS_TRADE,
   ),
   BLD_TRADING_POST => array(
    'name' => _("Trading Post"),
    'tt'   => COM_SPAN.("Trading Post").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. GOLD_HTML. END_P."<hr>".
              INCOME.CENTER_DIV._(" Produces ").TRADE_HTML.TRADE_HTML._(" each round").END_DIV,
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => _("General Store"),
    'desc' => clienttranslate('Whenever you Sell, get an additional ${silver}'),
    'tt'   => COM_SPAN.("General Store").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. STEEL_HTML. END_P."<hr>".
              CENTER_DIV._(" Whenever you Sell, ")."<br>".
              _(" get an additional ").SILVER_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").TRADE_HTML._(" each round").END_DIV,
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'amt'  => 2,
   ),
   BLD_GOLD_MINE => array(
    'name' => _("Gold Mine"),
    'tt'   => IND_SPAN._("Gold Mine").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. WOOD_HTML." ". STEEL_HTML. END_P."<hr>".
              INCOME.CENTER_DIV.WORKER_HTML._(" Can produce ").GOLD_HTML.END_DIV,
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1,'steel'=>1),
    'slot' => 1,
    's1'   => array('gold'=>1),
    's1_tt'=> _("Produces ").GOLD_HTML,
    'amt'  => 2,
   ),
   BLD_COPPER_MINE => array(
    'name' => _("Copper Mine"),
    'tt'   => IND_SPAN._("Copper Mine").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
            COST. WOOD_HTML." ". WOOD_HTML. STEEL_HTML. END_P. "<hr>".
            INCOME.CENTER_DIV.WORKER_HTML._(" Can produce ").COPPER_HTML.END_DIV,
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>2,'steel'=>1),
    'slot' => 1,
    's1'   => array('copper'=>1),
    's1_tt'=> _("Produces ").COPPER_HTML,
    'amt'  => 2,
   ),
   BLD_RIVER_PORT => array(
    'name' => _("River Port"),
    'desc' => clienttranslate('You may pay for ${copper} or ${cow} in building costs or auction costs using ${gold} instead'),
    'tt'   => IND_SPAN._("River Port").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
            COST. WOOD_HTML. END_P. "<hr>".
            CENTER_DIV._(" You may pay for ").COPPER_HTML._(" or ").COW_HTML.
            "<br>"._(" in building costs or auction")."<br>"._("costs using ").GOLD_HTML._(" instead").END_DIV.
            INCOME.CENTER_DIV.WORKER_HTML.WORKER_HTML._(" Can produce ").GOLD_HTML.END_DIV,
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1),
    'slot' => 3,
    's3'   => array('gold'=>1),
    's3_tt'=> _("When worked by ").WORKER_HTML.WORKER_HTML._(", Produces ").GOLD_HTML,
    'amt'  => 2,
   ),
   BLD_CHURCH => array(
    'name' => _("Church"),
    'tt'   => RES_SPAN._("Church").END_SPAN.":".RIGHT_P.VP10_HTML.END_P.
              COST. WOOD_HTML." ". STEEL_HTML." ". GOLD_HTML." ". COPPER_HTML." ". END_P. "<hr>".
              INCOME.CENTER_DIV._(" Produces ").VP2_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>1,'steel'=>1,'gold'=>1,'copper'=>1),
    'vp'   => 10,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_WORKSHOP => array(
    'name' => _("Workshop"),
    'tt'   => RES_SPAN._("Workshop").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. STEEL_HTML. END_P. "<hr>".
              INCOME.CENTER_DIV._(" Produces ").VP_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('vp'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_WORKER,
   ),
   BLD_DEPOT => array(
    'name' => _("Depot"),
    'tt'   => COM_SPAN._("Depot").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. WOOD_HTML. STEEL_HTML. END_P. "<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track (and get Bonus).")."<br>".
              _(" End: ").VP_HTML." ".ARROW_HTML." ".TRACK_HTML."<br>".END_DIV.
              INCOME.CENTER_DIV._(" Produces ").SILVER_HTML.SILVER_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('wood'=>1,'steel'=>1),
    'vp_b' => VP_B_TRACK,
    'inc'  => array('silver'=>2),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_BANK => array(
    'name' => _("Bank"),
    'desc' => clienttranslate('Allow trade:\n${trade} ${arrow} ${silver}'),
    'tt'   => COM_SPAN._("Bank").END_SPAN.":".RIGHT_P.VP3_HTML.END_P.
              COST. STEEL_HTML. COPPER_HTML. END_P.
              ALLOW_TRADE.CENTER_DIV.TRADE_HTML." ".ARROW_HTML." ".SILVER_HTML."<br>".
              _(" End: ").END_SPAN.VP_HTML." ".ARROW_HTML." ".S_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Pays off ").LOAN_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>1,'copper'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_SPECIAL,
    'inc'  => array('loan'=>-1),
    'amt'  => 1,
   ),
   BLD_STABLES => array(
    'name' => _("Stables"),
    'tt'   => COM_SPAN._("Stables").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. COW_HTML. END_P. "<hr>".          
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".R_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").TRADE_HTML.VP_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1),
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('trade'=>1, 'vp'=>1),
    'amt'  => 1,
   ),
   BLD_MEATPACKING_PLANT => array(
    'name' => _("Meatpacking Plant"),
    'tt'   => IND_SPAN._("Meatpacking Plant").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. WOOD_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV.INCOME.WORKER_HTML._(" Can Produce: ").VP2_HTML."<br>".
              WORKER_HTML._(" Can Produce: ").VP2_HTML.END_DIV,
              CENTER_DIV.INCOME._(" Can Produce: ").VP2_HTML."<br>".
              _(" Can Produce: ").VP2_HTML.END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1,'cow'=>1),
    'vp'   => 2,
    'slot' => 2,
    's1'   => array('vp2'=>1),
    's1_tt'=> _("Produces ").VP2_HTML,
    's2'   => array('vp2'=>1),
    's2_tt'=> _("Produces ").VP2_HTML,
    'amt'  => 1,
   ),
   BLD_FORGE => array(
    'name' => _("Forge"),
    'desc' => clienttranslate('Get ${vp} whenever you build a building (after this one)'),
    'tt'   => IND_SPAN._("Forge").END_SPAN.":".
              COST. STEEL_HTML. END_P. RIGHT_P.VP_HTML.END_P."<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track")."<br>"._("(and get bonus).")."<br>".
              _(" get ").VP_HTML._(" whenever you build")."<br>".
              _("a building, (after this one)").
              INCOME.CENTER_DIV.WORKER_HTML._(" Can Produce: ").VP2_HTML.END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('steel'=>2),
    'vp'   => 1,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    's1_tt'=> _("Produces ").VP2_HTML,
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_FACTORY => array(
    'name' => _("Factory"),
    'tt'   => SPE_SPAN._("Factory").END_SPAN.":".RIGHT_P.VP6_HTML.END_P.
              COST. STEEL_HTML. STEEL_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".I_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Income: ").VP2_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('steel'=>2, 'copper'=>1),
    'vp'   => 6,
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_RODEO => array(
    'name' => _("Rodeo"),
    'tt'   => SPE_SPAN._("Rodeo").END_SPAN.":".RIGHT_P.VP4_HTML.END_P.
              COST. FOOD_HTML. COW_HTML. END_P. "<hr>".
              INCOME.CENTER_DIV._(" Produces ").SILVER_HTML." ".ARROW_HTML." ".WORKER_HTML.
              "<br>"._(" (max 5) each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('food'=>1, 'cow'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>'5'),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => _("Lawyer"),
    'desc' => clienttranslate('You may overbid others with the same bid value'),
    'tt'   => SPE_SPAN._("Lawyer").END_SPAN.":".RIGHT_P.VP4_HTML.END_P.
              COST. WOOD_HTML. GOLD_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV._(" You May overbid others with the same Bid.").
              "<br>"._(" End:").VP_HTML." ".ARROW_HTML." ".C_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").VP2_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('wood'=>1, 'gold'=>1, 'cow'=>1),
    'vp'   => 4,
    'vp_b' => VP_B_COMMERCIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FAIRGROUNDS => array(
    'name' => _("Fairgrounds"),
    'tt'   => SPE_SPAN._("Fairgrounds").END_SPAN.":".RIGHT_P.VP6_HTML.END_P.
              COST. WOOD_HTML. WOOD_HTML. COPPER_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".R_HTML.END_DIV.
              INCOME.CENTER_DIV._(" Produces ").GOLD_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('wood'=>2,'copper'=>1,'cow'=>1),
    'vp'   => 6,
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('gold'=>1),
    'amt'  => 1,
   ),
   BLD_DUDE_RANCH => array(
    'name' => _("Dude Ranch"),
    'tt'   => RES_SPAN._("Dude Ranch").END_SPAN.":".RIGHT_P.VP3_HTML.END_P.
              COST. WOOD_HTML. FOOD_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".WORKER_HTML.END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>1,'food'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_WORKER,
    'amt'  => 2,
   ),
   BLD_TOWN_HALL => array(
    'name' => _("Town Hall"),
    'tt'   => RES_SPAN._("Town Hall").END_SPAN.":".RIGHT_P.VP10_HTML.END_P.
              COST. WOOD_HTML. WOOD_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".C_HTML.END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>2,'copper'=>1),
    'vp'   => 10,
    'vp_b' => VP_B_COMMERCIAL,
    'amt'  => 1,
   ),
   BLD_TERMINAL => array(
    'name' => _("Terminal"),
    'tt'   => COM_SPAN._("Terminal").END_SPAN.":".RIGHT_P.VP6_HTML.END_P.
              COST. STEEL_HTML. STEEL_HTML. END_P. "<hr>".
              CENTER_DIV._(" End ").VP_HTML." ".ARROW_HTML." ".TRACK_HTML.END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_TRACK,
    'amt'  => 2,
   ),
   BLD_RESTARAUNT => array(
    'name' => _("Restaraunt"),
    'tt'   => COM_SPAN._("Restaraunt").END_SPAN.":".RIGHT_P.VP8_HTML.END_P.
              COST. WOOD_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".S_HTML.END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('wood'=>1,'cow'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_SPECIAL,
    'amt'  => 2,
   ),
   BLD_TRAIN_STATION => array(
    'name' => _("Train Station"),
    'tt'   => IND_SPAN._("Train Station").END_SPAN.":".RIGHT_P.VP3_HTML.END_P.
              COST. WOOD_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV._(" When Built: gain ").TRACK_HTML."<br>".
              _(" & you may build another")."<br>".
              _("building of ").A_HTML.
              _("type").END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_TRACK_AND_BUILD,
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_CIRCUS => array(
    'name' => _("Circus"),
    'tt'   => SPE_SPAN._("Circus").END_SPAN.":".RIGHT_P.VP8_HTML.END_P.
              COST. FOOD_HTML. FOOD_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".WORKER_HTML.END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('food'=>2,'cow'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_WORKER,
    'amt'  => 1,
   ),
   BLD_RAIL_YARD => array(
    'name' => _("Rail Yard"),
    'tt'   => SPE_SPAN._("Rail Yard").END_SPAN.":".RIGHT_P.VP6_HTML.END_P.
              COST. STEEL_HTML. STEEL_HTML. GOLD_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track (and get Bonus).")."<br>".
              _(" End: ").VP_HTML." ".ARROW_HTML._(" Building").END_DIV.INCOME,
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('steel'=>2,'gold'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
   BLD_LUMBERMILL => array(
    'name' => _("Lumbermill"),
    'desc' => clienttranslate('May use ${wood}${vp} in place of ${steel} in building costs'),
    'tt'   => SPE_SPAN._("Lumbermill").END_SPAN.":".RIGHT_P.VP6_HTML.END_P.
              COST. STEEL_HTML. STEEL_HTML. GOLD_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track (and get Bonus).")."<br>".
              _(" End: ").VP_HTML." ".ARROW_HTML._(" Building").END_DIV.INCOME,
    'stage'=> STAGE_SETTLEMENT,
    'type' => TYPE_RESIDENTIAL,
    'inc'  => array('wood'=>1, 'silver'=>1),
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_SALOON => array(
    'name' => _("Saloon"),
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'type' => TYPE_COMMERCIAL,
    'on_b' => BUILD_BONUS_SILVER_SILVER,
    'vp'   => 1,
    'amt'  => 2,
   ),
   BLD_SILVER_MINE => array(
    'name' => _("Silver Mine"),
    'tt'   => "",
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 2,
    'slot' => 1,
    's1'   => array('silver'=>3),
    's1_tt'=> "Produces ".SILVER_HTML.SILVER_HTML.SILVER_HTML,
    'amt'  => 2,
   ),
   BLD_HOTEL => array(
    'name' => _("Hotel"),
    'desc' => clienttranslate('When you gain ${worker} gain ${silver}'),
    'tt'   => "",
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('food'=>1,'steel'=>1),
    'on_b' => BUILD_BONUS_SILVER_WORKERS,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    's1_tt'=> "Produces ".VP2_HTML,
    'vp'   => 3,
    'amt'  => 1,
   ),
   BLD_WAREHOUSE => array(
    'name' => _("Warehouse"),
    'tt'   => "",
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('wood'=>1,'steel'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_PLACE_RESOURCES,
    'vp'   => 3,
    'inc'  => array('special'=> 1), // This will require special handling by the player, & probably a new state just for this.
    'amt'  => 1,
   ),
   BLD_POST_OFFICE => array(
    'name' => _("Post Office"),
    'tt'   => "",
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('wood'=>2,'steel'=>1,'cow'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_PAID_LOAN,
    'amt'  => 1,
   ),
));

foreach ($this->building_info as $b_id=> $b_val){
  if ($b_val['type'] == TYPE_RESIDENTIAL)     $typeSpan = '<span class="font bold res">';
  else if ($b_val['type'] == TYPE_COMMERCIAL) $typeSpan = '<span class="font bold com">'; 
  else if ($b_val['type'] == TYPE_INDUSTRIAL) $typeSpan = '<span class="font bold ind">';
  else if ($b_val['type'] == TYPE_SPECIAL)    $typeSpan = '<span class="font bold spe">';
  else                                        $typeSpan = '<span class="font bold">';
  $vp = 'vp';
  if ($b_val['vp'] != 1) $vp .= $b_val['vp']; // vp0, vp2, vp4 etc.
  $vp_html = "<p class=\"alignright\"><span aria=\"$vp\" title=\"$vp\" class=\"log_$vp token_inline\"></span></p>";
  
  if (array_key_exists('cost', $b_val)){
    $cost_html = '<br><p class="useFont">'._('Cost: ');
    
    $cost_html .='</p><hr>';
  } else $cost_html = '<hr>';
  if (array_key_exists('description', $b_val)){
    $description_html = $b_val['description'];
  } else $description_html = '<hr>';
  

  $this->building_info[$b_id]['tt'] = 
  $typeSpan.$b_val['name'].'</span>'.$vp_html.$cost_html.
INCOME.CENTER_DIV._("Produce:  ").SILVER_HTML.SILVER_HTML.
"<br>".WORKER_HTML._(" Can Produce:  ").WOOD_HTML.
"<br>".WORKER_HTML._(" Can Produce:  ").VP_HTML.END_DIV;
} 


$this->auction_info = array( 
  1 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => AUC1_SPAN._("Round 1").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").C_HTML."<hr>".END_DIV,
  ),
  2 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => AUC1_SPAN._("Round 2").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<hr>".END_DIV,
  ),
  3 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => AUC1_SPAN._("Round 3").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").C_HTML."<hr>".END_DIV,
  ),
  4 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
    'tt'    => AUC1_SPAN._("Round 4").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").I_HTML."<hr>".END_DIV,
  ),
  5 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => AUC1_SPAN._("Round 5").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").C_HTML."<hr>".
              _(" May Hire ").WORKER_HTML._(" (Free)").END_DIV,
    'bonus' => AUC_BONUS_WORKER,
  ),
  6 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => AUC1_SPAN._("Round 6").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<hr>".
              _(" May Hire ").WORKER_HTML._(" (Free)").END_DIV,
    'bonus' => AUC_BONUS_WORKER,
  ),
  7 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => AUC1_SPAN._("Round 7").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<hr>".
              _(" May Hire ").WORKER_HTML._(" (Free)").END_DIV,
    'bonus' => AUC_BONUS_WORKER,
  ),
  8 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC1_SPAN._("Round 8").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").A_HTML.END_DIV."<hr>",
  ),
  9 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC1_SPAN._("Round 9").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").A_HTML."<hr>".
              _(" May pay ").COPPER_HTML._(" for ").VP4_HTML.END_DIV,
    'bonus' => AUC_BONUS_COPPER_FOR_VP,
  ),
  10 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC1_SPAN._("Round 10").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").A_HTML."<hr>".
              _(" May pay ").COW_HTML._(" for ").VP4_HTML.END_DIV,
    'bonus' => AUC_BONUS_COW_FOR_VP,
  ),
  11 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => AUC2_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<hr>".END_DIV,
  ),
  12 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => AUC2_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<hr>".END_DIV,
  ),
  13 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC2_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").A_HTML."<hr>".END_DIV,
  ),
  14 => array(
    'tt'    => AUC2_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: None")."<hr>".
              _("May Hire ").WORKER_HTML._(" (Free) &")."<br>".
              _("Advance the Railroad Track").END_DIV,
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  15 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => AUC2_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").C_HTML."<hr>".END_DIV,
  ),
  16 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
    'tt'    => AUC2_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<br>".
              _(" OR ").C_HTML."<hr>".END_DIV,
  ),
  17 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC2_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<br>".
              _(" OR ").S_HTML."<hr>".END_DIV,
  ),
  18 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'tt'    => AUC2_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").S_HTML."<hr>".
              _(" May pay ").WOOD_HTML._(" for a Track").END_DIV,
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  19 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_INDUSTRIAL),
    'tt'    => AUC2_SPAN._("City").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").C_HTML."<br>".
              _(" OR ").I_HTML."<hr>".
              _(" May pay ").FOOD_HTML._(" for ").VP2_HTML.END_DIV,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  20 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'tt'    => AUC2_SPAN._("City").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").S_HTML."<hr>".
              _(" May pay ").FOOD_HTML._(" for ").VP2_HTML.END_DIV,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  21 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => AUC3_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<hr>".END_DIV,
  ),
  22 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => AUC3_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").C_HTML."<hr>".END_DIV,
  ),
  23 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => AUC3_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").I_HTML."<hr>".END_DIV,
  ),
  24 => array(
    'tt'    => AUC3_SPAN._("Settlement").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: None.")."<hr>".
              _("May Hire ").WORKER_HTML._(" (Free) &")."<br>".
              _("Advance the Railroad Track").END_DIV,
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  25 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => AUC3_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
               _(" Build: ").R_HTML."<hr>".END_DIV,
  ),
  26 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => AUC3_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
               _(" Build: ").C_HTML."<hr>".END_DIV,
  ),
  27 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => AUC3_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
               _(" Build: ").I_HTML."<hr>".
               _("May pay ").WOOD_HTML._(" for a Track").END_DIV,
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  28 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => AUC3_SPAN._("Town").END_SPAN."<hr>".CENTER_DIV.
               _(" Build: ").A_HTML."<hr>".END_DIV,
  ),
  29 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => AUC3_SPAN._("City").END_SPAN."<hr>".CENTER_DIV.
              _(" Build: ").R_HTML."<br>".
              _(" OR ").C_HTML."<hr>".
              _("May pay ").FOOD_HTML._(" for ").VP2_HTML.END_DIV,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  30 => array(
    'tt'    => AUC3_SPAN._("City").END_SPAN."<hr>".CENTER_DIV.
            _("Build: None")."<hr>"._("Gain ").VP6_HTML."<br>".
            _("May pay ").FOOD_HTML._(" for ").VP2_HTML.END_DIV,
    'bonus' => AUC_BONUS_6VP_AND_FOOD_VP,
  ),
  
);
