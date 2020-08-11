
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteaderstb implementation : © Nick Patron <patron.nick@gmail.com>
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

-- building_stage 1 (settlement), 2 (settlement or town), 3 (town), 4 (city)
CREATE TABLE IF NOT EXISTS buildings (
  building_id TINYINT NOT NULL AUTO_INCREMENT,
  building_name VARCHAR(20) NOT NULL,
  building_type VARCHAR(20) NOT NULL,
  building_stage TINYINT NOT NULL,
  building_location VARCHAR(20) NOT NULL,
  PRIMARY KEY (building_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- Auction tiles for Auction one
-- for auction one the order is fixed
CREATE TABLE IF NOT EXISTS auction_one (
  id INT(11) NOT NULL AUTO_INCREMENT,
  token_order INT(11) NOT NULL,
  token_state INT(11) NOT NULL DEFAULT '1',
  auction_buy_type VARCHAR(12) NOT NULL,
  auction_bonus VARCHAR(12) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- Auction tiles for Auction two
-- for auction 2-3 the order is random by stage
CREATE TABLE IF NOT EXISTS auction_two (
  id INT(11) NOT NULL AUTO_INCREMENT,
  token_order INT(11) NOT NULL,
  token_state INT(11) NOT NULL DEFAULT '0',
  auction_buy_type VARCHAR(12) NOT NULL,
  auction_bonus VARCHAR(12) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- Auction tiles for Auction three
-- for auction 2-3 the order is random by stage
CREATE TABLE IF NOT EXISTS auction_three (
  id INT(11) NOT NULL AUTO_INCREMENT,
  token_order INT(11) NOT NULL,
  token_state INT(11) NOT NULL DEFAULT '0',
  auction_buy_type VARCHAR(12) NOT NULL,
  auction_bonus VARCHAR(12) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

--- ### PLAYER INFORMATION ###
--- PUBLIC ITEMS ---
--ALTER TABLE `player` ADD `player_first` BOOLEAN NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_workers` INT(11) UNSIGNED NOT NULL DEFAULT '1';
ALTER TABLE `player` ADD `player_railroad_advancement` INT(11) NOT NULL DEFAULT '0';
--- HIDDEN ITEMS ---
ALTER TABLE `player` ADD `player_silver` INT(11) UNSIGNED NOT NULL DEFAULT '6';
ALTER TABLE `player` ADD `player_wood` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_food` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_steel` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_gold` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_copper` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_livestock` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_debt` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_trade_tokens` INT(11) UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_vp_tokens` INT(11) UNSIGNED NOT NULL DEFAULT '0';
