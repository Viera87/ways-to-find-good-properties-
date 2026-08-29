export type SaleYear = 2023 | 2024 | 2025 | 2026;

export type DatStamp = {
  label: string;
  /** ISO date for sorting/status. Null when DAT listed postponed, cancelled, or a range without a single day. */
  sort: string | null;
};

export type CountySale = {
  id: string;
  name: string;
  typicalWindow: string;
  portalName: string;
  portalUrl: string;
  vendor: "RealAuction" | "County portal" | "DAT / City";
  feeNote: string;
  dates: Record<SaleYear, DatStamp>;
};

export const SALE_YEARS: SaleYear[] = [2026, 2025, 2024, 2023];

export const DAT_SCHEDULE = "https://dat.maryland.gov/pages/tax-sale-schedule.aspx";
export const DAT_OMBUDSMAN = "https://dat.maryland.gov/pages/tax-sale-information.aspx";

const d = (label: string, sort: string | null = null): DatStamp => ({ label, sort });

export const MARYLAND_SALES: CountySale[] = [
  {
    id: "st-marys",
    name: "St. Mary's County",
    typicalWindow: "Early March",
    portalName: "St. Mary's County Treasurer",
    portalUrl: "https://stmarys.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Register on the county auction site; ~$100 fee typical.",
    dates: {
      2026: d("March 6, 2026", "2026-03-06"),
      2025: d("March 7, 2025", "2025-03-07"),
      2024: d("March 1, 2024", "2024-03-01"),
      2023: d("March 3, 2023", "2023-03-03"),
    },
  },
  {
    id: "frederick",
    name: "Frederick County",
    typicalWindow: "Early to mid-May",
    portalName: "Frederick County Tax Sale Portal",
    portalUrl: "https://frederick.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "$100 ACH registration; W-9 and bid budget required.",
    dates: {
      2026: d("May 11, 2026", "2026-05-11"),
      2025: d("May 12, 2025", "2025-05-12"),
      2024: d("May 13, 2024", "2024-05-13"),
      2023: d("May 8, 2023", "2023-05-08"),
    },
  },
  {
    id: "prince-georges",
    name: "Prince George's County",
    typicalWindow: "Mid-May",
    portalName: "Prince George's Tax Sale Portal",
    portalUrl: "https://taxsale.princegeorgescountymd.gov/",
    vendor: "County portal",
    feeNote: "$150 registration + $1,000 deposit (2026). W-9 upload required.",
    dates: {
      2026: d("May 11, 2026", "2026-05-11"),
      2025: d("May 12, 2025", "2025-05-12"),
      2024: d("May 13, 2024", "2024-05-13"),
      2023: d("May 9, 2023", "2023-05-09"),
    },
  },
  {
    id: "charles",
    name: "Charles County",
    typicalWindow: "Mid-May",
    portalName: "Charles County Treasury Portal",
    portalUrl: "https://charles.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Separate county registration even if you already have a RealAuction login.",
    dates: {
      2026: d("May 12, 2026", "2026-05-12"),
      2025: d("May 13, 2025", "2025-05-13"),
      2024: d("May 13, 2024", "2024-05-13"),
      2023: d("May 9, 2023", "2023-05-09"),
    },
  },
  {
    id: "baltimore-city",
    name: "Baltimore City",
    typicalWindow: "Mid to late May",
    portalName: "State Tax Sale Ombudsman / City collector",
    portalUrl: "https://dat.maryland.gov/pages/tax-sale-information.aspx",
    vendor: "DAT / City",
    feeNote: "City collector terms and portal are independent of every county.",
    dates: {
      2026: d("May 18, 2026", "2026-05-18"),
      2025: d("May 19, 2025", "2025-05-19"),
      2024: d("May 20, 2024", "2024-05-20"),
      2023: d("May 15, 2023", "2023-05-15"),
    },
  },
  {
    id: "garrett",
    name: "Garrett County",
    typicalWindow: "Mid to late May (e.g. May 18–22)",
    portalName: "Garrett County Tax Sale Site",
    portalUrl: "https://garrett.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Multi-day sale historically; register on the Garrett site, not a neighbor county.",
    dates: {
      2026: d("May 18, 2026", "2026-05-18"),
      2025: d("May 19, 2025", "2025-05-19"),
      2024: d("May 20–24, 2024", "2024-05-20"),
      2023: d("May 22–26, 2023", "2023-05-22"),
    },
  },
  {
    id: "dorchester",
    name: "Dorchester County",
    typicalWindow: "Mid to late June",
    portalName: "Dorchester Finance Department",
    portalUrl: "https://dorchester.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "DAT date can differ from the historic June window — confirm on the portal.",
    dates: {
      2026: d("May 19, 2026", "2026-05-19"),
      2025: d("June 16, 2025", "2025-06-16"),
      2024: d("June 18, 2024", "2024-06-18"),
      2023: d("June 27, 2023", "2023-06-27"),
    },
  },
  {
    id: "queen-annes",
    name: "Queen Anne's County",
    typicalWindow: "Mid-May",
    portalName: "Queen Anne's County Tax Sale",
    portalUrl: "https://queenannes.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Own registration window and collector terms.",
    dates: {
      2026: d("May 19, 2026", "2026-05-19"),
      2025: d("May 20, 2025", "2025-05-20"),
      2024: d("May 21, 2024", "2024-05-21"),
      2023: d("May 16, 2023", "2023-05-16"),
    },
  },
  {
    id: "talbot",
    name: "Talbot County",
    typicalWindow: "Mid-May",
    portalName: "Talbot County Finance",
    portalUrl: "https://talbot.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Separate W-9, ACH, and terms.",
    dates: {
      2026: d("May 20, 2026", "2026-05-20"),
      2025: d("June 9, 2025", "2025-06-09"),
      2024: d("May 15, 2024", "2024-05-15"),
      2023: d("May 17, 2023", "2023-05-17"),
    },
  },
  {
    id: "kent",
    name: "Kent County",
    typicalWindow: "Mid to late May (e.g. May 21)",
    portalName: "Kent County Online Tax Sale",
    portalUrl: "https://kent.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Miss the Kent deadline and you cannot use another county’s registration.",
    dates: {
      2026: d("May 21, 2026", "2026-05-21"),
      2025: d("May 22, 2025", "2025-05-22"),
      2024: d("May 9, 2024", "2024-05-09"),
      2023: d("May 11, 2023", "2023-05-11"),
    },
  },
  {
    id: "calvert",
    name: "Calvert County",
    typicalWindow: "April or May",
    portalName: "Calvert County Tax Sale Hub",
    portalUrl: "https://calvert.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Typical $100–$150 non-refundable fee.",
    dates: {
      2026: d("May 22, 2026", "2026-05-22"),
      2025: d("December 5, 2025", "2025-12-05"),
      2024: d("April 19, 2024", "2024-04-19"),
      2023: d("April 21, 2023", "2023-04-21"),
    },
  },
  {
    id: "allegany",
    name: "Allegany County",
    typicalWindow: "Late May",
    portalName: "Allegany Tax Office Portal",
    portalUrl: "https://allegany.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Register on the Allegany auction site even if you already bid in Garrett.",
    dates: {
      2026: d("May 28, 2026", "2026-05-28"),
      2025: d("May 29, 2025", "2025-05-29"),
      2024: d("May 29, 2024", "2024-05-29"),
      2023: d("May 24, 2023", "2023-05-24"),
    },
  },
  {
    id: "cecil",
    name: "Cecil County",
    typicalWindow: "Early June",
    portalName: "Cecil County Finance Department",
    portalUrl: "https://cecil.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Own deposit / proof-of-funds rules.",
    dates: {
      2026: d("June 1, 2026", "2026-06-01"),
      2025: d("June 9, 2025", "2025-06-09"),
      2024: d("June 3, 2024", "2024-06-03"),
      2023: d("June 5, 2023", "2023-06-05"),
    },
  },
  {
    id: "washington",
    name: "Washington County",
    typicalWindow: "Early June",
    portalName: "Washington County Treasurer",
    portalUrl: "https://washington.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Separate collector terms and ACH.",
    dates: {
      2026: d("June 2, 2026", "2026-06-02"),
      2025: d("June 3, 2025", "2025-06-03"),
      2024: d("June 4, 2024", "2024-06-04"),
      2023: d("June 6, 2023", "2023-06-06"),
    },
  },
  {
    id: "anne-arundel",
    name: "Anne Arundel County",
    typicalWindow: "Early June",
    portalName: "Anne Arundel Finance Office",
    portalUrl: "https://annearundel.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "2026 registration was May 1–May 29; $100-class fee typical.",
    dates: {
      2026: d("June 3, 2026", "2026-06-03"),
      2025: d("Postponed", null),
      2024: d("June 4, 2024", "2024-06-04"),
      2023: d("June 6, 2023", "2023-06-06"),
    },
  },
  {
    id: "harford",
    name: "Harford County",
    typicalWindow: "Mid-June",
    portalName: "Harford County Treasury",
    portalUrl: "https://harford.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Independent of Baltimore County registration.",
    dates: {
      2026: d("June 3, 2026", "2026-06-03"),
      2025: d("June 16, 2025", "2025-06-16"),
      2024: d("June 15, 2024", "2024-06-15"),
      2023: d("June 20, 2023", "2023-06-20"),
    },
  },
  {
    id: "howard",
    name: "Howard County",
    typicalWindow: "Early May or early August",
    portalName: "Howard County Finance Office",
    portalUrl: "https://howard.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "DAT date can move between May, June, and August — confirm each year.",
    dates: {
      2026: d("June 3, 2026", "2026-06-03"),
      2025: d("August 6, 2025", "2025-08-06"),
      2024: d("May 1, 2024", "2024-05-01"),
      2023: d("May 8, 2023", "2023-05-08"),
    },
  },
  {
    id: "montgomery",
    name: "Montgomery County",
    typicalWindow: "Mid-June",
    portalName: "Montgomery County Finance",
    portalUrl: "https://montgomery.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "County-specific forms and budget; no statewide pass.",
    dates: {
      2026: d("June 8, 2026", "2026-06-08"),
      2025: d("June 9, 2025", "2025-06-09"),
      2024: d("June 10, 2024", "2024-06-10"),
      2023: d("June 12, 2023", "2023-06-12"),
    },
  },
  {
    id: "worcester",
    name: "Worcester County",
    typicalWindow: "Mid-May (portal has advertised May 13–15)",
    portalName: "Worcester Tax Sale Site",
    portalUrl: "https://worcester.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "$100 ACH (2026 portal). Confirm DAT vs treasurer dates before you fly.",
    dates: {
      2026: d("June 9, 2026", "2026-06-09"),
      2025: d("May 16, 2025", "2025-05-16"),
      2024: d("May 17, 2024", "2024-05-17"),
      2023: d("May 17–19, 2023", "2023-05-17"),
    },
  },
  {
    id: "wicomico",
    name: "Wicomico County",
    typicalWindow: "Mid-June",
    portalName: "Wicomico Finance Department",
    portalUrl: "https://wicomico.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Separate registration from Worcester or Somerset.",
    dates: {
      2026: d("June 9, 2026", "2026-06-09"),
      2025: d("June 11, 2025", "2025-06-11"),
      2024: d("June 12, 2024", "2024-06-12"),
      2023: d("June 14, 2023", "2023-06-14"),
    },
  },
  {
    id: "somerset",
    name: "Somerset County",
    typicalWindow: "Mid-June",
    portalName: "Somerset County Tax Sale",
    portalUrl: "https://somerset.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Own window, fee, and collector terms.",
    dates: {
      2026: d("June 11, 2026", "2026-06-11"),
      2025: d("June 12, 2025", "2025-06-12"),
      2024: d("June 13, 2024", "2024-06-13"),
      2023: d("June 8, 2023", "2023-06-08"),
    },
  },
  {
    id: "carroll",
    name: "Carroll County",
    typicalWindow: "Late June (typically June 30)",
    portalName: "Carroll County Collections",
    portalUrl: "https://carroll.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "Often one of the last June sales; register on Carroll’s site.",
    dates: {
      2026: d("June 26, 2026", "2026-06-26"),
      2025: d("June 30, 2025", "2025-06-30"),
      2024: d("June 28, 2024", "2024-06-28"),
      2023: d("June 30, 2023", "2023-06-30"),
    },
  },
  {
    id: "caroline",
    name: "Caroline County",
    typicalWindow: "Early to mid-May",
    portalName: "Caroline County Tax Sale Office",
    portalUrl: "https://caroline.marylandtaxsale.com/",
    vendor: "RealAuction",
    feeNote: "2026 DAT date is August — do not rely on the historic May window alone.",
    dates: {
      2026: d("August 21, 2026", "2026-08-21"),
      2025: d("May 2, 2025", "2025-05-02"),
      2024: d("May 9–10, 2024", "2024-05-09"),
      2023: d("May 11–12, 2023", "2023-05-11"),
    },
  },
  {
    id: "baltimore-county",
    name: "Baltimore County",
    typicalWindow: "Late August",
    portalName: "Baltimore County Tax Sale Portal",
    portalUrl: "https://www.baltimorecountymd.gov/departments/budfin/taxpayer-services/tax-sale",
    vendor: "County portal",
    feeNote: "$100 registration (2026). Listing sheets to registered bidders ~two days before sale.",
    dates: {
      2026: d("August 27, 2026", "2026-08-27"),
      2025: d("August 28, 2025", "2025-08-28"),
      2024: d("August 22, 2024", "2024-08-22"),
      2023: d("October 26, 2023", "2023-10-26"),
    },
  },
];

export type SaleStatus = "upcoming" | "window" | "held" | "unposted";

export function saleStatus(datSort: string | null, today = "2026-08-29"): SaleStatus {
  if (!datSort) return "unposted";
  if (datSort < today) return "held";
  const open = new Date(`${datSort}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const days = (open.getTime() - now.getTime()) / 86400000;
  return days <= 45 ? "window" : "upcoming";
}

export function statusLabel(status: SaleStatus, year: number): string {
  if (status === "held") return `${year} sale held — leftover / OTC at the finance office`;
  if (status === "window") return `Inside the ${year} 45-day registration / sale window`;
  if (status === "upcoming") return `${year} upcoming — watch DAT for the confirmed date`;
  return `${year} postponed, cancelled, or not posted on DAT`;
}
