import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Box, CircularProgress, Typography, Button, Alert } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  // Показываем загрузку пока Keycloak инициализируется
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

  // Если не авторизован - показываем кнопку логина
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
        <Alert severity="error" sx={{ mb: 2 }}>
          You need to login to access this page.
        </Alert>
        <Button
          variant="contained"
          size="large"
          onClick={() => keycloak.login()}
        >
          Login
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};