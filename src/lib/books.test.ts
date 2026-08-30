import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LienBook } from "../types.ts";
import { findBook, upsertBook, yearCounts } from "./books.ts";

const book = (year: number, countyId: string, n: number): LienBook => ({
  year,
  countyId,
  countyName: countyId,
  source: "test",
  liens: Array.from({ length: n }, (_, i) => ({
    id: `${countyId}-${i}`,
    district: "01",
    parcel: String(i),
    owner: "X",
    owner2: "",
    description: "",
    streetNumber: "1",
    street: "MAIN",
    streetType: "ST",
    address: "1 MAIN ST",
    amountDue: 100,
    assessedValue: 100000,
    acres: 0.2,
    sqft: null,
    hasSitus: true,
  })),
});

describe("county books", () => {
  it("keeps two counties in the same sale year", () => {
    const next = upsertBook(
      upsertBook([], book(2026, "baltimore-county", 3)),
      book(2026, "cecil", 2),
    );
    assert.equal(next.length, 2);
    assert.equal(yearCounts(next)[2026], 5);
    assert.equal(findBook(next, 2026, "cecil")?.liens.length, 2);
    assert.equal(findBook(next, 2026, "baltimore-county")?.liens.length, 3);
  });

  it("replaces only the same county-year on re-import", () => {
    const next = upsertBook(
      [book(2026, "baltimore-county", 3), book(2026, "cecil", 2)],
      book(2026, "cecil", 9),
    );
    assert.equal(findBook(next, 2026, "baltimore-county")?.liens.length, 3);
    assert.equal(findBook(next, 2026, "cecil")?.liens.length, 9);
  });
});
