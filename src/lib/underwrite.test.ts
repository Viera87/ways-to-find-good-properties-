import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { highBidPremium, underwrite, DEFAULT_ASSUMPTIONS } from "./underwrite.ts";
import type { Lien } from "../types.ts";

const sample = (overrides: Partial<Lien> = {}): Lien => ({
  id: "01-1900005837",
  district: "01",
  parcel: "1900005837",
  owner: "KUMAR PARSHANT, VERMA AARTI",
  owner2: "",
  description: ".25 AC",
  streetNumber: "8",
  street: "CARTERS ROCK",
  streetType: "CT",
  address: "8 CARTERS ROCK CT",
  amountDue: 925.64,
  assessedValue: 302600,
  acres: 0.25,
  sqft: null,
  hasSitus: true,
  ...overrides,
});

describe("highBidPremium", () => {
  it("matches the Collector’s Terms example", () => {
    // AV $100,000, bid $50,000 → premium $2,000
    assert.equal(highBidPremium(50000, 100000), 2000);
  });

  it("is zero at or below the 40% threshold", () => {
    assert.equal(highBidPremium(40000, 100000), 0);
    assert.equal(highBidPremium(1000, 300000), 0);
  });
});

describe("underwrite", () => {
  it("keeps a low-face improved parcel inside the 20% LTV gate", () => {
    const uw = underwrite(sample(), DEFAULT_ASSUMPTIONS);
    assert.ok(uw.effectiveLtv < 0.2, `LTV ${uw.effectiveLtv}`);
    assert.equal(uw.highBidPremium, 0);
    assert.ok(uw.score >= 60, `score ${uw.score}`);
    assert.ok(uw.verdict === "ACCUMULATE" || uw.verdict === "UNDERWRITE");
  });

  it("kills remnant / exempt collateral", () => {
    const uw = underwrite(
      sample({
        owner: "FIRST BAPTIST CHURCH",
        assessedValue: 8000,
        amountDue: 2100,
        hasSitus: false,
        streetNumber: "",
        acres: 0.03,
        description: "DRAINAGE BASIN",
      }),
      DEFAULT_ASSUMPTIONS,
    );
    assert.equal(uw.verdict, "DECLINE");
    assert.ok(uw.flags.some((f) => f.id === "exempt-owner"));
  });

  it("does not accumulate commercial-scale jumbo tickets", () => {
    const uw = underwrite(
      sample({
        owner: "309-311 OWNER LLC",
        amountDue: 116797.88,
        assessedValue: 7314100,
        address: "309 INTERNATIONAL CIR",
        acres: 6,
        description: "6.0 AC",
      }),
      DEFAULT_ASSUMPTIONS,
    );
    assert.notEqual(uw.verdict, "ACCUMULATE");
    assert.ok(uw.flags.some((f) => f.id === "commercial-scale"));
  });

  it("dilutes yield when a high-bid premium is posted", () => {
    const base = underwrite(sample({ amountDue: 8000, assessedValue: 200000 }), {
      ...DEFAULT_ASSUMPTIONS,
      overbid: 0,
    });
    const rich = underwrite(sample({ amountDue: 8000, assessedValue: 200000 }), {
      ...DEFAULT_ASSUMPTIONS,
      overbid: 75000,
    });
    assert.ok(rich.highBidPremium > 0);
    assert.ok(rich.netAnnualizedYield < base.netAnnualizedYield);
  });
});
