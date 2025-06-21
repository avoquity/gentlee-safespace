
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileChatInput } from './MobileChatInput';
import { DesktopChatInput } from './DesktopChatInput';
import { JournalModal } from '../JournalModal';
import { UpgradePrompt } from '../UpgradePrompt';

interface ChatInputContainerProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messageCount?: number;
  weeklyLimit?: number;
  onJournalClick?: () => void;
}

export const ChatInputContainer = ({
  input,
  setInput,
  handleSubmit,
  messageCount = 0,
  weeklyLimit = 10,
  onJournalClick = () => {},
}: ChatInputContainerProps) => {
  const isMobile = useIsMobile();
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const hasReachedLimit = messageCount >= weeklyLimit;

  // Handle journal modal interactions
  const handleModalSend = (text: string, isSavedAsLetter: boolean) => {
    setInput(text);
    setIsJournalModalOpen(false);
    
    // Create a synthetic form submit event and immediately submit
    const formEvent = new Event('submit', { cancelable: true, bubbles: true }) as unknown as React.FormEvent;
    handleSubmit(formEvent);
  };

  const handleModalCancel = (text: string) => {
    // Transfer text from modal to the main input field without submitting
    setInput("");
    setIsJournalModalOpen(false);
  };

  // Only allow dismissing if not at the limit
  const handleDismissUpgradePrompt = () => {
    if (!hasReachedLimit) {
      setShowUpgradePrompt(false);
    }
  };

  // Reset prompt visibility when the message count changes to be at the limit
  React.useEffect(() => {
    if (hasReachedLimit) {
      // Always show the prompt when at the limit
      setShowUpgradePrompt(true);
    }
  }, [hasReachedLimit]);

  // Only show upgrade prompt when approaching/at limit AND we allow showing it
  // Always show it when at the limit, regardless of the state
  const shouldShowUpgradePrompt = 
    (showUpgradePrompt && messageCount === weeklyLimit - 1) || // Approaching limit and not dismissed
    hasReachedLimit; // At limit, always show regardless of dismiss state

  return (
    <div className="relative w-full flex flex-col gap-0">
      {isMobile ? (
        <MobileChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          hasReachedLimit={hasReachedLimit}
          openJournalModal={() => setIsJournalModalOpen(true)}
          shouldShowUpgradePrompt={shouldShowUpgradePrompt}
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          handleDismissUpgradePrompt={handleDismissUpgradePrompt}
          onVoiceModeClick={() => {}} // No-op since we have sticky button
        />
      ) : (
        <DesktopChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          hasReachedLimit={hasReachedLimit}
          openJournalModal={() => setIsJournalModalOpen(true)}
          shouldShowUpgradePrompt={shouldShowUpgradePrompt}
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          handleDismissUpgradePrompt={handleDismissUpgradePrompt}
          onVoiceModeClick={() => {}} // No-op since we have sticky button
        />
      )}
      
      <JournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSend={handleModalSend}
        onCancel={handleModalCancel}
        initialText={input}
      />
    </div>
  );
};
