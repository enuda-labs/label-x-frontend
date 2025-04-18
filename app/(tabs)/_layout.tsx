import { Tabs } from 'expo-router';
import TabBar from '@/components/ui/tab-bar';
import { useGlobalStore } from '@/context/store';
import { AuthGate } from '@/components/auth/auth-guard';

export default function TabsLayout() {
  const { role } = useGlobalStore();
  const isAdmin = role === 'admin';

  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={props => <TabBar {...props} isAdmin={isAdmin} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="reviews" />
        {isAdmin ? <Tabs.Screen name="Assign" /> : <Tabs.Screen name="pending" />}
        <Tabs.Screen name="history" />
      </Tabs>
    </AuthGate>
  );
}
