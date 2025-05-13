
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure smooth rendering process with proper error handling
const renderApp = () => {
  try {
    // Get the root element
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error("Root element not found - DOM might not be fully loaded");
    }
    
    const root = createRoot(rootElement);
    
    // Clear any loading indicators
    rootElement.innerHTML = '';
    
    // Render the app with error boundary
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("App successfully rendered");
  } catch (error) {
    console.error("Failed to render application:", error);
    // Retry rendering after a short delay as fallback
    setTimeout(() => {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = '<div>Something went wrong. Retrying...</div>';
        setTimeout(renderApp, 1000);
      }
    }, 100);
  }
};

// Execute rendering when the DOM is fully ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  renderApp();
}

// Provide global error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});
