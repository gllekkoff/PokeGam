'use client';

import styles from './PokemonCard.module.css';
import { Star } from 'lucide-react';

export default function PokemonCard({ card, onToggleStar }) {
  return (
    <div className={styles.cardWrapper}>
      <img src={card.imageUrl} alt={card.name} className={styles.image} />
      <div className={styles.footer}>
        <div className={styles.info}>
          <strong>{card.name}</strong>
          <p>Card #{card.id}</p>
        </div>
        <button 
          className={`${styles.favoriteButton} ${card.isStarred ? styles.starred : ''}`}
          onClick={() => onToggleStar(card.id)}
        >
          <Star size={20} fill={card.isStarred ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
