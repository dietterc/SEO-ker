import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import LoginInput from "../components/login-input.js";
import LobbyInput from "../components/lobby-input.js"
import {withRouter} from 'next/router';
import Image from 'next/image'
import Rules from '../components/rules.js'
const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});


class Home extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: props.router.query.displayName,
      playerId: "",
      loggedIn: false,
      inLobby: false,
      lobbyCode: "",
      lobbyPlayerList: "",
      isHost: false,
      cardsSet: false,
      oldDisplayName: props.router.query.displayName,  
      newLobbyId: props.router.query.code,   
      startingChips: 0
    };

    if(this.state.newLobbyId != undefined) {
      this.setState({username: this.state.oldDisplayName}); 
      this.setState({lobbyCode: this.state.newLobbyId});
      console.log(this.state.oldDisplayName)
      
      socket.emit('join-lobby', 'joinID', this.state.oldDisplayName ,this.state.newLobbyId);
    }
    
    //these allow you to call this.state.whatever in each of the functions. 
    //needed for all new functions 
    this.updateUsername = this.updateUsername.bind(this);
    this.onJoin = this.onJoin.bind(this);
    this.onHost = this.onHost.bind(this);
    this.hostStartGame = this.hostStartGame.bind(this);
    this.updateLobbyList = this.updateLobbyList.bind(this);
    this.changeUsername = this. changeUsername.bind(this)
  }
  updateLobbyList(lobby){
    let lobbyList = []
    for(let i=0;i<lobby.players.length;i++) {
      let newPlayer = {
                    displayName: lobby.players[i].displayName,
                    id: i + 1
                   } 
      if(lobby.host.playerId == lobby.players[i].playerId) {
              newPlayer.displayName += " (host)"
        }
      lobbyList.push(newPlayer)
      
    }

    this.setState({lobbyPlayerList: lobbyList.map((plyr) => (
        <div key={plyr.playerId} >
          <div className={styles.lobbyPlayer}>
              <img src = {"/PlayerImages/poker"+plyr.id+".png"} className={styles.token}/>
              
              <div className={styles.playerName}> {plyr.displayName} </div>
          </div>
        </div>
        
      ))
    }
    );

  }
  componentDidMount(){
    //PUT INCOMING MESSAGES HERE
    //any message incoming to the client must be dealt with in a socket.on function
    socket.on("join-lobby", (lobby, newPlayerId) => {

      this.setState({loggedIn: true}); 
      this.setState({inLobby: true}); 
      
      this.setState({lobbyCode: lobby.lobbyId,inLobby: true, playerId: Number(newPlayerId)})
      this.updateLobbyList(lobby)
    });

    socket.on("lobby-not-found", () => {
      this.setState({inLobby: false});
      //implement error !
    });

    socket.on("lobby-full", () => {
      this.setState({inLobby: false});
      //implement error !
    })


    socket.on("lobby-player-joined", (lobby) => {
      this.setState({lobbyCode: lobby.lobbyId})
      this.updateLobbyList(lobby)
    });

    socket.on("lobby-player-left", (lobby) => {
      this.setState({lobbyCode: lobby.lobbyId})
     this.updateLobbyList(lobby)
    });

    socket.on("host-started-game", (lobbyId) => {
      this.setState({inLobby: false});
      if(lobbyId === this.state.lobbyCode){ //only change the page if its the correct ID. probably does nothing
        this.props.router.push({pathname: `/game`, query: {code: this.state.lobbyCode,
                                                            user: this.state.playerId, 
                                                            displayName: this.state.username
                                                            }}); //changes the page
      }
    });    

    socket.on("promote-to-host", () => {
        this.setState({ isHost: true});
    });

    socket.on('cards-set', () => {
      this.setState({cardsSet: true})
    })
  }

  updateStartingChips = event =>{

    let regEx = /[a-z]/i;
    let amount = parseInt(event.target.value)

    if(!regEx.test(event.target.value) && amount > 0 ){
      this.setState({startingChips: amount})
    }


  }
 

  // update the state according to user input. 
  updateUsername(str){
    this.setState({username: str}, function(){
      if(this.state.username.replace(/\s+/g, "") !== ""){
        this.setState({loggedIn: true});
      }
    });
  }


  onJoin(str){
    this.setState({lobbyCode: str}, function(){
      if(this.state.lobbyCode.replace(/\s+/g, "") !== ""){
        socket.emit('join-lobby', 'joinID', this.state.username ,this.state.lobbyCode);
      }
    });
  
  }

  onHost(){
    socket.emit('host-lobby', 'hostID', this.state.username);
    this.setState({inLobby: true, isHost: true});
  }

  changeUsername(){
    this.setState({inLobby: false, loggedIn: false})
  }

  hostStartGame(){
    if(this.state.startingChips > 0){
      socket.emit("host-started-game", this.state.lobbyCode, this.state.startingChips);
    }
    else{
      socket.emit("host-started-game", this.state.lobbyCode, 1000);
    }
  }

  //handles which react component is to be loaded under the logo
  activeScreen(){
    if(!(this.state.loggedIn || this.state.inLobby)){
      return <LoginInput onSubmit={this.updateUsername}/>
    }
    else if(this.state.loggedIn && !this.state.inLobby){
      return <LobbyInput username={this.state.username} onJoin={this.onJoin} onHost={this.onHost} changeUsername={this.changeUsername}/>
    }
    else if(this.state.loggedIn && this.state.inLobby){
      
      return (
          <div className={styles.lobby}>
         <div className={styles.codeBox}> 
            <h2 className={styles.lobbyCode} id="lobby-code">Lobby Code: {this.state.lobbyCode}</h2>
            {this.state.isHost ? 
              <div id="startGame">
              {this.state.cardsSet ?
                <button className={styles.card}
                   onClick={this.hostStartGame} id = "startGameButton">
                   Start Game
                </button>
                :
                <div> <h2> loading... </h2> </div>
              
              }
              <input type="number" 
                        placeholder="Starting chips" 
                        id="startingChipsInput"
                        onChange={this.updateStartingChips} 
                        className={styles.lobbyCodeBox} />
              </div>
               
            : <div/>
            } 
         </div>
              
         <div className={styles.playerList}>
            <h2>Players connected:</h2> <h2 > <div className={styles.hostandjoin}> {this.state.lobbyPlayerList}</div></h2> </div>
        </div>
      );
      
    } 
    
    return null;
  }

  render(){

      return(
        <div className={styles.container}>
        <Head>
          <title>SEO-ker - Login</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
          <p className={styles.description}>by n ∈ ℤ<sup>+</sup> </p>
          {this.activeScreen()}
        </main>
  
        <footer className={styles.footer}>
          <p>
          <Rules /> 
          <a
            href="https://github.com/dietterc/SEO-ker"
            target="_blank"
            rel="noopener noreferrer"
          >
            Repo: {' '}
            <img src="/GitHub_Logo.png" alt="Repo" className={styles.logo} />
          </a>
          </p>
        </footer>
  
        </div>
      );
    }
  
}

export default withRouter(Home)
