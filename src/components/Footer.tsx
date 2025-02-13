
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-8 bg-soft-ivory border-t border-deep-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <nav className="flex items-center justify-center gap-8">
            <Link 
              to="/terms" 
              className="text-deep-charcoal/70 hover:text-deep-charcoal transition-colors duration-200 font-poppins text-sm"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="text-deep-charcoal/70 hover:text-deep-charcoal transition-colors duration-200 font-poppins text-sm"
            >
              Privacy
            </Link>
          </nav>
          
          <div className="flex items-center gap-2 text-deep-charcoal/60 font-poppins text-sm">
            Made with <Heart className="w-4 h-4 text-dusty-rose" /> from Melbourne, Australia
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
