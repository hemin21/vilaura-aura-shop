// Validation utilities for form inputs
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Indian phone number validation (exactly 10 digits, starting with 6-9)
  const cleaned = phone.replace(/\D/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  return cleaned.length === 10 && phoneRegex.test(cleaned);
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
  
  // Limit to 10 digits and format as XXXXX-XXXXX for Indian mobile numbers
  const limited = cleaned.slice(0, 10);
  if (limited.length >= 5) {
    return limited.replace(/(\d{5})(\d{0,5})/, '$1-$2').replace(/-$/, '');
  }
  return limited;
};

// Fetch city and state from pincode
export const fetchPlaceFromPincode = async (pincode: string): Promise<{city: string, state: string} | null> => {
  try {
    if (!validatePincode(pincode)) return null;
    
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District || postOffice.Block || '',
        state: postOffice.State || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching place from pincode:', error);
    return null;
  }
};