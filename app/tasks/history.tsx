import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const TASKS = [
  { id: '1', title: 'Analyze customer feedback', type: 'text', status: 'completed' },
  { id: '2', title: 'Process product images', type: 'image', status: 'processing' },
  { id: '3', title: 'Transcribe marketing video', type: 'video', status: 'pending' },
];

export default function TaskHistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className=" flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl flex-1 font-bold text-center text-foreground">Task History</Text>
      </View>

      <ScrollView className="p-4">
        {TASKS.map(task => (
          <TouchableOpacity
            key={task.id}
            onPress={() => router.push(`/tasks/${task.id}`)}
            className="p-4 mb-4 border border-border rounded-lg bg-card flex-row items-center"
          >
            <MaterialCommunityIcons
              name={
                task.type === 'text'
                  ? 'file-document'
                  : task.type === 'image'
                    ? 'file-image'
                    : 'file-video'
              }
              size={24}
              color="#F97316"
            />
            <Text className="ml-3 text-lg font-medium text-foreground">{task.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
