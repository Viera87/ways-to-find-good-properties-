import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Lien } from "../types.ts";
import { sliverLegalFlags } from "./pitfalls.ts";
import { underwrite, DEFAULT_ASSUMPTIONS } from "./underwrite.ts";

const sample = (overrides: Partial<Lien> = {}): Lien => ({
  id: "03-1",
  district: "03",
  parcel: "1",
  owner: "SMITH JOHN",
  owner2: "",
  description: ".20 AC",
  streetNumber: "717",
  street: "TELEGRAPH",
  streetType: "RD",
  address: "717 TELEGRAPH RD",
  amountDue: 900,
  assessedValue: 194800,
  acres: 0.2,
  sqft: null,
  hasSitus: true,
  ...overrides,
});

describe("sliverLegalFlags", () => {
  it("lets an ordinary lot description through", () => {
    assert.equal(sliverLegalFlags(sample()).length, 0);
    assert.equal(sliverLegalFlags(sample({ description: "PT OF LOT 5 .20 AC" })).length, 0);
  });

  it("kills strip / alley / residue language even when the situs looks like a house", () => {
    const flags = sliverLegalFlags(sample({ description: "STRIP OFF LOT 5 .02 AC", acres: 0.02 }));
    assert.ok(flags.some((f) => f.id === "legal-sliver"));
    const uw = underwrite(sample({ description: "RESIDUE OPEN SPACE", acres: 0.04 }), DEFAULT_ASSUMPTIONS);
    assert.equal(uw.verdict, "DECLINE");
    assert.ok(uw.flags.some((f) => f.id === "legal-sliver"));
  });
});
