import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MemoryStorage } from '@/utils/storage'; 
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'; 

const storage = new MemoryStorage();

const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

interface Task {
  id: string;
  serial_no: string;
  task_type: string; 
}

const refreshAccessToken = async () => {
  const refreshUrl = 'https://label-x-dock.onrender.com/api/v1/account/token/refresh/';
  const refreshResponse = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!refreshResponse.ok) {
    const refreshError = await refreshResponse.json();
    console.error('Error refreshing token:', refreshError);
    redirectToLogin(); 
    return null; 
  }

  const refreshedTokens = await refreshResponse.json();
  return refreshedTokens.access;
};

const fetchTasks = async () => {
  try {
    const tasksUrl = 'https://label-x-dock.onrender.com/api/v1/tasks/my-tasks/';
    const response = await fetch(tasksUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`, 
      },
    });

    if (response.status === 401) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        accessToken = newAccessToken;
        return fetchTasks(); 
      }
    }

    const tasks = await response.json();
    console.log(tasks)
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

const TaskHistoryScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]); 
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    };

    loadTasks();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">Task History</Text>
      </View>

      <ScrollView className="p-4">
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}  
            onPress={() => router.push(`/tasks/${task.id}`)}  
            className="p-4 mb-4 border border-border rounded-lg bg-card flex-row items-center"
          >
            <MaterialCommunityIcons
              name={
                task.task_type === 'TEXT'
                  ? 'file-document'
                  : task.task_type === 'IMAGE'
                  ? 'file-image'
                  : 'file-video'
              }
              size={24}
              color="#F97316"
            />
            <Text className="ml-3 text-lg font-medium text-foreground">{task.serial_no}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};


const redirectToLogin = () => {

  Alert.alert('Session Expired', 'Please log in again.');
};

export default TaskHistoryScreen;
