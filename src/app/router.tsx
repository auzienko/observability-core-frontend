import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import ServiceDetailPage from '../pages/ServiceDetailPage';
import { ProtectedLayout } from '../layouts/ProtectedLayout';

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/services/:id',
        element: <ServiceDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>404 Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    ),
  },
]);