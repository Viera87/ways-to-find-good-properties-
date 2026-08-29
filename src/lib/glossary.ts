import type { Verdict } from "../types";

export type GlossaryEntry = {
  title: string;
  body: string;
};

export const VERDICT_HELP: Record<Verdict, GlossaryEntry> = {
  ACCUMULATE: {
    title: "Accumulate",
    body: "Top-tier house-scale certificate: score 90+, effective LTV at or under 15%, has a street address, face at or under $15,000, and no hard diligence flags. Priority capital — still finish GIS, EPA, and PACER before you bid.",
  },
  UNDERWRITE: {
    title: "Underwrite",
    body: "Passes the LTV gate with no hard flags, but is not in the Accumulate book (score, lot size, or ticket size). Open the memo and confirm zoning, title, and bankruptcy before allocating.",
  },
  MONITOR: {
    title: "Monitor",
    body: "Mixed signals — watch flags, thinner equity, or a weaker score. Do not bid until the flagged issues are cleared. Keep it only if you have spare research time.",
  },
  DECLINE: {
    title: "Decline",
    body: "Hard fail. Effective LTV is above your gate, the collateral looks remnant, exempt, or jumbo-commercial, or there are multiple hard flags. Do not deploy capital.",
  },
};

export const TERM_HELP: Record<string, GlossaryEntry> = {
  verdict: {
    title: "Verdict",
    body: "Accumulate = top-tier house ticket, bid after diligence. Underwrite = clears the LTV gate, finish the memo first. Monitor = mixed flags, do not bid yet. Decline = hard fail, skip. Hover any chip for that grade.",
  },
  score: {
    title: "CERTUS score",
    body: "0–99 composite of equity cushion, net yield, collateral quality, and title friction. Higher is better. Ninety and above can qualify for Accumulate if the other gates pass.",
  },
  face: {
    title: "Face / taxes due",
    body: "Amount on the advertising list — the taxes, interest, and sale expenses you must remit on auction day if you win at the minimum bid.",
  },
  assessed: {
    title: "SDAT assessed value",
    body: "County assessment, not a market appraisal. The model haircuts this into a conservative as-is BPO. Do not treat it as what the property would sell for.",
  },
  ltv: {
    title: "Effective LTV",
    body: "Fully burdened cost (face + overbid + subsequent taxes + legal + high-bid premium) divided by the conservative as-is BPO. Institutional max is 15–20%.",
  },
  yield: {
    title: "Net annualized yield",
    body: "Statutory 10% after unrecoverable fees and the cash drag of zero-interest high-bid premium and subsequent taxes during the hold. Advertised 10% is the gross figure.",
  },
  flags: {
    title: "Flags",
    body: "Automated diligence warnings from the advertising file (no situs, micro-lot, heirship, church, commercial scale, jumbo face). Count excludes informational notes.",
  },
  accumulateKpi: {
    title: "Accumulate",
    body: "Count of certificates in the top-tier book: house-scale, score 90+, effective LTV ≤ 15%, face ≤ $15,000, no hard flags.",
  },
  passGate: {
    title: "Pass LTV gate",
    body: "Certificates scored Accumulate or Underwrite — they clear the effective-LTV cap and have no hard flags.",
  },
  universe: {
    title: "Universe",
    body: "Certificates in the book currently loaded — Baltimore County’s advertising file by default, or any county list you import on the Counties tab.",
  },
  medianFace: {
    title: "Median face",
    body: "Median taxes-due amount across the full advertising list, not just the filtered table.",
  },
  top25: {
    title: "Top-25 auction cash",
    body: "Sale-day cash (taxes due + high-bid premium) to buy the 25 best Accumulate/Underwrite names at the current assumptions.",
  },
  maxLtv: {
    title: "Max effective LTV",
    body: "Your underwriting gate. Names above this fully burdened loan-to-value are scored down and cannot be Accumulate or Underwrite.",
  },
  auctionCash: {
    title: "Auction-day cash",
    body: "What Baltimore County ACH-debits on sale day: taxes due plus any high-bid premium. Surplus bid stays on credit until foreclosure judgment.",
  },
  hbp: {
    title: "High-bid premium",
    body: "20% of the amount by which your bid exceeds 40% of SDAT assessed value. Paid sale day and refunded without interest — it dilutes IRR.",
  },
  bpo: {
    title: "Conservative BPO",
    body: "As-is broker price opinion proxy: SDAT assessed value times your haircut (default 65%). Used as the LTV denominator instead of raw assessment.",
  },
  hard: {
    title: "Hard flag",
    body: "A deal-breaker heuristic: remnant lot, exempt owner, drainage/easement language, jumbo/commercial scale, or LTV above the gate.",
  },
  watch: {
    title: "Watch flag",
    body: "Elevated risk that needs a source-system check (vacant situs, large acreage, trust vesting, thin equity) before you bid.",
  },
  info: {
    title: "Info flag",
    body: "Process note only — extra owners or an LLC titleholder. Search each name in PACER and MD Case Search.",
  },
  statutoryRate: {
    title: "Statutory rate",
    body: "Baltimore County redemption interest: 10% per year on the certificate (County Code §11-2-402). This is a gross rate before fees and high-bid-premium drag.",
  },
  hold: {
    title: "Hold (months)",
    body: "How long capital is modeled as outstanding. Default 9 months matches the first owner-occupied foreclosure filing day for the 2026 sale (May 27, 2027).",
  },
  haircut: {
    title: "As-is BPO haircut",
    body: "Fraction of SDAT assessed value treated as a conservative as-is broker opinion. Default 0.65 means a 35% discount off the assessment.",
  },
  overbid: {
    title: "Modeled overbid",
    body: "Extra dollars above taxes due, used to stress high-bid premium and takeout cost. Surplus bid stays on credit until judgment; only HBP and taxes leave on sale day.",
  },
  saleYear: {
    title: "Sale year",
    body: "Each Maryland collector runs one annual sale. Switch years to see that DAT calendar and the advertising book you imported for that year. 2026 Baltimore County is loaded; 2025–2023 stay empty until you import those lists.",
  },
  counties: {
    title: "Counties",
    body: "Maryland’s 24 collectors each run their own sale. There is no statewide registration or live listing API. Open the official portal, register separately, then import that county’s advertising file.",
  },
  legal: {
    title: "Legal / foreclosure overhead",
    body: "Counsel and filing cost loaded into fully burdened LTV. In a pure redemption you may never spend it; include it so takeout names still have an equity pad.",
  },
};
