
import React from 'react'
import styles from '../styles/Home.module.css';
import Popup from 'reactjs-popup'

const Rules = () => (
    <div className = 'clickable'> 
    <div > 
    <Popup
    trigger = {<div> Rules:<img src="/Rule_Book.png" alt="Rule Book" className={styles.logo}/></div>} position ='center center' 
      modal
      nested
    >
      {close => (
        <div className="modal">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header"> <b> How to play</b> </div>
          <div className="content">
            {' '}
            <div>
                <ol> 
                    <li> <p> One player is designated as Dealer at random from all players.</p></li>
                    <li> <p> Each player is dealt 3 cards.</p>
                            <ul>
                                <li> <p> Each card has one word or phrase written on it that corresponds to a Google search.</p></li> 
                                <li> <p> Each google search has a corresponding value that is invisible to the player, which represents the average monthly searches for that word or phrase.</p></li> 
                            </ul>
                    </li>
                    <li> <p> The player to the left of the Dealer goes first by playing a card from their hand, along with placing a bet representing how strongly they feel their card will win.</p>
                        <ul>
                            <li> <p> Each bet goes into the “Pot”.</p></li> 
                        </ul>
                    </li>
                    <li> <p> Each player does the same as in step 3, going in a clockwise order around the table. If a player thinks they have no cards that can win, they can “fold” a card, discarding it and sitting out for the rest of the round </p> </li>
                    <li> <p> Repeat step 4 until all players have either folded, or reached a bet which no one raises or calls.</p></li>
                    <li> <p> After all bets have been placed, the value of all cards in play are revealed to the players. </p></li>
                    <li> <p> The player with the highest value wins all of the chips in the Pot, and players with no remaining chips are eliminated from the game.</p></li>
                    <li> <p> The player to the left of the Dealer is designated as the Dealer for the next round. </p></li>
                    <li> <p> Each player is dealt 3 new cards. Repeat steps 3-8 until one player is left with chips.</p></li>
                    <li> <p> The last player left with chips is the winner!</p></li>
                </ol>
            </div> 
          </div>
        </div>
      )}
    </Popup>
    </div>
    <style jsx>{
        `
        .modal{
            
            background: #f0f0f0;
            width: 80%;
            margin-left: 10%;
            padding: 2%;
            border-radius: 25px;
            border: 5px solid black;
        }
        .close{
            font-weight: bold;
            display:block;
            height: 40px;
            width: 40px;
            border-radius: 50%;
            border: 1px solid red;
            float: right;
            border: 2px solid black;
            
        }
        .clickable{
            cursor: pointer;
        }
    `}
    </style>
    </div> 
  );

  export default Rules

