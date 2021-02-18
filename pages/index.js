import Head from 'next/head';
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
    list += " " + lobby.players[i]
  }
  console.log("Clients connected: " + list); 
});

socket.on("client-disconnect", (...args) => {
  var lobby = args[0]
  var list = ""
  for(var i = 0; i<lobby.players.length;i++){
    list += " " + lobby.players[i]
  }
  console.log("Client disconnected. New lobby: " + list); 
});


export default function Home() {
  return (
    <div className={styles.container}>
      <head>
        <title>COMP4350 Group Project</title>
        <link rel="icon" href="/favicon.ico" />
      </head>

      <main className={styles.main}>
        <a href="https://github.com/dietterc/SEO-ker/wiki" target="_blank">
           <img src="/SEO-ker.png" alt="SEO-ker" className="seoker" />
        </a>
        <p className={styles.description}>By: Team n, n ∈ ℤ<sup>+</sup> </p>
        <h2 className={styles.lobby}>Lobby</h2>
        <div className="playerInLobby">
           <p>Player Name</p>
        </div>
        <div className="playerInLobby">
            <p>Player Name</p>
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

