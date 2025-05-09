
import React from 'react';
import { Link } from 'react-router-dom';

const UpgradeLink = () => {
  return (
    <div className="w-full text-center mb-4">
      <Link to="/upgrade" className="text-muted-sage hover:underline text-sm">
        Upgrade to Reflection plan
      </Link>
    </div>
  );
};

export default UpgradeLink;
