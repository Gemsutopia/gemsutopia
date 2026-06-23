'use client';

import { useRouter } from 'next/navigation';
import AuthModal from '@/components/modals/AuthModal';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <AuthModal
      mode="sign-up"
      onClose={() => router.push('/')}
      redirectTo="/shop"
    />
  );
}
