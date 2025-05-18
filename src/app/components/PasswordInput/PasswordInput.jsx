'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.css';

export function PasswordInput({ value, onChange, placeholder, required }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.passwordWrapper}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={styles.input}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={styles.eyeButton}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}