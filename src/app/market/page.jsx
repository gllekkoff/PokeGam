'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PokemonPack from '../components/PokemonPack/PokemonPack';
import Header from '../components/Header/Header';
import styles from './styles/market.module.css';
import { Button } from '../components/Button/Button';
import { useAuth } from '../components/AuthorizationModule/AuthContext';
import FilterSection from './FilterSection/FilterSection';
import CardGrid from './CardGrid/CardGrid';
import CardModal from './CardModal/CardModal';

export default function MarketPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('packs');
  const [packs, setPacks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [showUnifiedCardModal, setShowUnifiedCardModal] = useState(false);
  const [showCardConfirm, setShowCardConfirm] = useState(false);
  const [filteredCards, setFilteredCards] = useState([]);
  const [filters, setFilters] = useState({
    rarity: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'default'
  });

  useEffect(() => {
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

  useEffect(() => {
    let result = [...cards];

    if (filters.rarity !== 'all') {
      result = result.filter(card => card.rarity === filters.rarity);
    }

    if (filters.minPrice !== '') {
      result = result.filter(card => card.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== '') {
      result = result.filter(card => card.price <= Number(filters.maxPrice));
    }

    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredCards(result);
  }, [cards, filters]);

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
          updateUser(result.updatedUser);
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
    return user?.cards?.some(
      (c) => c.name.trim().toLowerCase() === cardName.trim().toLowerCase()
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const rarityOptions = ['all', ...new Set(cards.map(card => card.rarity))];

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
              <PokemonPack key={pack.id} pack={pack} setUser={updateUser} />
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className={styles.cardsContainer}>
            <FilterSection 
              filters={filters}
              onFilterChange={handleFilterChange}
              rarityOptions={rarityOptions}
            />
            <CardGrid 
              cards={filteredCards}
              userOwnsCard={userOwnsCard}
              onCardSelect={(card) => {
                setSelectedCard(card);
                setShowUnifiedCardModal(true);
              }}
            />
          </div>
        )}

        {showUnifiedCardModal && selectedCard && (
          <CardModal 
            card={selectedCard}
            onClose={() => setShowUnifiedCardModal(false)}
            onBuy={handleBuyCard}
          />
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
