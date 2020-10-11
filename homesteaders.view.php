<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Homesteaders implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * homesteaders.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in homesteaders_homesteaders.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
  require_once( APP_BASE_PATH."view/common/game.view.php" );
  
  class view_homesteaders_homesteaders extends game_view
  {
    function getGameName() {
        return "homesteaders";
    }    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        /*********** Place your code below:  ************/

        $this->tpl['ROUND_STRING'] = _("Round: ");
        $round_number = $this->game->getGameStateValue('round_number');
        $this->tpl['ROUND_NUMBER'] = $round_number;
        $this->tpl['FUTURE_AUCTION'] = _("Show Upcoming Auctions");
        $this->tpl['BUILDING_STOCK'] = _("Building Stock");
        $this->tpl['BUILDING_DISCARD'] = _("Show Discarded Buildings");
        $this->tpl['FUTURE_BUILDING'] = _("Show Upcoming Buildings");

        $this->page->begin_block( "homesteaders_homesteaders", "player_zone" );
        foreach($players as $p_id=>$player){
            $color = $this->game->playerColorNames[$player['player_color']];
            $this->page->insert_block( "player_zone", array(
              'COLOR' => $color,
              'NAME' => $player['player_name']
             ) );
        } 
        
        $auctions = $this->game->getGameStateValue('number_auctions');
        $color_arr = array(1=>'yellow', 2=>'red', 3=>'blue', 4=>'green', 5=>'purple',
                      11=>'lightseargreen', 12=>'orange', 13=>'hotpink');
        $this->page->begin_block( "homesteaders_homesteaders", "auction_string" );
        $this->page->begin_block( "homesteaders_homesteaders", "bid_slot" );
        $this->page->begin_block( "homesteaders_homesteaders", "auction_stacks" );
        for ($a=1; $a <= $auctions; $a++){
          $this->page->insert_block( "auction_stacks", array('A'=> $a) );
          $this->page->insert_block( "auction_string", array('A'=> $a, 'COLOR'=> $color_arr[10+$a]) );
          for ($bid=1; $bid < 10; $bid++){          
            $this->page->insert_block( "bid_slot", array('A'=> $a, 'B'=> $this->game->Bid->bid_cost_array[$bid]) );
          }
        }
        
        $this->page->begin_block( "homesteaders_homesteaders", "train_advancement");
        for ($i=0; $i<6; $i++){
          $this->page->insert_block( "train_advancement", array('I'=> $i) ); 
        }
        
        /*********** Do not change anything below this line  ************/
  	}
  }
  

