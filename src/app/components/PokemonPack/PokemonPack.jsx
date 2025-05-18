'use client';

import { useState } from 'react';
import { Package, Diamond } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './PokemonPack.module.css';
import { useAuth } from '../AuthorizationModule/AuthContext';

export default function PokemonPack({ pack }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resultModal, setResultModal] = useState(null);
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
        type: result.reward === 'duplicate_sold' ? 'duplicate' : 'new',
        card: result.card,
        message:
          result.reward === 'duplicate_sold'
            ? `💰 You already had ${result.card.name}. Sold for 10 diamonds!`
            : `🎉 You got ${result.card.name}!`,
      });

      setShowConfirm(false);

      if (result.updatedUser) {
        localStorage.setItem('user', JSON.stringify(result.updatedUser));
        updateUser(result.updatedUser); // ✅ Update global context so header re-renders
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
              onClick={() => setShowConfirm(true)}
            >
              {isFree ? 'Open' : 'Buy'}
            </Button>
          </div>
        </div>
      </div>

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
                onClick={handleBuyPack}
              >
                {isFree ? 'Open' : 'Buy'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {resultModal && (
        <div className={styles.modalOverlay} onClick={() => setResultModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <img
              src={resultModal.card.imageUrl}
              alt={resultModal.card.name}
              className={styles.modalImage}
            />
            <p className={styles.resultText}>{resultModal.message}</p>
            <div className={styles.modalActions}>
              <Button onClick={() => setResultModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
