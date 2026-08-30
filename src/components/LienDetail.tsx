import type { Assumptions, Lien, Underwriting } from "../types";
import { AreaCheck } from "./AreaCheck";
import { TypeChip } from "./TypeChip";
import { diligenceLinks } from "../lib/diligence";
import { classifyProperty } from "../lib/propertyType";
import { acresLabel, moneyExact, percentExact } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";
import { VerdictChip } from "./VerdictChip";
import { useEffect, useMemo, useState } from "react";

const CHECKS = [
  { id: "gis", phase: "1", label: "Zoning / GIS confirms intended commercial or residential use and access" },
  { id: "env", phase: "1", label: "EPA ECHO / NEPAssist clear of dry cleaner, fueling, or chemical storage" },
  { id: "topo", phase: "1", label: "Not landlocked, remnant, drainage basin, or easement-burdened" },
  { id: "irs", phase: "2", label: "No IRS / federal super-priority or surviving municipal demolition lien" },
  { id: "pacer", phase: "2", label: "PACER clear — no Ch. 7 / 11 / 13 stay on any titleholder" },
  { id: "heir", phase: "2", label: "Vesting is not fractionated heirship or open probate" },
  { id: "ltv", phase: "3", label: "Fully burdened LTV still ≤ 15–20% on a conservative as-is BPO" },
  { id: "hbp", phase: "4", label: "High-bid premium and idle capital still leave an acceptable net yield" },
];

type Props = {
  lien: Lien;
  uw: Underwriting;
  assumptions: Assumptions;
};

export function LienDetail({ lien, uw, assumptions }: Props) {
  const storageKey = `certus-checks-${lien.id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const links = useMemo(() => diligenceLinks(lien), [lien]);
  const property = useMemo(() => classifyProperty(lien), [lien]);
  const done = CHECKS.filter((c) => checked[c.id]).length;

  return (
    <aside className="detail-card">
      <div className="detail-head">
        <div>
          <div className="section-kicker">Dist {lien.district} · {lien.parcel}</div>
          <h2 className="address">{lien.address || "Unidentified situs"}</h2>
          <div className="owner">{lien.owner}{lien.owner2 ? `; ${lien.owner2}` : ""}</div>
          <div className="owner">{lien.description || "No legal description on advertising list"} · {acresLabel(lien.acres, lien.sqft)}</div>
        </div>
        <div className="score-orb">
          <div>
            <strong>{uw.score}</strong>
            <div className="section-kicker"><Hint entry={TERM_HELP.score}>Score</Hint></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <VerdictChip verdict={uw.verdict} />
        <TypeChip kind={property.kind} />
      </div>
      <p className="owner" style={{ marginTop: 8 }}>{property.reason}</p>
      {uw.leftoverRisk ? (
        <section className="leftover-banner">
          <h3><Hint entry={TERM_HELP.leftover}>Pre-auction leftover screen — do not research</Hint></h3>
          <p className="owner">
            This name matches the inventory that dies on the floor and returns as county OTC.
            Same Phase 0 gates as a bid: no GIS/PACER time until the leftover flags are cleared
            (they almost never are).
          </p>
          <div className="check-list">
            {uw.flags.filter((f) => f.id.startsWith("leftover-")).map((flag) => (
              <div key={flag.id}>
                <span className={`flag ${flag.severity}`}>P{flag.phase} {flag.severity}</span>{" "}
                <strong>{flag.title}</strong>
                <div className="owner">{flag.detail}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {lien.saleResult ? (
        <section className="phase" style={{ marginTop: 12 }}>
          <h3>2025 auction result</h3>
          <p className="owner">
            {lien.saleResult.bidderName} (#{lien.saleResult.bidderId})
            {lien.saleResult.bidderAddress ? ` · ${lien.saleResult.bidderAddress}` : ""}
          </p>
          <div className="metrics">
            <div className="metric">
              <div className="field-label"><Hint entry={TERM_HELP.winningBid}>Winning bid</Hint></div>
              <div className="metric-value">{moneyExact(lien.saleResult.winningBid)}</div>
            </div>
            <div className="metric">
              <div className="field-label"><Hint entry={TERM_HELP.hbp}>HBP actually posted</Hint></div>
              <div className="metric-value">{moneyExact(lien.saleResult.hbp)}</div>
            </div>
            <div className="metric">
              <div className="field-label">Sale-day cash</div>
              <div className="metric-value">{moneyExact(lien.saleResult.totalDue)}</div>
            </div>
            <div className="metric">
              <div className="field-label">Bid / assessed</div>
              <div className="metric-value">{percentExact(lien.saleResult.bidToValue)}</div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="metrics">
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.face}>Face / taxes due</Hint></div>
          <div className="metric-value">{moneyExact(lien.amountDue)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.assessed}>SDAT assessed</Hint></div>
          <div className="metric-value">{moneyExact(lien.assessedValue)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.bpo}>Conservative BPO</Hint></div>
          <div className="metric-value">{moneyExact(uw.conservativeBpo)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.ltv}>Effective LTV</Hint></div>
          <div className="metric-value">{percentExact(uw.effectiveLtv)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.auctionCash}>Auction-day cash</Hint></div>
          <div className="metric-value">{moneyExact(uw.auctionDayCapital)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.hbp}>High-bid premium</Hint></div>
          <div className="metric-value">{moneyExact(uw.highBidPremium)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.yield}>Net annualized yield</Hint></div>
          <div className="metric-value">{percentExact(uw.netAnnualizedYield)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.hbp}>HBP drag</Hint></div>
          <div className="metric-value">{uw.hbpDragBps.toFixed(0)} bps</div>
        </div>
      </div>

      <pre className="formula">{`Effective LTV = (Face ${moneyExact(lien.amountDue)} + Overbid ${moneyExact(assumptions.overbid)} + Sub-taxes ${moneyExact(uw.subsequentTaxes)} + Legal ${moneyExact(assumptions.legalOverhead)} + HBP ${moneyExact(uw.highBidPremium)}) / BPO ${moneyExact(uw.conservativeBpo)}`}</pre>

      <AreaCheck lien={lien} />

      <section className="phase">
        <h3>Phase 1 — Asset utility</h3>
        <p className="owner">Do not underwrite the assessment. Confirm zoning, ingress, and brownfield status before capital is committed.</p>
      </section>
      <section className="phase">
        <h3>Phase 2 — Title & stays</h3>
        <p className="owner">IRS 120-day post-foreclosure redemption, municipal super-liens, PACER stays, and heirship can wipe the equity pad.</p>
      </section>
      <section className="phase">
        <h3>Phase 3 — Capital risk</h3>
        <p className="owner">Score equity {uw.scoreBreakdown.equity}/40 · yield {uw.scoreBreakdown.yield}/22 · collateral {uw.scoreBreakdown.collateral}/22 · title {uw.scoreBreakdown.title}/16</p>
      </section>
      <section className="phase">
        <h3>Phase 4 — Redemption yield</h3>
        <p className="owner">
          Modeled hold {assumptions.holdMonths} months at {(assumptions.statutoryRate * 100).toFixed(0)}%.
          Gross interest {moneyExact(uw.grossInterest)}. Net profit {moneyExact(uw.netProfit)}.
          Advertised 10% is a gross figure — HBP and idle sub-tax capital reduce realized IRR.
        </p>
      </section>

      <section className="phase">
        <h3>Flags</h3>
        {uw.flags.length === 0 ? <p className="owner">No automated flags.</p> : null}
        <div className="check-list">
          {uw.flags.map((flag) => (
            <div key={flag.id}>
              <Hint entry={TERM_HELP[flag.severity]}>
                <span className={`flag ${flag.severity}`}>P{flag.phase} {flag.severity}</span>
              </Hint>{" "}
              <strong>{flag.title}</strong>
              <div className="owner">{flag.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="phase">
        <h3>Diligence desk ({done}/{CHECKS.length})</h3>
        <div className="check-list">
          {CHECKS.map((item) => (
            <label key={item.id}>
              <input type="checkbox" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} />
              <span>P{item.phase}. {item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="phase">
        <h3>Open source systems</h3>
        <div className="links">
          {links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              <span>{link.label}</span>
              <small>{link.note}</small>
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}
