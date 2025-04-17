import { Tabs } from "expo-router"
import TabBar from "@/components/ui/tab-bar"
import { useAuth } from "@/utils/user/get-user";


export default function TabsLayout() {
//   const { user } = useAuthStore()
const { userRole } = useAuth();

const isAdmin = userRole === "admin"

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} isAdmin={isAdmin} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="reviews" />
      {isAdmin ? <Tabs.Screen name="Assign" /> : <Tabs.Screen name="pending" />}
      <Tabs.Screen name="account" />
    </Tabs>
  )
}

