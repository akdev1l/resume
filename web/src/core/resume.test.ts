import { describe, expect, it, vi } from "vitest";

import { jsonResponse, resume } from "../test/fixtures";
import { description, fullName, githubUser, loadResume } from "./resume";

describe("resume", () => {
  it("joins the name", () => {
    expect(fullName(resume)).toBe("Ada Lovelace");
  });

  it("describes with the headline, or else the current role", () => {
    expect(description(resume)).toBe("Translator");
    expect(description({ ...resume, headline: "Enchantress of Numbers" })).toBe("Enchantress of Numbers");
  });

  it("takes the GitHub user from the profile link", () => {
    expect(githubUser(resume)).toBe("ada");
    expect(githubUser({ ...resume, contact: { ...resume.contact, github: { text: "", url: "https://github.com/ada/" } } })).toBe("ada");
  });

  it("fetches /resume.json", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse(resume)));
    vi.stubGlobal("fetch", fetch);

    await expect(loadResume()).resolves.toEqual(resume);
    expect(fetch).toHaveBeenCalledWith("/resume.json");
  });

  it("fails on an error response", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({}, 404))));
    await expect(loadResume()).rejects.toThrow("fetching /resume.json failed: 404");
  });
});
