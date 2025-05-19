'use client';

import { Button } from '../../components/Button/Button';
import styles from './styles/CardModal.module.css';

export default function CardModal({ card, onClose, onBuy }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <img
          src={card.imageUrl}
          alt={card.name}
          className={styles.modalImage}
        />
        <h3 className={styles.modalTitle}>
          Are you sure you want to buy:<br />
          "{card.name}" for {card.price}?
        </h3>

        <div className={styles.modalButtons}>
          <Button
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={styles.confirmButton}
            onClick={() => {
              onBuy(card);
              onClose();
            }}
          >
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}