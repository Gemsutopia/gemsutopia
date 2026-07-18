'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import DashboardLayout from '@/components/user-dashboard/DashboardLayout';
import { useBetterAuth } from '@/contexts/BetterAuthContext';

export default function Dashboard() {
  const { user, isLoading: loading } = useBetterAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Header />
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white" />
          <p className="mt-3 text-sm text-white/45">Loading your account…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <DashboardLayout />
    </>
  );
}
