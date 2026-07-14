// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 6 characters)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Login form validation
export const validateLoginForm = (values) => {
  const errors = {};

  if (!validateRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Please enter a valid email";
  }

  if (!validateRequired(values.password)) {
    errors.password = "Password is required";
  } else if (!validatePassword(values.password)) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

// Register form validation
export const validateRegisterForm = (values) => {
  const errors = {};

  if (!validateRequired(values.name)) {
    errors.name = "Name is required";
  }

  if (!validateRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Please enter a valid email";
  }

  if (!validateRequired(values.password)) {
    errors.password = "Password is required";
  } else if (!validatePassword(values.password)) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!validateRequired(values.confirmPassword)) {
    errors.confirmPassword = "Confirm password is required";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

// Product form validation
export const validateProductForm = (values) => {
  const errors = {};

  if (!validateRequired(values.name)) {
    errors.name = "Product name is required";
  } else if (values.name.length < 3) {
    errors.name = "Product name must be at least 3 characters";
  }

  if (!validateRequired(values.description)) {
    errors.description = "Description is required";
  } else if (values.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!validateRequired(values.price)) {
    errors.price = "Price is required";
  } else if (!validateNumber(values.price, 0.01)) {
    errors.price = "Price must be a valid number greater than 0";
  }

  if (!validateRequired(values.stock)) {
    errors.stock = "Stock is required";
  } else if (!validateNumber(values.stock, 0)) {
    errors.stock = "Stock must be a valid number";
  }

  if (!validateRequired(values.category)) {
    errors.category = "Please select a category";
  }

  return errors;
};

// Checkout form validation
export const validateCheckoutForm = (values) => {
  const errors = {};

  if (!validateRequired(values.fullName)) {
    errors.fullName = "Full name is required";
  }

  if (!validateRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Please enter a valid email";
  }

  if (!validateRequired(values.phone)) {
    errors.phone = "Phone number is required";
  }

  if (!validateRequired(values.address)) {
    errors.address = "Address is required";
  }

  if (!validateRequired(values.city)) {
    errors.city = "City is required";
  }

  if (!validateRequired(values.postalCode)) {
    errors.postalCode = "Postal code is required";
  }

  return errors;
};
