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
  winningBid: {
    title: "Winning bid",
    body: "Price the 2025 winner posted, not just taxes due. In Maryland the surplus stays on credit until foreclosure judgment; sale-day ACH is still taxes due plus HBP. Bids often run 40–70% of assessed value and trigger a large zero-interest premium.",
  },
  saleYear: {
    title: "Sale year",
    body: "Each Maryland collector runs one annual sale. Switch years, then switch county books. 2026 Baltimore County is loaded; import other collectors without overwriting it.",
  },
  counties: {
    title: "Counties",
    body: "Maryland’s 24 collectors each run their own sale. There is no statewide registration or live listing API. Import one advertising file at a time. Each county-year is its own book — a new county does not replace one you already loaded.",
  },
  leftover: {
    title: "Leftover / OTC risk",
    body: "Phase 0 screen for names that die on the auction floor and come back as county-owned OTC: no buildable situs, face above assessed value, entity strips, same-owner vacant clusters, or face already above 15% of AV. Do not spend GIS time on these before the sale.",
  },
  leftoverKpi: {
    title: "OTC / leftover risk",
    body: "Count of certificates that look like post-auction county leftovers. Hide them with the Pre-auction book chip. The floor already passed; they are adverse selection, not a sourcing channel.",
  },
  propertyType: {
    title: "Property type",
    body: "Automated read of the advertising file only — situs, acreage, assessment, unit language, easement words, and owner name. It is not SDAT land use or a zoning letter. Filter the pipeline by type, then confirm the parcel in county GIS.",
  },
  areaCheck: {
    title: "Location check",
    body: "Geocodes the street address, then reads FEMA flood zone and the Baltimore County police precinct. CrimeMapping and county police links are the current incident view. The county Part I GIS layer only covers 2017–2020 — that count is not a live safety grade.",
  },
  legal: {
    title: "Legal / foreclosure overhead",
    body: "Counsel and filing cost loaded into fully burdened LTV. In a pure redemption you may never spend it; include it so takeout names still have an equity pad.",
  },
  countyBook: {
    title: "County book",
    body: "One advertising file per collector per sale year. Import Cecil without replacing Baltimore County. Re-importing the same county replaces only that book. There is still no statewide feed — one file at a time.",
  },
  goldenRule: {
    title: "Golden rule of sub-taxes",
    body: "Never buy unless 2× to 3× the annual levy already sits in cash after auction ACH. If a new bill posts and you miss it, the county sells a new certificate. That investor primes you and the original stake can be wiped out.",
  },
  subTaxBill: {
    title: "Next levy",
    body: "Modeled subsequent tax bill: SDAT assessed value times your sub-tax millage. This is the check that must be written when the new bill comes out — not a pro-rata scrap of the hold.",
  },
  subTaxReserve: {
    title: "Sub-tax reserve",
    body: "Cash that must sit after auction ACH. Default is 2.5× the annual levy (set 2×–3×). Paying it adds the bill to the certificate and it earns statutory interest. Not paying it lets a new lien take priority and can wipe the original stake.",
  },
  subTaxRate: {
    title: "Sub-tax millage",
    body: "Proxy for the next county/state property-tax bill as a fraction of SDAT assessed value. Default 1.1%. Raise it for high-rate towns or sewer/stormwater that travel with the levy.",
  },
  subTaxMonth: {
    title: "First sub-tax month",
    body: "Months after the sale when the next tax bill is expected. Default 6. Later bills are modeled every 12 months after that.",
  },
  subTaxMultiple: {
    title: "Sub-tax reserve multiple",
    body: "How many years of the modeled levy must sit in cash after auction ACH. The desk default is 2.5×. Use 2× as a floor and 3× when the hold may run past a second bill.",
  },
  pitfalls: {
    title: "Six pitfalls",
    body: "Interest not the house, no sight-unseen bids, surviving municipal super-liens, illiquid lockup, legal description vs parcel, and a 2×–3× sub-tax reserve. A certificate is not bid-ready until all six are checked on the memo.",
  },
  redemptionPath: {
    title: "Expected path",
    body: "Redemption — owner, lender, or heir pays you off. Historically the large majority of tax certificates never go to deed. Size the bid as a locked high-yield note, not as a path to own the house.",
  },
  lockup: {
    title: "Capital lockup",
    body: "Months your cash sits with no ability to sell the certificate like a stock or CD. Owner-occupied 2026 Baltimore County names generally cannot go to complaint before May 27, 2027. Do not bid emergency funds.",
  },
  legalDesc: {
    title: "Legal description vs parcel",
    body: "The advertising file’s short legal and account ID are what you buy — not the house you drove past. Strip, alley, residue, and open-space language is a hard fail. Always overlay the account on county GIS.",
  },
  deskCash: {
    title: "Desk cash",
    body: "Total cash available for this sale year. Auction ACH and the subsequent-tax reserve both come out of this number. If ACH alone fits but the reserve does not, the golden rule fails.",
  },
};
