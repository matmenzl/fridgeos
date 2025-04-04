
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we're finding the root element correctly
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Root element not found! Make sure there's a div with id 'root' in your HTML file.");
} else {
  createRoot(rootElement).render(<App />);
}
