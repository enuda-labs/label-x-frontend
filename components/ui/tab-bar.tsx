import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';

interface TabBarRole {
  isAdmin?: boolean;
}

const TabBar = ({ isAdmin = false }: TabBarRole) => {
  const router = useRouter();
  const pathname = usePathname();

  const getTabs = () => {
    const baseTabs = [
      {
        name: 'Home',
        icon: 'home',
        path: '/',
      },
      {
        name: 'Reviews',
        icon: 'briefcase',
        path: '/(tabs)/reviews',
      },
    ];

    if (isAdmin) {
      baseTabs.push({
        name: 'Assign',
        icon: 'plus-circle',
        path: '/(tabs)/Assign',
      });
    } else {
      baseTabs.push({
        name: 'Pending',
        icon: 'alert-circle',
        path: '/(tabs)/pending',
      });
    }

    baseTabs.push({
      name: 'Account',
      icon: 'user',
      path: '/(tabs)/account',
    });

    return baseTabs;
  };

  const tabs = getTabs();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && path.endsWith(pathname)) return true;
    return false;
  };

  return (
    <View className="flex-row justify-between items-center border-t border-gray-200 bg-background pt-2">
      {tabs.map(tab => {
        const active = isActive(tab.path);
        return (
          <TouchableOpacity
            key={tab.name}
            className="flex-1 pt-2 pb-7 items-center"
            onPress={() => router.push(tab.path as any)}
          >
            <Feather name={tab.icon as any} size={24} color={active ? '#F97316' : '#6B7280'} />
            <Text
              className={cn('text-sm mt-1', active ? 'text-primary font-medium' : 'text-gray-500')}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;
