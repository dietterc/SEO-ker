import Head from 'next/head';
import styles from '../styles/Home.module.css';
import gameSty from '../styles/Game.module.css';
import React from 'react';
import { withRouter } from 'next/router' //gives us access to router.query

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
            gameId: props.card.gameId

        }

        this.cardsleClick = this.cardsleClick.bind(this)
    }

    cardsleClick(){
        if(this.state.card.searchValue == -1) {
            this.props.onClick(this.state.gameId);
        }
        else {
            this.props.onClick(this.state.card);
        }

    }

    render(){
        return(
            <div onClick = {this.cardsleClick} className={gameSty.gameCard}> {this.state.card.searchString} </div>
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
          gameInfo: {
              potAmount: 0,
              dealer: "",
              activePlayer: ""
          }, 
          players: [], 
          cards: [
           
          ],
          chips: 0, 
          currentCard: null,
          currentBet: 0, 
          hasPlayedCard: false,
          dealer: "",
          activePlayer: "",
          roundOver: false,
          roundWinner: null,
          roundWinCard: null,
          isMyTurn: false,
          roundCards: [],
          winningPot: 0,
          fakeCard: {
            searchString: "Play next round",
            searchValue: -1,
            gameId: 0
          },
          hasLost: false, 
          isGameOver: false
        };
        console.log(this.state.playerId)
        this.selectCard = this.selectCard.bind(this)
        this.updateBet = this.updateBet.bind(this)
        this.confirmTurn = this.confirmTurn.bind(this)
        socket.emit("player-joined-game", this.state.lobbyId, this.state.playerId)
        
    }


    componentDidMount(){

        socket.on("update-players", (playerList) =>{
            this.setState({ players: playerList })
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
        socket.on("round-over", (listCards, winner, winningCard, winningPot, isGameOver) => {
            this.setState({
                roundOver: true,
                roundWinner: winner,
                roundWinCard: winningCard,
                roundCards: listCards,
                winningPot: winningPot,
                isGameOver: isGameOver
            });
            console.log("caught");

            if(this.state.chips == 0) {
                this.setState({hasLost: true});
            }
            
        });
        
        //sent when a player leaves the lobby. contains a new list of players
        socket.on("game-player-left", (newPlayers, dealer, activePlayer) => {
            this.setState({ players: newPlayers});
            this.setState({ dealer: dealer});
            this.setState({ activePlayer: activePlayer});

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
                roundWinner: null,
                roundWinCard: null,
                roundCards: [],
            });
        }); 

        socket.on("set-cards", (newCards) => {
            this.setState({cards: newCards})
        })
        socket.on("set-chips", (newChips) =>{
            this.setState({chips: newChips})
        })

        socket.on("move-to-homepage", (lobbyId) =>{
            console.log("hey!")
            let displayName = ""
            for(let i=0;i<this.state.players.length;i++) {
                if(this.state.players[i].playerId == this.state.playerId) {
                    displayName = this.state.players[i].displayName
                }
            }

            this.props.router.push({pathname: `/`, query: {code: lobbyId, user: displayName}}); 
        })

        
    }

    selectCard(newCard){
        if(!this.state.hasPlayedCard){ // dont set new card if one has been played
            this.setState({
                currentCard: newCard
            })
            console.log(this.state.currentCard)
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
            if(this.state.players[i].chips == 0) {
                style = gameSty.nameListGrey
            }
            if(this.state.players[i].playerId == this.state.gameInfo.activePlayer.playerId && this.state.players[i].playerId == this.state.gameInfo.dealer.playerId) {
                jsx = (
                    <div className={style}>
                        {this.state.players[i].displayName} has {this.state.players[i].chips} chips. <b>(Dealer)</b> *
                    </div>
                )
            }    
            else if(this.state.players[i].playerId == this.state.gameInfo.dealer.playerId) {
                jsx = (
                    <div className={style}>
                        {this.state.players[i].displayName} has {this.state.players[i].chips} chips. <b>(Dealer)</b>
                    </div>
                )
            }
            else if(this.state.players[i].playerId == this.state.gameInfo.activePlayer.playerId) {
                jsx = (
                    <div className={style}>
                        {this.state.players[i].displayName} has {this.state.players[i].chips} chips. *
                    </div>
                )
            }
            else {
                jsx = (
                    <div className={style}>
                        {this.state.players[i].displayName} has {this.state.players[i].chips} chips.
                    </div>
                )
            }
            list.push(jsx)
        }
        return list
    }

    printCards() {
        var list = []
        for(let i=0;i<this.state.cards.length;i++) {
            let card = this.state.cards[i]
            var jsx = (
                <div>
                    <CardView onClick = {this.selectCard} card={card}/>
                </div>
            )
            list.push(jsx)
        }
        return list
    } 

    printPlayedCards() {
        console.log(this.state.roundCards)
        var list = []
        let sortedArray = this.state.roundCards
        sortedArray.sort(function(a, b){return b.searchValue - a.searchValue;});
        for(let i=0;i<sortedArray.length;i++) {
            var jsx = (
                <div>
                    {sortedArray[i].searchString} ({sortedArray[i].searchValue} searches)
                </div>
            )
            list.push(jsx)
        }
        return list
    }

    nextRound(gameId) {
        console.log(gameId)
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
                        <CardView card={lobbyCard} onClick = {this.gotoLobby}/>
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <br/>
                        <CardView card={this.state.fakeCard} onClick = {this.nextRound}/>
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
                <h1>{this.state.displayName}</h1>
                <main className={gameSty.main}>
                    {this.state.roundOver ?
                        <div className={gameSty.gameroom}>
                            <h1 className={gameSty.h1}>
                                {this.state.roundWinner.displayName} won {this.state.winningPot} chips with card:
                                <br />
                                {this.state.roundWinCard.searchString} ({this.state.roundWinCard.searchValue} searches)
                            </h1>
                                <h2>
                                All cards played:
                                </h2>
                                <h3>{this.printPlayedCards()}</h3>   
                                {this.state.isGameOver ?
                                <div>
                                    <br/>
                                    <h3>Only one player remains. {this.state.roundWinner.displayName} has won the game!</h3>
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
                    <ul className = "ul"> 
                        {
                        this.state.cards.map((card, index) =>(
                        <li key={index}> <CardView card={card} onClick = {this.selectCard}/> </li>
                        ))}
                    </ul>
                    
                    
                    {this.state.isMyTurn ?
                    <div className={gameSty.gameroom}>
                        <input type="number" 
                        placeholder="Bet" 
                        id="betInput"
                        onChange={this.updateBet}
                        className={gameSty.betInputBox}/>
                        
                        <button className={gameSty.card} 
                        id="confirmTurn"
                        onClick={this.confirmTurn}>
                                        Confirm Turn
                        </button>
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