import axios from 'axios';
import keycloak from '../app/keycloak';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (keycloak.authenticated && keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

keycloak.onTokenExpired = () => {
  console.log('Keycloak token expired. Attempting to refresh...');
  keycloak.updateToken(30).then((refreshed) => {
    if (refreshed) {
      console.log('Token refreshed successfully.');
    } else {
      console.warn('Token not refreshed, valid for less than 30 seconds.');
    }
  }).catch(() => {
    console.error('Failed to refresh token.');
  });
};

export default apiClient;