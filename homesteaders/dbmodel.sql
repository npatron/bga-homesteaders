
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- Homesteaders implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

--- ### PLAYER INFORMATION ###
--- Workers
ALTER TABLE `player` ADD `workers` tinyint NOT NULL DEFAULT '0';
---
ALTER TABLE 'player' ADD 'railroadAdvancement' tinying NOT NULL DEFAULT '0';
--- Silver
ALTER TABLE `player` ADD `silver` tinyint NOT NULL DEFAULT '0';
--- Wood
ALTER TABLE `player` ADD `wood` tinyint NOT NULL DEFAULT '0';
--- Food
ALTER TABLE `player` ADD `food` tinyint NOT NULL DEFAULT '0';
--- Steel
ALTER TABLE `player` ADD `steel` tinyint NOT NULL DEFAULT '0';
--- Gold
ALTER TABLE `player` ADD `gold` tinyint NOT NULL DEFAULT '0'; 
--- Copper
ALTER TABLE `player` ADD `copper`  tinyint NOT NULL DEFAULT '0'; 
--- Adorable Cow Figurines
ALTER TABLE `player` ADD 'livestock'  tinyint NOT NULL DEFAULT '0'; 
--- Debt chits
ALTER TABLE `player` ADD `debt` tinyint NOT NULL DEFAULT '0'; 
--- Trade chits
ALTER TABLE `player` ADD `tradeTokens` tinyint NOT NULL DEFAULT '0'; 
--- Victory point chits
ALTER TABLE `player` ADD `VictoryPointTokens` tinyint NOT NULL DEFAULT '0'; 

--- Do buildings need to go in the database? Probably

--- Let's count railroad tiles as a building 
 CREATE TABLE IF NOT EXISTS `building` (
   `building_id` int(10),
   `building_type` varchar(16) NOT NULL,
   `building_type_arg` int(11) NOT NULL,
   'building_age' varchar(16) NOT NULL,
   'building_age_arg' int(11) NOT NULL,
   `building_location` varchar(16) NOT NULL,
   `building_location_arg` int(11) NOT NULL,
   PRIMARY KEY (`building_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

 CREATE TABLE IF NOT EXISTS `auctionTiles` (
   `tile_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `tile_age` varchar(16) NOT NULL,
   `tile_age_arg` int(11) NOT NULL,
   'tile_pile' int(11) NOT NULL,
   'tile_pile_arg' int(11) NOT NULL,
   'tile_state' int(10) NOT NULL,
    PRIMARY KEY (`tile_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



-- CREATE TABLE IF NOT EXISTS `card` (
--   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
--   `card_type` varchar(16) NOT NULL,
--   `card_type_arg` int(11) NOT NULL,
--   `card_location` varchar(16) NOT NULL,
--   `card_location_arg` int(11) NOT NULL,
--   PRIMARY KEY (`card_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
