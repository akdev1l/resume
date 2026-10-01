import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { resume } from "../../test/fixtures";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("shows the name, the current role and the location", () => {
    render(<TopBar resume={resume} />);

    expect(screen.getByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Translator")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "London, UK" })).toHaveAttribute("href", "https://maps.example/london");
  });

  it("prefers the headline over the current role", () => {
    render(<TopBar resume={{ ...resume, headline: "Enchantress of Numbers" }} />);
    expect(screen.getByText("Enchantress of Numbers")).toBeInTheDocument();
    expect(screen.queryByText("Translator")).not.toBeInTheDocument();
  });

  it("links every way to get in touch", () => {
    render(<TopBar resume={resume} />);
    const contact = screen.getByRole("list", { name: "Contact" });

    expect(contact).toContainElement(screen.getByRole("link", { name: "ada@example.com" }));
    expect(screen.getByRole("link", { name: "ada@example.com" })).toHaveAttribute("href", "mailto:ada@example.com");
    expect(screen.getByRole("link", { name: "github.com/ada" })).toHaveAttribute("href", "https://github.com/ada");
    expect(screen.getByRole("link", { name: "+44 20 0000 0000" })).toHaveAttribute("href", "tel:+442000000000");
  });

  it("shows the avatar, or initials without one", () => {
    const { rerender } = render(<TopBar resume={resume} />);
    expect(screen.getByRole("img", { name: "Avatar of Ada Lovelace" })).toHaveAttribute("src", "/avatar.webp");

    rerender(<TopBar resume={{ ...resume, avatar: undefined }} />);
    expect(screen.getByRole("img", { name: "Initials of Ada Lovelace" })).toHaveTextContent("AL");
  });

  it("holds the settings controls", () => {
    render(<TopBar resume={resume} />);
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeInTheDocument();
  });
});
