<?php

/*
 * HSDBuilding: a class that handles building related actions.
 */
class HSDBuilding extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    /** SETUP BUILDINGS on game start, IN DB */
    function createBuildings($players){
        $this->game->DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (building_id, building_type, stage, cost, `location`, player_id, worker_slot) VALUES ";
        $values=array();
        foreach( $players as $p_id => $player ) // homestead (assigned to each player by player_id)
            $values[] = $this->getHomesteadAsValue($p_id);
        for($b_id = BLD_GRAIN_MILL; $b_id <= BLD_RAIL_YARD; $b_id++) 
            $values[] = $this->buildingAsValue($b_id);
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }

    function getHomesteadAsValue($p_id){
        $player_color = $this->game->getPlayerColorName($p_id);
        $b_id = BLD_HOMESTEAD_BLUE;
        if ($player_color === 'yellow') {
            $b_id = BLD_HOMESTEAD_YELLOW;
        } else if ($player_color === 'red') {
            $b_id = BLD_HOMESTEAD_RED;
        } else if ($player_color === 'green') {
            $b_id = BLD_HOMESTEAD_GREEN;
        } 
        return "('$b_id', 0, 0, 0, 2, '$p_id', 2)";
    }

    function buildingAsValue($b_id){
        $bld =$this->building[$b_id];
        $value = "('$b_id', '".$bld['type']."', '".$bld['stage']."', '".$bld['cost']."', 0, 0, '".$bld['slot']."')";
        $endValue = $value;
        $iStart = ($this->game->getPlayersNumber()==2? 2:1);
        for ($i = $iStart; $i< $bld['amt']; $i++){
            $endValue .= ", "+ $value;
        }
        return $endValue;
    }

    /**  getAllDatas method */
    function getAllBuildings(){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` ";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    function getAllPlayerBuildings($p_id){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` WHERE `player_id` = '".$p_id."' ORDER BY `building_type`, `b_key` ASC";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    /**** Utility ****/
    function getBuildingFromKey($b_key){ // TODO add b_vp for next run through.
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` WHERE `building_key`='$b_key'";
        return ($this->game->getObjectFromDB($sql));
    }

    function getBuildingIdFromKey($b_key){
        $sql = "SELECT `building_id` FROM `buildings` WHERE `building_key`='".$b_key."'";
        return ($this->game->getUniqueValueFromDB( $sql));
    }

    function getBuildingTypeFromId($b_id){
        $sql = "SELECT `building_type` FROM `buildings` WHERE `building_id`='".$b_id."'";
        $building_type = $this->game->getObjectListFromDB( $sql );
        return (reset($building_type));
    }

    function getBuildingTypeFromKey($b_key){
        $sql = "SELECT `building_type` FROM `buildings` WHERE `building_key`='".$b_key."'";
        return ($this->game->getUniqueValuefromDB( $sql ));
    }

    function getBuildingCostFromKey($b_key, $goldAsCow, $goldAsCopper){
        $sql = "SELECT `cost` FROM `buildings` WHERE `building_key`='".$b_key."'";
        $cost = $this->game->getUniqueValueFromDb( $sql );
        $b_cost = array();
        if ($cost == "0") 
            return $b_cost;
        //for each digit in $cost, increment the assiciated array key.
        for ($i =0; $i < strlen($cost); $i++){
            $type_str = '';
            switch($cost[$i]){
                case WOOD: $type_str = 'wood';
                break;
                case STEEL: $type_str = 'steel';
                break;
                case GOLD: $type_str = 'gold';
                break;
                case COPPER:
                    if ($goldAsCopper) $type_str = 'gold';
                    else $type_str = 'copper';
                break;
                case FOOD: $type_str = 'food';
                break;
                case COW:   
                    if ($goldAsCow) $type_str = 'gold';
                    else $type_str = 'cow';
                break;
            }
            $b_cost = $this->game->Resource->updateKeyOrCreate($b_cost, $type_str,  1);
        }
        return $b_cost;
    }

    function getBuildingNameFromKey($b_key){
        $b_id = $this->getBuildingIdFromKey($b_key);
        return ($this->getBuildingNameFromId($b_id));
    }

    function getBuildingNameFromId($b_id){
        switch($b_id)
        {
            case BLD_HOMESTEAD_YELLOW:
            case BLD_HOMESTEAD_RED:
            case BLD_HOMESTEAD_GREEN:
            case BLD_HOMESTEAD_BLUE:
                return clienttranslate( 'Homestead' );
            case BLD_GRAIN_MILL:
                return clienttranslate( 'Grain Mill' );
            case BLD_FARM:
                return clienttranslate( 'Farm' );
            case BLD_MARKET:
                return clienttranslate( 'Market' );
            case BLD_FOUNDRY:
                return clienttranslate( 'Foundry' );
            case BLD_STEEL_MILL:
                return clienttranslate( 'Steel Mill' );
            case BLD_BOARDING_HOUSE:
                return clienttranslate( 'Boarding House' );
            case BLD_RAILWORKERS_HOUSE:
                return clienttranslate( 'Railworkers House' );
            case BLD_RANCH:
                return clienttranslate( 'Ranch' );
            case BLD_TRADING_POST:
                return clienttranslate( 'Trading Post' );
            case BLD_GENERAL_STORE:
                return clienttranslate( 'General Store' );
            case BLD_GOLD_MINE:
                return clienttranslate( 'Gold Mine' );
            case BLD_COPPER_MINE:
                return clienttranslate( 'Copper Mine' );
            case BLD_RIVER_PORT:
                return clienttranslate( 'River Port' );
            case BLD_CHURCH:
                return clienttranslate( 'Church' );
            case BLD_WORKSHOP:
                return clienttranslate( 'Workshop' );
            case BLD_DEPOT:
                return clienttranslate( 'Depot' );
            case BLD_STABLES:
                return clienttranslate( 'Stables' );
            case BLD_BANK:
                return clienttranslate( 'Bank' );
            case BLD_MEATPACKING_PLANT:
                return clienttranslate( 'Meatpacking Plant' );
            case BLD_FORGE:
                return clienttranslate( 'Forge' );
            case BLD_FACTORY:
                return clienttranslate( 'Factory' );
            case BLD_RODEO:
                return clienttranslate( 'Rodeo' );
            case BLD_LAWYER:
                return clienttranslate( 'Lawyer' );
            case BLD_FAIRGROUNDS:
                return clienttranslate( 'Fairgrounds' );
            case BLD_DUDE_RANCH:
                return clienttranslate( 'Dude Ranch' );
            case BLD_TOWN_HALL:
                return clienttranslate( 'Town Hall' );
            case BLD_TERMINAL:
                return clienttranslate( 'Terminal' );
            case BLD_RESTARAUNT:
                return clienttranslate( 'Restataunt' );
            case BLD_TRAIN_STATION:
                return clienttranslate( 'Train Station' );
            case BLD_CIRCUS:
                return clienttranslate( 'Circus' );
            case BLD_RAIL_YARD:
                return clienttranslate( 'Rail Yard' );
        }
    }

    function doesPlayerOwnBuilding($p_id, $b_id) {
        $sql = "SELECT * FROM `buildings` WHERE `player_id`='".$p_id."' AND `building_id`='$b_id'";
        $buildings = $this->game->getCollectionFromDB( $sql );
        if (count($buildings) == 1) {
            return true;
        }
        return false;
    }


    function updateBuildingsForRound($round_number){
        //rd 1 setup buildings
        if($round_number == 1){
            // add 'settlement' and 'settlement/town' buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_OFFER."' WHERE `stage` in ('".STAGE_SETTLEMENT."','".STAGE_SETTLEMENT_TOWN."');";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings(_("SETTLEMENT"));
        }
        //rd 5 setup buildings
        if($round_number == 5){
            // add town buildings
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_TOWN."'";
            $this->game->DbQuery( $sql );
            // remove settlement buildings (not owned)
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_DISCARD."' WHERE `stage` = '".STAGE_SETTLEMENT."' AND `location` = '".BLD_LOC_OFFER."'";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings(_('TOWN'));
        }
        //rd 9 setup buildings
        if($round_number == 9){
            // clear all buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            // add city buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_CITY."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings(_('CITY'));
        }
        // Final round (just income).
        if($round_number == 11){
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings('Final');
        }
    }

    /** cause client to update building Stacks */
    function updateClientBuildings($era){
        $buildings = $this->getAllBuildings();
        $this->game->notifyAllPlayers( "updateBuildingStocks", clienttranslate( 'Setting up Buildings for ${era} Era' ), array(
            'buildings' => $buildings, 'era'=>$era));
    }

    /***** BUYING Building *****/
    /**
     * returns an array of buildings that can be built.
     */
    function getAllowedBuildings( $build_type_options) {// into an array of constants
        if (count($build_type_options) ==0){ return array(); }
            $sql = "SELECT * FROM `buildings` WHERE `location`=".BLD_LOC_OFFER." AND (";
            $values = array();
            foreach($build_type_options as $i=>$option){
                $values[] = "`building_type`='".$build_type_options[$i]."'";
            }
            $sql .= implode( ' OR ', $values ); 
            $sql .= ")";
            $buildings = $this->game->getCollectionFromDB( $sql );
        return $buildings;
    }

    function buildBuilding( $p_id, $b_key, $goldAsCow = false, $goldAsCopper = false )
    {
        $b_cost = $this->getBuildingCostFromKey ($b_key, $goldAsCow, $goldAsCopper);
        $afford = $this->game->Resource->canPlayerAfford($p_id, $b_cost);
        $building = $this->getBuildingFromKey($b_key);
        $b_id = $building['b_id'];
        $b_name = $this->getBuildingNameFromId($b_id);
        if (!$afford){
            throw new BgaUserException( _("You cannot afford to build ".$b_name));
        }
        
        if ($this->doesPlayerOwnBuilding($p_id, $b_id)){
            throw new BgaUserException( _("You have already built a ".$b_name));
        }
        
        $this->payForBuilding($p_id, $b_cost);
        $message = '${player_name} builds ${building_name}';
        $building['p_id'] = $p_id;
        $values = array(  'player_id' => $p_id,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'building' => $building,
                        'building_name' => array('str'=>$b_name, 'type'=>$this->getBuildingTypeFromKey($b_key)),);
        if (count($b_cost)>0) {
            $message .= ' ${arrow} ${resources}';
            $values['resources'] = $b_cost;
            $values['arrow'] = "arrow";
        }
        $this->game->notifyAllPlayers( "buildBuilding", clienttranslate( $message ), $values);
        $this->game->Log->buyBuilding($p_id, $b_key, $b_cost);
        $sql = "UPDATE `buildings` SET `location`=".BLD_LOC_PLAYER.", `player_id`='$p_id' WHERE `building_key`='$b_key'";
        $this->game->DbQuery( $sql );
        $this->game->setGameStateValue('last_building', $b_key);
        
        $building_score = $this->getBuildingScoreFromId( $b_id );
        $this->game->Score->dbIncScore($p_id, $building_score);
    }

    function payForBuilding($p_id, $b_cost){
        foreach( $b_cost as $type => $amt ){
            if ($amt != 0){
                $this->game->Resource->updateResource($p_id, $type, -$amt);
            }
        }
    }

    function getOnBuildBonusForBuildingKey($b_key){
        $b_id = $this->getBuildingIdFromKey($b_key);
        switch ($b_id){
            case BLD_BOARDING_HOUSE:
                return BUILD_BONUS_PAY_LOAN;
            case BLD_RANCH:
                return BUILD_BONUS_TRADE;
            case BLD_WORKSHOP:
                return BUILD_BONUS_WORKER;
            case BLD_DEPOT:
            case BLD_FORGE:
            case BLD_RAIL_YARD:
                return BUILD_BONUS_RAIL_ADVANCE;
            case BLD_TRAIN_STATION:
                return BUILD_BONUS_TRACK_AND_BUILD;
            default:
                return BUILD_BONUS_NONE;
        }
    }

    function getBuildingScoreFromKey($b_key){
        return ($this->getBuildingScoreFromId($this->getBuildingIdFromKey($b_key)));
    }

    function getBuildingScoreFromId($b_id) {
        switch($b_id){
            case BLD_FORGE:
                return 1;
            case BLD_GRAIN_MILL: 
            case BLD_MARKET:
            case BLD_GENERAL_STORE:
            case BLD_WORKSHOP:
            case BLD_MEATPACKING_PLANT:
                return 2;
            case BLD_BANK:
            case BLD_DUDE_RANCH:
            case BLD_TRAIN_STATION:
                return 3;
            case BLD_RODEO:
            case BLD_LAWYER:
                return 4;
            case BLD_FACTORY:
            case BLD_FAIRGROUNDS:
            case BLD_TERMINAL:
            case BLD_RAIL_YARD:
                return 6;
            case BLD_RESTARAUNT:
            case BLD_CIRCUS:
                return 8;
            case BLD_CHURCH:
            case BLD_TOWN_HALL:
                return 10;
        }
        return 0;
    }

    // INCOME
    function buildingIncomeForPlayer($p_id){
        $riverPortWorkers = 0;
        $p_bld = $this->getAllPlayerBuildings($p_id);
        $sql = "SELECT * FROM `workers` WHERE `player_id` = '".$p_id."'";
        $player_workers = $this->game->getCollectionFromDB( $sql );
        $income_b_id = array();
        foreach( $p_bld as $b_key => $building ) {
            $b_name = $this->getBuildingNameFromKey($b_key);
            $b_id = $building['b_id'];
            $income_b_id[$b_id] = array ('name' => $b_name, 'key' =>$b_key);
            switch($b_id) {
                case BLD_HOMESTEAD_YELLOW:
                case BLD_HOMESTEAD_RED:
                case BLD_HOMESTEAD_GREEN:
                case BLD_HOMESTEAD_BLUE:
                case BLD_HOMESTEAD_PURPLE:
                case BLD_BOARDING_HOUSE:
                case BLD_DEPOT:
                    $income_b_id[$b_id]['silver'] = 2;
                    break;
                case BLD_GRAIN_MILL:
                    $income_b_id[$b_id]['food'] = 1;
                    break;
                case BLD_MARKET:
                case BLD_GENERAL_STORE:
                    $income_b_id[$b_id]['trade'] = 1;
                    break;
                case BLD_STEEL_MILL:
                    $income_b_id[$b_id]['steel'] = 1;
                    break;
                case BLD_RAILWORKERS_HOUSE:
                    $income_b_id[$b_id]['silver'] = 1;
                    $income_b_id[$b_id]['trade'] = 1;
                    break;
                case BLD_TRADING_POST:
                    $income_b_id[$b_id]['trade'] = 2;
                    break;
                case BLD_CHURCH:
                case BLD_FACTORY:
                case BLD_LAWYER:
                    $income_b_id[$b_id]['vp2'] = 1;
                    break;
                case BLD_WORKSHOP:
                    $income_b_id[$b_id]['vp'] = 1;
                break;
                case BLD_STABLES:
                    $income_b_id[$b_id]['trade'] = 1;
                    $income_b_id[$b_id]['vp'] = 1;
                break;
                case BLD_BANK:
                    $this->game->Resource->payLoanOrRecieveSilver($p_id, "Bank", 'building', $b_key);
                break;
                case BLD_RODEO:
                    $rodeoIncome = min(count($player_workers), 5);
                    $income_b_id[$b_id]['silver'] = $rodeoIncome;
                break;
                case BLD_FAIRGROUNDS:
                    $income_b_id[$b_id]['gold'] = 1;
                break;
            }
        }
        foreach($player_workers as $worker_key => $worker ) {
            if ($worker['building_key'] != 0){
                $b_key = $worker['building_key'];
                $b_id = $this->getBuildingIdFromKey($b_key);
                switch($b_id){
                    case BLD_HOMESTEAD_YELLOW:
                    case BLD_HOMESTEAD_RED:
                    case BLD_HOMESTEAD_GREEN:
                    case BLD_HOMESTEAD_BLUE:
                    case BLD_HOMESTEAD_PURPLE:
                        if ($worker['building_slot'] == 1){
                            $income_b_id[$b_id]['wood']=1;
                        } else {
                            $income_b_id[$b_id]['vp']=1;
                        }
                        break;
                    case BLD_FARM:
                        if ($worker['building_slot'] == 1){
                            $income_b_id[$b_id]['trade']=1;
                            $income_b_id[$b_id]['silver']=2;
                        } else {
                            $income_b_id[$b_id]['food']=1;
                        }
                        break;
                    case BLD_MARKET:
                        $income_b_id[$b_id]['silver']=2;
                        break;
                    case BLD_FOUNDRY:
                        $income_b_id[$b_id]['steel']=1;
                        break;
                    case BLD_RANCH:
                        $income_b_id[$b_id]['cow']=1;
                        break;
                    case BLD_GOLD_MINE:
                        $income_b_id[$b_id]['gold']=1;
                        break;
                    case BLD_COPPER_MINE:
                        $income_b_id[$b_id]['copper']=1;
                        break;
                    case BLD_RIVER_PORT:
                        if ($riverPortWorkers++ ==1){// only triggers on 2nd worker assigned to this building
                            $income_b_id[$b_id]['gold']=1;
                        } 
                        break;
                    case BLD_MEATPACKING_PLANT:
                    case BLD_FORGE:
                        if(array_key_exists('vp2', $income_b_id[$b_id])){
                            $income_b_id[$b_id]['vp2']+=1;
                        } else {
                            $income_b_id[$b_id]['vp2']=1;
                        }
                        break;
                }
            }
        }
        foreach ($income_b_id as $b_id =>$income) {
            $name = $income['name'];
            $b_key = $income['key'];
            $income = array_diff_key($income, array_flip(['name','key']));
            $this->game->Resource->updateAndNotifyIncomeGroup($p_id, $income, $name, 'building' ,$b_key);
        }
    }

}