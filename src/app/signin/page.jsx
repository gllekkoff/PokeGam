'use client';

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import Header from '../components/header';
import styles from './styles/signin.module.css';

export default function SignInPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    // Add your authentication logic here
    setUser({ id: 1, name: 'User' }); // Example
    router.push('/profile');
  };

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        <form onSubmit={handleSignIn} className={styles.form}>
          {/* Your sign-in form fields here */}
        </form>
      </div>
    </div>
  );
}