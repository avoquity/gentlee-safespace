
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-soft-ivory px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-deep-charcoal hover:text-muted-sage transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
        
        <h1 className="text-4xl font-bold text-deep-charcoal mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p>Content to be added...</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
