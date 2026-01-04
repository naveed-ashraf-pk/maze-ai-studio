
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThreeElements } from '@react-three/fiber';

// Fix for "Property does not exist on type 'JSX.IntrinsicElements'" errors.
// This correctly extends the global JSX namespace with Three.js elements from @react-three/fiber.
// Using 'interface' instead of 'type' ensures we merge with existing IntrinsicElements rather than overwriting them.
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
