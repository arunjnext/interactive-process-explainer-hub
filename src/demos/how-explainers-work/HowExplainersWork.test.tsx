import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import HowExplainersWork from "./HowExplainersWork";

describe("HowExplainersWork", () => {
  it("steps through, replays, switches cases, and resets", async () => {
    const user = userEvent.setup();
    render(<HowExplainersWork />);

    expect(screen.getByText(/STEP\s+1 \/ 7/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/STEP\s+2 \/ 7/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Boundary" }));
    expect(screen.getByText(/CASE\s+BOUNDARY/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replay" }));
    expect(screen.getByText(/STEP\s+2 \/ 7/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText(/CASE\s+NORMAL/)).toBeInTheDocument();
    expect(screen.getByText(/STEP\s+1 \/ 7/)).toBeInTheDocument();
  });
});
