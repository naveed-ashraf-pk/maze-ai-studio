
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThreeElements } from '@react-three/fiber';

// Fix for "Property does not exist on type 'JSX.IntrinsicElements'" errors.
// Using 'declare global' is the standard way to augment the JSX namespace for 
// React Three Fiber elements globally, ensuring standard tags are recognized 
// in all project files without local redeclarations.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
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
