import type { Assumptions, Lien, Underwriting } from "../types";
import { underwrite } from "./underwrite";

export type AllocationRow = {
  lien: Lien;
  uw: Underwriting;
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
  },
): { picks: AllocationRow[]; leftover: number; deployed: number } {
  const ranked = liens
    .map((lien) => ({ lien, uw: underwrite(lien, assumptions) }))
    .filter((row) => {
      if (row.uw.effectiveLtv > options.maxLtv) return false;
      if (options.requireSitus && !row.lien.hasSitus) return false;
      if (options.excludeHardFlags && row.uw.flags.some((f) => f.severity === "hard")) return false;
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
  for (const row of ranked) {
    if (row.uw.auctionDayCapital <= leftover) {
      picks.push(row);
      leftover -= row.uw.auctionDayCapital;
    }
  }
  return { picks, leftover, deployed: budget - leftover };
}
