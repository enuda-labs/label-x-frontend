import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AxiosClient } from '@/utils/axios';
import { isAxiosError } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { Ionicons } from '@expo/vector-icons';

interface ProjectResponse {
  status: string;
  projects: Project[];
}

type Project = {
  id: string;
  name: string;
};

const Admin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setIsLoggedIn } = useGlobalStore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const axiosClient = new AxiosClient();
        const response = await axiosClient.get<ProjectResponse>('/account/projects/list/');
        setProjects(response.data.projects);
      } catch (err) {
        setError('Failed to load projects.');
        if (isAxiosError(err)) {
          console.log(err.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = async () => {
    const storage = new MemoryStorage();
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem('user');
    await storage.removeItem(ROLE);
    setIsLoggedIn(false);
    router.replace('/auth/login');
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-10">
        <Text className="text-white font-semibold text-2xl"> All Projects</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {loading && (
        <View className="flex-1 bg-background justify-center items-center px-6">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      )}
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/projects/${item.id}?name=${encodeURIComponent(item.name)}`)
            }
            className="p-4 mb-4 border border-gray-300 rounded-lg"
          >
            <Text className="text-lg font-bold text-white">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Admin;
