'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthorizationModule/AuthContext';
import { Header } from '../components/Header/Header';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import Link from 'next/link';
import styles from './styles/signin.module.css';
import { LogIn } from 'lucide-react';
import { Button } from '../components/Button/Button';
export default function SignInPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.graySection}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sign In</h2>
          <form onSubmit={handleSignIn} className={styles.grayContent}>
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
              placeholder="******"
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button variant="default" type="submit" className={styles.button} size="lg">
              <LogIn /> Sign In
            </Button>
          </form>
          <p className={styles.switchText}>
            Don't have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
