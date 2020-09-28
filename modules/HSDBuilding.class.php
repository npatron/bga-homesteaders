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
        self::DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (building_id, building_type, `stage`, `location`, player_id, worker_slot) VALUES ";
        $values=array();
        // homestead (assigned to each player by player_id)
        foreach( $players as $player_id => $player ) {
            $player_color = $this->game->getPlayerColorName($player_id);
            if ($player_color === 'yellow'){
                $values[] = "('".BUILDING_HOMESTEAD_YELLOW."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'red'){
                $values[] = "('".BUILDING_HOMESTEAD_RED   ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'green'){
                $values[] = "('".BUILDING_HOMESTEAD_GREEN ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'blue'){
                $values[] = "('".BUILDING_HOMESTEAD_BLUE  ."', '".TYPE_RESIDENTIAL."', '0', '".BUILDING_LOC_PLAYER."', '".$player_id."', '2')";
            } else if ($player_color === 'purple'){//if We add purple homestead update the id below.
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
        if (count($players) == 2){
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
        $values[] = "('".BUILDING_GRAIN_MILL       ."','".TYPE_RESIDENTIAL."','".STAGE_SETTLEMENT     ."','".WOOD.STEEL             ."', '0')";
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
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
    }

    /**  getAllDatas method */
    function getAllBuildings(){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot FROM `buildings` ";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    /**** Utility ****/
    function getBuildingFromKey($b_key){
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

    /***** BUYING Building *****/
    /**
     * returns an array of buildings that can be built.
     */
    function getAllowedBuildings() {// into an array of constants
        $build_type_options = $this->game->Auction->getCurrentAuctionBuildTypeOptions();
        if (count($build_type_options) ==0){ return array(); }
            $sql = "SELECT * FROM `buildings` WHERE `location`=".BUILDING_LOC_OFFER." AND (";
            $values = array();
            foreach($build_type_options as $i=>$option){
                $values[] = "`building_type`='".$build_type_options[$i]."'";
            }
            $sql .= implode( ' OR ', $values ); 
            $sql .= ")";
            $buildings = self::getCollectionFromDB( $sql );
        return $buildings;
    }

    function buildBuilding( $p_id, $b_key, $goldAsCow = false, $goldAsCopper = false )
    {
        $afford = $this->canPlayerAffordBuilding ($p_id, $b_key, $goldAsCow, $goldAsCopper);
        $b_id = $this->getBuildingIdFromKey($b_key);
        $b_name = $this->getBuildingNameFromId($b_id);
        if (!$afford){
            throw new BgaUserException( _("You cannot afford to build ".$b_name));
        }
        
        if ($this->doesPlayerOwnBuilding($p_id, $b_id)){
            throw new BgaUserException( _("You have already built a ".$b_name));
        }
        $this->payForBuilding($p_id, $b_key, $goldAsCow, $goldAsCopper);
        $this->game->notifyAllPlayers( "buildBuilding", 
                    clienttranslate( '${player_name} builds a ${building_name} ' ),            
                    array(  'player_id' => $p_id,
                            'player_name' => $this->game->getPlayerName($p_id),
                            'building_key' => $b_key,
                            'building_id' => $b_id,
                            'building_name' => $b_name,) );
        $this->game->Log->buyBuilding($p_id, $b_id);
        $sql = "UPDATE `buildings` SET `location`= ".BUILDING_LOC_PLAYER.", `player_id`=".$p_id." WHERE `building_key`=".$b_key;
        $this->game->DbQuery( $sql );
        
        $sql = "SELECT `player_score` FROM `player` WHERE `player_id`='".$p_id."'";
        $score = $this->game->getUniqueValueFromDB( $sql );
        $building_score = $this->getBuildingScoreFromId( $b_id );
        $score += $building_score;
        $sql = "UPDATE `player` SET `player_score`='".$score."'";
        $this->game->DbQuery( $sql );
    }

    function payForBuilding($p_id, $b_key, $goldAsCow, $goldAsCopper){
        $b_cost = $this->getBuildingCostFromKey ($b_key);
        if ($goldAsCow)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'cow', 'gold');
        if ($goldAsCopper)
            $b_cost = $this->game->Resource->changeResourceInArray($b_cost,'copper', 'gold');
        $b_name = $this->getBuildingNameFromKey ($b_key);
        foreach ($b_cost as $type => $cost){
            if ($cost > (int)0){
                $this->game->Resource->updateAndNotifyPayment($p_id, $type, $cost, "building ".$b_name);
            }
        }
    }

    function getOnBuildBonusForBuildingKey($b_key){
        $b_id = $this->getBuildingIdFromKey($b_key);
        switch ($b_id){
            case BUILDING_BOARDING_HOUSE:
                return BUILD_BONUS_PAY_LOAN;
            case BUILDING_RANCH:
                return BUILD_BONUS_TRADE;
            case BUILDING_WORKSHOP:
                return BUILD_BONUS_WORKER;
            case BUILDING_DEPOT:
            case BUILDING_FORGE:
            case BUILDING_RAIL_YARD:
                return BUILD_BONUS_RAIL_ADVANCE;
            case BUILDING_TRAIN_STATION:
                return BUILD_BONUS_TRACK_AND_BUILD;
            default:
                return BUILD_BONUS_NONE;
        }
    }

    function getBuildingScoreFromId($b_id) {
        switch($b_id){
            case BUILDING_FORGE:
                return 1;
            case BUILDING_GRAIN_MILL: 
            case BUILDING_MARKET:
            case BUILDING_GENERAL_STORE:
            case BUILDING_WORKSHOP:
            case BUILDING_MEATPACKING_PLANT:
                return 2;
            case BUILDING_BANK:
            case BUILDING_DUDE_RANCH:
            case BUILDING_TRAIN_STATION:
                return 3;
            case BUILDING_RODEO:
            case BUILDING_LAWYER:
                return 4;
            case BUILDING_FACTORY:
            case BUILDING_FAIRGROUNDS:
            case BUILDING_TERMINAL:
            case BUILDING_RAIL_YARD:
                return 6;
            case BUILDING_RESTARAUNT:
            case BUILDING_CIRCUS:
                return 8;
            case BUILDING_CHURCH:
            case BUILDING_TOWN_HALL:
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
        $riverPortWorkers = 0;

        $sql = "SELECT * FROM `buildings` WHERE `player_id` = '".$p_id."'";
        $player_buildings = self::getCollectionFromDB( $sql );
        $sql = "SELECT * FROM `workers` WHERE `player_id` = '".$p_id."'";
        $player_workers = self::getCollectionFromDB( $sql );
        foreach( $player_buildings as $building_key => $building ) {
            switch($building['building_id']) {
                case BUILDING_HOMESTEAD_YELLOW:
                case BUILDING_HOMESTEAD_RED:
                case BUILDING_HOMESTEAD_GREEN:
                case BUILDING_HOMESTEAD_BLUE:
                case BUILDING_BOARDING_HOUSE:
                case BUILDING_DEPOT:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'silver', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_GRAIN_MILL:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'food', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_MARKET:
                case BUILDING_GENERAL_STORE:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_STEEL_MILL:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'steel', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_RAILWORKERS_HOUSE:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'silver', 1, $this->getBuildingNameFromKey($building_key));
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_TRADING_POST:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'trade', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_CHURCH:
                case BUILDING_FACTORY:
                case BUILDING_LAWYER:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'vp', 2, $this->getBuildingNameFromKey($building_key));
                    break;
                case BUILDING_WORKSHOP:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'vp', 1, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_STABLES:
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'trade', 1, $this->getBuildingNameFromKey($building_key));
                    $this->game->Resource->updateAndNotifyIncome ($p_id, 'vp', 1, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_BANK:
                    $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$p_id."'");
                    if ($playerLoan== 0){
                        $this->game->Resource->updateAndNotifyIncome ($p_id, 'silver', 1, $this->getBuildingNameFromKey($building_key));
                    } else {
                        $this->game->Resource->updateAndNotifyPayment ($p_id, 'loan', 1, $this->getBuildingNameFromKey($building_key));
                    }
                break;
                case BUILDING_RODEO:
                    $rodeoIncome = min($player_workers, 5);
                    $this->game->Resource->updateAndNotifyIncome ($p_id,  'silver', $rodeoIncome, $this->getBuildingNameFromKey($building_key));
                break;
                case BUILDING_FAIRGROUNDS:
                    $this->game->Resource->updateAndNotifyIncome ($p_id,  'gold', 1, $this->getBuildingNameFromKey($building_key));
                break;
            }
        }
        foreach($player_workers as $worker_key => $worker ) {
            $b_key = $worker['building_key'];
            $b_id = $this->getBuildingIdFromKey($b_key);
            $worker_income_string = 'worker at '.$this->getBuildingNameFromKey($b_key);
            switch($b_id){
                case BUILDING_HOMESTEAD_YELLOW:
                case BUILDING_HOMESTEAD_RED:
                case BUILDING_HOMESTEAD_GREEN:
                case BUILDING_HOMESTEAD_BLUE:
                    if ($worker['building_slot'] == 1){
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'wood', 1, $worker_income_string);
                    } else {
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', 1, $worker_income_string);
                    }
                    break;
                case BUILDING_FARM:
                    if ($worker['building_slot'] == 1){
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'trade', 1, $worker_income_string);
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'silver', 2, $worker_income_string);
                    } else {
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'food', 1, $worker_income_string);
                    }
                    break;
                case BUILDING_MARKET:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'silver', 2, $worker_income_string);
                    break;
                case BUILDING_FOUNDRY:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'steel', 1, $worker_income_string);
                    break;
                case BUILDING_RANCH:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'cow', 1, $worker_income_string);
                    break;
                case BUILDING_GOLD_MINE:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'gold', 1, $worker_income_string);
                    break;
                case BUILDING_COPPER_MINE:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'copper', 1, $worker_income_string);
                    break;
                case BUILDING_RIVER_PORT:
                    if ($riverPortWorkers++ ==1){// only triggers on 2nd worker assigned to this building
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'gold', 1, $worker_income_string);
                    } 
                    break;
                case BUILDING_MEATPACKING_PLANT:
                case BUILDING_FORGE:
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', 2, $worker_income_string);
                    break;
            }
        }
    }

}