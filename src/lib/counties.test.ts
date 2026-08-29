import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MARYLAND_SALES, saleStatus } from "./counties.ts";

describe("Maryland sales calendar", () => {
  it("covers all 24 collectors", () => {
    assert.equal(MARYLAND_SALES.length, 24);
  });

  it("marks Baltimore County 2026 as held after August 27", () => {
    assert.equal(saleStatus("2026-08-27", "2026-08-29"), "held");
    assert.equal(saleStatus("2026-09-10", "2026-08-29"), "window");
    assert.equal(saleStatus("2027-03-06", "2026-08-29"), "upcoming");
  });
});
