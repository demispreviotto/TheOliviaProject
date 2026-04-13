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
