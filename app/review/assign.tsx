import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '@/constants/env-vars';
import { ReviewTask } from '../../components/types/review-task';

// Define the RawTask type locally
interface RawTask {
  id: number;
  serial_no: string;
  task_type: string;
  data: string;
  ai_output: {
    text: string;
    classification: string;
    confidence: number;
    requires_human_review: boolean;
    human_review: {
      correction: string | null;
      justification: string | null;
    };
  };
  predicted_label: string;
  human_reviewed: boolean;
  final_label: string | null;
  processing_status: string;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  priority: string;
  group: number;
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

const fetchAssignedTasks = async (
  accessToken: string,
  refreshToken: string
): Promise<RawTask[]> => {
  const tasksUrl = `${BASE_API_URL}/tasks/assigned-task`;
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
        return fetchAssignedTasks(newAccessToken, refreshToken);
      } else {
        return [];
      }
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return [];
  }
};

const normalizeTasks = (tasks: RawTask[]): ReviewTask[] => {
  return tasks.map(task => ({
    id: task.id.toString(),
    serial_no: task.serial_no,
    text: task.data,
    ai_classification: task.ai_output.classification,
    confidence: task.ai_output.confidence,
    human_reviewed: task.human_reviewed ? 'Yes' : 'No',
    // Provide a fallback so that final_label is always a string.
    final_label: task.final_label ?? 'None',
    priority: task.priority,
    created_at: task.created_at,
  }));
};

const AssignedTasksScreen = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadAssignedTasks = async () => {
      const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        const fetchedRawTasks = await fetchAssignedTasks(accessToken, refreshToken);
        // Normalize tasks before setting state
        const normalized = normalizeTasks(fetchedRawTasks);
        setTasks(normalized);
      } else {
        redirectToLogin();
      }
      setLoading(false);
    };

    loadAssignedTasks();
  }, []);

  const handleSubmitForReview = (taskId: string) => {
    router.push(`/review/submit?taskId=${taskId}`);
  };

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/review/pending');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={handleBackNavigation} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">
          📝 Assigned Tasks
        </Text>
      </View>

      <ScrollView className="p-4">
        {tasks.map(task => (
          <View key={task.id} className="mb-4 p-4 border border-border rounded-lg bg-card">
            <Text className="mb-1 font-bold text-foreground">ID: {task.id}</Text>
            <Text className="mb-1 text-foreground">Serial No: {task.serial_no}</Text>
            <Text className="mb-1 text-foreground">Text: {task.text}</Text>
            <Text className="mb-1 text-foreground">
              AI Classification: {task.ai_classification}
            </Text>
            <Text className="mb-1 text-foreground">Confidence: {task.confidence}</Text>
            <Text className="mb-1 text-foreground">Human Reviewed: {task.human_reviewed}</Text>
            <Text className="mb-1 text-foreground">Final Label: {task.final_label || 'None'}</Text>
            <Text className="mb-1 text-foreground">Priority: {task.priority}</Text>
            <Text className="mb-1 text-foreground">
              Created At: {new Date(task.created_at).toLocaleString()}
            </Text>
            <TouchableOpacity
              onPress={() => handleSubmitForReview(task.id)}
              style={{ backgroundColor: '#F97316' }}
              className="mt-2 self-start px-3 py-2 rounded"
            >
              <Text className="text-white font-medium">Review</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignedTasksScreen;
