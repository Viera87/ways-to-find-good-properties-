import type { Assumptions, Lien, Underwriting } from "../types";
import { subsequentTaxReserve } from "./subTaxes";
import { underwrite } from "./underwrite";

export type AllocationRow = {
  lien: Lien;
  uw: Underwriting;
  subTaxReserve: number;
};

export function allocateCapital(
  liens: Lien[],
  assumptions: Assumptions,
  budget: number,
  options: {
    maxLtv: number;
    requireSitus: boolean;
    excludeHardFlags: boolean;
    maxPerCertificate: number;
    requireSubTaxReserve?: boolean;
  },
): { picks: AllocationRow[]; leftover: number; deployed: number; reserved: number } {
  const ranked = liens
    .map((lien) => ({
      lien,
      uw: underwrite(lien, assumptions, liens),
      subTaxReserve: subsequentTaxReserve(lien.assessedValue, assumptions),
    }))
    .filter((row) => {
      if (row.uw.effectiveLtv > options.maxLtv) return false;
      if (options.requireSitus && !row.lien.hasSitus) return false;
      if (options.excludeHardFlags && row.uw.flags.some((f) => f.severity === "hard")) return false;
      if (row.uw.leftoverRisk && row.uw.flags.some((f) => f.id.startsWith("leftover-") && f.severity === "hard"))
        return false;
      if (row.uw.auctionDayCapital > options.maxPerCertificate) return false;
      if (row.uw.verdict === "DECLINE") return false;
      return true;
    })
    .sort((a, b) => {
      const aEff = a.uw.score / Math.max(a.uw.auctionDayCapital, 1);
      const bEff = b.uw.score / Math.max(b.uw.auctionDayCapital, 1);
      return bEff - aEff || b.uw.score - a.uw.score;
    });

  const picks: AllocationRow[] = [];
  let leftover = budget;
  let reserved = 0;
  for (const row of ranked) {
    const cost = options.requireSubTaxReserve
      ? row.uw.auctionDayCapital + row.subTaxReserve
      : row.uw.auctionDayCapital;
    if (cost <= leftover) {
      picks.push(row);
      leftover -= cost;
      if (options.requireSubTaxReserve) reserved += row.subTaxReserve;
    }
  }
  return { picks, leftover, deployed: budget - leftover - reserved, reserved };
}
