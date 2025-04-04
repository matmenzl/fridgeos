
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { initializeTables } from "@/services/supabaseClient";

const NotFound = () => {
  const location = useLocation();
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [setupInfo, setSetupInfo] = useState({ sql: '' });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Get the SQL setup info
    const fetchSetupInfo = async () => {
      const info = await initializeTables();
      setSetupInfo({
        sql: info.createTablesSql || `-- Important: Column names must match exactly as shown below
CREATE TABLE IF NOT EXISTS public.notes (
  id text primary key,
  text text not null,
  timestamp bigint not null
);

CREATE TABLE IF NOT EXISTS public.receipt_products (
  id text primary key,
  "productName" text not null,  -- Notice the quotes around productName
  timestamp bigint not null
);

-- If you're getting an error about 'product_name' not existing, run this:
-- ALTER TABLE public.receipt_products RENAME COLUMN product_name TO "productName";
-- OR if you want to fix the code instead, modify the interface ProductNote in noteStorage.ts to use product_name`
      });
    };
    
    fetchSetupInfo();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <div className="flex flex-col gap-3 mb-8">
          <a href="/" className="text-blue-500 hover:text-blue-700 underline block">
            Return to Home
          </a>
          <a href="/supabase-test" className="text-blue-500 hover:text-blue-700 underline block">
            Go to Supabase Test Page
          </a>
        </div>
        
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
              <h2 className="font-bold mb-2">Database Setup Guide:</h2>
              <p className="mb-2">If you're experiencing issues with saving data, you might need to check your Supabase table structure:</p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                <p className="font-medium">Common Error: <code>Could not find the 'productName' column</code></p>
                <p>This error occurs when the column names in your database don't exactly match what the app expects.</p>
              </div>
              
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the following SQL to create or update the necessary tables:</li>
              </ol>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {setupInfo.sql}
              </pre>
              
              <p className="mt-4 text-sm text-gray-600">
                <strong>Note:</strong> In PostgreSQL, column names with special characters or camelCase need to be wrapped in double quotes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
