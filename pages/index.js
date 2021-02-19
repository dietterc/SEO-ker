import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
const io = require("socket.io-client");
const socket = io();


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
  //console.log("Client disconnected. New lobby: " + list); 
  displayNames(lobby);
});

function displayNames(lobby){
  console.log("number of clients: " + lobby.length+" Clients connected: ");
  for(var player in lobby){
    console.log(player.playerId);
  }
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>COMP4350 Group Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
        
        <p className={styles.description}>By: Team n, n ∈ ℤ<sup>+</sup> </p>
        <h2 className={styles.lobby}>Lobby</h2>
        <div className="form-group">
          <input type="text" 
          placeholder="Display name" 
          id="displayNameInput"></input>
        </div>
        <Link href = "/game">
            <button className={styles.card}id="hostGameButton">Host Game</button>
        </Link>
        <div>OR</div>
        <div class="form-group">
          <input type="text" 
          placeholder="Enter Game code" 
          id="gameCodeInput"></input>
        </div>
        <Link href = "/game">
            <button className={styles.card} id="joinGameButton">Join Game</button>
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
          `
        }</style>
      </div>
  )
}

