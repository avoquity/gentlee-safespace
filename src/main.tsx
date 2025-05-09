
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists before rendering
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Add event listener for DOMContentLoaded to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      root.render(<App />);
    });
  } else {
    // DOM already loaded, render immediately
    root.render(<App />);
  }
}
