import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

interface AvatarProps {
  user: {
    name: string;
    profilePicture?: string;
  };
  onImageChange?: (uri: string) => void;
  size?: number;
}

export default function ProfileAvatar({ user, onImageChange, size = 80 }: AvatarProps) {
  const [image, setImage] = useState<string | null>(user.profilePicture || null);

  // Get the first letter of the user's name
  const getInitial = () => {
    return user.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  // Generate a background color based on the user's name
  const getBackgroundColor = () => {
    const colors = [
      '#F97316', // primary
      '#FB923C', // Lighter orange
      '#3B82F6', // Blue (complementary)
      '#60A5FA', // Light blue
      '#8B5CF6', // Purple
      '#A855F7', // Light purple
      '#EC4899', // Pink
      '#F43F5E', // Rose
      '#10B981', // Emerald
      '#34D399', // Green
      '#A3E635', // Lime
      '#FBBF24', // Amber
      '#F59E0B', // Yellow
      '#6366F1', // Indigo
      '#475569', // Slate (more neutral)
    ];
    if (!user.name) return colors[0];

    let hash = 0;
    for (let i = 0; i < user.name.length; i++) {
      hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need permission to access your photos to set a profile picture.'
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);

      if (onImageChange) {
        onImageChange(uri);
      }
    }
  };

  return (
    <View className="items-center mb-6">
      <View className="relative">
        {image ? (
          <Image
            source={{ uri: image }}
            className={`rounded-full`}
            style={{ width: size, height: size }}
          />
        ) : (
          <View
            className={`rounded-full justify-center items-center`}
            style={{
              width: size,
              height: size,
              backgroundColor: getBackgroundColor(),
            }}
          >
            <Text className="text-white font-bold" style={{ fontSize: size / 2 }}>
              {getInitial()}
            </Text>
          </View>
        )}

        {/* Camera Icon */}
        <TouchableOpacity
          className="absolute bottom-0 right-0 bg-primary p-1 rounded-full border-2 border-white"
          style={{ width: size / 3, height: size / 3 }}
          onPress={pickImage}
        >
          <MaterialIcons name="camera-alt" size={size / 5} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
