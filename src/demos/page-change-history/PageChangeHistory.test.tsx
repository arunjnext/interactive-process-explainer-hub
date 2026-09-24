import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import PageChangeHistory from "./PageChangeHistory";

describe("PageChangeHistory", () => {
  it("renders the required teaching layers", () => {
    const { container } = render(<PageChangeHistory />);
    expect(
      screen.getByRole("heading", { name: "A scrapbook for the page" }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-section="eli5"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-section="technical"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-section="dry-run"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-section="edge-case"]'),
    ).toBeInTheDocument();
  });

  it("walks from the first baseline to a saved title change and replays", async () => {
    const user = userEvent.setup();
    render(<PageChangeHistory />);
    expect(
      screen.getByRole("group", { name: "Page analysis to Change History" }),
    ).toBeInTheDocument();
    for (let index = 0; index < 4; index++)
      await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(
      screen.getByRole("heading", { name: "Baseline is saved" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "3 · Title changed" }));
    expect(
      screen.getByRole("heading", { name: "Updated page settles" }),
    ).toBeInTheDocument();
    for (let index = 0; index < 4; index++)
      await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Title event saved")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replay" }));
    expect(
      screen.getByRole("heading", { name: "Updated page settles" }),
    ).toBeInTheDocument();
  });

  it("shows the skipped revisit and stale-generation boundary", async () => {
    const user = userEvent.setup();
    render(<PageChangeHistory embedded />);
    await user.click(screen.getByRole("button", { name: "2 · Same page" }));
    await user.click(
      screen.getByRole("button", { name: "Unchanged visit is skipped" }),
    );
    expect(screen.getByText("Unchanged visit skipped")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Boundary · stale tab" }),
    );
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Stale capture rejected")).toBeInTheDocument();
  });
});
