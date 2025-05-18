'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthorizationModule/AuthContext';
import PasswordInput from '../components/PasswordInput/PasswordInput';
import { Header } from '../components/Header/Header';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button/Button';
import Link from 'next/link';
import styles from './styles/signup.module.css';

const validatePassword = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    nonSpace: /\S/.test(password),
  };

  return {
    isValid: Object.values(requirements).every(Boolean),
    requirements
  };
};

export default function SignUpPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConfirmPasswordError('');

    if (!username.trim()) {
      setError('Username cannot be empty or contain only spaces');
      return;
    }

    const { isValid, requirements } = validatePassword(password);
    if (!isValid) {
      setError('Password must meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.graySection}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create Account</h2>
          <form onSubmit={handleSubmit} className={styles.grayContent}>
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
            
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              showValidation={true}
            />
            
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
              }}
              placeholder="Confirm password"
              error={confirmPasswordError}
            />
            
            {error && (
              <p className={styles.error}>
                <AlertCircle size={16} />
                {error}
              </p>
            )}
            
            <Button variant="default" type="submit" className={styles.button} size="lg">
              <UserPlus /> Create Account
            </Button>
          </form>
          <p className={styles.switchText}>
            Already have an account? <Link href="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
