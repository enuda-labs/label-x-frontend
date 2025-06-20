import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReviewTask } from '../../components/types/review-task';
import { fetchAssignedTasks } from '@/services/apis/task';

// Define the RawTask type locally
export interface RawTask {
  id: number;
  serial_no: string;
  task_type: string;
  data: string;
  ai_output: {
    text: string;
    classification: string;
    confidence: number;
    requires_human_review: boolean;
    human_review: {
      correction: string | null;
      justification: string | null;
    };
  };
  predicted_label: string;
  human_reviewed: boolean;
  final_label: string | null;
  processing_status: string;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  priority: string;
  group: number;
}

const fetchTasks = async () => {
  try {
    const data = await fetchAssignedTasks();
    return data;
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return [];
  }
};

const normalizeTasks = (tasks: RawTask[]): ReviewTask[] => {
  return tasks.map(task => ({
    id: task.id.toString(),
    serial_no: task.serial_no,
    text: task.data,
    ai_classification: task.ai_output.classification,
    confidence: task.ai_output.confidence,
    human_reviewed: task.human_reviewed ? 'Yes' : 'No',
    // Provide a fallback so that final_label is always a string.
    final_label: task.final_label ?? 'None',
    priority: task.priority,
    processing_status: task.processing_status,
    assigned_to: task.assigned_to.toString(),
    created_at: task.created_at,
  }));
};

const AssignedTasksScreen = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadAssignedTasks = async () => {
      const fetchedRawTasks = await fetchTasks();
      const normalized = normalizeTasks(fetchedRawTasks);
      setTasks(normalized);
      setLoading(false);
    };

    loadAssignedTasks();
  }, []);

  const handleSubmitForReview = (taskId: string, taskData: ReviewTask) => {
    const encodedData = encodeURIComponent(JSON.stringify(taskData));
    router.push(`/review/justify?taskId=${taskId}&data=${encodedData}`);
  };

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/review/pending');
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
        <TouchableOpacity onPress={handleBackNavigation} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">
          📝 Assigned Tasks
        </Text>
      </View>

      <ScrollView className="p-4">
        {tasks.map(task => (
          <View key={task.id} className="mb-4 p-4 border border-border rounded-lg bg-card">
            <Text className="mb-1 font-bold text-foreground">ID: {task.id}</Text>
            <Text className="mb-1 text-foreground">Serial No: {task.serial_no}</Text>
            <Text className="mb-1 text-foreground">Text: {task?.text}</Text>
            <Text className="mb-1 text-foreground">
              AI Classification: {task.ai_classification}
            </Text>
            <Text className="mb-1 text-foreground">Confidence: {task.confidence}</Text>
            <Text className="mb-1 text-foreground">Human Reviewed: {task.human_reviewed}</Text>
            <Text className="mb-1 text-foreground">Final Label: {task.final_label || 'None'}</Text>
            <Text className="mb-1 text-foreground">Priority: {task.priority}</Text>
            {/* <Text className="mb-1 text-foreground">Assigned To: {task.assigned_to}</Text> */}
            <Text
              className={`mb-1 font-medium ${
                task.processing_status === 'COMPLETED'
                  ? 'text-green-500'
                  : task.processing_status === 'ASSIGNED_REVIEWER'
                    ? 'text-red-500'
                    : 'text-foreground'
              }`}
            >
              Processing Status: {task.processing_status}
                       
            </Text>
            <Text className="mb-1 text-foreground">
              Created At: {new Date(task.created_at).toLocaleString()}
            </Text>
            {task.processing_status === 'ASSIGNED_REVIEWER' && (
              <TouchableOpacity
                onPress={() => handleSubmitForReview(task.id, task)}
                style={{ backgroundColor: '#F97316' }}
                className="mt-2 self-start px-3 py-2 rounded"
              >
                <Text className="text-white font-medium">Review</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignedTasksScreen;
