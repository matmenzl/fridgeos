
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProcessingProgressProps {
  progress: number;
  useFallback: boolean;
}

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  progress, 
  useFallback 
}) => {
  if (progress <= 0 || progress >= 100) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2 text-center">
        Verarbeitung: {progress}%
        {useFallback && " (Tesseract Fallback)"}
      </p>
      <Progress value={progress} className="w-full h-2" />
    </div>
  );
};

export default ProcessingProgress;
