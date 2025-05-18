'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header/Header';
import PokemonCard from '../components/PokemonCard/PokemonCard';
import styles from './styles/profile.module.css';
import { Diamond, UserRound } from 'lucide-react';
import { useAuth } from '../components/AuthorizationModule/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

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
        updateUser(data);
        setCards(data.cards || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };

    loadProfile();
  }, [router, updateUser]);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.topSection}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}><UserRound color="#cf4040" size={54}/></div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileTitle}>{user.username}</h1>
              <div className={styles.diamondTag}>
                <Diamond size={24} />
                <span className={styles.diamondCount}>{user.diamonds ?? 1000}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentCard}>
          <div className={styles.tabsList}>
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
          </div>

          {activeTab === 'stats' && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3 className={styles.statLabel}>Packs Opened</h3>
                <p className={styles.statValue}>{user.packs_opened}</p>
              </div>

              <div className={styles.statCard}>
                <h3 className={styles.statLabel}>Rare Cards</h3>
                <p className={styles.statValue}>{user.rare_cards}</p>
              </div>

              <div className={styles.statCard}>
                <h3 className={styles.statLabel}>Collection Value</h3>
                <p className={styles.collectionValue}>
                  <Diamond className={styles.valueDiamond} size={24} />
                  {user.collection_value}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className={styles.cardGrid}>
              {cards.map((card) => (
                <PokemonCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
