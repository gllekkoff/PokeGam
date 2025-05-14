'use client';

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '../components/header';
import styles from './styles/profile.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        {/* Profile content here */}
      </div>
    </div>
  );
}