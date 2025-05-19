'use client';

import { useState } from 'react';
import { Package, Diamond, X } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './PokemonPack.module.css';
import { useAuth } from '../AuthorizationModule/AuthContext';

export default function PokemonPack({ pack, setUser, onAction }) {
  const [error, setError] = useState('');
  const [resultModal, setResultModal] = useState(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notEnoughDiamonds, setNotEnoughDiamonds] = useState(false);
  const isFree = pack.tag === 'Free';
  const { updateUser, user } = useAuth();

  const handleBuyPack = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/user/buy-pack', {
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

      setResultModal({
        cards: [...(result.newCards || []), ...(result.duplicates || [])],
        duplicates: (result.duplicates || []).map((c) => c.name),
        packName: pack.name,
      });

      if (result.updatedUser) {
        localStorage.setItem('user', JSON.stringify(result.updatedUser));
        updateUser(result.updatedUser);
      }
    } catch (err) {
      console.error('❌ Buy pack failed:', err);
      setError('Failed to buy pack');
    }
  };

  const handleBuyClick = () => {
    setShowUnifiedModal(true);
  };

  const handleConfirmFromUnified = () => {
    if (isFree) {
      handleBuyPack();
    } else if (user?.diamonds < pack.price) {
      setNotEnoughDiamonds(true);
    } else {
      setShowConfirmModal(true);
    }
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
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowUnifiedModal(false)}
            >
              <X size={24} />
            </button>
            
            <h3 className={styles.modalTitle}>Possible Cards in {pack.name}</h3>

            <div className={`${styles.previewTopRow} ${isFree ? styles.free : styles.market}`}>
              {pack.cards.map((card) => (
                <img
                  key={card.id}
                  src={card.imageUrl}
                  alt={card.name}
                  className={styles.cardImage}
                />
              ))}
            </div>

            <Button
              className={styles.openButton}
              onClick={() => {
                setShowUnifiedModal(false);
                handleConfirmFromUnified();
              }}
            >
              {isFree ? 'Open Pack' : 'Buy Pack'}
            </Button>

            <div className={styles.previewBottomRow}>
              {pack.cards.map((card) => {
                const chance = Math.max(1, Math.floor(100 / pack.cards.length));
                return (
                  <div key={card.id} className={styles.previewCard}>
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className={styles.modalCardImage}
                    />
                    <p className={styles.previewCardName}>{chance}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Are you sure you want to buy:<br />
              “{pack.name}” for {pack.price}?
            </h3>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                No
              </Button>
              <Button
                className={styles.buyButton}
                onClick={async () => {
                  await handleBuyPack();
                  setShowConfirmModal(false);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {notEnoughDiamonds && (
        <div className={styles.modalOverlay} onClick={() => setNotEnoughDiamonds(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.error}>You don’t have enough Diamonds</h2>
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
            <div className={styles.modalCardGrid}>
              {resultModal.cards.map((card, idx) => (
                <div
                  key={idx}
                  className={`${styles.modalCard} ${
                    resultModal.duplicates.includes(card.name) ? styles.duplicateCard : ''
                  }`}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className={styles.modalCardImage}
                  />
                  <p className={styles.modalCardName}>{card.name}</p>
                  {resultModal.duplicates.includes(card.name) && (
                    <p className={styles.duplicateMessage}>Duplicate<br></br> +{card.reward} <Diamond className={`${styles.diamond}`}></Diamond></p>
                  )}
                </div>
              ))}
            </div>
            <Button className={styles.modalCloseButton} onClick={() => setResultModal(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
