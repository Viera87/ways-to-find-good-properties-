import { useMemo, useState } from "react";
import type { Assumptions, Lien } from "../types";
import { allocateCapital } from "../lib/optimize";
import { money, moneyExact, percent } from "../lib/format";

type Props = {
  liens: Lien[];
  assumptions: Assumptions;
  onOpen: (id: string) => void;
};

export function Allocator({ liens, assumptions, onOpen }: Props) {
  const [budget, setBudget] = useState(150000);
  const [maxLtv, setMaxLtv] = useState(assumptions.maxEffectiveLtv);
  const [requireSitus, setRequireSitus] = useState(true);
  const [excludeHard, setExcludeHard] = useState(true);
  const [maxPer, setMaxPer] = useState(15000);

  const result = useMemo(
    () =>
      allocateCapital(liens, assumptions, budget, {
        maxLtv,
        requireSitus,
        excludeHardFlags: excludeHard,
        maxPerCertificate: maxPer,
      }),
    [liens, assumptions, budget, maxLtv, requireSitus, excludeHard, maxPer],
  );

  const interest = result.picks.reduce((sum, row) => sum + row.uw.grossInterest, 0);
  const wLtv =
    result.deployed > 0
      ? result.picks.reduce((sum, row) => sum + row.uw.effectiveLtv * row.uw.auctionDayCapital, 0) / result.deployed
      : 0;

  return (
    <div className="allocator-grid">
      <aside className="detail-card">
        <p className="section-kicker">Capital allocator</p>
        <h2 className="address" style={{ fontSize: 24 }}>Fill a book, not a bid sheet</h2>
        <p className="owner">Greedy pack of auction-day cash (taxes due + HBP) ranked by CERTUS score per dollar, inside your LTV and collateral gates.</p>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label">Budget</label>
          <input type="number" min="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label className="field-label">Max effective LTV</label>
          <input type="number" step="0.01" value={maxLtv} onChange={(e) => setMaxLtv(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label className="field-label">Max auction cash / certificate</label>
          <input type="number" value={maxPer} onChange={(e) => setMaxPer(Number(e.target.value) || 0)} />
        </div>
        <label className="owner" style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input type="checkbox" checked={requireSitus} onChange={(e) => setRequireSitus(e.target.checked)} />
          Require a situs street number
        </label>
        <label className="owner" style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input type="checkbox" checked={excludeHard} onChange={(e) => setExcludeHard(e.target.checked)} />
          Exclude hard diligence flags
        </label>
        <div className="metrics">
          <div className="metric">
            <div className="field-label">Certificates</div>
            <div className="metric-value">{result.picks.length}</div>
          </div>
          <div className="metric">
            <div className="field-label">Deployed</div>
            <div className="metric-value">{money(result.deployed)}</div>
          </div>
          <div className="metric">
            <div className="field-label">Leftover</div>
            <div className="metric-value">{money(result.leftover)}</div>
          </div>
          <div className="metric">
            <div className="field-label">Modeled interest</div>
            <div className="metric-value">{money(interest)}</div>
          </div>
          <div className="metric">
            <div className="field-label">Capital-weighted LTV</div>
            <div className="metric-value">{percent(wLtv)}</div>
          </div>
        </div>
      </aside>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Address</th>
              <th>Verdict</th>
              <th>Score</th>
              <th>Auction cash</th>
              <th>Eff. LTV</th>
              <th>Net yield</th>
            </tr>
          </thead>
          <tbody>
            {result.picks.map((row, i) => (
              <tr key={row.lien.id} onClick={() => onOpen(row.lien.id)}>
                <td className="mono">{i + 1}</td>
                <td>
                  {row.lien.address}
                  <div className="owner">{row.lien.id}</div>
                </td>
                <td><span className={`verdict ${row.uw.verdict}`}>{row.uw.verdict}</span></td>
                <td className="mono">{row.uw.score}</td>
                <td className="mono">{moneyExact(row.uw.auctionDayCapital)}</td>
                <td className="mono">{percent(row.uw.effectiveLtv)}</td>
                <td className="mono">{percent(row.uw.netAnnualizedYield)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
