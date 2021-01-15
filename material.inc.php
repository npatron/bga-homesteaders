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
    'tt'     => clienttranslate('${silver}\nSilver:\nUsed to pay ${worker} and to pay for auctions'),
  ),
  'workers' => array(
    'name'   => _("Worker"),
    'db_int' => WORKER,
    'tt'     => clienttranslate('${worker}\nWorker:\nProduces resources when assigned to buildings'),
  ),   
  'track' => array(
    'name'   => _("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => clienttranslate('${track}\nRail Track\nProduces ${silver} each round'),
  ),
  'wood' => array(
    'name'   => _("Wood"),
    'db_int' => WOOD,
    'tt'     => clienttranslate('${wood}\nWood:\nRequired to build some buildings'),
  ),
  'food' => array(
    'name'   => _("Food"),
    'db_int' => FOOD,
    'tt'     => clienttranslate('${food}\nFood:\nRequired to build some buildings\nUsed to Hire new ${worker}'),
  ),
  'steel' => array(
    'name'   => _("Steel"),
    'db_int' => STEEL,
    'tt'     => clienttranslate('${steel}\nSteel:\nRequired to build some buildings'),
  ),
  'gold' => array(
    'name'   => _("Gold"),
    'db_int' => GOLD,
    'tt'     => clienttranslate('${gold}\nGold:\nRequired to build some buildings\nCan be used to pay Workers / Auction costs(as 5 silver)\nEnd: Worth ${vp2}'),
  ),
  'copper' => array(
    'name'   => _("Copper"),
    'db_int' => COPPER,
    'tt'     => clienttranslate('${copper}\nCopper:\nRequired to build some buildings\nEnd: Worth ${vp2}'),
  ),
  'cow' => array(
    'name'   => _("Livestock"),
    'db_int' => COW,
    'tt'     => clienttranslate('${cow}\nLivestock:\nRequired to build some buildings\nEnd: Worth ${vp2}'),
  ),
  'loan' => array(
    'name'   => _("Debt"),
    'db_int' => LOAN,
    'tt'     => clienttranslate('${loan}\nDebt:\n Costs 5 Silver (or 1 Gold) to pay off\nEnd: Worth ${vp2}\n'.
                'End: Penalty for unpaid Debt:\n${loan} ${arrow} lose ${vp}\n'.
                '${loan}${loan} ${arrow} lose ${vp3}\n'.
                '${loan}${loan}${loan} ${arrow} lose ${vp6}\n'.
                '${loan}${loan}${loan}${loan} ${arrow} lose ${vp10}\n (etc...)'),
  ),
  'trade' => array(
    'name'   => _("Trade Token"),
    'db_int' => TRADE,
    'tt'     => clienttranslate('${trade}\nTrade Token:\n Required for any trade\n'.
                'Used to Hire new ${worker}'),
  ),
  'vp' => array(
    'name'   => _("VP Token"),
    'db_int' => VP,
    'tt'     => clienttranslate('${vp}\nVP Token:\nEnd: Worth 1 VP'),
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array_merge(
  array_fill_keys( 
    array(BLD_HOMESTEAD_YELLOW, BLD_HOMESTEAD_RED, BLD_HOMESTEAD_GREEN, BLD_HOMESTEAD_BLUE, BLD_HOMESTEAD_PURPLE), 
    array(
      'name' => _("Homestead"),
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
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('steel'=>1,'wood'=>1),
    'vp'   => 2,
    'inc'  => array('food'=>1),
    'amt'  => 1,
   ),
   BLD_FARM => array(
    'name' => _("Farm"),
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
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('gold'=>1,'wood'=>2,),
    'inc'  => array('steel'=>1),
    'amt'  => 1,
   ),
   BLD_BOARDING_HOUSE => array(
    'name' => _("Boarding House"),
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
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>2),
    'vp_b' => VP_B_WRK_TRK,
    'inc'  => array('trade'=>1, 'silver'=>1),
    'amt'  => 1,
   ),
   BLD_RANCH => array(
    'name' => _("Ranch"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'food'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('cow'=>1),
    's1_tt'=> clienttranslate("Produces ").COW_HTML,
    'amt'  => 2,
    'on_b' => BUILD_BONUS_TRADE,
   ),
   BLD_TRADING_POST => array(
    'name' => _("Trading Post"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => _("General Store"),
    'desc' => clienttranslate('Whenever you Sell, get an additional ${silver}'),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'amt'  => 2,
   ),
   BLD_GOLD_MINE => array(
    'name' => _("Gold Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('gold'=>1),
    's1_tt'=> _("Produces ").GOLD_HTML,
    'amt'  => 2,
   ),
   BLD_COPPER_MINE => array(
    'name' => _("Copper Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1, 'wood'=>2),
    'slot' => 1,
    's1'   => array('copper'=>1),
    's1_tt'=> _("Produces ").COPPER_HTML,
    'amt'  => 2,
   ),
   BLD_RIVER_PORT => array(
    'name' => _("River Port"),
    'desc' => clienttranslate('You may pay for ${copper} or ${cow} in building costs or auction costs using ${gold} instead'),
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
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>1,'wood'=>1),
    'vp'   => 10,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_WORKSHOP => array(
    'name' => _("Workshop"),
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
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>1,'wood'=>1,),
    'vp_b' => VP_B_TRACK,
    'inc'  => array('silver'=>2),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_STABLES => array(
    'name' => _("Stables"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1),
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('trade'=>1, 'vp'=>1),
    'amt'  => 1,
   ),
   BLD_BANK => array(
    'name' => _("Bank"),
    'desc' => clienttranslate('Allow trade:\n${trade} ${arrow} ${silver}'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('copper'=>1, 'steel'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_SPECIAL,
    'inc'  => array('loan'=>-1),
    'amt'  => 1,
   ),
   BLD_MEATPACKING_PLANT => array(
    'name' => _("Meatpacking Plant"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('cow'=>1, 'wood'=>1,),
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
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1, 'steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_RODEO => array(
    'name' => _("Rodeo"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'food'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>'x'),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => _("Lawyer"),
    'desc' => clienttranslate('You may overbid others with the same bid value'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'gold'=>1, 'wood'=>1),
    'vp'   => 4,
    'vp_b' => VP_B_COMMERCIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FAIRGROUNDS => array(
    'name' => _("Fairgrounds"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'copper'=>1, 'wood'=>2,),
    'vp'   => 6,
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('gold'=>1),
    'amt'  => 1,
   ),
   BLD_DUDE_RANCH => array(
    'name' => _("Dude Ranch"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('food'=>1,'wood'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_WORKER,
    'amt'  => 2,
   ),
   BLD_TOWN_HALL => array(
    'name' => _("Town Hall"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'wood'=>2,),
    'vp'   => 10,
    'vp_b' => VP_B_COMMERCIAL,
    'amt'  => 1,
   ),
   BLD_TERMINAL => array(
    'name' => _("Terminal"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_TRACK,
    'amt'  => 2,
   ),
   BLD_RESTARAUNT => array(
    'name' => _("Restaraunt"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1,'wood'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_SPECIAL,
    'amt'  => 2,
   ),
   BLD_TRAIN_STATION => array(
    'name' => _("Train Station"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('copper'=>1,'wood'=>1, ),
    'on_b' => BUILD_BONUS_TRACK_AND_BUILD,
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_CIRCUS => array(
    'name' => _("Circus"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1,'food'=>2),
    'vp'   => 8,
    'vp_b' => VP_B_WORKER,
    'amt'  => 1,
   ),
   BLD_RAIL_YARD => array(
    'name' => _("Rail Yard"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>2),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
   BLD_LUMBERMILL => array(
    'name' => _("Lumbermill"),
    'desc' => clienttranslate('May use ${wood}${vp} in place of ${steel} in building costs'),
    'stage'=> STAGE_SETTLEMENT,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array(),
    'inc'  => array('wood'=>1, 'silver'=>1),
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_SALOON => array(
    'name' => _("Saloon"),
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array(),
    'on_b' => BUILD_BONUS_SILVER_SILVER,
    'vp'   => 1,
    'amt'  => 2,
   ),
   BLD_SILVER_MINE => array(
    'name' => _("Silver Mine"),
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
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1,'food'=>1),
    'on_b' => BUILD_BONUS_SILVER_WORKERS,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    's1_tt'=> "Produces ".VP2_HTML,
    'vp'   => 3,
    'amt'  => 1,
   ),
   BLD_WAREHOUSE => array(
    'name' => _("Warehouse"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('copper'=>1,'steel'=>1,'wood'=>1),
    'on_b' => BUILD_BONUS_PLACE_RESOURCES,
    'vp'   => 3,
    'inc'  => array('special'=> 1), // This will require special handling by the player, & probably a new state just for this.
    'amt'  => 1,
   ),
   BLD_POST_OFFICE => array(
    'name' => _("Post Office"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1,'steel'=>1,'wood'=>2),
    'vp'   => 8,
    'vp_b' => VP_B_PAID_LOAN,
    'amt'  => 1,
   ),
));

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
  31 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  32 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
  ),
  33 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  34 => array(
    'bonus'=> AUC_BONUS_NONE,
  ),
  35 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
  ),
  36 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_SPECIAL),
  ),
  37 => array(
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  38 => array(
    'bonus' => AUC_BONUS_4DEPT_FREE,
  ),
  39 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  40 => array(
    'bonus' => AUC_BONUS_3VP_SELL_FREE,
  ),
  
);

$this->events_info = array(
  EVT_1_1 => array(
    'name' => _('Abandoned Stockpile'),
    'tt' => _('pay 1 less resource on build from Auction 1'),
  ),
  EVT_1_2 => array(
    'name' => _('Bureaucratic Error'),
    'tt' => _('Auction 1 is skipped this round'),
  ),
  EVT_1_3 => array(
    'name' => _('Central Pacific RR'),
    'tt' => _('Recieve Track on pass'),

  ),
  EVT_1_4 => array(
    'name' => _('Eager Investors'),
    'tt' => _('pay 1 less resource on build from Auction 1'),

  ),
  EVT_1_5 => array(
    'name' => _('Extra Lot'),

  ),
  EVT_1_6 => array(
    'name' => _('Migrant Workers'),

  ),
  EVT_1_7 => array(
    'name' => _('Railroad Contracts'),

  ),
  EVT_1_8 => array(
    'name' => _('Rapid Expansion'),

  ),
  EVT_1_9 => array(
    'name' => _('Traveling Traders'),

  ),
  EVT_1_10 => array(
    'name' => _('Union Pacific RR'),

  ),
  EVT_2_1 => array(
    'name' => _('Bank Favors'),
  ),
  EVT_2_2 => array(
    'name' => _('Fortune Seeker'),
  ),
  EVT_2_3 => array(
    'name' => _('Industrialization'),
  ),
  EVT_2_4 => array(
    'name' => _('Interest'),
  ),
  EVT_2_5 => array(
    'name' => _('Sharecropping'),
  ),
  EVT_2_6 => array(
    'name' => _('State Fair'),
  ),
  EVT_2_7 => array(
    'name' => _('Transcontinental Railroad'),
  ),
  EVT_2_8 => array(
    'name' => _('Timber Culture Act'),
  ),
  EVT_2_9 => array(
    'name' => _('Wartime Demand'),
  ),
  EVT_2_10 => array(
    'name' => _('Western Pacific RR'),
  ),
  EVT_3_1 => array(
    'name' => _('Commercial Dominance'),
  ),
  EVT_3_2 => array(
    'name' => _('Industrial Dominance'),
  ),
  EVT_3_3 => array(
    'name' => _('Nelson Act'),
  ),
  EVT_3_4 => array(
    'name' => _('Property Taxes'),
  ),
  EVT_3_5 => array(
    'name' => _('Residential Dominance'),
  ),
);
