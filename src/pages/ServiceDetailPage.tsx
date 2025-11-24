import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchServiceById,
  fetchHealthHistory,
  clearCurrentService,
  clearHealthHistory,
} from '../store/slices/servicesSlice';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Получаем данные из Redux
  const {
    currentService,
    healthHistory,
    status,
    error,
    healthHistoryLoading,
    healthHistoryError,
  } = useAppSelector((state) => state.services);

  // Локальное состояние для фильтров
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Загружаем сервис и историю при монтировании
  useEffect(() => {
    if (id) {
      dispatch(fetchServiceById(id));
      dispatch(fetchHealthHistory({ 
        id, 
        startDate: startDate || undefined, 
        endDate: endDate || undefined 
      }));
    }

    return () => {
      dispatch(clearCurrentService());
      dispatch(clearHealthHistory());
    };
  }, [id, dispatch]);

  // Перезагружаем историю при изменении дат
  useEffect(() => {
    if (id && (startDate || endDate)) {
      dispatch(
        fetchHealthHistory({
          id,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
      );
    }
  }, [id, startDate, endDate, dispatch]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPpp');
  };

  // Данные для графика
  const chartData = healthHistory.map((item) => ({
    timestamp: format(new Date(item.timestamp), 'MM/dd HH:mm'),
    status: item.status === 'UP' ? 1 : 0,
    fullDate: item.timestamp,
  }));

  // Показываем загрузку
  if (status === 'loading' && !currentService) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Показываем ошибку
  if (error || (!currentService && status === 'failed')) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Service not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentService) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        {/* Header с кнопкой назад */}
        <Box mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" gutterBottom>
            {currentService.name}
          </Typography>
        </Box>

        {/* Информация о сервисе */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Service Information
          </Typography>
          <Box mt={2}>
            <Typography variant="body1">
              <strong>Status:</strong>{' '}
              <Box
                component="span"
                sx={{
                  color: currentService.status === 'UP' ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                }}
              >
                {currentService.status}
              </Box>
            </Typography>
            <Typography variant="body1">
              <strong>Polling Interval:</strong> {currentService.pollingIntervalSeconds}s
            </Typography>
            <Typography variant="body1">
              <strong>Last Checked:</strong>{' '}
              {currentService.lastCheckedAt
                ? new Date(currentService.lastCheckedAt).toLocaleString()
                : 'N/A'}
            </Typography>
          </Box>
        </Paper>

        {/* Фильтры дат */}
        <Box mb={4} display="flex" gap={2} alignItems="center">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
        </Box>

        {/* Ошибка загрузки истории */}
        {healthHistoryError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {healthHistoryError}
          </Alert>
        )}

        {/* ГРАФИК */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Health Check Status
          </Typography>
          
          {healthHistoryLoading ? (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : chartData.length === 0 ? (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No health check data available for the selected period
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart 
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 11 }}
                    height={40}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tickFormatter={(value) => (value === 1 ? 'UP' : 'DOWN')}
                    tick={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      value === 1 ? 'UP' : 'DOWN',
                      'Status',
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      padding: '8px',
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="status"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Paper>

        {/* ТАБЛИЦА */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Health Check History
          </Typography>
          {healthHistoryLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : healthHistory.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                No health check history available
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthHistory.map((check, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatDate(check.timestamp)}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            color:
                              check.status === 'UP' ? 'success.main' : 'error.main',
                            fontWeight: 'bold',
                          }}
                        >
                          {check.status}
                        </Box>
                      </TableCell>
                      <TableCell>{check.message || 'OK'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ServiceDetailPage;