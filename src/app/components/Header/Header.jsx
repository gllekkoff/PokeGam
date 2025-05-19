'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { Diamond, Info, Package, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../AuthorizationModule/AuthContext';
import { useState } from 'react';
import LogoutConfirmation from '../LogoutConfirmation/LogoutConfirmation';

export const Header = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const showAuthContent = !!user;
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
          
          {showAuthContent && (
            <div className={styles.diamondBox}>
              <Diamond className={`${styles.diamond} w-5 h-5`} />
              <span className={styles.diamondCount}>{user?.diamonds ?? 0}</span>
            </div>
          )}
          
          {showAuthContent ? (
            pathname === '/profile' ? (
              <button className={styles.navButton} onClick={handleLogoutClick}>
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link href="/profile" className={styles.navLink}>
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            )
          ) : (
            <Link href="/signin" className={styles.navLink}>
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmation
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </header>
  );
};

export default Header;