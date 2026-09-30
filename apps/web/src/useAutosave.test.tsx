import { demoForm, type FormSchema } from "@formforge/core";
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutosaveStatus, useAutosave, type DraftSaver, type DraftSaveResult } from "./useAutosave.js";

function Harness({ save }: { save: DraftSaver }) {
  const [schema, setSchema] = useState<FormSchema>(demoForm);
  const state = useAutosave(schema, save, 300);
  return <><button type="button" onClick={() => setSchema((current) => ({ ...current, title: "Renamed" }))}>Rename</button><AutosaveStatus state={state} /></>;
}

function RaceHarness({ save }: { save: DraftSaver }) {
  const [schema, setSchema] = useState<FormSchema>(demoForm);
  const state = useAutosave(schema, save, 300);
  return <><button type="button" onClick={() => setSchema((current) => ({ ...current, title: "Edit one" }))}>Edit one</button><button type="button" onClick={() => setSchema((current) => ({ ...current, title: "Edit two" }))}>Edit two</button><AutosaveStatus state={state} /></>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
}

describe("debounced autosave", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps a newer edit queued when an earlier save finishes during its debounce", async () => {
    vi.useFakeTimers();
    const first = deferred<DraftSaveResult>();
    const save = vi.fn<DraftSaver>().mockImplementationOnce(() => first.promise).mockResolvedValueOnce({ status: "saved", version: 2 });
    render(<RaceHarness save={save} />);
    await act(async () => screen.getByRole("button", { name: "Edit one" }).click());
    await act(async () => vi.advanceTimersByTime(300));
    await act(async () => screen.getByRole("button", { name: "Edit two" }).click());
    await act(async () => vi.advanceTimersByTime(100));
    await act(async () => first.resolve({ status: "saved", version: 1 }));
    expect(screen.getByRole("status")).toHaveTextContent("Changes queued");
    await act(async () => vi.advanceTimersByTime(200));
    expect(save.mock.calls[1]).toEqual([expect.objectContaining({ title: "Edit two" }), 1]);
    expect(screen.getByRole("status")).toHaveTextContent("Saved version 2");
  });

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

  it("serializes overlapping edits so the next save uses the committed version", async () => {
    vi.useFakeTimers();
    const first = deferred<DraftSaveResult>();
    const second = deferred<DraftSaveResult>();
    const save = vi.fn<DraftSaver>().mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    render(<RaceHarness save={save} />);

    await act(async () => screen.getByRole("button", { name: "Edit one" }).click());
    await act(async () => vi.advanceTimersByTime(300));
    await act(async () => screen.getByRole("button", { name: "Edit two" }).click());
    await act(async () => vi.advanceTimersByTime(300));
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => first.resolve({ status: "saved", version: 1 }));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1]?.[1]).toBe(1);
    await act(async () => second.resolve({ status: "saved", version: 2 }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved version 2");
  });
  it("ignores a conflict from a superseded save and lets the queued edit surface it with the committed version", async () => {
    vi.useFakeTimers();
    const first = deferred<DraftSaveResult>();
    const save = vi.fn<DraftSaver>().mockImplementationOnce(() => first.promise).mockResolvedValueOnce({ status: "conflict", serverVersion: 3 });
    render(<RaceHarness save={save} />);
    await act(async () => screen.getByRole("button", { name: "Edit one" }).click());
    await act(async () => vi.advanceTimersByTime(300));           // first save in flight
    await act(async () => screen.getByRole("button", { name: "Edit two" }).click());
    await act(async () => vi.advanceTimersByTime(100));           // newer edit queued
    await act(async () => first.resolve({ status: "conflict", serverVersion: 3 }));
    // The superseded save's conflict is not shown: the newer edit is what the user cares about.
    expect(screen.getByRole("status")).toHaveTextContent("Changes queued");
    await act(async () => vi.advanceTimersByTime(200));
    // The queued save is sent with the still-committed version 0 (a conflict does not advance it) and surfaces the conflict itself.
    expect(save.mock.calls[1]).toEqual([expect.objectContaining({ title: "Edit two" }), 0]);
    expect(screen.getByRole("status")).toHaveTextContent("Save conflict with server version 3");
  });
});
