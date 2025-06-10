
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WisdomLibrary as WisdomLibraryComponent } from '@/components/wisdom/WisdomLibrary';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const WisdomLibrary = () => {
  const { user, loading } = useAuth();
  const { wisdomLibrary, isLoading } = useFeatureFlags();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-warm-beige flex items-center justify-center">
        <div className="text-deep-charcoal/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!wisdomLibrary) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-warm-beige flex flex-col">
      <Header />
      
      <main className="flex-1 w-full mx-auto flex flex-col">
        <div className="pt-20 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
          <WisdomLibraryComponent />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WisdomLibrary;
