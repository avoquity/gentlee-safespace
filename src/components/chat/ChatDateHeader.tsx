
import React from 'react';
import { format } from 'date-fns';
import { ChatThemes } from './ChatThemes';
import { Message } from '@/types/chat';
import { identifyThemes } from '@/utils/themeUtils';

interface ChatDateHeaderProps {
  currentDate: Date;
  messages: Message[];
}

export const ChatDateHeader = ({ currentDate, messages }: ChatDateHeaderProps) => {
  return (
    <div className="mb-10">
      <h1 className="text-[68px] font-bold text-deep-charcoal leading-none">
        {format(currentDate, 'd MMMM yyyy')}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <ChatThemes 
          themes={identifyThemes(messages)} 
          hasMessages={messages.length > 0} 
        />
      </div>
    </div>
  );
};
