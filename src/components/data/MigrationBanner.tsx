
import React from 'react';
import { Button } from "@/components/ui/button";

interface MigrationBannerProps {
  onMigrate: () => Promise<void>;
}

const MigrationBanner: React.FC<MigrationBannerProps> = ({ onMigrate }) => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-1">
          <p className="text-sm text-yellow-700">
            Du hast lokale Daten im Browser gespeichert. Möchtest du diese zu Supabase migrieren?
          </p>
        </div>
        <div className="ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onMigrate}
            className="text-yellow-700 border-yellow-400"
          >
            Jetzt migrieren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MigrationBanner;
