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

    function getPlayerResourceAmount($p_id, $type){
        return $this->game->getUniqueValueFromDB("SELECT `$type` FROM `resources` WHERE `player_id`='$p_id'");
    }

    /**
     * This will NOT notify the player only for use when notification has already happened (workers), drack, loan, 
     * updating the trackers: bid_loc, rail_adv, 
     */
    function updateResource($p_id, $type, $amount){
        $sql = "UPDATE `resources` SET `".$type."`=".$type."+".$amount." WHERE `player_id`= '".$p_id."'";
        $this->game->DbQuery( $sql );
    }  

    /**
     * p_id - player id
     * $type - 'resource type' as string
     * $amount - amount of resource to recieve. 
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction (these are used for moving tokens)
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyIncome($p_id, $type, $amount =1, $reason_string = "", $origin="", $key = 0){
        $values = array('player_id' => $p_id,
            'type' => array('type'=>$type, 'amount'=>$amount),
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,);
        if ($origin === 'building'){
            $values['reason_string'] = array('type'=>$this->game->Building->getBuildingTypeFromKey($key), 'str'=>$reason_string);
            $values['origin'] = $origin;
            $values['key'] = $key;
        } else if ($origin === 'auction') {
            $values['origin'] = $origin;
            $values['key'] = $key;
        }
        $this->game->notifyAllPlayers( "playerIncome", clienttranslate( '${reason_string} earned ${player_name} ${type}' ), $values );
        $this->updateResource($p_id, $type, $amount);
    }

    /**
     * p_id - player id
     * $income_arr -> array with the following values {
     *  'key'  => building_key or auction_no.
     *  'reason_string' => reason_string value
     *  'origin' => 'building' for building, 'auction' for auction
     *  'resource_type' => value, example: 'silver' => 2, 'gold'=> 1
     * }
     */
    function updateAndNotifyIncomeGroup($p_id, $income_arr, $reason_string="", $origin="", $key =0){
        if(count($income_arr) >1){
            $values = array('player_id' => $p_id,
                'resources' => $income_arr,
                'player_name' => $this->game->getPlayerName($p_id),
                'reason_string' => $reason_string);
            if ($origin === 'building'){
                $values['origin'] = $origin;
                $values['key'] = $key;
                $values['reason_string'] = array('type'=>$this->game->Building->getBuildingTypeFromKey($key), 'str'=>$reason_string);
            } else if ($origin === "auction"){
                $values['origin'] = $origin;
                $values['key'] = $key;
            }
            $this->game->notifyAllPlayers( 'playerIncomeGroup', clienttranslate( '${reason_string} earned ${player_name} ${resources}' ), $values);
            foreach( $income_arr as $type => $amt ){
                $this->updateResource($p_id, $type, $amt);
            }
        } else if (count($income_arr) == 1) {
            $type = array_keys($income_arr)[0];
            $this->updateAndNotifyIncome($p_id, $type, $income_arr[$type], $reason_string, $origin, $key);
        }
    }

    /**
     * p_id - player id
     * $type - 'resource type' as string
     * $amount - amount of resource to pay. 
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyPayment($p_id, $type, $amount =1, $reason_string = "", $origin="", $key = 0){
        $values = array('player_id' => $p_id,
            'type' => array('type'=>$type, 'amount'=>$amount),
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,);
        if ($origin === 'building'){
            $values['origin'] = $origin;
            $values['reason_string'] = array('type'=>$this->game->Building->getBuildingTypeFromKey($key), 'str'=>$reason_string);
            $values['key'] = $key;
        } else if ($origin === 'auction') {
            $values['origin'] = $origin;
            $values['key'] = $key;
        }
        $this->game->notifyAllPlayers( "playerPayment", clienttranslate( '${reason_string} cost ${player_name} ${type}' ), $values );
        $this->updateResource($p_id, $type, -$amount);
    }

    /**
     * p_id - player id
     * $income_arr - array with keys of 'resource type' with value for amount.
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyPaymentGroup($p_id, $payment_arr, $reason_string = "", $origin="", $key = 0){
        if(count($payment_arr) >1){
            $values = array('player_id' => $p_id,
                        'resources' => $payment_arr,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'reason_string' => $reason_string);
            if ($origin === 'building'){
                $values['origin'] = $origin;
                $values['reason_string'] = array('type'=>$this->game->Building->getBuildingTypeFromKey($key), 'str'=>$reason_string);
                $values['key'] = $key;
            } else if ($origin === 'auction'){
                $values['origin'] = $origin;
                $values['reason_string'] = $reason_string;
                $values['key'] = $key;
            }
            $this->game->notifyAllPlayers( 'playerPaymentGroup', clienttranslate( '${reason_string} cost ${player_name} ${resources}' ), $values);
            foreach( $payment_arr as $type => $amt ){
                if ($amt != 0){
                    $this->updateResource($p_id, $type, -$amt);
                }
            }
        } else if (count($payment_arr) == 1) {
            $type = array_keys($payment_arr)[0];
            $this->updateAndNotifyIncome($p_id, $type, $payment_arr[$type], $reason_string, $origin, $key);
        }
    }

    

    function addWorker($p_id, $reason_string){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$p_id.")";
        $this->game->DbQuery( $sql );
        $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$p_id."'";
        $player_workers = $this->game->getObjectListFromDB( $sql );
        $w_key = $player_workers[count($player_workers)-1]['worker_key'];
        if ($reason_string == 'hire'){
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${type}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'type' => 'worker',
                'worker_key'=>$w_key,
            ));
        } else {
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${type} as ${reason}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'type' => 'worker',
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
        $this->game->notifyAllPlayers( "gainTrack", clienttranslate( '${player_name} lays a new ${track} from ${reason}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'track' => 'track',
            'reason' => $reason_string));
        $this->updateResource($p_id, 'track', 1);
    }

    function payLoanOrRecieveSilver($p_id, $reason_string){
        $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$p_id."'");
        if ($playerLoan== 0){
            $this->game->Resource->updateAndNotifyIncome ($p_id, 'silver', 2, $reason_string);
        } else {
            $this->game->Log->freePayOffLoan($p_id, $reason_string);
            $this->game->Resource->updateResource ($p_id, 'loan', -1);
        }
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
            $r_arr = $this->updateKeyOrCreate($r_arr, $added_type);
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
        $sql = "SELECT `track` FROM `resources` WHERE `player_id`='".$p_id."'";
        $p_tracks = $this->game->getUniqueValueFromDB( $sql ); 
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
                        clienttranslate( '${player_name} advances their ${token}' ),
                        array('player_id' => $p_id,
                              'player_name' => $this->game->getPlayerName($p_id),
                              'token' => array('type'=>'train', 'color'=>$this->game->getPlayerColorName($p_id)),
                              'rail_destination' => $rail_adv,));
        }
    }

    function pay($p_id, $silver, $gold, $reason_string, $key=0){
        $cost = array('gold'=>$gold, 'silver'=>$silver);
        if (!$this->canPlayerAfford($p_id, $cost)){
            throw new BgaUserException( _("Not enough resources. Take loan(s) or trade") );
        }
        if ($key != 0){
            $this->updateAndNotifyPaymentGroup($p_id, $cost, $reason_string, 'auction', $key);
        } else {
            $this->updateAndNotifyPaymentGroup($p_id, $cost, $reason_string);
        }
    }

    function trade($p_id ,$tradeAction) {
        $p_name = $this->game->getPlayerName($p_id);
        // default trade amounts
        $tradeAway = array('trade'=>1);
        $tradeFor = array ();
        $sell = false;
        switch($tradeAction){
            case 'buy_wood':
                $tradeAway['silver'] = 1;
                $tradeFor['wood'] = 1;
            break;
            case 'buy_food':
                $tradeAway['silver'] = 2;
                $tradeFor['food'] = 1;
            break;
            case 'buy_steel':
                $tradeAway['silver'] = 3;
                $tradeFor['steel'] = 1;
            break;
            case 'buy_gold':
                $tradeAway['silver'] = 4;
                $tradeFor['gold'] = 1;
            break;
            case 'buy_copper':
                $tradeAway['gold'] = 1;
                $tradeFor['copper'] = 1;
            break;
            case 'buy_livestock':
                $tradeAway['gold'] = 1;
                $tradeFor['cow'] = 1;
            break;
            case 'sell_wood':
                $tradeAway['wood'] = 1;
                $tradeFor['silver'] = 1;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'sell_food':
                $tradeAway['food'] = 1;
                $tradeFor['silver'] = 2;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'sell_steel':
                $tradeAway['steel'] = 1;
                $tradeFor['silver'] = 3;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'sell_gold':
                $tradeAway['gold'] = 1;
                $tradeFor['silver'] = 4;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'sell_copper':
                $tradeAway['copper'] = 1;
                $tradeFor['gold'] = 1;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'sell_livestock':
                $tradeAway['cow'] = 1;
                $tradeFor['gold'] = 1;
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'market_wood_food':
                $tradeAway['wood'] = 1;
                $tradeFor['food'] = 1;
            break;
            case 'market_food_steel':
                $tradeAway['food'] = 1;
                $tradeFor['steel'] = 1;
            break;
            case 'bank_trade_silver':
                $tradeFor['silver'] = 1;
        }
        if (!$this->canPlayerAfford($p_id, $tradeAway)){
            throw new BgaUserException( _("You cannot afford to make this trade"));
        }
        if ($sell && $this->game->Building->doesPlayerOwnBuilding($p_id, BLD_MARKET)){
            $tradeFor['silver'] = ($tradeFor['silver'] ?:0)+1;
        }
        $this->game->notifyAllPlayers( "trade", clienttranslate( '${player_name} Trades ${tradeAway} for ${tradeFor}' ), array(
            'player_id' => $p_id,
            'player_name' => $p_name,
            'tradeAway' => $tradeAway,
            'tradeFor' => $tradeFor,
        ) );
        foreach($tradeAway as $type=>$amt){
            $this->updateResource($p_id, $type, -$amt);
        }
        foreach($tradeFor as $type=>$amt){
            $this->updateResource($p_id, $type, $amt);
        }
        /*$this->updateAndNotifyPayment($p_id, $trade_away_type, $trade_away_amt, $trade_message);
        $this->updateAndNotifyIncome($p_id, $trade_for_type, $trade_for_amt, $trade_message);
        
        if ($sell){
            if ($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_MARKET)){
                $this->updateAndNotifyIncome($p_id, 'silver', 1, _('market sell bonus'));
            }
            $this->updateAndNotifyIncome($p_id, 'vp', 1, $trade_message);
        }*/
    }

    /**updates an array by setting  */
    function updateKeyOrCreate($arr, $key, $amt = 1){
        $arr[$key] = ($arr[$key] ?:0)+$amt;
        return $arr;
    }

}