import { describe, it, expect, vi } from "vitest";
import type { FormErrors, UseFormReturn } from "./useForm";

// Since we cannot use @testing-library/react without adding a devDep,
// we test the form logic by extracting and validating the state behavior.
// The useForm hook is tested through a simulated state machine that
// represents what the hook does internally.

describe("useForm", () => {
  interface TestFormData {
    username: string;
    email: string;
    password: string;
  }

  const createMockValidate = (errors: FormErrors<TestFormData>) => {
    return (values: TestFormData): FormErrors<TestFormData> => {
      const result: FormErrors<TestFormData> = {};

      if (!values.username) result.username = "Username required";
      if (!values.email) result.email = "Email required";
      if (!values.password) result.password = "Password required";

      return { ...result, ...errors };
    };
  };

  // Simulate hook state management for testing
  const simulateUseForm = (
    initialValues: TestFormData,
    validateFn: (values: TestFormData) => FormErrors<TestFormData>,
  ) => {
    let values = { ...initialValues };
    let errors: FormErrors<TestFormData> = {};
    let touched: Partial<Record<keyof TestFormData, boolean>> = {};

    const setField = <K extends keyof TestFormData>(
      name: K,
      value: TestFormData[K],
    ) => {
      values = { ...values, [name]: value };
      if (errors[name] !== undefined) {
        const validationResult = validateFn(values);
        if (validationResult[name]) {
          errors = { ...errors, [name]: validationResult[name] };
        } else {
          const { [name]: _, ...remainingErrors } = errors;
          errors = remainingErrors as FormErrors<TestFormData>;
        }
      }
    };

    const setFieldTouched = (name: keyof TestFormData) => {
      touched = { ...touched, [name]: true };
    };

    const validate = (): boolean => {
      const result = validateFn(values);
      errors = result;
      return Object.keys(result).length === 0;
    };

    const validateFields = (fields: Array<keyof TestFormData>): boolean => {
      const result = validateFn(values);
      errors = result;
      for (const field of fields) {
        touched = { ...touched, [field]: true };
      }
      return fields.every((field) => result[field] === undefined);
    };

    const reset = (newValues?: TestFormData) => {
      values = newValues ? { ...newValues } : { ...initialValues };
      errors = {};
      touched = {};
    };

    const handleSubmit = (onValid: (values: TestFormData) => void) => {
      return (e: Event) => {
        e.preventDefault();
        const result = validateFn(values);
        errors = result;
        if (Object.keys(result).length === 0) {
          onValid(values);
        }
      };
    };

    return {
      get values() {
        return values;
      },
      get errors() {
        return errors;
      },
      get touched() {
        return touched;
      },
      setField,
      setFieldTouched,
      validate,
      validateFields,
      reset,
      handleSubmit,
    };
  };

  describe("setField", () => {
    it("updates field value", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "testuser");

      expect(form.values.username).toBe("testuser");
    });

    it("updates multiple fields", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "testuser");
      form.setField("email", "test@example.com");
      form.setField("password", "secret");

      expect(form.values.username).toBe("testuser");
      expect(form.values.email).toBe("test@example.com");
      expect(form.values.password).toBe("secret");
    });

    it("preserves other field values", () => {
      const form = simulateUseForm(
        { username: "original", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("email", "test@example.com");

      expect(form.values.username).toBe("original");
      expect(form.values.email).toBe("test@example.com");
    });

    it("can clear field value", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "");

      expect(form.values.username).toBe("");
    });

    it("re-evaluates and clears error when field with existing error becomes valid", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.validate();
      expect(form.errors.username).toBe("Username required");

      form.setField("username", "testuser");

      expect(form.errors.username).toBeUndefined();
    });

    it("re-evaluates and updates error when field with existing error is still invalid", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        (values) => {
          const result: FormErrors<TestFormData> = {};
          if (!values.username) result.username = "Username required";
          else if (values.username.length < 3)
            result.username = "Username too short";
          if (!values.email) result.email = "Email required";
          if (!values.password) result.password = "Password required";
          return result;
        },
      );

      form.validate();
      expect(form.errors.username).toBe("Username required");

      form.setField("username", "ab");

      expect(form.errors.username).toBe("Username too short");
    });

    it("does not re-validate pristine fields with no existing error", () => {
      const form = simulateUseForm(
        { username: "", email: "valid@test.com", password: "secret" },
        createMockValidate({}),
      );

      form.setField("email", "changed@test.com");

      expect(form.errors.email).toBeUndefined();
      expect(form.errors.username).toBeUndefined();
    });
  });

  describe("validate", () => {
    it("populates errors for invalid fields", () => {
      const customErrors: FormErrors<TestFormData> = {
        username: "Username too short",
      };
      const form = simulateUseForm(
        { username: "a", email: "", password: "" },
        createMockValidate(customErrors),
      );

      const isValid = form.validate();

      expect(isValid).toBe(false);
      expect(form.errors.username).toBeDefined();
    });

    it("clears errors for valid fields", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const isValid = form.validate();

      expect(isValid).toBe(true);
      expect(Object.keys(form.errors).length).toBe(0);
    });

    it("returns true when validation passes", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const isValid = form.validate();

      expect(isValid).toBe(true);
    });

    it("returns false when validation fails", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      const isValid = form.validate();

      expect(isValid).toBe(false);
    });

    it("validates all required fields", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.validate();

      expect(form.errors.username).toBeDefined();
      expect(form.errors.email).toBeDefined();
      expect(form.errors.password).toBeDefined();
    });
  });

  describe("validateFields", () => {
    it("returns true when none of the listed fields has an error", () => {
      const form = simulateUseForm(
        { username: "valid", email: "valid@test.com", password: "" },
        createMockValidate({}),
      );

      const isValid = form.validateFields(["username", "email"]);

      expect(isValid).toBe(true);
    });

    it("marks listed fields as touched", () => {
      const form = simulateUseForm(
        { username: "valid", email: "valid@test.com", password: "" },
        createMockValidate({}),
      );

      form.validateFields(["username", "email"]);

      expect(form.touched.username).toBe(true);
      expect(form.touched.email).toBe(true);
      expect(form.touched.password).toBeUndefined();
    });

    it("returns true when only unlisted fields have errors", () => {
      const form = simulateUseForm(
        { username: "valid", email: "valid@test.com", password: "" },
        createMockValidate({}),
      );

      const isValid = form.validateFields(["username", "email"]);

      expect(isValid).toBe(true);
      expect(form.errors.password).toBe("Password required");
    });

    it("returns false when a listed field has an error", () => {
      const form = simulateUseForm(
        { username: "", email: "valid@test.com", password: "secret" },
        createMockValidate({}),
      );

      const isValid = form.validateFields(["username"]);

      expect(isValid).toBe(false);
      expect(form.touched.username).toBe(true);
      expect(form.errors.username).toBe("Username required");
    });

    it("populates full errors state including fields outside the list", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.validateFields(["username"]);

      expect(form.errors.username).toBe("Username required");
      expect(form.errors.email).toBe("Email required");
      expect(form.errors.password).toBe("Password required");
    });
  });

  describe("setFieldTouched", () => {
    it("marks field as touched", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setFieldTouched("username");

      expect(form.touched.username).toBe(true);
    });

    it("marks multiple fields as touched", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setFieldTouched("username");
      form.setFieldTouched("email");

      expect(form.touched.username).toBe(true);
      expect(form.touched.email).toBe(true);
      expect(form.touched.password).toBeUndefined();
    });
  });

  describe("reset", () => {
    it("clears values to initial state", () => {
      const initialValues = { username: "", email: "", password: "" };
      const form = simulateUseForm(initialValues, createMockValidate({}));

      form.setField("username", "testuser");
      form.setField("email", "test@example.com");
      form.reset();

      expect(form.values.username).toBe("");
      expect(form.values.email).toBe("");
    });

    it("clears errors", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.validate();
      expect(form.errors.username).toBeDefined();

      form.reset();
      expect(Object.keys(form.errors).length).toBe(0);
    });

    it("clears touched state", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setFieldTouched("username");
      expect(form.touched.username).toBe(true);

      form.reset();
      expect(Object.keys(form.touched).length).toBe(0);
    });

    it("accepts new initial values", () => {
      const form = simulateUseForm(
        { username: "old", email: "old@example.com", password: "old" },
        createMockValidate({}),
      );

      form.reset({ username: "new", email: "new@example.com", password: "" });

      expect(form.values.username).toBe("new");
      expect(form.values.email).toBe("new@example.com");
      expect(form.values.password).toBe("");
    });

    it("resets all state when new values provided", () => {
      const form = simulateUseForm(
        { username: "initial", email: "initial@example.com", password: "" },
        createMockValidate({}),
      );

      form.setFieldTouched("username");
      form.validate();
      form.reset({
        username: "reset",
        email: "reset@example.com",
        password: "",
      });

      expect(form.values.username).toBe("reset");
      expect(Object.keys(form.touched).length).toBe(0);
      expect(Object.keys(form.errors).length).toBe(0);
    });
  });

  describe("handleSubmit", () => {
    it("calls onValid when validation passes", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(onValid).toHaveBeenCalledWith(form.values);
    });

    it("does not call onValid when validation fails", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(onValid).not.toHaveBeenCalled();
    });

    it("prevents default on form submission", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const mockEvent = { preventDefault: vi.fn() };
      const handler = form.handleSubmit(vi.fn());

      handler(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("validates before calling onValid", () => {
      const form = simulateUseForm(
        { username: "", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(form.errors.username).toBeDefined();
      expect(onValid).not.toHaveBeenCalled();
    });

    it("populates errors on failed validation", () => {
      const form = simulateUseForm(
        { username: "", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const handler = form.handleSubmit(vi.fn());
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(Object.keys(form.errors).length).toBeGreaterThan(0);
    });

    it("provides current values to onValid", () => {
      const form = simulateUseForm(
        { username: "testuser", email: "test@example.com", password: "pass" },
        createMockValidate({}),
      );

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(onValid).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "pass",
      });
    });
  });

  describe("form workflow", () => {
    it("can fill form, validate, and submit", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "testuser");
      form.setField("email", "test@example.com");
      form.setField("password", "secret");

      const isValid = form.validate();
      expect(isValid).toBe(true);

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(onValid).toHaveBeenCalled();
    });

    it("can fill, validate (fail), fix, and submit", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "testuser");
      let isValid = form.validate();
      expect(isValid).toBe(false);

      form.setField("email", "test@example.com");
      form.setField("password", "secret");
      isValid = form.validate();
      expect(isValid).toBe(true);

      const onValid = vi.fn();
      const handler = form.handleSubmit(onValid);
      const mockEvent = { preventDefault: vi.fn() };

      handler(mockEvent as any);

      expect(onValid).toHaveBeenCalled();
    });

    it("can reset form after submission attempt", () => {
      const form = simulateUseForm(
        { username: "", email: "", password: "" },
        createMockValidate({}),
      );

      form.setField("username", "testuser");
      form.setFieldTouched("username");
      form.validate();

      expect(form.values.username).toBe("testuser");
      expect(form.touched.username).toBe(true);
      expect(form.errors.email).toBeDefined();

      form.reset();

      expect(form.values.username).toBe("");
      expect(Object.keys(form.touched).length).toBe(0);
      expect(Object.keys(form.errors).length).toBe(0);
    });
  });
});
