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
  Typography,
  Divider,
  Grid,
  Box
} from '@mui/material';
import * as S from './CustomerForm.styles';
import type { Customer } from '../api/customer.types';
import { isValidTaxId } from '../../../utils/validators';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { normalizePhone } from '../../../utils/formatters';

const schema = z.object({
  category: z.enum(['individual', 'wholesale']),
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
}).refine((data) => {
  if (data.category === 'wholesale') {
    return !!data.company_name && !!data.tax_id && !!data.billing_address;
  }
  return true;
}, {
  message: "Los campos de empresa, CUIT y dirección de facturación son obligatorios para mayoristas",
  path: ["company_name"], // We'll show the error general or specific
});

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const CustomerForm = ({ initialData, onSubmit, isLoading }: CustomerFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'individual',
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

  const onFormSubmit = (data: any) => {
    // Normalizar teléfono antes de enviar
    const normalizedData = {
      ...data,
      phone: data.phone ? normalizePhone(data.phone) : null,
    };
    onSubmit(normalizedData);
  };

  return (
    <S.FormContainer elevation={2}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {initialData ? 'Editar Cliente' : 'Nuevo Cliente'}
      </Typography>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={2}>
            {/* Categoría */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-label">Categoría</InputLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="category-label"
                      label="Categoría"
                      {...field}
                    >
                      <MenuItem value="individual">Individual</MenuItem>
                      <MenuItem value="wholesale">Mayorista</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.category?.message}</FormHelperText>
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
                        mask={[
                          { mask: '00000000' }, // DNI
                          { mask: '00-00000000-0' } // CUIT
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
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>

            {/* Botón de envío */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" disabled={isLoading} onClick={() => reset()}>
                  Limpiar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </S.FormWrapper>
      </form>
    </S.FormContainer>
  );
};
