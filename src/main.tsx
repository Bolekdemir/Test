import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const ConnectTest = lazy(() => import('./lab/ConnectTest'));

function isConnectTest() {
  return location.hash.startsWith('#/connect');
}

function Root() {
  const [lab, setLab] = useState(isConnectTest);
  useEffect(() => {
    const onHash = () => setLab(isConnectTest());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (!lab) return <App />;
  return (
    <Suspense fallback={null}>
      <ConnectTest />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
