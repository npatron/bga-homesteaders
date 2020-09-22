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

    function createBuildings($gamePlayers){
        self::DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (`building_id`, `building_type`, `stage`, `location`, `player_id`, `worker_slot`) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $gamePlayers as $player_id => $player ) {
            $player_color = self::$playerColorNames[$player['player_color']];
            if ($player_color === 'yellow'){
                $values[] = "('".BUILDING_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'red'){
                $values[] = "('".BUILDING_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'green'){
                $values[] = "('".BUILDING_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BUILDING_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            }
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        $sql = "INSERT INTO buildings (building_id, building_type, stage, cost, worker_slot) VALUES ";
        $values=array();
        // some building have 2 copies in 2 player, and 3 copies in 3-4 player
        $count_3x = 3;
        // some buildings have 2 copies in 3-4 player
        $count_2x = 2; 
        if (count($gamePlayers) == 2){
            $count_3x = 2;
            $count_2x = 1; 
        }
        for($i = 0; $i < $count_3x; $i++) 
        {
            $values[] = "('".BUILDING_FARM   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT."','".WOOD."', '2')";
            $values[] = "('".BUILDING_MARKET ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT."','".WOOD."', '1')";
            $values[] = "('".BUILDING_FOUNDRY."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT."','".NONE."', '1')";
        }
        
        for($i = 0; $i < $count_2x ; $i++) 
        {
            $values[] = "('".BUILDING_RANCH        ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL.FOOD."', '1')";
            $values[] = "('".BUILDING_GENERAL_STORE."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".STEEL          ."', '0')";
            $values[] = "('".BUILDING_GOLD_MINE    ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.STEEL     ."', '1')";
            $values[] = "('".BUILDING_COPPER_MINE  ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD.STEEL."', '1')";
            $values[] = "('".BUILDING_RIVER_PORT   ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT_TOWN."','".WOOD           ."', '3')";
            $values[] = "('".BUILDING_WORKSHOP     ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".STEEL          ."', '0')";
            $values[] = "('".BUILDING_DEPOT        ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".WOOD.STEEL     ."', '0')";
            $values[] = "('".BUILDING_FORGE        ."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".STEEL.STEEL    ."', '1')";
            $values[] = "('".BUILDING_DUDE_RANCH   ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.FOOD      ."', '0')";
            $values[] = "('".BUILDING_RESTARAUNT   ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0')";
            $values[] = "('".BUILDING_TERMINAL     ."','".TYPE_COMMERCIAL ."','".STAGE_CITY           ."','".STEEL.STEEL    ."', '0')";
            $values[] = "('".BUILDING_TRAIN_STATION."','".TYPE_INDUSTRIAL ."','".STAGE_CITY           ."','".WOOD.COPPER    ."', '0')";
        }
        //all other buildings
        $values[] = "('".BUILDING_GRAIN_MILL       ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.STEEL             ."', '0')";
        $values[] = "('".BUILDING_STEEL_MILL       ."','".TYPE_INDUSTRIAL ."','".STAGE_SETTLEMENT     ."','".WOOD.WOOD.GOLD         ."', '0')";
        $values[] = "('".BUILDING_BOARDING_HOUSE   ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".WOOD.WOOD              ."', '0')";
        $values[] = "('".BUILDING_RAILWORKERS_HOUSE."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT_TOWN."','".STEEL.STEEL            ."', '0')";
        $values[] = "('".BUILDING_TRADING_POST     ."','".TYPE_COMMERCIAL ."','".STAGE_SETTLEMENT_TOWN."','".GOLD                   ."', '0')";
        $values[] = "('".BUILDING_CHURCH           ."','".TYPE_RESIDENTIAL."','".STAGE_TOWN           ."','".WOOD.STEEL.GOLD.COPPER ."', '0')";
        $values[] = "('".BUILDING_BANK             ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".STEEL.COPPER           ."', '0')";
        $values[] = "('".BUILDING_STABLES          ."','".TYPE_COMMERCIAL ."','".STAGE_TOWN           ."','".COW                    ."', '2')";
        $values[] = "('".BUILDING_MEATPACKING_PLANT."','".TYPE_INDUSTRIAL ."','".STAGE_TOWN           ."','".WOOD.COW               ."', '0')";
        $values[] = "('".BUILDING_FACTORY          ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".STEEL.STEEL.COPPER     ."', '0')";
        $values[] = "('".BUILDING_RODEO            ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".FOOD.COW               ."', '0')";
        $values[] = "('".BUILDING_LAWYER           ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.GOLD.COW          ."', '0')";
        $values[] = "('".BUILDING_FAIRGROUNDS      ."','".TYPE_SPECIAL    ."','".STAGE_TOWN           ."','".WOOD.WOOD.COPPER.COW   ."', '0')";
        $values[] = "('".BUILDING_TOWN_HALL        ."','".TYPE_RESIDENTIAL."','".STAGE_CITY           ."','".WOOD.WOOD.COPPER       ."', '0')";
        $values[] = "('".BUILDING_CIRCUS           ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".FOOD.FOOD.COW          ."', '0')";
        $values[] = "('".BUILDING_RAIL_YARD        ."','".TYPE_SPECIAL    ."','".STAGE_CITY           ."','".STEEL.STEEL.GOLD.COPPER."', '0')";
        sort($values);// this groups them by id's before creating them.
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    function getBuildingFromKey($building_key){
        $sql = "SELECT * from `buildings` where `building_key`='$building_key'";
        $building = self::getObjectFromDB($sql);
        return ($building);
    }

    function getBuildingNameFromKey($building_key){
        $building = $this->getBuildingFromKey($building_key);
        $buildingName = $this->getBuildingNameFromId($building['building_id']);
        return ($buildingName);
    }

    function getBuildingNameFromId($building_id){
        switch($building_id)
        {
            case BUILDING_HOMESTEAD_YELLOW:
            case BUILDING_HOMESTEAD_RED:
            case BUILDING_HOMESTEAD_GREEN:
            case BUILDING_HOMESTEAD_BLUE:
                return clienttranslate( 'Homestead' );
            case BUILDING_GRAIN_MILL:
                return clienttranslate( 'Grain Mill' );
            case BUILDING_FARM:
                return clienttranslate( 'Farm' );
            case BUILDING_MARKET:
                return clienttranslate( 'Market' );
            case BUILDING_FOUNDRY:
                return clienttranslate( 'Foundry' );
            case BUILDING_STEEL_MILL:
                return clienttranslate( 'Steel Mill' );
            case BUILDING_BOARDING_HOUSE:
                return clienttranslate( 'Boarding House' );
            case BUILDING_RAILWORKERS_HOUSE:
                return clienttranslate( 'Railworkers House' );
            case BUILDING_RANCH:
                return clienttranslate( 'Ranch' );
            case BUILDING_TRADING_POST:
                return clienttranslate( 'Trading Post' );
            case BUILDING_GENERAL_STORE:
                return clienttranslate( 'General Store' );
            case BUILDING_GOLD_MINE:
                return clienttranslate( 'Gold Mine' );
            case BUILDING_COPPER_MINE:
                return clienttranslate( 'Copper Mine' );
            case BUILDING_RIVER_PORT:
                return clienttranslate( 'River Port' );
            case BUILDING_CHURCH:
                return clienttranslate( 'Church' );
            case BUILDING_WORKSHOP:
                return clienttranslate( 'Workshop' );
            case BUILDING_DEPOT:
                return clienttranslate( 'Depot' );
            case BUILDING_STABLES:
                return clienttranslate( 'Stables' );
            case BUILDING_BANK:
                return clienttranslate( 'Bank' );
            case BUILDING_MEATPACKING_PLANT:
                return clienttranslate( 'Meatpacking Plant' );
            case BUILDING_FORGE:
                return clienttranslate( 'Forge' );
            case BUILDING_FACTORY:
                return clienttranslate( 'Factory' );
            case BUILDING_RODEO:
                return clienttranslate( 'Rodeo' );
            case BUILDING_LAWYER:
                return clienttranslate( 'Lawyer' );
            case BUILDING_FAIRGROUNDS:
                return clienttranslate( 'Fairgrounds' );
            case BUILDING_DUDE_RANCH:
                return clienttranslate( 'Dude Ranch' );
            case BUILDING_TOWN_HALL:
                return clienttranslate( 'Town Hall' );
            case BUILDING_TERMINAL:
                return clienttranslate( 'Terminal' );
            case BUILDING_RESTARAUNT:
                return clienttranslate( 'Restataunt' );
            case BUILDING_TRAIN_STATION:
                return clienttranslate( 'Train Station' );
            case BUILDING_CIRCUS:
                return clienttranslate( 'Circus' );
            case BUILDING_RAIL_YARD:
                return clienttranslate( 'Rail yard' );
        }
    }

    function getBuildingCostFromKey($building_key){
        $building = $this->getBuildingFromKey($building_key);
        $cost = $building['cost'];
        $building_cost = array(
            'wood'  =>  '0',
            'steel' =>  '0',
            'gold'  =>  '0',
            'copper' => '0',
            'food'  =>  '0',
            'cow'   =>  '0',
        );
        if ($cost == "0") 
            return $building_cost;
        for ($i =0; $i < strlen($cost); $i++){
            switch($cost[$i]){
                case WOOD:
                    $building_cost['wood'] ++;
                break;
                case STEEL:
                    $building_cost['steel'] ++;
                break;
                case GOLD:
                    $building_cost['gold'] ++;
                break;
                case COPPER:
                    $building_cost['copper'] ++;
                break;
                case FOOD:
                    $building_cost['food'] ++;
                break;
                case COW:
                    $building_cost['cow'] ++;
                break;
            }
        }
        return $building_cost;
    }

    function canPlayerAffordBuilding($player_id, $building_key){
        return $this->game->canPlayerAfford($player_id, );
    }

    function getBuildingIncome($player_id){
        $riverPortWorkers = 0;

        $sql = "SELECT * FROM `buildings` WHERE `player_id` = '".$player_id."'";
        $player_buildings = self::getCollectionFromDB( $sql );
        $sql = "SELECT * FROM `workers` WHERE `player_id` = '".$player_id."'";
        $player_workers = self::getCollectionFromDB( $sql );
        foreach( $player_buildings as $building_key => $building ) {
            switch($building['building_id']) {
                case BUILDING_HOMESTEAD_YELLOW:
                case BUILDING_HOMESTEAD_RED:
                case BUILDING_HOMESTEAD_GREEN:
                case BUILDING_HOMESTEAD_BLUE:
                case BUILDING_BOARDING_HOUSE:
                case BUILDING_DEPOT:
                    $this->game->updateAndNotifyIncome ($player_id, 'silver', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_GRAIN_MILL:
                    $this->game->updateAndNotifyIncome ($player_id, 'food', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_MARKET:
                case BUILDING_GENERAL_STORE:
                    $this->game->updateAndNotifyIncome ($player_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_STEEL_MILL:
                    $this->game->updateAndNotifyIncome ($player_id, 'steel', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_RAILWORKERS_HOUSE:
                    $this->game->updateAndNotifyIncome ($player_id, 'silver', 1, $this->getBuildingNameFromKey($building_key));
                    $this->game->updateAndNotifyIncome ($player_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_TRADING_POST:
                    $this->game->updateAndNotifyIncome ($player_id, 'trade', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_CHURCH:
                case BUILDING_FACTORY:
                case BUILDING_LAWYER:
                    $this->game->updateAndNotifyIncome ($player_id, 'vp', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_WORKSHOP:
                    $this->game->updateAndNotifyIncome ($player_id, 'vp', 1, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_STABLES:
                    $this->game->updateAndNotifyIncome ($player_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    $this->game->updateAndNotifyIncome ($player_id, 'vp', 1, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_BANK:
                    $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$player_id."'");
                    if ($playerLoan== 0){
                        $this->game->updateAndNotifyIncome ($player_id, 'silver', 1, $this->getBuildingNameFromKey($building_key));
                    } else {
                        $this->game->updateAndNotifyPayment ($player_id, 'loan', 1, $this->getBuildingNameFromKey($building_key));
                    }
                break;
                case BUILDING_RODEO:
                    $playerWorkers = $this->game->getUniqueValueFromDb("SELECT `workers` FROM `resources` WHERE `player_id`='".$player_id."'");
                    $rodeoIncome = min($playerWorkers, 5);
                    $this->game->updateAndNotifyIncome ($player_id,  'silver', $rodeoIncome, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_FAIRGROUNDS:
                    $this->game->updateAndNotifyIncome ($player_id,  'gold', 1, $this->getBuildingNameFromKey($building_key));
                break;
            }
        }
        foreach($player_workers as $worker_key => $worker ) {
            $building_key = $worker['building_key'];
            $worker_income_string = 'worker at '.$this->Building->getBuildingNameFromKey($building_key);
            switch($building_key){
                case BUILDING_HOMESTEAD_YELLOW:
                case BUILDING_HOMESTEAD_RED:
                case BUILDING_HOMESTEAD_GREEN:
                case BUILDING_HOMESTEAD_BLUE:
                    if ($worker['building_slot'] == 1){
                        $this->game->updateAndNotifyIncome($player_id, 'wood', 1, $worker_income_string);
                    } else {
                        $this->game->updateAndNotifyIncome($player_id, 'vp', 1, $worker_income_string);
                    }
                    break;
                case BUILDING_FARM:
                    if ($worker['building_slot'] == 1){
                        $this->game->updateAndNotifyIncome($player_id, 'trade', 1, $worker_income_string);
                        $this->game->updateAndNotifyIncome($player_id, 'silver', 2, $worker_income_string);
                    } else {
                        $this->game->updateAndNotifyIncome($player_id, 'food', 1, $worker_income_string);
                    }
                    break;
                case BUILDING_MARKET:
                    $this->game->updateAndNotifyIncome($player_id, 'silver', 2, $worker_income_string);
                    break;
                case BUILDING_FOUNDRY:
                    $this->game->updateAndNotifyIncome($player_id, 'steel', 1, $worker_income_string);
                    break;
                case BUILDING_RANCH:
                    $this->game->updateAndNotifyIncome($player_id, 'cow', 1, $worker_income_string);
                    break;
                case BUILDING_GOLD_MINE:
                    $this->game->updateAndNotifyIncome($player_id, 'gold', 1, $worker_income_string);
                    break;
                case BUILDING_COPPER_MINE:
                    $this->game->updateAndNotifyIncome($player_id, 'copper', 1, $worker_income_string);
                    break;
                case BUILDING_RIVER_PORT:
                    if ($riverPortWorkers++ ==1){// only triggers on 2nd worker assigned to this building
                        $this->game->updateAndNotifyIncome($player_id, 'gold', 1, $worker_income_string);
                    } 
                    break;
                case BUILDING_MEATPACKING_PLANT:
                case BUILDING_FORGE:
                    $this->game->updateAndNotifyIncome($player_id, 'vp', 2, $worker_income_string);
                    break;
            }
        }
    }

}