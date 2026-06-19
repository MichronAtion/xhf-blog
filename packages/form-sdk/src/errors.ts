import type { ZodError, ZodType } from "zod";
import type { FormErrors, FormValues } from "./types.js";

export function flattenZodErrors<T extends FormValues>(
  error: ZodError,
): FormErrors<T> {
  const flat = error.flatten();
  const fieldErrors = flat.fieldErrors as Partial<Record<keyof T, string[]>>;
  const errors: FormErrors<T> = {};

  for (const key of Object.keys(fieldErrors) as (keyof T)[]) {
    const messages = fieldErrors[key];
    const first = messages?.[0];
    if (first) {
      (errors as Record<keyof T, string | undefined>)[key] = first;
    }
  }

  if (flat.formErrors[0]) {
    errors._form = flat.formErrors[0];
  }

  return errors;
}

export function parseWithSchema<T extends FormValues>(
  schema: ZodType<T>,
  values: T,
): { success: true; data: T } | { success: false; errors: FormErrors<T> } {
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: flattenZodErrors<T>(result.error) };
}

export function parseFieldWithSchema<T extends FormValues, K extends keyof T>(
  schema: ZodType<T>,
  values: T,
  name: K,
): string | undefined {
  const result = schema.safeParse(values);
  if (result.success) return undefined;

  const flat = result.error.flatten();
  const messages = (flat.fieldErrors as Record<string, string[] | undefined>)[
    name as string
  ];
  return messages?.[0];
}
