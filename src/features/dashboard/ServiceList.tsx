import React from 'react';
import type { MonitoredServiceResponse } from '../../types/service';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { CheckCircle, Error, Help } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { deleteService } from './dashboardSlice';
import type { AppDispatch } from '../../app/store';
import { useNavigate } from 'react-router-dom';

interface ServiceListProps {
  services: MonitoredServiceResponse[];
  onEdit: (service: MonitoredServiceResponse) => void;
}

const getStatusChip = (status: MonitoredServiceResponse['status']) => {
  switch (status) {
    case 'UP':
      return <Chip icon={<CheckCircle />} label="UP" color="success" size="small" />;
    case 'DOWN':
      return <Chip icon={<Error />} label="DOWN" color="error" size="small" />;
    default:
      return <Chip icon={<Help />} label="UNKNOWN" color="warning" size="small" />;
  }
};

const ServiceList: React.FC<ServiceListProps> = ({ services, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this service?')) {
      dispatch(deleteService(serviceId));
    }
  };

  const handleRowClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Avg. Response (ms)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((service) => (
            <TableRow
              key={service.id}
              hover
              onClick={() => handleRowClick(service.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{getStatusChip(service.status)}</TableCell>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.healthCheckScenario}</TableCell>
              <TableCell>{service.avgResponseTimeMs ?? 'N/A'}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(service); }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => handleDelete(e, service.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServiceList;
