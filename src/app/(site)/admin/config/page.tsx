'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminConfigRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/price-panel?tab=settings');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C15] text-white">
      <p>Redirection vers le panneau de configuration...</p>
    </div>
  );
}

