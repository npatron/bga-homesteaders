<?php

/*
 * HSDBuilding: a class that handles building related actions.
 */
class HSDAuction extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    function createAuctionTiles($playerCount){

        $sql = "INSERT INTO `auctions` ( `auction_id`, `position`, `location`, `build_type`, `bonus` ) VALUES ";
        // 0-NONE, 1-RES, 2-COM, 4-IND, 8-SPE
        $build = array( 3, 4, 2, 5, 2, 1, 4,15,15,15,
                        1, 4,15, 0, 3, 6,12, 9, 6, 9,
                        1, 2, 4, 0, 1, 2, 4,15, 3, 0);
        $bonus = array( 0, 0, 0, 0, 1, 1, 1, 0, 1, 1,
                        0, 0, 0, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 0, 0, 1, 0, 1, 1); 
        $values=array();
        //first auction is in order, and all face-up
        for ($i = 1; $i <11; $i++){
            $values[] = "('$i','$i','".AUCTION_LOC_DECK1."', '".$build[$i-1]."', '".$bonus[$i-1]."')";
        }

        //second auction has 1-4 , 5-8, and 9-10 shuffled
        $position1 = array('1','2','3','4');
        $position2 = array('5','6','7','8');
        $position3 = array('9','10');
        shuffle($position1);
        shuffle($position2);
        shuffle($position3);
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+11)."','".$position1[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+10]."', '".$bonus[$i+10]."')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+15)."','".$position2[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+14]."', '".$bonus[$i+14]."')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "('".($i+19)."','".$position3[$i]."','".AUCTION_LOC_DECK2."', '".$build[$i+18]."', '".$bonus[$i+18]."')";
        }

        if ($playerCount>3){
            shuffle($position1);
            shuffle($position2);
            shuffle($position3);
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+21)."','".$position1[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+20]."', '".$bonus[$i+20]."')";
            }
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+25)."','".$position2[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+24]."', '".$bonus[$i+24]."')";
            }
            for ($i = 0; $i <2; $i++){
                $values[] = "('".($i+29)."','".$position3[$i]."','".AUCTION_LOC_DECK3."', '".$build[$i+28]."', '".$bonus[$i+28]."')";
            }   
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    function getCurrentRoundAuctions($round_number){
        $sql = "SELECT `auction_id` a_id, `position`, `location`,  `build_type`, `bonus` FROM `auctions` WHERE `location` IN (1,2,3) AND `position`='".$round_number."'"; 
        return ($this->game->getCollectionFromDb( $sql ));
    }
    
    function discardAuctionTile(){
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $this->game->notifyAllPlayers( "updateAuction", _( 'Discard Auction Tile' ), 
                array('auction_no'=>$auction_no, 'state'=>'discard') );
        $sql = "UPDATE `auctions` SET `location`='".AUCTION_LOC_DISCARD."' WHERE `location` = '".$auction_no."' AND position = '".$round_number."'";
        self::DbQuery( $sql);
    }

    function resolveAuctionBonus(){
        $next_state = "bonusChoice";
        $active_player = $this->game->getActivePlayerId();
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $auction_id = self::getUniqueValueFromDB("SELECT `auction_id` FROM `auctions`  WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'");
        switch($auction_id){
            case AUCTION1_5:
            case AUCTION1_6:
            case AUCTION1_7: 
                // worker
                $this->game->addWorker($active_player, _("Auction Tile Bonus"));
                $this->game->setGameStateValue( 'bonus_option', NONE );
                $next_state = "endBuild";
            break;
            case AUCTION2_4:
            case AUCTION3_4:
                $this->game->addWorker( $active_player, "Auction Tile Bonus");
                // worker and rail adv
                $this->game->setGameStateValue( 'phase', PHASE_AUCTION_BONUS);
                $this->game->getRailAdv( $active_player );
                $next_state = 'railBonus';
            break;
            case AUCTION2_8:
            case AUCTION3_7:
                // wood for rail track (not rail advancement)
                $this->game->setGameStateValue( 'bonus_option' , WOOD);
            break;
            // resource for points
            case AUCTION1_9:
                // copper for 4 vp.
                $this->game->setGameStateValue( 'bonus_option' , COPPER);
            break;
            case AUCTION1_10:
                // cow for 4 vp.
                $this->game->setGameStateValue( 'bonus_option' , COW);
            break;
            case AUCTION3_10:
                $this->game->updateAndNotifyIncome($active_player, 'vp', 6, 'Auction Reward');
                // get 6 vp (charity) & get next (food->2VP) -notice no break;
            case AUCTION2_9:
            case AUCTION2_10:
            case AUCTION3_9:
                // trade 1 food for 2 VP.
                $this->game->setGameStateValue( 'bonus_option' , FOOD);
            break;
        }
        $this->game->gamestate->nextState( $next_state );
    }


}