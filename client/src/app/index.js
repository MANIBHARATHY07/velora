import React from 'react';
import { createRoot } from 'react-dom/client';
import '../shared/styles/global.css';
import { Providers } from './providers';
import { AppRouter } from './router';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>
);
