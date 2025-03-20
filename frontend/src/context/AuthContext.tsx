// //src/copntext/AuthContext.tsx

// 'use client';
// import { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { auth } from '@/lib/firebase';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    const loadUserFromStorage = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);