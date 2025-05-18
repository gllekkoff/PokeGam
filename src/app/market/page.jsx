'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/header';
import PokemonPack from '../components/PokemonPack';
import styles from './styles/market.module.css';

export default function MarketPage() {
  const router = useRouter();
  const [packs, setPacks] = useState([]);
  const [activeTab, setActiveTab] = useState('packs');

  useEffect(() => {
    const loadPacks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/api/packs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();
        setPacks(data);
      } catch (err) {
        console.error('❌ Failed to load packs:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };
    loadPacks();
  }, [router]);

  if (!packs.length) return null;

  const marketPacks = packs.filter((pack) => pack.tag === 'Market');

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Pokémon Market</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === 'packs' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('packs')}
          >
            Premium Packs
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'cards' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('cards')}
            disabled
          >
            Single Cards
          </button>
        </div>

        {activeTab === 'packs' && (
          <div className={styles.packGrid}>
            {marketPacks.map((pack) => (
              <PokemonPack key={pack.id} pack={pack} />
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.packGrid}>
            <p className={styles.disabled}>Single cards coming soon…</p>
          </div>
        )}
      </main>
    </div>
  );
}
