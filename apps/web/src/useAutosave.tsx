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
  | { readonly status: "conflict"; readonly serverVersion: number }
  | { readonly status: "error" };

export function useAutosave(schema: FormSchema, save: DraftSaver, delay = 500): AutosaveState {
  const [state, setState] = useState<AutosaveState>({ status: "idle" });
  const version = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const requestSequence = useRef(0);
  const latestRequest = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setState({ status: "queued" });
    const timer = window.setTimeout(() => {
      requestSequence.current += 1;
      const requestId = requestSequence.current;
      latestRequest.current = requestId;
      setState({ status: "saving" });
      queue.current = queue.current.then(async () => {
        const result = await save(schema, version.current);
        if (result.status === "saved") version.current = result.version;
        if (requestId !== latestRequest.current) return;
        setState(result.status === "saved" ? { status: "saved", version: result.version } : { status: "conflict", serverVersion: result.serverVersion });
      }).catch(() => {
        if (requestId === latestRequest.current) setState({ status: "error" });
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
          : state.status === "conflict" ? `Save conflict with server version ${state.serverVersion}`
            : "Draft could not be saved";
  return <div className={`autosave-status ${state.status}`} role="status"><span aria-hidden="true" />{message}</div>;
}
