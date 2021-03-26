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

$this->trade_map = array(
  0=>'buy_wood', 1=>'buy_food', 2=>'buy_steel', 3=>'buy_gold', 4=>'buy_copper', 5=>'buy_cow',
  6=>'sell_wood', 7=>'sell_food', 8=>'sell_steel', 9=>'sell_gold', 10=>'sell_copper',11=>'sell_cow', 
  12=>'market_food', 13=>'market_steel', 14=>'bank', 15=>'loan', 16=>'payloan_silver', 17=>'payloan_gold');

$this->translation_strings = array(
  0=> clienttranslate('Residential'), 
  1=> clienttranslate('Commercial'), 
  2=> clienttranslate('Industrial'), 
  3=> clienttranslate('Special'), 
  4=> clienttranslate('Any'), 
  6=> clienttranslate('Building'), 
  9=> clienttranslate('You have already built this building'),
  10=> clienttranslate('You can not afford to build this building'),
  11=> clienttranslate('You can afford to build this building (trades required)'),
  12=> clienttranslate('You can afford to build this building'),
);

$this->resource_info = array(
  'silver' => array(
    'name'   => clienttranslate("Silver"),
    'db_int' => SILVER,
    'bank'   => array(),
    'tt'     => clienttranslate('${silver}<br>Silver:<br>Used to pay ${worker} and to pay for auctions'),
  ),
  'workers' => array(
    'name'   => clienttranslate("Worker"),
    'db_int' => WORKER,
    'tt'     => clienttranslate('${worker}<br>Worker:<br>Produces resources when assigned to buildings'),
  ),   
  'track' => array(
    'name'   => clienttranslate("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => clienttranslate('${track}<br>Rail Track<br>Produces ${silver} each round'),
  ),
  'wood' => array(
    'name'   => clienttranslate("Wood"),
    'db_int' => WOOD,
    'trade_val' => array('silver'=> 1),
    'tt'     => clienttranslate('${wood}<br>Wood:<br>Required to build some buildings'),
  ),
  'food' => array(
    'name'   => clienttranslate("Food"),
    'db_int' => FOOD,
    'trade_val' => array('silver'=> 2),
    'market' => array('wood'=>1),
    'tt'     => clienttranslate('${food}<br>Food:<br>Required to build some buildings<br>Used to Hire new ${worker}'),
  ),
  'steel' => array(
    'name'   => clienttranslate("Steel"),
    'db_int' => STEEL,
    'trade_val' => array('silver'=> 3),
    'market' => array('food'=>1),
    'tt'     => clienttranslate('${steel}<br>Steel:<br>Required to build some buildings'),
  ),
  'gold' => array(
    'name'   => clienttranslate("Gold"),
    'db_int' => GOLD,
    'trade_val' => array('silver'=> 4),
    'tt'     => clienttranslate('${gold}<br>Gold:<br>Required to build some buildings<br>Can be used to pay Workers / Auction costs(as 5 ${silver})<br>End: Worth ${vp2}'),
  ),
  'copper' => array(
    'name'   => clienttranslate("Copper"),
    'db_int' => COPPER,
    'trade_val' => array('gold'=> 1),
    'tt'     => clienttranslate('${copper}<br>Copper:<br>Required to build some buildings<br>End: Worth ${vp2}'),
  ),
  'cow' => array(
    'name'   => clienttranslate("Livestock"),
    'db_int' => COW,
    'trade_val' => array('gold'=> 1),
    'tt'     => clienttranslate('${cow}<br>Livestock:<br>Required to build some buildings<br>End: Worth ${vp2}'),
  ),
  'loan' => array(
    'name'   => clienttranslate("Debt"),
    'db_int' => LOAN,
    'tt'     => sprintf(clienttranslate('%s<br>Debt:<br>Costs 5 ${silver} (or 1 ${gold}) to pay off<br>End: Penalty for unpaid %s:<br>'.
                '%s lose ${vp}<br>%s lose ${vp3}<br>%s lose ${vp6}<br>%s lose ${vp10}<br> (etc...)'), 
                  '${loan}', '${loan}', '${loan} ${arrow}', '${loan}${loan} ${arrow}', '${loan}${loan}${loan} ${arrow}', '${loan}${loan}${loan}${loan} ${arrow}'),
  ),
  'trade' => array(
    'name'   => clienttranslate("Trade Token"),
    'db_int' => TRADE,
    'tt'     => clienttranslate('${trade}<br>Trade Token:<br> Required for any trade'.
                'Used to Hire new ${worker}'),
  ),
  'vp' => array(
    'name'   => clienttranslate("VP Token"),
    'db_int' => VP,
    'tt'     => clienttranslate('${vp}<br>VP Token:<br>End: Worth 1 VP'),
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array_merge(
  array_fill_keys( 
    array(BLD_HOMESTEAD_YELLOW, BLD_HOMESTEAD_RED, BLD_HOMESTEAD_GREEN, BLD_HOMESTEAD_BLUE, BLD_HOMESTEAD_PURPLE), 
    array(
      'name' => clienttranslate("Homestead"),
      'type' => TYPE_RESIDENTIAL,
      'stage'=> 0,
      'inc'  => array('silver'=>2),
      'slot' => 2,
      's1'   => array('wood'=>1),
      's2'   => array('vp'=>1),
      'amt'  => 0,
  )),
  array(
   BLD_GRAIN_MILL => array(
    'name' => clienttranslate("Grain Mill"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('steel'=>1,'wood'=>1),
    'vp'   => 2,
    'inc'  => array('food'=>1),
    'amt'  => 1,
   ),
   BLD_FARM => array(
    'name' => clienttranslate("Farm"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'slot' => 2,
    's1'   => array('silver'=>2,'trade'=>1),
    's2'   => array('food'=>1),
    'amt'  => 3,
   ),
   BLD_MARKET => array(
    'name' => clienttranslate("Market"),
    'desc' => clienttranslate('Allows trades <br>${trade}${wood} ${arrow}${food}<br>${trade}${food} ${arrow} ${steel}'),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'slot' => 1,
    's1'   => array('silver'=>2),
    'amt'  => 3,
   ),
   BLD_FOUNDRY => array(
    'name' => clienttranslate("Foundry"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array(),
    'slot' => 1,
    's1'   => array('steel'=>1),
    'amt'  => 3,
   ),
   BLD_STEEL_MILL => array(
    'name' => clienttranslate("Steel Mill"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('gold'=>1,'wood'=>2,),
    'inc'  => array('steel'=>1),
    'amt'  => 1,
   ),
   BLD_BOARDING_HOUSE => array(
    'name' => clienttranslate("Boarding House"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>2),
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('silver'=>2),
    'amt'  => 1,
    'on_b' => BUILD_BONUS_PAY_LOAN,
   ),
   BLD_RAILWORKERS_HOUSE => array(
    'name' => clienttranslate("Railworkers House"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>2),
    'vp_b' => VP_B_WRK_TRK,
    'inc'  => array('silver'=>1,'trade'=>1),
    'amt'  => 1,
   ),
   BLD_RANCH => array(
    'name' => clienttranslate("Ranch"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'food'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('cow'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_TRADE,
   ),
   BLD_TRADING_POST => array(
    'name' => clienttranslate("Trading Post"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => clienttranslate("General Store"),
    'desc' => clienttranslate('Whenever you Sell, get an additional ${silver}'),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'amt'  => 2,
   ),
   BLD_GOLD_MINE => array(
    'name' => clienttranslate("Gold Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('gold'=>1),
    'amt'  => 2,
   ),
   BLD_COPPER_MINE => array(
    'name' => clienttranslate("Copper Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1, 'wood'=>2),
    'slot' => 1,
    's1'   => array('copper'=>1),
    'amt'  => 2,
   ),
   BLD_RIVER_PORT => array(
    'name' => clienttranslate("River Port"),
    'desc' => clienttranslate('You may pay for ${copper} or ${cow} in building costs or auction costs using ${gold} instead'),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1),
    'slot' => 3,
    's3'   => array('gold'=>1),
    'amt'  => 2,
   ),
   BLD_CHURCH => array(
    'name' => clienttranslate("Church"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>1,'wood'=>1),
    'vp'   => 10,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_WORKSHOP => array(
    'name' => clienttranslate("Workshop"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('vp'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_WORKER,
   ),
   BLD_DEPOT => array(
    'name' => clienttranslate("Depot"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>1,'wood'=>1,),
    'vp_b' => VP_B_TRACK,
    'inc'  => array('silver'=>2),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_STABLES => array(
    'name' => clienttranslate("Stables"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1),
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('trade'=>1, 'vp'=>1),
    'amt'  => 1,
   ),
   BLD_BANK => array(
    'name' => clienttranslate("Bank"),
    'desc' => clienttranslate('Allows trades <br>${trade} ${arrow} ${silver}<br>'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('copper'=>1, 'steel'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_SPECIAL,
    'inc'  => array('loan'=>-1),
    'amt'  => 1,
   ),
   BLD_MEATPACKING_PLANT => array(
    'name' => clienttranslate("Meatpacking Plant"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('cow'=>1, 'wood'=>1,),
    'vp'   => 2,
    'slot' => 2,
    's1'   => array('vp2'=>1),
    's2'   => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FORGE => array(
    'name' => clienttranslate("Forge"),
    'desc' => clienttranslate('Get ${vp} whenever you build a building (after this one)'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('steel'=>2),
    'vp'   => 1,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_FACTORY => array(
    'name' => clienttranslate("Factory"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1, 'steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_RODEO => array(
    'name' => clienttranslate("Rodeo"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'food'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>'x'),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => clienttranslate("Lawyer"),
    'desc' => clienttranslate('You may overbid others with the same bid value<br>'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'gold'=>1, 'wood'=>1),
    'vp'   => 4,
    'vp_b' => VP_B_COMMERCIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FAIRGROUNDS => array(
    'name' => clienttranslate("Fairgrounds"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'copper'=>1, 'wood'=>2,),
    'vp'   => 6,
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('gold'=>1),
    'amt'  => 1,
   ),
   BLD_DUDE_RANCH => array(
    'name' => clienttranslate("Dude Ranch"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('food'=>1,'wood'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_WORKER,
    'amt'  => 2,
   ),
   BLD_TOWN_HALL => array(
    'name' => clienttranslate("Town Hall"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'wood'=>2,),
    'vp'   => 10,
    'vp_b' => VP_B_COMMERCIAL,
    'amt'  => 1,
   ),
   BLD_TERMINAL => array(
    'name' => clienttranslate("Terminal"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_TRACK,
    'amt'  => 2,
   ),
   BLD_RESTARAUNT => array(
    'name' => clienttranslate("Restaraunt"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1,'wood'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_SPECIAL,
    'amt'  => 2,
   ),
   BLD_TRAIN_STATION => array(
    'name' => clienttranslate("Train Station"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('copper'=>1,'wood'=>1, ),
    'on_b' => BUILD_BONUS_TRACK_AND_BUILD,
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_CIRCUS => array(
    'name' => clienttranslate("Circus"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1,'food'=>2),
    'vp'   => 8,
    'vp_b' => VP_B_WORKER,
    'amt'  => 1,
   ),
   BLD_RAIL_YARD => array(
    'name' => clienttranslate("Rail Yard"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>2),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
));

$this->auction_info = array( 
  1 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
  ),
  2 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  3 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  4 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
  ),
  5 => array(
    'build' => array(TYPE_COMMERCIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  6 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  7 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  8 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  9 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_COPPER_FOR_VP,
  ),
  10 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_COW_FOR_VP,
  ),
  11 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  12 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  13 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  14 => array(
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  15 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
  ),
  16 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
  ),
  17 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  18 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  19 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  20 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  21 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  22 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  23 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  24 => array(
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  25 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  26 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  27 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  28 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  29 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  30 => array(
    'bonus' => AUC_BONUS_6VP_AND_FOOD_VP,
  ),
);