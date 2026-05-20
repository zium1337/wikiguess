import { createContext, useContext, useEffect, useState } from "react";
import type { LoginDto, RegisterDto, UserDto } from "../models/AuthModels";
import * as authApi from "../service/AuthService";

const TOKEN_STORAGE_KEY = "auth.token";
const USER_STORAGE_KEY = "auth.user";

type AuthContextType = {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw Error("Auth used outside provider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as UserDto);
        setToken(storedToken);
      } catch {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const persist = (nextToken: string, nextUser: UserDto) => {
    setToken(nextToken);
    setUser(nextUser);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const login = async (dto: LoginDto) => {
    const res = await authApi.login(dto);
    persist(res.token, res.user);
  };

  const register = async (dto: RegisterDto) => {
    const res = await authApi.register(dto);
    persist(res.token, res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: token !== null,
        isReady,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
