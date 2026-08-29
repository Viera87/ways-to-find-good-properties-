import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MARYLAND_SALES, SALE_YEARS, saleStatus } from "./counties.ts";

describe("Maryland sales calendar", () => {
  it("covers all 24 collectors for every tracked year", () => {
    assert.equal(MARYLAND_SALES.length, 24);
    for (const county of MARYLAND_SALES) {
      for (const year of SALE_YEARS) {
        assert.ok(county.dates[year], `${county.id} missing ${year}`);
      }
    }
  });

  it("keeps Anne Arundel 2025 as postponed on DAT", () => {
    const aa = MARYLAND_SALES.find((c) => c.id === "anne-arundel");
    assert.equal(aa?.dates[2025].sort, null);
    assert.equal(saleStatus(null), "unposted");
  });

  it("marks Baltimore County 2026 as held after August 27", () => {
    assert.equal(saleStatus("2026-08-27", "2026-08-29"), "held");
    assert.equal(saleStatus("2026-09-10", "2026-08-29"), "window");
    assert.equal(saleStatus("2027-03-06", "2026-08-29"), "upcoming");
  });
});
