import Head from 'next/head';
import styles from '../styles/Home.module.css';
import gameSty from '../styles/Game.module.css';
import React from 'react';
import { withRouter } from 'next/router' //gives us access to router.query

const io = require("socket.io-client");
const socket = io();

/*
Contains: 
* Game ID
* The player whos turn it is
* Their bet
* Their active card 
* The current pot amount  
*/

class CardView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            card: {
                searchString: props.card.searchString,
                searchValue: props.card.searchValue
            }

        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(){
        this.props.onClick(this.state.card);
    }

    render(){
        return(
            <div onClick = {this.handleClick} className={styles.card}> {this.state.card.searchString} </div>
        );
    }
}

class PlayerView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            name: props.name,
            chips: props.chips
        }
    }

    render(){
        return(
            <div> 
                <p> {this.state.name} has {this.state.chips} chips </p>
            </div>
        );
    }
}


class Game extends React.Component {

    constructor(props){
        super(props);
        this.state = {
          username: props.router.query.user,  
          lobbyId: props.router.query.code, //this is taken as [lobbyCode] in the URL .
          gameInfo: null, 
          dealerIndex: null,
          players: [], 
          hand: [

          ],
          chips: 0, 
          currentCard: null,
          currentBet: 0, 
          hasPlayedCard: false,
          roundOver: false,
          roundWinner: null,
          roundWinCard: null
        };
        this.selectCard = this.selectCard.bind(this)
        this.updateBet = this.updateBet.bind(this)
        this.confirmTurn = this.confirmTurn.bind(this)
        socket.emit("player-joined-game", this.state.lobbyId, this.state.username)
        
    }


    componentDidMount(){

        socket.on("update-players", (playerList) =>{
            this.setState({ players: playerList })
        });
        
        //sent to all players in the game, every turn
        socket.on("start-turn", (newGameInfo) => {
            this.setState({ gameInfo: newGameInfo});
        });
        
        //sent when the round is over someone won the round
        socket.on("round-over", (listCards, winner, winningCard) => {
            winner.chips = this.gameInfo.potAmount + winner.chips;
            this.setState({
                roundOver: true,
                roundWinner: winner,
                roundWinCard: winningCard
            });
            
        });
        
        //sent when a player leaves the lobby. contains a new list of players
        socket.on("game-player-left", (newPlayers) => {
            this.setState({ });
        });

        //sent when the game is over. contains a lobby object with the same code. 
        socket.on("end-game", (lobby) => {
            this.setState({ });
        });    

        socket.on("set-cards", (newCards) => {
            this.setState({hand: newCards})
        })
    }

    selectCard(newCard){
        if(!this.state.hasPlayedCard){ // dont set new card if one has been played
            this.setState({
                currentCard: newCard
            })
        }
    }

    //returns false on invalid bet
    updateBet = event => {
        if(event.target.value >= 0){ // TODO: bet must be above minimum amount
            this.setState({
                currentBet: event.target.value
            })
            return true
        }
        else return false

    }

    confirmTurn(){
        if(this.state.currentCard && this.state.currentBet >= 0 && !this.state.hasPlayedCard ){
            this.setState({ hasPlayedCard: true
            })
            console.log(this.state.currentCard.searchString+" "+this.state.currentBet);
        }
        
    }
    

    render(){
        return (
            <div className={gameSty.container}>
                <Head>
                    <title>SEO-ker Game Room</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>   
                <main className={gameSty.main}>
                    {this.state.roundOver ?
                        <div>
                            <h1>
                                Winner: {this.state.roundWinner.displayName}
                                <br />
                                Winning card: {this.state.roundWinCard.searchString} with {this.state.roundWinCard.searchValue} search counts!
                            </h1>
                        </div> :
                    <div>
                        <ol>
                        {this.state.players.map((player, index) =>(
                            <li key={index}> <PlayerView name={player.displayName} chips={player.chips}/> </li>
                        ))}
                        </ol>
                        <ol>
                        {this.state.hand.map((card, index) =>(
                            <li key={index}> <CardView onClick = {this.selectCard} card={card}/> </li>
                        ))}
                        </ol>

                            <input type="number"
                                placeholder="Bet"
                                id="betInput"
                                onChange={this.updateBet}
                                className={gameSty.betInputBox} />


                            <button className={gameSty.card}
                                id="confirmTurn"
                                onClick={this.confirmTurn}>
                                Confirm Turn
                    </button>
                    </div>

                    }
                    

                </main>
                    <style jsx>{
                        `
                        .hand{
                            bottom:0;
                            background: lightgrey;
                        }
                    `}
                </style>
            </div>
            )
    }
    
}

export default withRouter(Game)