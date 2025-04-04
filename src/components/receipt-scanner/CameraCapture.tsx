
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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

  return (
    <div className="relative aspect-[3/4] bg-muted rounded-md overflow-hidden">
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
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        <Button 
          onClick={captureImage}
          size="lg"
          className="rounded-full h-16 w-16"
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
