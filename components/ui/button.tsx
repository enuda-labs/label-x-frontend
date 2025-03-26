import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, Image, View } from 'react-native';
import { cn } from '@/lib/cn';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'google';
  fullWidth?: boolean;
  textClassName?: string;
  icon?: React.ReactNode;
  loading?: boolean
  disabled?: boolean
}

const CustomButton: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  loading = false,
  disabled = false,
  variant = 'primary', 
  fullWidth = true,
  className = '',
  textClassName = '',
  icon,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-white border border-gray-300',
    google: 'bg-primary-google',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-gray-800',
    google: 'text-white',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(`py-4 rounded-lg ${fullWidth ? 'w-full' : ''} ${variantStyles[variant]} ${disabled || loading ? "opacity-70" : ""}`, className,)}
      disabled={disabled || loading}
      {...props}
    >
      {variant === 'google' ? (
        <View className='flex flex-row items-center px-3'>
        <View className='size-8 flex items-center justify-center bg-white rounded-lg py-2 px-5 '>
        <Image source={require('../../assets/images/google.png')} className='size-6 object-contain' />
        </View>
        <Text className={cn(` flex-1 text-center font-medium ${textStyles[variant]} ${textClassName}`)}>
        {title}
      </Text>
    </View>
      ):(
      <Text className={cn(`text-center font-medium ${textStyles[variant]} ${textClassName}`)}>
        {title}
      </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
