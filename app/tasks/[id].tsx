import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Task } from '@/components/task-card';

const MOCK_TASKS: Record<string, Task> = {
  '1': {
    id: '1',
    title: 'Analyze customer feedback',
    type: 'text',
    priority: 'high',
    status: 'completed',
    createdAt: '2023-05-10T14:30:00Z',
  },
  '2': {
    id: '2',
    title: 'Process product images',
    type: 'image',
    priority: 'normal',
    status: 'processing',
    createdAt: '2023-05-11T09:15:00Z',
  },
  '3': {
    id: '3',
    title: 'Transcribe marketing video',
    type: 'video',
    priority: 'low',
    status: 'pending',
    createdAt: '2023-05-12T16:45:00Z',
  },
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = MOCK_TASKS[id as string];

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
    switch (task.type) {
        case 'text':
            return <MaterialCommunityIcons name="file-document" size={24} color="#F97316" />;
          case 'image':
            return <MaterialCommunityIcons name="file-image" size={24} color="#F97316" />;
          case 'video':
            return <MaterialCommunityIcons name="file-video" size={24} color="#F97316" />;
    }
  };

  const StatusIcon = () => {
    switch (task.status) {
      case 'pending':
        return <MaterialCommunityIcons name="clock" size={24} color=" #eab308" />;
      case 'processing':
        return <MaterialCommunityIcons name="clock" size={24} color="  #a855f7" />;
      case 'completed':
        return <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />;
      case 'failed':
        return <MaterialCommunityIcons name="alert-outline" size={24} color="#ef4444" />;
    }
  };
  
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    normal: "bg-green-100 text-green-800",
    high: "bg-orange-100 text-orange-800",
  };
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold  text-center flex-1 text-foreground">Task Details</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <View className="bg-card rounded-lg border border-border p-5 mb-6">
          <View className="flex-row items-center mb-4">
            <TaskIcon />
            <Text className="text-xl font-bold text-foreground ml-2 p-3">{task.title}</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-muted-foreground">Status</Text>
                <View className="flex-row items-center mt-1">
                  <StatusIcon />
                  <Text className={cn("ml-1 font-medium px-2 py-1 rounded-md", statusColors[task.status])}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View>
                <Text className="text-sm text-muted-foreground">Priority</Text>
                <Text className={cn("mt-1 font-medium px-2 py-1 rounded-md", priorityColors[task.priority])}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Text>
              </View>
              
              <View>
                <Text className="text-sm text-muted-foreground py-1">Type</Text>
                <Text className="mt-1 font-medium text-foreground">
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                </Text>
              </View>
            </View>
            
            <View>
              <Text className="text-sm text-muted-foreground mt-3">Created At</Text>
              <Text className="mt-1 text-foreground">{formatDate(task.createdAt)}</Text>
            </View>
            
            <View>
              <Text className="text-sm text-muted-foreground mb-2 mt-3">Sample Data</Text>
              <View className="p-4 bg-muted rounded-md">
                <Text className="text-foreground">
                  {task.type === 'text' && "Sample text data for processing..."}
                  {task.type === 'image' && "Image URL or Base64 data would be here..."}
                  {task.type === 'video' && "Video URL or metadata would be here..."}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View className="bg-card rounded-lg border border-border p-5">
          <Text className="text-lg font-semibold text-foreground mb-4">Results</Text>
          
          {task.status === 'completed' ? (
            <View className="p-4 bg-muted rounded-md">
              <Text className="text-foreground">
                {task.type === 'text' && "Processed text analysis results..."}
                {task.type === 'image' && "Processed image analysis results..."}
                {task.type === 'video' && "Processed video analysis results..."}
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-8">
              <Text className="text-muted-foreground">
                {task.status === 'pending' && "Task is pending processing..."}
                {task.status === 'processing' && "Task is currently being processed..."}
                {task.status === 'failed' && "Task processing failed. Please try again."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
