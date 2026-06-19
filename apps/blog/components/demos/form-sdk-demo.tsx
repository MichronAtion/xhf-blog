"use client";

import { useState } from "react";
import { z } from "zod";
import type { FormState } from "@repo/form-sdk";
import { useForm } from "@repo/form-sdk/react";

const contactSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字符"),
  email: z.string().email("请输入有效邮箱"),
  message: z.string().min(10, "留言至少 10 个字符").max(500, "留言不超过 500 字"),
});

type ContactValues = z.infer<typeof contactSchema>;

const initialValues: ContactValues = {
  name: "",
  email: "",
  message: "",
};

type Tab = "react" | "vanilla";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function FormSdkDemo() {
  const [tab, setTab] = useState<Tab>("react");
  const [lastSubmit, setLastSubmit] = useState<ContactValues | null>(null);

  const form = useForm({
    schema: contactSchema,
    initialValues,
    validateOnBlur: true,
    async onSubmit(values: ContactValues) {
      await delay(800);
      if (values.email.includes("fail")) {
        throw new Error("模拟服务端错误：邮箱不可用");
      }
      setLastSubmit(values);
    },
  });

  const name = form.bindField("name");
  const email = form.bindField("email");
  const message = form.bindField("message");

  return (
    <div className="mt-8 space-y-8">
      <div className="flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
        {(
          [
            ["react", "React 适配层"],
            ["vanilla", "原生 createForm"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "react" ? (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void form.submit();
          }}
          noValidate
        >
          <Field
            label="姓名"
            binding={name}
            inputProps={{
              type: "text",
              placeholder: "张三",
              autoComplete: "name",
            }}
          />
          <Field
            label="邮箱"
            binding={email}
            hint='输入含 "fail" 的邮箱可触发服务端错误'
            inputProps={{
              type: "email",
              placeholder: "you@example.com",
              autoComplete: "email",
            }}
          />
          <Field
            label="留言"
            binding={message}
            multiline
            inputProps={{
              placeholder: "至少 10 个字符…",
              rows: 4,
            }}
          />

          {form.errors._form ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {form.errors._form}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {form.isSubmitting ? "提交中…" : "提交"}
            </button>
            <button
              type="button"
              onClick={() => {
                form.reset();
                setLastSubmit(null);
              }}
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              重置
            </button>
            <StatusPills form={form} />
          </div>
        </form>
      ) : (
        <VanillaDemo onSuccess={setLastSubmit} />
      )}

      {lastSubmit ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            上次提交成功
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-emerald-900 dark:text-emerald-100">
            {JSON.stringify(lastSubmit, null, 2)}
          </pre>
        </div>
      ) : null}

      <StateInspector state={form} />
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  multiline?: boolean;
  binding: {
    value: string;
    error: string | undefined;
    touched: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
  };
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>;
};

function Field({ label, hint, multiline, binding, inputProps }: FieldProps) {
  const showError = binding.touched && binding.error;
  const id = label.toLowerCase();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      {hint ? (
        <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>
      ) : null}
      {multiline ? (
        <textarea
          id={id}
          className={inputClass(showError)}
          {...inputProps}
          value={binding.value}
          onChange={(e) => binding.onChange(e.target.value)}
          onBlur={binding.onBlur}
        />
      ) : (
        <input
          id={id}
          className={inputClass(showError)}
          {...inputProps}
          value={binding.value}
          onChange={(e) => binding.onChange(e.target.value)}
          onBlur={binding.onBlur}
        />
      )}
      {showError ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{binding.error}</p>
      ) : null}
    </div>
  );
}

function inputClass(hasError: string | false | undefined) {
  return `mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 dark:bg-zinc-900 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-200 dark:border-red-800 dark:focus:ring-red-900/40"
      : "border-zinc-300 focus:border-emerald-400 focus:ring-emerald-200 dark:border-zinc-700 dark:focus:ring-emerald-900/40"
  }`;
}

function StatusPills({
  form,
}: {
  form: {
    isDirty: boolean;
    isValid: boolean;
    isValidating: boolean;
    submitCount: number;
  };
}) {
  const pills = [
    ["dirty", form.isDirty],
    ["valid", form.isValid],
    ["validating", form.isValidating],
  ] as const;

  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      {pills.map(([key, on]) => (
        <span
          key={key}
          className={`rounded-full px-2 py-0.5 font-mono ${
            on
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          {key}
        </span>
      ))}
      <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        submits:{form.submitCount}
      </span>
    </div>
  );
}

function StateInspector({
  state,
}: {
  state: {
    values: ContactValues;
    errors: Record<string, string | undefined>;
    touched: Record<string, boolean | undefined>;
  };
}) {
  return (
    <details className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        实时表单状态（form.getState()）
      </summary>
      <pre className="overflow-x-auto border-t border-zinc-200 px-4 py-3 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {JSON.stringify(
          { values: state.values, errors: state.errors, touched: state.touched },
          null,
          2,
        )}
      </pre>
    </details>
  );
}

/** 原生 API 演示：不经过 React hook，手动 subscribe + 操作 DOM */
function VanillaDemo({
  onSuccess,
}: {
  onSuccess: (values: ContactValues) => void;
}) {
  const [output, setOutput] = useState("点击下方按钮初始化原生表单控制器…");

  const runVanilla = () => {
    void import("@repo/form-sdk").then(({ createForm }) => {
      const form = createForm({
        schema: contactSchema,
        initialValues,
        validateOnBlur: true,
        async onSubmit(values: ContactValues) {
          await delay(600);
          onSuccess(values);
          setOutput(`提交成功：\n${JSON.stringify(values, null, 2)}`);
        },
      });

      const name = form.bindField("name");
      const email = form.bindField("email");

      name.onChange("李四");
      email.onChange("li@example.com");
      form.setFieldValue("message", "这是通过 createForm 原生 API 填入的留言。");

      const unsub = form.subscribe((s: FormState<ContactValues>) => {
        setOutput(
          [
            "subscribe 推送的状态：",
            JSON.stringify(
              { values: s.values, errors: s.errors, isValid: s.isValid, isDirty: s.isDirty },
              null,
              2,
            ),
          ].join("\n"),
        );
      });

      void form.submit().then(() => {
        unsub();
      });
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        此标签页演示框架无关用法：直接调用{" "}
        <code className="font-mono text-xs">createForm</code> +{" "}
        <code className="font-mono text-xs">subscribe</code>，无需 React 或 Vue。Vue
        项目用 <code className="font-mono text-xs">useForm</code> composable 即可得到相同能力。
      </p>
      <button
        type="button"
        onClick={runVanilla}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        运行原生 demo（自动填表并提交）
      </button>
      <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-300">
        {output}
      </pre>
    </div>
  );
}
