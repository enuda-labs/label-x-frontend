
//import { useAuthStore } from "@/lib/store/auth-store"
//import StudentHomeScreen from "@/components/role-screens/home/student"
import Admin from "@/components/role-screens/home/admin"
import Reviewer from "@/components/role-screens/home/reviewer"
import { useAuth } from "@/utils/user/get-user";

const HomeScreen = () => {
    const { userRole } = useAuth();

console.log('user', userRole)
  // Render different home screens based on user type
  if (userRole === "admin") {
    return <Admin />
  }

  // Default to student/user home screen
  return <Reviewer />
}

export default HomeScreen

