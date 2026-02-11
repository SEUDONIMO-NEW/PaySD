
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim para evitar el error "process is not defined" en navegadores (Vercel Production)
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' // El valor real será inyectado por el entorno de Vercel si existe
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
