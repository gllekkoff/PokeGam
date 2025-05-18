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
      } catch (err) {
        console.error('❌ Failed to load packs:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };

    fetchPacks();
  }, [router]);

  const handleOpenPack = async (pack) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/user/open-pack', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId: pack.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'Something went wrong');
        return;
      }

      if (result.reward === 'duplicate_sold') {
        alert(`💰 You already had ${result.card.name}. Sold for 10 diamonds!`);
      } else {
        alert(`🎉 You got ${result.card.name}!`);
      }

      if (result.updatedUser) {
        localStorage.setItem('user', JSON.stringify(result.updatedUser));
      }
    } catch (err) {
      console.error('❌ Failed to open pack:', err);
      setError('Failed to open pack');
    }
  };

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
              <PokemonPack
                key={pack.id}
                pack={pack}
                onAction={handleOpenPack}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
