'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PokemonPack from '../components/PokemonPack/PokemonPack';
import Header from '../components/Header/Header';
import styles from './styles/market.module.css';
import { Diamond } from 'lucide-react';
import { Button } from '../components/Button/Button';

export default function MarketPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('packs');
  const [packs, setPacks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
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
        setPurchaseResult({
          success: false,
          message: result.message || 'Failed to buy card',
        });
        return;
      }

      if (result.success) {
        setPurchaseResult({
          success: true,
          card: result.card,
          message: `🎉 Successfully bought ${result.card.name}!`,
        });

        setSelectedCard(null);
        if (result.updatedUser) {
          localStorage.setItem('user', JSON.stringify(result.updatedUser));
          setUser(result.updatedUser);
        }
      }
    } catch (err) {
      console.error('❌ Buy card failed:', err);
      setPurchaseResult({
        success: false,
        message: 'Failed to buy card',
      });
    }
  };

  const marketPacks = packs.filter((pack) => pack.tag === 'Market');

  const userOwnsCard = (cardName) => {
    return user?.cards?.some((c) => c.name.trim().toLowerCase() === cardName.trim().toLowerCase());
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
            {marketPacks.map((pack) => (
              <PokemonPack key={pack.id} pack={pack} setUser={setUser} />
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.grid}>
            {cards.map((card) => (
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
                    <Button className={styles.buyButton} onClick={() => setSelectedCard(card)}>
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
            <div className={styles.cardModal} onClick={(e) => e.stopPropagation()}>
              <img src={selectedCard.imageUrl} alt={selectedCard.name} className={styles.modalImage} />
              <div className={styles.modalButtons}>
                <Button className={styles.cancelButton} onClick={() => setSelectedCard(null)}>
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

        {purchaseResult && (
          <div className={styles.cardModalOverlay} onClick={() => setPurchaseResult(null)}>
            <div className={styles.cardModal} onClick={(e) => e.stopPropagation()}>
              {purchaseResult.success ? (
                <>
                  <img
                    src={purchaseResult.card.imageUrl}
                    alt={purchaseResult.card.name}
                    className={styles.modalImage}
                  />
                  <p className={styles.resultText}>{purchaseResult.message}</p>
                </>
              ) : (
                <p className={styles.error}>{purchaseResult.message}</p>
              )}
              <div className={styles.modalButtons}>
                <Button onClick={() => setPurchaseResult(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
