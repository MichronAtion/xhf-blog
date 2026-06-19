import { useCallback, useRef, useSyncExternalStore } from "react";
import { createForm } from "./form.js";
import type { FormConfig, FormController, FormState, FormValues } from "./types.js";

export type UseFormReturn<T extends FormValues> = FormController<T> & FormState<T>;

function useFormController<T extends FormValues>(
  config: FormConfig<T>,
): FormController<T> {
  const controllerRef = useRef<FormController<T> | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createForm(config);
  }

  return controllerRef.current;
}

/**
 * React hook — subscribes to a {@link createForm} store via `useSyncExternalStore`.
 * Pass either a config (creates the form once) or an existing controller.
 */
export function useForm<T extends FormValues>(
  configOrController: FormConfig<T> | FormController<T>,
): UseFormReturn<T> {
  const isController = "subscribe" in configOrController;

  const configRef = useRef(isController ? null : configOrController);
  const controllerRef = useRef(
    isController ? configOrController : createForm(configOrController),
  );

  if (!isController && configRef.current !== configOrController) {
    configRef.current = configOrController;
    controllerRef.current = createForm(configOrController);
  }

  const controller = controllerRef.current;

  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(() => onStoreChange()),
    [controller],
  );

  const getSnapshot = useCallback(() => controller.getState(), [controller]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...controller,
    ...state,
  };
}
