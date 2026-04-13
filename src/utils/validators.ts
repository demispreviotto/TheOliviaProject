/**
 * Validates a CUIT/CUIL using the Module 11 algorithm.
 * Format: XX-XXXXXXXX-X (11 digits)
 */
export const isValidCUIT = (cuit: string): boolean => {
  const cleanCuit = cuit.replace(/[^\d]/g, '');
  
  if (cleanCuit.length !== 11) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;

  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 9;

  return checkDigit === parseInt(cleanCuit[10]);
};

/**
 * Validates a DNI.
 * Format: XXXXXXXX (8 digits)
 */
export const isValidDNI = (dni: string): boolean => {
  const cleanDni = dni.replace(/[^\d]/g, '');
  return cleanDni.length === 8;
};

/**
 * Validates a Tax ID (either CUIT or DNI).
 */
export const isValidTaxId = (taxId: string): boolean => {
  const clean = taxId.replace(/[^\d]/g, '');
  if (clean.length === 8) return isValidDNI(clean);
  if (clean.length === 11) return isValidCUIT(clean);
  return false;
};
