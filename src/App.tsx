
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from '@/pages/Chat';
import Auth from '@/pages/Auth';
import Entries from '@/pages/Entries';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Upgrade from './pages/Upgrade';
import PaymentSuccess from './pages/PaymentSuccess';
import Profile from './pages/Profile';
import { Suspense, lazy, useEffect } from 'react';

// Create a new QueryClient instance with robust error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      // The onError callback has been moved to the meta object as per latest React Query v5
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error);
        }
      }
    },
  },
});

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="opacity-50">Loading...</div>
  </div>
);

function App() {
  // Log when App component mounts
  useEffect(() => {
    console.log('App component mounted');
    return () => console.log('App component unmounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat/:chatId?" element={<Chat />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
