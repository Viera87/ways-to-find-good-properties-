export type LienBook = {
  year: number;
  countyId: string;
  countyName: string;
  source: string;
  liens: Lien[];
};

export type SaleResult = {
  winningBid: number;
  hbp: number;
  totalDue: number;
  bidderId: string;
  bidderName: string;
  bidderAddress: string;
  bidToValue: number;
};

export type Lien = {
  id: string;
  district: string;
  parcel: string;
  owner: string;
  owner2: string;
  description: string;
  streetNumber: string;
  street: string;
  streetType: string;
  address: string;
  amountDue: number;
  assessedValue: number;
  acres: number | null;
  sqft: number | null;
  hasSitus: boolean;
  saleResult?: SaleResult;
};

export type Assumptions = {
  statutoryRate: number;
  holdMonths: number;
  ownerOccupied: boolean;
  bpoHaircut: number;
  overbid: number;
  subsequentTaxRate: number;
  subTaxMonth: number;
  legalOverhead: number;
  unrecoverableFees: number;
  maxEffectiveLtv: number;
};

export type DiligenceFlag = {
  id: string;
  phase: 1 | 2 | 3 | 4;
  severity: "info" | "watch" | "hard";
  title: string;
  detail: string;
};

export type Verdict = "ACCUMULATE" | "UNDERWRITE" | "MONITOR" | "DECLINE";

export type Underwriting = {
  bid: number;
  highBidPremium: number;
  conservativeBpo: number;
  subsequentTaxes: number;
  auctionDayCapital: number;
  redemptionCapital: number;
  takeoutCapital: number;
  fullyBurdenedCost: number;
  faceLtv: number;
  effectiveLtv: number;
  takeoutLtv: number;
  grossInterest: number;
  netProfit: number;
  netAnnualizedYield: number;
  hbpDragBps: number;
  flags: DiligenceFlag[];
  score: number;
  verdict: Verdict;
  scoreBreakdown: {
    equity: number;
    yield: number;
    collateral: number;
    title: number;
  };
  leftoverRisk: boolean;
};
