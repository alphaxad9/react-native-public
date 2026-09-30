// Validation rules for the inspection form
export interface ValidationErrors {
  vendorAlias?: string;
  stallCode?: string;
  category?: string;
  contactNumber?: string;
  riskLevel?: string;
  consent?: string;
}

export function validateVendorAlias(value: string): string | undefined {
  if (!value.trim()) {
    return 'Vendor alias is required.';
  }
  if (value.trim().length < 3) {
    return 'Vendor alias must be at least 3 characters.';
  }
  return undefined;
}

export function validateStallCode(value: string): string | undefined {
  if (!value.trim()) {
    return 'Stall code is required.';
  }
  // Exact pattern: ST- followed by 3 digits (e.g., ST-001, ST-123)
  const pattern = /^ST-\d{3}$/;
  if (!pattern.test(value)) {
    return 'Invalid stall code. Use the format ST-001.';
  }
  return undefined;
}

export function validateCategory(value: string | null): string | undefined {
  if (!value) {
    return 'Please select a category.';
  }
  return undefined;
}

export function validateContactNumber(value: string): string | undefined {
  if (!value.trim()) {
    return 'Contact number is required.';
  }
  // Rwanda-style fictional format: +250 followed by 9 digits
  const pattern = /^\+250\d{9}$/;
  if (!pattern.test(value)) {
    return 'Enter a valid Rwanda-style fictional number (e.g., +250781234567).';
  }
  return undefined;
}

export function validateRiskLevel(value: string | null): string | undefined {
  if (!value) {
    return 'Please select a risk level.';
  }
  return undefined;
}

export function validateConsent(value: boolean): string | undefined {
  if (!value) {
    return 'Consent confirmation is required.';
  }
  return undefined;
}

export function validateInspectionForm(data: {
  vendorAlias: string;
  stallCode: string;
  category: string | null;
  contactNumber: string;
  riskLevel: string | null;
  consent: boolean;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  
  const vendorAliasError = validateVendorAlias(data.vendorAlias);
  if (vendorAliasError) errors.vendorAlias = vendorAliasError;
  
  const stallCodeError = validateStallCode(data.stallCode);
  if (stallCodeError) errors.stallCode = stallCodeError;
  
  const categoryError = validateCategory(data.category);
  if (categoryError) errors.category = categoryError;
  
  const contactNumberError = validateContactNumber(data.contactNumber);
  if (contactNumberError) errors.contactNumber = contactNumberError;
  
  const riskLevelError = validateRiskLevel(data.riskLevel);
  if (riskLevelError) errors.riskLevel = riskLevelError;
  
  const consentError = validateConsent(data.consent);
  if (consentError) errors.consent = consentError;
  
  return errors;
}