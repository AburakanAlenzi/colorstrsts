'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <UserDashboard />
      </div>
    </AuthProvider>
  );
}
