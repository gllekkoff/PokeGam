'use client';

import { useEffect, useState } from 'react';
import Header from '../components/header';
import PokemonPack from '../components/PokemonPack';
import styles from './styles/market.module.css';
import { Diamond } from 'lucide-react';

export default function MarketPage() {
  const [packs, setPacks] = useState([]);
  const [activeTab, setActiveTab] = useState('packs');

  useEffect(() => {
    const loadMarketPacks = async () => {
      try {
        const res = await fetch('http://localhost:8000/marketPacks');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPacks(data);
      } catch (err) {
        console.error('❌ Failed to load market packs:', err);
      }
    };

    loadMarketPacks();
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Pokémon Market</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'packs' ? styles.active : ''}`}
            onClick={() => setActiveTab('packs')}
          >
            Premium Packs
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'cards' ? styles.active : ''}`}
            onClick={() => setActiveTab('cards')}
            disabled
          >
            Single Cards
          </button>
        </div>

        {activeTab === 'packs' && (
          <div className={styles.grid}>
            {packs.map((pack) => (
              <div key={pack.id} className={styles.card}>
                <PokemonPack pack={pack} />
                <div className={styles.footer}>
                  <span className={styles.price}>
                    <Diamond size={16} /> {pack.price}
                  </span>
                  <button className={styles.button}>Open</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.grid}>
            <p className={styles.disabled}>Single cards coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
