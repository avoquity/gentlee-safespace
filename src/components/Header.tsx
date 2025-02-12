
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link to="/" className="text-deep-charcoal font-montserrat font-bold text-2xl">
              Solura
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/wall-of-love" className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins">
              Wall of Love
            </Link>
            <Link to="/about" className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins">
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white transition-all duration-200 font-poppins">
              Sign In
            </button>
            <button className="px-6 py-2 rounded-full bg-deep-charcoal border-2 border-deep-charcoal text-white hover:bg-muted-sage hover:border-muted-sage transition-all duration-200 font-poppins">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
