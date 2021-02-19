import Head from 'next/head';
import React from 'react';
import styles from '../styles/Home.module.css';
const io = require("socket.io-client");
const socket = io();


socket.on("connect", () => {
  console.log("Client " + socket.id); 
});

socket.on("client-connection", (...args) => {
  var lobby = args[0]

  var list = ""
  for(var i = 0; i<lobby.players.length;i++){
    list += " " + lobby.players[i].playerId
  }
  displayNames(lobby);
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

export default class HomePage extends React.Component {
 
  
  render(){
    return (
      <div className={styles.container}>
        <Head>
          <title>SEO-ker</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <a href="https://github.com/dietterc/SEO-ker/wiki" target="_blank">
            <img src="/SEO-ker.png" alt="SEO-ker" className="seoker" />
          </a>
          <p className={styles.description}>by n ∈ ℤ<sup>+</sup> </p>
          <div class="form-group">
            <input type="text" 
            placeholder="Display name" 
            id="displayNameInput"></input>
          </div>

            <button 
            type="submit"
            class="btn btn-success"
            id="hostGameButton"
          >
            Host game
          </button>
          <div>OR</div>
          <div class="form-group">
            <input type="text" 
            placeholder="Enter Game code" 
            id="gameCodeInput"></input>
          </div>
          <button 
            type="submit"
            class="btn btn-success"
            id="joinGameButton"
          >
            Join game
          </button>
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
  
}

