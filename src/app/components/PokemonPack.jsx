'use client';

import { useState } from 'react';
import styles from '../packs/styles/packs.module.css';
import { Diamond } from 'lucide-react';

export default function PokemonPack({ pack, onPurchase }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in.');
      return;
    }

    try {
      const endpoint =
        pack.tag === 'Market'
          ? 'http://localhost:8000/api/user/buy-pack'
          : 'http://localhost:8000/api/user/open-pack';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packId: pack.id })
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.message === 'Not enough diamonds') {
          setError('You don’t have enough Diamonds');
        } else {
          alert(result.message || 'Something went wrong.');
        }
        return;
      }

      alert(`🎉 You got ${result.card.name}!`);
      if (onPurchase) onPurchase(result.updatedUser); // 💎 notify parent
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <>
      <div className={styles.pack}>
        <div className={styles.packImage}>
          <img src={pack.image} alt={pack.name} className={styles.packIcon} />
        </div>
        <div className={styles.packContent}>
          <h2 className={styles.packTitle}>{pack.name}</h2>
          <div className={styles.packFooter}>
            {pack.tag === 'Market' ? (
              <div className={styles.priceSection}>
                <Diamond className={styles.diamondIcon} />
                <span className={styles.packPrice}>{pack.price}</span>
              </div>
            ) : (
              <span className={styles.freeTag}>{pack.tag ?? 'Free'}</span>
            )}
            <button
              className={styles.openButton}
              onClick={() => {
                if (pack.tag === 'Market') {
                  setShowConfirm(true);
                  setError('');
                } else {
                  handleOpen();
                }
              }}
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>
              Are you sure you want to buy:
              <br />
              <strong>“{pack.name}”</strong> for <strong>{pack.price}</strong>?
            </p>

            {error ? (
              <div className={styles.error}>{error}</div>
            ) : (
              <div className={styles.modalActions}>
                <button className={styles.noButton} onClick={() => setShowConfirm(false)}>
                  No
                </button>
                <button className={styles.yesButton} onClick={handleOpen}>
                  Yes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
