import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '../../src/App';
import '../../src/styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
