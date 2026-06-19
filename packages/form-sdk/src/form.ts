import { parseFieldWithSchema, parseWithSchema } from "./errors.js";
import type {
  FieldBinding,
  FormConfig,
  FormController,
  FormErrors,
  FormListener,
  FormState,
  FormValues,
} from "./types.js";

function shallowEqual<T extends FormValues>(a: T, b: T): boolean {
  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

function hasErrors<T extends FormValues>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

export function createForm<T extends FormValues>(
  config: FormConfig<T>,
): FormController<T> {
  const {
    schema,
    initialValues,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
  } = config;

  let baseline = { ...initialValues };
  let state: FormState<T> = {
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  };

  const listeners = new Set<FormListener<T>>();

  const notify = () => {
    for (const listener of listeners) {
      listener(state);
    }
  };

  const setState = (patch: Partial<FormState<T>>) => {
    state = { ...state, ...patch };
    notify();
  };

  const recomputeFlags = (values: T, errors: FormErrors<T>) => {
    setState({
      values,
      errors,
      isValid: !hasErrors(errors),
      isDirty: !shallowEqual(values, baseline),
    });
  };

  const validateAll = async (): Promise<boolean> => {
    setState({ isValidating: true });
    const result = parseWithSchema(schema, state.values);
    const errors = result.success ? {} : result.errors;
    recomputeFlags(state.values, errors);
    setState({ isValidating: false });
    return result.success;
  };

  const validateSingleField = async <K extends keyof T>(
    name: K,
  ): Promise<boolean> => {
    setState({ isValidating: true });
    const message = parseFieldWithSchema(schema, state.values, name);
    const errors = { ...state.errors, [name]: message } as FormErrors<T>;
    if (!message) {
      delete errors[name];
    }
    recomputeFlags(state.values, errors);
    setState({ isValidating: false });
    return !message;
  };

  const controller: FormController<T> = {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setFieldValue(name, value) {
      const values = { ...state.values, [name]: value };
      recomputeFlags(values, state.errors);

      if (validateOnChange) {
        void validateSingleField(name);
      }
    },

    setValues(values) {
      const merged = { ...state.values, ...values };
      recomputeFlags(merged, state.errors);

      if (validateOnChange) {
        void validateAll();
      }
    },

    setFieldTouched(name, touched = true) {
      setState({
        touched: { ...state.touched, [name]: touched },
      });
    },

    setFieldError(name, message) {
      const fieldErrors = { ...state.errors } as { [P in keyof T]?: string };
      if (message) {
        fieldErrors[name] = message;
      } else {
        delete fieldErrors[name];
      }
      recomputeFlags(state.values, fieldErrors as FormErrors<T>);
    },

    setFormError(message) {
      const errors = { ...state.errors } as FormErrors<T>;
      if (message) {
        errors._form = message;
      } else {
        delete errors._form;
      }
      recomputeFlags(state.values, errors);
    },

    validate: validateAll,

    validateField: validateSingleField,

    async submit() {
      setState({
        submitCount: state.submitCount + 1,
        touched: Object.keys(state.values).reduce(
          (acc, key) => {
            acc[key as keyof T] = true;
            return acc;
          },
          {} as Partial<Record<keyof T, boolean>>,
        ),
      });

      const valid = await validateAll();
      if (!valid) return;

      setState({ isSubmitting: true, errors: {} });
      try {
        await onSubmit(state.values);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "提交失败，请稍后重试";
        controller.setFormError(message);
      } finally {
        setState({ isSubmitting: false });
      }
    },

    reset(values = initialValues) {
      baseline = { ...values };
      state = {
        values: { ...values },
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        isDirty: false,
        submitCount: 0,
      };
      notify();
    },

    bindField(name) {
      return {
        name,
        value: state.values[name],
        error: state.errors[name],
        touched: Boolean(state.touched[name]),
        onChange: (value) => controller.setFieldValue(name, value),
        onBlur: () => {
          controller.setFieldTouched(name, true);
          if (validateOnBlur) {
            void validateSingleField(name);
          }
        },
      } satisfies FieldBinding<T, typeof name>;
    },
  };

  return controller;
}
