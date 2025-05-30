
import React from 'react';

interface TopicTagsDisplayProps {
  topics: string[];
}

const TopicTagsDisplay = ({ topics }: TopicTagsDisplayProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center max-w-4xl mx-auto mt-4 mb-0">
      {topics.map((topic) => (
        <button
          key={topic}
          className="px-6 py-2 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal text-base font-poppins cursor-default"
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default TopicTagsDisplay;
