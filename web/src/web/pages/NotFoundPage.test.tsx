import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "../../test/fixtures";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("says so, links home and titles the page", () => {
    renderAt(<NotFoundPage />);
    expect(screen.getByText(/nothing at this address/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the resume" })).toHaveAttribute("href", "/");
    expect(document.title).toBe("Ada Lovelace - Page not found");
  });
});
