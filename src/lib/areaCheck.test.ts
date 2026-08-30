import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Lien } from "../types.ts";
import { interpretFlood, locationQuery, runAreaCheck, safetyLinks, summarizeCategories } from "./areaCheck.ts";

const house: Lien = {
  id: "01-1",
  district: "01",
  parcel: "1",
  owner: "SMITH",
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
};

describe("locationQuery", () => {
  it("builds a county query when a street number exists", () => {
    assert.equal(locationQuery(house), "8 CARTERS ROCK CT, Baltimore County, MD");
  });

  it("refuses parcels without a situs", () => {
    assert.equal(locationQuery({ ...house, hasSitus: false, address: "DANIELS AVE" }), null);
  });
});

describe("interpretFlood", () => {
  it("treats AE as a special flood hazard", () => {
    const read = interpretFlood("AE", "FLOODWAY", "T");
    assert.equal(read.specialFloodHazard, true);
    assert.equal(read.floodZone, "AE");
  });

  it("treats X as outside the SFHA", () => {
    const read = interpretFlood("X", "AREA OF MINIMAL FLOOD HAZARD", "F");
    assert.equal(read.specialFloodHazard, false);
  });
});

describe("summarizeCategories", () => {
  it("totals Part I rows", () => {
    const sum = summarizeCategories([
      { category: "THEFT", n: 4 },
      { category: "BURGLARY", n: 1 },
    ]);
    assert.equal(sum.total, 5);
    assert.match(sum.window, /2017/);
  });
});

describe("safetyLinks", () => {
  it("always includes CrimeMapping and FEMA", () => {
    const labels = safetyLinks("8 CARTERS ROCK CT, Baltimore County, MD", 39.3, -76.7).map((l) => l.label);
    assert.ok(labels.some((l) => l.includes("CrimeMapping")));
    assert.ok(labels.some((l) => l.includes("FEMA")));
  });
});

describe("runAreaCheck", () => {
  it("skips geocode when there is no street number", async () => {
    const result = await runAreaCheck({ ...house, hasSitus: false, address: "" }, async () => {
      throw new Error("should not fetch");
    });
    assert.ok(result.warnings[0]?.includes("No street number"));
    assert.equal(result.lat, null);
  });

  it("reads flood, precinct, and historical crime from public JSON", async () => {
    const result = await runAreaCheck(house, async (url) => {
      if (url.includes("nominatim")) {
        return [{ lat: "39.297", lon: "-76.768", display_name: "8 Carters Rock Ct, Catonsville" }];
      }
      if (url.includes("NFHL")) {
        return { features: [{ attributes: { FLD_ZONE: "X", ZONE_SUBTY: "AREA OF MINIMAL FLOOD HAZARD", SFHA_TF: "F" } }] };
      }
      if (url.includes("PublicSafety/PublicSafety")) {
        return { features: [{ attributes: { NAME: "Woodlawn", PRECINCT: "02" } }] };
      }
      if (url.includes("UCR_PART1")) {
        return { features: [{ attributes: { CATEGORY: "THEFT", n: 3 } }] };
      }
      throw new Error(url);
    });
    assert.equal(result.floodZone, "X");
    assert.equal(result.specialFloodHazard, false);
    assert.match(result.precinct ?? "", /Woodlawn/);
    assert.equal(result.historicalPart1?.total, 3);
    assert.ok(result.warnings.some((w) => /2020/.test(w)));
  });
});
