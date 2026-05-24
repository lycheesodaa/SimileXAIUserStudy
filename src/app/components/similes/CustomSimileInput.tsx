import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LungSound } from '../../data_v2';

interface CustomSimileInputProps {
  audioName: string;
  originalAudioUrl?: string;
  onSimileAdded: (newSimile: LungSound['similes'][0]) => void;
}

export function CustomSimileInput({ audioName, originalAudioUrl, onSimileAdded }: CustomSimileInputProps) {
  const [customSimileText, setCustomSimileText] = useState('');
  const [hasAddedCustomSimile, setHasAddedCustomSimile] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSimile = async () => {
    if (!customSimileText.trim() || isQuerying || hasAddedCustomSimile) return;

    setIsQuerying(true);
    setError(null);

    try {
      const fullPath = originalAudioUrl || audioName;
      const filename = fullPath.split(/[/\\]/).pop() || fullPath;

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/generate-from-simile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-API-Key": import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          simile_text: customSimileText,
          reference_audio_path: filename
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Extract similarity and quality metrics from response headers
      const visqolMosLqoHeader = response.headers.get('X-ViSQOL-MOS-LQO');
      const visqolVnsimHeader = response.headers.get('X-ViSQOL-VNSIM');
      const genToOrigHeader = response.headers.get('X-CLAP-Similarity-Gen-To-Orig');

      console.log('Query response headers:', {
        'X-ViSQOL-MOS-LQO': visqolMosLqoHeader,
        'X-ViSQOL-VNSIM': visqolVnsimHeader,
        'X-CLAP-Similarity-Gen-To-Orig': genToOrigHeader
      });

      let visqolMosLqo: number | null = null;
      let visqolVnsim: number | null = null;
      let genToOrig: number | null = null;

      if (visqolMosLqoHeader && visqolMosLqoHeader !== 'N/A') {
        const val = parseFloat(visqolMosLqoHeader);
        if (!isNaN(val)) visqolMosLqo = val;
      }
      if (visqolVnsimHeader && visqolVnsimHeader !== 'N/A') {
        const val = parseFloat(visqolVnsimHeader);
        if (!isNaN(val)) visqolVnsim = val;
      }
      if (genToOrigHeader && genToOrigHeader !== 'N/A') {
        const val = parseFloat(genToOrigHeader);
        if (!isNaN(val)) genToOrig = val;
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Save the visqol mos lqo similarity as the confidence score (fallback to 100 if unavailable)
      const confidenceScore = visqolMosLqo !== null ? visqolMosLqo : 100;

      const newSimile = {
        id: `custom-${Date.now()}`,
        text: customSimileText,
        category: 'Custom',
        relatedFeatures: 'Custom',
        confidence: confidenceScore,
        withinClassAudioUrl: audioUrl,
        visqolMosLqo,
        visqolVnsim,
        genToOrig,
      };

      onSimileAdded(newSimile);
      setCustomSimileText('');
      setHasAddedCustomSimile(true);
    } catch (err) {
      console.error('Failed to query backend:', err);
      
      if (import.meta.env.PROD) {
        setError('Failed to generate audio comparison. Please check your connection to the server.');
        return;
      }

      console.log('Local/development environment: falling back to local simile creation.');
      const newSimile = {
        id: `custom-${Date.now()}`,
        text: customSimileText,
        category: 'Custom',
        relatedFeatures: 'Custom',
        confidence: 100,
        withinClassAudioUrl: '', // No audio available locally, handles gracefully
      };

      onSimileAdded(newSimile);
      setCustomSimileText('');
      setHasAddedCustomSimile(true);
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
    <div className="mt-4 border-t pt-4 space-y-2">
      <div className="flex gap-2 items-center">
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
      {error && (
        <p className="text-sm font-medium text-rose-500 select-none animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
