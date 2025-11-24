import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchServices, clearError } from '../store/slices/servicesSlice';
import { Spinner } from '../components/Spinner/Spinner';
import type { MonitoredServiceResponse } from '../types/service';
import { ServiceFormModal } from '../components/services/ServiceFormModal';
import ServiceList from '../components/services/ServiceList';

const POLLING_INTERVAL = parseInt(
  import.meta.env.VITE_DASHBOARD_POLLING_INTERVAL_MS || '10000',
  10
);

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: services, status, error } = useAppSelector(
    (state) => state.services
  );

  const { keycloak, initialized } = useKeycloak();
  const isAuthenticated = keycloak.authenticated;

  const [modalOpen, setModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<MonitoredServiceResponse | null>(
    null
  );

  const handleOpenCreateModal = () => {
    setServiceToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: MonitoredServiceResponse) => {
    setServiceToEdit(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setServiceToEdit(null);
  };

  // ⭐ ИСПРАВЛЕНИЕ: Всегда загружаем данные при монтировании
  useEffect(() => {
    if (initialized && isAuthenticated) {
      // Загружаем данные при первом рендере или при возврате на страницу
      dispatch(fetchServices());

      // Настройка polling
      const interval = setInterval(() => {
        dispatch(fetchServices());
      }, POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [initialized, isAuthenticated, dispatch]); // ⭐ Убрали зависимость от status

  // Очистка ошибок при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (!initialized) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h5" color="error">
          Authentication failed. Please try again.
        </Typography>
      </Box>
    );
  }

  // Определяем что показать
  let content;
  if (status === 'loading' && services.length === 0) {
    content = <Spinner />;
  } else if (status === 'succeeded' || (status === 'loading' && services.length > 0)) {
    content = <ServiceList services={services} onEdit={handleOpenEditModal} />;
  } else if (status === 'failed') {
    content = (
      <Alert severity="error" onClose={() => dispatch(clearError())}>
        {error || 'Failed to load services'}
      </Alert>
    );
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Services Dashboard</Typography>
        <Button variant="contained" onClick={handleOpenCreateModal}>
          Add Service
        </Button>
      </Box>

      {error && status !== 'failed' && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {content}

      <ServiceFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        serviceToEdit={serviceToEdit}
      />
    </div>
  );
};

export default DashboardPage;