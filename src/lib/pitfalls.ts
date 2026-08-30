import type { DiligenceFlag, Lien } from "../types";

/** Advertising-file language that is usually a strip beside the house, not the house. */
const SLIVER =
  /\b(STRIP|SLIVER|ALLEY|OUTLOT|OUT LOT|OPEN SPACE|COMMON AREA|RESIDUE|REMAINDER|VACATED|UNBUILDABLE|GORE)\b/;

export const PITFALL_CHECKS = [
  {
    id: "interest",
    title: "Expect the interest, not the real estate",
    label:
      "I am buying the statutory-rate certificate, not this house. Historically most liens redeem. Deed is a rare, worst-case fallback.",
  },
  {
    id: "driveby",
    title: "Never bid sight-unseen",
    label:
      "Physical drive-by (or a hired street-level inspect) done right before the sale. Assessment and GIS can be years stale — fire, collapse, or demo will not show.",
  },
  {
    id: "superlien",
    title: "Beware surviving super-liens",
    label:
      "City/county water, demolition, weed, and code-enforcement ledgers checked. Those municipal debts can survive the tax sale and attach if you take a deed.",
  },
  {
    id: "liquidity",
    title: "Do not use emergency funds",
    label:
      "This cash can stay locked from six months to several years. Tax certificates are not stocks or CDs. I am not bidding money I may need back.",
  },
  {
    id: "legal",
    title: "Legal description matches the parcel",
    label:
      "Account ID and legal description match the county parcel polygon — not just the house next door or a tiny unbuildable sliver.",
  },
  {
    id: "subtax",
    title: "Sub-tax cash reserve (2×–3×)",
    label:
      "After auction ACH I still have 2× to 3× the annual property-tax bill sitting in cash. A missed levy sells a new certificate that primes this one.",
  },
] as const;

export type PitfallId = (typeof PITFALL_CHECKS)[number]["id"];

export function sliverLegalFlags(lien: Lien): DiligenceFlag[] {
  const desc = (lien.description ?? "").toUpperCase();
  if (!SLIVER.test(desc)) return [];
  return [
    {
      id: "legal-sliver",
      phase: 1,
      severity: "hard",
      title: "Legal description looks like a sliver, not the house",
      detail:
        "The advertising file cites a strip, alley, outlot, residue, or open space. New investors bid the house next door and buy the unbuildable sliver. Cross-reference the account ID on the county parcel map before any capital is reserved.",
    },
  ];
}

export function pitfallStorageKey(lienId: string): string {
  return `certus-pitfalls-${lienId}`;
}
