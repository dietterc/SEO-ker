import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import LoginInput from "../components/login-input.js";
import LobbyInput from "../components/lobby-input.js"
import Link from 'react';
const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});


export default class Home extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: "",
      loggedIn: false,
      inLobby: false,
      lobbyCode: "",
      lobbyPlayerList: ""   //temp- for testing 
    };
    this.updateUsername = this.updateUsername.bind(this);
    this.onJoin = this.onJoin.bind(this);
    this.onHost = this.onHost.bind(this);
    
    this.socket = socket;
  }

  componentDidMount() {
    //PUT INCOMING MESSAGES HERE!!1!

    socket.on("join-lobby", (lobby) => {
      this.setState({lobbyCode: lobby.lobbyId})
      let lobbyList = "Players connected: (temp)\n"

      for(var i=0;i<lobby.players.length;i++) {
        lobbyList += lobby.players[i].displayName + "\n"
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map(str => <p>{str}</p>)});
    });


    socket.on("lobby-player-joined", (lobby) => {
      let lobbyList = "Players connected: (temp)\n"
  
      for(var i=0;i<lobby.players.length;i++) {
        lobbyList += lobby.players[i].displayName + "\n"
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map(str => <p>{str}</p>)});
  
    });

    socket.on("lobby-player-left", (lobby) => {
      let lobbyList = "Players connected: (temp)\n"
  
      for(var i=0;i<lobby.players.length;i++) {
        lobbyList += lobby.players[i].displayName + "\n"
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map(str => <p>{str}</p>)});
  
    });

  }
  

  updateUsername(str){
    this.setState({username: str}, function(){
      if(this.state.username.replace(/\s+/g, "") !== ""){
        this.setState({loggedIn: true});
      }
    });
  }

  onJoin(str){
    if(str == null){
      console.log("no code");
      return;
    }
    this.setState({lobbyCode: str, inLobby: true})
    socket.emit('join-lobby', "testId",this.state.username ,this.state.lobbyCode);
  }

  onHost(){
    socket.emit('host-lobby',"playerId2",this.state.username);
    this.setState({inLobby: true});
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
        <div>
          <h2>Lobby Code: {this.state.lobbyCode}</h2>
          <h2>{this.state.lobbyPlayerList}</h2>
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