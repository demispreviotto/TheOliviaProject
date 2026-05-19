import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Grid,
  Box,
} from '@mui/material';
import * as S from './CustomerForm.styles';
import type { Customer } from '../api/customer.types';
import { CATEGORY_LABELS, TAX_STATUS_LABELS, getDefaultTaxStatus } from '../utils/customerMappings';
import { isValidTaxId } from '../../../utils/validators';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { normalizePhone } from '../../../utils/formatters';

const TAX_STATUS_VALUES = ['final_consumer', 'simplified_taxpayer', 'registered_responsible', 'exempt'] as const;

const schema = z.object({
  category: z.enum(['individual', 'wholesale']),
  tax_status: z.enum(TAX_STATUS_VALUES),
  full_name: z.string().min(3, 'El nombre es obligatorio (min 3 caracteres)'),
  company_name: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    return isValidTaxId(val);
  }, { message: 'Formato de CUIT/CUIL o DNI inválido' }),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  delivery_address: z.string().optional().nullable(),
  billing_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.category === 'wholesale') {
    if (data.tax_status === 'final_consumer') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los mayoristas no pueden ser Consumidor Final',
        path: ['tax_status'],
      });
    }
    if (!data.company_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La razón social es obligatoria para mayoristas', path: ['company_name'] });
    }
    if (!data.tax_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El CUIT es obligatorio para mayoristas', path: ['tax_id'] });
    }
    if (!data.billing_address) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La dirección de facturación es obligatoria para mayoristas', path: ['billing_address'] });
    }
  }
});

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const CustomerForm = ({ initialData, onSubmit, onCancel, isLoading, isReadOnly = false }: CustomerFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'individual' as const,
      tax_status: 'final_consumer' as const,
      full_name: '',
      company_name: '',
      tax_id: '',
      phone: '',
      email: '',
      delivery_address: '',
      billing_address: '',
      notes: '',
    },
  });

  const category = watch('category');

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        tax_status: initialData.tax_status ?? 'final_consumer',
        company_name: initialData.company_name || '',
        tax_id: initialData.tax_id || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        delivery_address: initialData.delivery_address || '',
        billing_address: initialData.billing_address || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  // Auto-switch tax_status to the appropriate default when category changes.
  const isFirstRender = initialData == null;
  useEffect(() => {
    if (isFirstRender) {
      setValue('tax_status', getDefaultTaxStatus(category));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const onFormSubmit = (data: any) => {
    const normalizedData = {
      ...data,
      phone: data.phone ? normalizePhone(data.phone) : null,
    };
    onSubmit(normalizedData);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={2}>
            {/* Categoría */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.category} disabled={isReadOnly}>
                <InputLabel id="category-label">Categoría</InputLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select labelId="category-label" label="Categoría" {...field}>
                      {(Object.entries(CATEGORY_LABELS) as [keyof typeof CATEGORY_LABELS, string][]).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.category?.message}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Condición Impositiva */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.tax_status} disabled={isReadOnly}>
                <InputLabel id="tax-status-label">Condición Impositiva</InputLabel>
                <Controller
                  name="tax_status"
                  control={control}
                  render={({ field }) => (
                    <Select labelId="tax-status-label" label="Condición Impositiva" {...field}>
                      {(Object.entries(TAX_STATUS_LABELS) as [keyof typeof TAX_STATUS_LABELS, string][]).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.tax_status?.message}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Nombre Completo */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre Completo"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            {/* Teléfono con Máscara */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    label="Teléfono"
                    fullWidth
                    disabled={isReadOnly}
                    mask="+54 (9) 000 000-0000"
                    placeholder="+54 (9) 11 1234-5678"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            {/* Dirección de Entrega */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="delivery_address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dirección de Entrega"
                    fullWidth
                    disabled={isReadOnly}
                    multiline
                    rows={2}
                    error={!!errors.delivery_address}
                    helperText={errors.delivery_address?.message}
                  />
                )}
              />
            </Grid>

            {/* Campos Dinámicos para Mayoristas */}
            {category === 'wholesale' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }}>Datos de Empresa</Divider>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="company_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Razón Social"
                        fullWidth
                        disabled={isReadOnly}
                        error={!!errors.company_name}
                        helperText={errors.company_name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="tax_id"
                    control={control}
                    render={({ field }) => (
                      <MaskedInput
                        {...field}
                        label="CUIT / DNI"
                        fullWidth
                        disabled={isReadOnly}
                        mask={[
                          { mask: '00000000' },
                          { mask: '00-00000000-0' }
                        ]}
                        error={!!errors.tax_id}
                        helperText={errors.tax_id?.message || '8 dígitos para DNI, 11 para CUIT'}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="billing_address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dirección de Facturación"
                        fullWidth
                        disabled={isReadOnly}
                        error={!!errors.billing_address}
                        helperText={errors.billing_address?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Notas */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notas"
                    fullWidth
                    disabled={isReadOnly}
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>

            {!isReadOnly && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </S.FormWrapper>
      </form>
    </>
  );
};
