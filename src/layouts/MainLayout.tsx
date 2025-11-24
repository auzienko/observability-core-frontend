import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
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
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                Welcome, {keycloak.tokenParsed?.preferred_username || 'User'}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => keycloak.logout()}
                size="small"
              >
                Logout
              </Button>
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