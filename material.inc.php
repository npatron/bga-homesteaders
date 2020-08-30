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


/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);


*/

$this->workerSlots = array(
 '1_1' => array(
  'name' => clienttranslate("Yellow homestead Slot 1"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 '1_2' => array(
  'name' => clienttranslate("Yellow homestead Slot 2"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 '2_1' => array(
  'name' => clienttranslate("Red homestead Slot 1"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 '2_2' => array(
  'name' => clienttranslate("Red homestead Slot 2"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 '3_1' => array(
  'name' => clienttranslate("Green homestead Slot 1"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 '3_2' => array(
  'name' => clienttranslate("Green homestead Slot 2"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 '4_1' => array(
  'name' => clienttranslate("Blue homestead Slot 1"),
  'tooltip' => clienttranslate("Homestead: produces a Wood."),
  'rules'=>"1,0,W",
 ),
 '4_2' => array(
  'name' => clienttranslate("Blue homestead Slot 2"),
  'tooltip' => clienttranslate("Homestead: produces a VP."),
  'rules'=>"1,0,V",
 ),
 '6_1' => array(
  'name' => clienttranslate("Farm slot 1"),
  'tooltip' => clienttranslate("produce a Trade chit and 2 silver."),
  'rules'=>"1,0,TQQ",
 ),
 '6_2' => array(
  'name' => clienttranslate("Farm Slot 2"),
  'tooltip' => clienttranslate("Farm: produce a Food."),
  'rules'=>"1,0,F",
 ),
 '7_1' => array(
  'name' => clienttranslate("Market"),
  'tooltip' => clienttranslate("Market: produce 2 silver."),
  'rules'=>"1,0,QQ",
 ),
 '8_1' => array(
  'name' => clienttranslate("Foundry"),
  'tooltip' => clienttranslate("Foundry: produce a steel."),
  'rules'=>"1,0,S",
 ),
 '12_1' => array(
  'name' => clienttranslate("Ranch"),
  'tooltip' => clienttranslate("Ranch: produce a Livestock."),
  'rules'=>"1,0,L",
 ),
 '15_1' => array(
  'name' => clienttranslate("Gold Mine"),
  'tooltip' => clienttranslate("Gold Mine: produce a Gold."),
  'rules'=>"1,0,G",
 ),
 '16_1' => array(
  'name' => clienttranslate("Copper Mine"),
  'tooltip' => clienttranslate("Copper Mine: produce a Copper."),
  'rules'=>"1,0,C",
 ),
 '17_3' => array(
  'name' => clienttranslate("River Port"),
  'tooltip' => clienttranslate("River Port: Use 2 workers to produce a Gold."),
  'rules'=>"2,0,G",
 ),
 '23_1' => array(
  'name' => clienttranslate("Meatpacking Plant slot 1"),
  'tooltip' => clienttranslate("Meatpacking Plant: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 '23_2' => array(
  'name' => clienttranslate("Meatpacking Plant slot 2"),
  'tooltip' => clienttranslate("Meatpacking Plant: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 '24_1' => array(
  'name' => clienttranslate("Forge"),
  'tooltip' => clienttranslate("Forge: produce 2 VPs."),
  'rules'=>"1,0,VV",
 ),
 );




