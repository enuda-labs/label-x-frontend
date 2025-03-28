import React from 'react';
import { View, Image, Text } from 'react-native';
import { cn } from '@/lib/cn';

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export const Avatar = ({ 
  src, 
  alt = "Avatar", 
  fallback, 
  size = 'md',
  className,
}: AvatarProps) => {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };
  
  const fallbackTextStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <View className={cn("relative rounded-full overflow-hidden bg-muted", sizeStyles[size], className)}>
      {src ? (
        <Image
          source={{ uri: src }}
          className="w-full h-full object-cover"
          accessibilityLabel={alt}
        />
      ) : (
        <View className="w-full h-full items-center justify-center bg-muted">
          <Text className={cn("font-medium text-muted-foreground", fallbackTextStyles[size])}>
            {fallback || alt.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};
