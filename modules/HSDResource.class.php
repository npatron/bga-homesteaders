<?php

/*
 * HSDBuilding: a class that handles building related actions.
 */
class HSDresource extends APP_GameClass
{
    public $resource_map = array(
        WOOD=>  'wood', 
        STEEL=> 'steel',
        GOLD=>  'gold',
        COPPER=>'copper',
        FOOD=>  'food',
        COW=>   'cow',
        TRADE=> 'trade',
        VP=>    'vp',
        SILVER=>'silver',
        LOAN=>  'loan',);
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    /**
     * This will NOT notify the player only for use when notification has already happened (workers), or 
     * updating the trackers: bid_loc, rail_adv, 
     */
    function updateResource($p_id, $type, $amount){
        $sql = "SELECT `".$type."` FROM `resources` WHERE `player_id`= '".$p_id."'";
        $resource_count = $this->game->getUniqueValueFromDB( $sql );
        $resource_count += $amount;
        $sql = "UPDATE `resources` SET `".$type."`='".$resource_count."' WHERE `player_id`= '".$p_id."'";
        $this->game->DbQuery( $sql );
    }  

    function updateAndNotifyIncome($p_id, $type, $amount, $reason_string = ""){
        $this->game->notifyAllPlayers( "playerIncome",
        clienttranslate( '${player_name} recieved '.$amount.' '.$type.' from '.$reason_string ), 
        array('player_id' => $p_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => $this->game->getPlayerName($p_id),
            ) );
            $this->updateResource($p_id, $type, $amount);
    }

    function updateAndNotifyPayment($p_id, $type, $amount =1, $reason_string = ""){
        $this->game->notifyAllPlayers( "playerPayment",
            clienttranslate( '${player_name} paid '.$amount.' '.$type.' for '.$reason_string ), 
            array('player_id' => $p_id,
            'type' => $type,
            'amount' => $amount,
            'player_name' => $this->game->getPlayerName($p_id),
        ) );
        $this->updateResource($p_id, $type, -$amount);
    }

    function addWorker($p_id, $reason_string){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$p_id.")";
        $this->game->DbQuery( $sql );
        $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$p_id."'";
        $player_workers = $this->game->getObjectListFromDB( $sql );
        $w_key = $player_workers[count($player_workers)-1];
        if ($reason_string == 'hire'){
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a new ${token}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'token' => 'worker',
                'worker_key'=> $w_key));
        } else {
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a new ${token} as ${reason}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'token' => 'worker',
                'reason' => $reason_string,
                'worker_key'=> $w_key));
        }
        $this->updateResource($p_id, 'workers', 1);
    }

    function addTrack($p_id, $reason_string){
        $sql = "INSERT INTO `tracks` (`player_id`) VALUES (".$p_id.")";
        $this->game->DbQuery( $sql );
        $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$p_id."'";
        $p_tracks = $this->game->getObjectListFromDB( $sql );
        $track_key = $p_tracks[count($p_tracks)-1];
        $this->game->notifyAllPlayers( "playerRecieveTrack", clienttranslate( '${player_name} lays a new ${token} from ${reason}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'token' => 'track',
            'worker_key'=> $track_key,
            'reason' => $reason_string));
        $this->updateResource($p_id, 'track', 1);
    }

    function recieveRailBonus($p_id, $selected_bonus){
        $rail_bonus_string = _('Rail Advancement Bonus');
        switch ($selected_bonus){
            case WORKER:
                $this->addWorker($p_id, $rail_bonus_string);
            break;
            case TRACK:
                $this->addTrack($p_id, $rail_bonus_string);
            break;
            case TRADE:
                $this->updateAndNotifyIncome($p_id, 'trade', 1, $rail_bonus_string);
            break;
            case WOOD:
                $this->updateAndNotifyIncome($p_id, 'wood', 1, $rail_bonus_string);
            break;
            case FOOD:
                $this->updateAndNotifyIncome($p_id, 'food', 1, $rail_bonus_string);
            break;
            case STEEL:
                $this->updateAndNotifyIncome($p_id, 'steel', 1, $rail_bonus_string);
            break;
            case GOLD:
                $this->updateAndNotifyIncome($p_id, 'gold', 1, $rail_bonus_string);
            break;
            case COPPER:
                $this->updateAndNotifyIncome($p_id, 'copper', 1, $rail_bonus_string);
            break;
            case COW:
                $this->updateAndNotifyIncome($p_id, 'cow', 1, $rail_bonus_string);
            break;
            case VP:
                $this->updateAndNotifyIncome($p_id, 'vp', 3, $rail_bonus_string);
            break;
        }
    }

    function changeResourceInArray($r_arr, $removed_type, $added_type){
        if(array_key_exists($r_arr, $removed_type)){
            $r_arr[$removed_type]--;
            if (array_key_exists($r_arr, $added_type)){
                $r_arr[$added_type] ++;
            } else {
                $r_arr[$added_type] =1;
            }
        }
        return $r_arr;
    }

    function canPlayerAfford($p_id, $r_arr){
        $sql = "SELECT * FROM `resources` WHERE `player_id` ='".$p_id."'";
        $p_resources = $this->game->getObjectFromDB($sql);
        $enough = true;
        foreach( $r_arr as $key => $resource){
            $enough = $enough && ($p_resources[$key] >= $resource);  
        }
        return $enough;
    }
    
    function collectIncome($p_id) 
    {
        //$this->game->notifyAllPlayers( "beginIncome", clienttranslate( 'Income Phase' ), array() );
        $sql = "SELECT `track` FROM `resources` WHERE `player_id`='".$p_id."'";
        $p_tracks = $this->game->getUniqueValueFromDB( $sql ); 
        //$resources = $this->game->getCollectionFromDB( $sql );
        $this->game->Building->buildingIncomeForPlayer($p_id);
        if($p_tracks > 0) {
            $this->updateAndNotifyIncome($p_id, 'silver', $p_tracks, 'rail tracks');
        }
    }

    function getRailAdv($p_id) {
        $sql = "SELECT `rail_adv` FROM `player` WHERE `player_id`='".$p_id."'";
        $rail_adv = $this->game->getUniqueValueFromDB( $sql );
        if ($rail_adv < 5){
            $rail_adv++;
            $sql = "UPDATE `player` SET `rail_adv`= '".$rail_adv."' WHERE `player_id`='".$p_id."'";
            $this->game->DbQuery( $sql );
            $this->game->notifyAllPlayers( "railAdv", 
                        clienttranslate( '${player_name} advances their rail track ' ),
                        array('player_id' => $p_id,
                              'player_name' => $this->game->getPlayerName($p_id),
                              'rail_destination' => $rail_adv,));
        }
    }

    function pay($p_id, $silver, $gold, $reason_string){
        if (!$this->canPlayerAfford($p_id, array('gold'=>$gold, 'silver'=>$silver))){
            throw new BgaUserException( _("Not enough resources. Take loan(s) or trade") );
        }
        if ($gold > 0) {
            $this->updateAndNotifyPayment($p_id, 'gold', $gold, $reason_string);
        }
        if ($silver > 0) {
            $this->updateAndNotifyPayment($p_id, 'silver', $silver, $reason_string);
        }
    }

    function trade($p_id ,$tradeAction) {
        $p_name = $this->game->getPlayerName($p_id);
        // default trade amounts
        $sell = false;
        $bank = false;
        $trade_away_amt = 1;
        $trade_for_amt = 1;
        switch($tradeAction){
            case 'buy_wood':
                $trade_away_type = "silver";
                $trade_for_type = "wood";
            break;
            case 'buy_food':
                $trade_away_amt = 2;
                $trade_away_type = "silver";
                $trade_for_type = "food";
            break;
            case 'buy_steel':
                $trade_away_amt = 3;
                $trade_away_type = "silver";
                $trade_for_type = "steel";
            break;
            case 'buy_gold':
                $trade_away_amt = 4;
                $trade_away_type = "silver";
                $trade_for_type = "gold";
            break;
            case 'buy_copper':
                $trade_away_type = "gold";
                $trade_for_type = "copper";
            break;
            case 'buy_livestock':
                $trade_away_type = "gold";
                $trade_for_type = "livestock";
            break;
            case 'sell_wood':
                $trade_away_type = "wood";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_food':
                $trade_away_type = "food";
                $trade_for_amt = 2;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_steel':
                $trade_away_type = "steel";
                $trade_for_amt = 3;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_gold':
                $trade_away_type = "gold";
                $trade_for_amt = 4;
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_copper':
                $trade_away_type = "copper";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'sell_livestock':
                $trade_away_type = "cow";
                $trade_for_type = "silver";
                $sell = true;
            break;
            case 'market_wood_food':
                $trade_away_type = "wood";
                $trade_for_type = "food";
            break;
            case 'market_food_steel':
                $trade_away_type = "food";
                $trade_for_type = "steel";
            break;
            case 'bank_trade_copper':
                $trade_away_type = 'trade';
                $trade_for_type = 'silver';
                $bank = true;
        }
        $cost = array($trade_away_type => $trade_away_amt, 'trade' => 1);
        if (!$this->canPlayerAfford($p_id, $cost)){
            throw new BgaUserException( _("You cannot afford to make this trade"));
        }
        $this->game->notifyAllPlayers( "trade", clienttranslate( '${player_name} trades ${trade1} for ${trade2}' ), array(
            'player_id' => $p_id,
            'player_name' => $p_name,
            'sell' => $sell,
            'trade1' => $trade_away_type,
            'trade2' => $trade_for_type,
        ) );
        if (!$bank){ // bank has no extra trade req.
            $this->updateAndNotifyPayment($p_id, 'trade', 1, 'trade');
        }
        $this->updateAndNotifyPayment($p_id, $trade_away_type, $trade_away_amt, 'trade');
        $this->updateAndNotifyIncome($p_id, $trade_for_type, $trade_for_amt, 'trade');
        
        if ($sell){
            $this->updateAndNotifyIncome($p_id, 'vp', 1, 'trade');
        }
    }

}