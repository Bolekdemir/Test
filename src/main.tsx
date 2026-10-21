import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const ConnectTest = lazy(() => import('./lab/ConnectTest'));
const PhoneApp = lazy(() => import('./phone/PhoneApp'));

type Route = 'app' | 'connect' | 'join';

function route(): Route {
  if (location.hash.startsWith('#/connect')) return 'connect';
  if (location.hash.startsWith('#/join')) return 'join';
  return 'app';
}

function Root() {
  const [r, setR] = useState(route);
  useEffect(() => {
    const onHash = () => setR(route());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (r === 'app') return <App />;
  return <Suspense fallback={null}>{r === 'join' ? <PhoneApp /> : <ConnectTest />}</Suspense>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
