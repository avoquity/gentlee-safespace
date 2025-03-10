
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use hydrate or render based on whether we're in SSR mode
const rootElement = document.getElementById("root");
if (rootElement) {
  // Detect if the app was server-rendered
  const hasSSRContent = rootElement.hasChildNodes();

  if (hasSSRContent) {
    createRoot(rootElement).render(<App />);
  } else {
    createRoot(rootElement).render(<App />);
  }
}
