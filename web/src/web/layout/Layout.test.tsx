import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { resume } from "../../test/fixtures";
import { Layout } from "./Layout";
import { PageTitle } from "./PageTitle";

describe("Layout", () => {
  it("puts the page between the top bar, the section drawer and the footer", () => {
    render(
      <MemoryRouter>
        <Layout resume={resume}>
          <p>page content</p>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Ada Lovelace");
    expect(screen.getByRole("main")).toHaveTextContent("page content");
    expect(screen.getByRole("navigation", { name: "Resume sections" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Ada Lovelace");
  });

  it("gives pages the site name for their titles", () => {
    render(
      <MemoryRouter>
        <Layout resume={resume}>
          <PageTitle title="Demos" />
        </Layout>
      </MemoryRouter>,
    );
    expect(document.title).toBe("Ada Lovelace - Demos");
  });
});
