import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
};

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  className,
  inputClassName,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  return (
    <View className={cn("space-y-2 w-full", className)}>
      {label && (
        <Text className="text-md mb-2 font-semibold text-foreground">
          {label}
        </Text>
      )}

      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isPasswordVisible}
          className={cn(
            "w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground pr-12",
            "focus:border-primary focus:ring-1 focus:ring-primary",
            error && "border-destructive",
            inputClassName
          )}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-xs text-destructive">{error}</Text>
      )}
    </View>
  );
};
