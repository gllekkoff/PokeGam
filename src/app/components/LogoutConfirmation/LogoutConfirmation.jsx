'use client';

import { LogOut } from 'lucide-react';
import styles from './LogoutConfirmation.module.css';

export default function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <LogOut size={48} className={styles.icon} />
        <h2>Sign Out</h2>
        <p>Are you sure you want to sign out?</p>
        <div className={styles.buttons}>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={onConfirm}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}