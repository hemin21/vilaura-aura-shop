import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react';

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey="pk_test_ZGVhci1zaGVlcC0zNy5jbGVyay5hY2NvdW50cy5kZXYk">
    <App />
  </ClerkProvider>
);
