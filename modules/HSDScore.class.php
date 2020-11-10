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

    function updateEndgameScores(){
        $players = $this->game->loadPlayersBasicInfos();
        $row1 = array( '' );
        $row2 = array(_('VP from Tokens'));
        $row3 = array(_('building VPs'));
        $row4 = array(_('bonus building VPs'));
        $row5 = array(_('VP from Gold'));
        $row6 = array(_('VP from Livestock'));
        $row7 = array(_('VP from Copper'));
        $row8 = array(_('VP from Loans'));
        $row9 = array(_('Total VPs'));
        foreach($players as $p_id=>$player){
            $p_score = $this->calculateEndgameScore($p_id);
            $row1[] = array( 'str' => '${player_name}',
                                 'args' => array( 'player_name' => $player['player_name'] ),
                                 'type' => 'header');  
            $row2[] = $p_score['vp'];
            $row3[] = $p_score['bld'];
            $row4[] = $p_score['bonus'];
            $row5[] = $p_score['gold'];
            $row6[] = $p_score['cow'];
            $row7[] = $p_score['copper'];
            $row8[] = $p_score['loan'];
            $row9[] = $p_score['total'];
        }
        $table = array(
            $row1, $row2, $row3, $row4,$row5, 
            $row6, $row7, $row8, $row9,);
        $this->game->notifyAllPlayers( "tableWindow", '', array(
            "id" => 'finalScoring',
            "title" => clienttranslate("Final Scoring"),
            "table" => $table,
            "closing" => clienttranslate( "Close" ),
        ) ); 
    }

    function calculateEndgameScore($p_id){
        // after round 10, final Income Round (no auction) then scoring.
        // also update stats with these values. so endgame will be more interesting.
        // Score comes from these places.
        // VP tokens
        $vp_tokens = $this->getVPTokens($p_id);
        $this->game->setStat($vp_tokens, 'vp_chits', $p_id);
        
        // Building VP's
        $bld_bonus_score =  $this->getPlayerVPsFromBuildings($p_id);
        $bld_score =     $bld_bonus_score['static']; //$this->dbGetScore($p_id);
        $this->game->setStat($bld_score, 'building_vp', $p_id);
        $bonus = $bld_bonus_score['bonus'];
        
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
        $this->game->NotifyAllPlayers('bldScore', 'updating ${player_name}s scores', array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'resource'=> array(
                'vp'=>$vp_tokens,
                'gold'=>$gold,
                'cow'=>$cow,
                'copper'=>$copper,
                'vp_loan'=>$loans,),
        ));
        $allScores = array(
            'vp'    => $vp_tokens,
            'bld'   => $bld_score,
            'bonus' => $bonus,
            'gold'  => $gold,
            'cow'   => $cow,
            'copper'=> $copper,
            'loan'  => $loans,
        );
        $total = 0;
        foreach ($allScores as $type =>$val){
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
        $loans = $this->game->getUniqueValueFromDB("SELECT `loan` from `resources` WHERE `player_id` = '$p_id'");
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
        $p_buildings = $this->game->Building->getAllPlayerBuildings($p_id);
        $counts = array(TYPE_RESIDENTIAL=>0,
                     TYPE_COMMERCIAL=>0,
                     TYPE_INDUSTRIAL=>0,
                     TYPE_SPECIAL=>0,);
        foreach($p_buildings as $b_key => $building){
            $counts[$p_buildings[$b_key]['b_type']]++;
        }
        $counts[VP_B_WORKER] = $this->game->getUniqueValueFromDB("SELECT `workers` FROM `resources` WHERE `player_id`='$p_id'");
        $counts[VP_B_TRACK] = $this->game->getUniqueValueFromDB("SELECT `track` FROM `resources` WHERE `player_id`='$p_id'");
        $counts[VP_B_BUILDING] = count($p_buildings);
        $counts[VP_B_WRK_TRK] = $counts[VP_B_TRACK] +$counts[VP_B_WORKER];

        $this->game->setStat($counts[VP_B_BUILDING],    'buildings', $p_id);
        $this->game->setStat($counts[TYPE_RESIDENTIAL], 'residential', $p_id);
        $this->game->setStat($counts[TYPE_COMMERCIAL],  'industrial', $p_id);
        $this->game->setStat($counts[TYPE_INDUSTRIAL],  'commercial', $p_id);
        $this->game->setStat($counts[TYPE_SPECIAL],     'special', $p_id);
        
        $vps = array('static'=>0,
                     'bonus'=>0,);
        $vps_b = array();
        foreach($p_buildings as $b_key => $building){
            $b_id   = $p_buildings[$b_key]['b_id']; 
            $b_static_vp = (array_key_exists('vp',$this->game->building_info[$b_id])?$this->game->building_info[$b_id]['vp']:0);
            $vps['static']+= $b_static_vp;
            if (array_key_exists('vp_b',$this->game->building_info[$b_id])){
                $vp_index = $this->game->building_info[$b_id]['vp_b'];
                $vps['bonus'] += $counts[$vp_index];
                $this->game->setStat($counts[$vp_index], "bonus_vp_${b_id}", $p_id);
                $vps_b[$b_key] = array('bonus'=>$counts[$vp_index], 'static'=>$b_static_vp);
            } else throw new BgaVisibleSystemException ($b_id.'vp missing');
        }
        $this->game->NotifyAllPlayers('bldScore', 'updating ${player_name}s scores', array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'buildings'=>$vps_b));
        return $vps;
    }
}
