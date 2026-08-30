import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Lien } from "../types.ts";
import { leftoverFlags } from "./leftover.ts";
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
  assessedValue: 108800,
  acres: 0.2,
  sqft: null,
  hasSitus: true,
  ...overrides,
});

describe("leftoverFlags", () => {
  it("lets a house-scale situs with thin face through Phase 0", () => {
    const flags = leftoverFlags(sample());
    assert.equal(flags.length, 0);
  });

  it("kills directional / OFF / zero addresses as leftover strips", () => {
    const flags = leftoverFlags(sample({ address: "SE/S ELKTON ROAD", streetNumber: "", hasSitus: false }));
    assert.ok(flags.some((f) => f.id === "leftover-directional"));
  });

  it("kills upside-down tickets (face > AV)", () => {
    const flags = leftoverFlags(sample({ amountDue: 52041, assessedValue: 13236 }));
    assert.ok(flags.some((f) => f.id === "leftover-upside-down"));
  });

  it("kills entity + no situs even when face looks cheap", () => {
    const flags = leftoverFlags(
      sample({
        owner: "TERUMO MEDICAL CORPORATION",
        address: "SE/S ELKTON ROAD",
        streetNumber: "",
        hasSitus: false,
        amountDue: 1551,
        assessedValue: 80400,
      }),
    );
    assert.ok(flags.some((f) => f.id === "leftover-entity-strip"));
  });

  it("kills a three-lot vacant cluster under one owner", () => {
    const book = [1, 2, 3].map((n) =>
      sample({
        id: `03-${n}`,
        owner: "R HILL LLC",
        hasSitus: false,
        streetNumber: "",
        address: "LAKE NORMAN DRIVE",
        amountDue: 800,
        assessedValue: 20000,
      }),
    );
    const flags = leftoverFlags(book[0]!, book);
    assert.ok(flags.some((f) => f.id === "leftover-cluster"));
  });

  it("watches face already above 15% of AV", () => {
    const flags = leftoverFlags(sample({ amountDue: 18249, assessedValue: 77400 }));
    assert.ok(flags.some((f) => f.id === "leftover-thin-face"));
  });

  it("forces Decline when leftover hard flags fire", () => {
    const uw = underwrite(
      sample({
        owner: "DIRT22 LLC",
        address: "W/S NORTH STREET",
        streetNumber: "",
        hasSitus: false,
        amountDue: 1125,
        assessedValue: 57933,
      }),
      DEFAULT_ASSUMPTIONS,
    );
    assert.equal(uw.verdict, "DECLINE");
    assert.ok(uw.leftoverRisk);
  });
});
