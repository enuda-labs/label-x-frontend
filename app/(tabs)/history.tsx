import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchTasks } from '@/services/apis/task';

// Define the Task interface
export interface Task {
  id: string;
  data: string;
  serial_no: string;
  task_type: string;
}

const fetchMyTasks = async () => {
  try {
    const tasks = await fetchTasks();
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
      const fetchedTasks = await fetchMyTasks();
      setTasks(fetchedTasks);
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
        {tasks.map(task => (
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
            <Text className="ml-3 text-lg font-medium text-foreground">{task.data}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskHistoryScreen;
