import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReviewTask } from '../../components/types/review-task';
import { isAxiosError } from 'axios';
import { fetchPendingReviews } from '@/services/apis/review';

const fetchReviews = async (): Promise<ReviewTask[]> => {
  try {
    const tasks = await fetchPendingReviews();
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
      try {
        const fetchedTasks = await fetchReviews();
        setTasks(fetchedTasks);
      } catch (error) {
        if (isAxiosError(error)) {
          return setError(error.response?.data || 'Failed to load tasks');
        }
        setError('Failed to load tasks.');
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
