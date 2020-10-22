<?php

/*
 * HSDScore: a class that allows handles Scoring Related Methods.
 */
class HSDScore extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    /**  get score */
    function dbGetScore($player_id) {
        return $this->game->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
    }

    /**  set score  */
    function dbSetScore($player_id, $count) {
        $this->game->DbQuery("UPDATE player SET player_score='$count' WHERE player_id='$player_id'");
    }

    /**  set aux score (tie breaker) */
    function dbSetAuxScore($player_id, $score) {
        $this->game->DbQuery("UPDATE player SET player_score_aux=$score WHERE player_id='$player_id'");
    }

    /** increment score (can be negative too) */
    function dbIncScore($player_id, $inc) {
        $count = $this->dbGetScore($player_id);
        if ($inc != 0) {
            $count += $inc;
            $this->dbSetScore($player_id, $count);
        }
        return $count;
    }

    function UpdateEndgameScores(){
        $players = $this->game->loadPlayersBasicInfos();
        foreach($players as $p_id=>$player){
            $p_score = $this->calculateEndgameScore($p_id);
        }
    }

    function calculateEndgameScore($p_id){
        // after round 10, final Income Round (no auction) then scoring.
        // also update stats with these values. so endgame will be more interesting.
        // Score comes from these places.
        // VP tokens
        $vp_tokens = $this->getVPTokens($p_id);
        $this->game->setStat($vp_tokens, 'vp_chits', $p_id);
        // Buildings
        $bld_score = $this->dbGetScore($p_id);
        $this->game->setStat($bld_score, 'building_vp', $p_id);
        // Building VP's
        $bld_bonus_score =  $this->getPlayerVPsFromBuildings($p_id);
        $bld_res_score = $bld_bonus_score[TYPE_RESIDENTIAL];
        $bld_com_score = $bld_bonus_score[TYPE_COMMERCIAL];
        $bld_ind_score = $bld_bonus_score[TYPE_INDUSTRIAL];
        $bld_sp_score =  $bld_bonus_score[TYPE_SPECIAL];
        
        $vp_res = $this->getPlayerVPFromResources($p_id);
        // 2VP per gold
        $gold = $vp_res['gold'];
        $this->game->setStat($gold, 'vp_gold', $p_id);
        // 2VP per cow
        $cow = $vp_res['cow'];
        $this->game->setStat($cow, 'vp_cow', $p_id);
        // 2VP per Copper
        $copper = $vp_res['copper'];
        $this->game->setStat($copper, 'vp_copper', $p_id);
        // 1 + 2 + 3 + 4 + 5 etc for loans
        $loans = $this->getScoreFromLoans($p_id);
        $this->game->setStat($loans, 'vp_loan', $p_id);
        $allScores = array(
            'vp'   => $vp_tokens,
            'bld'  => $bld_score,
            TYPE_RESIDENTIAL=> $bld_res_score,
            TYPE_COMMERCIAL => $bld_com_score,
            TYPE_INDUSTRIAL => $bld_ind_score,
            TYPE_SPECIAL    => $bld_sp_score,
            'gold'  => $gold,
            'cow'   => $cow,
            'copper'=> $copper,
            'loan'  => $loans,
        );
        $total = 0;
        foreach ($allScores[$p_id] as $type =>$val){
            $total += $val;
        }
        $allScores['total'] = $total;
        $this->dbSetScore($p_id, $total);
        $p_silver = $this->game->Resource->getPlayerResourceAmount($p_id,'silver');
        $this->dbSetAuxScore($p_id, $p_silver);
        return $allScores;
    }

    function getVPTokens($p_id){
        return $this->game->getUniqueValueFromDB("SELECT `vp` from `resources` WHERE `player_id` = '$p_id'");
    }

    function getScoreFromLoans($p_id){
        $loans =  $this->game->getUniqueValueFromDB("SELECT `vp` from `resources` WHERE `player_id` = '$p_id'");
        $score = 0;
        for($i=1; $i<= $loans; $i++)
            $score -=$i;
        return $score;
    }

    function getPlayerVPFromResources(Int $p_id)
    {
        $resources = $this->game->getObjectFromDB("SELECT `gold`, `copper`, `cow` from `resources` WHERE `player_id` = '$p_id'");
        $vp = array();
        foreach($resources as $type=>$amt){
            $vp[$type] = ($amt * 2);
        }
        return $vp;
    }

    function getPlayerVPsFromBuildings (Int $p_id)
    {
        $p_buildings = $this->game->Buildings->getAllPlayerBuildings($p_id);
        $counts =array(TYPE_RESIDENTIAL=>0,
                     TYPE_COMMERCIAL=>0,
                     TYPE_INDUSTRIAL=>0,
                     TYPE_SPECIAL=>0,);
        foreach($p_buildings as $b_key => $building){
            $counts[$p_buildings[$b_key]['b_type']]++;
        }
        $counts['worker'] = $this->game->getUniqueValueFromDB("SELECT `workers` FROM `resources` WHERE `player_id`='$p_id'");
        $counts['track'] = $this->game->getUniqueValueFromDB("SELECT `track` FROM `resources` WHERE `player_id`='$p_id'");
        
        $this->game->setStat(count($p_buildings), 'buildings', $p_id);
        $this->game->setStat($counts[TYPE_RESIDENTIAL], 'residential', $p_id);
        $this->game->setStat($counts[TYPE_COMMERCIAL], 'industrial', $p_id);
        $this->game->setStat($counts[TYPE_INDUSTRIAL], 'commercial', $p_id);
        $this->game->setStat($counts[TYPE_SPECIAL],    'special', $p_id);

        $vps = array(TYPE_RESIDENTIAL=>0,
                     TYPE_COMMERCIAL=>0,
                     TYPE_INDUSTRIAL=>0,
                     TYPE_SPECIAL=>0,);
        foreach($p_buildings as $b_key => $building){
            $b_type = $p_buildings[$b_key]['b_type'];
            $b_id   = $p_buildings[$b_key]['b_id']; 
            switch($b_id){
                case BLD_DUDE_RANCH:
                case BLD_CIRCUS:
                    $vps[$b_type] += $counts['worker'];
                    $this->game->setStat($counts['worker'], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_RAILWORKERS_HOUSE: // track worker
                    $vps[$b_type] += $counts['worker'] + $counts['track'];
                    $this->game->setStat($counts['worker'] + $counts['track'], `bonus_vp_${b_id}`, $p_id);
                     break;
                case BLD_DEPOT: 
                case BLD_TERMINAL:
                    $vps[$b_type] += $counts['track'];
                    $this->game->setStat($counts['track'], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_STABLES: 
                case BLD_FAIRGROUNDS:
                    $vps[$b_type] += $counts[TYPE_RESIDENTIAL];
                    $this->game->setStat($counts[TYPE_RESIDENTIAL], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_LAWYER:
                case BLD_TOWN_HALL:
                    $vps[$b_type] += $counts[TYPE_COMMERCIAL];
                    $this->game->setStat($counts[TYPE_COMMERCIAL], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_BOARDING_HOUSE:
                case BLD_FACTORY:
                    $vps[$b_type] += $counts[TYPE_INDUSTRIAL];
                    $this->game->setStat($counts[TYPE_INDUSTRIAL], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_BANK:
                case BLD_RESTARAUNT:
                    $vps[$b_type] += $counts[TYPE_SPECIAL];
                    $this->game->setStat($counts[TYPE_SPECIAL], `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_RAIL_YARD:
                    $vps[$b_type] += count($p_buildings);
                    $this->game->setStat(count($p_buildings), `bonus_vp_${b_id}`, $p_id);
                break;
                case BLD_POST_OFFICE:
                    // figure this out later when doing expansion.
                    // vp per loan paid at end of game.
                break;
                default:   
                    //$vps[$b_type]+= $building['b_vp'];
                break;
            }
        }
        return $vps;
    }
}
