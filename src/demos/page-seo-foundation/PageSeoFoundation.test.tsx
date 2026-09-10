import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PageSeoFoundation from "./PageSeoFoundation";
import { exampleEvidence, exampleVerdict, steps } from "./foundation-model";

vi.mock("./foundation-scene", () => ({ FoundationScene: () => null }));

describe("foundation teaching model", () => {
  it.each([
    ["header", "no", "blocked"],
    ["clear", "yes", "pass"],
    ["missing", "unknown", "unknown"],
    ["mixed", "no", "blocked"],
  ] as const)(
    "%s preserves check evidence and yields %s",
    (scenario, verdict, robots) => {
      const result = exampleVerdict(scenario);
      expect(result.verdict).toBe(verdict);
      expect(result.checks).toHaveLength(9);
      expect(
        result.checks.find((check) => check.id === "robots-directives")?.status,
      ).toBe(robots);
      if (scenario === "mixed")
        expect(
          result.checks.find((check) => check.id === "firewall-access")?.status,
        ).toBe("unknown");
    },
  );

  it("distinguishes unavailable headers from an observed empty response", () => {
    expect(exampleEvidence("missing").http).toMatchObject({
      state: "unavailable",
      code: "failed",
    });
    expect(exampleEvidence("clear").http).toMatchObject({
      state: "observed",
      value: { statusCode: 200, headers: {} },
    });
    expect(exampleEvidence("header").http).toMatchObject({
      value: { headers: { "x-robots-tag": ["noindex"] } },
    });
  });
});

describe("PageSeoFoundation", () => {
  it("walks all seven stages, supports back/replay, and keeps verdict pending until assessment", async () => {
    const user = userEvent.setup();
    const { container } = render(<PageSeoFoundation />);
    for (const section of ["eli5", "technical", "dry-run", "edge-case"])
      expect(
        container.querySelector(`[data-section="${section}"]`),
      ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    for (const [index, step] of steps.entries()) {
      expect(
        screen.getByRole("heading", {
          name: index === 6 ? "Verdict: No" : step.title,
        }),
      ).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(`${index + 1} / 7`);
      if (index < 6)
        expect(screen.getByRole("status")).not.toHaveTextContent("Verdict:");
      if (index < 6)
        await user.click(screen.getByRole("button", { name: "Next step" }));
    }
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("heading", { name: steps[5].title }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replay" }));
    expect(
      screen.getByRole("heading", { name: steps[0].title }),
    ).toBeInTheDocument();
  });

  it("selects a case without retaining the previous verdict", async () => {
    const user = userEvent.setup();
    render(<PageSeoFoundation />);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("combobox", { name: "Test case" }));
    await user.click(
      screen.getByRole("option", { name: "Noindex + unavailable access" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("1 / 7");
    for (let index = 0; index < 6; index++)
      await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(
      screen.getByRole("heading", { name: "Verdict: No" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Crawler access remains unknown."),
    ).toBeInTheDocument();
  });

  it("keeps evidence and checks collapsed until requested and shows a working fallback", async () => {
    const user = userEvent.setup();
    render(<PageSeoFoundation />);
    expect(
      screen.getByText("3D unavailable. The walkthrough still works."),
    ).toBeVisible();
    expect(screen.getByText("The nine checks")).not.toBeVisible();
    await user.click(screen.getByText("Under the hood", { exact: true }));
    for (let index = 0; index < 3; index++)
      await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: steps[3].fn })).toBeVisible();
    await user.click(screen.getByText("Evidence packet", { exact: true }));
    expect(screen.getByText(/"schemaVersion": 1/)).toBeVisible();
    await user.click(screen.getByText("The nine checks", { exact: true }));
    expect(screen.getByText("Robots directives · blocked")).toBeVisible();
    expect(
      screen.getByText(
        "No canonical was declared; absence alone does not block indexing.",
      ),
    ).toBeVisible();
  });

  it("rejects an old document result without changing the current document", async () => {
    const user = userEvent.setup();
    render(<PageSeoFoundation />);
    await user.click(
      screen.getByText("Try a late page result", { exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "Send old result" }));
    expect(
      screen.getByText(
        "Rejected. Document-2 keeps waiting for its own assessment.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send old result" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Reset boundary" }));
    expect(
      screen.getByRole("button", { name: "Send old result" }),
    ).toBeEnabled();
  });
});
