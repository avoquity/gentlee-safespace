
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        // Here we could verify the payment was successful with our backend
        // For now, we'll just assume it's successful if a session_id is present
        setStatus('success');
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-ivory p-4">
        <div className="w-16 h-16 border-4 border-muted-sage border-t-transparent rounded-full animate-spin mb-8"></div>
        <h1 className="text-2xl font-montserrat font-semibold text-deep-charcoal mb-2">
          Confirming your payment...
        </h1>
        <p className="text-deep-charcoal/60 text-center max-w-md">
          This should only take a moment.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-ivory p-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-8">
          <span className="text-red-500 text-3xl">×</span>
        </div>
        <h1 className="text-2xl font-montserrat font-semibold text-deep-charcoal mb-2">
          There was a problem
        </h1>
        <p className="text-deep-charcoal/60 text-center max-w-md mb-8">
          We couldn't confirm your payment. Please contact support if you believe this is an error.
        </p>
        <Link 
          to="/upgrade" 
          className="px-6 py-3 rounded-full bg-muted-sage text-white text-center font-medium hover:bg-muted-sage/90 transition-colors"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-soft-ivory p-4">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-8">
        <Check className="text-green-500" size={32} />
      </div>
      <h1 className="text-2xl md:text-3xl font-montserrat font-semibold text-deep-charcoal mb-2">
        Welcome to Reflection
      </h1>
      <p className="text-deep-charcoal/80 text-center max-w-md mb-8">
        Your payment was successful. You now have unlimited access to Gentlee's Reflection features.
      </p>
      <div className="space-y-4">
        <Link 
          to="/chat" 
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted-sage text-white text-center font-medium hover:bg-muted-sage/90 transition-colors w-full"
        >
          Start a conversation
          <ArrowRight size={16} />
        </Link>
        <Link 
          to="/" 
          className="flex items-center justify-center px-6 py-3 rounded-full bg-transparent border border-deep-charcoal/20 text-deep-charcoal text-center font-medium hover:bg-deep-charcoal/5 transition-colors w-full"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
