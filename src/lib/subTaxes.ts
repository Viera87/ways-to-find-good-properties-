import type { Assumptions, Lien } from "../types";

/** One full subsequent levy — the bill that can prime the certificate if unpaid. */
export function annualSubsequentBill(assessedValue: number, rate: number): number {
  if (assessedValue <= 0 || rate <= 0) return 0;
  return assessedValue * rate;
}

/**
 * How many new tax bills drop during the modeled hold.
 * First bill is `firstBillMonth` months after the sale; later bills every 12 months.
 */
export function subsequentBillsDuringHold(holdMonths: number, firstBillMonth: number): number {
  if (holdMonths <= 0 || firstBillMonth <= 0) return 0;
  if (holdMonths < firstBillMonth) return 0;
  return 1 + Math.floor((holdMonths - firstBillMonth) / 12);
}

/**
 * Cash that must sit after auction ACH. The golden rule always reserves at least
 * the next full levy — you need that check written when the bill posts, not a pro-rata scrap.
 */
export function subsequentTaxReserve(assessedValue: number, a: Pick<Assumptions, "subsequentTaxRate" | "holdMonths" | "subTaxMonth">): number {
  const annual = annualSubsequentBill(assessedValue, a.subsequentTaxRate);
  const bills = subsequentBillsDuringHold(a.holdMonths, a.subTaxMonth);
  return annual * Math.max(bills, 1);
}

export function subsequentTaxPlan(
  lien: Pick<Lien, "amountDue" | "assessedValue">,
  a: Assumptions,
  auctionDayCapital: number,
) {
  const annualBill = annualSubsequentBill(lien.assessedValue, a.subsequentTaxRate);
  const billsDuringHold = subsequentBillsDuringHold(a.holdMonths, a.subTaxMonth);
  const reserve = subsequentTaxReserve(lien.assessedValue, a);
  return {
    annualBill,
    firstBillMonth: a.subTaxMonth,
    billsDuringHold: Math.max(billsDuringHold, 1),
    reserve,
    auctionDayCapital,
    capitalToOwn: auctionDayCapital + reserve,
  };
}

export function goldenRule(deskCash: number, auctionDay: number, reserve: number) {
  const required = Math.max(0, auctionDay) + Math.max(0, reserve);
  const shortfall = Math.max(0, required - deskCash);
  return {
    deskCash,
    auctionDay,
    reserve,
    required,
    shortfall,
    free: deskCash - required,
    pass: deskCash + 1e-9 >= required,
  };
}
