
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';
import { speechRecognition } from '../../services/speechRecognition';
import { useToast } from "@/hooks/use-toast";

interface SpeechRecorderProps {
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  fieldLabel: string;
  onTranscriptComplete: () => void;
}

const SpeechRecorder: React.FC<SpeechRecorderProps> = ({
  isListening,
  setIsListening,
  transcript,
  setTranscript,
  fieldLabel,
  onTranscriptComplete
}) => {
  const { toast } = useToast();

  useEffect(() => {
    speechRecognition.onResult((text) => {
      setTranscript(text);
    });

    speechRecognition.onEnd(() => {
      setIsListening(false);
    });

    return () => {
      if (isListening) {
        speechRecognition.stop();
      }
    };
  }, [isListening, setIsListening, setTranscript]);

  const startListening = () => {
    setTranscript('');
    try {
      speechRecognition.start();
      setIsListening(true);
      toast({
        title: fieldLabel,
        description: "Spracherkennung läuft...",
      });
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast({
        title: "Fehler beim Starten der Spracherkennung",
        description: "Bitte überprüfen Sie die Mikrofonberechtigung.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (isListening) {
      speechRecognition.stop();
      onTranscriptComplete();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center gap-4">
        {!isListening ? (
          <Button
            type="button"
            onClick={startListening}
            size="lg"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
            aria-label="Aufnahme starten"
          >
            <Mic size={24} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={stopListening}
            size="lg"
            className="rounded-full h-16 w-16 bg-destructive hover:bg-destructive/90 animate-pulse"
            aria-label="Aufnahme stoppen"
          >
            <StopCircle size={24} />
          </Button>
        )}
      </div>
      
      {isListening && (
        <div className="text-center py-2 px-4 rounded-md bg-muted w-full">
          <p className="font-medium">{fieldLabel}</p>
          {transcript && <p className="mt-2 text-sm italic">{transcript}</p>}
        </div>
      )}
    </div>
  );
};

export default SpeechRecorder;
