'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  // Determine if we need to redirect (computed, not state)
  const shouldRedirect = !isLoading && !user;

  useEffect(() => {
    if (shouldRedirect && !hasRedirected.current) {
      hasRedirected.current = true;
      // Store the intended destination to redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [shouldRedirect, router, pathname]);

  // Show loading spinner while checking auth or if we need to redirect
  if (isLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {shouldRedirect ? 'Redirecting to login...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
