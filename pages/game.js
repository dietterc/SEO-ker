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
            searchString: props.searchString,
            searchValue: props.searchValue
        }
    }

    render(){
        return(
            <div className={styles.card}> {this.state.searchString} </div>
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
            <div className="player"> 
                <p> {this.state.name} has {this.state.chips} chips </p>
            </div>
        );
    }
}

socket.on("connect", () => {
    
});

class Game extends React.Component {

    constructor(props){
        super(props);
        console.log("query: "+props.router.query.code)
        this.state = {
          lobbyId: props.router.query.code, //this is taken as [lobbyCode] in the URL .
          gameInfo: null, 
          dealerIndex: null,
          players: [], 
          hand: null,
          chips: 0 
        };
        socket.emit("player-joined-game", props.router.query.code, socket.id)
        
    }


    componentDidMount(){

        /*sent when the host starts the game. should come right when this page is loaded
        socket.on("start-game", (newGameInfo, newDealerIndex) => {
            this.setState({gameInfo: newGameInfo, dealerIndex: newDealerIndex});
        });
        */

        socket.on("start-game", (playerList) =>{
            this.setState({players: playerList})
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
    

    render(){
        return (
            <div className={gameSty.container}>
                <Head>
                    <title>SEO-ker Game Room</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>   
                <main className={gameSty.main}>
                    <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
                    <ol>
                        {this.state.players.map((player, index) =>(
                            <li key={index}> <PlayerView name={player}/> </li>
                        ))}
                    </ol>
                    <div className="hand">
                            <div className={styles.card}></div>
                            <div className={styles.card}></div>
                            <div className={styles.card}></div>
                    </div>
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