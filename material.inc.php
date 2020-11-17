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
  'vp4' => array('vp'=>4),
  'vp6' => array('vp'=>6),
  'vp8' => array('vp'=>8),
);

$this->resource_info = array(
  'silver' => array(
    'name'   => clienttranslate("Silver"),
    'db_int' => SILVER,
    'tt'     => "<span class='score_token score_silver tt'></span>".
            _("Silver: Used to pay workers and Auction Costs")."<br>".
            _("Used in many trades"),
  ),
  'workers' => array(
    'name'   => clienttranslate("Worker"),
    'db_int' => WORKER,
    'tt'     => WORKER_HTML._("(Worker): Produces resources when assigned to buildings"),
  ),   
  'track' => array(
    'name'   => clienttranslate("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => FULL_TRACK_HTML._("(Track) Produces ").SILVER_HTML._(" each round"),
  ),
  'wood' => array(
    'name'   => clienttranslate("Wood"),
    'db_int' => WOOD,
    'tt'     => "<div class='score_token score_wood tt'></div>".
            _("Wood: Required to build some buildings"),
  ),
  'food' => array(
    'name'   => clienttranslate("Food"),
    'db_int' => FOOD,
    'tt'     => "<div class='score_token score_food tt'></div>".
            _("Food: Required to build some buildings, or to hire new workers"),
  ),
  'steel' => array(
    'name'   => clienttranslate("Steel"),
    'db_int' => STEEL,
    'tt'     => "<div class='score_token score_steel tt'></div>".
            _("Steel: Required to build some buildings"),
  ),
  'gold' => array(
    'name'   => clienttranslate("Gold"),
    'db_int' => GOLD,
    'tt'     => "<div class='score_token score_gold tt'></div>".
            clienttranslate("Gold: Required to build some buildings")."<br>".
            _("Can be used to pay Workers / Auction costs(as 5 silver)")."<br>".
            _("End: Worth ").VP2_HTML,
  ),
  'copper' => array(
    'name'   => clienttranslate("Copper"),
    'db_int' => COPPER,
    'tt'     => "<div class='score_token score_copper tt'></div>".
            clienttranslate("Copper: Required to build some buildings.")."<br>"._("End: Worth ").VP2_HTML,
  ),
  'cow' => array(
    'name'   => clienttranslate("Livestock"),
    'db_int' => COW,
    'tt'     => '<div class="score_token score_cow tt"></div>'.
      clienttranslate("Livestock: Required to build some buildings.")."<br>"._("End: Worth ").VP2_HTML,
  ),
  'loan' => array(
    'name'   => clienttranslate("Debt"),
    'db_int' => LOAN,
    'tt'     => '<span aria="debt" title="debt" class="tt_loan tt"></span> <hr>'.
              _("Debt: Costs 5 Silver (or 1 Gold) to pay off.")."<br".
              _("End: Worth -").VP_HTML,
  ),
  'trade' => array(
    'name'   => clienttranslate("Trade Token"),
    'db_int' => TRADE,
    'tt'     => "<div class='score_token score_trade tt'></div>".
      clienttranslate("Trade: Required for any trade. Also for hiring new workers"),
  ),
  'vp' => array(
    'name'   => clienttranslate("VP Token"),
    'db_int' => VP,
    'tt'     => "<div class='score_token score_vp tt'></div>".
      clienttranslate("VP-Token: Worth 1-VP at end of game"),
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array(
  BLD_HOMESTEAD_YELLOW => array(
    'name' => _("Homestead"),
    'tt'   => RES_SPAN._("Homestead").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              "<hr>".CENTER_DIV.INCOME._("Produce:  ").SILVER_HTML.SILVER_HTML.
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
   ),
   BLD_HOMESTEAD_RED => array(
    'name' => _("Homestead"),
    'tt'   => RES_SPAN._("Homestead").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              "<hr>".CENTER_DIV.INCOME._("Produce:  ").SILVER_HTML.SILVER_HTML.
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
   ),
   BLD_HOMESTEAD_GREEN => array(
    'name' => _("Homestead"),
    'tt'   => RES_SPAN._("Homestead").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              "<hr>".CENTER_DIV.INCOME._("Produce:  ").SILVER_HTML.SILVER_HTML.
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
   ),
   BLD_HOMESTEAD_BLUE => array(
    'name' => _("Homestead"),
    'tt'   => RES_SPAN._("Homestead").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
            "<hr>".CENTER_DIV.INCOME._("Produce:  ").SILVER_HTML.SILVER_HTML.
            "<br>".WORKER_HTML._(" Can Produce:  ").WOOD_HTML.
            "<br>".WORKER_HTML._(" Can Produce:  ").VP_HTML.END_DIV,
    'type' => TYPE_RESIDENTIAL,
    'stage'=> 0,
    'inc'  => array('silver'=>2),
    'slot' => 2,
    's1'   => array('wood'=>1),
    's1_tt'=> _("Produces ").WOOD_HTML,
    's2'   => array('vp'=>1),
    's2_tt'=> _("Produces ").VP_HTML,'amt'  => 0,
   ),
   BLD_GRAIN_MILL => array(
    'name' => _("Grain Mill"),
    'tt'   => RES_SPAN._("Grain Mill").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. WOOD_HTML ." ". STEEL_HTML. END_P.
              "<hr>".CENTER_DIV.INCOME.
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
              CENTER_DIV.INCOME.WORKER_HTML._(" Can Produce: ").TRADE_HTML.SILVER_HTML.SILVER_HTML."<br>".
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
    'tt'   => COM_SPAN._("Market").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST.WOOD_HTML.END_P.
              CENTER_DIV.ALLOW_TRADE. TRADE_HTML. WOOD_HTML." ".ARROW_HTML." ".FOOD_HTML.
              "<br>".TRADE_HTML.FOOD_HTML." ".ARROW_HTML." ".STEEL_HTML.
              INCOME._(" Produces ").TRADE_HTML._(" each round.").
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
              CENTER_DIV.INCOME.WORKER_HTML._(" Can produce: ").STEEL_HTML.END_DIV,
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
              CENTER_DIV.INCOME._(" Produces ").STEEL_HTML._(" each round").END_DIV,
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
              CENTER_DIV._(" When Built: Pay off ").FULL_LOAN_HTML.
              "<br>"._(" End: ").VP_HTML." ".ARROW_HTML." ".I_HTML.
              INCOME._(" Produces ").SILVER_HTML.SILVER_HTML._(" each round.").END_DIV,
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
              "<br>"._(" End: ").VP_HTML." ".ARROW_HTML."  ".WORKER_HTML.
              INCOME._(" Produces ").TRADE_HTML.SILVER_HTML._(" each round.").END_DIV,
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
              CENTER_DIV._(" When Built: gain").TRADE_HTML.
              INCOME.WORKER_HTML._(" Can produce ").COW_HTML.END_DIV,
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
              CENTER_DIV.INCOME._(" Produces ").TRADE_HTML.TRADE_HTML._(" each round").END_DIV,
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => _("General Store"),
    'tt'   => COM_SPAN.("General Store").END_SPAN.":".RIGHT_P.VP2_HTML.END_P.
              COST. STEEL_HTML. END_P."<hr>".
              CENTER_DIV._(" Whenever you Sell, ")."<br>".
              _(" get an additional ").SILVER_HTML.
              INCOME._(" Produces ").TRADE_HTML._(" each round.").END_DIV,
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
              CENTER_DIV.INCOME.WORKER_HTML._(" Can produce ").GOLD_HTML.END_DIV,
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
            CENTER_DIV.INCOME.WORKER_HTML._(" Can produce ").COPPER_HTML.END_DIV,
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
    'tt'   => IND_SPAN._("River Port").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
            COST. WOOD_HTML. END_P. "<hr>".
            CENTER_DIV._(" You may pay for ").COPPER_HTML._(" or ").COW_HTML.
            "<br>"._(" in building costs or auction")."<br>"._("costs using ").GOLD_HTML._(" instead").
            INCOME.WORKER_HTML.WORKER_HTML._(" Can produce ").GOLD_HTML.END_DIV,
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
              CENTER_DIV.INCOME._(" Produces ").VP2_HTML._(" each round").END_DIV,
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
              CENTER_DIV.INCOME._(" Produces ").VP_HTML._(" each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('VP'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_WORKER,
   ),
   BLD_DEPOT => array(
    'name' => _("Depot"),
    'tt'   => COM_SPAN._("Depot").END_SPAN.":".RIGHT_P.VP0_HTML.END_P.
              COST. WOOD_HTML. STEEL_HTML. END_P. "<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track (and get Bonus).")."<br>".
              _(" End: ").VP_HTML." ".ARROW_HTML." ".TRACK_HTML."<br>".
              INCOME._(" Produces ").SILVER_HTML.SILVER_HTML._(" each round.").END_DIV,
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
    'tt'   => COM_SPAN._("Bank").END_SPAN.":".RIGHT_P.VP3_HTML.END_P.
              COST. STEEL_HTML. COPPER_HTML. END_P. "<hr>".
              CENTER_DIV.ALLOW_TRADE.TRADE_HTML." ".ARROW_HTML." ".SILVER_HTML."<br>".
              _(" End: ").END_SPAN.VP_HTML." ".ARROW_HTML." ".S_HTML.END_DIV.
              INCOME._(" Pays off ").LOAN_HTML._(" each round."),
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".R_HTML.
              INCOME._(" Produces ").TRADE_HTML.VP_HTML._(" each round.").END_DIV,
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
    'tt'   => IND_SPAN._("Forge").END_SPAN.":".
              COST. STEEL_HTML. END_P. RIGHT_P.VP_HTML.END_P."<hr>".
              CENTER_DIV._(" When Built: Advance")."<br>".
              _(" on Railroad track")."<br>".("(and get bonus).")."<br>".
              _(" get ").VP_HTML._(" whenever you build")."<br>".
              _("a building, (after this one)").
              INCOME.WORKER_HTML._(" Can Produce: ").VP2_HTML.END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('steel'=>1),
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".I_HTML.
              INCOME._(" Income: ").VP2_HTML._(" each round").END_DIV,
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
              CENTER_DIV.INCOME._(" Produces ").SILVER_HTML." ".ARROW_HTML." ".WORKER_HTML.
              "<br>"._(" (max 5) each round").END_DIV,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('food'=>1, 'cow'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>5),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => _("Lawyer"),
    'tt'   => SPE_SPAN._("Lawyer").END_SPAN.":".RIGHT_P.VP4_HTML.END_P.
              COST. WOOD_HTML. GOLD_HTML. COW_HTML. END_P. "<hr>".
              CENTER_DIV._(" You May overbid others with the same Bid.").
              "<br>"._(" End:").VP_HTML." ".ARROW_HTML." ".C_HTML.
              INCOME._(" Produces ").VP2_HTML._(" each round.").END_DIV,
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".R_HTML.
              INCOME._(" Produces a ").GOLD_HTML._(" each round").END_DIV,
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".WORKER_HTML.INCOME.END_DIV,
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".C_HTML.INCOME.END_DIV,
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
              CENTER_DIV._(" End ").VP_HTML." ".ARROW_HTML." ".TRACK_HTML.INCOME.END_DIV,
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".S_HTML.INCOME.END_DIV,
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
              CENTER_DIV._(" When Built: gain ").FULL_TRACK_HTML.END_DIV.
              CENTER_DIV._(" & you may build another")."<br>"._("building of ").A_HTML._("type").INCOME.END_DIV,
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
              CENTER_DIV._(" End: ").VP_HTML." ".ARROW_HTML." ".WORKER_HTML.INCOME.END_DIV,
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
              _(" End: ").VP_HTML." ".ARROW_HTML._(" Building").INCOME.END_DIV,
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('steel'=>2,'gold'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
);

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
