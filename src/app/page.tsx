
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // For now, we redirect to login.
    // In a real app, you'd check for an auth token here.
    router.replace('/login');
  }, [router]);

  // You can add a loading spinner here while the redirect happens
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <p>Loading...</p>
    </div>
  );
}
