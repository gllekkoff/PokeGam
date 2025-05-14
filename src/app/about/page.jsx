import styles from './styles/about.module.css';
import {Header } from "../components/header"
export default function About() {
  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <h1 className={styles.title}>About PokeGam</h1>
        
        <div className={styles.content}>
          <p className={styles.intro}>
            PokeGam is a unique platform that combines the excitement of Pokemon card collecting with modern gaming mechanics. 
            Our platform offers both free and premium experiences for Pokemon enthusiasts.
          </p>
          
          <div className={styles.sections}>
            <div>
              <h2 className={styles.sectionTitle}>Free Packs</h2>
              <p className={styles.sectionText}>
                Start your collection with our selection of free packs. These packs contain a variety of Pokemon cards that will help you begin your journey.
              </p>
            </div>
            
            <div>
              <h2 className={styles.sectionTitle}>Premium Experience</h2>
              <p className={styles.sectionText}>
                Enhance your collection with our premium packs and individual cards available in the market. Use diamonds to acquire rare and powerful cards.
              </p>
            </div>
            
            <div>
              <h2 className={styles.sectionTitle}>Fair Play</h2>
              <p className={styles.sectionText}>
                We believe in providing a fair and enjoyable experience for all players. Our pack odds are transparent, and we regularly update our collection with new cards.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};