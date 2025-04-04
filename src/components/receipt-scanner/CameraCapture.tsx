
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      // Versuche, auf die Kamera zuzugreifen
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wenn erfolgreich, setze den Fehler zurück
        setCameraError(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Setze den Fehler, damit wir dem Benutzer eine Nachricht anzeigen können
      setCameraError(
        error instanceof Error 
          ? `Kamerazugriff verweigert: ${error.message}` 
          : 'Kamerazugriff verweigert'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Match canvas dimensions to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image as data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        stopCamera();
        onCapture(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onCapture(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeErrorDialog = () => {
    setCameraError(null);
    // Nach dem Schließen des Dialogs erneut versuchen, auf die Kamera zuzugreifen
    startCamera();
  };

  return (
    <div className="relative aspect-[3/4] bg-muted rounded-md overflow-hidden">
      {!cameraError ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            className="hidden" 
          />
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
            <Button 
              onClick={captureImage}
              size="lg"
              className="rounded-full h-16 w-16"
            >
              <Camera className="h-8 w-8" />
            </Button>
          </div>
        </>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-medium text-red-500 mb-4">
            {cameraError}
          </p>
          <p className="text-muted-foreground mb-6">
            Du kannst stattdessen ein Bild aus deiner Galerie hochladen:
          </p>
          <Button 
            onClick={triggerFileInput}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bild hochladen
          </Button>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <AlertDialog open={Boolean(cameraError)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kamerazugriff verweigert</AlertDialogTitle>
            <AlertDialogDescription>
              Die App benötigt Zugriff auf die Kamera, um Quittungen zu scannen. 
              Bitte erlaube den Zugriff in deinen Browsereinstellungen oder lade 
              alternativ ein Bild aus deiner Galerie hoch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={closeErrorDialog}>
              Erneut versuchen
            </Button>
            <Button onClick={triggerFileInput}>
              Bild hochladen
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CameraCapture;
