
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

-- This color name is used to create css classes
ALTER TABLE `player` ADD `color_name` VARCHAR(16) NOT NULL DEFAULT ' ';

CREATE TABLE IF NOT EXISTS buildings (
  `building_key` INT(3) NOT NULL AUTO_INCREMENT,
  `building_id`  INT(2) NOT NULL             COMMENT 'Identity of Building',
  `type`         INT(1) NOT NULL             COMMENT 'type: 0-res, 1-com, 2-Ind, 3-Sp',
  `stage`        INT(1) NOT NULL             COMMENT 'Stage: 0-home, 1-sett, 2-(sett or town), 3-town, 4-city',
  `location`     INT(1) NOT NULL DEFAULT '0' COMMENT 'location: 0-future, 1-building offer, 2-player, 3-discard',
  `player_id`    INT(8) NOT NULL DEFAULT '0' COMMENT 'Player owning the building',
  PRIMARY KEY (`building_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- Auction tiles 
CREATE TABLE IF NOT EXISTS auction_tiles (
  `auction_key` INT(2) NOT NULL AUTO_INCREMENT,
  `auction_id`  INT(2) NOT NULL COMMENT 'Identity of Auction tile',
  `order`       INT(2) NOT NULL COMMENT 'order of Auction in Deck (1-10)',
  `location`    INT(1) NOT NULL COMMENT 'location: 0-discard, 1-Auction-1, 2-Auction-2, 3-Auction-3',
  `state`       INT(1) NOT NULL COMMENT 'state: 0-face-Down, 1-face-Up',
  PRIMARY KEY (`auction_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS resources ()
  `player_id`    INT(8) UNSIGNED NOT NULL,
  `silver`       INT(3) UNSIGNED NOT NULL DEFAULT '6',
  `workers`      INT(3) UNSIGNED NOT NULL DEFAULT '1',
  `rail_adv`     INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `rail_tiles`   INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `wood`         INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `food`         INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `steel`        INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `gold`         INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `copper`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `cow`          INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `debt`         INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `trade_tokens` INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `vp_tokens`    INT(3) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;