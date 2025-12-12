'use client';

import { AdminProtectedRoute } from '@/components/auth';
import { AdminSidebar } from '@/components/admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="flex h-screen bg-gray-950">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}
