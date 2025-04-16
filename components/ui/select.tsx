import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type CustomSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  error?: string;
};

const CustomSelect = ({ value, onValueChange, options, placeholder, error }: CustomSelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row justify-between items-center border rounded-md"
        style={{
          borderColor: error ? '#ef4444' : '#e2e8f0',
          padding: 12,
        }}
      >
        <Text style={{ color: value ? '#fff' : '#9ca3af' }}>
          {value ? options.find(option => option.value === value)?.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={24} color="#888" />
      </Pressable>

      {open && (
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#e2e8f0',
            borderRadius: 8,
            zIndex: 10,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {options.map(option => (
            <Pressable
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
              style={{
                padding: 12,
                borderBottomWidth: option.value !== options[options.length - 1].value ? 1 : 0,
                borderBottomColor: '#e2e8f0',
              }}
            >
              <Text>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {error && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
};

export default CustomSelect;
