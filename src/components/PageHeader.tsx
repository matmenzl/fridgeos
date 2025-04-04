
import React from 'react';
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

const PageHeader = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm p-4 md:p-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lebensmittel-Tracker</h1>
        <p className="text-gray-500 text-sm">Behalte den Überblick über deine Lebensmittel</p>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Einstellungen</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin-Bereich</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
};

export default PageHeader;
