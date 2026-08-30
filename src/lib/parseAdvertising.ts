import type { Lien } from "../types";

function money(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,"]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function pick(row: Record<string, string>, names: string[]): string {
  const keys = Object.keys(row);
  for (const name of names) {
    const hit = keys.find((k) => k.trim().toLowerCase() === name.toLowerCase());
    if (hit && row[hit].trim()) return row[hit];
  }
  return "";
}

function parseDelimited(text: string): Record<string, string>[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const first = normalized.split("\n")[0] ?? "";
  const delimiter = first.split("\t").length >= 3 ? "\t" : ",";
  const lines = normalized.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

export function parseAdvertisingFile(text: string, countyId: string): Lien[] {
  const acreRe = /([\d.]+)\s*AC/i;
  const sqftRe = /([\d,]+)\s*SQ\s*FT/i;
  const liens: Lien[] = [];

  for (const row of parseDelimited(text)) {
    const district = pick(row, ["District", "Dist", "Ward"]);
    const parcel = pick(row, ["Parcel", "Account", "Account Number", "Acct", "Tax Account"]);
    if (!/^\d+$/.test(district) || !/^\d+$/.test(parcel.replace(/-/g, ""))) continue;
    const amount = money(pick(row, ["Amount Due", "Taxes Due", "Amount", "Lien Amount", "Face"]));
    const assessed = money(pick(row, ["Assessed Value", "Assessment", "Assessed", "SDAT Value"]));
    if (amount == null || assessed == null) continue;

    const description = pick(row, ["Property Description", "Description", "Legal"]);
    const streetNumRaw = pick(row, ["STREET NUMBER", "Street Number", "Number", "House No"]);
    const street = pick(row, ["Address", "Street", "Street Name"]);
    const streetType = pick(row, ["STREET TYPE", "Street Type", "Suffix"]);
    const acresMatch = acreRe.exec(description);
    const sqftMatch = sqftRe.exec(description);
    const hasSitus = !["", "0", "00000"].includes(streetNumRaw);
    const displayNum = hasSitus && /^\d+$/.test(streetNumRaw) ? String(Number(streetNumRaw)) : streetNumRaw;
    const address = [hasSitus ? displayNum : "", street, streetType].filter(Boolean).join(" ").trim();
    const dist = district.padStart(2, "0").slice(-2);

    liens.push({
      id: `${countyId}:${dist}-${parcel}`,
      district: dist,
      parcel,
      owner: pick(row, ["Owner", "Owner 1", "Name"]),
      owner2: pick(row, ["Owner 2", "Owner2"]),
      description,
      streetNumber: hasSitus ? displayNum : "",
      street,
      streetType,
      address,
      amountDue: Math.round(amount * 100) / 100,
      assessedValue: Math.round(assessed * 100) / 100,
      acres: acresMatch ? Number(acresMatch[1]) : null,
      sqft: sqftMatch ? Number(sqftMatch[1].replace(/,/g, "")) : null,
      hasSitus,
    });
  }
  return liens;
}
