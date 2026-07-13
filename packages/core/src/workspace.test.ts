import { describe, expect, it } from "vitest";
import { workspaceQueryKey } from "./workspace.js";

describe("workspace query identity", () => {
  it("isolates server cache entries by workspace", () => {
    expect(workspaceQueryKey("acme")).not.toEqual(workspaceQueryKey("other"));
    expect(workspaceQueryKey("acme")).toEqual(["workspace", "acme"]);
  });
});
