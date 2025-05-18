import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from './components/AuthorizationModule/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}