
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { MusicProvider } from '@/contexts/MusicContext';
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

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MusicProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </MusicProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
