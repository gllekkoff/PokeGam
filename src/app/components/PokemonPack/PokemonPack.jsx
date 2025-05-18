'use client';

import { useState } from 'react';
import { Package, Diamond } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './PokemonPack.module.css';
import { useAuth } from '../AuthorizationModule/AuthContext';

export default function PokemonPack({ pack, setUser, onAction }) {
  const [error, setError] = useState('');
  const [resultModal, setResultModal] = useState(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isFree = pack.tag === 'Free';
  const { updateUser } = useAuth();

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

  return (
    <>
      <div className={styles.card}>
        <div
          className={`${styles.imageContainer} ${
            isFree ? styles.freeGradient : styles.premiumGradient
          }`}
        >
          <Package size={64} color="white" />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{pack.name}</h3>
          <div className={styles.footer}>
            {!isFree && (
              <span className={styles.price}>
                <Diamond size={16} />
                {pack.price}
              </span>
            )}
            {isFree && <span className={styles.freeTag}>Free</span>}
            <Button
              className={!isFree ? styles.buyButton : undefined}
              size="sm"
              variant={isFree ? 'destructive' : 'default'}
              onClick={() => {
                if (isFree) {
                  setShowUnifiedModal(true);
                } else {
                  setShowConfirm(true);
                }
              }}
            >
              {isFree ? 'Open' : 'Buy'}
            </Button>
          </div>
        </div>
      </div>

      {showUnifiedModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Possible Cards in {pack.name}</h3>

            <div className={styles.previewTopRow}>
              {pack.cards.map((card) => (
                <img
                  key={card.id}
                  src={card.imageUrl}
                  alt={card.name}
                  className={styles.cardImage}
                />
              ))}
            </div>

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

            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setShowUnifiedModal(false)}>
                Cancel
              </Button>
              <Button
                className={styles.buyButton}
                onClick={async () => {
                  await handleBuyPack();
                  setShowUnifiedModal(false);
                }}
              >
                Open
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>
              Are you sure you want to {isFree ? 'open' : 'buy'}:
              <br />
              <strong>{pack.name}</strong>
            </p>
            {!isFree && (
              <p>
                <strong>
                  Price: {pack.price} <Diamond size={16} />
                </strong>
              </p>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                className={!isFree ? styles.buyButton : undefined}
                variant={isFree ? 'destructive' : 'default'}
                onClick={async () => {
                  await handleBuyPack();
                  setShowConfirm(false);
                }}
              >
                {isFree ? 'Open' : 'Buy'}
              </Button>
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
