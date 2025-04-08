import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/cn';
import { useRouter, usePathname } from 'expo-router';

type TabItem = {
  name: string;
  href: string;
  icon: string;
  label: string;
};

type TabBarProps = {
  tabs: TabItem[];
  className?: string;
};

export const TabBar = ({ tabs, className }: TabBarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <View
      className={cn(
        'flex flex-row justify-around items-center bg-background border-t border-border pb-6 pt-2 px-4',
        'glass-effect fixed bottom-0 left-0 right-0 z-50',
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = pathname === tab.href;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handleNavigation(tab.href)}
            className={cn(
              'flex-1 items-center justify-center py-2',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
            activeOpacity={0.7}
          >
            <View className="flex items-center space-y-1">
              {/* This would be the actual icon component */}
              <View
                className={cn(
                  'h-6 w-6 flex items-center justify-center',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Text>{tab.icon}</Text>
              </View>
              <Text
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
