import { useState, useCallback } from "react";

export const useFormValidation = (initialValues, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      if (validate) {
        const newErrors = validate(values);
        if (newErrors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: newErrors[name],
          }));
        }
      }
    },
    [values, validate],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      if (validate) {
        const newErrors = validate(values);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validate],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError,
    setValues,
  };
};
