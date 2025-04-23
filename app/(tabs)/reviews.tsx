import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReviewTask } from '../../components/types/review-task';
import { assignTask, fetchReviewTasks } from '@/services/apis/task';
import { isAxiosError } from 'axios';

const ReviewNeededTasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchReviewTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        if (isAxiosError(error)) {
          return console.log(error.response?.data || 'Failed to load tasks');
        }
        console.log('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);
//console.log(tasks)
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">
          📝 Review Needed Tasks
        </Text>
      </View>

      <ScrollView className="p-4">
        {tasks.length ? (
          tasks.map(task => (
            <View key={task.id} className="mb-4 p-4 border border-border rounded-lg bg-card">
              <Text className="mb-1 font-bold text-foreground">ID: {task.id}</Text>
              <Text className="mb-1 text-foreground">Serial No: {task.serial_no}</Text>
              <Text className="mb-1 text-foreground">Text: {task.data}</Text>
              <Text className="mb-1 text-foreground">
                AI Classification: {task?.ai_output?.classification}
              </Text>
              <Text className="mb-1 text-foreground">Confidence: {task.ai_output?.confidence}</Text>
              <Text className="mb-1 text-foreground">Human Review: {task?.requires_human_review ? 'True' : 'False'}</Text>
              <Text className="mb-1 text-foreground">Final Label: {task?.predicted_label}</Text>
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
          ))
        ) : (
          <Text className="text-center text-gray-500 text-base mt-8">No tasks available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewNeededTasksScreen;
