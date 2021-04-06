import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import LoginInput from "../components/login-input.js";
import LobbyInput from "../components/lobby-input.js"
import {withRouter} from 'next/router';

const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});


class Home extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: "",
      playerId: "",
      loggedIn: false,
      inLobby: false,
      lobbyCode: "",
      lobbyPlayerList: "",
      isHost: false,
      cardsSet: false,
      oldDisplayName: props.router.query.user,  
      newLobbyId: props.router.query.code,   
    };

    if(this.state.newLobbyId != undefined) {
      this.setState({username: this.state.oldDisplayName}); 
      
      socket.emit('join-lobby', 'joinID', this.state.oldDisplayName ,this.state.newLobbyId);
    }
    
    //these allow you to call this.state.whatever in each of the functions. 
    //needed for all new functions 
    this.updateUsername = this.updateUsername.bind(this);
    this.onJoin = this.onJoin.bind(this);
    this.onHost = this.onHost.bind(this);
    this.hostStartGame = this.hostStartGame.bind(this);
  }

  componentDidMount(){
    //PUT INCOMING MESSAGES HERE
    //any message incoming to the client must be dealt with in a socket.on function
    socket.on("join-lobby", (lobby, newPlayerId) => {

      this.setState({loggedIn: true}); 
      this.setState({inLobby: true}); 
      
      this.setState({lobbyCode: lobby.lobbyId,inLobby: true, playerId: Number(newPlayerId)})
      let lobbyList = ""
      for(let i=0;i<lobby.players.length;i++) {
        
        lobbyList += lobby.players[i].displayName

        if(lobby.host.playerId == lobby.players[i].playerId) {
          lobbyList += " (host)"
        }
        
        if(i != lobby.players.length - 1) {
          lobbyList += "\n"
        }
      }
      
      this.setState({lobbyPlayerList: lobbyList.split('\n').map((str, index) => <div className={styles.playerName} key={index}>{str}</div>)});
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
      let lobbyList = ""
  
      for(let i=0;i<lobby.players.length;i++) {
        
        lobbyList += lobby.players[i].displayName

        if(lobby.host.playerId == lobby.players[i].playerId) {
          lobbyList += " (host)"
        }
        
        if(i != lobby.players.length - 1) {
          lobbyList += "\n"
        }
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map((str, index) => <div className={styles.playerName} key={index}>{str}</div>)});
  
    });

    socket.on("lobby-player-left", (lobby) => {
      this.setState({lobbyCode: lobby.lobbyId})
      let lobbyList = ""
  
      for(let i=0;i<lobby.players.length;i++) {
        
        lobbyList += lobby.players[i].displayName

        if(lobby.host.playerId == lobby.players[i].playerId) {
          lobbyList += " (host)"
        }
        
        if(i != lobby.players.length - 1) {
          lobbyList += "\n"
        }
      }
        this.setState({
            lobbyPlayerList: lobbyList.split('\n').map((str, index) => <div className={styles.playerName} key={index}>{str}</div>)});
  
    });

    socket.on("host-started-game", (lobbyId) => {
      this.setState({inLobby: false});
      if(lobbyId === this.state.lobbyCode){ //only change the page if its the correct ID. probably does nothing
        this.props.router.push({pathname: `/game`, query: {code: this.state.lobbyCode,
                                                            user: this.state.playerId, 
                                                            displayName: this.state.username}}); //changes the page
      }
    });    

    socket.on("promote-to-host", () => {
        this.setState({ isHost: true });
    });

    socket.on('cards-set', () => {
      this.setState({cardsSet: true})
    })
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

  hostStartGame(){
    socket.emit("host-started-game", this.state.lobbyCode);
  }

  //handles which react component is to be loaded under the logo
  activeScreen(){
    if(!(this.state.loggedIn || this.state.inLobby)){
      return <LoginInput onSubmit={this.updateUsername}/>
    }
    else if(this.state.loggedIn && !this.state.inLobby){
      return <LobbyInput username={this.state.username} onJoin={this.onJoin} onHost={this.onHost}/>
    }
    else if(this.state.loggedIn && this.state.inLobby){
      
      return (
          <div className={styles.lobby}>
         <div className={styles.codeBox}> 
            <h2 className={styles.lobbyCode}>Lobby Code: {this.state.lobbyCode}</h2>
            {this.state.isHost ? 
              this.state.cardsSet ?
                <button className={styles.card}
                   onClick={this.hostStartGame}>
                   Start Game
                </button>
                :
                <div> <h2> loading... </h2> </div>
              :
               <div> </div>
            }
         </div>
              
         <div className={styles.playerList}>
            <h2>Players connected:</h2> <h2 > <div className={styles.hostandjoin}>{this.state.lobbyPlayerList}</div></h2> </div>
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
          <a
            href="https://github.com/dietterc/SEO-ker/wiki/Rules"
            target="_blank"
          >
            Rules: {'\t'}
            <img src="/Rule_Book.png" alt="Rule Book" className={styles.logo} />
          </a>
          
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

