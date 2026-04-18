import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAuthStore } from './features/auth/store/useAuthStore';

const startApp = async () => {
  // Wait for Supabase to check the session before rendering anything
  await useAuthStore.getState().initialize();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

startApp();