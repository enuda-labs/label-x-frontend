import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { cn } from '@/lib/cn';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '../../constants/env-vars';
import { Task } from '../../components/types/task';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null); // Removed the initial static task object here
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // add state for access token

  const storage = new MemoryStorage();

  useEffect(() => {
    // Fetch the access token from storage
    const fetchAccessToken = async () => {
      const token = await storage.getItem(ACCESS_TOKEN_KEY);
      setAccessToken(token); // store access token in state
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    // Ensure task is only fetched when accessToken is available
    if (!id || !accessToken) {
      console.log('ID or access token is not available yet');
      return;
    }

    const fetchTaskDetails = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/tasks/status/${id}/`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch task details');
        }

        const data = await response.json();
      
        setTask(data.data);
      } catch (err) {
        setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, accessToken]); // Depend on both `id` and `accessToken`

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-foreground">{error}</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-primary rounded-md">
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
    switch (task.type) {
      case 'text':
        return <MaterialCommunityIcons name="file-document" size={24} color="#F97316" />;
      case 'image':
        return <MaterialCommunityIcons name="file-image" size={24} color="#F97316" />;
      case 'video':
        return <MaterialCommunityIcons name="file-video" size={24} color="#F97316" />;
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
    switch (task.status) {
      case 'PENDING':
        return <MaterialCommunityIcons name="clock" size={24} color="#eab308" />;
      case 'PROCESSING':
        return <MaterialCommunityIcons name="clock" size={24} color="#a855f7" />;
      case 'COMPLETED':
        return <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />;
      case 'FAILED':
        return <MaterialCommunityIcons name="alert-outline" size={24} color="#ef4444" />;
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    normal: 'bg-green-100 text-green-800',
    high: 'bg-orange-100 text-orange-800',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
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
                  <Text
                    className={cn(
                      'ml-1 font-medium px-2 py-1 rounded-md',
                      statusColors[task.status]
                    )}
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  <Text className={cn('ml-1 text-white font-medium px-2 py-1 rounded-md')}>
                    {capitalize(task.status)}
                  </Text>
                </View>
              </View>


              <View>
                <Text className="text-sm text-muted-foreground">Priority</Text>
                <Text
                  className={cn(
                    'mt-1 font-medium px-2 py-1 rounded-md',
                    priorityColors[task.priority]
                  )}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
              <Text className="text-sm text-muted-foreground mb-2 mt-3">Sample Data</Text>
              <View className="p-4 bg-muted rounded-md">
                <Text className="text-foreground">
                  {task.type === 'text' && 'Sample text data for processing...'}
                  {task.type === 'image' && 'Image URL or Base64 data would be here...'}
                  {task.type === 'video' && 'Video URL or metadata would be here...'}
                </Text>
              </View>
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

          {task.status === 'completed' ? (

          {task.status === 'COMPLETED' ? (
            <View className="p-4 bg-muted rounded-md">
              <Text className="text-foreground">
                {task.type === 'text' && 'Processed text analysis results...'}
                {task.type === 'image' && 'Processed image analysis results...'}
                {task.type === 'video' && 'Processed video analysis results...'}
                {task.task_type === 'TEXT' && 'Processed text analysis results...'}
                {task.task_type === 'IMAGE' && 'Processed image analysis results...'}
                {task.task_type === 'VIDEO' && 'Processed video analysis results...'}
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-8">
              <Text className="text-muted-foreground">
                {task.status === 'pending' && 'Task is pending processing...'}
                {task.status === 'processing' && 'Task is currently being processed...'}
                {task.status === 'failed' && 'Task processing failed. Please try again.'}
                {task.status === 'PENDING' && 'Task is pending processing...'}
                {task.status === 'PROCESSING' && 'Task is currently being processed...'}
                {task.status === 'FAILED' && 'Task processing failed. Please try again.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
