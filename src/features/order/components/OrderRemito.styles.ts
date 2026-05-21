import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// ── Page wrapper ─────────────────────────────────────────────────────────────
// Background is always applied (not only inside @media print) so the dev
// preview route at /dev/remito also shows the dot pattern on screen.
export const PrintWrapper = styled(Box)({
  // backgroundImage: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.28)} 1.5px, transparent 1.5px)`,
  backgroundSize: '22px 22px',
  // Force the browser to render the background when printing
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',

  width: '210mm',
  height: '297mm',
  background: 'white',
  padding: ' 10mm',

  '@media screen': {
    display: 'none',
  },
  '@media print': {
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    color: '#000',
  },
});

// ── Header — 3-column grid ────────────────────────────────────────────────────
export const HeaderGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: '#ffffff',
  marginBottom: 12,
}));

export const BrandingBox = styled(Box)(({ theme }) => ({
  padding: '10px 14px',
  borderRight: `1px solid ${theme.palette.primary.main}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}));

export const LogoWrapper = styled(Box)({
  width: 120,
  height: 'auto',
  marginBottom: 6,
});

export const BrandName = styled(Typography)({
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: 1,
  lineHeight: 1.2,
});

export const BrandingInfoBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const BrandLine = styled(Typography)(({ theme }) => ({
  fontSize: 9,
  color: theme.palette.primary.main,
  lineHeight: 1.4,
}));

export const DocTypeBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  borderRight: `1px solid ${theme.palette.primary.main}`,
  gap: 6,
}));

export const BigX = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  border: `2px solid ${theme.palette.primary.main}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
  fontWeight: 900,
  lineHeight: 1,
  fontFamily: 'serif',
}));

export const DocTypeLabel = styled(Typography)({
  fontSize: 8,
  textAlign: 'center',
  maxWidth: 80,
  lineHeight: 1.3,
  fontWeight: 500,
});

export const MetaBox = styled(Box)({
  padding: '10px 14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 6,
});

export const DocTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: 3,
  lineHeight: 1.2,
});

export const MetaLine = styled(Typography)({
  fontSize: 10,
  lineHeight: 1.5,
});

// ── Customer info panel ───────────────────────────────────────────────────────
export const CustomerSection = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: '#ffffff',
  padding: '8px 14px',
  marginBottom: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
}));

export const CustomerRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  fontSize: 10,
  lineHeight: 1.5,
});

// ── Items table ───────────────────────────────────────────────────────────────
export const TableWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: '#ffffff',
  marginBottom: 12,
  overflow: 'visible',
}));

export const ItemsTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 10,

  '@media print': {
    // thead repeats automatically at the top of each new page
    '& thead': {
      display: 'table-header-group',
    },
    // Prevent a single product row from splitting across a page break
    '& tbody tr': {
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    },
  },
});

export const Th = styled('th')(({ theme }) => ({
  padding: '6px 10px',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  '&:not(:last-child)': {
    borderRight: '1px solid rgba(255,255,255,0.3)',
  },
}));

export const Td = styled('td')({
  padding: '6px 10px',
  fontSize: 10,
  borderBottom: '1px solid #e0e0e0',
  '&:not(:last-child)': {
    borderRight: '1px solid #e0e0e0',
  },
});

// ── Totals ────────────────────────────────────────────────────────────────────
export const TotalsWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: 16,
});

export const TotalsCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: '#ffffff',
  padding: '8px 16px',
  minWidth: 240,
}));

export const TotalRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$bold',
})<{ $bold?: boolean }>(({ $bold }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 32,
  fontSize: $bold ? 12 : 10,
  fontWeight: $bold ? 700 : 400,
  padding: '3px 0',
}));

export const TotalDivider = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.primary.main}`,
  margin: '4px 0',
}));

// ── Reception signature section ───────────────────────────────────────────────
export const ReceptionBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: '#ffffff',
  padding: '16px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}));

export const ReceptionRow = styled(Box)({
  display: 'flex',
  gap: 24,
  alignItems: 'flex-end',
});

export const ReceptionField = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$narrow',
})<{ $narrow?: boolean }>(({ $narrow }) => ({
  flex: $narrow ? '0 0 auto' : 1,
  width: $narrow ? 140 : undefined,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}));

export const FieldLabel = styled(Typography)({
  fontSize: 8,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  color: '#666',
});

export const FieldLine = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.primary.main}`,
  height: 20,
  width: '100%',
}));
