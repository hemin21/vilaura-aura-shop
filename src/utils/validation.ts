// Validation utilities for form inputs
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Indian phone number validation (10 digits, optionally starting with +91)
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validatePincode = (pincode: string): boolean => {
  // Indian pincode validation (6 digits)
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const validateName = (name: string): boolean => {
  // Name should only contain letters and spaces, at least 2 characters
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
};

export const validateAddress = (address: string): boolean => {
  // Address should be at least 10 characters and contain some text
  return address.trim().length >= 10;
};

export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(0)}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX for display
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return cleaned;
};