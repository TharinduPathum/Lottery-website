import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  walletBalance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean; 
  loginUser: (userData: User, token: string) => void;
  logoutUser: () => void;
  updateBalance: (newBalance: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const storedUser = localStorage.getItem("lottery_user");
    const storedToken = localStorage.getItem("lottery_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    setLoading(false); 
  }, []);

  const loginUser = (userData: User, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("lottery_user", JSON.stringify(userData));
    localStorage.setItem("lottery_token", jwtToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("lottery_user");
    localStorage.removeItem("lottery_token");
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("lottery_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};