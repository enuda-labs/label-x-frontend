import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { AxiosClient } from '@/utils/axios';
import { isAxiosError } from 'axios';
import CustomSplashScreen from '../ui/custom-splash-screen';
import { UserData } from '@/app/auth/login';

type Props = {
  children: React.ReactNode;
};

export const AuthGate = ({ children }: Props) => {
  const { setIsLoggedIn, setUser, setRole } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storage = new MemoryStorage();
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        router.replace('/onboarding');
        setLoading(false);
        return;
      }

      // Set logged in state and fetch user details
      setIsLoggedIn(true);
      
      try {
        const axiosClient = new AxiosClient();
        const userResponse = await axiosClient.get<{ status: string; user: UserData }>(
          '/account/user/detail/'
        );
        
        if (userResponse.status === 200) {
          const userData = userResponse.data.user;
          await storage.setItem('user', JSON.stringify(userData));
          setUser(userData.username);

          if (userData.is_admin) {
            await storage.setItem(ROLE, 'admin');
            setRole('admin');
            router.replace('/admin');
          } else if (userData.is_reviewer) {
            await storage.setItem(ROLE, 'reviewer');
            setRole('reviewer');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        if (isAxiosError(error) && error.response?.status === 401) {
          // Let AxiosClient handle the token refresh
          router.replace('/auth/login');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <CustomSplashScreen />;
  }
  
  return <>{children}</>;
};
