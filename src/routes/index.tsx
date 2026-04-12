import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { LoginPage } from '../features/auth/LoginPage';
import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace />;

};

export const AppRouter = () => {
  const isInitialLoading = useAuthStore(s => s.isInitialLoading);
  
  if (isInitialLoading) {
  return <div>Loading session...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div>Hello World - You are logged in!</div>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};