import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LungSound } from '../../data';

interface CustomSimileInputProps {
  audioName: string;
  onSimileAdded: (newSimile: LungSound['similes'][0]) => void;
}

export function CustomSimileInput({ audioName, onSimileAdded }: CustomSimileInputProps) {
  const [customSimileText, setCustomSimileText] = useState('');
  const [hasAddedCustomSimile, setHasAddedCustomSimile] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleAddSimile = async () => {
    if (!customSimileText.trim() || isQuerying || hasAddedCustomSimile) return;

    setIsQuerying(true);

    try {
      // Simulate backend call (keeping the fetch logic as requested)
      await fetch('http://localhost:5000/api/query-simile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: customSimileText,
          audioId: audioName
        }),
      }).catch(() => {
        // Silently catch fetch errors for the dummy demo
        console.log('Note: Backend endpoint not found, using dummy fallback.');
      });

      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSimile = {
        id: `custom-${Date.now()}`,
        text: customSimileText,
        category: 'User-Generated',
        relatedFeatures: 'Custom',
        confidence: 100,
      };

      onSimileAdded(newSimile);
      setCustomSimileText('');
      setHasAddedCustomSimile(true);
    } catch (error) {
      console.error('Failed to query backend:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  if (hasAddedCustomSimile) {
    return (
      <div className="mt-4 pt-4 border-t text-sm text-gray-500 italic text-center">
        You have already added a custom simile.
      </div>
    );
  }

  return (
    <div className="mt-4 flex gap-2 items-center border-t pt-4">
      <div className="flex-1">
        <Input
          placeholder="Type your own simile here..."
          value={customSimileText}
          onChange={(e) => setCustomSimileText(e.target.value)}
          disabled={isQuerying}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddSimile();
          }}
        />
      </div>
      <Button
        variant="outline"
        onClick={handleAddSimile}
        className="flex gap-2 min-w-[120px]"
        disabled={isQuerying || !customSimileText.trim()}
      >
        {isQuerying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {isQuerying ? 'Querying...' : 'Add Simile'}
      </Button>
    </div>
  );
}
