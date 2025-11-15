import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import ServiceDetailPage from '../pages/ServiceDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/services/*',
    element: <ServiceDetailPage />,
  },
]);
