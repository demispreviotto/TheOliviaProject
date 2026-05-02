import { useState, useCallback, useMemo } from 'react';
import { Alert, Button, CircularProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useKitchenDates } from './api/useKitchenDates';
import { useKitchenDashboard } from './api/useKitchenDashboard';
import { useUpdateItemStatus } from './api/useUpdateItemStatus';
import { KitchenDateNav } from './components/KitchenDateNav';
import { KitchenCalendar } from './components/KitchenCalendar';
import { CategoryAccordion } from './components/CategoryAccordion';
import { KitchenFAB } from './components/KitchenFAB';
import { PdfExportButton } from './components/PdfExportButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getErrorMessage } from '../../utils/errorMessages';
import type { OrderItemStatus } from '../order/api/order.types';
import * as S from './KitchenPage.styles';

const todayISO = () => new Date().toISOString().split('T')[0];

export const KitchenPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const [loadingGroupKey, setLoadingGroupKey] = useState<string | null>(null);

  const { data: dates = [] } = useKitchenDates();
  const { data: categories = [], isLoading, isError, refetch } = useKitchenDashboard(selectedDate);
  const updateStatus = useUpdateItemStatus();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedGroupKeys(new Set());
    setCalendarOpen(false);
  };

  const handleGroupCheckChange = useCallback((groupKey: string, checked: boolean) => {
    setSelectedGroupKeys((prev) => {
      const next = new Set(prev);
      checked ? next.add(groupKey) : next.delete(groupKey);
      return next;
    });
  }, []);

  const handleAction = useCallback(
    async (itemIds: string[], newStatus: OrderItemStatus, orderIds: string[], groupKey?: string) => {
      if (groupKey) setLoadingGroupKey(groupKey);
      try {
        await updateStatus.mutateAsync({ itemIds, newStatus, orderIds, date: selectedDate });
        enqueueSnackbar(
          newStatus === 'cooking' ? 'Ítem(s) enviados a cocina' : 'Ítem(s) marcados como listos',
          { variant: 'success' },
        );
      } catch (err) {
        enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
      } finally {
        setLoadingGroupKey(null);
      }
    },
    [updateStatus, selectedDate, enqueueSnackbar],
  );

  // FAB logic: homogeneity check across ALL items in selected groups
  const fabData = useMemo(() => {
    const selectedItems = categories
      .flatMap((cat) => cat.groups)
      .filter((g) => selectedGroupKeys.has(g.key))
      .flatMap((g) => g.items);

    if (selectedItems.length === 0) return { targetStatus: null as OrderItemStatus | null, items: [] };

    const allStatuses = new Set(selectedItems.map((i) => i.status));
    if (allStatuses.size !== 1) return { targetStatus: null as OrderItemStatus | null, items: [] };

    const sharedStatus = [...allStatuses][0] as OrderItemStatus;
    const targetStatus: OrderItemStatus | null =
      sharedStatus === 'pending' ? 'cooking' :
      sharedStatus === 'cooking' ? 'ready' : null;

    return { targetStatus, items: selectedItems };
  }, [categories, selectedGroupKeys]);

  const handleFAB = async () => {
    if (!fabData.targetStatus || fabData.items.length === 0) return;
    const orderIds = [...new Set(fabData.items.map((i) => i.orderId))];
    await handleAction(fabData.items.map((i) => i.id), fabData.targetStatus, orderIds);
    setSelectedGroupKeys(new Set());
  };

  return (
    <S.PageRoot>
      <S.PageHeader>
        <S.PageTitle variant="h4">Cocina</S.PageTitle>
        <PdfExportButton categories={categories} date={selectedDate} />
      </S.PageHeader>

      <KitchenDateNav
        date={selectedDate}
        dates={dates}
        onDateChange={handleDateChange}
        onCalendarToggle={() => setCalendarOpen((v) => !v)}
      />

      {calendarOpen && (
        <KitchenCalendar
          selectedDate={selectedDate}
          datesWithOrders={dates}
          onDateSelect={handleDateChange}
        />
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          No se pudo cargar el dashboard. Verificá tu conexión.
        </Alert>
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <EmptyState message="No hay pedidos para este día." />
      )}

      {!isLoading && !isError && categories.map((cat) => (
        <CategoryAccordion
          key={cat.category}
          category={cat}
          selectedGroupKeys={selectedGroupKeys}
          onGroupCheckChange={handleGroupCheckChange}
          onAction={(itemIds, newStatus, orderIds) => {
            const group = cat.groups.find((g) =>
              g.items.some((i) => itemIds.includes(i.id)),
            );
            handleAction(itemIds, newStatus, orderIds, group?.key);
          }}
          loadingGroupKey={loadingGroupKey}
        />
      ))}

      <KitchenFAB
        count={fabData.items.length}
        targetStatus={fabData.targetStatus}
        isLoading={updateStatus.isPending}
        onClick={handleFAB}
      />
    </S.PageRoot>
  );
};
