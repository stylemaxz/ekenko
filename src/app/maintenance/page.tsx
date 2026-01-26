"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MaintenancePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/maintenance/dashboard');
  }, [router]);
  
  return null;
}
