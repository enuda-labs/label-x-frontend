import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

interface AuthResponse {
  status: string;
  access: string;
  refresh: string;
}

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  

  const handleGetStarted = () => {
    router.replace('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

 
  return (
    <View className="flex-1 bg-background justify-center items-center px-6">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateY }],
        }}
        className="w-full items-center"
      >
        <View className="w-24 h-24 bg-primary rounded-2xl mb-6 items-center justify-center">
          <Text className="text-4xl text-white font-bold">Lx</Text>
        </View>

        <Text className="text-3xl text-foreground font-bold mb-2 text-center">
          Your go to AI Data Processor
        </Text>
        <Text className="text-lg text-muted-foreground text-center mb-12">
          Unlock the power of AI-driven data processing with LabelX. Streamline, analyze, and
          optimize with precision.
        </Text>

        <View className="flex-col lg:flex-row items-center justify-center gap-4 w-full max-w-xs">
          <Button onPress={handleGetStarted} className="w-full">
            Get Started
          </Button>

          <Button variant="outline" onPress={handleSignUp} className="w-full">
            Create Account
          </Button>
        </View>

        <Text className="text-xs text-muted-foreground text-center mt-12">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}
