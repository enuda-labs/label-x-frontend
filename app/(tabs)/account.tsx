import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';

export default function AccountScreen() {
  const router = useRouter();
  const { setIsLoggedIn } = useGlobalStore();

  const handleLogout = async () => {
   
  
    const storage = new MemoryStorage();
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem('user');
    await storage.removeItem(ROLE);
    setIsLoggedIn(false);
    router.replace('/auth/login');
  };
  
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 py-6">
        {/* Header with Logout */}
        <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()}>
  <Ionicons name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Account</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View className="items-center mb-6">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXZhdGFyfGVufDB8fDB8fHww',
            }}
            className="w-20 h-20 rounded-full"
          />
        </View>

        {/* Personal Info */}
        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">PERSONAL INFORMATION</Text>
          {[
            { label: 'Username', value: 'johnxdoe' },
            { label: 'Name', value: 'John Doe' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <Text className="text-sm text-white">{item.label}</Text>
              <Text className="text-sm font-medium text-white">{item.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login Info */}
        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">LOGIN INFORMATION</Text>
          <View className="flex justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-white">Email</Text>
            <Text className="text-sm font-medium text-white">john@example.com</Text>
          </View>
          <TouchableOpacity className="flex-row justify-between items-center py-3">
            <Text className="text-sm text-white">Update password</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

      
      </ScrollView>
    </SafeAreaView>
  );
}
