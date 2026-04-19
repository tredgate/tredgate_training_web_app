import { useState, useCallback, type FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  setField: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldTouched: (name: keyof T) => void;
  validate: () => boolean;
  reset: (newValues?: T) => void;
  handleSubmit: (onValid: (values: T) => void) => (e: FormEvent) => void;
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validateFn: (values: T) => FormErrors<T>,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setField = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldTouched = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = validateFn(values);
    setErrors(result);
    return Object.keys(result).length === 0;
  }, [values, validateFn]);

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues],
  );

  const handleSubmit = useCallback(
    (onValid: (values: T) => void) => (e: FormEvent) => {
      e.preventDefault();
      const result = validateFn(values);
      setErrors(result);
      // Mark all fields as touched so errors display immediately
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>,
      );
      setTouched(allTouched);
      if (Object.keys(result).length === 0) {
        onValid(values);
      }
    },
    [values, validateFn],
  );

  return {
    values,
    errors,
    touched,
    setField,
    setFieldTouched,
    validate,
    reset,
    handleSubmit,
  };
}
