'use client';

import { Toaster as HotToaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
          borderRadius: '0.75rem',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },

        // Default options for specific types
        success: {
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#064e3b' : '#f0fdf4',
            color: theme === 'dark' ? '#6ee7b7' : '#166534',
            border: `1px solid ${theme === 'dark' ? '#059669' : '#bbf7d0'}`,
          },
          iconTheme: {
            primary: theme === 'dark' ? '#10b981' : '#22c55e',
            secondary: theme === 'dark' ? '#064e3b' : '#f0fdf4',
          },
        },

        error: {
          duration: 5000,
          style: {
            background: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
            color: theme === 'dark' ? '#fca5a5' : '#991b1b',
            border: `1px solid ${theme === 'dark' ? '#dc2626' : '#fecaca'}`,
          },
          iconTheme: {
            primary: theme === 'dark' ? '#ef4444' : '#dc2626',
            secondary: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
          },
        },

        loading: {
          duration: Infinity,
          style: {
            background: theme === 'dark' ? '#1e40af' : '#eff6ff',
            color: theme === 'dark' ? '#93c5fd' : '#1e40af',
            border: `1px solid ${theme === 'dark' ? '#3b82f6' : '#bfdbfe'}`,
          },
        },
      }}
    />
  );
}
