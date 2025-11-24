// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import keycloak from './app/keycloak.ts';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { CssBaseline } from '@mui/material';

const handleEvent = (event: string, error?: Error) => {
  console.log('Keycloak event:', event, {
    authenticated: keycloak.authenticated,
    token: keycloak.token ? 'present' : 'missing'
  });
  
  if (error) {
    console.error('Keycloak error:', error);
  }
};

const handleTokens = (tokens: any) => {
  console.log('Keycloak tokens updated:', {
    token: tokens.token ? 'received' : 'missing',
    refreshToken: tokens.refreshToken ? 'received' : 'missing'
  });
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ 
        onLoad: 'login-required',
        checkLoginIframe: false // Отключаем iframe проверку (может помочь)
      }}
      onEvent={handleEvent}
      onTokens={handleTokens}
    >
      <Provider store={store}>
        <CssBaseline />
        <App />
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>
);