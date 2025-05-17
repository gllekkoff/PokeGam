'use client';

import styles from './PokemonCard.module.css';

export default function PokemonCard({ card }) {
  return (
    <div className={styles.card}>
      <img src={card.imageUrl} alt={card.name} className={styles.image} />
      <div className={styles.info}>
        <strong>{card.name}</strong>
        <p>Card #{card.id}</p>
      </div>
    </div>
  );
}
