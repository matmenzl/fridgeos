
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PageHeader: React.FC = () => {
  return (
    <header className="fridgie-header-gradient w-full py-8 mb-8 text-center relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-end absolute top-4 right-4">
          <Button variant="ghost" size="icon" asChild className="text-white" aria-label="Einstellungen">
            <Link to="/admin/category-expiry">
              <Settings className="h-6 w-6" />
            </Link>
          </Button>
        </div>
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
      </div>
    </header>
  );
};

export default PageHeader;
