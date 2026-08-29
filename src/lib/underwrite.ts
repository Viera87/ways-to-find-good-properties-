import type { Assumptions, Lien, Underwriting, Verdict } from "../types";
import { clamp } from "./format";
import { collectFlags } from "./diligence";

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  statutoryRate: 0.1,
  holdMonths: 9,
  ownerOccupied: true,
  bpoHaircut: 0.65,
  overbid: 0,
  subsequentTaxRate: 0.011,
  subTaxMonth: 6,
  legalOverhead: 4500,
  unrecoverableFees: 0,
  maxEffectiveLtv: 0.2,
};

export const SALE = {
  county: "Baltimore County, Maryland",
  saleDate: "August 27, 2026",
  registrationOpen: "July 27, 2026",
  registrationClose: "August 7, 2026 at 4:30 p.m.",
  bidWindow: "August 27, 2026, 9:00 a.m.–12:00 p.m. ET",
  listingSheetDate: "August 25, 2026",
  ownerOccupiedFileDate: "May 27, 2027",
  statutoryRateNote:
    "Baltimore County Code §11-2-402 as cited in the 2026 Collector’s Terms: 10% per annum on redemption.",
  hbpNote:
    "High-bid premium = 20% × (successful bid − 40% of SDAT assessed value), remitted sale day, refunded without interest.",
  foreclosureNote:
    "Complaint to foreclose the right of redemption: generally 6 months (non-owner-occupied) or first filing day of May 27, 2027 for owner-occupied 2026 sale properties. Must file within 2 years of the certificate.",
};

export function highBidPremium(bid: number, assessedValue: number): number {
  const threshold = 0.4 * assessedValue;
  if (bid <= threshold || assessedValue <= 0) return 0;
  return 0.2 * (bid - threshold);
}

export function underwrite(lien: Lien, a: Assumptions): Underwriting {
  const bid = Math.max(lien.amountDue, lien.amountDue + a.overbid);
  const hbp = highBidPremium(bid, lien.assessedValue);
  const conservativeBpo = Math.max(lien.assessedValue * a.bpoHaircut, 1);
  const subsequentTaxes = lien.assessedValue * a.subsequentTaxRate * (a.holdMonths / 12);

  // MD mechanic: sale-day cash is taxes due + HBP. Surplus bid stays on credit until judgment.
  const auctionDayCapital = lien.amountDue + hbp;
  const redemptionCapital = auctionDayCapital + subsequentTaxes + a.unrecoverableFees;
  const takeoutCapital = bid + subsequentTaxes + a.legalOverhead + a.unrecoverableFees;
  const fullyBurdenedCost =
    lien.amountDue + a.overbid + subsequentTaxes + a.legalOverhead + a.unrecoverableFees + hbp;

  const faceLtv = lien.amountDue / Math.max(lien.assessedValue, 1);
  const effectiveLtv = fullyBurdenedCost / conservativeBpo;
  const takeoutLtv = takeoutCapital / conservativeBpo;

  const interestOnFace = lien.amountDue * a.statutoryRate * (a.holdMonths / 12);
  const monthsSubEarns = Math.max(0, a.holdMonths - a.subTaxMonth);
  const interestOnSub = subsequentTaxes * a.statutoryRate * (monthsSubEarns / 12);
  const grossInterest = interestOnFace + interestOnSub;
  const netProfit = grossInterest - a.unrecoverableFees;
  const years = a.holdMonths / 12;
  const netAnnualizedYield = years > 0 && redemptionCapital > 0 ? netProfit / redemptionCapital / years : 0;

  const yieldIfNoHbp =
    years > 0 && lien.amountDue + subsequentTaxes > 0
      ? (grossInterest - a.unrecoverableFees) / (lien.amountDue + subsequentTaxes + a.unrecoverableFees) / years
      : 0;
  const hbpDragBps = (yieldIfNoHbp - netAnnualizedYield) * 10000;

  const flags = collectFlags(lien);
  if (effectiveLtv > a.maxEffectiveLtv) {
    flags.push({
      id: "ltv-gate",
      phase: 3,
      severity: "hard",
      title: `Effective LTV ${ (effectiveLtv * 100).toFixed(1) }% exceeds ${ (a.maxEffectiveLtv * 100).toFixed(0) }% gate`,
      detail:
        "Fully burdened cost (face + overbid + subsequent taxes + legal + HBP) versus conservative as-is BPO is outside the 15–20% institutional band.",
    });
  }
  if (hbp > 0) {
    flags.push({
      id: "hbp",
      phase: 4,
      severity: "watch",
      title: "Zero-interest high-bid premium",
      detail: `Modeled HBP of $${hbp.toFixed(2)} is remitted sale day and refunded without interest. It dilutes IRR and locks liquidity for the entire hold.`,
    });
  }

  const hard = flags.filter((f) => f.severity === "hard").length;
  const watch = flags.filter((f) => f.severity === "watch").length;

  const equity = clamp(((a.maxEffectiveLtv - effectiveLtv) / a.maxEffectiveLtv) * 40 + 8, 0, 40);
  const yieldPts = clamp((netAnnualizedYield / Math.max(a.statutoryRate, 0.01)) * 18, 0, 22);
  const collateral = clamp(
    22 -
      (lien.hasSitus ? 0 : 8) -
      (lien.acres != null && lien.acres < 0.08 ? 7 : 0) -
      (lien.assessedValue < 15000 ? 10 : 0) -
      (flags.some((f) => f.id === "easement-drainage") ? 10 : 0),
    0,
    22,
  );
  const title = clamp(16 - hard * 6 - watch * 2, 0, 16);

  let score = Math.round(equity + yieldPts + collateral + title);
  if (hard >= 2) score = Math.min(score, 54);
  if (effectiveLtv > a.maxEffectiveLtv) score = Math.min(score, 48);
  if (flags.some((f) => f.id === "exempt-owner" || f.id === "low-av")) score = Math.min(score, 35);
  score = clamp(Math.round(score), 0, 99);

  let verdict: Verdict = "DECLINE";
  if (score >= 78 && effectiveLtv <= 0.15 && hard === 0 && lien.hasSitus) verdict = "ACCUMULATE";
  else if (score >= 62 && effectiveLtv <= a.maxEffectiveLtv && hard === 0) verdict = "UNDERWRITE";
  else if (score >= 48 && hard < 2) verdict = "MONITOR";

  return {
    bid,
    highBidPremium: hbp,
    conservativeBpo,
    subsequentTaxes,
    auctionDayCapital,
    redemptionCapital,
    takeoutCapital,
    fullyBurdenedCost,
    faceLtv,
    effectiveLtv,
    takeoutLtv,
    grossInterest,
    netProfit,
    netAnnualizedYield,
    hbpDragBps,
    flags,
    score,
    verdict,
    scoreBreakdown: {
      equity: Math.round(equity),
      yield: Math.round(yieldPts),
      collateral: Math.round(collateral),
      title: Math.round(title),
    },
  };
}

export function rankedLiens(liens: Lien[], assumptions: Assumptions) {
  return liens
    .map((lien) => ({ lien, uw: underwrite(lien, assumptions) }))
    .sort((a, b) => b.uw.score - a.uw.score || a.uw.effectiveLtv - b.uw.effectiveLtv);
}
