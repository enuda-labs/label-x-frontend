import Admin from '@/components/role-screens/home/admin';
import Reviewer from '@/components/role-screens/home/reviewer';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import { MemoryStorage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const { setIsLoggedIn, role } = useGlobalStore();

  if (role === 'admin') {
    return <Admin />;
  } else if (role === 'reviewer') {
    return <Reviewer />;
  }

  const handleLogout = async () => {
    const storage = new MemoryStorage();
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem('user');
    await storage.removeItem(ROLE);
    await storage.removeItem('2fa_enabled');
    setIsLoggedIn(false);
    router.replace('/auth/login');
  };

  // Default welcome screen for users without a role
  return (
    <View className="flex-1 p-4 bg-background">
      <View className="flex-1 items-center justify-center">
        <View className="w-24 h-24 bg-primary rounded-2xl mb-8 items-center justify-center">
          <Text className="text-4xl text-primary-foreground font-bold">Lx</Text>
        </View>
        <Text className="text-2xl font-bold text-center mb-4 text-foreground">
          Welcome to Label-X
        </Text>
        <Text className="text-center text-muted-foreground mb-6">
          Thank you for joining! Your account is currently pending role assignment.
        </Text>
        <View className="bg-card p-4 rounded-lg border border-border">
          <Text className="text-sm text-card-foreground text-center">
            Please wait while an administrator assigns you to a project. This usually takes 24-48
            hours.
          </Text>
        </View>
      </View>
      <View className="justify-center items-center ">
        <TouchableOpacity
          onPress={handleLogout}
          className="justify-center items-center py-3 bg-red-500 px-10 rounded-xl"
        >
          <Text className="text-white text-xl">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
