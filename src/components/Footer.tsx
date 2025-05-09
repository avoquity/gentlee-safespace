
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-8 bg-warm-beige border-t border-dark-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <nav className="flex items-center justify-center gap-8">
            <Link 
              to="/terms" 
              className="text-dark-accent/70 hover:text-dark-accent transition-colors duration-200 font-montserrat text-sm"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="text-dark-accent/70 hover:text-dark-accent transition-colors duration-200 font-montserrat text-sm"
            >
              Privacy
            </Link>
          </nav>
          
          <div className="flex items-center gap-2 text-dark-accent/60 font-montserrat text-sm">
            Made with <Heart className="w-4 h-4 text-dusty-rose" /> in Melbourne, Australia
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
