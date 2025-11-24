import axios from 'axios';
import keycloak from '../app/keycloak';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция ожидания готовности Keycloak
const waitForKeycloak = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Проверяем, может Keycloak уже инициализирован
    if (keycloak.authenticated !== undefined) {
      console.log('Keycloak already initialized');
      resolve();
      return;
    }

    // Если нет - ждем события onReady
    let timeoutId: number;
    
    const onReadyHandler = () => {
      clearTimeout(timeoutId);
      console.log('Keycloak initialized via onReady');
      resolve();
    };

    // Устанавливаем обработчик
    const originalOnReady = keycloak.onReady;
    keycloak.onReady = () => {
      if (originalOnReady) originalOnReady();
      onReadyHandler();
    };

    // Таймаут на случай если что-то пошло не так
    timeoutId = window.setTimeout(() => {
      console.error('Keycloak initialization timeout');
      reject(new Error('Keycloak initialization timeout'));
    }, 10000); // 10 секунд
  });
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Ждем инициализации Keycloak
      await waitForKeycloak();

      // Проверяем, авторизован ли пользователь
      if (!keycloak.authenticated) {
        console.warn('User not authenticated, redirecting to login');
        keycloak.login();
        return Promise.reject(new Error('Not authenticated'));
      }

      // Проверяем истек ли токен (обновляем если осталось меньше 5 секунд)
      if (keycloak.isTokenExpired(5)) {
        console.log('Token expired or expiring soon, refreshing...');
        try {
          const refreshed = await keycloak.updateToken(30);
          if (refreshed) {
            console.log('Token refreshed successfully');
          } else {
            console.log('Token still valid');
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          keycloak.login();
          return Promise.reject(new Error('Token refresh failed'));
        }
      }

      // Добавляем токен к запросу
      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ответов с ошибками авторизации
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      console.error('Unauthorized (401) - redirecting to login');
      keycloak.login();
    } else if (status === 403) {
      console.error('Forbidden (403) - insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

// Автоматическое обновление токена при истечении
keycloak.onTokenExpired = () => {
  console.log('Token expired event triggered');
  keycloak
    .updateToken(30)
    .then((refreshed) => {
      if (refreshed) {
        console.log('Token refreshed successfully');
      } else {
        console.log('Token still valid for more than 30 seconds');
      }
    })
    .catch((error) => {
      console.error('Failed to refresh token:', error);
      keycloak.login();
    });
};

export default apiClient;