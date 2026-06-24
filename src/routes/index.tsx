import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { LoginPage } from '../features/auth/LoginPage';
import { HomePage } from '../features/dashboard/HomePage';
import { ProductsPage } from '../features/products/ProductsPage';
import { CustomersPage } from '../features/customers/CustomersPage';
import { OrderPage } from '../features/order/OrderPage';
import { RemitoPreviewPage } from '../features/order/RemitoPreviewPage';
import { KitchenPage } from '../features/kitchen/KitchenPage';
import { ReportPage } from '../features/report/ReportPage';
import { ProtectedLayout } from '../layouts/ProtectedLayout';
import type { JSX } from 'react';


/**
 * PublicGuard: Prevents logged-in users from accessing /login
 */
const PublicGuard = ({ children }: { children: JSX.Element }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return isAuth ? <Navigate to="/" replace /> : children;
};

export const AppRouter = () => {
  const isInitialLoading = useAuthStore(s => s.isInitialLoading);

  if (isInitialLoading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Dev-only preview routes — no auth required */}
        <Route path="/dev/remito" element={<RemitoPreviewPage />} />

        {/* Public Routes with Guard */}
        <Route
          path="/login"
          element={<PublicGuard><LoginPage /></PublicGuard>}
        />

        {/* Protected Routes Block */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/pedidos" element={<OrderPage />} />
          <Route path="/cocina" element={<KitchenPage />} />
          <Route path="/reporte" element={<ReportPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};