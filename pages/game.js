import Head from 'next/head';
import styles from '../styles/Home.module.css';
import gameSty from '../styles/Game.module.css';

export default function Game() {
    return (
    <div className={gameSty.container}>
        <Head>
            <title>SEO-ker Game Room</title>
            <link rel="icon" href="/favicon.ico"/>
        </Head>   
        <main className={gameSty.main}>
            <img src="/SEO-ker.png" alt="SEO-ker" className={styles.seoker} />
            <div className="hand">
                    <div className={styles.card}></div>
                    <div className={styles.card}></div>
                    <div className={styles.card}></div>
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
            <style jsx>{
                `
                .hand{
                    bottom:0;
                    background: lightgrey;
                }
            `}
        </style>
    </div>
    )
}