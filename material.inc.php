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
 * homesteaderstb game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);


*/

$this->workerSlots = array(

 'homestead_red_slot1' => array(
  'name' => clienttranslate("produce Wood"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 'homestead_red_slot2' => array(
  'name' => clienttranslate("Produce VP"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 'homestead_blue_slot1' => array(
  'name' => clienttranslate("produce Wood"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 'homestead_blue_slot2' => array(
  'name' => clienttranslate("Produce VP"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 'homestead_green_slot1' => array(
  'name' => clienttranslate("produce Wood"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 'homestead_green_slot2' => array(
  'name' => clienttranslate("Produce VP"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 'homestead_yellow_slot1' => array(
  'name' => clienttranslate("produce Wood"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 'homestead_yellow_slot2' => array(
  'name' => clienttranslate("Produce VP"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 'farm1_slot1' => array(
  'name' => clienttranslate("Produce Trade token and 2 silver"),
  'tooltip' => clienttranslate("Farm: produce a Trade chit and 2 silver."),
  'rules'=>"1,0,TQQ",
 ),
 'farm1_slot2' => array(
  'name' => clienttranslate("Produce a Food"),
  'tooltip' => clienttranslate("Farm: produce a Food."),
  'rules'=>"1,0,F",
 ),
 'farm2_slot1' => array(
  'name' => clienttranslate("Produce Trade token and 2 silver"),
  'tooltip' => clienttranslate("Farm: produce a Trade chit and 2 silver."),
  'rules'=>"1,0,TQQ",
 ),
 'farm2_slot2' => array(
  'name' => clienttranslate("Produce a Food"),
  'tooltip' => clienttranslate("Farm: produce a Food."),
  'rules'=>"1,0,F",
 ),
 'farm3_slot1' => array(
  'name' => clienttranslate("Produce Trade token and 2 silver"),
  'tooltip' => clienttranslate("Farm: produce a Trade chit and 2 silver."),
  'rules'=>"1,0,TQQ",
 ),
 'farm3_slot2' => array(
  'name' => clienttranslate("Produce a Food"),
  'tooltip' => clienttranslate("Farm: produce a Food."),
  'rules'=>"1,0,F",
 ),
 'market1_slot' => array(
  'name' => clienttranslate("Produce 2 silver"),
  'tooltip' => clienttranslate("Market: produce 2 silver."),
  'rules'=>"1,0,QQ",
 ),
 'market2_slot' => array(
  'name' => clienttranslate("Produce 2 silver"),
  'tooltip' => clienttranslate("Market: produce 2 silver."),
  'rules'=>"1,0,QQ",
 ),
 'market3_slot' => array(
  'name' => clienttranslate("Produce 2 silver"),
  'tooltip' => clienttranslate("Market: produce 2 silver."),
  'rules'=>"1,0,QQ",
 ),
 'Foundry1_slot' => array(
  'name' => clienttranslate("Produce a Steel"),
  'tooltip' => clienttranslate("Foundry: produce a steel."),
  'rules'=>"1,0,Ss",
 ),
 'Foundry2_slot' => array(
  'name' => clienttranslate("Produce a Steel"),
  'tooltip' => clienttranslate("Foundry: produce a steel."),
  'rules'=>"1,0,S",
 ),
 'Foundry3_slot' => array(
  'name' => clienttranslate("Produce a Steel"),
  'tooltip' => clienttranslate("Foundry: produce a steel."),
  'rules'=>"1,0,S",
 ),
 'Ranch1_slot' => array(
  'name' => clienttranslate("Produce a Cow"),
  'tooltip' => clienttranslate("Ranch: produce a Cow."),
  'rules'=>"1,0,L",
 ),
 'Ranch2_slot' => array(
  'name' => clienttranslate("Produce a Cow"),
  'tooltip' => clienttranslate("Ranch: produce a Cow."),
  'rules'=>"1,0,L",
 ),
 'GoldMine1_slot' => array(
  'name' => clienttranslate("Produce a Gold"),
  'tooltip' => clienttranslate("Gold Mine: produce a Gold."),
  'rules'=>"1,0,G",
 ),
 'GoldMine2_slot' => array(
  'name' => clienttranslate("Produce a Gold"),
  'tooltip' => clienttranslate("Gold Mine: produce a Gold."),
  'rules'=>"1,0,G",
 ),
 'CopperMine1_slot' => array(
  'name' => clienttranslate("Produce a Copper"),
  'tooltip' => clienttranslate("Copper Mine: produce a Copper."),
  'rules'=>"1,0,C",
 ),
 'CopperMine2_slot' => array(
  'name' => clienttranslate("Produce a Copper"),
  'tooltip' => clienttranslate("Copper Mine: produce a Copper."),
  'rules'=>"1,0,C",
 ),
 'RiverPort1_slot' => array(
  'name' => clienttranslate("Use 2 workers to produce a Gold"),
  'tooltip' => clienttranslate("River Port: Use 2 workers to produce a Gold."),
  'rules'=>"1,0,C",
 ),
 'RiverPort2_slot' => array(
  'name' => clienttranslate("Use 2 workers to produce a Gold"),
  'tooltip' => clienttranslate("River Port: use 2 workers to produce a Gold."),
  'rules'=>"2,0,G",
 ),
 'Meatpacking_plant_slot1' => array(
  'name' => clienttranslate("Meatpacking Plant"),
  'tooltip' => clienttranslate("Meatpacking Plant: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 'Meatpacking_plant_slot2' => array(
  'name' => clienttranslate("Meatpacking Plant"),
  'tooltip' => clienttranslate("Meatpacking Plant: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 'Forge_slot' => array(
  'name' => clienttranslate("Forge"),
  'tooltip' => clienttranslate("Forge: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 );




