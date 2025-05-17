'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/header';
import PokemonCard from '../components/PokemonCard';
import styles from './styles/profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUser(data);
        setCards(data.cards || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };

    loadProfile();
  }, [router]);

  if (!user) return null;

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        <section className={styles.banner}>
          <div className={styles.avatar}>👤</div>
          <h2 className={styles.title}>{user.username}</h2>
          <div className={styles.gems}>💎 {user.diamonds ?? 0}</div>
        </section>

        <section className={styles.tabs}>
          <button
            onClick={() => setActiveTab('collection')}
            className={`${styles.tab} ${activeTab === 'collection' ? styles.activeTab : ''}`}
          >
            Collection
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`${styles.tab} ${activeTab === 'stats' ? styles.activeTab : ''}`}
          >
            Stats
          </button>
        </section>

        {activeTab === 'collection' && (
          <section className={styles.cardGrid}>
            {cards.map((card) => (
              <PokemonCard key={card.id} card={card} />
            ))}
          </section>
        )}

        {activeTab === 'stats' && (
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Packs Opened</h3>
              <p className={styles.statValueRed}>24</p>
            </div>

            <div className={styles.statCard}>
              <h3>Rare Cards</h3>
              <p className={styles.statValueRed}>8</p>
            </div>

            <div className={styles.statCard}>
              <h3>Collection Value</h3>
              <p className={styles.statValueBlue}>
                💎 2400
              </p>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
