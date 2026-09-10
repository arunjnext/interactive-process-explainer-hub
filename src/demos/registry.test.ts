import { describe, expect, it } from "vitest";

import type { DemoDefinition } from "../types/demo";
import { demos, findDemo, validateRegistry } from "./registry";

describe("demo registry", () => {
  it("contains valid unique public demo metadata", () => {
    expect(validateRegistry()).toEqual([]);
    expect(findDemo("how-explainers-work")).toEqual(demos[0]);
  });

  it("reports duplicate, invalid, and local-source entries", () => {
    const invalid: DemoDefinition[] = [
      {
        ...demos[0],
        slug: "Bad slug",
        sources: [
          { label: "local", url: "/home/arun/demo", kind: "conceptual" },
        ],
      },
      { ...demos[0], slug: "Bad slug" },
    ];

    expect(validateRegistry(invalid)).toEqual([
      "Invalid slug: Bad slug",
      "Source must use a public HTTPS URL: Bad slug/local",
      "Invalid slug: Bad slug",
      "Duplicate slug: Bad slug",
    ]);
  });
});
