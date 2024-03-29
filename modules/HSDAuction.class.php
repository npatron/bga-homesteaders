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
        $sql = "INSERT INTO `auctions` ( `auction_id`, `position`, `location` ) VALUES ";
        $values=array();
        //first auction is in order, 
        for ($i = 1; $i <11; $i++){
            $values[] = "('$i','$i','".AUC_LOC_1."')";
        }
        //second & third auctions have 1-4, 5-8, and 9-10 positions shuffled.
        $settlement_position = array('1','2','3','4');
        $town_position = array('5','6','7','8');
        $city_position = array('9','10');
        shuffle($settlement_position);
        shuffle($town_position);
        shuffle($city_position);
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+11)."','".$settlement_position[$i]."','".AUC_LOC_2."')";
        }
        for ($i = 0; $i <4; $i++){
            $values[] = "('".($i+15)."','".$town_position[$i]       ."','".AUC_LOC_2."')";
        }
        for ($i = 0; $i <2; $i++){
            $values[] = "('".($i+19)."','".$city_position[$i]       ."','".AUC_LOC_2."')";
        }

        if ($playerCount>3){
            shuffle($settlement_position);
            shuffle($town_position);
            shuffle($city_position);
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+21)."','".$settlement_position[$i]."','".AUC_LOC_3."')";
            }
            for ($i = 0; $i <4; $i++){
                $values[] = "('".($i+25)."','".$town_position[$i]      ."','".AUC_LOC_3."')";
            }
            for ($i = 0; $i <2; $i++){
                $values[] = "('".($i+29)."','".$city_position[$i]      ."','".AUC_LOC_3."')";
            }   
        }
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }

    function getAllAuctionsFromDB(){
        $sql = "SELECT `auction_id` a_id, `location` FROM `auctions` "; 
        return ($this->game->getCollectionFromDb( $sql ));
    }

    function getCurrentRoundAuctions($round_number= null){
        $round_number = (is_null($round_number)?$this->game->getGameStateValue('round_number'):$round_number);
        $sql = "SELECT `auction_id` a_id, `location` FROM `auctions` WHERE `location` IN (1,2,3) AND `position`='$round_number'"; 
        return ($this->game->getCollectionFromDb( $sql ));
    }

    function getCurrentAuctionId(){
        $round_number = $this->game->getGameStateValue('round_number');
        $current_auction = $this->game->getGameStateValue('current_auction');
        return $this->game->getUniqueValueFromDB( "SELECT `auction_id` FROM `auctions` WHERE `location`='$current_auction' AND `position`='$round_number'");
    }

    function updateClientAuctions($round_number){
        $auctions = $this->getCurrentRoundAuctions($round_number);
        $this->game->notifyAllPlayers('updateAuctions', clienttranslate( 'Updating Auctions' ), array(
            'auctions' => $auctions,
            'state' => 'show', ));
    }
    
    function discardAuctionTile(){
        $auction_no = $this->game->getGameStateValue( 'current_auction' );
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $sql = "UPDATE `auctions` SET `location`='".AUC_LOC_DISCARD."' WHERE `location` = '$auction_no' AND position = '$round_number'";
        $this->game->DbQuery( $sql);
    }

    function isAuctionInCurrentAuctions($auction_id){
        return array_key_exists($auction_id, $this->getCurrentRoundAuctions());
    }

    function doesCurrentAuctionHaveBuildPhase(){
        return array_key_exists('build', $this->game->auction_info[$this->getCurrentAuctionId()]);
    }

    function doesCurrentAuctionHaveAuctionBonus(){
        return array_key_exists('bonus', $this->game->auction_info[$this->getCurrentAuctionId()]);
    }

    /**
     * returns an array of valid build types for current auction Tile.
     */
    function getCurrentAuctionBonus(){
        $a_id = $this->getCurrentAuctionId();
        // if exists, otherwise return AUC_BONUS_NONE;
        return (array_key_exists('bonus', $this->game->auction_info[$a_id])?$this->game->auction_info[$a_id]['bonus']:AUC_BONUS_NONE);
    }

    function setupCurrentAuctionBonus(){
        $next_state = "bonusChoice";
        $bonus = $this->getCurrentAuctionBonus();
        switch($bonus){
            case AUC_BONUS_NONE:
                $next_state = 'endBuild';
            break;
            case AUC_BONUS_6VP_AND_FOOD_VP:
                $this->game->Resource->updateAndNotifyIncome($this->game->getActivePlayerId(), 'vp6', 1, clienttranslate('Auction Reward'), 'auction', $this->game->getGameStateValue('current_auction'));
            default:
                // all others are handled by player actions, so go to that state.
                $this->game->setGameStateValue( 'auction_bonus', $bonus);
            break;
        }
        $this->game->gamestate->nextState( $next_state );
    }

    /**
     * returns an array of valid build types for current auction Tile.
     */
    function getCurrentAuctionBuildTypeOptions(){
        $a_id = $this->getCurrentAuctionId(); 
        // if exists, otherwise return array();
        return (array_key_exists('build', $this->game->auction_info[$a_id])?$this->game->auction_info[$a_id]['build']:array());
    }
}