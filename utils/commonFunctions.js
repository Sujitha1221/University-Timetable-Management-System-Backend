const isValidEmail = (email) => {
  // Regular expression for basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Sri Lankan phone number format
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(?:\+?94|0)?(?:77\d{7})$/;
  return phoneRegex.test(phone);
};

// Validate password strength
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};

module.exports = { isValidEmail, validatePhoneNumber, validatePassword };
