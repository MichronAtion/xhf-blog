import { onScopeDispose, shallowRef, type ShallowRef } from "vue";
import { createForm } from "./form.js";
import type { FormConfig, FormController, FormState, FormValues } from "./types.js";

export type UseFormReturn<T extends FormValues> = FormController<T> & {
  state: ShallowRef<FormState<T>>;
};

/**
 * Vue 3 composable — wraps a {@link createForm} controller with reactive `state`.
 * Requires `vue` as a peer dependency.
 */
export function useForm<T extends FormValues>(config: FormConfig<T>): UseFormReturn<T> {
  const controller = createForm(config);
  const state = shallowRef(controller.getState());

  const unsubscribe = controller.subscribe((next) => {
    state.value = next;
  });

  onScopeDispose(unsubscribe);

  return {
    ...controller,
    state,
  };
}
