import type { DiligenceFlag, Lien } from "../types";
import { isEntityOwner, ownerBlob } from "./diligence";

const DIRECTIONAL =
  /\b(W\/S|E\/S|N\/S|S\/S|SE\/S|SW\/S|NE\/S|NW\/S|OFF)\b|&/;

export function isLeftoverFlag(flag: DiligenceFlag): boolean {
  return flag.id.startsWith("leftover-");
}

export function hasLeftoverRisk(flags: DiligenceFlag[]): boolean {
  return flags.some(isLeftoverFlag);
}

export function ownerClusterKey(lien: Lien): string {
  return ownerBlob(lien).replace(/[^A-Z0-9]+/g, " ").trim();
}

export function vacantClusterOwners(book: Lien[], min = 3): Set<string> {
  const counts = new Map<string, number>();
  for (const lien of book) {
    if (lien.hasSitus) continue;
    const key = ownerClusterKey(lien);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n >= min).map(([k]) => k));
}

/** Phase 0 leftover screen — names that die on the floor and come back as county OTC. */
export function leftoverFlags(lien: Lien, book: Lien[] = [lien]): DiligenceFlag[] {
  const flags: DiligenceFlag[] = [];
  const loc = `${lien.address} ${lien.street} ${lien.streetNumber} ${lien.description}`.toUpperCase();
  const faceLtv = lien.assessedValue > 0 ? lien.amountDue / lien.assessedValue : 1;
  const clusters = vacantClusterOwners(book);

  if (DIRECTIONAL.test(loc) || /^0\b/.test(lien.streetNumber) || lien.streetNumber === "00000") {
    flags.push({
      id: "leftover-directional",
      phase: 1,
      severity: "hard",
      title: "Leftover: no buildable situs",
      detail:
        "Address is 0, OFF the road, or only a compass side (W/S, SE/S). The floor treats this as a strip or landlocked remnant. Do not research it — it is tomorrow’s OTC list.",
    });
  }

  if (lien.amountDue > lien.assessedValue && lien.assessedValue > 0) {
    flags.push({
      id: "leftover-upside-down",
      phase: 3,
      severity: "hard",
      title: "Leftover: face exceeds assessed value",
      detail:
        "Taxes, sewer, town, or demo already exceed SDAT value. That is a super-lien stack, not a cheap house. The floor will not bid it.",
    });
  }

  if (!lien.hasSitus && isEntityOwner(lien)) {
    flags.push({
      id: "leftover-entity-strip",
      phase: 1,
      severity: "hard",
      title: "Leftover: entity strip / developer scrap",
      detail:
        "An LLC, Inc, or corp with no street number is almost always a campus leftover or unsold subdivision lot. Cheap face on a high assessment is the OTC trap (the Terumo pattern).",
    });
  }

  if (clusters.has(ownerClusterKey(lien)) && !lien.hasSitus) {
    flags.push({
      id: "leftover-cluster",
      phase: 1,
      severity: "hard",
      title: "Leftover: same-owner vacant cluster",
      detail:
        "Three or more no-situs certificates under the same name. Developer leftovers or heirship remnants — pass the whole cluster.",
    });
  }

  if (lien.assessedValue > 0 && faceLtv > 0.15 && lien.amountDue <= lien.assessedValue) {
    flags.push({
      id: "leftover-thin-face",
      phase: 3,
      severity: "watch",
      title: "Leftover risk: face already above 15% of AV",
      detail:
        "If taxes due are already 15%+ of assessment, legal and a conservative BPO put effective LTV through the institutional gate. These often go no-bid and reappear OTC.",
    });
  }

  return flags;
}
