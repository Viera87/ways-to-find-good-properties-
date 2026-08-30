import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_ASSUMPTIONS } from "./underwrite.ts";
import {
  annualSubsequentBill,
  goldenRule,
  subsequentBillsDuringHold,
  subsequentTaxPlan,
  subsequentTaxReserve,
} from "./subTaxes.ts";

describe("subsequent tax golden rule", () => {
  it("sizes the next levy from assessed value and millage", () => {
    assert.equal(annualSubsequentBill(200000, 0.011), 2200);
    assert.equal(annualSubsequentBill(0, 0.011), 0);
  });

  it("counts discrete bills during the hold, not a pro-rata scrap", () => {
    assert.equal(subsequentBillsDuringHold(9, 6), 1);
    assert.equal(subsequentBillsDuringHold(18, 6), 2);
    assert.equal(subsequentBillsDuringHold(5, 6), 0);
  });

  it("reserves 2×–3× the annual levy, not just the next bill", () => {
    const shortHold = subsequentTaxReserve(200000, {
      subsequentTaxRate: 0.011,
      holdMonths: 5,
      subTaxMonth: 6,
      subTaxReserveMultiple: 2.5,
    });
    assert.equal(shortHold, 5500);
    const longHold = subsequentTaxReserve(200000, {
      subsequentTaxRate: 0.011,
      holdMonths: 30,
      subTaxMonth: 6,
      subTaxReserveMultiple: 2,
    });
    assert.equal(longHold, 6600);
  });

  it("fails the golden rule when desk cash covers ACH but not the 2.5× reserve", () => {
    const plan = subsequentTaxPlan(
      { amountDue: 3000, assessedValue: 200000 },
      DEFAULT_ASSUMPTIONS,
      3000,
    );
    assert.equal(plan.reserve, 5500);
    assert.equal(plan.capitalToOwn, 8500);
    const fail = goldenRule(4000, plan.auctionDayCapital, plan.reserve);
    assert.equal(fail.pass, false);
    assert.equal(fail.shortfall, 4500);
    const ok = goldenRule(8500, plan.auctionDayCapital, plan.reserve);
    assert.equal(ok.pass, true);
  });
});
