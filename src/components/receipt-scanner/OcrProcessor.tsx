
import React, { useState } from 'react';
import MindeeProcessor from './ocr/MindeeProcessor';
import TesseractProcessor from './ocr/TesseractProcessor';
import ProcessingProgress from './ocr/ProcessingProgress';
import ErrorDialog from './ocr/ErrorDialog';

interface OcrProcessorProps {
  imageUrl: string;
  onProcessingStart: () => void;
  onProcessingComplete: (results: string[]) => void;
  onError: (error: Error) => void;
}

const OcrProcessor: React.FC<OcrProcessorProps> = ({
  imageUrl,
  onProcessingStart,
  onProcessingComplete,
  onError
}) => {
  const [progress, setProgress] = useState(0);
  const [processingError, setProcessingError] = useState<Error | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  React.useEffect(() => {
    if (imageUrl) {
      processImage();
    }
  }, [imageUrl]);

  const processImage = () => {
    onProcessingStart();
    setProcessingError(null);
    setProgress(10); // Initial status
    setUseFallback(false);
  };

  const handleMindeeComplete = (products: string[]) => {
    onProcessingComplete(products);
  };

  const handleTesseractComplete = (products: string[]) => {
    onProcessingComplete(products);
  };

  const handleProcessingError = (error: Error) => {
    console.error('Processing error:', error);
    setProcessingError(error);
    onError(error);
  };

  const enableFallback = () => {
    setUseFallback(true);
    setProgress(10); // Reset progress for Tesseract
  };

  const dismissError = () => {
    setProcessingError(null);
    // If user cancels processing, we notify parent component
    onError(new Error('Processing cancelled by user'));
  };

  // Render appropriate processor based on state
  return (
    <>
      <ProcessingProgress progress={progress} useFallback={useFallback} />
      
      <ErrorDialog error={processingError} onDismiss={dismissError} />
      
      {!useFallback && imageUrl && (
        <MindeeProcessor
          imageUrl={imageUrl}
          setProgress={setProgress}
          onComplete={handleMindeeComplete}
          onError={handleProcessingError}
          enableFallback={enableFallback}
        />
      )}
      
      {useFallback && imageUrl && (
        <TesseractProcessor
          imageUrl={imageUrl}
          setProgress={setProgress}
          onComplete={handleTesseractComplete}
          onError={handleProcessingError}
        />
      )}
    </>
  );
};

export default OcrProcessor;
