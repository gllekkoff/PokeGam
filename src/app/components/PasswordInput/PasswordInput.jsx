'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import styles from './PasswordInput.module.css';

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder,
  showValidation = false,
  error = '',
  className = '' 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const requirements = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
  };

  const handlePasswordChange = (e) => {
    const noSpaces = e.target.value.replace(/\s/g, '');
    onChange({ ...e, target: { ...e.target, value: noSpaces } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={styles.toggleButton}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      {showValidation && (
        <div className={styles.requirements}>
          {Object.entries({
            'At least 8 characters': requirements.length,
            'One lowercase letter': requirements.lowercase,
            'One uppercase letter': requirements.uppercase,
          }).map(([text, isMet]) => (
            <div key={text} className={`${styles.requirement} ${isMet ? styles.met : ''}`}>
              <Check size={16} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}