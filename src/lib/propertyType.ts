import type { Lien } from "../types";
import { ownerBlob } from "./diligence";

export const PROPERTY_KINDS = [
  "house",
  "condo",
  "vacant",
  "acreage",
  "commercial",
  "remnant",
  "easement",
  "exempt",
  "unknown",
] as const;

export type PropertyKind = (typeof PROPERTY_KINDS)[number];

export const PROPERTY_KIND_LABEL: Record<PropertyKind, string> = {
  house: "House / improved",
  condo: "Condo / unit",
  vacant: "Vacant / no situs",
  acreage: "Acreage / land",
  commercial: "Commercial scale",
  remnant: "Remnant / micro-lot",
  easement: "Easement / drainage",
  exempt: "Exempt / special use",
  unknown: "Unclassified",
};

const EASEMENT = /\b(RETENTION|DETENTION|DRAINAGE|BASIN|EASEMENT|RIGHT OF WAY|\bROW\b)\b/;
const EXEMPT = /\b(CHURCH|MINISTR|TEMPLE|MOSQUE|SYNAGOG|PARISH|DIOCESE|HOUSING AUTH|COUNTY OF|STATE OF|MAYOR|UNITED STATES|\bUSA\b)\b/;
const CONDO = /\b(UNIT|CONDO|TOWNHOUSE|TOWNHOME|BLDG|BUILDING|HOA)\b/;
const COMMERCIAL_WORDS = /\b(OFFICE|INDUSTRIAL|WAREHOUSE|SHOPPING|RETAIL|HOTEL|APARTMENT|APTS|PLAZA|PARK)\b/;

export function classifyProperty(lien: Lien): { kind: PropertyKind; reason: string } {
  const desc = (lien.description ?? "").toUpperCase();
  const owner = ownerBlob(lien);

  if (EASEMENT.test(desc)) {
    return { kind: "easement", reason: "Legal description has drainage, basin, easement, or ROW language." };
  }
  if (EXEMPT.test(owner)) {
    return { kind: "exempt", reason: "Owner name looks religious, governmental, or otherwise tax-exempt." };
  }
  if (lien.acres != null && lien.acres < 0.08) {
    return { kind: "remnant", reason: `Recorded size is ${lien.acres} acres — usually a leftover strip or unbuildable remnant.` };
  }
  if (lien.assessedValue > 0 && lien.assessedValue < 15000) {
    return { kind: "remnant", reason: "Assessed value under $15k. Treat as residual land, not a house." };
  }
  if (lien.assessedValue >= 750000 || COMMERCIAL_WORDS.test(desc)) {
    return { kind: "commercial", reason: "Assessment or description is commercial / institutional scale." };
  }
  if (lien.acres != null && lien.acres >= 2) {
    return { kind: "acreage", reason: `${lien.acres} acres — land or possible commercial utility, not a house lot.` };
  }
  if (CONDO.test(desc)) {
    return { kind: "condo", reason: "Description cites a unit, building, phase, or HOA — condo / townhouse stack." };
  }
  if (!lien.hasSitus) {
    return { kind: "vacant", reason: "No street number on the advertising list. Confirm a buildable parcel in GIS." };
  }
  if (lien.hasSitus && lien.assessedValue >= 40000 && lien.assessedValue < 750000) {
    return { kind: "house", reason: "Has a situs number and a house-scale assessment. Still confirm use in GIS." };
  }
  if (lien.hasSitus) {
    return { kind: "house", reason: "Has a street number. Assessment is thin — verify it is improved." };
  }
  return { kind: "unknown", reason: "Advertising row does not give enough signal to classify use." };
}
