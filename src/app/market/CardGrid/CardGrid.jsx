'use client';

import { Diamond } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './styles/CardGrid.module.css';

export default function CardGrid({ cards, userOwnsCard, onCardSelect }) {
  return (
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
            onClick={() => {
              if (!userOwnsCard(card.name)) {
                onCardSelect(card);
              }
            }}
          />
          <div className={styles.cardInfo}>
            <div className={styles.price}>
              <Diamond size={16} className={styles.priceIcon} />
              <span className={styles.priceValue}>{card.price}</span>
            </div>
            {!userOwnsCard(card.name) && (
              <Button 
                className={styles.buyButton}
                onClick={() => onCardSelect(card)}
              >
                Buy
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}