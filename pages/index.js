import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
const io = require("socket.io-client");
const socket = io();


class LobbyScreen extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      lobbyCode: ""
    };
    this.getLobbyCode = this.getLobbyCode.bind(this);
    this.hostLobby = this.hostLobby.bind(this);
    this.joinLobby = this.joinLobby.bind(this);
  }

  hostLobby(){
    socket.emit('host-lobby');
  }

  joinLobby(){
    if(this.state.lobbyCode == null){
      console.log("no code");
      return;
    }
    socket.emit('join-lobby', this.state.lobbyCode);
    console.log("join clicked")
  }

  getLobbyCode = event =>{
    this.setState({lobbyCode: event.target.value});
    console.log("lobby code: "+this.state.lobbyCode);
  }

  render(){
    return(
      <div className={styles.container}>
        <Head>
          <title>COMP4350 Group Project</title>
          <link rel="icon" href="/favicon.ico" /> 
        </Head>

        <main className={styles.main}>
          <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
          
          <p className={styles.description} >By: Team n, n ∈ ℤ<sup>+</sup> </p>
          
          <h2 className={styles.lobby}>Lobby</h2>
          <Link href = "/game">
              <button className={styles.card} 
              id="host-lobbyButton" 
              onClick={this.hostLobby} 
              >Host Game</button>
          </Link>
          <div>OR</div>
          <form>
            <input type="text" 
            placeholder="Enter lobby code" 
            id="lobbyCodeInput"
            onChange={this.getLobbyCode}>
            </input>
          </form>
          <Link href = "/game">
              <button className={styles.card} 
              id="join-lobbyButton" 
              onClick={this.joinLobby} 
              >Join Game</button>
          </Link>
        </main>
        <style jsx>{`
          .seoker{
              width:80vw;
              max-width:800px;
              object-fit:contain;
          }
          .playerInLobby{
              width: 100%;
              text-align: center;
              color: #8c8c8c;
              text-decoration: none;
              border: 1px solid #8c8c8c;
              transition: color 0.15s ease, border-color 0.15s ease;
          }
          .playerInLobby:hover,
          .playerInLobby:focus,
          .playerInLobby:active {
              color: #000000;
              border-color: #000000;
          }
          `}
        </style>
      </div>
    )
  }
}

class LoginScreen extends React.Component{
  constructor(){
      super();
      this.state = {
          name: "Login"
      };
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
              
              <p className={styles.description}>By: Team n, n ∈ ℤ<sup>+</sup> </p>
              <div>
              <label htmlFor="username"><b>Username:</b></label>
              <input type="text" placeholder="Enter Username" name="username" required/>
              </div>
              <div>
              <button type="submit" className="login">Login</button>
              <button className="register">Register</button>
              </div>    
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
      
              <style jsx>{`
              input[type=text]{
                  width: 100%;
                  padding: 12px 20px;
                  margin: 8px 0;
                  display: inline-block;
                  border: 1px solid #ddd;
                  box-sizing: border-box;
              }
              .register,.login {
                  margin: 1rem;
                  padding: 1.5rem;
                  text-align: left;
                  border-radius: 10px;
                  cursor: pointer;
                  transition: color 0.15s ease, border-color 0.15s ease;
              }
              .register {
                  background-color: lightblue; /*light blue*/
                  color: #1d62d1;
              }
              
              .register:hover {
                  background-color: #2d9acc;
                  color: lightblue;
              }
              
              .login{
                  color: #8e8e8e;
              }
              .login:hover{
                  color:black;
                  background-color:lightgrey;
              }
              
              `
              }</style>
        </div>
      );
  }
}

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});

socket.on("client-connection", (...args) => {
  var lobby = args[0]

  var list = ""
  for(var i = 0; i<lobby.players.length;i++){
      list += " " + lobby.players[i];
  }
    console.log("Clients connected: " + list); 
});

socket.on("client-disconnect", (...args) => {
  var lobby = args[0]
  var list = ""
  for(var i = 0; i<lobby.players.length;i++){
    list += " " + lobby.players[i].playerId
  }
  console.log("Client disconnected. New lobby: " + list); 
});

export default class Home extends React.Component{
  constructor(){
    super();

    this.state = {
      name: "Home",
      loggedIn: false,
      showLogin: false,
      showLobby: false
    };

    this.hideComponent = this.hideComponent.bind(this);
  }

  hideComponent(name){
    switch(name){
      case "showLogin":
        this.setState({showLogin: !this.showLogin});
        break;
      case "showLobby":
        this.setState({showLogin: !this.showLogin});
        break;
      default: 
        null;
    }
  }

  render(){
    const { showLogin, showLobby } = this.state;
    
  }
}
