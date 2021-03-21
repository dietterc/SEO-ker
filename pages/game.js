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
            searchString: props.card.searchString,
            searchValue: props.card.searchValue
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(){
        this.props.onClick(this);
    }

    render(){
        return(
            <div onClick = {this.handleClick} className={styles.card}> {this.state.searchString} </div>
        );
    }
}

class PlayerView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            name: props.name,
            hand: props.hand,
            chips: 0
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
          hand: [{
                searchString: 'donal turpm',
                searchValue: '100'
            },  
            {
                searchString: 'diet coke button',
                searchValue: '12222'
            },  
            {
                searchString: 'aoc feet pics',
                searchValue: '1000000000000'
            }  
          ],
          chips: 0 
        };
        socket.emit("player-joined-game", this.state.lobbyId, this.state.username)
        
    }


    componentDidMount(){

        /*sent when the host starts the game. should come right when this page is loaded
        socket.on("start-game", (newGameInfo, newDealerIndex) => {
            this.setState({gameInfo: newGameInfo, dealerIndex: newDealerIndex});
        });
        */

        socket.on("update-players", (playerList) =>{
            this.setState({players: playerList})
            console.log(playerList)
        });
        
        //sent to all players in the game, every turn
        socket.on("start-turn", (gameInfo) => {
            this.setState({ });
        });
        
        //sent when the round is over someone won the round
        socket.on("round-over", (listCards, winner) => {
            this.setState({ });
        });
        
        //sent when a player leaves the lobby. contains a new list of players
        socket.on("game-player-left", (newPlayers) => {
            this.setState({ });
        });

        //sent when the game is over. contains a lobby object with the same code. 
        socket.on("end-game", (lobby) => {
            this.setState({ });
        });    
    }

    selectCard(card){

    }
    

    render(){
        return (
            <div className={gameSty.container}>
                <Head>
                    <title>SEO-ker Game Room</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>   
                <main className={gameSty.main}>
                    <ol>
                        {this.state.players.map((player, index) =>(
                            <li key={index}> <PlayerView name={player.displayName}/> </li>
                        ))}
                    </ol>
                    <ol>
                        {this.state.hand.map((card, index) =>(
                            <li key={index}> <CardView onClick = {this.selectCard} card={card}/> </li>
                        ))}
                    </ol>
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