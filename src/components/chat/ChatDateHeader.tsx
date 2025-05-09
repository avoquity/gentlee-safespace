
import React from 'react';
import { format } from 'date-fns';
import { ChatThemes } from './ChatThemes';
import { Message } from '@/types/chat';
import { identifyThemes } from '@/utils/themeUtils';

interface ChatDateHeaderProps {
  createdAt: string;
  messages: Message[];
}

export const ChatDateHeader = ({ createdAt, messages }: ChatDateHeaderProps) => {
  return (
    <div className="mb-10">
      <h1 className="text-[68px] font-montserrat font-bold text-deep-charcoal leading-none">
        {format(new Date(createdAt), 'd MMMM yyyy')}
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
