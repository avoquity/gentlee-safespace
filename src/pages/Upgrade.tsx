
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Upgrade = () => {
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
            <Link 
              to="#" 
              className="px-6 py-3 rounded-full bg-muted-sage text-white text-center font-medium hover:bg-muted-sage/90 transition-colors"
            >
              Subscribe Monthly - $18.88
            </Link>
            <Link
              to="#"
              className="px-6 py-3 rounded-full bg-deep-charcoal text-white text-center font-medium hover:bg-deep-charcoal/90 transition-colors"
            >
              Subscribe Yearly - $188.88 (2 months free)
            </Link>
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
