import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { App } from "./App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("application routes", () => {
  it("filters the gallery and can reset an empty result", async () => {
    const user = userEvent.setup();
    renderAt("/");

    expect(
      screen.getByRole("heading", {
        name: "Difficult processes, made inspectable.",
      }),
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "Search explainers" }),
      "no such process",
    );
    expect(screen.getByText("No matching signals")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(
      screen.getByRole("link", {
        name: "Open How an interactive explainer is built",
      }),
    ).toBeInTheDocument();
  });

  it("persists theme changes", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("process-observatory-theme-v2")).toBe(
      "dark",
    );
  });

  it("renders the demo route and semantic WebGL fallback", async () => {
    renderAt("/demos/how-explainers-work");

    expect(
      await screen.findByRole("heading", {
        name: "How an interactive explainer is built",
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/3D unavailable/)).toBeInTheDocument();
    expect(document.querySelector('[data-section="eli5"]')).toBeInTheDocument();
    expect(
      document.querySelector('[data-section="technical"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-section="dry-run"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-section="edge-case"]'),
    ).toBeInTheDocument();
  });

  it("renders the walkthrough embed without site or lesson chrome", async () => {
    const { container } = renderAt("/demos/page-seo-foundation/embed");

    expect(
      await screen.findByRole("main", {
        name: "How the Page SEO foundation works interactive embed",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Interactive foundation walkthrough"),
    ).toBeInTheDocument();
    expect(container.querySelector("header")).not.toBeInTheDocument();
    expect(container.querySelector("footer")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-section="eli5"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-section="technical"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-section="edge-case"]'),
    ).not.toBeInTheDocument();
  });

  it("handles unknown demos and unknown routes", () => {
    const { unmount } = renderAt("/demos/unknown");
    expect(
      screen.getByText("That explainer is not in the observatory."),
    ).toBeInTheDocument();
    unmount();
    renderAt("/outside-the-map");
    expect(
      screen.getByText("This route has no observable process."),
    ).toBeInTheDocument();
  });
});
