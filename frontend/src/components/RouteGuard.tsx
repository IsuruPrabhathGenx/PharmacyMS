// src/components/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Define which routes are accessible to which roles
const roleRoutes = {
  staff: ['/dashboard', '/dashboard/inventory', '/dashboard/pos'],
  admin: [
    '/dashboard',
    '/dashboard/inventory',
    '/dashboard/pos',
    '/dashboard/customers',
    '/dashboard/doctor-fees',
    '/dashboard/laboratory-tests',
    '/dashboard/bank-accounts',
    '/dashboard/suppliers',
    '/dashboard/purchases',
    '/dashboard/reports',
    '/dashboard/doctorFeeViewSales',
    '/dashboard/labTestViewSales',
    '/dashboard/viewSales',
    '/dashboard/allSales'
  ]
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/');
      } else {
        // Check if user has access to current route
        const allowedRoutes = roleRoutes[user.role] || [];
        const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
        
        if (!hasAccess) {
          // Redirect to dashboard if user doesn't have access
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  // Show nothing while checking auth
  if (loading) {
    return null;
  }

  // Show children only if user has access
  if (!user) {
    return null;
  }

  const allowedRoutes = roleRoutes[user.role] || [];
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

  return hasAccess ? <>{children}</> : null;
}