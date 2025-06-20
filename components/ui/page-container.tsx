import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  step?: number;
  scrollable?: boolean;
  totalSteps?: number;
}

const PageContainer = ({ children, scrollable = true }: PageContainerProps) => {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      {scrollable ? (
        <ScrollView
          className="flex-1 px-4 bg-background"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 bg-background">{children}</View>
      )}
    </SafeAreaView>
  );
};

export default PageContainer;
