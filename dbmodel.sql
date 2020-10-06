
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteaderstb implementation : © Nick Patron <nick.theboot@gmail.com>
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
ALTER TABLE `player` ADD `bid_loc`  INT(2) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Auction slot: 1-9 A1, 11-19 A2, 21-29 A3';
ALTER TABLE `player` ADD `rail_adv` INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'rail_adv 0-5';
ALTER TABLE `player` ADD `outbid`   INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT '0 if not, 1 if outbid';
ALTER TABLE `player` ADD `paid`     INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'tracks if has recieved income, yet 0-No 1-Yes'; 

CREATE TABLE IF NOT EXISTS `workers` (
  `worker_key`    INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id`     INT(8) UNSIGNED NOT NULL COMMENT 'Player controlling the worker',
  `building_key`  INT(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Building working at',
  `building_slot` INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Which slot in buiding',
  `selected`      INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'selected:1 or not:0',
  PRIMARY KEY (`worker_key`)
) ENGINE=InnoDB AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `tracks` (
  `rail_key`  INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` INT(8) UNSIGNED NOT NULL COMMENT 'Player owning the track',
  PRIMARY KEY (`rail_key`)
) ENGINE=InnoDB AUTO_INCREMENT=1;


CREATE TABLE IF NOT EXISTS `buildings` (
  `building_key`  INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `building_id`   INT(2) UNSIGNED NOT NULL             COMMENT 'Identity of Building',
  `building_type` INT(1) UNSIGNED NOT NULL             COMMENT 'type: 0-res, 1-com, 2-Ind, 3-Sp',
  `stage`         INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Stage: 0-home, 1-sett, 2-(sett or town), 3-town, 4-city',
  `cost`          VARCHAR(16)     NOT NULL DEFAULT '0' COMMENT 'cost: list of costs (0-non, 1-wood, 2-steel,3-gold,4-copper,5-food,6-cow,7-debt)',
  `location`      INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'location: 0-future, 1-building offer, 2-player, 3-discard',
  `player_id`     INT(8) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Player owning the building',
  `worker_slot`   INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'worker_slots, 0, 1, 2, 3-double slot',
  `b_vp`          INT(2) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'points (non variable points)',
  PRIMARY KEY (`building_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- Auction tiles 
CREATE TABLE IF NOT EXISTS `auctions` (
  `auction_id`       INT(2) UNSIGNED NOT NULL COMMENT 'Identity of Auction tile',
  `position`         INT(2) UNSIGNED NOT NULL COMMENT 'position of Auction in Deck (1-10)',
  `location`         INT(1) UNSIGNED NOT NULL COMMENT 'location: 0-discard, 1-Auction-1, 2-Auction-2, 3-Auction-3',
--  `state`            INT(1) UNSIGNED NOT NULL COMMENT 'state: 0-face-Down, 1-face-Up',
  `build_type`       INT(2) UNSIGNED DEFAULT 0 NOT NULL COMMENT '0-None, + 1 RES, +2 COM, +4 IND, +8 SPE',
  `bonus`            INT(1) UNSIGNED DEFAULT 0 NOT NULL,
  PRIMARY KEY (`auction_id`)
) ENGINE=InnoDB ;

CREATE TABLE IF NOT EXISTS `resources` (
  `player_id`  INT(8) UNSIGNED NOT NULL,
  `silver`     INT(3) UNSIGNED NOT NULL DEFAULT '6',
  `workers`    INT(3) UNSIGNED NOT NULL DEFAULT '1',
  `track`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `wood`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `food`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `steel`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `gold`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `copper`     INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `cow`        INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `loan`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `trade`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `vp`         INT(3) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB;

--- for logging purposes, can remove once I have it working.
CREATE TABLE IF NOT EXISTS `log` (
  `log_id`    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `round`     INT(11) NOT NULL,
  `player_id` INT(11) NOT NULL,
  `move_id`   INT(11) NOT NULL,
  `action`    VARCHAR(16) NOT NULL,
  `piece_id`  INT(11),
  `action_arg` JSON,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
