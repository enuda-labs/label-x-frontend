import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { cn } from '@/lib/cn';

type ButtonProps = {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
};

export const Button = ({
  variant = 'default',
  size = 'default',
  children,
  onPress,
  isLoading = false,
  disabled = false,
  className = '',
  textClassName = '',
}: ButtonProps) => {
  // Base styles for button
  const baseStyles = "flex items-center justify-center rounded-lg transition-standard active:opacity-80";
  
  // Variant styles
  const variantStyles = {
    default: "bg-primary",
    outline: "border border-primary bg-transparent",
    ghost: "bg-transparent hover:bg-secondary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
  };
  
  // Size styles
  const sizeStyles = {
    default: "px-4 py-4",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-6 py-3 text-lg",
    icon: "w-9 h-9 p-0",
  };
  
  // Text styles
  const textBaseStyles = "font-medium text-center";
  const textVariantStyles = {
    default: "text-white",
    outline: "text-primary",
    ghost: "text-foreground",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive-foreground",
  };
  
  const isDisabled = disabled || isLoading;
  
  return (
    <TouchableOpacity
      onPress={!isDisabled ? onPress : undefined}
      activeOpacity={0.8}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "opacity-70",
        className
      )}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'default' ? "#fff" : "#007AFF"} />
      ) : (
        <Text className={cn(textBaseStyles, textVariantStyles[variant], textClassName)}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
