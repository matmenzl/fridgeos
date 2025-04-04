
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { migrateNotesToSupabase, migrateReceiptProductsToSupabase } from '../../services/noteStorage';

interface DataMigrationBannerProps {
  hasMigrated: boolean;
  onMigrationComplete: () => void;
}

const DataMigrationBanner: React.FC<DataMigrationBannerProps> = ({ 
  hasMigrated, 
  onMigrationComplete 
}) => {
  const { toast } = useToast();

  if (hasMigrated) {
    return null;
  }

  const migrateDataToSupabase = async () => {
    try {
      toast({
        title: "Migration gestartet",
        description: "Deine Daten werden von localStorage zu Supabase migriert...",
      });
      
      const notesMigrated = await migrateNotesToSupabase();
      const productsMigrated = await migrateReceiptProductsToSupabase();
      
      if (notesMigrated && productsMigrated) {
        localStorage.setItem('dataMigratedToSupabase', 'true');
        onMigrationComplete();
        
        toast({
          title: "Migration erfolgreich",
          description: "Deine Daten wurden erfolgreich zu Supabase migriert.",
        });
      } else {
        toast({
          title: "Migration teilweise fehlgeschlagen",
          description: "Einige Daten konnten nicht migriert werden. Bitte versuche es später erneut.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler bei der Migration:", error);
      toast({
        title: "Migration fehlgeschlagen",
        description: "Bei der Migration ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    }
  };

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
            onClick={migrateDataToSupabase}
            className="text-yellow-700 border-yellow-400"
          >
            Jetzt migrieren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataMigrationBanner;
