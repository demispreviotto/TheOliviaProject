import type { PostgrestError } from '@supabase/supabase-js';

const DB_ERROR_MAP: Record<string, string> = {
  '23505': 'Ya existe un registro con esos datos (duplicado).',
  '23503': 'No se puede completar porque hay registros relacionados.',
  '23502': 'Hay campos obligatorios sin completar.',
  '42501': 'No tenés permisos para realizar esta acción.',
  'PGRST116': 'No se encontró el registro solicitado.',
  'PGRST301': 'Sesión expirada. Volvé a iniciar sesión.',
};

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Ocurrió un error inesperado.';

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as PostgrestError;
    return DB_ERROR_MAP[pgError.code] ?? `Error: ${pgError.message}`;
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
    return 'Sin conexión. Verificá tu internet e intentá de nuevo.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
};
