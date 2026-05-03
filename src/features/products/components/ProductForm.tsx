// src/features/products/components/ProductForm.tsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  FormHelperText,
  Grid,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import type { Product, ProductType } from '../api/product.types';
import * as S from './ProductForm.styles';

const schema = z.object({
  variety: z.string().min(2, 'Nombre demasiado corto'),
  product_category: z.enum([
    'budin_integral', 'budin_avena', 'pepas', 'cookies', 'cookies_xl',
    'galletitas', 'alfajores', 'pan', 'talitas', 'galleta_marinera', 'torta',
  ]),
  presentation: z.string().optional().nullable(),
  unit: z.coerce.number().min(1, 'La unidad debe ser al menos 1'),
  grams: z.coerce.number().positive('Debe ser positivo').nullable().optional(),
  wholesale_price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  retail_price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  is_active: z.boolean().default(true),
});

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, onCancel, isLoading, isReadOnly=false }: ProductFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      variety: '',
      product_category: 'pepas' as ProductType,
      presentation: '',
      unit: 1,
      grams: null,
      wholesale_price: 0,
      retail_price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        presentation: initialData.presentation || '',
      });
    }
  }, [initialData, reset]);

  return (
<>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={3}>
            {/* Nombre / Variedad */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="variety"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Variedad"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.variety}
                    helperText={errors.variety?.message}
                  />
                )}
              />
            </Grid>

            {/* Categoría */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={isReadOnly} error={!!errors.product_category}>
                <InputLabel id="product-category-label">Categoría</InputLabel>
                <Controller
                  name="product_category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="product-category-label"
                      label="Categoría"
                      {...field}
                    >
                      <MenuItem value="budin_integral">Budín integral</MenuItem>
                      <MenuItem value="budin_avena">Budín avena</MenuItem>
                      <MenuItem value="pepas">Pepas</MenuItem>
                      <MenuItem value="cookies">Cookies</MenuItem>
                      <MenuItem value="cookies_xl">Cookies XL</MenuItem>
                      <MenuItem value="galletitas">Galletitas</MenuItem>
                      <MenuItem value="alfajores">Alfajores</MenuItem>
                      <MenuItem value="pan">Pan</MenuItem>
                      <MenuItem value="talitas">Talitas</MenuItem>
                      <MenuItem value="galleta_marinera">Galleta marinera</MenuItem>
                      <MenuItem value="torta">Torta</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.product_category?.message}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Presentación */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="presentation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Presentación (ej: Bolsa x 12, Pote 500g)"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.presentation}
                    helperText={errors.presentation?.message}
                  />
                )}
              />
            </Grid>

            {/* Presentación numérica */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unidades por presentación"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="grams"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                    label="Gramos por presentación (opcional)"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.grams}
                    helperText={errors.grams?.message}
                  />
                )}
              />
            </Grid>

            {/* Precios */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="retail_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio Minorista ($)"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.retail_price}
                    helperText={errors.retail_price?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="wholesale_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio Mayorista ($)"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.wholesale_price}
                    helperText={errors.wholesale_price?.message}
                  />
                )}
              />
            </Grid>

            {/* Estado Activo */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="is_active"
                control={control}
                disabled={isReadOnly}
                render={({ field }) => (
                  <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Producto Activo"
                  />
                )}
                />
            </Grid>

            {/* Botón de envío */}
                {!isReadOnly && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={onCancel}>Cancelar</Button>
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
            )}
          </Grid>
        </S.FormWrapper>
      </form>
</>
  );
};
