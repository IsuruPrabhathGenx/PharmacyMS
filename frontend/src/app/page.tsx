'use client';

import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard/pos');
    }
  }, [user, loading, router]);

  if (loading) {
    return null; // Or a loading spinner component
  }

  return <LoginForm />;
}