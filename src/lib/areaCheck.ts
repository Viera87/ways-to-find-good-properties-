import type { Lien } from "../types";

const UA = "CERTUS-tax-lien-desk/1.0 (self-hosted underwriting desk)";

export type AreaCheckResult = {
  query: string;
  matchedAddress: string | null;
  lat: number | null;
  lon: number | null;
  floodZone: string | null;
  floodNote: string | null;
  specialFloodHazard: boolean | null;
  precinct: string | null;
  historicalPart1: { total: number; byCategory: Record<string, number>; window: string } | null;
  links: { label: string; href: string; note: string }[];
  warnings: string[];
};

export function locationQuery(lien: Lien): string | null {
  const address = lien.address.trim();
  if (!lien.hasSitus || !address || /^\d/.test(address) === false) return null;
  return `${address}, Baltimore County, MD`;
}

export function interpretFlood(zone: string | null, subtype: string | null, sfha: string | null) {
  const z = (zone ?? "").trim().toUpperCase();
  const sub = (subtype ?? "").trim();
  const hazard = sfha === "T" || /^A|^V/.test(z);
  if (!z) return { floodZone: null, floodNote: "No flood-zone polygon returned.", specialFloodHazard: null };
  if (hazard) {
    return {
      floodZone: z,
      floodNote: sub || "Special flood hazard area — takeout and insurance are harder.",
      specialFloodHazard: true,
    };
  }
  return {
    floodZone: z,
    floodNote: sub || "Outside the mapped special flood hazard area (still confirm the map).",
    specialFloodHazard: false,
  };
}

export function safetyLinks(query: string, lat: number | null, lon: number | null) {
  const q = encodeURIComponent(query);
  const links = [
    {
      label: "CrimeMapping · Baltimore County",
      href: "https://www.crimemapping.com/map/md/baltimorecounty",
      note: "Recent reported incidents on the county map",
    },
    {
      label: "County police crime stats",
      href: "https://www.baltimorecountymd.gov/departments/police/crime-stats",
      note: "Official CompStat / precinct context",
    },
    {
      label: "Google · crime near this address",
      href: `https://www.google.com/search?q=crime+near+${q}`,
      note: "News, blotter, and neighborhood write-ups",
    },
    {
      label: "FEMA flood map",
      href:
        lat != null && lon != null
          ? `https://msc.fema.gov/portal/search?AddressQuery=${q}`
          : `https://msc.fema.gov/portal/search?AddressQuery=${q}`,
      note: "Current NFHL panel — do not bid a floodway as a house",
    },
    {
      label: "County GIS",
      href: "https://bcgis.baltimorecountymd.gov/",
      note: "Zoning, overlays, flood, access",
    },
  ];
  return links;
}

export function summarizeCategories(rows: { category: string; n: number }[]) {
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    const key = row.category || "OTHER";
    byCategory[key] = (byCategory[key] ?? 0) + row.n;
    total += row.n;
  }
  return { total, byCategory, window: "2017–2020 (latest county Part I layer)" };
}

type JsonFetch = (url: string, init?: RequestInit) => Promise<unknown>;

async function defaultFetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const native = typeof window !== "undefined" ? window.certusNative?.fetchJson : undefined;
  if (native) {
    try {
      return await native(url);
    } catch {
      // Stale desktop bridge or browser with a leftover preload — use HTTPS fetch.
    }
  }
  const res = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function geocodeNominatim(query: string, fetchJson: JsonFetch): Promise<{ lat: number; lon: number; label: string } | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({ q: query, format: "json", limit: "1", countrycodes: "us" });
  const data = (await fetchJson(url, { headers: { Accept: "application/json", "User-Agent": UA } })) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  const hit = data[0];
  if (!hit) return null;
  return { lat: Number(hit.lat), lon: Number(hit.lon), label: hit.display_name };
}

export async function runAreaCheck(lien: Lien, fetchJson: JsonFetch = defaultFetchJson): Promise<AreaCheckResult> {
  const warnings: string[] = [];
  const query = locationQuery(lien);
  if (!query) {
    return {
      query: lien.address || lien.parcel,
      matchedAddress: null,
      lat: null,
      lon: null,
      floodZone: null,
      floodNote: null,
      specialFloodHazard: null,
      precinct: null,
      historicalPart1: null,
      links: safetyLinks(`${lien.parcel} Baltimore County MD`, null, null),
      warnings: ["No street number — cannot geocode. Open GIS with the district and account."],
    };
  }

  const geo = await geocodeNominatim(query, fetchJson);
  if (!geo) {
    return {
      query,
      matchedAddress: null,
      lat: null,
      lon: null,
      floodZone: null,
      floodNote: null,
      specialFloodHazard: null,
      precinct: null,
      historicalPart1: null,
      links: safetyLinks(query, null, null),
      warnings: ["Geocoder did not match this situs. Use the links and county GIS."],
    };
  }

  let floodZone = null as string | null;
  let floodNote = null as string | null;
  let specialFloodHazard = null as boolean | null;
  try {
    const floodUrl =
      "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?" +
      new URLSearchParams({
        geometry: `${geo.lon},${geo.lat}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF",
        returnGeometry: "false",
        f: "json",
      });
    const flood = (await fetchJson(floodUrl)) as {
      features?: { attributes?: { FLD_ZONE?: string; ZONE_SUBTY?: string; SFHA_TF?: string } }[];
    };
    const attrs = flood.features?.[0]?.attributes;
    const read = interpretFlood(attrs?.FLD_ZONE ?? null, attrs?.ZONE_SUBTY ?? null, attrs?.SFHA_TF ?? null);
    floodZone = read.floodZone;
    floodNote = read.floodNote;
    specialFloodHazard = read.specialFloodHazard;
  } catch {
    warnings.push("FEMA flood service did not respond. Open the flood-map link.");
  }

  let precinct: string | null = null;
  try {
    const precUrl =
      "https://bcgisdata.baltimorecountymd.gov/arcgis/rest/services/PublicSafety/PublicSafety/MapServer/0/query?" +
      new URLSearchParams({
        geometry: `${geo.lon},${geo.lat}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "NAME,PRECINCT",
        returnGeometry: "false",
        f: "json",
      });
    const prec = (await fetchJson(precUrl)) as {
      features?: { attributes?: { NAME?: string; PRECINCT?: string } }[];
    };
    const attrs = prec.features?.[0]?.attributes;
    if (attrs?.NAME) precinct = `${attrs.NAME}${attrs.PRECINCT ? ` (#${attrs.PRECINCT})` : ""}`;
  } catch {
    warnings.push("County precinct layer did not respond.");
  }

  let historicalPart1: AreaCheckResult["historicalPart1"] = null;
  try {
    const crimeUrl =
      "https://bcgisdata.baltimorecountymd.gov/arcgis/rest/services/PublicSafety/UCR_PART1_REV2_105/MapServer/0/query?" +
      new URLSearchParams({
        geometry: `${geo.lon},${geo.lat}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        distance: "0.5",
        units: "esriSRUnit_StatuteMile",
        where: "1=1",
        groupByFieldsForStatistics: "CATEGORY",
        outStatistics: JSON.stringify([
          { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "n" },
        ]),
        f: "json",
      });
    const crime = (await fetchJson(crimeUrl)) as {
      features?: { attributes?: { CATEGORY?: string; n?: number; N?: number } }[];
    };
    const rows = (crime.features ?? []).map((f) => ({
      category: f.attributes?.CATEGORY ?? "OTHER",
      n: Number(f.attributes?.n ?? f.attributes?.N ?? 0),
    }));
    historicalPart1 = summarizeCategories(rows);
    warnings.push(
      "County Part I points stop at 2020. Use CrimeMapping for anything current — this is not a live safety grade.",
    );
  } catch {
    warnings.push("County Part I layer did not respond. Use CrimeMapping for current incidents.");
  }

  return {
    query,
    matchedAddress: geo.label,
    lat: geo.lat,
    lon: geo.lon,
    floodZone,
    floodNote,
    specialFloodHazard,
    precinct,
    historicalPart1,
    links: safetyLinks(query, geo.lat, geo.lon),
    warnings,
  };
}
