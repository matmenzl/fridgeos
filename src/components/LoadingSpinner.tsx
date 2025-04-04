
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <LoaderCircle className="h-10 w-10 animate-spin text-gray-900" />
    </div>
  );
};

export default LoadingSpinner;
