import { useMemo, useState } from "react";
import type { Assumptions, Lien } from "../types";
import { allocateCapital } from "../lib/optimize";
import { money, moneyExact, percent } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { subsequentTaxPlan } from "../lib/subTaxes";
import { GoldenRule } from "./GoldenRule";
import { Hint } from "./Hint";
import { VerdictChip } from "./VerdictChip";

type Props = {
  liens: Lien[];
  assumptions: Assumptions;
  onOpen: (id: string) => void;
};

export function Allocator({ liens, assumptions, onOpen }: Props) {
  const [deskCash, setDeskCash] = useState(150000);
  const [maxLtv, setMaxLtv] = useState(assumptions.maxEffectiveLtv);
  const [requireSitus, setRequireSitus] = useState(true);
  const [excludeHard, setExcludeHard] = useState(true);
  const [requireReserve, setRequireReserve] = useState(true);
  const [maxPer, setMaxPer] = useState(15000);

  const result = useMemo(
    () =>
      allocateCapital(liens, assumptions, deskCash, {
        maxLtv,
        requireSitus,
        excludeHardFlags: excludeHard,
        maxPerCertificate: maxPer,
        requireSubTaxReserve: requireReserve,
      }),
    [liens, assumptions, deskCash, maxLtv, requireSitus, excludeHard, maxPer, requireReserve],
  );

  const interest = result.picks.reduce((sum, row) => sum + row.uw.grossInterest, 0);
  const reserved = requireReserve
    ? result.reserved
    : result.picks.reduce((sum, row) => sum + row.subTaxReserve, 0);
  const wLtv =
    result.deployed > 0
      ? result.picks.reduce((sum, row) => sum + row.uw.effectiveLtv * row.uw.auctionDayCapital, 0) / result.deployed
      : 0;
  const bookPlan = subsequentTaxPlan(
    {
      amountDue: result.picks.reduce((sum, row) => sum + row.lien.amountDue, 0),
      assessedValue: result.picks.reduce((sum, row) => sum + row.lien.assessedValue, 0),
    },
    assumptions,
    result.deployed,
  );
  const ruleReserve = reserved || bookPlan.reserve;

  return (
    <div className="allocator-grid">
      <aside className="detail-card">
        <p className="section-kicker">Capital allocator</p>
        <h2 className="address" style={{ fontSize: 24 }}>Fill a book, not a bid sheet</h2>
        <p className="owner">
          Pack auction-day ACH (taxes due + HBP) by CERTUS score per dollar. The golden rule holds
          the next tax levy out of desk cash so a new certificate cannot prime the book.
        </p>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label"><Hint entry={TERM_HELP.deskCash}>Desk cash</Hint></label>
          <input type="number" min="1000" value={deskCash} onChange={(e) => setDeskCash(Number(e.target.value) || 0)} />
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
        <label className="owner" style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input type="checkbox" checked={requireReserve} onChange={(e) => setRequireReserve(e.target.checked)} />
          Hold subsequent-tax reserve (golden rule)
        </label>
        <div className="metrics">
          <div className="metric">
            <div className="field-label">Certificates</div>
            <div className="metric-value">{result.picks.length}</div>
          </div>
          <div className="metric">
            <div className="field-label">Auction ACH</div>
            <div className="metric-value">{money(result.deployed)}</div>
          </div>
          <div className="metric">
            <div className="field-label"><Hint entry={TERM_HELP.subTaxReserve}>Sub-tax reserve</Hint></div>
            <div className="metric-value">{money(ruleReserve)}</div>
          </div>
          <div className="metric">
            <div className="field-label">Free cash</div>
            <div className="metric-value">{money(requireReserve ? result.leftover : Math.max(0, deskCash - result.deployed - reserved))}</div>
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
      <div>
        <GoldenRule
          assumptions={assumptions}
          auctionDay={result.deployed}
          reserve={ruleReserve}
          annualBill={bookPlan.annualBill}
          firstBillMonth={bookPlan.firstBillMonth}
          billsDuringHold={bookPlan.billsDuringHold}
          deskCash={deskCash}
        />
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th><Hint entry={TERM_HELP.verdict}>Verdict</Hint></th>
                <th><Hint entry={TERM_HELP.score}>Score</Hint></th>
                <th><Hint entry={TERM_HELP.auctionCash}>Auction cash</Hint></th>
                <th><Hint entry={TERM_HELP.subTaxReserve}>Sub-tax reserve</Hint></th>
                <th><Hint entry={TERM_HELP.ltv}>Eff. LTV</Hint></th>
                <th><Hint entry={TERM_HELP.yield}>Net yield</Hint></th>
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
                  <td><VerdictChip verdict={row.uw.verdict} /></td>
                  <td className="mono">{row.uw.score}</td>
                  <td className="mono">{moneyExact(row.uw.auctionDayCapital)}</td>
                  <td className="mono">{moneyExact(row.subTaxReserve)}</td>
                  <td className="mono">{percent(row.uw.effectiveLtv)}</td>
                  <td className="mono">{percent(row.uw.netAnnualizedYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
