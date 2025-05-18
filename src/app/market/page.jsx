'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PokemonPack from '../components/PokemonPack';
import Header from '../components/header';
import styles from './styles/market.module.css';
import { Diamond } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function MarketPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('packs');
  const [packs, setPacks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

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

  const handleBuyCard = async (card) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/user/buy-card', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: card.id }),
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

      if (result.success) {
        alert(`🎉 Successfully bought ${card.name}!`);
        setSelectedCard(null);
        
        if (result.updatedUser) {
          localStorage.setItem('user', JSON.stringify(result.updatedUser));
        }
        
        loadCards();
      }
    } catch (err) {
      console.error('❌ Buy card failed:', err);
      alert('Failed to buy card');
    }
  };

  const marketPacks = packs.filter(pack => pack.tag === 'Market');

  const userOwnsCard = (cardId) => {
    if (!user?.cards) return false;
    return user.cards.some(userCard => userCard.name === cardId);
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Pokemon Market</h1>
        
        <div className={styles.tabs}>
          <div className={styles.tabsInner}>
            <button 
              className={`${styles.tab} ${activeTab === 'packs' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('packs')}
            >
              Premium Packs
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'cards' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              Single Cards
            </button>
          </div>
        </div>

        {activeTab === 'packs' && (
          <div className={styles.grid}>
            {marketPacks.map(pack => (
              <PokemonPack 
                key={pack.id} 
                pack={pack}
              />
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.grid}>
            {cards.map(card => (
              <div 
                key={card.id} 
                className={`${styles.cardItem} ${userOwnsCard(card.name) ? styles.ownedCard : ''}`}
              >
                <img 
                  src={card.imageUrl} 
                  alt={card.name}
                  className={styles.cardImage}
                  onClick={() => !userOwnsCard(card.name) && setSelectedCard(card)}
                />
                <div className={styles.cardInfo}>
                  <div className={styles.price}>
                    <Diamond size={16} className={styles.priceIcon} />
                    <span className={styles.priceValue}>{card.price}</span>
                  </div>
                  {!userOwnsCard(card.name) && (
                    <Button 
                      className={styles.buyButton}
                      onClick={() => setSelectedCard(card)}
                    >
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCard && (
          <div className={styles.cardModalOverlay} onClick={() => setSelectedCard(null)}>
            <div className={styles.cardModal} onClick={e => e.stopPropagation()}>
              <img 
                src={selectedCard.imageUrl} 
                alt={selectedCard.name}
                className={styles.modalImage}
              />
              <div className={styles.modalButtons}>
                <Button 
                  className={styles.cancelButton}
                  onClick={() => setSelectedCard(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className={`${styles.confirmButton} ${styles.buyButton}`}
                  onClick={() => handleBuyCard(selectedCard)}
                >
                  Buy
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
