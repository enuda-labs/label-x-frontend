import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => {
  return (
    <View 
      className={cn(
        "rounded-2xl bg-card p-6 shadow-sm border border-border", 
        className
      )}
    >
      {children}
    </View>
  );
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <View className={cn("space-y-1.5", className)}>
      {children}
    </View>
  );
};

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardTitle = ({ children, className }: CardTitleProps) => {
  return (
    <Text className={cn("text-2xl font-semibold tracking-tight text-foreground", className)}>
      {children}
    </Text>
  );
};

type CardDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardDescription = ({ children, className }: CardDescriptionProps) => {
  return (
    <Text className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </Text>
  );
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <View className={cn("pt-6", className)}>
      {children}
    </View>
  );
};

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <View className={cn("flex flex-row items-center pt-6", className)}>
      {children}
    </View>
  );
};
