
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CloudRain, Cloud, CloudSun, Sun } from 'lucide-react';
import { CheckInState, MoodValue, MoodOption } from '@/types/checkIn';

interface CheckInModalProps {
  isOpen: boolean;
  currentStep: 'mood' | 'optin' | 'success';
  onMoodSubmit: (value: number) => void;
  onOptIn: (optedIn: boolean) => void;
  onDismiss: () => void;
  onComplete: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  currentStep,
  onMoodSubmit,
  onOptIn,
  onDismiss,
  onComplete
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodValue>(0);
  
  const moodOptions: MoodOption[] = [
    { value: -2, icon: <CloudRain className="w-6 h-6 text-gray-500" />, label: "Much heavier" },
    { value: -1, icon: <CloudRain className="w-6 h-6 text-gray-400" strokeWidth={1.5} />, label: "Heavier" },
    { value: 0, icon: <Cloud className="w-6 h-6 text-gray-400" />, label: "Same" },
    { value: 1, icon: <CloudSun className="w-6 h-6 text-amber-300" />, label: "Lighter" },
    { value: 2, icon: <Sun className="w-6 h-6 text-amber-400" />, label: "Much lighter" },
  ];

  const handleSliderChange = (value: number[]) => {
    setSelectedMood(value[0] as MoodValue);
  };

  const renderMoodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-playfair mb-2">Just wondering—has this little chat lightened things a bit?</h3>
        <p className="text-sm text-muted-foreground">How are you feeling comparing to moments ago?</p>
      </div>
      
      <div className="py-4">
        <Slider 
          defaultValue={[0]} 
          max={2} 
          min={-2} 
          step={1} 
          onValueChange={handleSliderChange}
          className="my-8"
        />
        
        <div className="flex justify-between px-1 mt-1">
          {moodOptions.map((option) => (
            <div key={option.value} className="flex flex-col items-center">
              <div className={`p-1 rounded-full ${selectedMood === option.value ? 'bg-muted' : ''}`}>
                {option.icon}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">{option.value === -2 || option.value === 2 ? option.label : ''}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-6">
          <span>Heavier</span>
          <span>Lighter</span>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={() => onMoodSubmit(selectedMood)}
          className="px-8"
        >
          Share
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Why we ask this? Our mission is to help people feel better when they need it most and we want to make sure we get better in every try.
        </p>
      </div>
    </div>
  );

  const renderOptInStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center py-4">
        <div className="animate-bounce text-4xl">🌱</div>
      </div>
      
      <div>
        <h3 className="text-xl font-playfair mb-4">Thank you for sharing. Would an occasional gentle note feel nice?</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button onClick={() => onOptIn(true)} className="w-full">
          Yes, little notes are welcome
        </Button>
        <button 
          onClick={() => onOptIn(false)} 
          className="text-sm text-muted-foreground hover:underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <div className="animate-fade-in text-4xl">✨</div>
      </div>
      
      <div>
        <h3 className="text-xl font-playfair mb-2">You're all set.</h3>
        <p className="text-muted-foreground">We'll check in soon!</p>
      </div>
      
      <Button onClick={onComplete} className="px-8">
        Close
      </Button>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-[340px] p-6 rounded-2xl shadow-md bg-warm-beige border-none">
        {currentStep === 'mood' && renderMoodStep()}
        {currentStep === 'optin' && renderOptInStep()}
        {currentStep === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
};
