import { describe, it, expect } from "vitest";

import { isNavItemActive, NAV_ITEMS } from "./nav-config";

describe("isNavItemActive", () => {
  it("matches the dashboard route only on the exact root path", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/schedule", "/")).toBe(false);
  });

  it("matches a non-root route exactly", () => {
    expect(isNavItemActive("/schedule", "/schedule")).toBe(true);
  });

  it("matches nested paths under a non-root route", () => {
    expect(isNavItemActive("/boards/global", "/boards")).toBe(true);
  });

  it("does not match unrelated routes", () => {
    expect(isNavItemActive("/schedule", "/boards")).toBe(false);
  });

  it("does not treat a prefix collision as active", () => {
    expect(isNavItemActive("/boards-archive", "/boards")).toBe(false);
  });
});

describe("NAV_ITEMS", () => {
  it("only lists routes that exist in the app today", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual(["/", "/schedule", "/boards"]);
  });
});
