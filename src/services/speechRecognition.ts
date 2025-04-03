
export interface SpeechRecognitionService {
  start: () => void;
  stop: () => void;
  isListening: boolean;
  onResult: (callback: (transcript: string) => void) => void;
  onEnd: (callback: () => void) => void;
}

class BrowserSpeechRecognition implements SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private resultCallback: ((transcript: string) => void) | null = null;
  private endCallback: (() => void) | null = null;
  isListening: boolean = false;

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the standard SpeechRecognition or the webkit version
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'de-DE'; // Set to German language

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (this.resultCallback) {
          this.resultCallback(transcript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.endCallback) {
          this.endCallback();
        }
      };
    }
  }

  start(): void {
    if (this.recognition) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  onResult(callback: (transcript: string) => void): void {
    this.resultCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback;
  }
}

// Create and export a singleton instance
export const speechRecognition: SpeechRecognitionService = new BrowserSpeechRecognition();
