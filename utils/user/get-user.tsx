import { useEffect, useState } from 'react';
import { MemoryStorage } from '../storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { AxiosClient } from '@/utils/axios';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';

interface AuthResponse {
  status: string;
  access: string;
  refresh: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { setIsLoggedIn } = useGlobalStore();
  const router = useRouter();

  useEffect(() => {
    const getLoggedInStatus = async () => {
      const storage = new MemoryStorage();
      const token = await storage.getItem(REFRESH_TOKEN_KEY);

      if (token) {
        try {
          const axiosClient = new AxiosClient();
          const response = await axiosClient.post<{ refresh: string }, AuthResponse>(
            '/account/token/refresh/',
            { refresh: token }
          );

          if (response.status === 200) {
            setIsLoggedIn(true);
            storage.setItem(ACCESS_TOKEN_KEY, response.data.access);
            storage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);

            const role = await storage.getItem(ROLE);
            const username = await storage.getItem('user');
            setUserRole(role);
            setUserName(username);

            if (role === 'admin') {
              return router.replace('/admin');
            }
            router.replace('/');
          }
        } catch (error) {
          if (isAxiosError(error)) {
            if (error.response?.status === 401) {
              router.replace('/auth/login');
            }
          }
        }
      }

      setIsLoading(false);
    };

    getLoggedInStatus();
  }, []);

  return { isLoading, userRole, userName };
};
