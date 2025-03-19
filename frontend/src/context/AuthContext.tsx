// src/context/AuthContext.tsx
// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { auth } from '../lib/firebase';
// import { User } from 'firebase/auth';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setUser(user);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { User } from 'firebase/auth';
// import { auth, db } from '../lib/firebase';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { ExtendedUser, UserPermissions, UserRole } from '@/types/user';

// interface AuthContextType {
//   user: User | null;
//   userDetails: ExtendedUser | null;
//   loading: boolean;
//   hasPermission: (permission: keyof UserPermissions) => boolean;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   userDetails: null,
//   loading: true,
//   hasPermission: () => false,
// });

// const DEFAULT_PERMISSIONS: UserPermissions = {
//   canManageUsers: false,
//   canManageInventory: false,
//   canManageServices: false,
//   canManageSales: true,
//   canViewReports: false,
//   canManageAppointments: true,
//   canManageBridal: true,
//   canManageRentals: true,
// };

// const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
//   admin: {
//     canManageUsers: true,
//     canManageInventory: true,
//     canManageServices: true,
//     canManageSales: true,
//     canViewReports: true,
//     canManageAppointments: true,
//     canManageBridal: true,
//     canManageRentals: true,
//   },
//   manager: {
//     canManageUsers: false,
//     canManageInventory: true,
//     canManageServices: true,
//     canManageSales: true,
//     canViewReports: true,
//     canManageAppointments: true,
//     canManageBridal: true,
//     canManageRentals: true,
//   },
//   staff: {
//     ...DEFAULT_PERMISSIONS,
//   },
// };

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [userDetails, setUserDetails] = useState<ExtendedUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       setUser(user);
      
//       if (user) {
//         const userDoc = await getDoc(doc(db, 'users', user.uid));
//         if (userDoc.exists()) {
//           setUserDetails(userDoc.data() as ExtendedUser);
//         }
//       } else {
//         setUserDetails(null);
//       }
      
//       setLoading(false);
//     });
    
//     return unsubscribe;
//   }, []);

//   const hasPermission = (permission: keyof UserPermissions): boolean => {
//     if (!userDetails) return false;
//     return userDetails.permissions[permission];
//   };

//   return (
//     <AuthContext.Provider value={{ user, userDetails, loading, hasPermission }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// //src/context/AuthContext.tsx
// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// import { auth, db } from '@/lib/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { AuthUser, UserRole } from '@/types/user';

// interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   signOut: async () => {},
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           // Fetch user role from Firestore
//           const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
//           const userData = userDoc.data();
          
//           setUser({
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             role: (userData?.role as UserRole) || 'staff' // Default to staff if role not set
//           });
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//           setUser(null);
//         }
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       setUser(null);
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);


// // src/context/AuthContext.tsx
// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// import { auth, db } from '@/lib/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { AuthUser, UserRole } from '@/types/user';

// interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   signOut: async () => {},
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
    
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
//           const userData = userDoc.data();
          
//           setUser({
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             role: (userData?.role as UserRole) || 'staff'
//           });
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//           setUser(null);
//         }
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       setUser(null);
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   if (!mounted) {
//     return null;
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
