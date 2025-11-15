import { useParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import {Box, Typography } from '@mui/material';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
  }, [id]);

  return (
    <div>
      <Typography variant="h4">Service Details: {id}</Typography>

      <Box my={4}>
        <Typography variant="h5">Performance History</Typography>
        {/* <PerformanceChart data={...} /> */}
      </Box>

      <Box my={4}>
        <Typography variant="h5">Run Load Test</Typography>
        {/* <LoadTestRunner serviceId={id!} /> */}
      </Box>
    </div>
  );
};

export default ServiceDetailPage;