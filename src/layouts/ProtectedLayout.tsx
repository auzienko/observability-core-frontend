// src/layouts/ProtectedLayout.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { Box, CircularProgress, Typography, Button, Alert } from '@mui/material';
import { MainLayout } from './MainLayout';

export const ProtectedLayout: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Initializing authentication...</Typography>
      </Box>
    );
  }

  if (!keycloak.authenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
          You need to be authenticated to access this application.
        </Alert>
        <Button
          variant="contained"
          size="large"
          onClick={() => keycloak.login()}
        >
          Login with Keycloak
        </Button>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};