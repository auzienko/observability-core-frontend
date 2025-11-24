import React from 'react';
import type { MonitoredServiceResponse } from '../../types/service';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { CheckCircle, Error, Help, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteService } from '../../store/slices/servicesSlice';

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { writeStatus } = useAppSelector((state) => state.services);

  const handleDelete = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await dispatch(deleteService(serviceId)).unwrap();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const handleRowClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const isDeleting = writeStatus === 'loading';

  if (services.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <p>No services found. Create your first service!</p>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Last Check At</TableCell>
            <TableCell align="right">Actions</TableCell>
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
              <TableCell>
                {service.lastCheckedAt
                  ? new Date(service.lastCheckedAt).toLocaleString()
                  : 'N/A'}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service);
                  }}
                  disabled={isDeleting}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={(e) => handleDelete(e, service.id)}
                  disabled={isDeleting}
                >
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