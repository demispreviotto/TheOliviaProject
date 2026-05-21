/**
 * Removes all non-numeric characters from a string.
 * Used for cleaning phone numbers and tax IDs before saving.
 */
export const cleanNumericString = (str: string): string => {
  return str.replace(/[^\d]/g, '');
};

/**
 * Normalizes a phone number for storage.
 * e.g. +54 (9) 11 2233-4455 -> 5491122334455
 */
export const normalizePhone = (phone: string): string => {
  return cleanNumericString(phone);
};

export const formatDate = (dateStr: string): string => {
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);