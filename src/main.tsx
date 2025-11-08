import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './app/store.ts';
import keycloak from './app/keycloak.ts';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { CssBaseline } from '@mui/material';

const handleEvent = (event: string, error?: Error) => {
  console.log('Keycloak event:', event);
  if (error) {
    console.error('Keycloak error:', error);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'login-required' }}
      onEvent={handleEvent}
    >
      <Provider store={store}>
        <CssBaseline />
        <App />
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>
);