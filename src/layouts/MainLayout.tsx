import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { keycloak } = useKeycloak();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Observability Dashboard
          </Typography>
          {keycloak.authenticated && (
            <Box>
              <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                Welcome, {keycloak.tokenParsed?.preferred_username}
              </Typography>
              <button onClick={() => keycloak.logout()}>Logout</button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 2, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
};