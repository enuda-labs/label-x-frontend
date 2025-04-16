import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '@/constants/env-vars';

interface ReviewTask {
  id: string;
  serial_no: string;
  text: string;
  ai_classification: string;
  confidence: number;
  human_reviewed: string;
  final_label: string;
  priority: string;
  created_at: string;
}

const storage = new MemoryStorage();

const redirectToLogin = () => {
  Alert.alert('Session Expired', 'Please log in again.');
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const refreshUrl = `${BASE_API_URL}/account/token/refresh/`;
  try {
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!refreshResponse.ok) {
      const errorResponse = await refreshResponse.json();
      console.error('Error refreshing token:', errorResponse);
      redirectToLogin();
      return null;
    }
    const refreshedTokens = await refreshResponse.json();
    return refreshedTokens.access;
  } catch (error) {
    console.error('Refresh token request failed:', error);
    redirectToLogin();
    return null;
  }
};

const fetchReviewTasks = async (accessToken: string, refreshToken: string): Promise<ReviewTask[]> => {
  const tasksUrl = `${BASE_API_URL}/tasks/review-needed/`;
  try {
    const response = await fetch(tasksUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.status === 401) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        return fetchReviewTasks(newAccessToken, refreshToken);
      } else {
        return [];
      }
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching review tasks:', error);
    return [];
  }
};

const assignTaskToMe = async (taskId: string, accessToken: string, refreshToken: string): Promise<boolean> => {
  const assignUrl = `${BASE_API_URL}/tasks/assign-to-me/`;
  try {
    const response = await fetch(assignUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId }),
    });

    if (response.status === 401) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        return assignTaskToMe(taskId, newAccessToken, refreshToken);
      }
    }

    const result = await response.json();
    if (result.status === 'success') {
      Alert.alert('Success', result.message || 'Task assigned to you!');
      return true;
    } else if (response.status === 400 || response.status === 401) {
      // Specifically handle 400 or 401 errors
      Alert.alert('Error', result.message || 'Failed to assign task. Please try again.');
      return false;
    }  
     else {
      Alert.alert('Error', result.message || 'Failed to assign task.');
      return false;
    }
  } catch (error) {
    console.error('Error assigning task:', error);
    Alert.alert('Error', 'An unexpected error occurred while assigning the task.');
    return false;
  }
};

const ReviewNeededTasksScreen = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        const fetchedTasks = await fetchReviewTasks(accessToken, refreshToken);
        setTasks(fetchedTasks);
      } else {
        redirectToLogin();
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  const handleAssign = async (taskId: string) => {
    const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken && refreshToken) {
      const assigned = await assignTaskToMe(taskId, accessToken, refreshToken);
      if (assigned) {
        const updatedTasks = await fetchReviewTasks(accessToken, refreshToken);
        setTasks(updatedTasks);
      }
    } else {
      redirectToLogin();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  const handleBackNavigation = () => {
      router.push('/tasks/history'); 
  
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={handleBackNavigation} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">
          📝 Review Needed Tasks
        </Text>
      </View>

      <ScrollView className="p-4">
        {tasks.map((task) => (
          <View key={task.id} className="mb-4 p-4 border border-border rounded-lg bg-card">
            <Text className="mb-1 font-bold text-foreground">ID: {task.id}</Text>
            <Text className="mb-1 text-foreground">Serial No: {task.serial_no}</Text>
            <Text className="mb-1 text-foreground">Text: {task.text}</Text>
            <Text className="mb-1 text-foreground">AI Classification: {task.ai_classification}</Text>
            <Text className="mb-1 text-foreground">Confidence: {task.confidence}</Text>
            <Text className="mb-1 text-foreground">Human Reviewed: {task.human_reviewed}</Text>
            <Text className="mb-1 text-foreground">Final Label: {task.final_label}</Text>
            <Text className="mb-1 text-foreground">Priority: {task.priority}</Text>
            <Text className="mb-1 text-foreground">Created At: {task.created_at}</Text>
            <TouchableOpacity
              onPress={() => handleAssign(task.id)}
              style={{ backgroundColor: '#F97316' }}
              className="mt-2 self-start px-3 py-2 rounded"
            >
              <Text className="text-white font-medium">Assign to Me</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewNeededTasksScreen;
