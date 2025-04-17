import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReviewTask } from '../../components/types/review-task';
import { assignTask, fetchReviewTasks } from '@/services/apis/review';

const ReviewNeededTasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      const fetchedTasks = await fetchReviewTasks();
      setTasks(fetchedTasks);

      setLoading(false);
    };

    loadTasks();
  }, []);

  const handleAssign = async (taskId: string): Promise<void> => {
    const assignTaskToMe = async (): Promise<boolean> => {
      try {
        const result = await assignTask(taskId);
        if (result.status === 'success') {
          Alert.alert('Success', result.message || 'Task assigned to you!');
          return true;
        }
        Alert.alert('Error', result.message || 'Failed to assign task.');
        return false;
      } catch (error) {
        console.error('Error assigning task:', error);
        Alert.alert('Error', 'An unexpected error occurred while assigning the task.');
        return false;
      }
    };
    const assigned = await assignTaskToMe();
    if (assigned) {
      const updatedTasks = await fetchReviewTasks();
      setTasks(updatedTasks);
    }
  };

  const handleBackNavigation = (): void => {
    router.push('/tasks/history');
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
          📝 Review Needed Tasks
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
