import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { cn } from '@/lib/cn';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '../../constants/env-vars';
import { AxiosClient } from '@/utils/axios';

type Task = {
  task_id: number;
  serial_no: string;
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO';
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  human_reviewed: boolean;
  submitted_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const axiosClient = new AxiosClient();
        const response = await axiosClient.get<{
          status: string;
          data: Task;
        }>(`/tasks/status/${id}/`);
        if (response.status === 200) {
          setTask(response.data.data);
        }
      } catch (err) {
        setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  useEffect(() => {
    let socket: WebSocket | null = null;

    const initializeWebSocket = async () => {
      if (id) {
        const storage = new MemoryStorage();
        const token = await storage.getItem(ACCESS_TOKEN_KEY);
        const url = `${BASE_API_URL.replace('https', 'wss').replace(
          '/api/v1',
          ''
        )}/ws/task/?token=${token}`;

        socket = new WebSocket(url);

        socket.onmessage = event => {
          const data = JSON.parse(event.data);
          if (data.id === Number(id)) {
            setTask(prevTask => ({
              ...prevTask,
              ...data,
            }));
          }
        };

        socket.onerror = err => {
          setError('WebSocket connection error.');
          console.log(err);
        };

        socket.onclose = e => {
          console.log('WebSocket connection closed.', e.reason);
        };
      }
    };

    // initializeWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-foreground">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary rounded-md"
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-foreground">Task not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary rounded-md"
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const TaskIcon = () => {
    if (!task) return null;
    switch (task.task_type) {
      case 'TEXT':
        return <MaterialCommunityIcons name="file-document" size={24} color="#F97316" />;
      case 'IMAGE':
        return <MaterialCommunityIcons name="file-image" size={24} color="#F97316" />;
      case 'VIDEO':
        return <MaterialCommunityIcons name="file-video" size={24} color="#F97316" />;
      default:
        return null;
    }
  };

  const StatusIcon = () => {
    if (!task) return null;
    switch (task.processing_status) {
      case 'PENDING':
        return <MaterialCommunityIcons name="clock" size={24} color="#eab308" />;
      case 'PROCESSING':
        return <MaterialCommunityIcons name="clock" size={24} color="#a855f7" />;
      case 'COMPLETED':
        return <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />;
      case 'FAILED':
        return <MaterialCommunityIcons name="alert-outline" size={24} color="#ef4444" />;
      default:
        return null;
    }
  };

  const capitalize = (str: string | undefined) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-center flex-1 text-foreground">Task Details</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-card rounded-lg border border-border p-5 mb-6">
          <View className="flex-row items-center mb-4">
            <TaskIcon />
            <Text className="text-xl font-bold text-foreground ml-2 p-3">{task.serial_no}</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-muted-foreground">Status</Text>
                <View className="flex-row items-center mt-1">
                  <StatusIcon />
                  <Text className={cn('ml-1 text-white font-medium px-2 py-1 rounded-md')}>
                    {capitalize(task.processing_status)}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-sm text-muted-foreground">Assigned To</Text>
                <Text className="mt-1 font-medium text-foreground">
                  {task.assigned_to ? task.assigned_to : 'Not assigned'}
                </Text>
              </View>

              <View>
                <Text className="text-sm text-muted-foreground">Task Type</Text>
                <Text className="mt-1 font-medium text-foreground">
                  {capitalize(task.task_type)}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-sm text-muted-foreground mt-3">Created At</Text>
              <Text className="mt-1 text-foreground">{formatDate(task.created_at)}</Text>
            </View>

            <View>
              <Text className="text-sm text-muted-foreground mt-3">Submitted By</Text>
              <Text className="mt-1 text-foreground">{task.submitted_by}</Text>
            </View>

            <View>
              <Text className="text-sm text-muted-foreground mb-2 mt-3">Human Reviewed</Text>
              <Text className="mt-1 text-foreground">{task.human_reviewed ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        <View className="bg-card rounded-lg border border-border p-5">
          <Text className="text-lg font-semibold text-foreground mb-4">Results</Text>

          {task.processing_status === 'COMPLETED' ? (
            <View className="p-4 bg-muted rounded-md">
              <Text className="text-foreground">
                {task.task_type === 'TEXT' && 'Processed text analysis results...'}
                {task.task_type === 'IMAGE' && 'Processed image analysis results...'}
                {task.task_type === 'VIDEO' && 'Processed video analysis results...'}
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-8">
              <Text className="text-muted-foreground">
                {task.processing_status === 'PENDING' && 'Task is pending processing...'}
                {task.processing_status === 'PROCESSING' && 'Task is currently being processed...'}
                {task.processing_status === 'FAILED' && 'Task processing failed. Please try again.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
