
import React from 'react';

interface ModalHeaderProps {
  isSheet: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ isSheet }) => {
  return (
    <>
      {isSheet && (
        <div
          className="mx-auto my-2 w-12 h-[5px] rounded-full bg-deep-charcoal/10"
          aria-hidden="true"
        ></div>
      )}

      <div className={`flex justify-end mb-2 px-6`}>
        {/* X button has been removed as requested */}
      </div>
    </>
  );
};
