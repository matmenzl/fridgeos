
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speechRecognition } from '../services/speechRecognition';
import { useToast } from "@/components/ui/use-toast";

interface SpeechInputProps {
  onTranscriptComplete: (transcript: string) => void;
}

const SpeechInput: React.FC<SpeechInputProps> = ({ onTranscriptComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    speechRecognition.onResult((text) => {
      setTranscript(text);
    });

    speechRecognition.onEnd(() => {
      setIsListening(false);
      if (transcript) {
        onTranscriptComplete(transcript);
        setTranscript('');
      }
    });

    return () => {
      if (isListening) {
        speechRecognition.stop();
      }
    };
  }, [transcript, onTranscriptComplete, isListening]);

  const toggleListening = () => {
    if (!isListening) {
      setTranscript('');
      try {
        speechRecognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Fehler beim Starten der Spracherkennung",
          description: "Bitte überprüfen Sie die Mikrofonberechtigung.",
          variant: "destructive",
        });
      }
    } else {
      speechRecognition.stop();
      setIsListening(false);
      if (transcript) {
        onTranscriptComplete(transcript);
        setTranscript('');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={toggleListening}
        size="lg"
        className={`rounded-full h-16 w-16 ${
          isListening ? 'bg-destructive hover:bg-destructive/90 animate-recording' : 'bg-primary hover:bg-primary/90'
        }`}
        aria-label={isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </Button>
      {isListening && (
        <div className="text-center py-2 px-4 rounded-md bg-muted">
          <p className="font-medium">Aufnahme läuft...</p>
          {transcript && <p className="mt-2 text-sm">{transcript}</p>}
        </div>
      )}
    </div>
  );
};

export default SpeechInput;
