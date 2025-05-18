'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header/Header';
import PokemonPack from '../components/PokemonPack/PokemonPack';
import styles from './styles/packs.module.css';

export default function PacksPage() {
  const router = useRouter();
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const fetchPacks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/packs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPacks(data);

        // ✅ Store card info locally for modal use
        const cardsRes = await fetch('http://localhost:8000/api/cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const cardsData = await cardsRes.json();
        localStorage.setItem('cards', JSON.stringify(cardsData));
      } catch (err) {
        console.error('❌ Failed to load packs or cards:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };

    fetchPacks();
  }, [router]);

  if (!packs.length) return null;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Open Pokémon Packs</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.packGrid}>
          {packs
            .filter((pack) => pack.tag === 'Free')
            .map((pack) => (
              <PokemonPack key={pack.id} pack={pack} />
            ))}
        </div>
      </main>
    </div>
  );
}
