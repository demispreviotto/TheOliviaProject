import { GlobalStyles, Box, Button, Chip, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { OrderRemito } from './components/OrderRemito';
import type { Order } from './api/order.types';

const MOCK_ORDER: Order = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  customer_id: 'cust-001',
  order_status: 'ready',
  delivery_mode: 'delivery',
  payment_state: 'partially_paid',
  pay_method: 'mixed',
  delivery_date: '2026-05-28',
  transfer_amount: 5000,
  cash_amount: 2500,
  total_price: 16800,
  created_at: '2026-05-21T10:30:00.000Z',
  updated_at: '2026-05-21T10:30:00.000Z',
  customer: {
    id: 'cust-001',
    category: 'wholesale',
    tax_status: 'simplified_taxpayer',
    full_name: 'María González',
    company_name: 'Confitería El Rincón',
    tax_id: '27-31456789-4',
    phone: '+54 9 11 4567-8901',
    email: 'elrincon@gmail.com',
    delivery_address: 'Av. Corrientes 3456, Piso 2, CABA',
    billing_address: null,
    notes: null,
  },
  order_items: [
    {
      id: 'item-001',
      order_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      product_id: 'prod-001',
      quantity: 6,
      unit_price: 1200,
      discount_amount: 0,
      order_item_status: 'ready',
      products: {
        id: 'prod-001',
        variety: 'Membrillo',
        product_category: 'pepas',
        unit: 12,
        grams: null,
        wholesale_price: 1200,
        retail_price: 1500,
        is_active: true,
      },
    },
    {
      id: 'item-002',
      order_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      product_id: 'prod-002',
      quantity: 4,
      unit_price: 1800,
      discount_amount: 600,
      order_item_status: 'ready',
      products: {
        id: 'prod-002',
        variety: 'Chips de Chocolate',
        product_category: 'cookies_xl',
        unit: 6,
        grams: null,
        wholesale_price: 1800,
        retail_price: 2200,
        is_active: true,
      },
    },
    {
      id: 'item-003',
      order_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      product_id: 'prod-003',
      quantity: 2,
      unit_price: 3600,
      discount_amount: 0,
      order_item_status: 'ready',
      products: {
        id: 'prod-003',
        variety: 'Integral con Nueces',
        product_category: 'budin_integral',
        unit: 1,
        grams: 450,
        wholesale_price: 3600,
        retail_price: 4200,
        is_active: true,
      },
    },
    {
      id: 'item-004',
      order_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      product_id: 'prod-004',
      quantity: 12,
      unit_price: 400,
      discount_amount: 0,
      order_item_status: 'ready',
      products: {
        id: 'prod-004',
        variety: 'Cacao y Maní',
        product_category: 'alfajores',
        unit: 1,
        grams: null,
        wholesale_price: 400,
        retail_price: 500,
        is_active: true,
      },
    },
  ],
};

export const RemitoPreviewPage = () => {
  return (
    <>
      {/* Force the print wrapper visible and properly sized on screen */}
      <GlobalStyles
        styles={{
          '@media screen': {
            '.remito-print-root': {
              display: 'block !important',
              position: 'relative !important',
              width: '794px',
              backgroundColor: '#fff',
            },
          },
        }}
      />

      {/* Dev toolbar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: '#1a1a2e',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '3px solid #e040fb',
        }}
      >
        <Chip label="DEV" size="small" sx={{ bgcolor: '#e040fb', color: '#fff', fontWeight: 700, fontSize: 10 }} />
        <Typography variant="body2" sx={{ color: '#ccc', fontWeight: 500 }}>
          Remito Preview — 794 px = A4 @ 96 dpi
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ color: '#fff', borderColor: '#555', '&:hover': { borderColor: '#fff' } }}
        >
          Imprimir
        </Button>
      </Box>

      {/* A4 canvas */}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: 794,
            boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <OrderRemito order={MOCK_ORDER} />
        </Box>

        <Typography variant="caption" sx={{ color: '#999' }}>
          /dev/remito — solo visible en desarrollo
        </Typography>
      </Box>
    </>
  );
};
