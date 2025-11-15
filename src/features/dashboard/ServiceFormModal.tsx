import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { createService, fetchServices, updateService } from './dashboardSlice';
import type { MonitoredServiceResponse } from '../../types/service';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper',
  boxShadow: 24, p: 4,
};

interface Props {
  open: boolean;
  onClose: () => void;
  serviceToEdit?: MonitoredServiceResponse | null;
}

export const ServiceFormModal: React.FC<Props> = ({ open, onClose, serviceToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { writeStatus } = useSelector((state: RootState) => state.dashboard);

  const [name, setName] = useState('');
  const [healthCheckScenario, setHealthCheckScenario] = useState('');
  const [interval, setInterval] = useState(30);

  const isEditing = !!serviceToEdit;

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setHealthCheckScenario(serviceToEdit.healthCheckScenario || '');
    } else {
      setName('');
      setHealthCheckScenario('{\n  "name": "Default Health Check",\n  "runs": 1,\n  "virtualUsers": 1,\n  "steps": [\n    {\n      "name": "Check Endpoint",\n      "request": {\n        "method": "GET",\n        "url": "http://example.com/actuator/health"\n      }\n    }\n  ]\n}');
      setInterval(30);
    }
  }, [serviceToEdit, open]);

  const handleSubmit = async () => {
    const serviceData = { name, healthCheckScenario, pollingIntervalSeconds: interval };
    if (isEditing && serviceToEdit) {
      await dispatch(updateService({ id: serviceToEdit.id, data: serviceData }));
    } else {
      await dispatch(createService(serviceData));
    }
    // После успешной операции перезагружаем список
    dispatch(fetchServices());
    onClose();
  };

  const toPrettyJson = (s: string) => {
    if (s === null || s.trim() === "") {
      return "{}";
    }
    const obj = JSON.parse(s);
    return JSON.stringify(obj, null, 2);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">{isEditing ? 'Edit Service' : 'Register New Service'}</Typography>
        <TextField margin="normal" fullWidth label="Service Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField margin="normal" fullWidth multiline rows={10} label="Health Check Scenario (JSON)" value={ toPrettyJson(healthCheckScenario) } onChange={(e) => setHealthCheckScenario(e.target.value)} />
        <Box mt={2} display="flex" alignItems="center">
          <Button variant="contained" onClick={handleSubmit} disabled={writeStatus === 'loading'}>
            {writeStatus === 'loading' ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Save')}
          </Button>
          <Button onClick={onClose} sx={{ ml: 1 }}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
};