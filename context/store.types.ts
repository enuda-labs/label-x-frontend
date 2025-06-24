export interface GlobalState {
  isLoggedIn: boolean;
  user: string | null;
  role: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: string | null) => void;
  setRole: (role: string | null) => void;
}
