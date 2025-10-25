'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * This component acts as a redirector.
 * It fetches the current user's ID and redirects to their specific
 * dynamic profile page (e.g., /profile/user-uid).
 */
export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If we are done loading and have a user, redirect.
    if (!loading && user) {
      router.replace(`/profile/${user.uid}`);
    }
    
    // If done loading and there's NO user, they'll be sent
    // to the login page by the AuthProvider. We can just wait here.

  }, [user, loading, router]);

  // Display a loader while we wait for the user data and redirection.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
