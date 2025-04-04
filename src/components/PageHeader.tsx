
import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <header className="fridgie-header-gradient w-full py-8 mb-8 text-center">
      <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center">
        <img 
          src="/lovable-uploads/2c44a1ec-8500-48eb-90d2-e51d8a384253.png" 
          alt="FridgeOS Logo" 
          className="h-10 mr-2" 
        />
        <span>FridgeOS</span>
      </h1>
      <p className="text-white/90 text-lg">
        Verwalte deine Lenbesmittel smarter und koche kreativer ohne Stress - neu mit KI-generierten Rezeptideen.
      </p>
    </header>
  );
};

export default PageHeader;
