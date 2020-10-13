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

    function setupBidDB($players){
        $sql = "INSERT INTO `bids` (player_id) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player ) {
            $values[] = "( $player_id )";
        }
        if (count($players) == 2){ // add dummy bid token if not already there.
            $values[] = "( ".DUMMY_PID." )";
        }
        $sql .= implode( ',', $values); 
        $this->game->DbQuery( $sql );
    }

    function setBidForPlayer($p_id, $bid_loc){
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`= '$bid_loc' WHERE `player_id`='$p_id'");
    }

    function notifyAllMoveBid($p_id, $bid_loc){
        $this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} moves ${token}'), array (
            'player_id' => $p_id,
            'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
            'bid_location'=> $bid_loc,
            'token' => array('token'=> 'bid', 'player_id'=>$p_id),) );
    }

    function clearBids(){
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`= '0', `outbid`='0' " );
        $this->game->setGameStateValue('last_bidder', 0);
        $this->game->setGameStateValue('players_passed', 0);
    }

    function getPlayerBidLoc($p_id){
        return ($this->game->getUniqueValueFromDB("SELECT `bid_loc` FROM `bids` WHERE `player_id`='$p_id' "));
    }

    function canPlayerBid($p_id) {
        $bid_loc = $this->getPlayerBidLoc($p_id);
        if ($bid_loc == NO_BID) return true;
        if ($this->isPlayerOutbid($p_id))return true;
        return false;
    }

    function getBidCost($p_id){
        $bid_loc = $this->game->getUniqueValueFromDB( "SELECT `bid_loc` FROM `bids` WHERE `player_id`='$p_id'");
        $bid_index = ($bid_loc % 10);
        return ($this->bid_cost_array[$bid_index]);
    }

    function getWinnerOfAuction() 
    {
        $current_auction = $this->game->getGameStateValue( 'current_auction' );
        $bids = $this->game->getCollectionFromDB("SELECT `player_id`, `bid_loc` from `bids`");
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
        $token_arr = array('token'=> 'bid', 'player_id'=>$p_id);
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} passes ${token}'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'bid_location'=> BID_PASS,
                'token' => $token_arr,));
        $this->game->DbQuery("UPDATE `bids` SET `bid_loc` ='".BID_PASS."', `outbid`='0' WHERE `player_id` = '$p_id'");
        if ($this->game->getPlayersNumber() == 2)
            $this->updateDummyBidWeight(true);
        $this->game->setGameStateValue('players_passed', ++$players_passed);
        $this->game->setGameStateValue('phase', 2);
        $this->game->Resource->getRailAdv($p_id, $token_arr);
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
        $already_outbid = $this->game->getUniqueValueFromDB( 
            "SELECT `outbid` FROM `bids` WHERE `player_id` = '$p_id'" );
        if ($already_outbid == 1) return true;
        return false;
    }

    function outbidPlayer($p_id) {
        if (!$this->isPlayerOutbid($p_id)){
            $this->game->DbQuery( "UPDATE `bids` SET `outbid` = '1' WHERE `player_id` = '$p_id'");
            if ($p_id == 0){ 
                $this->updateDummyBidWeight(false);
            } else { // don't add logs for dummy player
                $outbid_byId = $this->game->getActivePlayerId();
                $this->game->Log->outbidPlayer($p_id, $outbid_byId);
            }
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
        $outbid = $this->game->getCollectionFromDb( 
            "SELECT `player_id` FROM `bids` WHERE `bid_loc` BETWEEN '$auction_bid_start' AND '$bid_loc'");
        foreach($outbid as $outbid_id =>$outbids){
            $this->outbidPlayer($outbid_id);
        }
        // then update bid for this 
        $auc = ceil($bid_loc/10);
        $amt = $this->bid_cost_array[$bid_loc%10];
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} Bids ${amount} for ${auction}'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'amount' => $amt,
                'auction' => array('str'=>'AUCTION '.$auc, 'key'=> $auc),
                'bid_location'=> $bid_loc) );
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`='$bid_loc', `outbid`='0' WHERE `player_id`='$p_id'");
    }

    function getValidBids($p_id) {
        $player_count = $this->game->getPlayersNumber();
        if ($player_count == 4){
            $valid_bids = range(1,29);
        } else {
            $valid_bids = range(1,19);
        }
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $bids = $this->game->getObjectListFromDB( "SELECT `bid_loc` FROM `bids`" );
        $offset = 0;
        if ($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_LAWYER)){
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

    /***** DUMMY ACTIONS (2-player only) *****/

    function confirmDummyBid($bid_location){
        $valid_bids = $this->getDummyBidOptions();
        if (in_array($bid_location, $valid_bids)){// valid bid
            $this->makeBid($bid_location, DUMMY_PID);
        } else {
            throw new BgaUserException( _("Invalid Bid Selection") );
        }
    }

    function updateDummyBidWeight($dummy_win){
        $val = $this->game->getGameStateValue ('dummy_bid_val');
        if ($dummy_win){ // on outbid
            $val = max(1, $val -1); // 1 or -1; (1-> 3-silver)
        } else { // on pass
            $val = min(6, $val +1); // 6 or +1; (6-> 9-silver)
        }
        $this->game->setGameStateValue( 'dummy_bid_val', $val);
    }

    function getDummyBidOptions(){
        $dummy_1 = $this->game->getGameStateValue ('dummy_bid_val');
        $dummy_2 = $dummy_1+10;
        return (array(0=>$dummy_1,1=> $dummy_2));
    }

}