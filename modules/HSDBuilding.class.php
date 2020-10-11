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
        $vp = array (0, 0, 0, 0, 0, 2, //0-5
                        0, 2, 0, 0, 0, //6-10
                        0, 0, 0, 2, 0, //11-15
                        0, 0,10, 2, 0, //16-20
                        0, 3, 2, 1, 6, //21-25
                        4, 4, 6, 3,10, //26-30
                        6, 8, 3, 8, 6, //31-35
                        0, 3, 1, 2, 3, 3, 8,);//36-42 (expansion)
        $this->game->DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (building_id, building_type, `stage`, `location`, player_id, worker_slot) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $players as $player_id => $player ) {
            $player_color = $this->game->getPlayerColorName($player_id);
            if ($player_color === 'yellow'){
                $values[] = "('".BLD_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '".BLD_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'red'){
                $values[] = "('".BLD_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '".BLD_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'green'){
                $values[] = "('".BLD_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '".BLD_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BLD_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BLD_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'purple'){//if We add purple homestead update the id below.
                $values[] = "('".BLD_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BLD_LOC_PLAYER."', '".$player_id."', '2')";
            }
        }
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );

        $sql = "INSERT INTO buildings (building_id, building_type, stage, cost, worker_slot, b_vp) VALUES ";
        $values=array();
        // some building have 2 copies in 2 player, and 3 copies in 3-4 player
        $count_3x = 3;
        // some buildings have 2 copies in 3-4 player
        $count_2x = 2; 
        if (count($players) == 2){
            $count_3x = 2;
            $count_2x = 1; 
        }
        for($i = 0; $i < $count_3x; $i++) 
        {
            $values[] = "('".BLD_FARM   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT."','".WOOD."', '2', '".$vp[BLD_FARM]   ."')";
            $values[] = "('".BLD_MARKET ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT."','".WOOD."', '1', '".$vp[BLD_MARKET] ."')";
            $values[] = "('".BLD_FOUNDRY."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT."','".NONE."', '1', '".$vp[BLD_FOUNDRY]."')";
        }
        
        for($i = 0; $i < $count_2x ; $i++) 
        {
            $values[] = "('".BLD_RANCH        ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL.FOOD."', '1', '".$vp[BLD_RANCH]   ."')";
            $values[] = "('".BLD_GENERAL_STORE."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".STEEL          ."', '0', '".$vp[BLD_GENERAL_STORE]   ."')";
            $values[] = "('".BLD_GOLD_MINE    ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL     ."', '1', '".$vp[BLD_GOLD_MINE]   ."')";
            $values[] = "('".BLD_COPPER_MINE  ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD.STEEL."', '1', '".$vp[BLD_COPPER_MINE]   ."')";
            $values[] = "('".BLD_RIVER_PORT   ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD           ."', '3', '".$vp[BLD_RIVER_PORT]   ."')";
            $values[] = "('".BLD_WORKSHOP     ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".STEEL          ."', '0', '".$vp[BLD_WORKSHOP]   ."')";
            $values[] = "('".BLD_DEPOT        ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".WOOD.STEEL     ."', '0', '".$vp[BLD_DEPOT]   ."')";
            $values[] = "('".BLD_FORGE        ."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".STEEL.STEEL    ."', '1', '".$vp[BLD_FORGE]   ."')";
            $values[] = "('".BLD_DUDE_RANCH   ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.FOOD      ."', '0', '".$vp[BLD_DUDE_RANCH]   ."')";
            $values[] = "('".BLD_RESTARAUNT   ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0', '".$vp[BLD_RESTARAUNT]   ."')";
            $values[] = "('".BLD_TERMINAL     ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".STEEL.STEEL    ."', '0', '".$vp[BLD_TERMINAL]   ."')";
            $values[] = "('".BLD_TRAIN_STATION."','".TYPE_INDUSTRIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0', '".$vp[BLD_TRAIN_STATION]   ."')";
        }
        //all other buildings
        $values[] = "('".BLD_GRAIN_MILL       ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT     ."','".WOOD.STEEL             ."', '0', '".$vp[BLD_GRAIN_MILL]       ."')";
        $values[] = "('".BLD_STEEL_MILL       ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.WOOD.GOLD         ."', '0', '".$vp[BLD_STEEL_MILL]       ."')";
        $values[] = "('".BLD_BOARDING_HOUSE   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD              ."', '0', '".$vp[BLD_BOARDING_HOUSE]   ."')";
        $values[] = "('".BLD_RAILWORKERS_HOUSE."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".STEEL.STEEL            ."', '0', '".$vp[BLD_RAILWORKERS_HOUSE]."')";
        $values[] = "('".BLD_TRADING_POST     ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".GOLD                   ."', '0', '".$vp[BLD_TRADING_POST]     ."')";
        $values[] = "('".BLD_CHURCH           ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".WOOD.STEEL.GOLD.COPPER ."', '0', '".$vp[BLD_CHURCH]           ."')";
        $values[] = "('".BLD_BANK             ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".STEEL.COPPER           ."', '0', '".$vp[BLD_BANK]             ."')";
        $values[] = "('".BLD_STABLES          ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".COW                    ."', '0', '".$vp[BLD_STABLES]          ."')";
        $values[] = "('".BLD_MEATPACKING_PLANT."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".WOOD.COW               ."', '2', '".$vp[BLD_MEATPACKING_PLANT]."')";
        $values[] = "('".BLD_FACTORY          ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".STEEL.STEEL.COPPER     ."', '0', '".$vp[BLD_FACTORY]          ."')";
        $values[] = "('".BLD_RODEO            ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".FOOD.COW               ."', '0', '".$vp[BLD_RODEO]            ."')";
        $values[] = "('".BLD_LAWYER           ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.GOLD.COW          ."', '0', '".$vp[BLD_LAWYER]           ."')";
        $values[] = "('".BLD_FAIRGROUNDS      ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.WOOD.COPPER.COW   ."', '0', '".$vp[BLD_FAIRGROUNDS]      ."')";
        $values[] = "('".BLD_TOWN_HALL        ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.WOOD.COPPER       ."', '0', '".$vp[BLD_TOWN_HALL]        ."')";
        $values[] = "('".BLD_CIRCUS           ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".FOOD.FOOD.COW          ."', '0', '".$vp[BLD_CIRCUS]           ."')";
        $values[] = "('".BLD_RAIL_YARD        ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".STEEL.STEEL.GOLD.COPPER."', '0', '".$vp[BLD_RAIL_YARD]        ."')";
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }

    /**  getAllDatas method */
    function getAllBuildings(){ // TODO add b_vp for next run through.
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` ";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    function getAllPlayerBuildings($p_id){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` WHERE `player_id` = '".$p_id."'";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    /**** Utility ****/
    function getBuildingFromKey($b_key){ // TODO add b_vp for next run through.
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` WHERE `building_key`='$b_key'";
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

    function getBuildingCostFromKey($b_key){
        $sql = "SELECT `cost` FROM `buildings` WHERE `building_key`='".$b_key."'";
        $cost = $this->game->getUniqueValueFromDb( $sql );
        $b_cost = array();
        if ($cost == "0") 
            return $b_cost;
        //for each digit in $cost, increment the assiciated array key.
        for ($i =0; $i < strlen($cost); $i++){
            $type_str = '';
            switch($cost[$i]){
                case WOOD:  $type_str = 'wood';
                break;
                case STEEL: $type_str = 'steel';
                break;
                case GOLD:  $type_str = 'gold';
                break;
                case COPPER:$type_str = 'copper';
                break;
                case FOOD:  $type_str = 'food';
                break;
                case COW:   $type_str = 'cow';
                break;
            }
            if (!array_key_exists($type_str, $b_cost)){
                $b_cost[$type_str] = 1;
            } else {
                $b_cost[$type_str] ++;
            }
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
            $this->updateClientBuildings();
        }
        //rd 5 setup buildings
        if($round_number == 5){
            // add town buildings
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_TOWN."'";
            $this->game->DbQuery( $sql );
            // remove settlement buildings (not owned)
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_DISCARD."' WHERE `stage` = '".STAGE_SETTLEMENT."' AND `location` = '".BLD_LOC_OFFER."'";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings();
        }
        //rd 9 setup buildings
        if($round_number == 9){
            // clear all buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            // add city buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_CITY."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings();
        }
        // Final round (just income).
        if($round_number == 11){
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings();
        }
    }
    /** cause client to update building Stacks */
    function updateClientBuildings(){
        $buildings = $this->getAllBuildings();
        $this->game->notifyAllPlayers( "updateBuildingStocks", clienttranslate( 'Updating main Building Stocks' ), array(
            'buildings' => $buildings,));
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
        $afford = $this->canPlayerAffordBuilding ($p_id, $b_key, $goldAsCow, $goldAsCopper);
        $building = $this->getBuildingFromKey($b_key);
        $b_id = $building['b_id'];
        $b_name = $this->getBuildingNameFromId($b_id);
        if (!$afford){
            throw new BgaUserException( _("You cannot afford to build ".$b_name));
        }
        
        if ($this->doesPlayerOwnBuilding($p_id, $b_id)){
            throw new BgaUserException( _("You have already built a ".$b_name));
        }
        $b_cost = $this->getBuildingCostFromKey ($b_key);
        if ($goldAsCow)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'cow', 'gold');
        if ($goldAsCopper)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'copper', 'gold');
        $this->payForBuilding($p_id, $b_cost);

        $message = '${player_name} builds a ${building_name}';
        $building['p_id'] = $p_id;
        $values = array(  'player_id' => $p_id,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'building' => $building,
                        'building_name' => array('str'=>$b_name, 'type'=>$this->getBuildingTypeFromKey($b_key)),);
        if (count($b_cost)>0) {
            $message .= ' for ${resources}';
            $values['resources'] = $b_cost;
        }
        $this->game->notifyAllPlayers( "buildBuilding", clienttranslate( $message ), $values);
        $this->game->Log->buyBuilding($p_id, $b_id);
        $sql = "UPDATE `buildings` SET `location`= ".BLD_LOC_PLAYER.", `player_id`=".$p_id." WHERE `building_key`=".$b_key;
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

    function canPlayerAffordBuilding($p_id, $b_key, $goldAsCow, $goldAsCopper){
        $b_cost = $this->getBuildingCostFromKey($b_key);
        if ($goldAsCow)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'cow', 'gold');
        if ($goldAsCopper)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'copper', 'gold');
        return $this->game->Resource->canPlayerAfford($p_id, $b_cost);
    }

    // INCOME
    function buildingIncomeForPlayer($p_id){
        if ($this->game->getUniqueValueFromDB("SELECT `paid` FROM `player` WHERE `player_id`=${p_id}") == 1)
            {return;}
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

                    break;
                case BLD_TRADING_POST:
                    $income_b_id[$b_id]['trade'] = 2;
                    break;
                case BLD_CHURCH:
                case BLD_FACTORY:
                case BLD_LAWYER:
                    $income_b_id[$b_id]['vp'] = 2;
                    break;
                case BLD_WORKSHOP:
                    $income_b_id[$b_id]['vp'] = 1;
                break;
                case BLD_STABLES:
                    $income_b_id[$b_id]['trade'] = 1;
                break;
                case BLD_BANK:
                    $this->game->Resource->payLoanOrRecieveSilver($p_id, $reason, $reason);
                break;
                case BLD_RODEO:
                    $rodeoIncome = min($player_workers, 5);
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
                        if(array_key_exists('vp', $income_b_id[$b_id])){
                            $income_b_id[$b_id]['vp']+=2;
                        } else {
                            $income_b_id[$b_id]['vp']=2;
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