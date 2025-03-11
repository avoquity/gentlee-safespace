
import React from 'react';
import { Link } from 'react-router-dom';

interface DesktopHeaderProps {
  renderNavLinks: () => React.ReactNode;
  renderAuthButtons: () => React.ReactNode;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  renderNavLinks,
  renderAuthButtons
}) => {
  return (
    <>
      <Link to="/" className="text-deep-charcoal font-montserrat font-bold text-2xl">
        Gentlee
      </Link>
      
      <nav className="flex items-center space-x-10">
        {renderNavLinks()}
      </nav>
      
      <div className="flex items-center space-x-4">
        {renderAuthButtons()}
      </div>
    </>
  );
};

export default DesktopHeader;
