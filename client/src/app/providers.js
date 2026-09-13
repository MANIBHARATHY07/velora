import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { store } from '../store';
import { setUser } from '../store/slices/settingsSlice';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import { getCurrentUser } from '../shared/lib/catalyst';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AuthGate({ children }) {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        const userId = String(user.user_id || user.id || user.userId);
        const userEmail = user.email_id || user.email || '';
        dispatch(setUser({ userId, userEmail }));
        dispatch(fetchVehicles(userId));
        setAuthReady(true);
      })
      .catch((err) => {
        setAuthError(err.message || 'Authentication required');
      });
  }, [dispatch]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center p-8">
          <p className="text-textMuted mb-4">{authError}</p>
          <p className="text-sm text-textMuted">Please sign in via Zoho Catalyst to continue.</p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#262626', color: '#fafafa', border: '1px solid #2e2e2e' },
            }}
          />
        </AuthGate>
      </QueryClientProvider>
    </Provider>
  );
}
