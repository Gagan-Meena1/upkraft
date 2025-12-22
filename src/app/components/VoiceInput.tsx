// components/VoiceInput.tsx
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  buttonText?: string;
}

export const VoiceInput = ({ 
  onTranscript, 
  className = '',
  buttonText = 'Start Recording'
}: VoiceInputProps) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    isSupported
  } = useVoiceInput({
    onResult: onTranscript,
    continuous: true
  });

  if (!isSupported) {
    return (
      <div className="text-sm text-red-600">
        Voice input not supported in your browser
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Listening...
        </div>
      )}

      {(transcript || interimTranscript) && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {transcript}
            <span className="text-gray-400">{interimTranscript}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );
};