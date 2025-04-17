import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '@/constants/env-vars';
import { ReviewTask } from '../../components/types/review-task';

const storage = new MemoryStorage();

const redirectToLogin = () => {
  Alert.alert('Session Expired', 'Please log in again.');
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const res = await fetch(`${BASE_API_URL}/account/token/refresh/`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to refresh token:', error);
      redirectToLogin();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access;

    await storage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    redirectToLogin();
    return null;
  }
};

const fetchPendingReviews = async (
  accessToken: string,
  refreshToken: string
): Promise<ReviewTask[]> => {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks/my-pending-reviews/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        return fetchPendingReviews(newAccessToken, refreshToken);
      } else {
        throw new Error('Unauthorized');
      }
    }

    const tasks = await res.json();

    return tasks.map((task: any) => ({
      id: task.id.toString(),
      serial_no: task.serial_no,
      text: task.data,
      ai_classification: task.ai_output.classification,
      confidence: task.ai_output.confidence,
      human_reviewed: task.human_reviewed ? 'Yes' : 'No',
      final_label: task.final_label,
      priority: task.priority,
      created_at: task.created_at,
    }));
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
};

const PendingReviewsTasksScreen = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

        if (!accessToken || !refreshToken) {
          setError('Authentication error. Please log in again.');
          redirectToLogin();
          return;
        }

        const result = await fetchPendingReviews(accessToken, refreshToken);
        setTasks(result);
      } catch (err) {
        setError('Failed to load tasks.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAssignedPress = () => {
    router.push('/review/assign');
  };

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/review/reviews');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4 pt-4">
      <View className="flex-row justify-around items-center mb-4">
        <View className="flex-row items-center">
          <Pressable onPress={handleBackNavigation}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </Pressable>
          <Text className=" flex-1 text-center text-xl text-white font-semibold">
            📋 My Pending Reviews
          </Text>
        </View>
        {/* <View className="flex-row items-center">
          <TouchableOpacity onPress={handleAssignedPress}>
            <MaterialCommunityIcons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="ml-3 text-xl text-white font-semibold">📋 Assigned To Me</Text>
        </View> */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" />
      ) : error ? (
        <Text className="text-center text-red-600 mt-4">{error}</Text>
      ) : tasks.length === 0 ? (
        <Text className="text-center text-gray-500 text-base mt-8">
          No pending reviews available.
        </Text>
      ) : (
        <ScrollView className="space-y-4">
          {tasks.map(task => (
            <View
              key={task.id}
              className="bg-background p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <Text className="text-sm mb-1 text-white font-medium">
                Serial No: {task.serial_no}
              </Text>
              <Text className="text-sm mb-1 text-white">Text: {task.text}</Text>
              <Text className="text-sm mb-1 text-white">
                AI Classification: {task.ai_classification}
              </Text>
              <Text className="text-sm mb-1 text-white">Confidence: {task.confidence}</Text>
              <Text className="text-sm mb-1 text-white">Human Reviewed: {task.human_reviewed}</Text>
              <Text className="text-sm mb-1 text-white">
                Final Label: {task.final_label ?? 'N/A'}
              </Text>
              <Text className="text-sm mb-1 text-white">Priority: {task.priority}</Text>
              <Text className="text-sm text-white">Created At: {task.created_at}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PendingReviewsTasksScreen;
