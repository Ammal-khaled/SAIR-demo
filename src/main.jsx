import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import "leaflet/dist/leaflet.css";

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found. Check index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);