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
  Typography,
  Grid,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import type { Product, ProductType } from '../api/product.types';
import * as S from './ProductForm.styles';

const schema = z.object({
  product_name: z.string().min(2, 'Nombre demasiado corto'),
  product_category: z.enum(['pepas', 'budin', 'cookies', 'alfajores', 'pan', 'talitas', 'torta']),
  presentation: z.string().optional().nullable(),
  wholesale_price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  retail_price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  is_active: z.boolean().default(true),
});

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, isLoading }: ProductFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      product_name: '',
      product_category: 'pepas' as ProductType,
      presentation: '',
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
    <S.FormContainer elevation={2}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="product_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del Producto"
                    fullWidth
                    error={!!errors.product_name}
                    helperText={errors.product_name?.message}
                  />
                )}
              />
            </Grid>

            {/* Categoría */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!errors.product_category}>
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
                      <MenuItem value="pepas">Pepas</MenuItem>
                      <MenuItem value="budin">Budín</MenuItem>
                      <MenuItem value="cookies">Cookies</MenuItem>
                      <MenuItem value="alfajores">Alfajores</MenuItem>
                      <MenuItem value="pan">Pan</MenuItem>
                      <MenuItem value="talitas">Talitas</MenuItem>
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
                    error={!!errors.presentation}
                    helperText={errors.presentation?.message}
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
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Producto Activo"
                  />
                )}
              />
            </Grid>

            {/* Botón de envío */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => reset()} disabled={isLoading}>
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
