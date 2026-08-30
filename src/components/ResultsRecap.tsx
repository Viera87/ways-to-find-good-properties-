import type { Lien } from "../types";
import recap from "../data/bc-2025-bidders.json";
import { money, percent } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

type Props = { liens: Lien[] };

export function ResultsRecap({ liens }: Props) {
  const withResult = liens.filter((l) => l.saleResult);
  if (withResult.length === 0) return null;

  const byBidder = new Map<string, { name: string; count: number; face: number; hbp: number; cash: number }>();
  for (const lien of withResult) {
    const r = lien.saleResult!;
    const cur = byBidder.get(r.bidderId) ?? {
      name: r.bidderName,
      count: 0,
      face: 0,
      hbp: 0,
      cash: 0,
    };
    cur.count += 1;
    cur.face += lien.amountDue;
    cur.hbp += r.hbp;
    cur.cash += r.totalDue;
    byBidder.set(r.bidderId, cur);
  }
  const leaders = [...byBidder.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const medianBidToValue = [...withResult]
    .map((l) => l.saleResult!.bidToValue)
    .sort((a, b) => a - b)[Math.floor(withResult.length / 2)];

  return (
    <section className="detail-card">
      <p className="section-kicker">Baltimore County · August 28, 2025 results</p>
      <h2 className="address" style={{ fontSize: 24 }}>What actually cleared last year</h2>
      <p className="owner">
        County winner summary (published {recap.published}): 1,202 certificates, $7.87M face, $229.4M in winning
        bids, $15.37M HBP, $23.24M sale-day cash (including 6 struck to the collector). CERTUS parsed{" "}
        {withResult.length.toLocaleString()} detail rows for underwriting. Bidder names are paired from the
        winner sheet in bidder-number order.
      </p>
      <div className="metrics">
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.winningBid}>Median bid / AV</Hint></div>
          <div className="metric-value">{percent(medianBidToValue)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.hbp}>HBP posted (parsed)</Hint></div>
          <div className="metric-value">{money(withResult.reduce((s, l) => s + l.saleResult!.hbp, 0))}</div>
        </div>
        <div className="metric">
          <div className="field-label">Winning bidders</div>
          <div className="metric-value">{byBidder.size}</div>
        </div>
        <div className="metric">
          <div className="field-label">Struck to county</div>
          <div className="metric-value">{byBidder.get("9999")?.count ?? 0}</div>
        </div>
      </div>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Bidder</th>
              <th>Certificates</th>
              <th>Face won</th>
              <th>HBP</th>
              <th>Sale-day cash</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className="mono">{row.count}</td>
                <td className="mono">{money(row.face)}</td>
                <td className="mono">{money(row.hbp)}</td>
                <td className="mono">{money(row.cash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
