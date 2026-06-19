import type { ZodType } from "zod";

export type FormValues = Record<string, unknown>;

export type FormErrors<T extends FormValues> = {
  [K in keyof T]?: string;
} & {
  _form?: string;
};

export type FormState<T extends FormValues> = {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
};

export type FormConfig<T extends FormValues> = {
  schema: ZodType<T>;
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  /** Validate all fields on every value change. Default: false */
  validateOnChange?: boolean;
  /** Validate a field when it loses focus. Default: true */
  validateOnBlur?: boolean;
};

export type FieldBinding<T extends FormValues, K extends keyof T> = {
  name: K;
  value: T[K];
  error: string | undefined;
  touched: boolean;
  onChange: (value: T[K]) => void;
  onBlur: () => void;
};

export type FormListener<T extends FormValues> = (state: FormState<T>) => void;

export type FormController<T extends FormValues> = {
  getState: () => FormState<T>;
  subscribe: (listener: FormListener<T>) => () => void;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setFieldTouched: <K extends keyof T>(name: K, touched?: boolean) => void;
  setFieldError: <K extends keyof T>(name: K, message: string | undefined) => void;
  setFormError: (message: string | undefined) => void;
  validate: () => Promise<boolean>;
  validateField: <K extends keyof T>(name: K) => Promise<boolean>;
  submit: () => Promise<void>;
  reset: (values?: T) => void;
  bindField: <K extends keyof T>(name: K) => FieldBinding<T, K>;
};
