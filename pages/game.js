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