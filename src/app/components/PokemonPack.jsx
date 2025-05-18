'use client';

import { useState } from 'react';
import { Package, Diamond } from 'lucide-react';
import { Button } from './ui/button';
import styles from './PokemonPack.module.css';

export default function PokemonPack({ pack, onAction }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const isFree = pack.tag === 'Free';

  const handlePackAction = () => {
    if (isFree) {
      onAction(pack);
    }
  };

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
        if (result.message === 'Not enough diamonds') {
          setError('Not enough diamonds');
        } else {
          setError(result.message || 'Something went wrong');
        }
        return;
      }

      if (result.reward === 'duplicate_sold') {
        alert(`💰 You already had ${result.card.name}. Sold for 10 diamonds!`);
      } else {
        alert(`🎉 You got ${result.card.name}!`);
      }

      if (result.updatedUser) {
        localStorage.setItem('user', JSON.stringify(result.updatedUser));
      }

    } catch (err) {
      console.error('❌ Failed to buy pack:', err);
      setError('Failed to buy pack');
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={`${styles.imageContainer} ${isFree ? styles.freeGradient : styles.premiumGradient}`}>
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
              variant={isFree ? "destructive" : "default"}
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
            <p>Are you sure you want to {isFree ? 'open' : 'buy'}:</p>
            <p><strong>{pack.name}</strong></p>
            {!isFree && (
              <p><strong>Price: {pack.price} <Diamond size={16} /></strong></p>
            )}
            {error && (
              <p className={styles.error}>{error}</p>
            )}
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className={!isFree ? styles.buyButton : undefined}
                variant={isFree ? "destructive" : "default"}
                onClick={() => isFree ? onAction(pack) : handleBuyPack()}
              >
                {isFree ? 'Open' : 'Buy'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
