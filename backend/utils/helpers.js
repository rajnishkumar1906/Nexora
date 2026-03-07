// utils/helpers.js
/**
 * Generate a random invite code
 */
export const generateInviteCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format response
 */
export const formatResponse = (success, message, data = {}) => {
  return {
    success,
    message,
    ...data
  };
};

/**
 * Handle async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
