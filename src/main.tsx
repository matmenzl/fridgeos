
// Add error handling for module loading
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a self-executing function to handle any loading errors
;(function() {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found!");
      return;
    }
    
    createRoot(rootElement).render(<App />);
    
    console.log("Application successfully mounted");
  } catch (error) {
    console.error("Error loading application:", error);
    
    // Display fallback UI if there's an error
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Anwendung lädt...</h2>
          <p>Bitte laden Sie die Seite neu, falls dies zu lange dauert.</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 10px;">
            Seite neu laden
          </button>
        </div>
      `;
    }
  }
})();
