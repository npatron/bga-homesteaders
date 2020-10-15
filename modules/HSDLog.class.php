<?php

/*
 * homesteadersLog: a class that allows to log some actions
 *   and then fetch these actions later
 */
class HSDLog extends APP_GameClass
{
  public $game;
  public function __construct($game)
  {
    $this->game = $game;
  }

  /*
   * initStats: initialize statistics to 0 at start of game
   */
  public function initStats($players)
  {
    // Init game statistics
    $this->game->initStat( 'table', 'turns_number', 0 );//TODO: remove this
    $this->game->initStat( 'table', 'outbids_in_auctions', 0 );
    $this->game->initStat( 'table', 'buildings', 0);
    
    foreach ($players as $player_id => $player) {
        $this->game->initStat( 'player', 'buildings', 0, $player_id );
        $this->game->initStat( 'player', 'residential', 0, $player_id );
        $this->game->initStat( 'player', 'industrial', 0, $player_id );
        $this->game->initStat( 'player', 'commercial', 0, $player_id );
        $this->game->initStat( 'player', 'special', 0, $player_id );
        $this->game->initStat( 'player', 'bids', 0, $player_id);
        $this->game->initStat( 'player', 'auctions_won', 0, $player_id );
//        $this->game->initStat( 'player', 'win_auction_1', 0, $player_id);
//        $this->game->initStat( 'player', 'win_auction_2', 0, $player_id);
//        $this->game->initStat( 'player', 'win_auction_3', 0, $player_id);
        $this->game->initStat( 'player', 'spent_on_auctions', 0, $player_id );
        $this->game->initStat( 'player', 'times_outbid', 0, $player_id );
        $this->game->initStat( 'player', 'outbids', 0, $player_id );
        $this->game->initStat( 'player', 'loans', 0, $player_id );
    }
  }

  /*
   * gameEndStats: compute end-of-game statistics
   */
  public function gameEndStats()
  {
      // do thing here.
  }

   /*
   * incrementStats: adjust individual game statistics
   *   - array $stats: format is array of [ player_id, name, value ].
   *     example: [ ['table', 'move'], [23647584, 'move'], ... ]
   *       - player_id: the player ID for a player state, or 'table' for a table stat
   *       - name: the state name, such as 'move' or 'usePower'
   *       - value (optional): amount to add, defaults to 1
   *   - boolean $subtract: true if the values should be decremented
   */
  public function incrementStats($stats, $subtract = false)
  {
    // $this->game->notifyAllPlayers('message', "incrementStats: " . json_encode($stats, JSON_PRETTY_PRINT), []);
    foreach ($stats as $stat) {
      if (!is_array($stat)) {
        throw new BgaVisibleSystemException("incrementStats: Not an array");
      }

      $player_id = $stat[0];
      if ($player_id == 'table' || empty($player_id)) {
        $player_id = null;
      }

      $name = $stat[1];
      if (empty($name)) {
        throw new BgaVisibleSystemException("incrementStats: Missing name");
      }

      $value = 1;
      if (count($stat) > 2) {
        $value = $stat[2];
      }
      if ($subtract) {
        $value = $value * -1;
      }

      $this->game->incStat($value, $name, $player_id);
    }
  }

  /*
   * insert: add a new log entry
   * params:
   *   - $player_id: the player who is making the action
   *   - $piece_id : the piece whose is making the action
   *   - string $action : the name of the action
   *   - array $args : action arguments (eg space)
   */
  public function insert($player_id, $piece_id, $action, $args = [], $stats = [])
  {
    $player_id = $player_id == -1 ? $this->game->getActivePlayerId() : $player_id;
    $moveId = $this->game->getUniqueValueFromDB("SELECT `global_value` FROM `global` WHERE `global_id` = 3");
    $round = $this->game->getGameStateValue("round_number");

    if ($action === 'build'){
      $stats[] = ['table','buildings'];
      $stats[] = [$player_id, 'buildings'];
      $building_type = $this->game->Building->getBuildingTypeFromId($piece_id);
      switch($building_type){
        case TYPE_RESIDENTIAL:
          $stats[] = [$player_id, 'residential'];
        break;
        case TYPE_COMMERCIAL:
          $stats[] = [$player_id, 'industrial'];
        break;
        case TYPE_INDUSTRIAL:
          $stats[] = [$player_id, 'commercial'];
        break;
        case TYPE_SPECIAL:
          $stats[] = [$player_id, 'special'];
        break;
      }
    } else if ($action === 'bid'){
      $stats[] = [$player_id, 'bids'];
    } else if ($action === 'loan'){
      $stats[] = [$player_id, 'loans'];
    } else if ($action === 'outbid'){
      $stats[] = ['table','outbids_in_auctions'];
      $stats[] = [$player_id,'times_outbid'];
      $stats[] = [$args['outbid_by'],'outbids'];
    } else if ($action === 'winAuction'){
      $stats[] = [$player_id, 'auctions_won'];
      $stats[] = [$player_id, 'spent_on_auctions', $args['cost']];
    }

    if (!empty($stats)) {
      $this->incrementStats($stats);
      $args['stats'] = $stats;
    }

    $actionArgs = json_encode($args);

    self::DbQuery("INSERT INTO log (`round`, `move_id`, `player_id`, `piece_id`, `action`, `action_arg`) VALUES ('$round', '$moveId', '$player_id', '$piece_id', '$action', '$actionArgs')");
  }

  /*
   * starTurn: logged whenever a player start its turn, very useful for get current trade/loans
   */
  public function startTurn($p_id)
  {
    $this->insert($p_id, 0, 'startTurn');
  }

  public function allowTrades($p_id)
  {
    $players = $this->game->loadPlayersBasicInfos();
    foreach($players as $p_id=>$player){
      $this->insert($p_id, 0,'allowTrades');
    }
  }

  public function allowTradesAllPlayers()
  {
    $players = $this->game->loadPlayersBasicInfos();
    foreach($players as $p_id=>$player){
      $this->insert($p_id, 0,'allowTrades');
    }
  }

   /*
   * getLastActions : get works and actions of player (used to cancel previous action)
   */
  public function getLastActions($actions = ['build', 'trade', 'loan'], $pId = null, $offset = 0)
  {
    $pId = $pId ?? $this->game->getActivePlayerId();
    $actionsNames = "'" . implode("','", $actions) . "'";

    return self::getObjectListFromDb("SELECT * FROM log WHERE `action` IN ($actionsNames) AND `player_id` = '$pId' AND `round` = (SELECT round FROM log WHERE `player_id` = $pId AND `action` = 'startTurn' ORDER BY log_id DESC LIMIT 1) - $offset ORDER BY log_id DESC");
  }


  /*
   * addBuild: add a new build entry to log
   */
  public function buyBuilding($player_id, $building_id)
  {
      $this->insert($player_id, $building_id, 'build');
  }

  public function takeLoan($player_id) 
  {
    $this->insert($player_id, 0, 'loan');
  }

  public function payOffLoan($player_id){
    $this->insert($player_id, 0, 'loanPaid');
  }

  public function tradeResource($player_id, $trade_away, $trade_for, $undo = false)
  {
    $this->insert($player_id, 0, 'trade', array('tradeAway'=> $trade_away, 'tradeFor'=>$trade_for, 'undo'=>$undo));
  }

  public function passBid($player_id)
  {
    $this->insert($player_id, 0, 'passBid');
  }

  public function outbidPlayer($outbid_player_id, $outbidding_player_id)
  {
    $this->insert($outbid_player_id, 0, 'outbid', array('outbid_by'=>$outbidding_player_id));
  }

  public function winAuction($p_id, $auc_no, $bid_cost)
  {
    $this->insert($p_id, $auc_no, 'winAuction', array('cost'=>$bid_cost));
  }

}