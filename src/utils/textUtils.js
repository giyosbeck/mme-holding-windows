/**
 * Capitalizes the first letter of a string (sentence case)
 * @param {string} text - The text to capitalize
 * @returns {string} - Text with first letter capitalized
 * @example
 * capitalizeFirstLetter('office supplies') // 'Office supplies'
 * capitalizeFirstLetter('BOOKS') // 'Books'
 */
export const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
