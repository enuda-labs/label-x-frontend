import React from 'react';
import { View } from 'react-native';

const LoaderCard = () => {
  return (
    <View className="bg-card border border-card/10 p-4 rounded-lg mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <View className="h-4 w-24 bg-gray-700 rounded mb-2" />
          <View className="h-3 w-32 bg-gray-700 rounded" />
        </View>
        <View className="flex-row items-center">
          <View className="h-4 w-16 bg-gray-700 rounded" />
        </View>
      </View>
      <View className="flex-row flex-wrap">
        <View className="h-3 w-20 bg-gray-700 rounded mr-4 mb-2" />
        <View className="h-3 w-28 bg-gray-700 rounded mr-4 mb-2" />
        <View className="h-3 w-24 bg-gray-700 rounded mr-4 mb-2" />
        <View className="h-3 w-32 bg-gray-700 rounded mr-4 mb-2" />
      </View>
    </View>
  );
};

export default LoaderCard;
