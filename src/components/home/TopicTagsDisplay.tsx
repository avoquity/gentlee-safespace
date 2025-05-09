
import React from 'react';

interface TopicTagsDisplayProps {
  topics: string[];
}

const TopicTagsDisplay = ({ topics }: TopicTagsDisplayProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center max-w-2xl mx-auto mt-3">
      {topics.map((topic) => (
        <button
          key={topic}
          className="px-6 py-2 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal text-sm font-poppins cursor-default"
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default TopicTagsDisplay;
