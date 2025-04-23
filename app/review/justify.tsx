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
  Alert,
} from 'react-native';
import { ReviewTask } from '@/components/types/review-task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomSelect from '@/components/ui/select';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { BASE_API_URL } from '@/constants/env-vars';
import { completeReview } from '@/services/apis/task';

interface ReviewScreenProps {
  isLoading?: boolean;
}

interface ReviewResponse {
  text: string;
  original_classification: string;
  corrected_classification: string;
  learning_summary: string;
  updated_confidence: number;
  similar_examples: string[];
}

export default function ReviewScreen({ isLoading: initialLoading = false }: ReviewScreenProps) {
  const [message, setMessage] = useState('');
  const [userClassification, setUserClassification] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'ai' | 'human'; text: string }>>([]);
  const [task, setTask] = useState<ReviewTask | null>(null);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { taskId, data: taskData } = useLocalSearchParams<{ taskId: string; data: string }>();
  const [hideInput, setHideInput] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  const classificationOptions = [
    { label: 'Safe', value: 'safe' },
    { label: 'Mildly Offensive', value: 'Mildly Offensive' },
    { label: 'Highly Offensive', value: 'Highly Offensive' },
  ];

  // Fetch task data on component mount
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;

      setIsLoading(true);
      try {
        setTask(JSON.parse(taskData) as ReviewTask);
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
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [taskId, taskData]);

  // Initialize WebSocket connection
  const initializeWebSocket = async () => {
    if (!task?.id) return;

    const storage = new MemoryStorage();
    const token = await storage.getItem(ACCESS_TOKEN_KEY);
    const url = `${BASE_API_URL.replace('https', 'wss').replace(
      '/api/v1',
      ''
    )}/ws/reviewer/?token=${token}`;

    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            action: 'submit_review',
            justification: message,
            classification: userClassification,
            confidence_score: 1,
            task_id: taskId,
          })
        );
      }
    };

    socketRef.current.onmessage = event => {
      const data = JSON.parse(event.data);

      // Handle celery worker response
      if (data.celery_worker_id) {
        setIsReviewing(true);
        // setMessages(prev => [
        //   ...prev,
        //   {
        //     type: 'ai',
        //     text: 'Reviewing your submission...',
        //   },
        // ]);
        return;
      }

      // Handle review response
      if (data.action === 'review_response') {
        setIsReviewing(false);
        setReviewResponse(data);
        setHideInput(true);
        setIsSubmitting(false);
        setTask(prevTask => ({
          ...prevTask!,
          human_review: {
            correction: data.corrected_classification,
            justification: message,
          },
          final_label: data.corrected_classification,
        }));
      }
    };

    socketRef.current.onerror = error => {
      console.error('WebSocket error:', error);
      Alert.alert(
        'Connection Error',
        'An error occurred while submitting your review. Would you like to retry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => initializeWebSocket() },
        ]
      );
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: 'Error receiving review response. Please try again.',
        },
      ]);
      setIsSubmitting(false);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !task || !userClassification) {
      Alert.alert(
        'Missing Information',
        'Please provide both classification and justification before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    setMessages(prev => [...prev, { type: 'human', text: message }]);

    // Initialize WebSocket and send review
    await initializeWebSocket();
  };

  const handleRetrain = () => {
    setReviewResponse(null);
    setHideInput(false);
    setMessage('');
    setUserClassification('');
  };

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      const response = await completeReview(taskId!);
      if (response.status === 'success') {
        Alert.alert('Success', 'Review completed successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to complete review');
      }
    } catch (error) {
      console.error('Error completing review:', error);
      Alert.alert('Error', 'Failed to complete review');
    } finally {
      setIsCompleting(false);
    }
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
              <Text className="text-lg font-bold text-white">Review Task #{task?.serial_no}</Text>
              <Text className="text-sm text-gray-50">Priority: {task?.priority}</Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Original Data*/}
            <View className="p-4">
              <View className="p-4 bg-card rounded-md my-4">
                <Text className="font-bold mb-2 text-primary">Original Content:</Text>
                <View className="bg-card text-white p-3 rounded-md">
                  <Text className="text-white">{task?.text}</Text>
                </View>
              </View>
            </View>

            {/* AI Classification */}
            <View className="px-4 mb-4">
              <View className="p-4 bg-card rounded-lg">
                <Text className="text-primary font-semibold mb-2">AI Classification</Text>
                <Text className="text-white mb-2">Classification: {task?.ai_classification}</Text>
                <Text className="text-white">Confidence: {task ? task.confidence * 100 : 0}%</Text>
              </View>
            </View>

            {/* User Classification */}
            <View className={`px-4 ${!messages.length ? 'mb-4' : ''}`}>
              <View className="p-4 bg-card rounded-lg">
                <Text className="text-primary font-semibold mb-2">Your Classification</Text>
                <CustomSelect
                  value={userClassification}
                  onValueChange={setUserClassification}
                  options={classificationOptions}
                  placeholder="Select classification"
                />
              </View>
            </View>

            {/* Messages */}
            {messages.length > 0 && (
              <View className="pt-4 px-4 flex-1">
                <Text className="text-primary font-semibold mb-2">Justify Review</Text>
                <View className="flex-1">
                  {messages.map((msg, index) => (
                    <View
                      key={index}
                      className={`mb-4 p-3 rounded-lg max-w-5/6 ${
                        msg.type === 'ai' ? 'bg-card self-start' : 'bg-primary self-end'
                      }`}
                      style={
                        msg.type === 'human'
                          ? { alignSelf: 'flex-end' }
                          : { alignSelf: 'flex-start' }
                      }
                    >
                      <Text className="text-white">{msg.text}</Text>
                    </View>
                  ))}
                </View>
                {isReviewing && (
                  <View className="self-start bg-card p-3 rounded-lg flex-row items-center mb-4">
                    <ActivityIndicator size="small" color="#F97316" style={{ marginRight: 8 }} />
                    <Text className="text-white">Processing review...</Text>
                  </View>
                )}
              </View>
            )}

            {reviewResponse && (
              // Review Response Section
              <View className="p-4">
                <View className="bg-card p-4 rounded-lg mb-4">
                  <Text className="text-xl font-bold text-primary mb-4">Review Summary</Text>
                  <View className="space-y-4">
                    <View>
                      <Text className="text-muted-foreground">Original Text</Text>
                      <Text className="text-white mt-1">{reviewResponse.text}</Text>
                    </View>

                    <View>
                      <Text className="text-muted-foreground mt-2">Classification Change</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-white">{reviewResponse.original_classification}</Text>
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={20}
                          color="#F97316"
                          style={{ marginHorizontal: 8 }}
                        />
                        <Text className="text-white">
                          {reviewResponse.corrected_classification}
                        </Text>
                      </View>
                      <Text className="text-white text-sm mt-1">
                        Confidence: {reviewResponse.updated_confidence * 100}%
                      </Text>
                    </View>

                    <View>
                      <Text className="text-muted-foreground mt-2">Learning Summary</Text>
                      <Text className="text-white mt-1">{reviewResponse.learning_summary}</Text>
                    </View>

                    <View>
                      <Text className="text-muted-foreground mt-2">Similar Examples</Text>
                      <View className="mt-2 gap-y-2">
                        {reviewResponse.similar_examples.map((example, index) => (
                          <View key={index} className="bg-muted rounded-md p-2">
                            <Text className="text-white">"{example}"</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-x-3 mb-4">
                  <TouchableOpacity
                    onPress={handleRetrain}
                    className="flex-1 bg-card border border-primary py-3 rounded-lg items-center"
                  >
                    <Text className="text-primary font-semibold">Retrain</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleComplete}
                    className="flex-1 bg-primary py-3 rounded-lg items-center"
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white font-semibold">Complete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          {!hideInput && (
            <View className="p-2 border-t border-gray-200 flex-row">
              <TextInput
                className="flex-1 text-black bg-gray-100 rounded-full px-4 py-2 mr-2"
                placeholderTextColor="#999"
                placeholder="Type your justification..."
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ maxHeight: 100 }}
                editable={!isSubmitting && !isReviewing}
              />
              <TouchableOpacity
                className={`rounded-full w-10 h-10 justify-center items-center ${
                  !message.trim() || isSubmitting || isReviewing ? 'bg-gray-400' : 'bg-primary'
                }`}
                onPress={handleSend}
                disabled={!message.trim() || isSubmitting || isReviewing}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold">→</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
