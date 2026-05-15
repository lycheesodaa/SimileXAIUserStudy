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
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/generate-from-simile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-API-Key": import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          simile_text: customSimileText,
          reference_audio_path: audioName // Using audioName as the path reference
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

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
      <span className="inline-block">
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
      </span>
    </div>
  );
}
