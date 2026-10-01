import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageTitle } from "./PageTitle";
import { SiteNameContext } from "./site-name";

describe("PageTitle", () => {
  it("titles the document '<name> - <title>'", () => {
    render(
      <SiteNameContext value="Ada Lovelace">
        <PageTitle title="Resume" />
      </SiteNameContext>,
    );
    expect(document.title).toBe("Ada Lovelace - Resume");
  });

  it("uses the title alone without a site name", () => {
    render(<PageTitle title="Resume" />);
    expect(document.title).toBe("Resume");
  });
});
