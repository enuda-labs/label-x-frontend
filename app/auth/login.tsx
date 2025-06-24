import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { login } from '@/services/apis/auth';

export interface LoginBody {
  username: string;
  password: string;
  otp_code?: string; // allow optional OTP for 2FA flows
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  is_reviewer: boolean;
  is_admin: boolean;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user_data: UserData;
}

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const { setIsLoggedIn } = useGlobalStore();
  const [username, setUsername] = useState((params?.username as string) || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [show2fa, setShow2fa] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    setErrorMessage('');
  }, [verificationCode, username, password]);

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        return setErrorMessage('Please input username and password');
      }
      setIsLoading(true);
      setErrorMessage('');
      const storage = new MemoryStorage();
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      const body: LoginBody = {
        username,
        password,
      };
      if (show2fa) {
        body.otp_code = verificationCode;
      }
      const data = await login(body);
      await storage.setItem(ACCESS_TOKEN_KEY, data.access);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refresh);
      await storage.setItem('user', JSON.stringify(data.user_data));
      setIsLoggedIn(true);
      if (data.user_data.is_admin) {
        router.replace('/(tabs)');
        storage.setItem(ROLE, 'admin');
        return;
      } else if (data.user_data.is_reviewer) {
        storage.setItem(ROLE, 'reviewer');
      }
      router.replace('/');
    } catch (error: any) {
      // console.log(error.response?.data);
      if (isAxiosError(error)) {
        if (error.response?.status === 401 && error.response?.data?.data?.requires_2fa) {
          setShow2fa(true);
          return;
        }
        setErrorMessage(error.response?.data?.error || 'Unexpected error occurred');
      } else {
        setErrorMessage(error.message || 'Unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-4 z-10">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="animate-fade-in flex-col gap-y-6 w-full max-w-sm mx-auto">
            <View className="space-y-2 text-center">
              <Text className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back
              </Text>
              <Text className="text-muted-foreground text-sm">
                Sign in to your account to continue
              </Text>
            </View>

            <View className="flex-col gap-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View className="flex items-end">
                <TouchableOpacity onPress={() => router.push('/')}>
                  <Text className="text-sm text-primary">Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {show2fa && (
              <View>
                <Text className="mb-4 text-white">Input the code from your Authenticator app</Text>
                <View className="flex justify-center mb-10">
                  <Input
                    placeholder="Enter 6 digits code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
            <Text className="text-red-500">{errorMessage}</Text>

            <Button
              onPress={handleLogin}
              isLoading={isLoading}
              //disabled={username === '' || password === ''}
              className="w-full"
            >
              Sign In
            </Button>

            <View className="flex-row justify-center space-x-1">
              <Text className="text-muted-foreground text-sm">Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text className="text-primary ml-2 font-medium">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
