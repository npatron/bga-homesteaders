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
    'tt'     => "<div class='score_token score_silver tt'> </div>".
            clienttranslate("Silver: Used for paying workers and auctions"),
  ),
  'workers' => array(
    'name'   => clienttranslate("Worker"),
    'db_int' => WORKER,
    'tt'     => clienttranslate("Worker: Produces resources when assigned to building "),
  ),   
  'track' => array(
    'name'   => clienttranslate("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => clienttranslate("Track: Produces 1 Silver each round"),
  ),
  'wood' => array(
    'name'   => clienttranslate("Wood"),
    'db_int' => WOOD,
    'tt'     => "<div class='score_token score_wood tt'> </div>".
            clienttranslate("Wood: Required to build some buildings"),
  ),
  'food' => array(
    'name'   => clienttranslate("Food"),
    'db_int' => FOOD,
    'tt'     => "<div class='score_token score_food tt'> </div>".
            clienttranslate("Food: Required to build some buildings, or to hire new workers"),
  ),
  'steel' => array(
    'name'   => clienttranslate("Steel"),
    'db_int' => STEEL,
    'tt'     => "<div class='score_token score_steel tt'> </div>".
            clienttranslate("Steel: Required to build some buildings"),
  ),
  'gold' => array(
    'name'   => clienttranslate("Gold"),
    'db_int' => GOLD,
    'tt'     => "<div class='score_token score_gold tt'> </div>".
            clienttranslate("Gold: Required to build some buildings.  Also can be used to pay costs(as 5 silver). Worth 2VP at end of game"),
  ),
  'copper' => array(
    'name'   => clienttranslate("Copper"),
    'db_int' => COPPER,
    'tt'     => "<div class='score_token score_copper tt'> </div>".
            clienttranslate("Copper: Required to build some buildings.  Worth 2VP at end of game"),
  ),
  'cow' => array(
    'name'   => clienttranslate("Livestock"),
    'db_int' => COW,
    'tt'     => '<div class="score_token score_cow tt"> </div>'.
      clienttranslate("Livestock: Required to build some buildings.  Worth 2VP at end of game"),
  ),
  'loan' => array(
    'name'   => clienttranslate("Debt"),
    'db_int' => LOAN,
    'tt'     => "<div class='score_loan tt'> </div>"
      .clienttranslate("Debt: Costs 5 Silver (or 1 Gold) to pay off.  Worth negative VP at end of game"),
  ),
  'trade' => array(
    'name'   => clienttranslate("Trade Token"),
    'db_int' => TRADE,
    'tt'     => "<div class='score_token score_trade tt'> </div>".
      clienttranslate("Trade: Required for any trade. Also for hiring new workers"),
  ),
  'vp' => array(
    'name'   => clienttranslate("VP Token"),
    'db_int' => VP,
    'tt'     => "<div class='score_token score_vp tt'> </div>".
      clienttranslate("VP-Token: Worth 1-VP at end of game"),
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array(
  BLD_HOMESTEAD_YELLOW => array(
    'name' => clienttranslate("Yellow Homestead"),
    'tt'   => clienttranslate("Yellow Homestead(R): Produces 2 Silver each round. Can be worked to produce Wood, and/or 1-VP Token"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> 0,
    'inc'  => array('silver'=>2),
    'slot' => 2,
    's1'   => array('wood'=>1),
    's1_tt'=> clienttranslate("Produces a Wood"),
    's2'   => array('vp'=>1),
    's2_tt'=> clienttranslate("Produces a VP Token"),
    'amt'  => 0,
   ),
   BLD_HOMESTEAD_RED => array(
    'name' => clienttranslate("Red Homestead"),
    'tt'   => clienttranslate("Red Homestead(R): Produces 2 Silver each round. Can be worked to produce Wood, and/or 1-VP Token"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> 0,
    'inc'  => array('silver'=>2),
    'slot' => 2,
    's1'   => array('wood'=>1),
    's1_tt'=> clienttranslate("Produces a Wood"),
    's2'   => array('vp'=>1),
    's2_tt'=> clienttranslate("Produces a VP Token"),
    'amt'  => 0,
   ),
   BLD_HOMESTEAD_GREEN => array(
    'name' => clienttranslate("Green Homestead"),
    'tt'   => clienttranslate("Green Homestead(R): Produces 2 Silver each round. Can be worked to produce Wood, and/or 1-VP Token"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> 0,
    'inc'  => array('silver'=>2),
    'slot' => 2,
    's1'   => array('wood'=>1),
    's1_tt'=> clienttranslate("Produces a Wood"),
    's2'   => array('vp'=>1),
    's2_tt'=> clienttranslate("Produces a VP Token"),
    'amt'  => 0,
   ),
   BLD_HOMESTEAD_BLUE => array(
    'name' => clienttranslate("Blue Homestead"),
    'tt'   => clienttranslate("Blue Homestead(R): Produces 2 Silver each round. Can be worked to produce Wood, and/or 1-VP Token"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> 0,
    'inc'  => array('silver'=>2),
    'slot' => 2,
    's1'   => array('wood'=>1),
    's1_tt'=> clienttranslate("Produces a Wood"),
    's2'   => array('vp'=>1),
    's2_tt'=> clienttranslate("Produces a VP Token"),
    'amt'  => 0,
   ),
   BLD_GRAIN_MILL => array(
    'name' => clienttranslate("Grain Mill"),
    'tt'   => clienttranslate("Grain Mill(R): Produces 1 Food each round"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1,'steel'=>1),
    'vp'   => 2,
    'inc'  => array('food'=>1),
    'amt'  => 1,
   ),
   BLD_FARM => array(
    'name' => clienttranslate("Farm"),
    'tt'   => clienttranslate("Farm(R): Can produce Food, and/or a Trade Token and 2 Silver"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'slot' => 2,
    's1'   => array('silver'=>2,'trade'=>1),
    's1_tt'=> clienttranslate("Produces a Trade Token and 2 Silver"),
    's2'   => array('food'=>1),
    's2_tt'=> clienttranslate("Produces a Food"),
    'amt'  => 3,
   ),
   BLD_MARKET => array(
    'name' => clienttranslate("Market"),
    'tt'   => clienttranslate("Market(C): Produces a Trade Token each round and can produce 2-Silver"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'slot' => 1,
    's1'   => array('silver'=>2),
    's1_tt'=> clienttranslate("Produces 2 Silver"),
    'amt'  => 3,
   ),
   BLD_FOUNDRY => array(
    'name' => clienttranslate("Foundry"),
    'tt'   => clienttranslate("Foundry(I): Can produce Steel"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array(),
    'slot' => 1,
    's1'   => array('steel'=>1),
    's1_tt'=> clienttranslate("Produces a Steel"),
    'amt'  => 3,
   ),
   BLD_STEEL_MILL => array(
    'name' => clienttranslate("Steel Mill"),
    'tt'   => clienttranslate("Steel Mill(I): Produces 1 Steel each round"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>2,'gold'=>1),
    'inc'  => array('steel'=>1),
    'amt'  => 1,
   ),
   BLD_BOARDING_HOUSE => array(
    'name' => clienttranslate("Boarding House"),
    'tt'   => clienttranslate("Boarding House(R): Produces 2 Silver each round. Pay off 1 Debt on Build. Worth 1-VP per Industrial at end of game"),
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
    'tt'   => clienttranslate("Railworkers House(R): Produces 1-Trade Token and 1-Silver each round. Worth 1-VP per Worker and Track at end of game"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>2),
    'vp_b' => VP_B_WRK_TRK,
    'inc'  => array('trade'=>1, 'silver'=>1),
    'amt'  => 1,
   ),
   BLD_RANCH => array(
    'name' => clienttranslate("Ranch"),
    'tt'   => clienttranslate("Ranch(R): Can produce Livestock"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1,'steel'=>1,'food'=>1),
    'slot' => 1,
    's1'   => array('cow'=>1),
    's1_tt'=> clienttranslate("Produces a ")."{cow}",
    'amt'  => 2,
    'on_b' => BUILD_BONUS_TRADE,
   ),
   BLD_TRADING_POST => array(
    'name' => clienttranslate("Trading Post"),
    'tt'   => clienttranslate("Trading Post(C): Produces 2-Trade Tokens each round"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => clienttranslate("General Store"),
    'tt'   => clienttranslate("General Store(C): Produces 1 Trade Token each round. Whenever you sell, get an additional Silver"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'amt'  => 2,
   ),
   BLD_GOLD_MINE => array(
    'name' => clienttranslate("Gold Mine"),
    'tt'   => clienttranslate("Gold Mine(I): Can produce Gold"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1,'steel'=>1),
    'slot' => 1,
    's1'   => array('gold'=>1),
    's1_tt'=> clienttranslate("Produces a Gold"),
    'amt'  => 2,
   ),
   BLD_COPPER_MINE => array(
    'name' => clienttranslate("Copper Mine"),
    'tt'   => clienttranslate("Copper Mine(I): Can produce Livestock"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>2,'steel'=>1),
    'slot' => 1,
    's1'   => array('copper'=>1),
    's1_tt'=> clienttranslate("Produces a Copper"),
    'amt'  => 2,
   ),
   BLD_RIVER_PORT => array(
    'name' => clienttranslate("River Port"),
    'tt'   => clienttranslate("River Port(I): Can produce Gold. You may pay for Copper or Livestock in Building or Auction costs using Gold instead"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1),
    'slot' => 3,
    's3'   => array('gold'=>1),
    's3_tt'=> clienttranslate("When worked by 2 workers, Produces a Gold"),
    'amt'  => 2,
   ),
   BLD_CHURCH => array(
    'name' => clienttranslate("Church"),
    'tt'   => clienttranslate("Church(R): Produces 2-VP each round"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>1,'steel'=>1,'gold'=>1,'copper'=>1),
    'vp'   => 10,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_WORKSHOP => array(
    'name' => clienttranslate("Workshop"),
    'tt'   => clienttranslate("Workshop(R): Produces VP each round"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('VP'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_WORKER,
   ),
   BLD_DEPOT => array(
    'name' => clienttranslate("Depot"),
    'tt'   => clienttranslate("Depot(C): Produces 2 Silver each Round. When built, gain 1 Railroad Advancement (and Bonus). Worth 1-VP per Track at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('wood'=>1,'steel'=>1),
    'vp_b' => VP_B_TRACK,
    'inc'  => array('silver'=>2),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_BANK => array(
    'name' => clienttranslate("Bank"),
    'tt'   => clienttranslate("Bank(C): Pays off 1 Debt each Round. Allows trading Trade for Silver. Worth 1-VP per Special at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>1,'copper'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_SPECIAL,
    'inc'  => array('loan'=>-1),
    'amt'  => 1,
   ),
   BLD_STABLES => array(
    'name' => clienttranslate("Stables"),
    'tt'   => clienttranslate("Stables(C): Produces 1-VP and 1-Trade Token each round. Worth 1-VP per Residential at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1),
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('trade'=>1, 'vp'=>1),
    'amt'  => 1,
   ),
   BLD_MEATPACKING_PLANT => array(
    'name' => clienttranslate("Meatpacking Plant"),
    'tt'   => clienttranslate("Meatpacking Plant(I): Can produce 2-VP with up to 2 workers each round."),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1,'cow'=>1),
    'vp'   => 2,
    'slot' => 2,
    's1'   => array('vp2'=>1),
    's1_tt'=> clienttranslate("Produces 2-VP"),
    's2'   => array('vp2'=>1),
    's2_tt'=> clienttranslate("Produces 2-VP"),
    'amt'  => 1,
   ),
   BLD_FORGE => array(
    'name' => clienttranslate("Forge"),
    'tt'   => clienttranslate("Forge(I): Can produce 2-VP each round. When built, gain a Railroad Advancement (and Bonus). When any other bulding is built, gain 1-VP"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('steel'=>1),
    'vp'   => 1,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    's1_tt'=> clienttranslate("Produces 2-VP"),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_FACTORY => array(
    'name' => clienttranslate("Factory"),
    'tt'   => clienttranslate("Factory(S): Produces 2-VP each round. Worth 1-VP per Industrial at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('steel'=>2, 'copper'=>1),
    'vp'   => 6,
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_RODEO => array(
    'name' => clienttranslate("Rodeo"),
    'tt'   => clienttranslate("Rodeo(S): Produces 1-Silver per worker (max 5) each round. "),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('food'=>1, 'cow'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>5),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => clienttranslate("Lawyer"),
    'tt'   => clienttranslate("Lawyer(S): Produces 2VP each round. Can outbid others with the same Bid amount. Worth 1-VP per Commercial at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('wood'=>1, 'gold'=>1, 'cow'=>1),
    'vp'   => 4,
    'vp_b' => VP_B_COMMERCIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FAIRGROUNDS => array(
    'name' => clienttranslate("Fairgrounds"),
    'tt'   => clienttranslate("Fairgrounds(S): Produces a Gold each round. Worth 1-VP for each Residential at end of game"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('wood'=>2,'copper'=>1,'cow'=>1),
    'vp'   => 6,
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('gold'=>1),
    'amt'  => 1,
   ),
   BLD_DUDE_RANCH => array(
    'name' => clienttranslate("Dude Ranch"),
    'tt'   => clienttranslate("Dude Ranch(R): Worth 1-VP for each Worker at end of game"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>1,'food'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_WORKER,
    'amt'  => 2,
   ),
   BLD_TOWN_HALL => array(
    'name' => clienttranslate("Town Hall"),
    'tt'   => clienttranslate("Town Hall(R): Worth 1-VP for each Commercial at end of game"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('wood'=>2,'copper'=>1),
    'vp'   => 10,
    'vp_b' => VP_B_COMMERCIAL,
    'amt'  => 1,
   ),
   BLD_TERMINAL => array(
    'name' => clienttranslate("Terminal"),
    'tt'   => clienttranslate("Terminal(C): Worth 1-VP for each Track at end of game"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_TRACK,
    'amt'  => 2,
   ),
   BLD_RESTARAUNT => array(
    'name' => clienttranslate("Restaraunt"),
    'tt'   => clienttranslate("Restaraunt(C): Worth 1-VP for each Special at end of game"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('wood'=>1,'cow'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_SPECIAL,
    'amt'  => 2,
   ),
   BLD_TRAIN_STATION => array(
    'name' => clienttranslate("Train Station"),
    'tt'   => clienttranslate("Train Station(I): When Built, you gain 1 Track and may Build Any other building"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_TRACK_AND_BUILD,
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_CIRCUS => array(
    'name' => clienttranslate("Circus"),
    'tt'   => clienttranslate("Circus(S): Worth 1-VP for each worker at end of game"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('food'=>2,'cow'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_WORKER,
    'amt'  => 1,
   ),
   BLD_RAIL_YARD => array(
    'name' => clienttranslate("Rail Yard"),
    'tt'   => clienttranslate("Rail Yard(S): Worth 1-VP for each Building at game end"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('steel'=>2,'gold'=>1,'copper'=>1),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
);

$this->R_html = '<span aria="Residential" class="font_res">'._("Residential").'</span>';
$this->C_html = '<span aria="Commercial" class="font_com">'._("Commercial").'</span>';
$this->I_html = '<span aria="Industrial" class="font_ind">'._("Industrial").'</span>';
$this->S_html = '<span aria="Special" class="font_spe">'._("Special").'</span>';
$this->A_html = '<span class="font_res">'._("A").'</span><span class="font_com">'._("N").'</span><span class="font_ind">'._("Y").'</span>';
$this->pre_auc1 = '<span class="font_a1">';
$this->pre_auc2 = '<span class="font_a2">';
$this->pre_auc3 = '<span class="font_a3">';
$this->end_span = '</span>';
$this->wrk_html = '<span aria="worker" title="worker" class="log_worker token_inline"></span>';
$this->wood_html= '<span aria="wood" title="wood" class="log_wood token_inline"></span>';
$this->food_html= '<span aria="food" title="food" class="log_food token_inline"></span>';
$this->copper_html= '<span aria="copper" title="copper" class="log_copper token_inline"></span>';
$this->cow_html= '<span aria="cow" title="cow" class="log_cow token_inline"></span>';
$this->vp2_html= '<span aria="vp2" title="vp2" class="log_vp2 token_inline"></span>';
$this->vp4_html= '<span aria="vp4" title="vp4" class="log_vp4 token_inline"></span>';
$this->vp6_html= '<span aria="vp6" title="vp6" class="log_vp6 token_inline"></span>';
$this->auction_info = array( 
  1 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc1._("Round 1").$this->end_span._(" Build: ").$this->R_html." ".$this->C_html,
  ),
  2 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc1._("Round 2").$this->end_span._(" Build: ").$this->I_html,
  ),
  3 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc1._("Round 3").$this->end_span._(" Build: ").$this->C_html,
  ),
  4 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc1._("Round 4").$this->end_span._(" Build: ").$this->R_html." ".$this->I_html,
  ),
  5 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc1._("Round 5").$this->end_span._(" Build: ").$this->C_html._(". May Hire ").$this->wrk_html._(" (Free)"),
    'bonus' => AUC_BONUS_WORKER,
  ),
  6 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => $this->pre_auc1._("Round 6").$this->end_span._(" Build: ").$this->R_html._(". May Hire ").$this->wrk_html._(" (Free)"),
    'bonus' => AUC_BONUS_WORKER,
  ),
  7 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc1._("Round 7").$this->end_span._(" Build: ").$this->I_html._(". May Hire ").$this->wrk_html._(" (Free)"),
    'bonus' => AUC_BONUS_WORKER,
  ),
  8 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc1._("Round 8").$this->end_span._(" Build: ").$this->A_html,
  ),
  9 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc1._("Round 9").$this->end_span._(" Build: ").$this->A_html._(". May trade ").$this->copper_html._(" for ").$this->vp4_html,
    'bonus' => AUC_BONUS_COPPER_FOR_VP,
  ),
  10 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc1._("Round 10").$this->end_span._(" Build: ").$this->A_html._(". May trade ").$this->cow_html._(" for ").$this->vp4_html,
    'bonus' => AUC_BONUS_COW_FOR_VP,
  ),
  11 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => $this->pre_auc2._("Settlement").$this->end_span._(" Build: ").$this->R_html,
  ),
  12 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc2._("Settlement").$this->end_span._(" Build: ").$this->I_html,
  ),
  13 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc2._("Settlement").$this->end_span._(" Build: ").$this->A_html,
  ),
  14 => array(
    'tt'    => $this->pre_auc2._("Settlement").$this->end_span._(" No Build.  May Hire ").$this->wrk_html._(" (Free) & Advance the Railroad Track"),
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  15 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc2._("Town").$this->end_span._(" Build: ").$this->R_html.' '.$this->C_html,
  ),
  16 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc2._("Town").$this->end_span._(" Build: ").$this->I_html.' '.$this->C_html,
  ),
  17 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc2._("Town").$this->end_span._(" Build: ").$this->I_html.' '.$this->S_html,
  ),
  18 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc2._("Town").$this->end_span._(" Build: ").$this->R_html.' '.$this->S_html._(". May trade ").$this->wood_html._(" for a Track"),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  19 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc2._("City").$this->end_span._(" Build: ").$this->C_html.' '.$this->I_html._(". May trade ").$this->food_html._(" for ").$this->vp2_html,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  20 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc2._("City").$this->end_span._(" Build: ").$this->R_html.' '.$this->S_html._(". May trade ").$this->food_html._(" for ").$this->vp2_html,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  21 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => $this->pre_auc3._("Settlement").$this->end_span._(" Build: ").$this->R_html,
  ),
  22 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc3._("Settlement").$this->end_span._(" Build: ").$this->C_html,
  ),
  23 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc3._("Settlement").$this->end_span._(" Build: ").$this->I_html,
  ),
  24 => array(
    'tt'    => $this->pre_auc3._("Settlement").$this->end_span._(" No Build. May Hire ").$this->wrk_html._(" (Free) & Advance the Railroad Track"),
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  25 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'tt'    => $this->pre_auc3._("Town").$this->end_span._(" Build: ").$this->R_html,
  ),
  26 => array(
    'build' => array(TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc3._("Town").$this->end_span._(" Build: ").$this->C_html,
  ),
  27 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'tt'    => $this->pre_auc3._("Town").$this->end_span._(" Build: ").$this->I_html._(". May trade ").$this->wood_html._(" for a Track"),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  28 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'tt'    => $this->pre_auc3._("Town").$this->end_span._(" Build: ").$this->A_html,
  ),
  29 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'tt'    => $this->pre_auc3._("City").$this->end_span._(" Build: ").$this->R_html.' '.$this->C_html._(". May trade ").$this->food_html._(" for ").$this->vp2_html,
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  30 => array(
    'tt'    => $this->pre_auc3._("City").$this->end_span._(" No Build:  Gain ").$this->vp6_html._(" May trade ").$this->food_html._(" for ").$this->vp2_html,    
    'bonus' => AUC_BONUS_6VP_AND_FOOD_VP,
  ),
  
);
