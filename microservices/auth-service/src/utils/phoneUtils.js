/**
 * Validates if the given string is a valid Indian mobile number.
 * Conditions:
 * 1. Exactly 10 digits (ignoring country code).
 * 2. Starts with 6, 7, 8, or 9.
 * 3. Optionally starts with +91, 91, or 0.
 * 
 * @param {string} number 
 * @returns {boolean}
 */
const isValidIndianNumber = (number) => {
  if (!number || typeof number !== 'string') return false;

  // Regex breakdown:
  // ^(?:\+91|91|0)?  -> Optional country code prefix (+91, 91, or 0)
  // \s?[-]?\s?        -> Optional separator (space or dash)
  // [6-9]             -> First digit must be 6, 7, 8, or 9
  // \d{9}$            -> Followed by exactly 9 digits
  
  // Clean separators first for a more reliable check
  const cleanNumber = number.replace(/[\s-]/g, '');
  const indianMobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  
  return indianMobileRegex.test(cleanNumber);
};

/**
 * Normalizes an Indian phone number to E.164 format (+91XXXXXXXXXX).
 * 
 * @param {string} number 
 * @returns {string|null} - Formatted number or null if invalid
 */
const formatToE164 = (number) => {
  if (!isValidIndianNumber(number)) return null;

  // 1. Remove all non-digit characters except the leading +
  let cleaned = number.replace(/[^\d+]/g, '');

  // 2. Handle the numeric part
  // Remove leading +91, 91, or 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // 3. Ensure we have exactly 10 digits left
  // Note: isValidIndianNumber already ensures the structure is correct
  // so whatever remains should be the 10 core digits.
  
  return `+91${cleaned.slice(-10)}`;
};

module.exports = {
  isValidIndianNumber,
  formatToE164
};
