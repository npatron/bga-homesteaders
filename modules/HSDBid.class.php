<?php

/*
 * HSDBid: a class that allows handles bid related actions.
 */
class HSDBid extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    function clearBids(){
        self::DbQuery( "UPDATE `resources` SET `bid_loc`= '0' " );
        $this->game->setGameStateValue('last_bidder', 0);
        $this->game->setGameStateValue('players_passed', 0);
    }

    function canPlayerBid($player_id) {
        $sql = "SELECT `bid_loc` FROM `resources` WHERE `player_id`='".$player_id."'";
        $bid_location = self::getUniqueValueFromDB( $sql );
        if ($bid_location == NO_BID || 
            $bid_location == OUTBID) {
            return true;
        } 
        return false;
    }

    public function getBidCost($bid_location){
        $bid_index = ($bid_location % 10);
        $bid_cost_array = array(
            1 => 3, 
            2 => 4,
            3 => 5,
            4 => 6,
            5 => 7,
            6 => 9,
            7 => 12,
            8 => 16,
            9 => 21,
        );
        return ($bid_cost_array[$bid_index]);
    }

    public function getWinnerOfAuction() 
    {
        $current_auction = $this->game->getGameStateValue( 'current_auction' );
        $sql = "SELECT `player_id`, `bid_loc` FROM `resources`";
        $bids = self::getCollectionFromDB( $sql );
        foreach($bids as $player_id => $bid){ 
            if ($current_auction == 1 && $bid['bid_loc'] >= BID_A1_B3 && $bid['bid_loc'] <= BID_A1_B21 ){
                return $player_id;
            } if ($current_auction == 2 && $bid['bid_loc'] >= BID_A2_B3 && $bid['bid_loc'] <= BID_A2_B21 ){
                return $player_id;
            } if ($current_auction == 3  && $bid['bid_loc'] >= BID_A3_B3 && $bid['bid_loc'] <= BID_A3_B21 ){
                return $player_id;
            }
        }
        return 0;
    }

    public function passBid(){
        $player_id = $this->game->getActivePlayerId();
        $players_passed = $this->game->getGameStateValue('players_passed');
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} passes'), array (
                'player_id' => $player_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$player_id]['player_name'],
                'bid_location'=> BID_PASS ));
        $sql = "UPDATE `resources` SET `bid_loc` = '".BID_PASS."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
        $this->game->setGameStateValue('players_passed', ++$players_passed);
        $this->game->setGameStateValue('phase', 2);
        $this->game->getRailAdv($player_id);
    }

    public function confirmBid($bid_location){
        $active_player = $this->game->getActivePlayerId();
        $valid_bids = $this->getValidBids($active_player);
        if (in_array($bid_location, $valid_bids)){// valid bid
            $this->makeBid($bid_location, $active_player);
            $this->game->setGameStateValue('last_bidder', $active_player);
        } else {
            throw new BgaUserException( _("Invalid Bid Selection") );
        }
    }

    public function outbidPlayer($player_id) {
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} is outbid'), array (
                'player_id' => $player_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$player_id]['player_name'],
                'bid_location'=> OUTBID));
        $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
        $outbid_byid = $this->game->getActivePlayerId();
        $this->game->Log->outbidPlayer($player_id, $outbid_byid);
    }

    public function makeBid($bid_location, $player_id){
        // determine outbids (if any).
        $auction_bid_start = 0;
        if ($bid_location > 0 && $bid_location < 10){
            $auction_bid_start = 1;
        } else if ($bid_location > 10 && $bid_location < 20) {
            $auction_bid_start = 11;
        } else if ($bid_location > 20 && $bid_location < 30) {
            $auction_bid_start = 21;
        }
        $sql = "SELECT `player_id` FROM `resources` WHERE `bid_loc` BETWEEN '".$auction_bid_start."' AND '".$bid_location."'";
        $outbid = self::getCollectionFromDb( $sql );
        foreach($outbid as $outbid_id =>$outbids){
            $this->outbidPlayer($outbid_id);
        }
        // then update bid for this 
        
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} places a bid'), array (
                'player_id' => $player_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$player_id]['player_name'],
                'bid_location'=> $bid_location) );
        $sql = "UPDATE `resources` SET `bid_loc` = '".$bid_location."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
    }

    public function getValidBids($player_id) {
        $player_count = $this->game->getPlayersNumber();
        if ($player_count == 4){
            $valid_bids = range(1,29);
        } else {
            $valid_bids = range(1,19);
        }
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $sql = "SELECT `bid_loc` FROM `resources`";
        $bids = self::getObjectListFromDB( $sql );
        $offset = 0;
        if ($this->game->doTheyOwnBuilding($player_id, BUILDING_LAWYER)){
            $offset = 1;
        }
        for($i=0; $i < count($bids); $i++){
            $bid = $bids[$i]['bid_loc'];
            if (($bid > 0) && ($bid < 10)){
                for ($j = ($bid - $offset); $j >0; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            } else if (($bid > 10) && ($bid < 20)) {
                for ($j = ($bid - $offset); $j >10; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            } else if (($bid > 20) && ($bid < 30)) {
                for ($j = ($bid - $offset); $j >20; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            }
        }
        return ($valid_bids);
    }

}