import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import LoginInput from "../components/login-input.js";
import LobbyInput from "../components/lobby-input.js"
import Link from 'react';
import Login from '../components/login-input.js';
const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});


export default class LoginScreen extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: "",
      loggedIn: false,
      lobbyCode: "",
      lobbyPlayerList: ""   //temp- for testing 
    };
    this.updateUsername = this.updateUsername.bind(this);
    this.onJoin = this.onJoin.bind(this);
    this.hostLobby = this.hostLobby.bind(this);
    
    this.socket = socket;
  }

  componentDidMount() {
    //PUT INCOMING MESSAGES HERE!!1!

    socket.on("join-lobby", (lobby) => {
      lobby.lobbyId
      this.setState({lobbyCode: lobby.lobbyId})
      let lobbyList = "Players connected: (temp)\n"

      for(var i=0;i<lobby.players.length;i++) {
        lobbyList += lobby.players[i].displayName + "\n"
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map(str => <p>{str}</p>)});
    });


    socket.on("lobby-player-joined", (lobby) => {
      lobby.lobbyId
      this.setState({lobbyCode: lobby.lobbyId})
      let lobbyList = "Players connected: (temp)\n"
  
      for(var i=0;i<lobby.players.length;i++) {
        lobbyList += lobby.players[i].displayName + "\n"
      }
      this.setState({lobbyPlayerList: lobbyList.split('\n').map(str => <p>{str}</p>)});
  
    });

    socket.on("lobby-player-left", (lobby) => {
      lobby.lobbyId
      this.setState({lobbyCode: lobby.lobbyId})
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
    this.setState({lobbyCode: str})
    socket.emit('join-lobby', "testId",this.state.username ,str);
  }

  hostLobby(){
    socket.emit('host-lobby',"playerId2",this.state.username);
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

          <h2>Lobby Code: {this.state.lobbyCode}</h2>
          <h2>{this.state.lobbyPlayerList}</h2>

          {!this.state.loggedIn ? <LoginInput onSubmit={this.updateUsername}/> : <LobbyInput username={this.state.username} onJoin={this.onJoin} onHost={this.hostLobby}/>}
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