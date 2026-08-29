# CERTUS — Tax Lien Underwriting Desk

Institutional screen for the **Baltimore County, Maryland 2026 Collector’s tax sale** (advertising file, sale date **August 27, 2026**).

Tax certificates are non-standard, illiquid, and local. This desk ranks every advertised parcel with a four-phase protocol before capital is deployed:

1. **Asset utility** — zoning / GIS, brownfield, remnant and easement filters  
2. **Title & stays** — IRS / municipal super-liens, PACER bankruptcy, heirship  
3. **Effective LTV** — fully burdened cost versus a conservative as-is BPO (15–20% gate)  
4. **Net yield** — statutory 10% net of high-bid premium drag, subsequent taxes, and hold time  

The advertising list is bundled. Change the underwriting sliders and the entire 2,601-certificate book re-ranks in the browser.

## Run

```bash
npm install
npm run dev
```

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
