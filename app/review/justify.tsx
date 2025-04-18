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
  SafeAreaView
} from 'react-native';
import { ReviewTask } from '@/components/types/review-task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';


  interface ReviewScreenProps {
    isLoading?: boolean;
    onSubmitReview?: (taskId: string, review: string, finalLabel: string) => void;
    fetchTask?: (taskId: string) => Promise<ReviewTask>;
  }
  
  export default function ReviewScreen({ 
    isLoading: initialLoading = false,
    onSubmitReview,
    fetchTask
  }: ReviewScreenProps) {
    const [message, setMessage] = useState('');
    const [finalLabel, setFinalLabel] = useState('rejected');
    const [messages, setMessages] = useState<Array<{type: 'ai' | 'human', text: string}>>([]);
    const [task, setTask] = useState<ReviewTask | null>(null);
    const [isLoading, setIsLoading] = useState(initialLoading);
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();
    
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    
    // Fetch task data on component mount
    useEffect(() => {
      const loadTask = async () => {
        if (!taskId) return;
        
        setIsLoading(true);
        try {
          // If fetchTask prop exists, use it to get task data
          if (fetchTask) {
            const taskData = await fetchTask(taskId);
            setTask(taskData);
            
            // Set initial message and label
            setFinalLabel(taskData.ai_classification);
            setMessages([{
              type: 'ai',
              text: `AI Classification: ${taskData.ai_classification}\nConfidence: ${taskData.confidence * 100}%\n\nJustification: This content was classified based on natural language processing algorithms and trained patterns.`
            }]);
          } 
         
          else {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockTask: ReviewTask = {
              id: taskId,
              serial_no: `REV-${taskId.slice(0, 6)}`,
              text: "This is sample content that needs to be reviewed. The AI has made an initial classification that should be reviewed by a human.",
              ai_classification: "approved",
              confidence: 0.87,
              human_reviewed: "",
              final_label: "rejected",
              priority: "medium",
              created_at: new Date().toISOString(),
              processing_status: "pending",
              assigned_to: 'name'
            };
            
            setTask(mockTask);
            
            // Set initial message and label
            setFinalLabel(mockTask.ai_classification);
            setMessages([{
              type: 'ai',
              text: `AI Classification: ${mockTask.ai_classification}\nConfidence: ${mockTask.confidence * 100}%\n\nJustification: This content was classified based on natural language processing algorithms and trained patterns.`
            }]);
          }
        } catch (error) {
          console.error('Error fetching task:', error);
          // Add error message to UI
          setMessages([{
            type: 'ai',
            text: 'Error loading task. Please try again.'
          }]);
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
  
    const handleSend = () => {
      if (!message.trim() || !task) return;
      
      // human message
      setMessages(prev => [...prev, { type: 'human', text: message }]);
      
     
      if (onSubmitReview) {
        try {
          onSubmitReview(task.id, message, finalLabel);
        } catch (error) {
          console.error('Error in onSubmitReview:', error);
        }
      } else {
        // Dummy implementation 
        console.log('Review submitted:', {
          taskId: task.id,
          review: message,
          finalLabel
        });
      }
      
      setMessage('');
      
      //api response here
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: 'Thank you for your review. Your feedback has been recorded.'
        }]);
        setIsLoading(false);
      }, 1000);
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
            <Text className="text-lg text-center text-white">No review task available with ID: {taskId}</Text>
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
            <ScrollView className="max-h-32 bg-card text-white p-3 rounded-md ">
              <Text className='text-white'>{task.text}</Text>
            </ScrollView>
          </View>
          
          <View className="px-6">
            <Text className='text-primary font-semibold'>Justify Review</Text>
          </View>
          
          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {messages.map((msg, index) => (
              <View 
                key={index} 
                className={`mb-4 p-3 rounded-lg max-w-5/6 ${
                  msg.type === 'ai' ? 'bg-card self-start' : 'bg-primary self-end'
                }`}
                style={msg.type === 'human' ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }}
              >
                <Text className={ 'text-white' }>
                  {msg.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View className="self-start bg-gray-100 p-3 rounded-lg">
                <ActivityIndicator size="small" color="#F97316" />
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }