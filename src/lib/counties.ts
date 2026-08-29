export type CountySale = {
  id: string;
  name: string;
  typicalWindow: string;
  datDate2026: string;
  datSort: string;
  portalName: string;
  portalUrl: string;
  vendor: "RealAuction" | "County portal" | "DAT / City";
  feeNote: string;
};

export const DAT_SCHEDULE = "https://dat.maryland.gov/pages/tax-sale-schedule.aspx";
export const DAT_OMBUDSMAN = "https://dat.maryland.gov/pages/tax-sale-information.aspx";

/** Official DAT 2026 dates, plus typical windows and the county/vendor portal used to register. */
export const MARYLAND_SALES: CountySale[] = [
  { id: "st-marys", name: "St. Mary's County", typicalWindow: "Early March", datDate2026: "March 6, 2026", datSort: "2026-03-06", portalName: "St. Mary's County Treasurer", portalUrl: "https://stmarys.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Register on the county auction site; ~$100 fee typical." },
  { id: "frederick", name: "Frederick County", typicalWindow: "Early to mid-May", datDate2026: "May 11, 2026", datSort: "2026-05-11", portalName: "Frederick County Tax Sale Portal", portalUrl: "https://frederick.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "$100 ACH registration; W-9 and bid budget required." },
  { id: "prince-georges", name: "Prince George's County", typicalWindow: "Mid-May", datDate2026: "May 11, 2026", datSort: "2026-05-11", portalName: "Prince George's Tax Sale Portal", portalUrl: "https://taxsale.princegeorgescountymd.gov/", vendor: "County portal", feeNote: "$150 registration + $1,000 deposit (2026). W-9 upload required." },
  { id: "charles", name: "Charles County", typicalWindow: "Mid-May", datDate2026: "May 12, 2026", datSort: "2026-05-12", portalName: "Charles County Treasury Portal", portalUrl: "https://charles.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Separate county registration even if you already have a RealAuction login." },
  { id: "baltimore-city", name: "Baltimore City", typicalWindow: "Mid to late May", datDate2026: "May 18, 2026", datSort: "2026-05-18", portalName: "State Tax Sale Ombudsman / City collector", portalUrl: "https://dat.maryland.gov/pages/tax-sale-information.aspx", vendor: "DAT / City", feeNote: "City collector terms and portal are independent of every county." },
  { id: "garrett", name: "Garrett County", typicalWindow: "Mid to late May (e.g. May 18–22)", datDate2026: "May 18, 2026", datSort: "2026-05-18", portalName: "Garrett County Tax Sale Site", portalUrl: "https://garrett.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Multi-day sale historically; register on the Garrett site, not a neighbor county." },
  { id: "dorchester", name: "Dorchester County", typicalWindow: "Mid to late June", datDate2026: "May 19, 2026", datSort: "2026-05-19", portalName: "Dorchester Finance Department", portalUrl: "https://dorchester.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "DAT date can differ from the historic June window — confirm on the portal." },
  { id: "queen-annes", name: "Queen Anne's County", typicalWindow: "Mid-May", datDate2026: "May 19, 2026", datSort: "2026-05-19", portalName: "Queen Anne's County Tax Sale", portalUrl: "https://queenannes.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Own registration window and collector terms." },
  { id: "talbot", name: "Talbot County", typicalWindow: "Mid-May", datDate2026: "May 20, 2026", datSort: "2026-05-20", portalName: "Talbot County Finance", portalUrl: "https://talbot.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Separate W-9, ACH, and terms." },
  { id: "kent", name: "Kent County", typicalWindow: "Mid to late May (e.g. May 21)", datDate2026: "May 21, 2026", datSort: "2026-05-21", portalName: "Kent County Online Tax Sale", portalUrl: "https://kent.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Miss the Kent deadline and you cannot use another county’s registration." },
  { id: "calvert", name: "Calvert County", typicalWindow: "April or May", datDate2026: "May 22, 2026", datSort: "2026-05-22", portalName: "Calvert County Tax Sale Hub", portalUrl: "https://calvert.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Typical $100–$150 non-refundable fee." },
  { id: "allegany", name: "Allegany County", typicalWindow: "Late May", datDate2026: "May 28, 2026", datSort: "2026-05-28", portalName: "Allegany Tax Office Portal", portalUrl: "https://allegany.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Register on the Allegany auction site even if you already bid in Garrett." },
  { id: "cecil", name: "Cecil County", typicalWindow: "Early June", datDate2026: "June 1, 2026", datSort: "2026-06-01", portalName: "Cecil County Finance Department", portalUrl: "https://cecil.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Own deposit / proof-of-funds rules." },
  { id: "washington", name: "Washington County", typicalWindow: "Early June", datDate2026: "June 2, 2026", datSort: "2026-06-02", portalName: "Washington County Treasurer", portalUrl: "https://washington.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Separate collector terms and ACH." },
  { id: "anne-arundel", name: "Anne Arundel County", typicalWindow: "Early June", datDate2026: "June 3, 2026", datSort: "2026-06-03", portalName: "Anne Arundel Finance Office", portalUrl: "https://annearundel.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "2026 registration was May 1–May 29; $100-class fee typical." },
  { id: "harford", name: "Harford County", typicalWindow: "Mid-June", datDate2026: "June 3, 2026", datSort: "2026-06-03", portalName: "Harford County Treasury", portalUrl: "https://harford.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Independent of Baltimore County registration." },
  { id: "howard", name: "Howard County", typicalWindow: "Early May or early August", datDate2026: "June 3, 2026", datSort: "2026-06-03", portalName: "Howard County Finance Office", portalUrl: "https://howard.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "DAT date can move between May, June, and August — confirm each year." },
  { id: "montgomery", name: "Montgomery County", typicalWindow: "Mid-June", datDate2026: "June 8, 2026", datSort: "2026-06-08", portalName: "Montgomery County Finance", portalUrl: "https://montgomery.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "County-specific forms and budget; no statewide pass." },
  { id: "worcester", name: "Worcester County", typicalWindow: "Mid-May (portal has advertised May 13–15)", datDate2026: "June 9, 2026", datSort: "2026-06-09", portalName: "Worcester Tax Sale Site", portalUrl: "https://worcester.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "$100 ACH (2026 portal). Confirm DAT vs treasurer dates before you fly." },
  { id: "wicomico", name: "Wicomico County", typicalWindow: "Mid-June", datDate2026: "June 9, 2026", datSort: "2026-06-09", portalName: "Wicomico Finance Department", portalUrl: "https://wicomico.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Separate registration from Worcester or Somerset." },
  { id: "somerset", name: "Somerset County", typicalWindow: "Mid-June", datDate2026: "June 11, 2026", datSort: "2026-06-11", portalName: "Somerset County Tax Sale", portalUrl: "https://somerset.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Own window, fee, and collector terms." },
  { id: "carroll", name: "Carroll County", typicalWindow: "Late June (typically June 30)", datDate2026: "June 26, 2026", datSort: "2026-06-26", portalName: "Carroll County Collections", portalUrl: "https://carroll.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "Often one of the last June sales; register on Carroll’s site." },
  { id: "caroline", name: "Caroline County", typicalWindow: "Early to mid-May", datDate2026: "August 21, 2026", datSort: "2026-08-21", portalName: "Caroline County Tax Sale Office", portalUrl: "https://caroline.marylandtaxsale.com/", vendor: "RealAuction", feeNote: "2026 DAT date is August — do not rely on the historic May window alone." },
  { id: "baltimore-county", name: "Baltimore County", typicalWindow: "Late August (e.g. August 27, 2026)", datDate2026: "August 27, 2026", datSort: "2026-08-27", portalName: "Baltimore County Tax Sale Portal", portalUrl: "https://www.baltimorecountymd.gov/departments/budfin/taxpayer-services/tax-sale", vendor: "County portal", feeNote: "$100 registration (2026). Listing sheets to registered bidders ~Aug 25. CERTUS already loaded the advertising file." },
];

export function saleStatus(datSort: string, today = "2026-08-29"): "upcoming" | "window" | "held" {
  if (datSort < today) return "held";
  const open = new Date(`${datSort}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const days = (open.getTime() - now.getTime()) / 86400000;
  return days <= 45 ? "window" : "upcoming";
}
