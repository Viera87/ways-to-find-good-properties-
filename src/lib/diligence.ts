import type { DiligenceFlag, Lien } from "../types";

const OWNER_HARD = [
  /\bCHURCH\b/,
  /\bMINISTR/,
  /\bTEMPLE\b/,
  /\bMOSQUE\b/,
  /\bSYNAGOG/,
  /\bPARISH\b/,
  /\bDIOCESE\b/,
  /\bHOUSING AUTH/,
  /\bCOUNTY OF\b/,
  /\bSTATE OF\b/,
  /\bMAYOR\b/,
  /\bUNITED STATES\b/,
  /\bUSA\b/,
];

const OWNER_WATCH = [
  /\bET\s*AL\b/,
  /\bETAL\b/,
  /\bHEIR/,
  /\bESTATE\b/,
  /\bDEC'?D\b/,
  /\bDECEASED\b/,
  /\bPERSONAL REP/,
  /\bPR OF\b/,
  /\bTRUST\b/,
  /\bTRUSTEE\b/,
];

const DESC_HARD = [
  /\bRETENTION\b/,
  /\bDETENTION\b/,
  /\bDRAINAGE\b/,
  /\bBASIN\b/,
  /\bEASEMENT\b/,
  /\bROW\b/,
  /\bRIGHT OF WAY\b/,
];

export function ownerBlob(lien: Lien): string {
  return `${lien.owner} ${lien.owner2}`.replace(/\s+/g, " ").trim().toUpperCase();
}

export function isEntityOwner(lien: Lien): boolean {
  return /\b(LLC|INC|INCORPORATED|CORPORATION|CORP|LP|LLP|LTD|COMPANY|CO)\b/.test(ownerBlob(lien));
}

export function collectFlags(lien: Lien): DiligenceFlag[] {
  const flags: DiligenceFlag[] = [];
  const owner = ownerBlob(lien);
  const desc = lien.description.toUpperCase();

  if (!lien.hasSitus) {
    flags.push({
      id: "no-situs",
      phase: 1,
      severity: "watch",
      title: "No situs number",
      detail:
        "Street number is 00000 on the advertising list. Treat as unimproved, remnant, or poorly identified collateral until GIS confirms a buildable parcel with ingress/egress.",
    });
  }

  if (lien.acres != null && lien.acres < 0.08) {
    flags.push({
      id: "micro-lot",
      phase: 1,
      severity: lien.acres < 0.05 ? "hard" : "watch",
      title: "Micro-lot / remnant acreage",
      detail: `Recorded size is ${lien.acres} acres. Filter landlocked remnants, leftover strips, and lots too small for commercial or residential utility.`,
    });
  }

  if (lien.sqft != null && lien.sqft < 2500) {
    flags.push({
      id: "micro-sqft",
      phase: 1,
      severity: "watch",
      title: "Sub-standard lot area",
      detail: `Description cites ${lien.sqft.toLocaleString()} sq ft. Confirm zoning minimums and whether the parcel can support a structure.`,
    });
  }

  if (lien.acres != null && lien.acres >= 2) {
    flags.push({
      id: "large-acre",
      phase: 1,
      severity: "watch",
      title: "Large / possibly commercial acreage",
      detail:
        "Larger parcels raise brownfield and use-restriction risk. Run EPA ECHO / NEPAssist and confirm current zoning before bidding as if this were a house lot.",
    });
  }

  if (lien.assessedValue >= 1000000) {
    flags.push({
      id: "commercial-scale",
      phase: 1,
      severity: lien.assessedValue >= 3000000 ? "hard" : "watch",
      title: "Commercial-scale assessment",
      detail:
        "SDAT value is in institutional / office / industrial territory. Do not treat a thin tax bill on a $1m+ building as a clean residential certificate — zoning, environmental, and entity-credit work come first.",
    });
  }

  if (lien.amountDue >= 25000) {
    flags.push({
      id: "jumbo-face",
      phase: 3,
      severity: lien.amountDue >= 75000 ? "hard" : "watch",
      title: "Jumbo certificate / capital concentration",
      detail:
        "Face size concentrates the book in one name. Model subsequent taxes, HBP, and a single bankruptcy stay against the whole ticket before allocating.",
    });
  }

  if (DESC_HARD.some((re) => re.test(desc))) {
    flags.push({
      id: "easement-drainage",
      phase: 1,
      severity: "hard",
      title: "Drainage, basin, or easement language",
      detail:
        "Description suggests structurally obsolete collateral (retention/detention, drainage, ROW). These rarely survive as developable takeout assets.",
    });
  }

  if (OWNER_HARD.some((re) => re.test(owner))) {
    flags.push({
      id: "exempt-owner",
      phase: 2,
      severity: "hard",
      title: "Religious, governmental, or exempt owner",
      detail:
        "Foreclosure, service, and political risk are elevated. Many of these names also imply special-use or tax-exempt occupancy that is a poor takeout.",
    });
  }

  if (OWNER_WATCH.some((re) => re.test(owner))) {
    const heir = /\b(ET\s*AL|ETAL|HEIR|ESTATE|DEC|PERSONAL REP|PR OF)/.test(owner);
    flags.push({
      id: heir ? "heirship" : "trust",
      phase: 2,
      severity: heir ? "hard" : "watch",
      title: heir ? "Heirship / estate / ET AL ownership" : "Trust or trustee vesting",
      detail: heir
        ? "Fractionated heirship and probate disputes inflate quiet-title cost and can stall foreclosure of the right of redemption."
        : "Trust vesting requires extra title work. Confirm trustee authority and whether beneficial interests are fractionated.",
    });
  }

  if (lien.owner2 || owner.includes(",")) {
    flags.push({
      id: "multi-owner",
      phase: 2,
      severity: "info",
      title: "Multiple recorded names",
      detail:
        "More than one titleholder increases notice, service, and bankruptcy-search burden. Cross-check each name in PACER and MD Case Search.",
    });
  }

  if (isEntityOwner(lien)) {
    flags.push({
      id: "entity",
      phase: 2,
      severity: "info",
      title: "Entity titleholder",
      detail:
        "Search SDAT business filings and PACER for the entity and its principals. Chapter 7/11/13 stays freeze the redemption clock.",
    });
  }

  if (lien.assessedValue > 0 && lien.amountDue / lien.assessedValue > 0.4) {
    flags.push({
      id: "hbp-face",
      phase: 3,
      severity: "hard",
      title: "Face already exceeds 40% of assessed value",
      detail:
        "Baltimore County high-bid premium is 20% of the amount by which the bid exceeds 40% of SDAT assessed value. This certificate deploys zero-yield HBP on day one even at the minimum bid.",
    });
  }

  if (lien.assessedValue > 0 && lien.amountDue / lien.assessedValue > 0.2) {
    flags.push({
      id: "thin-equity",
      phase: 3,
      severity: "watch",
      title: "Face LTV above 20% of assessed value",
      detail:
        "Institutional max effective LTV is 15–20% on a conservative as-is BPO, not raw assessment. This name is already through that gate on face alone.",
    });
  }

  if (lien.assessedValue < 15000) {
    flags.push({
      id: "low-av",
      phase: 3,
      severity: "hard",
      title: "Nominal assessed value",
      detail:
        "Assessment below $15k usually means unbuildable remnants, residual land, or obsolete improvements. Do not treat SDAT value as a BPO.",
    });
  }

  return flags;
}

export function diligenceLinks(lien: Lien) {
  const query = encodeURIComponent(`${lien.address}, Baltimore County, MD`);
  const ownerQ = encodeURIComponent(lien.owner);
  return [
    {
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${query}`,
      note: "Situs, access, adjoining use",
    },
    {
      label: "SDAT Real Property",
      href: "https://sdat.dat.maryland.gov/RealProperty/Pages/default.aspx",
      note: `Baltimore County · Dist ${lien.district} · Acct ${lien.parcel}`,
    },
    {
      label: "County GIS / My Neighborhood",
      href: "https://bcgis.baltimorecountymd.gov/",
      note: "Zoning, overlays, flood, easements",
    },
    {
      label: "EPA ECHO",
      href: "https://echo.epa.gov/facilities/facility-search",
      note: "Brownfield / RCRA / dry cleaner / UST",
    },
    {
      label: "NEPAssist",
      href: `https://nepassisttool.epa.gov/nepassist/nepamap.aspx`,
      note: "Mapped environmental layers",
    },
    {
      label: "MD Case Search",
      href: "https://casesearch.courts.state.md.us/casesearch/",
      note: "State civil / foreclosure docket",
    },
    {
      label: "PACER",
      href: "https://pacer.uscourts.gov/",
      note: `Bankruptcy stay on ${lien.owner}`,
    },
    {
      label: "Collector’s Terms 2026",
      href: "https://www.baltimorecountymd.gov/departments/budfin/taxpayer-services/tax-sale/collectors-terms",
      note: "HBP, ACH, filing windows",
    },
    {
      label: "Owner web check",
      href: `https://www.google.com/search?q=${ownerQ}+Baltimore+County+Maryland`,
      note: "Obits, probate, news, code cases",
    },
  ];
}
