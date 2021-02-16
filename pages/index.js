import Head from 'next/head';
import styles from '../styles/Home.module.css';
const io = require("socket.io-client");
const socket = io();

socket.on("connect", () => {
  console.log("Client " + socket.id); 
});

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>COMP4350 Group Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Template site for Team n, n ∈ ℤ<sup>+</sup>
        </h1>

        <p className={styles.description}>
          description
        </p>


        <a className="card">
            <h3>Send ping &rarr; 0 pings received.</h3>
            <p>Send a ping to the server. (broken)</p>
        </a>
        
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/dietterc/SEO-ker"
          target="_blank"
          rel="noopener noreferrer"
        >
          Repo: {' '}
          <img src="/GitHub_Logo.png" alt="Repo" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        .card {
            margin: 1rem;
            flex-basis: 45%;
            padding: 1.5rem;
            text-align: left;
            color: inherit;
            text-decoration: none;
            border: 1px solid #eaeaea;
            border-radius: 10px;
            transition: color 0.15s ease, border-color 0.15s ease;
          }

          .card:hover,
          .card:focus,
          .card:active {
            color: #0070f3;
            border-color: #0070f3;
          }

          .card h3 {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
          }

          .card p {
            margin: 0;
            font-size: 1.25rem;
            line-height: 1.5;
          }
        `}</style>

    </div>
  )
}

