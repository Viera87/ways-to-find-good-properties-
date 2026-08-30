# CERTUS — Tax Lien Underwriting Desk

Institutional screen for the **Baltimore County, Maryland 2026 Collector’s tax sale** (advertising file, sale date **August 27, 2026**).

Tax certificates are non-standard, illiquid, and local. This desk ranks every advertised parcel with a four-phase protocol before capital is deployed:

1. **Asset utility** — zoning / GIS, brownfield, remnant and easement filters  
2. **Title & stays** — IRS / municipal super-liens, PACER bankruptcy, heirship  
3. **Effective LTV** — fully burdened cost versus a conservative as-is BPO (15–20% gate)  
4. **Net yield** — statutory 10% net of high-bid premium drag, subsequent taxes, and hold time  

The advertising list is bundled. Change the underwriting sliders and the entire 2,601-certificate book re-ranks in the browser.

Sale years are separated. **2026** is the advertising list to underwrite. **2025** is the Baltimore County August 28 winner file (actual bids, high-bid premiums, bidder book). 2024 and 2023 stay empty until you import those lists.

The **Counties** tab lists all 24 Maryland collectors with that year’s DAT dates and official portals. There is no statewide registration and no public live-listing API — import a county advertising TSV/CSV when they publish it.

**Accumulate** is reserved for house-scale collateral ($75k–$750k assessed, face ≤ $15k, score ≥ 90). Office parks and jumbo tickets can still be opened via the commercial-takeout preset — they are not treated as the default “best buy.”

The pipeline can filter by **property type** (house, condo/unit, vacant, acreage, commercial, remnant, easement, exempt) from the advertising file. That is not an SDAT land-use code. **Check this location** on a certificate geocodes the situs, reads FEMA flood and the county precinct, and opens CrimeMapping — the county Part I GIS layer only runs 2017–2020 and is not a live safety grade.

**Pre-auction leftover screen (Phase 0):** hide names that die on the floor and come back as county OTC — no buildable situs, face above assessed value, entity strips, same-owner vacant clusters, face already above 15% of AV. Use the **Pre-auction book** chip when the advertising list posts. Do not reopen those names on the leftover PDF.

## Desktop app (click to open, self-hosted)

CERTUS is a local Electron app. The underwriting book lives on your machine. Nothing is uploaded.

### Fastest: double-click the launcher

1. Download or clone this folder onto the computer you will underwrite from.
2. Put a shortcut to the launcher on your desktop:
   - **Windows:** `Open-CERTUS.bat`
   - **macOS:** `Open-CERTUS.command` (first time: right-click → Open)
   - **Linux:** `Open-CERTUS.sh`
3. Double-click it. The first run installs Node packages, then a **CERTUS** window opens by itself. Later clicks just open the window.

You need [Node.js 20+](https://nodejs.org) installed once. After that it is a normal desktop app — no browser tab, no server to keep running.

### Packaged installer (no Node after you build it)

On the same kind of computer you will use (Windows for a `.exe`, Mac for a `.dmg`):

```bash
npm install
npm run desktop:dist
```

Copy the file from `release/` onto your desktop and open it:

- Windows: `CERTUS-portable.exe` (double-click, no install) or the NSIS setup
- macOS: `CERTUS-*.dmg`
- Linux: `CERTUS-*.AppImage` or `linux-unpacked/CERTUS`

GitHub Actions also builds those three packages on every push (`Desktop app` workflow). Download **CERTUS-windows**, **CERTUS-macos**, or **CERTUS-linux** from the Actions tab.

County GIS, PACER, and auction portals still need internet. The certificate book, scoring, and allocator do not.

Browser mode is still available: `npm run dev` or `npm run preview` after a build.

```bash
npm test
npm run build
```

## Sale mechanics encoded in the model

- Minimum bid is taxes due. Surplus bid stays on credit until foreclosure judgment.  
- **High-bid premium** = 20% × (bid − 40% of SDAT assessed value), due sale day, refunded **without interest**.  
- Redemption interest: **10%** (Baltimore County Code §11-2-402 as cited in the 2026 Collector’s Terms).  
- Owner-occupied 2026 certificates: first complaint day **May 27, 2027**.  
- Auction-day cash modeled as taxes due + HBP, not the full surplus bid.

This is an underwriting workbench, not a title report, Phase I ESA, or bid ticket.
