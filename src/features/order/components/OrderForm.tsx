import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { 
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Typography,
  Grid,
  Box,
  Autocomplete,
  IconButton,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import * as S from './OrderForm.styles';
import type { Order, OrderItem } from '../api/order.types';
import { useCustomers } from '../../customers/api/useCustomers';
import { useProducts } from '../../products/api/useProducts';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { useCustomerHistory } from '../api/useCustomerHistory';

const itemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, 'El producto es obligatorio'),
  quantity: z.coerce.number().min(1, 'Mínimo 1'),
  unit_price: z.coerce.number().min(0, 'Precio inválido'),
  discount_amount: z.coerce.number().min(0, 'Descuento inválido'),
  notes: z.string().optional().nullable(),
});

const schema = z.object({
  customer_id: z.string().min(1, 'El cliente es obligatorio'),
  order_status: z.enum(['pending', 'cooking', 'ready', 'delivered', 'cancelled']),
  delivery_mode: z.enum(['pickup', 'delivery']),
  payment_state: z.enum(['pending', 'partially_paid', 'paid']),
  pay_method: z.enum(['cash', 'transfer', 'mixed']).nullable(),
  delivery_date: z.string().min(1, 'La fecha es obligatoria'),
  transfer_amount: z.number().default(0),
  cash_amount: z.number().default(0),
  total_price: z.number().default(0),
  order_items: z.array(itemSchema).min(1, 'Debe agregar al menos un producto'),
});

interface OrderFormProps {
  initialData?: Order | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

// Helpers for date conversion
const toDisplayDate = (isoDate: string) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const toISODate = (displayDate: string) => {
  if (!displayDate || displayDate.length < 10) return '';
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
};

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:   ['pending', 'cooking', 'cancelled'],
  cooking:   ['cooking', 'cancelled'],
  ready:     ['ready', 'delivered', 'cancelled'],
  delivered: ['delivered'],
  cancelled: ['cancelled'],
};

export const OrderForm = ({ initialData, onSubmit, isLoading, isReadOnly=false,  }: OrderFormProps) => {
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  
  const [visibleNotes, setVisibleNotes] = useState<Record<number, boolean>>({});

  const {
    control,
    handleSubmit,
    // watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: '',
      order_status: 'pending',
      delivery_mode: 'pickup',
      payment_state: 'pending',
      pay_method: null,
      delivery_date: new Date().toISOString().split('T')[0],
      transfer_amount: 0,
      cash_amount: 0,
      total_price: 0,
      order_items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "order_items",
  });

  // const watchItems = watch("order_items");
  const watchItems = useWatch({
    control,
    name: "order_items",
    defaultValue: [],
  });
  // const watchCustomerId = watch("customer_id");
  const watchCustomerId = useWatch({
    control,
    name: "customer_id",
  });
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === watchCustomerId), 
    [customers, watchCustomerId]
  );
  const { data: lastOrder } = useCustomerHistory(watchCustomerId);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        pay_method: initialData.pay_method || null,
        order_items: (initialData.order_items || []).map(item => ({
  id: item.id, 
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          notes: item.notes || '',
        })),
      });
      // Show notes if they exist
      const initialNotes: Record<number, boolean> = {};
      initialData.order_items?.forEach((item, index) => {
        if (item.notes) initialNotes[index] = true;
      });
      setVisibleNotes(initialNotes);
    }
  }, [initialData, reset]);

  const handleAddItem = () => {
    append({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      notes: '',
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const price = selectedCustomer?.category === 'wholesale' 
        ? product.wholesale_price 
        : product.retail_price;
      
      // We use shouldDirty: true to ensure the form state knows it changed
      setValue(`order_items.${index}.unit_price`, price, { shouldDirty: true });
      setValue(`order_items.${index}.product_id`, productId, { shouldDirty: true });
    }
  };

  const toggleNote = (index: number) => {
    setVisibleNotes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // UX Helper: Select text on focus for number fields
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const recommendations = useMemo(() => {
  if (!lastOrder?.order_items) return [];
  const currentProductIds = watchItems.map(item => item.product_id);
  return lastOrder.order_items
    .filter((item: OrderItem) => !currentProductIds.includes(item.product_id))
    .sort((a: OrderItem, b: OrderItem) => b.quantity - a.quantity)
    .slice(0, 2);
}, [lastOrder, watchItems]);

const handleQuickAdd = (recItem: any) => {
  const product = products.find(p => p.id === recItem.product_id);
  if (product) {
    append({
      product_id: product.id,
      quantity: recItem.quantity,
      unit_price: selectedCustomer?.category === 'wholesale' 
        ? product.wholesale_price 
        : product.retail_price,
      discount_amount: 0,
      notes: '',
    });
  }
};

const processSubmit = (data: any) => {
  const finalTotal = data.order_items.reduce((acc: number, item: any) => {
    return acc + (Number(item.unit_price) * Number(item.quantity)) - Number(item.discount_amount || 0);
  }, 0);

  const cleanedItems = data.order_items.map((item: any) => ({
    product_id: item.product_id,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    discount_amount: Number(item.discount_amount),
    notes: item.notes || '',
  }));

  onSubmit({
    ...data,
    total_price: finalTotal,
    order_items: cleanedItems
  });
};

const productLabelConstructor = (option: any) => {
  if (!option?.product_category || !option?.variety) return 'Producto no disponible';
  const productName = `${option.product_category} ${option.variety}`;
  const productPresentation = option?.unit === 1 ? option?.grams + 'g' : option?.unit + 'u';
  return `${productName} - ${productPresentation}`;
}

const calculatedTotal = useMemo(() => {
    return (watchItems || []).reduce((acc, item) => {
      const price = Number(item?.unit_price || 0);
      const qty = Number(item?.quantity || 0);
      const disc = Number(item?.discount_amount || 0);
      return acc + (price * qty) - disc;
    }, 0);
  }, [watchItems]);

  return (
    <>
      <form onSubmit={handleSubmit(processSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.full_name} (${option.category === 'wholesale' ? 'Mayorista' : 'Individual'})`}
                    disabled={isReadOnly}
                    value={customers.find(c => c.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        error={!!errors.customer_id}
                        helperText={errors.customer_id?.message}
                        required
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Fecha de Entrega con Máscara */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="delivery_date"
                control={control}
                disabled={isReadOnly}
                render={({ field: { value, onChange, ...rest } }) => (
                  <MaskedInput
                    {...rest}
                    mask="00/00/0000"
                    label="Fecha de Entrega (DD/MM/AAAA)"
                    fullWidth
                    value={toDisplayDate(value)}
                    onChange={(e) => onChange(toISODate(e.target.value))}
                    error={!!errors.delivery_date}
                    helperText={errors.delivery_date?.message}
                  />
                )}
              />
            </Grid>

            {/* Estado del Pedido */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={isReadOnly}>
                <InputLabel>Estado del Pedido</InputLabel>
                <Controller
                  name="order_status"
                  control={control}
                  disabled={isReadOnly}
                  render={({ field }) => {
                    const allowed = initialData?.order_status
                      ? ALLOWED_STATUS_TRANSITIONS[initialData.order_status] ?? []
                      : null;
                    const isDisabled = (value: string) =>
                      allowed !== null && !allowed.includes(value);
                    return (
                      <Select {...field} label="Estado del Pedido">
                        <MenuItem value="pending" disabled={isDisabled('pending')}>Pendiente</MenuItem>
                        <MenuItem value="cooking" disabled={isDisabled('cooking')}>En Cocina</MenuItem>
                        <MenuItem value="ready" disabled={isDisabled('ready')}>Listo</MenuItem>
                        <MenuItem value="delivered" disabled={isDisabled('delivered')}>Entregado</MenuItem>
                        <MenuItem value="cancelled" disabled={isDisabled('cancelled')}>Cancelado</MenuItem>
                      </Select>
                    );
                  }}
                />
              </FormControl>
            </Grid>

            {/* Modo de Entrega */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={isReadOnly}>
                <InputLabel>Entrega</InputLabel>
                <Controller
                  name="delivery_mode"
                  control={control}
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Select {...field} label="Entrega">
                      <MenuItem value="pickup">Retira</MenuItem>
                      <MenuItem value="delivery">Envío</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {/* Estado de Pago */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={isReadOnly}>
                <InputLabel>Estado de Pago</InputLabel>
                <Controller
                  name="payment_state"
                  control={control}
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Select {...field} label="Estado de Pago">
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="partially_paid">Pago Parcial</MenuItem>
                      <MenuItem value="paid">Pagado</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <S.ItemsHeader>
              <Typography variant="h6">Productos del Pedido</Typography>
            </S.ItemsHeader>
            
            {errors.order_items && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
                {errors.order_items.root?.message || "Revise los productos"}
              </Typography>
            )}

            <S.ItemListContainer>
              {fields.map((field, index) => (
                <S.ItemRowWrapper key={field.id}>
                  <S.ItemRow>
                    {/* Producto */}
                    <Box>
                      <Controller
                        name={`order_items.${index}.product_id`}
                        control={control}
                        disabled={isReadOnly}
                        render={({ field: { value } }) => (
                          <Autocomplete
                            size="small"
                            options={products}
                            getOptionLabel={(option) => productLabelConstructor(option)}
                            value={products.find(p => p.id === value) || null}
                            onChange={(_, newValue) => handleProductChange(index, newValue?.id || '')}
                            disabled={isReadOnly || !watchCustomerId}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={!watchCustomerId ? "Selec. cliente" : "Producto"}
                                error={!!errors.order_items?.[index]?.product_id}
                              />
                            )}
                          />
                        )}
                      />
                    </Box>

                    {/* Cantidad */}
                    <Controller
                      name={`order_items.${index}.quantity`}
                      control={control}
                      disabled={isReadOnly}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type="number"
                          label="Cant"
                          onFocus={handleFocus}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={!!errors.order_items?.[index]?.quantity}
                        />
                      )}
                    />

                    {/* Precio Unitario */}
                    <Controller
                      name={`order_items.${index}.unit_price`}
                      control={control}
                      disabled={isReadOnly}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type="number"
                          label="Precio Un."
                          onFocus={handleFocus}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={!!errors.order_items?.[index]?.unit_price}
                        />
                      )}
                    />

                    {/* Descuento */}
                    <Controller
                      name={`order_items.${index}.discount_amount`}
                      control={control}
                      disabled={isReadOnly}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type="number"
                          label="Desc."
                          onFocus={handleFocus}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={!!errors.order_items?.[index]?.discount_amount}
                        />
                      )}
                    />

                    {/* Botón Nota */}
                    <Box disable-style-alias="true">
                      <IconButton 
                        size="small" 
                        onClick={() => toggleNote(index)}
                        color={watchItems[index]?.notes ? "primary" : "default"}
                        disabled={isReadOnly}
                      >
                        <ChatBubbleOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Subtotal (Calculado) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${((Number(watchItems[index]?.unit_price || 0) * Number(watchItems[index]?.quantity || 0)) - 
                            Number(watchItems[index]?.discount_amount || 0)).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Eliminar */}
                    {!isReadOnly && (
                      <IconButton color="error" onClick={() => remove(index)} size="small">
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                  )}
                  </S.ItemRow>

                  {/* Campo de Nota (Condicional) */}
                  {visibleNotes[index] && (
                    <S.NoteFieldWrapper>
                      <Controller
                        name={`order_items.${index}.notes`}
                        control={control}
                        disabled={isReadOnly}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            fullWidth
                            multiline
                            placeholder="Agregar nota a este producto..."
                            variant="standard"
                          />
                        )}
                      />
                    </S.NoteFieldWrapper>
                  )}
                </S.ItemRowWrapper>
              ))}
            </S.ItemListContainer>

            {/* Nuevo Botón Agregar Producto al final de la lista */}
            {!isReadOnly && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  startIcon={<AddCircleOutlinedIcon />} 
                  onClick={handleAddItem}
                  variant="outlined"
                  color="primary">
                  Agregar Producto
                </Button>
              </Box>
            )}

          {/* Recommendations Section */}
          {!isReadOnly && recommendations.length > 0 && (
            <S.RecommendationsWrapper>
              <Typography variant="caption" color="text.secondary">
                Sugeridos del pedido anterior:
              </Typography>
              <Stack direction="row" spacing={1}>
                {recommendations.map((rec: OrderItem) => (
                  <S.SuggestionChip
                    key={rec.product_id}
                    label={`+ ${rec.products?.product_category + ' ' + rec.products?.variety} (${rec.quantity})`}
                    onClick={() => handleQuickAdd(rec)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
            </S.RecommendationsWrapper>
      )}
        </Box>
          <S.TotalContainer elevation={0} variant="outlined">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                 <Typography variant="subtitle2" gutterBottom>Detalles de Pago</Typography>
                 <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Controller
                        name="transfer_amount"
                        control={control}
                        disabled={isReadOnly}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Monto Transfer"
                            fullWidth
                            onFocus={handleFocus}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Controller
                        name="cash_amount"
                        control={control}
                        disabled={isReadOnly}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Monto Efectivo"
                            fullWidth
                            onFocus={handleFocus}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Método de Pago</InputLabel>
                        <Controller
                          name="pay_method"
                          control={control}
                          disabled={isReadOnly}
                          render={({ field }) => (
                            <Select {...field} label="Método de Pago">
                              <MenuItem value="cash">Efectivo</MenuItem>
                              <MenuItem value="transfer">Transferencia</MenuItem>
                              <MenuItem value="mixed">Mixto</MenuItem>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>
                 </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <S.SummaryRow>
                  <Typography variant="h6">Total del Pedido:</Typography>
                  <S.TotalLabel variant="h4">
                    ${calculatedTotal.toFixed(2)}
                  </S.TotalLabel>
                </S.SummaryRow>
              </Grid>
            </Grid>
          </S.TotalContainer>

          {(!isReadOnly) && (
            <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => reset()} disabled={isLoading}>
                Limpiar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={isLoading || watchItems.length === 0}
                >
              {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Pedido' : 'Confirmar Pedido')}
            </Button>
          </Box>
              </>
         )}
        </S.FormWrapper>
      </form>
    </>
  );
};


