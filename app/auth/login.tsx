import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.replace('/');
    }, 1500);
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

            <Button 
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!username.trim() || !password.trim()}
              className="w-full"
            >
              Sign In
            </Button>

            <View className="flex-row justify-center space-x-1">
              <Text className="text-muted-foreground text-sm">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text className="text-primary ml-2 font-medium">
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
