import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchAssignedTasks } from '@/services/apis/task';

// Import the Task interface from the shared types file
import { ReviewTask } from '@/components/types/review-task';
import { mapRawToReview } from '@/components/role-screens/home/reviewer';

const TaskHistoryScreen = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyTasks = async () => {
    try {
      const tasks = await fetchAssignedTasks();
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      const fetchedTasks = await fetchMyTasks();
      setTasks(fetchedTasks.map(task => mapRawToReview(task)));
    };
    loadTasks();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View
        className="flex-row items-center px-4 py-4 border-b border-border"
        style={{ backgroundColor: '#F97316' }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-white">Task History</Text>
        {/* <TouchableOpacity onPress={handleReviewPress} className="ml-4">
          <MaterialCommunityIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={handlePendingPress} className="ml-4">
          <Text className="text-xl flex-1 font-bold text-center text-white">Pending Review</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView className="p-4">
        {isLoading ? (
          <>
            <View className="p-4 mb-4 border border-border rounded-lg bg-card flex-row items-center">
              <MaterialCommunityIcons name="loading" size={24} color="#F97316" />
              <Text className="ml-3 text-lg font-medium text-foreground">
                <View className="h-4 w-16 bg-gray-700 rounded" />
              </Text>
            </View>
            <View className="p-4 mb-4 border border-border rounded-lg bg-card flex-row items-center">
              <MaterialCommunityIcons name="loading" size={24} color="#F97316" />
              <Text className="ml-3 text-lg font-medium text-foreground">
                <View className="h-4 w-16 bg-gray-700 rounded" />
              </Text>
            </View>
          </>
        ) : tasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-500">No tasks found.</Text>
          </View>
        ) : (
          tasks.map(task => (
            <TouchableOpacity
              key={task.id}
              onPress={() =>
                router.push(`/tasks/${task.id}?data=${encodeURIComponent(JSON.stringify(task))}`)
              }
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
              <Text className="ml-3 text-lg font-medium text-foreground">{task.data}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskHistoryScreen;
