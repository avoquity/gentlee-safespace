
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileMenu from '../MobileMenu';
import UserAvatar from '@/components/UserAvatar';

interface MobileHeaderProps {
  user: any;
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renderNavLinks: () => React.ReactNode;
  renderAuthButtons: () => React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  toggleMobileMenu,
  mobileMenuOpen,
  setMobileMenuOpen,
  renderNavLinks,
  renderAuthButtons
}) => {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="p-2 text-deep-charcoal focus:outline-none"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>
      
      <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 text-deep-charcoal font-montserrat font-bold text-xl">
        Gentlee
      </Link>
      
      <div className="flex items-center">
        {user ? (
          <Link to="/profile">
            <UserAvatar size="sm" />
          </Link>
        ) : (
          <Button
            onClick={() => navigate('/auth', { state: { tab: 'signin' } })}
            variant="outline"
            className="px-4 py-1.5 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white text-sm"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        renderNavLinks={renderNavLinks}
        renderAuthButtons={renderAuthButtons}
      />
    </>
  );
};

export default MobileHeader;
