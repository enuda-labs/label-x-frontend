import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TaskForm } from '@/components/task-form';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';

export default function NewTaskScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    const url = 'https://label-x-dock.onrender.com/api/v1/tasks/';

    const storage = new MemoryStorage();

    // Async function to get the tokens
    const getTokens = async () => {
      const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      return { accessToken, refreshToken };
    };

    let { accessToken, refreshToken } = await getTokens(); // Use let here to allow reassignment

    const taskData = {
      task_type: data.type.toUpperCase(),
      data: data.data,
      priority: data.priority.toUpperCase(),
      status: "PENDING",
    };

    try {
      setIsLoading(true);

      // Function to refresh the access token
      const refreshAccessToken = async () => {
        const refreshUrl = 'https://label-x-dock.onrender.com/api/v1/account/token/refresh/';
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          const refreshError = await refreshResponse.json();
          console.error('Error refreshing token:', refreshError);
          redirectToLogin();
          return null;
        }

        const refreshedTokens = await refreshResponse.json();
        return refreshedTokens.access;
      };

      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Task created:', responseData);

        if (responseData && responseData.data && responseData.data.task_id) {
          const taskId = responseData.data.task_id;

          router.push({
            pathname: '/tasks/[id]',
            params: { id: taskId },
          });
        } else {
          console.error("Error: Task data or task ID is missing in the response.");
          alert("Error: Task data or task ID is missing. Please try again.");
        }
      } else {
        const errorData = await response.json();
        console.error("Bad Request error:", errorData);

        if (response.status === 400) {
          alert(`Error: Bad Request. ${errorData.message || 'Please check the task data and try again.'}`);
        } else if (response.status === 401) {
          console.log("Access token expired. Attempting to refresh...");
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            accessToken = newAccessToken;  // Reassign the access token
            response = await fetch(url, {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify(taskData),
            });

            if (response.ok) {
              const responseData = await response.json();
              console.log('Task created:', responseData);
              router.push(`/tasks/${responseData.data.task_id}`);
            } else {
              alert(`Error: Unable to create task after refreshing token. ${errorData.message || 'Please try again.'}`);
            }
          }
        } else {
          console.error(`Unexpected error: ${response.status}`, errorData);
          alert(`Error: Unexpected issue occurred. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error during task creation:', error);
      alert('Error: Something went wrong during the request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center px-4 py-4 border-b border-border">
          <TouchableOpacity onPress={() => router.push('/tasks/history')} className="mr-4">
            <MaterialCommunityIcons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground text-center">Create New Task</Text>
        </View>

        <ScrollView
          contentContainerClassName="flex-grow p-4 mt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
