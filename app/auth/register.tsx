import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { register } from '@/services/apis/auth';

export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
}

export interface RegisterResponse {
  status: 'success' | 'error';
  user_data: UserData;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (!name || !password || !email) {
        return setErrorMessage('Please input all fields');
      }
      setIsLoading(true);
      setErrorMessage('');
      await register({
        username: name,
        email,
        password,
      });
      router.replace(`/auth/login?username=${name}`);
    } catch (error: any) {
      console.log(error.response?.data);
      if (isAxiosError(error)) {
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

          <View className="animate-fade-in flex-col gap-y-6 w-full max-w-sm mx-auto ">
            <View className="flex-col gap-y-2 text-center">
              <Text className="text-3xl font-bold tracking-tight text-foreground">
                Create an account
              </Text>
              <Text className="text-muted-foreground text-sm">
                Enter your information to get started with Labelx
              </Text>
            </View>

            <View className="flex-col gap-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Text className="text-red-500">{errorMessage}</Text>

            <Button
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={!name || !email || !password}
              className="w-full"
            >
              Create Account
            </Button>

            <View className="flex-row justify-center space-x-1">
              <Text className="text-muted-foreground text-sm">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-primary font-semibold ml-2">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
