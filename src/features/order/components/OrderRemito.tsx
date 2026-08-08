import { GlobalStyles } from '@mui/material';
import * as S from './OrderRemito.styles';
import { getFullProductName } from '../../products/utils/products.utils';
import { TAX_STATUS_LABELS } from '../../customers/utils/customerMappings';
import { wordmark as Wordmark } from '../../../assets/wordmark';
import type { Order } from '../api/order.types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { theme } from '../../../utils/theme';

const buildRemitoNumber = (id: string): string => {
  const num = parseInt(id.replace(/-/g, '').slice(-8), 16) % 100_000_000;
  return `0001-${String(num).padStart(8, '0')}`;
};

export const getRemitoElementId = (orderId: string) => `remito-content-${orderId}`;

interface Props {
  order: Order;
}

export const OrderRemito = ({ order }: Props) => {
  const customer = order.customer;
  const items = order.order_items ?? [];

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0
  );

  return (
    <>
      <GlobalStyles
        styles={{
          '@page': { size: 'A4 portrait', margin: '15mm' },
          '@media print': {
            'body *': { visibility: 'hidden' },
            '.remito-print-root, .remito-print-root *': { visibility: 'visible' },
            '.remito-print-root': { position: 'absolute', top: '0', left: '0' },
          },
        }}
      />
      <S.PrintWrapper id={getRemitoElementId(order.id)} className="remito-print-root">

        {/* ── Header ── */}
        <S.HeaderGrid>
          <S.BrandingBox>
            <S.LogoWrapper>
              <Wordmark size={120} fill={theme.palette.primary.main} />
            </S.LogoWrapper>
            <S.BrandingInfoBox>
              <S.BrandLine>Domicilio Comercial: Lorenzatti 350</S.BrandLine>
              <S.BrandLine>CUIT: 27377978337</S.BrandLine>
              <S.BrandLine>Cond. IVA: Monotributista</S.BrandLine>
            </S.BrandingInfoBox>
          </S.BrandingBox>

          <S.DocTypeBox>
            <S.BigX>X</S.BigX>
            <S.DocTypeLabel>Documento no Válido como Factura</S.DocTypeLabel>
          </S.DocTypeBox>

          <S.MetaBox>
            <S.DocTitle>REMITO</S.DocTitle>
            <S.MetaLine>
              <strong>Nº&nbsp;</strong>{buildRemitoNumber(order.id)}
            </S.MetaLine>
            <S.MetaLine>
              <strong>Fecha:&nbsp;</strong>{formatDate(order.created_at)}
            </S.MetaLine>
          </S.MetaBox>
        </S.HeaderGrid>

        {/* ── Datos del cliente ── */}
        <S.CustomerSection>
          <S.CustomerRow>
            <span>
              <strong>Señor/es:</strong>&nbsp;
              {customer?.full_name || '—'}
            </span>
            <span>
              <strong>Fecha de entrega:</strong>&nbsp;
              {formatDate(order.delivery_date)}
            </span>
          </S.CustomerRow>
          <S.CustomerRow>
            <span>
              <strong>Domicilio:</strong>&nbsp;
              {customer?.delivery_address || '—'}
            </span>
          </S.CustomerRow>
          <S.CustomerRow>
            <span>
              <strong>CUIT/CUIL:</strong>&nbsp;
              {customer?.tax_id || '—'}
            </span>
            <span>
              <strong>Cond. IVA:</strong>&nbsp;
              {customer?.tax_status ? TAX_STATUS_LABELS[customer.tax_status] : '—'}
            </span>
          </S.CustomerRow>
        </S.CustomerSection>

        {/* ── Tabla de ítems ── */}
        <S.TableWrapper>
          <S.ItemsTable>
            <thead>
              <tr>
                <S.Th align="left">Producto</S.Th>
                <S.Th align="center">Cant.</S.Th>
                <S.Th align="right">Precio Unit.</S.Th>
                <S.Th align="right">Subtotal</S.Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const lineTotal = item.quantity * item.unit_price - item.discount_amount;
                return (
                  <tr key={item.id ?? idx}>
                    <S.Td align="left">
                      {item.products ? getFullProductName(item.products) : '—'}
                    </S.Td>
                    <S.Td align="center">{item.quantity}</S.Td>
                    <S.Td align="right">{formatCurrency(item.unit_price)}</S.Td>
                    <S.Td align="right">{formatCurrency(lineTotal)}</S.Td>
                  </tr>
                );
              })}
            </tbody>
          </S.ItemsTable>
        </S.TableWrapper>

        {/* ── Totales ── */}
        <S.TotalsWrapper>
          <S.TotalsCard>
            <S.TotalRow>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </S.TotalRow>
            <S.TotalDivider />
            <S.TotalRow $bold>
              <span>TOTAL</span>
              <span>{formatCurrency(order.total_price)}</span>
            </S.TotalRow>
          </S.TotalsCard>
        </S.TotalsWrapper>

        {/* ── Sección recepción ── */}
        <S.ReceptionBox>
          <S.ReceptionField>
            <S.FieldLabel>Recibí Conforme (Firma)</S.FieldLabel>
            <S.FieldLine />
          </S.ReceptionField>
          <S.ReceptionRow>
            <S.ReceptionField>
              <S.FieldLabel>Aclaración</S.FieldLabel>
              <S.FieldLine />
            </S.ReceptionField>
            <S.ReceptionField $narrow>
              <S.FieldLabel>DNI</S.FieldLabel>
              <S.FieldLine />
            </S.ReceptionField>
            <S.ReceptionField $narrow>
              <S.FieldLabel>Fecha</S.FieldLabel>
              <S.FieldLine />
            </S.ReceptionField>
          </S.ReceptionRow>
        </S.ReceptionBox>

      </S.PrintWrapper>
    </>
  );
};
