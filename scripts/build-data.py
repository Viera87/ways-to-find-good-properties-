#!/usr/bin/env python3
"""Rebuild src/data/liens.json from data/tax-advertising-file.tsv."""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "tax-advertising-file.tsv"
OUT = ROOT / "src" / "data" / "liens.json"


def money(value: str | None) -> float | None:
    if value is None:
        return None
    cleaned = str(value).replace("$", "").replace(",", "").replace('"', "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


ACRE_RE = re.compile(r"([\d.]+)\s*AC", re.I)
SQFT_RE = re.compile(r"([\d,]+)\s*SQ\s*FT", re.I)


def main() -> None:
    raw = SRC.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n").replace("\r", "\n")
    rows = []
    for record in csv.DictReader(raw.splitlines(), delimiter="\t"):
        district = (record.get("District") or "").strip()
        parcel = (record.get("Parcel") or "").strip()
        if not district.isdigit() or not parcel.isdigit():
            continue
        amount = money(record.get("Amount Due"))
        assessed = money(record.get("Assessed Value"))
        if amount is None or assessed is None:
            continue
        description = (record.get("Property Description") or "").strip()
        street_num_raw = (record.get("STREET NUMBER") or "").strip()
        street = (record.get("Address") or "").strip()
        street_type = (record.get("STREET TYPE") or "").strip()
        acres = None
        match = ACRE_RE.search(description)
        if match:
            acres = float(match.group(1))
        sqft = None
        match = SQFT_RE.search(description)
        if match:
            sqft = float(match.group(1).replace(",", ""))
        has_situs = street_num_raw not in {"", "0", "00000"}
        display_num = (
            str(int(street_num_raw)) if has_situs and street_num_raw.isdigit() else (street_num_raw if has_situs else "")
        )
        address = " ".join(part for part in [display_num, street, street_type] if part).strip()
        rows.append(
            {
                "id": f"{district}-{parcel}",
                "district": district,
                "parcel": parcel,
                "owner": (record.get("Owner") or "").strip(),
                "owner2": (record.get("Owner 2") or "").strip(),
                "description": description,
                "streetNumber": display_num,
                "street": street,
                "streetType": street_type,
                "address": address,
                "amountDue": round(amount, 2),
                "assessedValue": round(assessed, 2),
                "acres": acres,
                "sqft": sqft,
                "hasSitus": has_situs,
            }
        )
    OUT.write_text(json.dumps(rows, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(rows)} liens to {OUT}")


if __name__ == "__main__":
    main()
