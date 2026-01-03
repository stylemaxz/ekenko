import { Suspense } from 'react';
import SaleCustomersClient from './client';

export const metadata = {
  title: 'Customers | Ekenko Sale Tracker',
  description: 'Manage your customer base and sales activities',
};

export default function SaleCustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SaleCustomersClient />
    </Suspense>
  );
}
