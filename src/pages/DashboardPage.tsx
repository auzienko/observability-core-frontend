import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useKeycloak } from '@react-keycloak/web';
import type { AppDispatch, RootState } from '../app/store';
import { fetchServices } from '../features/dashboard/dashboardSlice';
import ServiceList from '../features/dashboard/ServiceList';
import { Spinner } from '../components/Spinner/Spinner';
import { Button, Box, Typography } from '@mui/material';
import { ServiceFormModal } from '../features/dashboard/ServiceFormModal';
import type { MonitoredServiceResponse } from '../types/service';

const POLLING_INTERVAL = parseInt(import.meta.env.VITE_DASHBOARD_POLLING_INTERVAL_MS || '10000', 10);

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { services, status, error } = useSelector((state: RootState) => state.dashboard);

  const { keycloak, initialized } = useKeycloak();
  const isAuthenticated = keycloak.authenticated;

  const [modalOpen, setModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<MonitoredServiceResponse | null>(null);

  const handleOpenCreateModal = () => {
    setServiceToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: MonitoredServiceResponse) => {
    setServiceToEdit(service);
    setModalOpen(true);
  };

  useEffect(() => {
    if (initialized && isAuthenticated) {
      if (status === 'idle') {
        dispatch(fetchServices());
      }

      const interval = setInterval(() => {
        dispatch(fetchServices());
      }, POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [initialized, isAuthenticated, status, dispatch]);

  if (!initialized) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <div>Authentication failed. Please try again.</div>
  }

  let content;
  if (status === 'loading' && services.length === 0) {
    content = <Spinner />;
  } else if (status === 'succeeded' || (status === 'loading' && services.length > 0)) {
    content = <ServiceList services={services} onEdit={handleOpenEditModal} />;
  } else if (status === 'failed') {
    content = <div>{error}</div>;
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Services Dashboard</Typography>
        <Button variant="contained" onClick={handleOpenCreateModal}>Add Service</Button>
      </Box>
      {content = <ServiceList services={services} onEdit={handleOpenEditModal} />}
      <ServiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} serviceToEdit={serviceToEdit} />
    </div>
  );
};

export default DashboardPage;