import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createService,
  updateService,
  resetWriteStatus,
} from '../../store/slices/servicesSlice';
import type { MonitoredServiceResponse } from '../../types/service';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
};

const DEFAULT_HEALTH_CHECK_SCENARIO = `{
  "name": "Default Health Check",
  "runs": 1,
  "virtualUsers": 1,
  "steps": [
    {
      "name": "Check Endpoint",
      "request": {
        "method": "GET",
        "url": "http://example.com/actuator/health"
      }
    }
  ]
}`;

interface Props {
  open: boolean;
  onClose: () => void;
  serviceToEdit?: MonitoredServiceResponse | null;
}

export const ServiceFormModal: React.FC<Props> = ({
  open,
  onClose,
  serviceToEdit,
}) => {
  const dispatch = useAppDispatch();
  const { writeStatus, writeError } = useAppSelector((state) => state.services);

  const [name, setName] = useState('');
  const [healthCheckScenario, setHealthCheckScenario] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isEditing = !!serviceToEdit;

  // Инициализация формы при открытии
  useEffect(() => {
    if (open) {
      if (serviceToEdit) {
        // Режим редактирования
        setName(serviceToEdit.name);
        setHealthCheckScenario(
          toPrettyJson(serviceToEdit.healthCheckScenario || '{}')
        );
      } else {
        // Режим создания
        setName('');
        setHealthCheckScenario(toPrettyJson(DEFAULT_HEALTH_CHECK_SCENARIO));
      }
      setJsonError(null);
    }
  }, [serviceToEdit, open]);

  // Сброс writeStatus при открытии модалки
  useEffect(() => {
    if (open) {
      dispatch(resetWriteStatus());
    }
  }, [open, dispatch]);

  // Автозакрытие после успешного сохранения
  useEffect(() => {
    if (writeStatus === 'succeeded' && open) {
      // Небольшая задержка для показа успеха
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [writeStatus, open, onClose]);

  const toPrettyJson = (s: string): string => {
    if (!s || s.trim() === '') {
      return '{}';
    }
    try {
      const obj = JSON.parse(s);
      return JSON.stringify(obj, null, 2);
    } catch {
      return s; // Возвращаем как есть, если не валидный JSON
    }
  };

  const validateJson = (value: string): boolean => {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (e) {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  const handleHealthCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHealthCheckScenario(value);
    if (value.trim()) {
      validateJson(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация JSON перед отправкой
    if (!validateJson(healthCheckScenario)) {
      return;
    }

    const serviceData = {
      name,
      healthCheckScenario: healthCheckScenario.trim(),
      pollingIntervalSeconds: interval,
    };

    try {
      if (isEditing && serviceToEdit) {
        await dispatch(
          updateService({ id: serviceToEdit.id, data: serviceData })
        ).unwrap();
      } else {
        await dispatch(createService(serviceData)).unwrap();
      }
      // При успехе модалка закроется автоматически через useEffect
    } catch (error) {
      // Ошибка уже в writeError, показывается в Alert
      console.error('Failed to save service:', error);
    }
  };

  const handleClose = () => {
    if (writeStatus !== 'loading') {
      onClose();
    }
  };

  const isLoading = writeStatus === 'loading';
  const isSuccess = writeStatus === 'succeeded';

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {isEditing ? 'Edit Service' : 'Register New Service'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Service Name */}
          <TextField
            margin="normal"
            fullWidth
            label="Service Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || isSuccess}
            required
          />

          {/* Health Check Scenario */}
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={12}
            label="Health Check Scenario (JSON)"
            value={healthCheckScenario}
            onChange={handleHealthCheckChange}
            disabled={isLoading || isSuccess}
            required
            error={!!jsonError}
            helperText={jsonError}
          />

          {/* Error Alert */}
          {writeError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {writeError}
            </Alert>
          )}

          {/* Success Alert */}
          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Service {isEditing ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          {/* Buttons */}
          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || isSuccess || !!jsonError}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : isSuccess ? (
                'Saved!'
              ) : isEditing ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};