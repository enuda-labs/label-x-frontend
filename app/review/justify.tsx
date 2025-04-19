import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ReviewTask } from '@/components/types/review-task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchTask, submitReview } from '@/services/apis/task';
// import { Task } from '@/components/types/task';
// import { MemoryStorage } from '@/utils/storage';
// import { BASE_API_URL } from '@/constants/env-vars';
// import { ACCESS_TOKEN_KEY } from '@/constants';
import { isAxiosError } from 'axios';

interface ReviewScreenProps {
  isLoading?: boolean;
  onSubmitReview?: (taskId: string, review: string, finalLabel: string) => void;
}

export default function ReviewScreen({ isLoading: initialLoading = false }: ReviewScreenProps) {
  const [message, setMessage] = useState('');
  const [finalLabel, setFinalLabel] = useState('rejected');
  const [messages, setMessages] = useState<Array<{ type: 'ai' | 'human'; text: string }>>([]);
  const [task, setTask] = useState<ReviewTask | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { taskId, data: taskData } = useLocalSearchParams<{ taskId: string; data: string }>();
  const [hideInput, setHideInput] = useState<boolean>(false);
  let socket: WebSocket | null = null;

  // Fetch task data on component mount
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;

      setIsLoading(true);
      try {
        // If fetchTask prop exists, use it to get task data
        // const taskData = await fetchTask(taskId);
        setTask(JSON.parse(taskData) as ReviewTask);
        //console.log(taskData)
      } catch (error) {
        console.log('Error fetching task:', error);
        setMessages([
          {
            type: 'ai',
            text: 'Error loading task. Please try again.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, fetchTask]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !task) return;
  
    // Append human message
    setMessages(prev => [...prev, { type: 'human', text: message }]);
  
    try {
      const data = {
        task_id: taskId,
        correction: task.ai_classification,
        justification: message,
        confidence: 1,
      };
      const res = await submitReview(data);
      setHideInput(true);
  
      // Assuming the response has `content`, `classification`, `confidence`
      //const { content, classification, confidence } = res.data;
  
      const reviewSummary = `
  Content: ${ task?.text}
  Classification: ${ 'Highly Offensive'}
  Confidence: ${1}
  
  Thank you for your review. Your feedback has been recorded.
      `.trim();
  
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: reviewSummary,
        },
      ]);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Error in onSubmitReview:', error?.response?.data);
      } else {
        console.error('Error in onSubmitReview:', error);
      }
    }
  
    setMessage('');
  };
  

  const handleChangeLabel = (newLabel: string) => {
    setFinalLabel(newLabel);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="mt-4 text-lg text-white">Loading review task...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-center text-white">
            No review task available with ID: {taskId}
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary py-2 px-4 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
//console.log('task', task)
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 55 : 0}
        >
          {/* Header */}
          <View className="flex-row p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-bold text-white">Review Task #{task.serial_no}</Text>
              <Text className="text-sm text-gray-50">Priority: {task.priority}</Text>
            </View>
          </View>

          {/* Original Data*/}
          <View className="p-4 bg-card rounded-md my-4">
            <Text className="font-bold mb-2 text-primary">Original Content:</Text>
            <View className="max-h-32 bg-card text-white p-3 rounded-md ">
              <Text className="text-white">{task.text}</Text>
            </View>
          </View>

          <View className="px-6 py-4">
            <Text className="text-primary font-semibold">Justify Review</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <View
              className={`mb-4 p-3 rounded-lg max-w-5/6 bg-card self-start`}
              style={{ alignSelf: 'flex-start' }}
            >
              <Text className={'text-white mb-4'}>AI classification: {task.ai_classification}</Text>
              <Text className={'text-white'}>Confidence: {task.confidence * 100}%</Text>
            </View>
            {messages.map((msg, index) => (
              <View
                key={index}
                className={`mb-4 p-3 rounded-lg max-w-5/6 ${
                  msg.type === 'ai' ? 'bg-card self-start' : 'bg-primary self-end'
                }`}
                style={
                  msg.type === 'human' ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
                }
              >
                <Text className={'text-white'}>{msg.text}</Text>
              </View>
            ))}
            {isLoading && (
              <View className="self-start bg-gray-100 p-3 rounded-lg">
                <ActivityIndicator size="small" color="#F97316" />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          {!hideInput && (
            <View className="p-2 border-t border-gray-200 flex-row">
              <TextInput
                className="flex-1 text-black bg-gray-100 rounded-full px-4 py-4 mr-2"
                placeholder="Type your justification..."
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ maxHeight: 100 }}
              />
              <TouchableOpacity
                className="bg-primary rounded-full w-10 h-10 justify-center items-center"
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Text className="text-white font-bold">→</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}