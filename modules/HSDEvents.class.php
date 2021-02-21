<?php

/*
 * HSDEvents: a class that allows handles Events Related Methods.
 */
class HSDEvents extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    function createEvents(){
        // auctions DB is perfectly ok for handing Events. (location == 5)
        $this->game->DbQuery("DELETE FROM `auctions`");
        $sql = "INSERT INTO `auctions` (`auction_id`, `position`, `location`) VALUES ";
        $values=array();
        
        $settlement = range(51, 60);
        shuffle($settlement);
        for($i=1;$i <5;$i++){
            $values[] = "(".array_pop($settlement).", $i, 5)";
        }
        $town = range(61, 70);
        shuffle($town);
        for($i=5;$i <9;$i++){
            $values[] = "(".array_pop($town).", $i, 5)";
        }
        $city = range(71, 75);
        shuffle($city);
        for($i=9;$i <11;$i++){
            $values[] = "(".array_pop($city).", $i, 5)";
        }

        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }

    function updateEvent($round_number){
        $events = $this->getGameStateValue('new_beginning_evt');
        $sql = "SELECT `auction_id` FROM `auctions` WHERE `position`=5";
        
        if ( $events == ENABLED ){
            foreach ($auctions as $id=>$value){
                if ($value['position']==5){
                    $this->setGameStateValue('current_event', $id);
                    break;
                }
            }
        }
        
    }
}