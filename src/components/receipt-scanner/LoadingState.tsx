
import React from 'react';
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-center text-sm text-muted-foreground">
        Quittung wird verarbeitet...
      </p>
    </div>
  );
};

export default LoadingState;
