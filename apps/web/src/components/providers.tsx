'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/session-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-lg',
          duration: 4000,
        }}
      />
      <SessionProvider>
        {children}
      </SessionProvider>
    </Provider>
  );
}
