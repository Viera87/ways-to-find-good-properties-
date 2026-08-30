import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Lien } from "../types.ts";
import { allocateCapital } from "./optimize.ts";
import { DEFAULT_ASSUMPTIONS } from "./underwrite.ts";

const house = (id: string, face: number, av: number): Lien => ({
  id,
  district: "01",
  parcel: id,
  owner: "SMITH JANE",
  owner2: "",
  description: ".20 AC",
  streetNumber: "10",
  street: "OAK",
  streetType: "ST",
  address: `10 OAK ST ${id}`,
  amountDue: face,
  assessedValue: av,
  acres: 0.2,
  sqft: null,
  hasSitus: true,
});

describe("allocateCapital", () => {
  it("holds subsequent-tax reserve out of desk cash so a new levy cannot prime the book", () => {
    const liens = [house("a", 2000, 200000), house("b", 2000, 200000)];
    const without = allocateCapital(liens, DEFAULT_ASSUMPTIONS, 5000, {
      maxLtv: 0.2,
      requireSitus: true,
      excludeHardFlags: true,
      maxPerCertificate: 15000,
      requireSubTaxReserve: false,
    });
    const withReserve = allocateCapital(liens, DEFAULT_ASSUMPTIONS, 5000, {
      maxLtv: 0.2,
      requireSitus: true,
      excludeHardFlags: true,
      maxPerCertificate: 15000,
      requireSubTaxReserve: true,
    });
    assert.ok(without.picks.length >= 2);
    assert.equal(withReserve.picks.length, 1);
    assert.ok(withReserve.reserved > 0);
    assert.ok(withReserve.deployed + withReserve.reserved <= 5000 + 1e-6);
  });
});
