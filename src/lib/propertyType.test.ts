import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Lien } from "../types.ts";
import { classifyProperty } from "./propertyType.ts";

const sample = (overrides: Partial<Lien> = {}): Lien => ({
  id: "01-1",
  district: "01",
  parcel: "1",
  owner: "SMITH JOHN",
  owner2: "",
  description: ".20 AC",
  streetNumber: "8",
  street: "CARTERS ROCK",
  streetType: "CT",
  address: "8 CARTERS ROCK CT",
  amountDue: 900,
  assessedValue: 280000,
  acres: 0.2,
  sqft: null,
  hasSitus: true,
  ...overrides,
});

describe("classifyProperty", () => {
  it("labels a house-scale situs as house", () => {
    assert.equal(classifyProperty(sample()).kind, "house");
  });

  it("labels unit language as condo", () => {
    assert.equal(classifyProperty(sample({ description: "UNIT 4 PHASE 2" })).kind, "condo");
  });

  it("does not treat a subdivision PHASE letter as a condo", () => {
    assert.equal(classifyProperty(sample({ description: "0.105 AC  PHASE D", acres: 0.105 })).kind, "house");
  });

  it("labels missing street numbers as vacant", () => {
    assert.equal(classifyProperty(sample({ hasSitus: false, streetNumber: "", address: "DANIELS AVE" })).kind, "vacant");
  });

  it("labels drainage language as easement before house", () => {
    assert.equal(classifyProperty(sample({ description: "DRAINAGE BASIN" })).kind, "easement");
  });

  it("labels church owners as exempt", () => {
    assert.equal(classifyProperty(sample({ owner: "FIRST BAPTIST CHURCH" })).kind, "exempt");
  });

  it("labels micro-lots as remnant", () => {
    assert.equal(classifyProperty(sample({ acres: 0.03, description: ".03 AC" })).kind, "remnant");
  });

  it("labels jumbo assessments as commercial", () => {
    assert.equal(classifyProperty(sample({ assessedValue: 2_400_000 })).kind, "commercial");
  });

  it("labels large acreage as acreage", () => {
    assert.equal(classifyProperty(sample({ acres: 6, description: "6.0 AC", assessedValue: 180000 })).kind, "acreage");
  });
});
