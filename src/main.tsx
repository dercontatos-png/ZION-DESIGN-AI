import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import LoginPage from './components/LoginPage.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getCurrentUser } from './utils/userAuth';

function Root() {
  const [pathname, setPathname] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname.toLowerCase();
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isExplicitlyLoggedOut = typeof window !== 'undefined' && (
    sessionStorage.getItem('db_explicitly_logged_out') === 'true' ||
    localStorage.getItem('zion_logged_out') === 'true' ||
    localStorage.getItem('db_explicitly_logged_out') === 'true'
  );

  const isAuthRoute =
    pathname === '/entrar' ||
    pathname === '/login' ||
    pathname === '/cadastre-se' ||
    pathname.startsWith('/entrar') ||
    pathname.startsWith('/login') ||
    (isExplicitlyLoggedOut && !getCurrentUser());

  if (isAuthRoute) {
    return (
      <LoginPage
        onSuccess={() => {
          localStorage.removeItem('zion_logged_out');
          localStorage.removeItem('db_explicitly_logged_out');
          sessionStorage.removeItem('db_explicitly_logged_out');
          window.location.href = '/';
        }}
      />
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Falha ao inicializar o Design Builder">
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
