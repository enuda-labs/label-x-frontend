import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import PageContainer from "@/components/ui/page-container";
import { useRouter } from 'expo-router';
import { useAuth } from "@/utils/user/get-user";
export default function ReviewerDashboard() {
  
  const router = useRouter();
  const { userName } = useAuth();
  const [stats, setStats] = useState({
    available: 16,
    pending: 6,
    completed: 10,
    urgentTasks: 2
  });

  // Most recent reviews
  const [recentReviews, setRecentReviews] = useState([
   // { id: 1, title: "Review #3842", type: "Image", status: "pending", timeLeft: "1h" },
    { id: 2, title: "Review #3839", type: "Text", status: "completed", result: "safe" },
    { id: 3, title: "Review #3836", type: "Audio", status: "completed", result: "unsafe" },
  ]);

  return (
    <PageContainer>
        <View className='flex-row items-center justify-between'>
      <View className="mb-4 flex-row items-center pt-2 pb-3">
      <TouchableOpacity className="p-2">
          <Feather name='menu' size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Welcome, {userName || 'Reviewer'} </Text>
       </View>
       <TouchableOpacity className="p-2" onPress={() => router.push('/')}>
          <Feather name='bell' size={24} color="#fff" />
          {/* <NotificationBadge/> */}
        </TouchableOpacity>
      </View>

      
      <View className="flex-row flex-wrap justify-between mb-4">
        <TouchableOpacity onPress={() => router.push('/review/assign')} className="bg-card w-[48%] p-4 rounded-lg shadow-md mb-3">
          <View  className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-sm">Assigned</Text>
            <Ionicons name="layers-outline" size={20} color="#F97316" />
          </View>
          <Text className="text-white text-2xl font-bold">{stats.available}</Text>
          <View className="flex-row mt-2">
            {/* <View className="bg-primary/50 px-2 py-0.5 rounded mr-1">
              <Text className="text-white text-xs">{stats.pending} Pending</Text>
            </View> */}
            <View className="bg-green-900 px-2 py-0.5 rounded">
              <Text className="text-green-300 text-xs">{stats.completed} Done</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="bg-card w-[48%] p-4 rounded-lg shadow-md mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-sm">Pending</Text>
            <Ionicons name="alert-circle-outline" size={20} color="#F97316" />
          </View>
          <Text className="text-white text-2xl font-bold">{stats.urgentTasks}</Text>
          <View className="flex-row mt-2">
            <View className="bg-red-400 px-2 py-0.5 rounded">
              <Text className="text-black text-xs">Priority</Text>
            </View>
          </View>
        </View>
      </View>

    
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xl font-bold"> New Tasks</Text>
          <TouchableOpacity onPress={() => {router.push('/(tabs)/reviews')}}>
            <Text className="text-primary text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {recentReviews.map(review => (
          <TouchableOpacity key={review.id} className="bg-card border border-card/10 p-4 rounded-lg mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-medium">{review.title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{review.type}</Text>
              </View>

              <View className="flex-row items-center">
                {review.status === "pending" ? (
                  <View className="flex-row items-center">
                    {/* <Ionicons name="time-outline" size={16} color="#60A5FA" />
                    <Text className="text-primary text-xs ml-1">{review.timeLeft}</Text> */}
                  </View>
                ) : review.result === "safe" ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle-outline" size={16} color="#34D399" />
                    <Text className="text-green-400 text-xs ml-1">Safe</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle-outline" size={16} color="#F87171" />
                    <Text className="text-red-400 text-xs ml-1">Unsafe</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xl font-bold">Recent Reviews</Text>
          <TouchableOpacity onPress={() => {router.push('/(tabs)/history')}}>
            <Text className="text-primary text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {recentReviews.map(review => (
          <TouchableOpacity key={review.id} className="bg-card border border-card/10 p-4 rounded-lg mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-medium">{review.title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{review.type}</Text>
              </View>

              <View className="flex-row items-center">
                {review.status === "pending" ? (
                  <View className="flex-row items-center">
                    {/* <Ionicons name="time-outline" size={16} color="#60A5FA" />
                    <Text className="text-primary text-xs ml-1">{review.timeLeft}</Text> */}
                  </View>
                ) : review.result === "safe" ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle-outline" size={16} color="#34D399" />
                    <Text className="text-green-400 text-xs ml-1">Safe</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle-outline" size={16} color="#F87171" />
                    <Text className="text-red-400 text-xs ml-1">Unsafe</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    
      <View>
        <View className="flex-row justify-between items-center mb-2 ">
          <Text className="text-white text-xl font-bold">My Performance</Text>
          <TouchableOpacity onPress={() => {/* Navigate to full performance stats */}}>
            <Text className="text-primary text-sm">Details</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-card px-4 rounded-lg py-6">
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Accuracy Rate</Text>
            <Text className="text-white font-bold">98%</Text>
          </View>
          {/* <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Avg. Time per Review</Text>
            <Text className="text-white font-bold">4m 32s</Text>
          </View> */}
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Weekly Completion</Text>
            <Text className="text-white font-bold">32/40</Text>
          </View>
        </View>
      </View>
    </PageContainer>
  );
}