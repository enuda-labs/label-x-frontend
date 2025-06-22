export interface UserData {
  id: number;
  username: string;
  email: string;
  is_reviewer: boolean;
  is_admin: boolean;
  password?: string; // only store this if absolutely necessary
}

export interface GlobalState {
  isLoggedIn: boolean;
  user: UserData | null;
  role: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: UserData | null) => void;
  setRole: (role: string | null) => void;
}
