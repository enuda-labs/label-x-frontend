import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const CompletedReviewScreen = () => {
  const router = useRouter();

  const goBackHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView className="bg-background" style={styles.container}>
      <Text className="text-white" style={styles.title}>
        Review Submitted!
      </Text>
      <Text className="text-white" style={styles.message}>
        Your review has been successfully submitted. Thank you!
      </Text>

      <TouchableOpacity style={styles.button} onPress={goBackHome}>
        <Text className="text-white" style={styles.buttonText}>
          Go Back to Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F97316',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CompletedReviewScreen;
