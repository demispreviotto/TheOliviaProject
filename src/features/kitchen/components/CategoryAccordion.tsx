import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Chip, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { KitchenCategory } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';
import { CATEGORY_LABELS } from '../utils/kitchen.utils';
import { ProductGroupRow } from './ProductGroupRow';

interface Props {
  category: KitchenCategory;
  selectedGroupKeys: Set<string>;
  onGroupCheckChange: (groupKey: string, checked: boolean) => void;
  onAction: (itemIds: string[], newStatus: OrderItemStatus, orderIds: string[]) => void;
  loadingGroupKey: string | null;
}

export const CategoryAccordion = ({
  category,
  selectedGroupKeys,
  onGroupCheckChange,
  onAction,
  loadingGroupKey,
}: Props) => {
  return (
    <Accordion defaultExpanded disableGutters elevation={2} sx={{ mb: 1, borderRadius: '8px !important' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 56 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {CATEGORY_LABELS[category.category] ?? category.category}
          </Typography>
          <Chip
            label={`${category.totalQuantity} u.`}
            color="primary"
            size="small"
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {category.groups.map((group) => (
          <ProductGroupRow
            key={group.key}
            group={group}
            checked={selectedGroupKeys.has(group.key)}
            onCheckChange={(checked) => onGroupCheckChange(group.key, checked)}
            onAction={onAction}
            isLoading={loadingGroupKey === group.key}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};
