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
        // auction tile bonus 0-no, 1-wrk, 2-wrk_rail, 3-wood->track
                    //  4-copper->vp, 5-cow->vp, 6-food->vp  
        $bonus = array( 0, 0, 0, 0, 1, 1, 1, 0, 4, 5,
                        0, 0, 0, 2, 0, 0, 0, 3, 7, 7,
                        0, 0, 0, 2, 0, 0, 3, 0, 7, 6); 
        $values=array();
        //first auction is in order, 
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

    function getAllAuctionsFromDB(){
        $sql = "SELECT `auction_id` a_id, `position`, `location`,  `build_type`, `bonus` FROM `auctions`"; 
        return ($this->game->getCollectionFromDb( $sql ));
    }

    function updateClientAuctions($round_number){
        $auctions = $this->getCurrentRoundAuctions($round_number);
        $this->game->notifyAllPlayers('updateAuctions', clienttranslate( 'Updating Auctions' ), array(
            'auctions' => $auctions,
            'state' => 'show', ));
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
        $this->game->DbQuery( $sql);
    }

    function doesCurrentAuctionHaveBuildPhase(){
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $sql = "SELECT `build_type` FROM `auctions`  WHERE `location` = '".$auction_no."' AND `position` = '".$round_number."'";
        $type = $this->game->getUniqueValueFromDB( $sql );
        return ($type != 0);
    }


    function getCurrentAuctionBonus(){
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $sql = "SELECT `bonus` FROM `auctions`  WHERE `location` = '".$auction_no."' AND `position` = '".$round_number."'";
        $bonus = $this->game->getUniqueValueFromDB( $sql );
        return ($bonus);
    }

    function setupCurrentAuctionBonus(){
        $next_state = "bonusChoice";
        $active_player = $this->game->getActivePlayerId();
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $sql = "SELECT `bonus` FROM `auctions`  WHERE `location` = ".$auction_no." AND `position` = '".$round_number."'";
        $bonus = $this->game->getUniqueValueFromDB($sql);
        switch($bonus){
            case AUCTION_BONUS_NONE:
                $next_state = 'endBuild';
            break;
            case AUCTION_BONUS_6VP_AND_FOOD_VP:
                $this->game->Resource->updateAndNotifyIncome($active_player, 'vp', 6, 'a:Auction Reward');
            case AUCTION_BONUS_WORKER:
            case AUCTION_BONUS_WORKER_RAIL_ADV:
            case AUCTION_BONUS_WOOD_FOR_TRACK:
            case AUCTION_BONUS_COW_FOR_VP:
            case AUCTION_BONUS_FOOD_FOR_VP:
                $this->game->setGameStateValue( 'auction_bonus', $bonus);
            break;
        }
        $this->game->gamestate->nextState( $next_state );
    }

    /**
     * returns an array of valid build types derived from DB value for current round & auction.
     */
    function getCurrentAuctionBuildTypeOptions(){
        $round_number = $this->game->getGameStateValue('round_number');
        $current_auction = $this->game->getGameStateValue('current_auction');
        $sql = "SELECT `build_type` FROM `auctions` WHERE `location`='".$current_auction."'AND `position`='".$round_number."'";
        $build_type = $this->game->getUniqueValueFromDB( $sql );// the sql value for the building.
        return $this->parseBuildTypeOptions($build_type);
    }
    
    /** returns an array of valid build types from 
     * a bitwise map of build types (how it's stored in sql)
     * '0-None, + 1 RES, +2 COM, +4 IND, +8 SPE'
     * ex: 5 would be IND(4) + RES(1)
     * ex: 1 would be RES(1)
     */
    function parseBuildTypeOptions($build_type) {
        $build_type_options = array();
        if ($build_type %2 == 1){
            $build_type_options[] = TYPE_RESIDENTIAL;
            $build_type -=1;
        }
        if ($build_type %4 == 2){
            $build_type_options[] = TYPE_COMMERCIAL;
            $build_type -=2;
        }
        if ($build_type %8 == 4){
            $build_type_options[] = TYPE_INDUSTRIAL;
            $build_type -=4;
        }
        if ($build_type == 8){
            $build_type_options[] = TYPE_SPECIAL;
        }
        return $build_type_options;
    }

}