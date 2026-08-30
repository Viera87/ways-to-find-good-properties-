import { SALE } from "../lib/underwrite";

export function Methodology() {
  return (
    <article className="method">
      <p className="section-kicker">Underwriting protocol</p>
      <h2>Institutional screen for non-standard, illiquid tax certificates</h2>
      <p>
        Tax liens are local statutory instruments, not homogenized credit. CERTUS ranks each
        sale year on its own book. 2026 is the current advertising list; 2025 is the August 28
        Baltimore County winner file (bids, HBP, bidder numbers) so you can see what actually
        cleared before you bid this year.
      </p>

      <section className="detail-card">
        <h3>2026 sale mechanics (Baltimore County)</h3>
        <p>Sale {SALE.saleDate}. Registration {SALE.registrationOpen} through {SALE.registrationClose}. Bid window {SALE.bidWindow}. Listing sheets {SALE.listingSheetDate}.</p>
        <p>{SALE.statutoryRateNote}</p>
        <p>{SALE.hbpNote}</p>
        <p>{SALE.foreclosureNote}</p>
        <p>Auction-day ACH is taxes due plus any high-bid premium. Surplus bid remains on credit until a judgment foreclosing the right of redemption. HBP is refunded without interest on redemption or deed. The $100 bidder registration fee is a book-level cost, not allocated to each certificate.</p>
      </section>

      <section className="detail-card">
        <h3>Phase 0 — Kill leftovers before the sale</h3>
        <p>
          County OTC lists are the names the floor already refused. CERTUS flags them on the
          advertising file: no buildable situs (0, OFF, W/S), face greater than assessed value,
          entity strips with no house number, same-owner vacant clusters, and face already above
          15% of AV. Use the Pre-auction book chip. Do not reopen those names on the June leftover PDF.
        </p>
      </section>

      <section className="detail-card">
        <h3>Phase 1 — Asset-level underwriting</h3>
        <p>Municipal assessments are not BPOs. Confirm zoning and commercial utility in county GIS, screen EPA databases for historical dry cleaning, fueling, or chemical storage, and discard landlocked remnants, micro-lots, retention basins, and easement-killed parcels.</p>
      </section>

      <section className="detail-card">
        <h3>Phase 2 — Chain of title</h3>
        <p>Private mortgages are generally primed by the tax lien; IRS liens, municipal super-liens, demolition/weed bills, bankruptcy stays, and fractionated heirship are not. A Chapter 7/11/13 filing freezes the redemption clock and blocks quiet title.</p>
      </section>

      <section className="detail-card">
        <h3>Phase 3 — Quantitative valuation</h3>
        <pre className="formula">{`Effective LTV = (Face + Overbid + Subsequent taxes + Legal/FC + HBP) / Conservative as-is BPO`}</pre>
        <p>Target an absolute maximum of 15–20% on a haircut BPO, not raw SDAT value. Default haircut is 35% off assessment to proxy as-is broker opinion during the statutory hold. A thin tax bill on a $7m office building is not a free lunch — commercial-scale assessments are flagged and kept out of the Accumulate book until you opt into a commercial takeout screen.</p>
      </section>

      <section className="detail-card">
        <h3>Phase 4 — Yield after friction</h3>
        <p>The 10% County redemption rate is gross. Net annualized yield deducts unrecoverable fees and the time value of zero-interest HBP and subsequent taxes paid to keep the certificate from being primed by a newer lien. Owner-occupied 2026 certificates generally cannot be taken to complaint before May 27, 2027.</p>
      </section>

      <section className="detail-card">
        <h3>Statewide calendar — not a live feed</h3>
        <p>
          Maryland’s 24 collectors run sales between March and October. DAT publishes confirmed dates.
          There is no statewide bidder registration and no public API for live listings. Register on each
          county portal (typically $100–$150, W-9, ACH, collector terms). Unsold names often move OTC at
          the finance office after the auction. Import that county’s advertising file on the Counties tab
          to run the same four-phase screen.
        </p>
      </section>

      <section className="detail-card">
        <h3>What this desk does not do</h3>
        <p>It does not replace a title search, Phase I ESA, PACER login, or counsel. Automated flags are heuristics from the advertising file — owner language, lot size, situs, and LTV — so a clean score is an invitation to underwrite, not a bid ticket.</p>
      </section>
    </article>
  );
}
