'use client';

import { useRouter } from 'next/navigation';
import AuthModal from '@/components/modals/AuthModal';

export default function SignInPage() {
  const router = useRouter();

  return (
    <AuthModal
      mode="sign-in"
      onClose={() => router.push('/')}
      redirectTo="/shop"
    />
  );
}
