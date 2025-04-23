import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import PageContainer from '@/components/ui/page-container';
import { useRouter } from 'expo-router';
import { useGlobalStore } from '@/context/store';
import {
  fetchAssignedTasks,
  fetchReviewTasks,
  fetchPendingReviews,
  fetchTasks,
} from '@/services/apis/task';
import { Task } from '@/components/types/task';
import { RawTask } from '@/components/types/raw-task';
import { ReviewTask } from '@/components/types/review-task';
//import { fetchTasks } from '@/services/apis/task';
// Map a RawTask (from assigned tasks API) into a ReviewTask
const mapRawToReview = (raw: RawTask): ReviewTask => ({
  id: raw.id.toString(),
  serial_no: raw.serial_no.toString(),
  data: raw.data ?? '',
  ai_classification: raw.ai_output?.classification ?? '',
  confidence: raw.ai_output?.confidence ?? 0,
  human_reviewed: raw.human_review?.correction ?? '',
  final_label: raw.final_label ?? '',
  priority: (raw.priority ?? 'low').toLowerCase(),
  created_at: raw.created_at,
  processing_status: raw.processing_status,
  assigned_to: raw.assigned_to?.toString() ?? null,
  ai_output: raw.ai_output
    ? { classification: raw.ai_output.classification, confidence: raw.ai_output.confidence }
    : undefined,
  human_review: raw?.human_review
    ? {
        correction: raw.human_review.correction ?? null,
        justification: raw.human_review.justification ?? null,
      }
    : undefined,
});

const fetchMyTasks = async () => {
  try {
    const tasks = await fetchTasks();
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// Map a basic Task (from my-tasks API) into a ReviewTask shape
const mapTaskToReview = (task: Task): ReviewTask => ({
  id: task.id.toString(),
  serial_no: task.serial_no,
  data: '',
  ai_classification: '',
  confidence: 0,
  human_reviewed: task?.human_reviewed ? 'Yes' : '',
  final_label: '',
  priority: 'low',
  created_at: task.created_at,
  processing_status: task.status,
  assigned_to: task?.assigned_to ?? '',
});

export default function ReviewerDashboard() {
  const router = useRouter();
  const { user } = useGlobalStore();

  const [stats, setStats] = useState({ available: 0, pending: 0, completed: 0, urgentTasks: 0 });
  const [newTasks, setNewTasks] = useState<ReviewTask[]>([]);
  const [recentReviews, setRecentReviews] = useState<ReviewTask[]>([]);


  useEffect(() => {
    async function loadData() {
      // Fetch data from APIs
      const assignedRaw = await fetchAssignedTasks(); // RawTask[]
      const reviewRaw = await fetchReviewTasks(); // RawTask[]
      const pendingRaw = await fetchPendingReviews(); // RawTask[]
      const myTasksRaw = await fetchTasks(); // Task[]

      // Map all RawTask arrays into ReviewTask
      const assigned = assignedRaw.map(mapRawToReview);
      const reviewNeeded = (reviewRaw as RawTask[]).map(mapRawToReview);
     // const myTasks = myTasksRaw.slice(0,1).map(mapTaskToReview);
//console.log(myTasks)
      // Compute stats based on assigned tasks
      const pendingCount = assigned.filter(t => t.processing_status === 'ASSIGNED_REVIEWER').length;
      const history = assigned.filter(t => t.processing_status === 'COMPLETED');
      const completedCount = assigned.length - pendingCount;
      const urgentCount = assigned.filter(t => t.priority === 'urgent').length;

      setStats({
        available: assigned.length,
        pending: pendingCount,
        completed: completedCount,
        urgentTasks: urgentCount,
      });

      // Now set tasks with proper mapped fields
      setNewTasks(reviewNeeded);
      setRecentReviews(history.slice(0,1));
    
    }

    loadData();
  }, [router]);

  const capitalize = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'N/A');

  const handleMenuPress = () => {
    router.push('/tasks/history');
  };

  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'safe':
        return 'text-green-400';
      case 'mildly offensive':
        return 'text-yellow-400';
      case 'unsafe':
        return 'text-orange-400';
      case 'highly offensive':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderTaskCard = (task: ReviewTask) => {
    const labelText = capitalize(task.final_label);
    const classificationColor = getClassificationColor(task.ai_classification);
    return (
      <View key={task.id} className="bg-card border border-card/10 p-4 rounded-lg mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-white font-medium">Review #{task.serial_no}</Text>
            <Text className="text-gray-400 text-xs mt-1">{task.data}</Text>
          </View>
          <View className="flex-row items-center">
  {task.processing_status === 'ASSIGNED_REVIEWER' ? (
    <>
      <Ionicons name="time-outline" size={16} color="#F97316" />
      <Text className="text-primary text-xs ml-1">Pending</Text>
    </>
  ) : task.processing_status === 'COMPLETED' ? (
    <>
      <Ionicons
        name={
          
            'checkmark-circle-outline'
           
        }
        size={16}
        color= '#34D399'
      />
      <Text
        className="text-xs ml-1 text-green-400">
        Completed
      </Text>
    </>
  ) : (
    <>
      <Ionicons name="help-circle-outline" size={16} color="#fff500" />
      <Text className="text-xs ml-1 text-yellow-500">Unassigned</Text>
    </>
  )}
</View>

        </View>
        <View className="flex-row flex-wrap">
          <Text className={`text-xs mr-4 ${classificationColor}`}>
            AI: {task.ai_classification}
          </Text>
          <Text className="text-gray-400 text-xs mr-4">
            Confidence: {(task.confidence * 100).toFixed(1)}%
          </Text>
          <Text className="text-gray-400 text-xs mr-4">Priority: {capitalize(task.priority)}</Text>
          <Text className="text-gray-400 text-xs mr-4">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </Text>
          {/* <Text className="text-gray-400 text-xs">Assigned To: {task.assigned_to || 'N/A'}</Text> */}
        </View>
      </View>
    );
  };

  return (
    <PageContainer>
      <View className="flex-row items-center justify-between">
        <View className="mb-4 flex-row items-center pt-2 pb-3">
          <TouchableOpacity className="p-2" onPress={handleMenuPress}>
            <Feather name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Welcome, {user || 'Reviewer'}</Text>
        </View>
        <TouchableOpacity className="p-2" onPress={() => router.push('/auth/login')}>
          <Feather name="bell" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between mb-4">
        <TouchableOpacity
          onPress={() => router.push('/review/assign')}
          className="bg-card w-[48%] p-4 rounded-lg shadow-md mb-3"
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-sm">Assigned</Text>
            <Ionicons name="layers-outline" size={20} color="#F97316" />
          </View>
          <Text className="text-white text-2xl font-bold">{stats.available}</Text>
          <View className="flex-row mt-2">
            <View className="bg-green-900 px-2 py-0.5 rounded">
              <Text className="text-green-300 text-xs">{stats.completed} Done</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/pending')}
          className="bg-card w-[48%] p-4 rounded-lg shadow-md mb-3"
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-sm">Pending</Text>
            <Ionicons name="alert-circle-outline" size={20} color="#F97316" />
          </View>
          <Text className="text-white text-2xl font-bold">{stats.pending}</Text>
          <View className="flex-row mt-2">
            <View className="bg-red-400 px-2 py-0.5 rounded">
              <Text className="text-black text-xs">Priority</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xl font-bold">New Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reviews')}>
            <Text className="text-primary text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {newTasks.map(renderTaskCard)}
      </ScrollView>

      <ScrollView className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xl font-bold">Recent Reviews</Text>
          <TouchableOpacity onPress={() => router.push('/tasks/history')}>
            <Text className="text-primary text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {recentReviews.map(renderTaskCard)}
      </ScrollView>

      <View>
        <View className="flex-row justify-between items-center mb-2 ">
          <Text className="text-white text-xl font-bold">My Performance</Text>
          <TouchableOpacity>
            <Text className="text-primary text-sm">Details</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-card px-4 rounded-lg py-6">
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Accuracy Rate</Text>
            <Text className="text-white font-bold">98%</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Weekly Completion</Text>
            <Text className="text-white font-bold">
              {stats.completed}/{stats.available}
            </Text>
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
