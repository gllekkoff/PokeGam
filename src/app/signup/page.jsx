'use client';

import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Header } from '../components/header';
import { PasswordInput } from '../components/ui/password-input';
import Link from 'next/link';
import styles from './styles/signup.module.css';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords don't match");
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
          <form onSubmit={handleSignUp} className={styles.grayContent}>
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
              placeholder="******"
              required
            />
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button}>
              <UserPlus /> Create Account
            </button>
          </form>
          <p className={styles.switchText}>
            Already have an account? <Link href="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
