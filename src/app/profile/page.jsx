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
  const [diamonds, setDiamonds] = useState(0);

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

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        setUser(data);
        setCards(data.cards || []);
        setDiamonds(data.diamonds || 0);
      } catch (err) {
        console.error('❌ Failed to load profile:', err);
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
          <h2 className={styles.title}>Trainer Profile</h2>
          <div className={styles.gems}>💎 {diamonds}</div>
        </section>

        <section className={styles.tabs}>
          <button className={styles.activeTab}>Collection</button>
          <button className={styles.tab}>Stats</button>
        </section>

        <section className={styles.cardGrid}>
          {cards.map((card) => (
            <PokemonCard key={card.id} card={card} />
          ))}
        </section>
      </div>
    </div>
  );
}
