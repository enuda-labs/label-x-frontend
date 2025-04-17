import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { AxiosClient } from '@/utils/axios';
import { isAxiosError } from 'axios';

type Props = {
  children: React.ReactNode;
};

interface AuthResponse {
  status: string;
  access: string;
  refresh: string;
}

export const AuthGate = ({ children }: Props) => {
  const { setIsLoggedIn, setUser, setRole } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
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
            await storage.setItem(ACCESS_TOKEN_KEY, response.data.access);
            await storage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
            setIsLoggedIn(true);

            const role = await storage.getItem(ROLE);
            const user = await storage.getItem('user');
            setRole(role);
            setUser(user);

            if (role === 'admin') {
              return router.replace('/admin');
            }

            setLoading(false);
            return;
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 401) {
            router.replace('/auth/login');
            return;
          }
        }
      } else {
        router.replace('/onboarding');
      }

      setLoading(false);
    };

    checkAuth();
  }, []);
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }
  return <>{children}</>;
};
