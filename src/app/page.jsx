'use client';

import { useAuth } from './context/auth-context';
import Header from './components/header';
import styles from './styles/index.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from './components/ui/button';
export default function Index() {
  const { user } = useAuth();

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.content}>
        <div className={styles.redSection}>
          <div className={styles.redContent}>
            <h1 className={styles.title}>Welcome to PokéGam</h1>
            <p className={styles.subtitle}>
              Experience the thrill of opening Pokémon card packs and build your ultimate collection!
            </p>
            <Link href="/packs">
              <Button size="lg" variant="secondary" className={styles.button}>
                Start Opening Packs
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className={styles.graySection}>
          <div className={styles.grayContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Free Packs Daily</h2>
              <p className={styles.cardText}>
                Get started with free packs and build your collection. Unlock rare cards and special editions!
              </p>
            </div>
            
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Trade in Market</h2>
              <p className={styles.cardText}>
                Buy special packs and rare cards using diamonds in our marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}