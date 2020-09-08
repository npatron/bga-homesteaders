<?php

/*
 * HSDBid: a class that allows handles bid related actions.
 */
require_once('constants.inc.php');
class HSDBid extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    function clearBids(){
        self::DbQuery( "UPDATE `resources` SET `bid_loc`= '0' " );
        $this->game->setGameStateValue('last_bid', 0);
        $this->game->setGameStateValue('bid_selected', 0 );
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

    public function makeBid($bid_location, $player_id){
        $sql = "UPDATE `resources` SET `bid_loc` = '".$bid_location."' WHERE `player_id` = '".$player_id."'";
        self::DbQuery( $sql );
		$this->game->notifyAllPlayers("moveBidToken", '', array (
				'player_id' => $player_id,
				'bid'=>$bid_location));
        // mark somebids as outbid.
        // TODO:: add logging of outbids (for stats).
        if ($bid_location > 0 && $bid_location < 10){
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '1' AND '".$bid_location."'";
            self::DbQuery( $sql );
        } else if ($bid_location > 10 && $bid < 20) {
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '11' AND '".$bid_location."'";
            self::DbQuery( $sql );
        } else if ($bid_location > 20 && $bid_location < 30) {
            $sql = "UPDATE `resources` SET `bid_loc` = '".OUTBID."' WHERE `bid_loc` BETWEEN '21' AND '".$bid_location."'";
            self::DbQuery( $sql );
        }
    }

    public function getValidBids($player_id) {
        $valid_bids = range(1,29);
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS]); // remove outbid & pass
        $sql = "SELECT `bid_loc` FROM `resources`";
        $bids = self::getObjectListFromDB( $sql );
        $offset = 0;
        if ($this->game->doTheyOwnBuilding($player_id, BUILDING_LAWYER)){
            $offset = 1;
        }             
        foreach ($bids as $bid){
            if ($bid > 0 && $bid < 10){
                for ($i = ($bid - $offset); $i >0; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 10 && $bid < 20) {
                for ($i = ($bid - $offset); $i >10; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            } else if ($bid > 20 && $bid < 30) {
                for ($i = ($bid - $offset); $i >20; $i--){
                    $valid_bids = \array_diff($valid_bids, [$i]);
                }
            }
        }
        return ($valid_bids);
    }

}