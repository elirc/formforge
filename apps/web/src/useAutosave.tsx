import type { FormSchema } from "@formforge/core";
import { useEffect, useRef, useState } from "react";

export type DraftSaveResult =
  | { readonly status: "saved"; readonly version: number }
  | { readonly status: "conflict"; readonly serverVersion: number };

export type DraftSaver = (schema: FormSchema, expectedVersion: number) => Promise<DraftSaveResult>;
export type AutosaveState =
  | { readonly status: "idle" }
  | { readonly status: "queued" }
  | { readonly status: "saving" }
  | { readonly status: "saved"; readonly version: number }
  | { readonly status: "conflict"; readonly serverVersion: number };

export function useAutosave(schema: FormSchema, save: DraftSaver, delay = 500): AutosaveState {
  const [state, setState] = useState<AutosaveState>({ status: "idle" });
  const [version, setVersion] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setState({ status: "queued" });
    const timer = window.setTimeout(() => {
      setState({ status: "saving" });
      void save(schema, version).then((result) => {
        if (result.status === "saved") {
          setVersion(result.version);
          setState({ status: "saved", version: result.version });
        } else {
          setState({ status: "conflict", serverVersion: result.serverVersion });
        }
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, save, schema]);

  return state;
}

export function AutosaveStatus({ state }: { state: AutosaveState }) {
  const message = state.status === "idle" ? "All changes saved"
    : state.status === "queued" ? "Changes queued"
      : state.status === "saving" ? "Saving draft…"
        : state.status === "saved" ? `Saved version ${state.version}`
          : `Save conflict with server version ${state.serverVersion}`;
  return <div className={`autosave-status ${state.status}`} role="status"><span aria-hidden="true" />{message}</div>;
}
