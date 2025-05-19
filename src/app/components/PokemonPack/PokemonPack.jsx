'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../Button/Button';
import styles from './PokemonPack.module.css';
import { useAuth } from '../AuthorizationModule/AuthContext';
import { Diamond, X } from 'lucide-react'
export default function PokemonPack({ pack, setUser, onAction }) {
  const [resultModal, setResultModal] = useState(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [notEnoughDiamonds, setNotEnoughDiamonds] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [winningCard, setWinningCard] = useState(null);
  const [stopPosition, setStopPosition] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const carouselRef = useRef(null);

  const isFree = pack.tag === 'Free';
  const { updateUser, user } = useAuth();

  useEffect(() => {
    return () => {
      setIsSpinning(false);
      setIsStopping(false);
      setWinningCard(null);
      setShowUnifiedModal(false);
    };
  }, []);

  const handleBuyPack = async () => {
    const token = localStorage.getItem('token');
    try {
      setShowUnifiedModal(true);
      setIsSpinning(true);
      setIsOpening(true);

      const res = await fetch('http://localhost:8000/api/user/buy-pack', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId: pack.id }),
      });

      const result = await res.json();
      const winner = result.newCards?.[0] || result.duplicates?.[0];
      
      if (!winner) {
        throw new Error('No card received');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const index = pack.cards.findIndex(card => card.name === winner.name);
      const itemWidth = 110;
      const containerWidth = carouselRef.current?.offsetWidth || 550;
      const centerOffset = (containerWidth / 2) - (itemWidth / 2);
      const stopX = -(index * itemWidth) - (itemWidth * pack.cards.length) + centerOffset;
      
      setIsSpinning(false);
      setIsStopping(true);
      setStopPosition(stopX);
      setWinningCard(winner);

      await new Promise(resolve => setTimeout(resolve, 2100));

      setIsStopping(false);
      setShowUnifiedModal(false);
      setIsOpening(false);
      setResultModal({
        cards: [winner],
        duplicates: result.duplicates?.map(d => d.name) || [],
        packName: pack.name,
      });

      if (result.updatedUser) {
        localStorage.setItem('user', JSON.stringify(result.updatedUser));
        updateUser(result.updatedUser);
      }

    } catch (err) {
      console.error('General error:', err);
      setIsSpinning(false);
      setIsStopping(false);
      setIsOpening(false);
      setShowUnifiedModal(false);
    }
  };

  const handleBuyClick = () => {
    setShowUnifiedModal(true);
  };

  const handleConfirmFromUnified = () => {
    if (isOpening) return;
    
    if (isFree) {
      handleBuyPack();
    } else if (user?.diamonds < pack.price) {
      setNotEnoughDiamonds(true);
    } else {
      handleBuyPack();
    }
  };

  const startAcceleratedReveal = () => {
    setIsOpening(true);
    setAccelerating(true);
    if (carouselRef.current) {
      carouselRef.current.style.animationDuration = '1s';
    }
    setTimeout(() => {
      setShowUnifiedModal(false);
      handleBuyPack();
      setAccelerating(false);
    }, 3000);
  };

  return (
    <>
      <div className={styles.card}>
        <div
          className={`${styles.imageContainer} ${
            pack.tag === 'Free' ? styles.freeGradient : pack.tag === 'Market' ? styles.marketGradient : ''
          }`}
        >
          <img
            src={pack.image}
            alt={pack.name}
            className={styles.packImage}
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{pack.name}</h3>
          <div className={styles.footer}>
            <div className={styles.leftTag}>
              {isFree ? (
                <span className={styles.freeTag}>Free</span>
              ) : (
                <span className={styles.price}>
                  <Diamond size={16} />
                  {pack.price}
                </span>
              )}
            </div>
            <Button
              className={styles.buyButton}
              size="sm"
              variant={isFree ? 'destructive' : 'default'}
              onClick={handleBuyClick}
            >
              {isFree ? 'Open' : 'Buy'}
            </Button>
          </div>
        </div>
      </div>

            {showUnifiedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUnifiedModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowUnifiedModal(false)}>
              <X size={24} />
            </button>

            <h3 className={styles.modalTitle}>Possible Cards in {pack.name}</h3>

            <div className={`${styles.carouselRow} ${isFree ? styles.free : styles.market}`}>
              <div
                ref={carouselRef}
                className={`${styles.carouselTrack} ${
                  isSpinning ? styles.spinning : isStopping ? styles.stopping : ''
                }`}
                style={
                  winningCard
                    ? { '--stop-position': `${stopPosition}px` }
                    : {}
                }
              >
                {[...pack.cards, ...pack.cards, ...pack.cards].map((card, idx) => (
                  <div key={idx} className={styles.carouselItem}>
                    <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.indicatorArrow} />
            <Button className={styles.openButton} onClick={handleConfirmFromUnified}>
              {isFree ? 'Open Pack' : 'Buy Pack'}
            </Button>

            <div className={styles.previewBottomRow}>
              {pack.cards.map((card) => {
                return (
                  <div key={card.id} className={styles.previewCard}>
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className={styles.modalCardImage}
                    />
                    <p className={styles.previewCardName}>{card.chance}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {notEnoughDiamonds && (
        <div className={styles.modalOverlay} onClick={() => setNotEnoughDiamonds(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.error}>You don't have enough Diamonds</h2>
            <div className={styles.modalActions}>
              <Button onClick={() => setNotEnoughDiamonds(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {resultModal && (
        <div className={styles.modalOverlay} onClick={() => setResultModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>You opened {resultModal.packName}!</h3>
            <div className={styles.resultCard}>
              {resultModal.cards.map((card, idx) => (
                <div key={idx} className={styles.bigCard}>
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className={styles.bigCardImage}
                  />
                  <div className={styles.cardInfo}>
                    <h4 className={styles.cardName}>
                      You've got {resultModal.duplicates.includes(card.name) ? 'a duplicate' : 'a new'} card: {card.name}!
                    </h4>
                    {resultModal.duplicates.includes(card.name) && card.reward && (
                      <div className={styles.duplicateInfo}>
                        <span className={styles.duplicateTag}>Duplicate</span>
                        <span className={styles.rewardInfo}>
                          +{card.reward} <Diamond size={16} className={styles.diamond} />
                        </span>
                      </div>
                    )}
                  </div>
                  <Button 
                    className={styles.modalCloseButton}
                    onClick={() => setResultModal(null)}
                  >
                    Close
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
