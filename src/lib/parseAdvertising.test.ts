import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdvertisingFile } from "./parseAdvertising.ts";

const sample = `District	Parcel	Owner	Owner 2	Property Description	STREET NUMBER	Address	ADDRES#	Address4	STREET TYPE	District2	Amount Due	Assessed Value
01	1900005837	KUMAR PARSHANT	 	 .0436 AC	00008	CARTERS ROCK	 	 	CT	01	 $925.64 	"302,600"
=SUBTOTAL(109,A2:A3)	x	x	x	x	00000	x	 	  	x	01	 $1.00 	1
`;

describe("parseAdvertisingFile", () => {
  it("reads a Baltimore County advertising row", () => {
    const liens = parseAdvertisingFile(sample, "baltimore-county");
    assert.equal(liens.length, 1);
    assert.equal(liens[0].address, "8 CARTERS ROCK CT");
    assert.equal(liens[0].amountDue, 925.64);
    assert.equal(liens[0].assessedValue, 302600);
    assert.equal(liens[0].hasSitus, true);
  });
});
