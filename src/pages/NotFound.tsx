
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline mb-8 block">
          Return to Home
        </a>
        
        {/* Setup help section */}
        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => setShowSetupHelp(!showSetupHelp)}
            className="mb-4"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Having trouble with the app?
          </Button>
          
          {showSetupHelp && (
            <div className="bg-white p-4 rounded-lg shadow-md text-left">
              <h2 className="font-bold mb-2">Setup Guide:</h2>
              <p className="mb-2">If you're experiencing issues, you might need to set up the Supabase tables:</p>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the following SQL to create necessary tables:</li>
              </ol>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS public.notes (
  id text primary key,
  text text not null,
  timestamp bigint not null
);

CREATE TABLE IF NOT EXISTS public.receipt_products (
  id text primary key,
  productName text not null,
  timestamp bigint not null
);`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
