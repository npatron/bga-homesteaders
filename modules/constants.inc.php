<?php

  define("AUCTION_LOC_DISCARD", 0);
  define("AUCTION_LOC_DECK1",   1);
  define("AUCTION_LOC_DECK2",   2);
  define("AUCTION_LOC_DECK3",   3);
  // Auction tiles
  define("AUCTION1_1",  1);
  define("AUCTION1_2",  2);
  define("AUCTION1_3",  3);
  define("AUCTION1_4",  4);
  define("AUCTION1_5",  5);
  define("AUCTION1_6",  6);
  define("AUCTION1_7",  7);
  define("AUCTION1_8",  8);
  define("AUCTION1_9",  9);
  define("AUCTION1_10", 10);

  define("AUCTION2_1",  11);
  define("AUCTION2_2",  12);
  define("AUCTION2_3",  13);
  define("AUCTION2_4",  14);
  define("AUCTION2_5",  15);
  define("AUCTION2_6",  16);
  define("AUCTION2_7",  17);
  define("AUCTION2_8",  18);
  define("AUCTION2_9",  19);
  define("AUCTION2_10", 20);

  define("AUCTION3_1",  21);
  define("AUCTION3_2",  22);
  define("AUCTION3_3",  23);
  define("AUCTION3_4",  24);
  define("AUCTION3_5",  25);
  define("AUCTION3_6",  26);
  define("AUCTION3_7",  27);
  define("AUCTION3_8",  28);
  define("AUCTION3_9",  29);
  define("AUCTION3_10", 30);

  // Buildings
  define("BUILDING_HOMESTEAD_YELLOW", 1);
  define("BUILDING_HOMESTEAD_RED", 2);
  define("BUILDING_HOMESTEAD_GREEN", 3);
  define("BUILDING_HOMESTEAD_BLUE", 4);
  // Settlement
  define("BUILDING_GRAIN_MILL", 5);
  define("BUILDING_FARM" ,      6);
  define("BUILDING_MARKET" ,    7);
  define("BUILDING_FOUNDRY" ,   8);
  define("BUILDING_STEEL_MILL", 9);
  // Settlement or TOWN
  define("BUILDING_BOARDING_HOUSE" ,   10);
  define("BUILDING_RAILWORKERS_HOUSE", 11);
  define("BUILDING_RANCH",             12);
  define("BUILDING_TRADING_POST",      13);
  define("BUILDING_GENERAL_STORE",     14);
  define("BUILDING_GOLD_MINE",         15);
  define("BUILDING_COPPER_MINE",       16);
  define("BUILDING_RIVER_PORT",        17);
  // Town
  define("BUILDING_CHURCH",            18);
  define("BUILDING_WORKSHOP",          19);
  define("BUILDING_DEPOT",             20);
  define("BUILDING_STABLES",           21);
  define("BUILDING_BANK",              22);
  define("BUILDING_MEATPACKING_PLANT", 23);
  define("BUILDING_FORGE",             24);
  define("BUILDING_FACTORY",           25);
  define("BUILDING_RODEO",             26);
  define("BUILDING_LAWYER",            27);
  define("BUILDING_FAIRGROUNDS",       28);
  // City
  define("BUILDING_DUDE_RANCH",    29);
  define("BUILDING_TOWN_HALL",     30);
  define("BUILDING_TERMINAL",      31);
  define("BUILDING_RESTARAUNT",    32);
  define("BUILDING_TRAIN_STATION", 33);
  define("BUILDING_CIRCUS",        34);
  define("BUILDING_RAIL_YARD",     35);  
  define("FIRST_PLAYER_TILE",      36);
  // building location mapping
  define("BUILDING_LOC_FUTURE",  0);
  define("BUILDING_LOC_OFFER",   1);
  define("BUILDING_LOC_PLAYER",  2);
  define("BUILDING_LOC_DISCARD", 3);
  // building available to build stages
  define("STAGE_SETTLEMENT", 1);
  define("STAGE_SETTLEMENT_TOWN", 2);
  define("STAGE_TOWN", 3);
  define("STAGE_CITY", 4);
  // Building Types
  define("TYPE_RESIDENTIAL", 0);
  define("TYPE_COMMERCIAL",  1);
  define("TYPE_INDUSTRIAL",  2);
  define("TYPE_SPECIAL",     3);

  //resources
  define("NONE",     0);
  define("WOOD",     1);
  define("STEEL",    2);
  define("GOLD",     3);
  define("COPPER",   4);
  define("FOOD",     5);
  define("COW",      6);
  define("TRADE",    7);
  define("TRACK",    8);
  define("WORKER",   9);
  define("VP",       10);
  define("SILVER",   11);
  define("LOAN",     12);

  // Bid location mapping
  define("NO_BID",     0);
  define("BID_A1_B3",  1);
  define("BID_A1_B4",  2);
  define("BID_A1_B5",  3);
  define("BID_A1_B6",  4);
  define("BID_A1_B7",  5);
  define("BID_A1_B9",  6);
  define("BID_A1_B12", 7);
  define("BID_A1_B16", 8);
  define("BID_A1_B21", 9);
  define("OUTBID",     10);
  define("BID_A2_B3",  11);
  define("BID_A2_B4",  12);
  define("BID_A2_B5",  13);
  define("BID_A2_B6",  14);
  define("BID_A2_B7",  15);
  define("BID_A2_B9",  16);
  define("BID_A2_B12", 17);
  define("BID_A2_B16", 18);
  define("BID_A2_B21", 19);
  define("BID_PASS",   20);
  define("BID_A3_B3",  21);
  define("BID_A3_B4",  22);
  define("BID_A3_B5",  23);
  define("BID_A3_B6",  24);
  define("BID_A3_B7",  25);
  define("BID_A3_B9",  26);
  define("BID_A3_B12", 27);
  define("BID_A3_B16", 28);
  define("BID_A3_B21", 29);

  // phases that caused rail bonus.
  define ("PHASE_BID_PASS" ,      1);
  define ("PHASE_BUILD_BONUS" ,   2);
  define ("PHASE_AUCTION_BONUS" , 3);

