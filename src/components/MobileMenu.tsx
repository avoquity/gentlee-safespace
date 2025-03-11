
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  renderNavLinks: () => React.ReactNode;
  renderAuthButtons: () => React.ReactNode;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  renderNavLinks,
  renderAuthButtons
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/" 
              className="text-deep-charcoal font-montserrat font-bold text-xl"
              onClick={onClose}
            >
              Gentlee
            </Link>
            <button 
              onClick={onClose}
              className="p-2 text-deep-charcoal hover:text-muted-sage focus:outline-none"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex flex-col space-y-6 mb-8">
            {renderNavLinks()}
          </nav>
          
          <div className="flex flex-col space-y-4 mt-auto">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
