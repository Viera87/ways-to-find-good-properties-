import { useEffect, useState } from "react";
import type { Lien } from "../types";
import { runAreaCheck, type AreaCheckResult } from "../lib/areaCheck";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

type Props = { lien: Lien };

export function AreaCheck({ lien }: Props) {
  const [result, setResult] = useState<AreaCheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
    setBusy(false);
  }, [lien.id]);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await runAreaCheck(lien));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="phase">
      <h3>
        <Hint entry={TERM_HELP.areaCheck}>Location check</Hint>
      </h3>
      <p className="owner">
        One click geocodes the situs, reads FEMA flood and the county precinct, and opens current crime
        maps. The county Part I GIS layer ends in 2020 — that count is history, not a live safety grade.
      </p>
      <button className="btn primary" type="button" disabled={busy} onClick={() => void run()}>
        {busy ? "Checking area…" : "Check this location"}
      </button>
      {error ? <p className="import-error">{error}</p> : null}
      {result ? <AreaCheckBody result={result} /> : null}
    </section>
  );
}

function AreaCheckBody({ result }: { result: AreaCheckResult }) {
  const cats = result.historicalPart1
    ? Object.entries(result.historicalPart1.byCategory).sort((a, b) => b[1] - a[1])
    : [];
  return (
    <div style={{ marginTop: 12 }}>
      {result.matchedAddress ? <p className="owner">Matched {result.matchedAddress}</p> : null}
      <div className="metrics">
        <div className="metric">
          <div className="field-label">FEMA flood zone</div>
          <div className="metric-value">{result.floodZone ?? "—"}</div>
        </div>
        <div className="metric">
          <div className="field-label">SFHA</div>
          <div className="metric-value">
            {result.specialFloodHazard == null ? "—" : result.specialFloodHazard ? "Yes" : "No"}
          </div>
        </div>
        <div className="metric">
          <div className="field-label">Police precinct</div>
          <div className="metric-value" style={{ fontSize: 16 }}>{result.precinct ?? "—"}</div>
        </div>
        <div className="metric">
          <div className="field-label">Part I ≤ 0.5 mi</div>
          <div className="metric-value">{result.historicalPart1 ? result.historicalPart1.total : "—"}</div>
        </div>
      </div>
      {result.floodNote ? <p className="owner">{result.floodNote}</p> : null}
      {result.historicalPart1 ? (
        <p className="owner">
          {result.historicalPart1.window}
          {cats.length ? ` · ${cats.map(([k, n]) => `${k} ${n}`).join(" · ")}` : ""}
        </p>
      ) : null}
      {result.warnings.map((w) => (
        <p key={w} className="owner">{w}</p>
      ))}
      <div className="links" style={{ marginTop: 8 }}>
        {result.links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            <span>{link.label}</span>
            <small>{link.note}</small>
          </a>
        ))}
      </div>
    </div>
  );
}
