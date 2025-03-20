
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Upgrade = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Stripe price IDs for different subscription plans
  const STRIPE_PRICE_IDS = {
    monthly: 'price_1PPfCLAuI2cUgKc4gi', // Placeholder - replace with your actual Stripe price ID
    yearly: 'price_1PPfCLAuI2cUgKc4gi'    // Placeholder - replace with your actual Stripe price ID
  };

  // Handle redirect to Stripe Checkout
  const handlePaymentRedirect = async (plan: 'monthly' | 'yearly') => {
    if (!user?.email) {
      toast({
        title: "You need to be logged in",
        description: "Please log in to upgrade your account",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      setIsLoading(true);
      
      // Call our Supabase Edge Function to create a Checkout session
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          priceId: plan === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly,
          userEmail: user.email,
          plan: plan
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was a problem setting up your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-ivory py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-charcoal mb-12 hover:text-muted-sage transition-colors">
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-deep-charcoal">
            Upgrade to Reflection
          </h1>
          <p className="mt-4 text-xl text-deep-charcoal/80 max-w-2xl mx-auto">
            Unlock unlimited conversations and deeper reflections
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-deep-charcoal/10 p-8 mb-8">
          <h2 className="text-2xl font-montserrat font-bold text-deep-charcoal mb-6">
            Reflection Plan
          </h2>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-muted-sage text-lg">✓</span>
              <span className="text-deep-charcoal">200 messages per month</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-sage text-lg">✓</span>
              <span className="text-deep-charcoal">Memory retention for 12 months</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-sage text-lg">✓</span>
              <span className="text-deep-charcoal">Voice activation (coming soon)</span>
            </li>
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handlePaymentRedirect('monthly')}
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-muted-sage text-white text-center font-medium hover:bg-muted-sage/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Subscribe Monthly - $18.88'}
            </button>
            <button
              onClick={() => handlePaymentRedirect('yearly')}
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-deep-charcoal text-white text-center font-medium hover:bg-deep-charcoal/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Subscribe Yearly - $188.88 (2 months free)'}
            </button>
          </div>
        </div>
        
        <div className="text-center text-sm text-deep-charcoal/60 max-w-2xl mx-auto">
          <p>
            All payments are securely processed through Stripe. Cancel anytime in your account settings.
          </p>
          <p className="mt-2">
            By upgrading, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
