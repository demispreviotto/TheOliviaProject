import { useEffect, useState } from 'react';
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
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { PRODUCT_CATEGORIES, CATEGORY_IDS, type Product, type ProductType } from '../api/product.types';
import * as S from './ProductForm.styles';

const schema = z.object({
  variety: z.string().min(1, 'Nombre demasiado corto'),
  product_category: z.enum(CATEGORY_IDS),
  unit: z.coerce.number().min(1, 'Mínimo 1 unidad'),
  grams: z.preprocess(
    (v) => (v === null || v === '' || v === undefined ? null : v),
    z.coerce.number().nullable()
  ),
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

export const ProductForm = ({ initialData, onSubmit, onCancel, isLoading, isReadOnly = false }: ProductFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      variety: '',
      product_category: 'pepas' as ProductType,
      unit: 1,
      grams: null,
      wholesale_price: 0,
      retail_price: 0,
      is_active: true,
    },
  });

  const [isGramMode, setIsGramMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setIsGramMode(!!initialData.grams);
    }
  }, [initialData, reset]);

  // Keep unit locked to 1 in gram mode so the hidden field never fails min(1)
  useEffect(() => {
    if (isGramMode) setValue('unit', 1);
  }, [isGramMode, setValue]);

  const handleToggleMode = (checked: boolean) => {
    setIsGramMode(checked);
    if (checked) {
      setValue('unit', 1);
    } else {
      setValue('grams', null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.FormWrapper>
          <Grid container spacing={3}>

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
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.product_category?.message}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Nombre */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="variety"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Variedad: ej: de Membrillo, de Naranja, de Maicena"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.variety}
                    helperText={errors.variety?.message}
                  />
                )}
              />
            </Grid>

            {/* MODE SWITCHER */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isGramMode}
                      onChange={(e) => handleToggleMode(e.target.checked)}
                      disabled={isReadOnly}
                    />
                  }
                  label={isGramMode ? "Venta por Peso (Gramos)" : "Venta por Unidad"}
                />
              </Box>
            </Grid>

            {/* QUANTITY INPUT — unit or grams, always both registered */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Cantidad de Unidades"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                    sx={{ display: isGramMode ? 'none' : undefined }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>[u]</Box>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="grams"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Cantidad en Gramos"
                    type="number"
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.grams}
                    helperText={errors.grams?.message}
                    sx={{ display: isGramMode ? undefined : 'none' }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>[g]</Box>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />
              {isGramMode && (
                <FormHelperText sx={{ ml: 2 }}>* Se registrará automáticamente como 1 unidad de X gramos.</FormHelperText>
              )}
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
