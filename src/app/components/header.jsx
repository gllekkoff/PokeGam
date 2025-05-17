'use client';

import Link from 'next/link';
import styles from './header.module.css';
import { Diamond, Info, Package, ShoppingCart, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          PokéGam
        </Link>
        
        <nav className={styles.nav}>
          <Link href="/packs" className={styles.navLink}>
            <Package className="w-5 h-5" />
            <span>Packs</span>
          </Link>
          
          <Link href="/market" className={styles.navLink}>
            <ShoppingCart className="w-5 h-5" />
            <span>Market</span>
          </Link>
          
          <Link href="/about" className={styles.navLink}>
            <Info className="w-5 h-5" />
            <span>About Us</span>
          </Link>
          
          {user && (
            <div className={styles.diamondBox}>
              <Diamond className={`${styles.diamond} w-5 h-5`} />
              <span className={styles.diamondCount}>{user.diamonds ?? 0}</span>
            </div>
          )}
          
          {user ? (
            <Link href="/profile" className={styles.navLink}>
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          ) : (
            <Link href="/signin" className={styles.navLink}>
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;