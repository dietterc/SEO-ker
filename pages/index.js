import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
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
                  <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
        </a>
        <p className={styles.description}>By: Team n, n ∈ ℤ<sup>+</sup> </p>
        <h2 className={styles.lobby}>Lobby</h2>

              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <div className={styles.playerInLobby}>
                  <p>Player Name</p>
              </div>
              <Link href = "/game">
                  <button className={styles.card}>Start Game</button>
              </Link>
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
        
        `
      }</style>
    </div>

  )
}

