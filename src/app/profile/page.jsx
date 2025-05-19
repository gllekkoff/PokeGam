'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header/Header';
import PokemonCard from '../components/PokemonCard/PokemonCard';
import styles from './styles/profile.module.css';
import { Diamond, UserRound } from 'lucide-react';
import { useAuth } from '../components/AuthorizationModule/AuthContext';
import LogoutConfirmation from '../components/LogoutConfirmation/LogoutConfirmation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [activeTab, setActiveTab] = useState('collection');
  const [starredCards, setStarredCards] = useState(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
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
        setStarredCards(new Set(data.starredCards || []));
      } catch (err) {
        console.error('Failed to load profile:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
      }
    };

    const loadAllCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch cards');
        const data = await res.json();
        setAllCards(data);
      } catch (err) {
        console.error('Failed to fetch all cards:', err);
      }
    };

    loadProfile();
    loadAllCards();
  }, [router, updateUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || cards.length === 0 || allCards.length === 0) return;

    const value = cards.reduce((acc, userCard) => {
      const match = allCards.find(c => c.name === userCard.name);
      return acc + (match?.price || 0);
    }, 0);

    fetch('http://localhost:8000/api/user/update-collection-value', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ collectionValue: value }),
    }).catch(err => console.error('Failed to update collection value:', err));
  }, [cards, allCards]);

  const handleToggleStar = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      const newStarred = new Set(starredCards);

      if (newStarred.has(cardId)) {
        newStarred.delete(cardId);
      } else {
        newStarred.add(cardId);
      }

      const response = await fetch('http://localhost:8000/api/user/starred-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          starredCards: [...newStarred]
        })
      });

      if (!response.ok) throw new Error('Failed to update starred cards');

      setStarredCards(newStarred);
      localStorage.setItem('starredCards', JSON.stringify([...newStarred]));
    } catch (err) {
      console.error('Failed to update starred cards:', err);
    }
  };

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const aStarred = starredCards.has(a.id) ? 1 : 0;
      const bStarred = starredCards.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [cards, starredCards]);

  const collectionValue = useMemo(() => {
    return cards.reduce((acc, userCard) => {
      const matchingCard = allCards.find(c => c.name === userCard.name);
      return acc + (matchingCard?.price || 0);
    }, 0);
  }, [cards, allCards]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header onLogoutClick={handleLogoutClick} />
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
                  {collectionValue}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className={styles.cardGrid}>
              {sortedCards.map((card) => (
                <PokemonCard 
                  key={card.id} 
                  card={{
                    ...card,
                    isStarred: starredCards.has(card.id)
                  }}
                  onToggleStar={handleToggleStar}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmation
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </div>
  );
}
