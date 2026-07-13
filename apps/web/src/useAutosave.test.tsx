import { demoForm, type FormSchema } from "@formforge/core";
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutosaveStatus, useAutosave, type DraftSaver } from "./useAutosave.js";

function Harness({ save }: { save: DraftSaver }) {
  const [schema, setSchema] = useState<FormSchema>(demoForm);
  const state = useAutosave(schema, save, 300);
  return <><button type="button" onClick={() => setSchema((current) => ({ ...current, title: "Renamed" }))}>Rename</button><AutosaveStatus state={state} /></>;
}

describe("debounced autosave", () => {
  afterEach(() => vi.useRealTimers());

  it("waits for an editing pause and communicates the saved version", async () => {
    vi.useFakeTimers();
    const save = vi.fn<DraftSaver>().mockResolvedValue({ status: "saved", version: 1 });
    render(<Harness save={save} />);

    await act(async () => screen.getByRole("button", { name: "Rename" }).click());
    expect(screen.getByRole("status")).toHaveTextContent("Changes queued");
    await act(async () => vi.advanceTimersByTime(299));
    expect(save).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(1));

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: "Renamed" }), 0);
    expect(screen.getByRole("status")).toHaveTextContent("Saved version 1");
  });

  it("renders a conflict as a recovery state instead of claiming success", async () => {
    vi.useFakeTimers();
    const save = vi.fn<DraftSaver>().mockResolvedValue({ status: "conflict", serverVersion: 4 });
    render(<Harness save={save} />);

    await act(async () => screen.getByRole("button", { name: "Rename" }).click());
    await act(async () => vi.advanceTimersByTime(300));
    expect(screen.getByRole("status")).toHaveTextContent("Save conflict with server version 4");
  });
});
