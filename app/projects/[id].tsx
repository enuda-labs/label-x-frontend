import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { Dispatch, FC, useEffect, useState } from 'react';
import { AxiosClient } from '@/utils/axios';
import { useLocalSearchParams } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStaticNavigation, NavigationIndependentTree } from '@react-navigation/native';
import { isAxiosError } from 'axios';

interface Response {
  status: string;
  users: User[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

const ProjectDetails = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingInactiveUsers, setIsLoadingInactiveUsers] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { name } = useLocalSearchParams<{ name: string }>();

  useEffect(() => {
    const getInactiveUsers = async () => {
      try {
        const axiosClient = new AxiosClient();
        const response = await axiosClient.get<Response>(
          `account/users/not-in-project/?project_id=${id}`
        );
        if (response.status === 200) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingInactiveUsers(false);
      }
    };
    const getActiveUsers = async () => {
      try {
        const axiosClient = new AxiosClient();
        const response = await axiosClient.get<Response>(`account/users/in-project/${id}/`);
        if (response.status === 200) {
          setActiveUsers(response.data.users);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    getActiveUsers();
    getInactiveUsers();
  }, [id]);

  const ActiveUsers = () => (
    <FlatList
      data={activeUsers}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center">
          {isLoadingUsers ? (
            <ActivityIndicator size="large" color="#F97316" />
          ) : (
            <Text className="text-white">No reviewers have been added to this project</Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <ActiveUser item={item} setUsers={setUsers} setActiveUsers={setActiveUsers} />
      )}
      className="bg-background flex-1"
    />
  );

  const InactiveUsers = () => (
    <FlatList
      data={users}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center">
          {isLoadingInactiveUsers ? (
            <ActivityIndicator size="large" color="#F97316" />
          ) : (
            <Text className="text-white">No users available</Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <InactiveUser item={item} setUsers={setUsers} setActiveUsers={setActiveUsers} />
      )}
      className="bg-background flex-1"
    />
  );

  const Tab = createMaterialTopTabNavigator({
    screens: {
      'Active Reviewers': ActiveUsers,
      'Inactive Users': InactiveUsers,
    },
    screenOptions: {
      tabBarStyle: {
        backgroundColor: 'bg-primary',
      },
      tabBarIndicatorStyle: {
        backgroundColor: '#F97316',
      },
      tabBarLabelStyle: {
        color: '#FFF',
      },
    },
  });

  const Navigation = createStaticNavigation(Tab);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-white font-semibold mb-10 text-2xl px-4 pt-4">
        Project Details - {name}
      </Text>
      <NavigationIndependentTree>
        <Navigation />
      </NavigationIndependentTree>
    </SafeAreaView>
  );
};

export default ProjectDetails;

const ActiveUser: FC<{
  item: User;
  setUsers: Dispatch<React.SetStateAction<User[]>>;
  setActiveUsers: Dispatch<React.SetStateAction<User[]>>;
}> = ({ item, setUsers, setActiveUsers }) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isAdding, setIsAdding] = useState(false);

  const handleRemoveReviewer = async () => {
    try {
      setIsAdding(true);
      const axiosClient = new AxiosClient();
      const response = await axiosClient.post(`account/remove-reviewer/`, {
        user_id: item.id,
        group_id: id,
      });
      if (response.status === 200) {
        setUsers(prev => [...prev, item]);
        setActiveUsers(prev => prev.filter(user => user.id !== item.id));
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        return;
      }
      console.log(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="mb-6 mx-2 flex-row items-center justify-between bg-gray-800 p-4 rounded-lg">
      <View>
        <Text className="text-white font-bold text-lg">{item.username}</Text>
        <Text className="text-gray-400 text-sm">{item.email}</Text>
      </View>
      {isAdding ? (
        <ActivityIndicator color="#F97316" />
      ) : (
        <TouchableOpacity onPress={handleRemoveReviewer}>
          <Text className="text-orange-500 font-semibold">Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const InactiveUser: FC<{
  item: User;
  setUsers: Dispatch<React.SetStateAction<User[]>>;
  setActiveUsers: Dispatch<React.SetStateAction<User[]>>;
}> = ({ item, setUsers, setActiveUsers }) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddReviewer = async () => {
    try {
      setIsAdding(true);
      const axiosClient = new AxiosClient();
      const response = await axiosClient.post(`account/make-reviewer/`, {
        user_id: item.id,
        group_id: id,
      });
      if (response.status === 200) {
        setUsers(prev => prev.filter(user => user.id !== item.id));
        setActiveUsers(prev => [...prev, item]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        return;
      }
      console.log(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="mb-6 mx-2 flex-row items-center justify-between bg-gray-800 p-4 rounded-lg">
      <View>
        <Text className="text-white font-bold text-lg">{item.username}</Text>
        <Text className="text-gray-400 text-sm">{item.email}</Text>
      </View>
      {isAdding ? (
        <ActivityIndicator color="#F97316" />
      ) : (
        <TouchableOpacity onPress={handleAddReviewer}>
          <Text className="text-orange-500 font-semibold">Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
