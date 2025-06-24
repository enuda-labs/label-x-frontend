import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AxiosClient } from '@/utils/axios';
import { isAxiosError } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <View className="flex-1 justify-center items-center">
          <Text>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-10">
        <Text className="text-white font-semibold text-2xl">Projects</Text>
        <TouchableOpacity
          onPress={() => router.push('/tasks/new')}
          className="bg-orange-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Switch to User</Text>
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
