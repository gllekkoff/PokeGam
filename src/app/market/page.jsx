'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/header';
import PokemonPack from '../components/PokemonPack';
import PokemonCard from '../components/PokemonCard';
import { Diamond } from 'lucide-react';
import styles from './styles/market.module.css';

export default function MarketPage() {
  const router = useRouter();
  const [packs, setPacks] = useState([]);
  const [cards, setCards] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('packs');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const loadPacks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/packs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load packs');
        const data = await res.json();
        setPacks(data);
      } catch (err) {
        console.error('❌ Failed to load packs:', err);
      }
    };

    const loadCards = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/cards', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load cards');
        const data = await res.json();
        setCards(data);
      } catch (err) {
        console.error('❌ Failed to load cards:', err);
      }
    };

    loadPacks();
    loadCards();
  }, [router]);

  const handlePurchaseUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleBuyCard = async (cardId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/user/buy-card', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.message === 'Not enough diamonds') {
          alert('Not enough diamonds');
        } else {
          alert(result.message || 'Something went wrong');
        }
        return;
      }

      alert(`🎉 You bought ${result.card.name}!`);
      handlePurchaseUpdate(result.updatedUser);
    } catch (err) {
      console.error('❌ Buy card failed:', err);
    }
  };

  const marketPacks = packs.filter((pack) => pack.tag === 'Market');

  return (
    <div className={styles.container}>
      <Header user={user} />
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
          >
            Single Cards
          </button>
        </div>

        {activeTab === 'packs' && (
          <div className={styles.packGrid}>
            {marketPacks.map((pack) => (
              <PokemonPack
                key={pack.id}
                pack={pack}
                onPurchase={handlePurchaseUpdate}
              />
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.packGrid}>
            {cards.map((card) => (
              <div key={card.id} className={styles.cardWrapper}>
                <PokemonCard card={card} />
                <div className={styles.packFooter}>
                  <div className={styles.priceSection}>
                    <Diamond className={styles.diamondIcon} />
                    <span className={styles.packPrice}>{card.price}</span>
                  </div>
                  <button
                    className={styles.openButton}
                    onClick={() => setSelectedCard(card)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedCard && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <img
              src={selectedCard.imageUrl}
              alt={selectedCard.name}
              className={styles.modalCardImage}
            />
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedCard(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBuyButton}
                onClick={() => {
                  handleBuyCard(selectedCard.id);
                  setSelectedCard(null);
                }}
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
