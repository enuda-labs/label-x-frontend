import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';
//import * as SplashScreen from 'expo-splash-screen';

const CustomSplashScreen = () => {
  //   useEffect(() => {
  //     const prepare = async () => {
  //       try {
  //         await new Promise(resolve => setTimeout(resolve, 5000));
  //       } catch (e) {
  //         console.warn(e);
  //       } finally {
  //         // Hide splash screen
  //         await SplashScreen.hideAsync();
  //         // Tell the app we're ready
  //         onComplete();
  //       }
  //     };

  //     prepare();
  //   }, [onComplete]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="w-24 h-24 bg-primary rounded-2xl mb-6 items-center justify-center">
        <Text className="text-4xl text-white font-bold">Lx</Text>
      </View>

      <Text className="text-lg text-foreground font-medium my-3 text-center">
        Your go to AI Data Processor
      </Text>
    </View>
  );
};

export default CustomSplashScreen;
