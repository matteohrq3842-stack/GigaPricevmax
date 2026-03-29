'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/price-panel');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C15] text-white">
      <p>Redirection vers l&apos;administration...</p>
    </div>
  );
}

