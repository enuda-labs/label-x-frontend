import Admin from '@/components/role-screens/home/admin';
import Reviewer from '@/components/role-screens/home/reviewer';
import { useGlobalStore } from '@/context/store';
const HomeScreen = () => {
  const { role } = useGlobalStore();

  //console.log('user', role)
  if (role === 'admin') {
    return <Admin />;
  }

  return <Reviewer />;
};

export default HomeScreen;
