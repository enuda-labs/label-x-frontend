import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
//import { FileText, Image, Video } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Task = {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video';
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
};

type TaskCardProps = {
  task: Task;
  className?: string;
};

export const TaskCard = ({ task, className }: TaskCardProps) => {
  const router = useRouter();
  
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
  
  const TaskIcon = () => {
    switch (task.type) {
      case 'text':
        return <MaterialCommunityIcons name="file-document" size={24} color="black" />;
      case 'image':
        return <MaterialCommunityIcons name="file-image" size={24} color="black" />;
      case 'video':
        return <MaterialCommunityIcons name="file-video" size={24} color="black" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/tasks/${task.id}`)}
      className={cn(
        "p-4 border border-border rounded-lg bg-card",
        className
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <TaskIcon />
          <Text className="font-medium text-foreground">{task.title}</Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {formatDate(task.createdAt)}
        </Text>
      </View>
      
      <View className="flex-row mt-3 space-x-2">
        <View className={cn("px-2 py-1 rounded-full", priorityColors[task.priority])}>
          <Text className="text-xs font-medium">{task.priority}</Text>
        </View>
        <View className={cn("px-2 py-1 rounded-full", statusColors[task.status])}>
          <Text className="text-xs font-medium">{task.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
