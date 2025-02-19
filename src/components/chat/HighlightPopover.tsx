
import React from 'react';
import { Highlighter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface HighlightPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  position: { x: number; y: number };
  onHighlight: () => void;
}

export const HighlightPopover = ({
  isOpen,
  onOpenChange,
  selectedText,
  position,
  onHighlight
}: HighlightPopoverProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 50
      }}
    >
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="bg-white border-none shadow-lg hover:bg-soft-yellow transition-colors duration-200"
          >
            <Highlighter className="w-4 h-4 mr-2" />
            Highlight
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Selected text:</p>
            <p className="text-sm font-medium">{selectedText}</p>
            <div className="flex justify-end">
              <Button onClick={onHighlight} className="bg-soft-yellow hover:bg-soft-yellow/90 text-deep-charcoal">
                Add Highlight
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
