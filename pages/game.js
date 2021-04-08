import Head from 'next/head';
import styles from '../styles/Home.module.css';
import gameSty from '../styles/Game.module.css';
import React from 'react';
import { withRouter } from 'next/router' //gives us access to router.query
import Image from 'next/image'
const io = require("socket.io-client");
const socket = io();


class CardView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            card: {
                searchString: props.card.searchString,
                searchValue: props.card.searchValue
            },
            gameId: props.card.gameId,
            showValue: props.showValue

        }

        this.cardsClick = this.cardsClick.bind(this)
    }

    cardsClick(){
        if(this.state.card.searchValue == -1) {
            this.props.onClick(this.state.gameId);
        }
        else {
            this.props.onClick(this.state.card);
            console.log(this.state.card)
        }

    }

    render(){
        return(
            <div onClick = {this.cardsClick} className={gameSty.gameCard}> 
                {this.state.card.searchString} 
                {this.state.showValue ?
                <h3> {this.state.card.searchValue}</h3>
            :
            <div/>}
            </div>
        );
    }
}




class GameScreen extends React.Component {

    constructor(props){
        super(props);
        this.state = {
          playerId: props.router.query.user,  
          lobbyId: props.router.query.code, //this is taken as [lobbyCode] in the URL .
          displayName: props.router.query.displayName,
          image: "/PlayerImages/poker1.png",
          gameInfo: {
              potAmount: 0,
              dealer: "",
              activePlayer: ""
          }, 
          players: [], 
          cards: [],
          chips: 0, 
          currentCard: null,
          currentBet: 0, 
          hasPlayedCard: false,
          dealer: "",
          activePlayer: "",
          roundOver: false,
          roundWinners: null,
          isMyTurn: false,
          turns: [],
          winningPot: 0,
          fakeCard: {
            searchString: "Play next round",
            searchValue: -1,
            gameId: 0
          },
          hasLost: false, 
          isGameOver: false,
          validBet: true
        };
        this.selectCard = this.selectCard.bind(this)
        this.updateBet = this.updateBet.bind(this)
        this.confirmTurn = this.confirmTurn.bind(this)

     
        socket.emit("player-joined-game", this.state.lobbyId, this.state.playerId)
      
    }


    componentDidMount(){

        socket.on("update-players", (playerList) =>{
            this.setState({ players: playerList })
              
        for(var i = 0; i< this.state.players.length; i++){
            if(this.state.players[i].playerId == this.state.playerId){
                this.setState({image: this.state.players[i].image})
                console.log("state.image:" + this.state.image)
            }
        }
        });
        
        //sent to all players in the game, every turn
        socket.on("start-turn", (newGameInfo) => {

            this.setState({ gameInfo: newGameInfo, 
                isMyTurn:  newGameInfo.activePlayer.playerId == this.state.playerId
            });
            this.setState({ fakeCard: {
                searchString: "Play next round",
                searchValue: -1,
                gameId: this.state.gameInfo.id 
            }})
        });
        
        //sent when the round is over someone won the round
        socket.on("round-over", (newTurns, winners, winningPot, isGameOver) => {
            this.setState({
                roundOver: true,
                roundWinners: winners,
                turns: newTurns,
                winningPot: winningPot,
                isGameOver: isGameOver
            });

            if(this.state.chips == 0) {
                this.setState({hasLost: true});
            }

            console.log(winners)
            
        });
        
        //sent when a player leaves the lobby. contains a new list of players
        socket.on("game-player-left", (newPlayers, dealer, activePlayer) => {
            this.setState({ players: newPlayers, dealer: dealer, activePlayer: activePlayer});

            let updatedGameInfo = this.state.gameInfo;
            updatedGameInfo.dealer = dealer;
            updatedGameInfo.activePlayer = activePlayer;

            this.setState({ 
                isMyTurn:  activePlayer.playerId == this.state.playerId,
                gameInfo: updatedGameInfo
            });


        });

        //sent when the game is over. contains a lobby object with the same code. 
        socket.on("end-game", (lobby) => {
            this.setState({ });
        });  
        
        socket.on("restart-round", () => {

            this.setState({
                roundOver: false,
                currentCard: null,
                currentBet: 0, 
                hasPlayedCard: false,
                roundWinners: null,
                turns: [],
            });
        }); 

        socket.on("set-cards", (newCards) => {
            this.setState({cards: newCards})
        })
        socket.on("set-chips", (newChips) =>{
            this.setState({chips: newChips})
        })

        socket.on("move-to-homepage", (lobbyId) =>{
            let displayName = ""
            for(let i=0;i<this.state.players.length;i++) {
                if(this.state.players[i].playerId == this.state.playerId) {
                    displayName = this.state.players[i].displayName
                }
            }

            this.props.router.push({pathname: `/`, query: {code: lobbyId, user: displayName}}); 
        })

        
    }
    dummyOnClick(x){
        //do nothing
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

        let regEx = /[a-z]/i;

        if(event.target.value > 0 && !regEx.test(event.target.value) && event.target.value <= this.state.chips){ 
            this.setState({
                currentBet: event.target.value,
                validBet: true
            })
            return true
        }
        else {
            this.setState({
                validBet: false
            })
            return false
        }
    }

    confirmTurn(){
        if(this.state.currentCard && this.state.currentBet > 0 && !this.state.hasPlayedCard && this.state.validBet){
            var newGameInfo = {
                id: this.state.gameInfo.id,
                activePlayer: this.state.gameInfo.activePlayer,
                betAmount: this.state.currentBet,
                activeCard: this.state.currentCard,
                potAmount: this.state.gameInfo.potAmount,
                dealer: this.state.gameInfo.dealer
            }
            //remove the card from the cards
            var newCards = [...this.state.cards]
            for(let i = 0; i < newCards.length; i++){
                if(newCards[i].searchString === this.state.currentCard.searchString){
                    let remove = newCards[i]
                    let index = newCards.indexOf(remove)
                    newCards.splice(index, 1)
                }
            }
            if(this.state.currentBet <= this.state.chips && this.state.currentBet >= this.state.gameInfo.betAmount){
                this.setState({ hasPlayedCard: true, gameInfo: newGameInfo, cards: newCards })
                socket.emit("turn-played", newGameInfo)
            }
            
        }
    }
    
    printPlayers() {
        var list = []
        for(let i=0;i<this.state.players.length;i++) {
            var jsx = (<div></div>);
            let style = gameSty.nameListBlack
            let lastBet = ""

            if(this.state.players[i].chips == 0) {
                style = gameSty.nameListGrey
            }

            if(this.state.players[i].lastBet != 0 && this.state.players[i].lastBet != undefined) {
                lastBet = "Bet: " + this.state.players[i].lastBet
            }

            if(this.state.players[i].playerId == this.state.gameInfo.activePlayer.playerId && this.state.players[i].playerId == this.state.gameInfo.dealer.playerId) {
                jsx = (
                    <div className={style}>
                        <img src= {this.state.players[i].image} width ={58} height = {58} />
                        <div className={gameSty.playerInfo}>
                            <b>{this.state.players[i].displayName}</b> <b>(Dealer)</b> *
                            <br/>Chips: {this.state.players[i].chips}  
                            <br/>{lastBet}
                        </div>
                    </div>
                )
            }    
            else if(this.state.players[i].playerId == this.state.gameInfo.dealer.playerId) {
                jsx = (
                    <div className={style}>
                        <img src= {this.state.players[i].image} width ={58} height = {58} />
                        <div className={gameSty.playerInfo}>
                            <b>{this.state.players[i].displayName}</b> <b>(Dealer)</b>
                            <br/>Chips: {this.state.players[i].chips}
                            <br/>{lastBet}
                        </div>
                    </div>
                )
            }
            else if(this.state.players[i].playerId == this.state.gameInfo.activePlayer.playerId) {
                jsx = (
                    <div className={style}>
                        <img src= {this.state.players[i].image} width ={58} height = {58} />
                        <div className={gameSty.playerInfo}>
                            <b>{this.state.players[i].displayName}</b> *
                            <br/>Chips: {this.state.players[i].chips}
                            <br/>{lastBet}
                        </div>
                    </div>
                )
            }
            else {
                jsx = (
                    <div className={style}>
                        <img src= {this.state.players[i].image} width ={58} height = {58} />
                        <div className={gameSty.playerInfo}>
                            <b>{this.state.players[i].displayName}</b>
                            <br/>Chips: {this.state.players[i].chips}
                            <br/>{lastBet}
                        </div>
                    </div>
                )
            }
            list.push(jsx)
        }
        return list
    }

    nextRound(gameId) {
        socket.emit("next-round", gameId)
    }

    gotoLobby(gameId) {
        //code to send everyone back to a lobby (message)
        socket.emit("return-to-lobby", gameId)
    }

    printRoundOverDisplay() {
        let lobbyCard = {
            searchString: "Back to lobby",
            searchValue: -1,
            gameId: this.state.lobbyId
          }
        if(this.state.gameInfo.dealer.playerId == this.state.playerId) {
            if(this.state.isGameOver) {
                return (
                    <div>
                        <br/>
                        <CardView card={lobbyCard} onClick = {this.gotoLobby} showValue={false}/>
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <br/>
                        <CardView card={this.state.fakeCard} onClick = {this.nextRound} showValue={false}/>
                    </div>
                )
            }
        }
    }

    render(){

        return (
            <div className={gameSty.container}>
                <Head>
                    <title>SEO-ker Game Room</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>   
                <h1><img src = {this.state.image} width = {58} height = {58}/><br/>{this.state.displayName}</h1>
                <main className={gameSty.main}>
                    {this.state.roundOver ?
                        <div className={gameSty.gameroom}>

                            <ul className ="ul"> 
                                {this.state.roundWinners.map((winner) => (
                                <li key = {winner.player.playerId}> 
                                    <h1 className={gameSty.h1}>
                                    {winner.player.displayName} won {this.state.winningPot} chips with :
                                    <CardView card = {winner.card} onClick = {this.dummyOnClick} showValue = {true}/>
                                    </h1>
                                </li> 
                                ))}
                            </ul>
                                <h2>
                                All cards played:
                                </h2>

                                <ul className = 'ul'> 
                                    {this.state.turns.map(turn => (
                                        <li key = {turn.player.playerId} > 
                                            <h3> {turn.player.displayName} played </h3>
                                            <CardView card = {turn.card} onClick = {this.dummyOnClick} showValue = {true}/>
                                        </li> 
                                    ))}
                                </ul>  
                                {this.state.isGameOver ?
                                <div>
                                    <br/>
                                    <h3>Only one player remains. {this.state.roundWinners[0].player.displayName} has won the game!</h3>
                                    {this.printRoundOverDisplay()}
                                </div>
                                :<div/>
                                }  

                                {!this.state.isGameOver ?
                                <div>
                                    <br/>
                                    {this.printRoundOverDisplay()}
                                </div>
                                :<div/>
                                } 

                        </div> :
                        <div className={gameSty.gameroom}>
                
                <div className={gameSty.gameroomL}> 
                    <h3>Pot amount: {this.state.gameInfo.potAmount}</h3> 
                    
                    {this.printPlayers()}

                    {this.state.currentCard ? 
                    <div>
                    <br/><br/>
                    <b>Selected Card:</b>
                        <div className={gameSty.card}>{this.state.currentCard.searchString}</div>
                    </div>
                    :
                    <div/>
                    }
                    
                </div>


                <div className={gameSty.gameroomR}>
                    <ul className= 'ul'> 
                        {
                        this.state.cards.map((card) =>(
                        <li key={card.searchString}> <CardView card={card} onClick = {this.selectCard} showValue = {false}/> </li>
                        ))}
                    </ul>
                    
                    
                    {this.state.isMyTurn ?
                    <div className={gameSty.gameroom}>
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
                        {!this.state.validBet ?
                            <div className={gameSty.gameroom}>
                                <b>Please input a valid bet. (1 to {this.state.chips})</b>
                            </div> 

                            : 
                            <div/> 
                            }
                    </div> 

                    : 
                    <div/> 
                    }

                    </div>
                    
                    </div>
                    }
                </main>
                    <style jsx>{
                        `
                        .cards{
                            bottom:0;
                            background: lightgrey;
                        }
                        .ul{
                            list-style-type: none;
                        }
                    `}
                </style>
            </div>
            )
    }
    
}

export default withRouter(GameScreen)