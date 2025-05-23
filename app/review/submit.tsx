import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { submitReview } from '@/services/apis/task';

const SubmitReviewScreen = () => {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [correction, setCorrection] = useState('');
  const [justification, setJustification] = useState('');
  const [confidence, setConfidence] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validCorrections = ['Safe'];

  const router = useRouter();

  const handleSubmitReview = async () => {
    setError('');

    if (!taskId) {
      console.log('No taskId found.');
      const errorMessage = 'Task ID is missing.';
      setError(errorMessage);
      if (typeof window !== 'undefined') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
      return;
    }

    if (!validCorrections.includes(correction)) {
      console.log('Invalid correction choice:', correction);
      const errorMessage = 'The correction value is not valid.';
      setError(errorMessage);
      if (typeof window !== 'undefined') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Invalid Input', errorMessage);
      }
      return;
    }

    const data = {
      task_id: taskId,
      correction,
      justification,
      confidence,
    };

    setLoading(true);

    try {
      await submitReview(data);

      if (typeof window !== 'undefined') {
        window.alert('Review submitted successfully');
      } else {
        Alert.alert('Success', 'Review submitted successfully');
      }

      router.push('/review/completed');
    } catch (error: any) {
      if (error.errors) {
        console.error('Errors:', error.errors);
        const errorMessages = Object.values(error.errors).join('\n');
        setError(errorMessages);
        if (typeof window !== 'undefined') {
          window.alert(errorMessages);
        } else {
          Alert.alert('Error', errorMessages);
        }
      } else {
        console.error('Error response:', error);
        const errorMessage = error.message || 'Failed to submit review';
        setError(errorMessage);
        if (typeof window !== 'undefined') {
          window.alert(errorMessage);
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
      console.error('Error submitting review:', error);
      const errorMessage = 'There was an error submitting the review';
      setError(errorMessage);
      if (typeof window !== 'undefined') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/review/reviews');
    }
  };

  return (
    <SafeAreaView className="bg-background px-5" style={{ flex: 1, padding: 16 }}>
      <View className="flex-row items-center">
        <Pressable onPress={handleBackNavigation} className="ml-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </Pressable>
        <Text className="ml-3 flex-1 text-center text-2xl text-white font-semibold">
          {' '}
          Justify Review
        </Text>
      </View>

      {error ? (
        <View style={{ backgroundColor: 'red', padding: 10, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{error}</Text>
        </View>
      ) : null}
      <View className=" flex-1 mt-7 px-5">
        <TextInput
          style={{
            height: 40,
            color: '#FFF',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 16,
            paddingLeft: 8,
          }}
          placeholder="Enter correction"
          value={correction}
          onChangeText={setCorrection}
        />

        <TextInput
          style={{
            height: 40,
            color: '#FFF',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 16,
            paddingLeft: 8,
          }}
          placeholder="Enter justification"
          value={justification}
          onChangeText={setJustification}
        />

        <TextInput
          style={{
            height: 40,
            color: '#FFF',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 16,
            paddingLeft: 8,
          }}
          placeholder="Enter confidence (0-1)"
          value={confidence.toString()}
          onChangeText={text => setConfidence(Number(text))}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: '#F97316',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
          marginHorizontal: 10,
        }}
        onPress={handleSubmitReview}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SubmitReviewScreen;
