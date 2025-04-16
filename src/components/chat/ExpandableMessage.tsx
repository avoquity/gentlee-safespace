
import React, { useState } from 'react';

interface ExpandableMessageProps {
  text: string;
  maxLength?: number;
}

export const ExpandableMessage: React.FC<ExpandableMessageProps> = ({ 
  text, 
  maxLength = 280 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  
  if (!shouldTruncate) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  return (
    <div className="whitespace-pre-wrap">
      {isExpanded ? text : `${text.substring(0, maxLength)}`}
      {shouldTruncate && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-1 text-muted-sage hover:underline focus:outline-none"
        >
          … View more
        </button>
      )}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="block mt-2 text-muted-sage hover:underline focus:outline-none"
        >
          Show less
        </button>
      )}
    </div>
  );
};
