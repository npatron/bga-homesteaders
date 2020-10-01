<?php

/*
 * HSDBid: a class that allows handles bid related actions.
 */
class HSDBid extends APP_GameClass
{
    public $game;
    public $bid_cost_array = array(
        1 => 3, 2 => 4, 3 => 5,
        4 => 6, 5 => 7, 6 => 9,
        7 => 12,8 => 16,9 => 21, );
    public function __construct($game)
    {
        $this->game = $game;
    }

    function setBidForPlayer($p_id, $bid_loc){
        $sql = "UPDATE `player` SET `bid_loc`= '".$bid_loc."' WHERE `player_id`='".$p_id."'";
        $this->game->DbQuery( $sql );
    }

    function notifyAllMoveBid($p_id, $bid_loc){
        $this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} moves bid'), array (
            'player_id' => $p_id,
            'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
            'bid_location'=> $bid_loc ));
    }

    function clearBids(){
        $this->game->DbQuery( "UPDATE `player` SET `bid_loc`= '0', `outbid`='0' " );
        $this->game->setGameStateValue('last_bidder', 0);
        $this->game->setGameStateValue('players_passed', 0);
        //$this->game->notifyAllPlayers("clearAllBids",  _('Resetting all bid tokens'), array ());
    }

    function getPlayerBidLoc($p_id){
        $sql = "SELECT `bid_loc` FROM `player` WHERE `player_id`='".$p_id."'";
        return ($this->game->getUniqueValueFromDB( $sql ));
    }

    function canPlayerBid($p_id) {
        $bid_loc = $this->getPlayerBidLoc($p_id);
        if ($bid_loc == NO_BID) return true;
        if ($this->isPlayerOutbid($p_id))return true;
        return false;
    }

    function getBidCost($p_id){
        $sql = "SELECT `bid_loc` FROM `player` WHERE `player_id`='".$p_id."'";
        $bid_loc = $this->game->getUniqueValueFromDB( $sql );
        $bid_index = ($bid_loc % 10);
        return ($this->bid_cost_array[$bid_index]);
    }

    function getWinnerOfAuction() 
    {
        $current_auction = $this->game->getGameStateValue( 'current_auction' );
        $sql = "SELECT `player_id`, `bid_loc` FROM `player`";
        $bids = $this->game->getCollectionFromDB( $sql );
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

    function passBid(){
        $p_id = $this->game->getActivePlayerId();
        $players_passed = $this->game->getGameStateValue('players_passed');
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} passes'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'bid_location'=> BID_PASS ));
        $sql = "UPDATE `player` SET `bid_loc` = '".BID_PASS."', `outbid`='0' WHERE `player_id` = '".$p_id."'";
        $this->game->DbQuery( $sql );
        $this->game->setGameStateValue('players_passed', ++$players_passed);
        $this->game->setGameStateValue('phase', 2);
        $this->game->Resource->getRailAdv($p_id);
    }

    function confirmBid($bid_location){
        $active_player = $this->game->getActivePlayerId();
        $valid_bids = $this->getValidBids($active_player);
        if (in_array($bid_location, $valid_bids)){// valid bid
            $this->makeBid($bid_location, $active_player);
            $this->game->setGameStateValue('last_bidder', $active_player);
        } else {
            throw new BgaUserException( _("Invalid Bid Selection") );
        }
    }

    function isPlayerOutbid ($p_id){
        $sql = "SELECT `outbid` FROM `player` WHERE `player_id` = '".$p_id."'";
        $already_outbid = $this->game->getUniqueValueFromDB( $sql );
        if ($already_outbid == 1) return true;
        return false;
    }

    function outbidPlayer($p_id) {
        if (!$this->isPlayerOutbid($p_id)){
            $sql = "UPDATE `player` SET `outbid` = '1' WHERE `player_id` = '".$p_id."'";
            $this->game->DbQuery( $sql );
            $outbid_byId = $this->game->getActivePlayerId();
            $this->game->Log->outbidPlayer($p_id, $outbid_byId);
        }
    }

    function makeBid($bid_loc, $p_id){
        // determine outbids (if any).
        $auction_bid_start = 0;
        if ($bid_loc > 0 && $bid_loc < 10){
            $auction_bid_start = 1;
        } else if ($bid_loc > 10 && $bid_loc < 20) {
            $auction_bid_start = 11;
        } else if ($bid_loc > 20 && $bid_loc < 30) {
            $auction_bid_start = 21;
        }
        $sql = "SELECT `player_id` FROM `player` WHERE `bid_loc` BETWEEN '".$auction_bid_start."' AND '".$bid_loc."'";
        $outbid = $this->game->getCollectionFromDb( $sql );
        foreach($outbid as $outbid_id =>$outbids){
            $this->outbidPlayer($outbid_id);
        }
        // then update bid for this 
        
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} places a bid'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'bid_location'=> $bid_loc) );
        $sql = "UPDATE `player` SET `bid_loc` = '".$bid_loc."', `outbid`='0' WHERE `player_id` = '".$p_id."'";
        $this->game->DbQuery( $sql );
    }

    function getValidBids($p_id) {
        $player_count = $this->game->getPlayersNumber();
        if ($player_count == 4){
            $valid_bids = range(1,29);
        } else {
            $valid_bids = range(1,19);
        }
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $sql = "SELECT `bid_loc` FROM `player`";
        $bids = $this->game->getObjectListFromDB( $sql );
        $offset = 0;
        if ($this->game->Building->doesPlayerOwnBuilding($p_id, BUILDING_LAWYER)){
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