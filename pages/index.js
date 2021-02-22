import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
const io = require("socket.io-client");
const socket = io();


socket.on("connect", () => {
  console.log("Client " + socket.id); 
});


export default class Home extends React.Component{
  
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
    socket.emit('host-lobby',"playerId2","Display Name");
  }

  joinLobby(){
    if(this.state.lobbyCode == null){
      console.log("no code");
      return;
    }
    socket.emit('join-lobby', "testId","Players Name" ,this.state.lobbyCode);
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
          
          <p className={styles.description}>By: Team n, n ∈ ℤ<sup>+</sup> </p>
          <h2 className={styles.lobby}>Lobby</h2>
          <Link href = "/game">
              <button className={styles.card} id="host-lobbyButton" onClick={this.hostLobby} >Host Game</button>
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
              <button className={styles.card} id="join-lobbyButton" onClick={this.joinLobby} >Join Game</button>
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


