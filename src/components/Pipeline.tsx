import { useMemo, useState } from "react";
import type { Assumptions, Lien, Underwriting, Verdict } from "../types";
import { acresLabel, money, moneyExact, percent } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { classifyProperty, PROPERTY_KIND_LABEL, PROPERTY_KINDS, type PropertyKind } from "../lib/propertyType";
import { Hint } from "./Hint";
import { LienDetail } from "./LienDetail";
import { TypeChip } from "./TypeChip";
import { VerdictChip } from "./VerdictChip";

export type Ranked = { lien: Lien; uw: Underwriting };

type Props = {
  rows: Ranked[];
  assumptions: Assumptions;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const PAGE = 40;

export function Pipeline({ rows, assumptions, selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("all");
  const [verdict, setVerdict] = useState<"all" | Verdict>("all");
  const hasResults = rows.some((r) => r.lien.saleResult);
  const [situs, setSitus] = useState<"all" | "situs" | "vacant">("all");
  const [scale, setScale] = useState<"all" | "house" | "commercial">(hasResults ? "all" : "house");
  const [kind, setKind] = useState<"all" | PropertyKind>("all");
  const [leftover, setLeftover] = useState<"hide" | "all" | "only">(hasResults ? "all" : "hide");
  const [maxLtv, setMaxLtv] = useState(0.2);
  const [maxFace, setMaxFace] = useState(hasResults ? 500000 : 25000);
  const [page, setPage] = useState(0);

  const districts = useMemo(
    () => Array.from(new Set(rows.map((r) => r.lien.district))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter(({ lien, uw }) => {
      if (district !== "all" && lien.district !== district) return false;
      if (verdict !== "all" && uw.verdict !== verdict) return false;
      if (situs === "situs" && !lien.hasSitus) return false;
      if (situs === "vacant" && lien.hasSitus) return false;
      if (scale === "house" && (lien.assessedValue < 75000 || lien.assessedValue > 750000)) return false;
      if (scale === "commercial" && lien.assessedValue < 750000) return false;
      if (kind !== "all" && classifyProperty(lien).kind !== kind) return false;
      if (leftover === "hide" && uw.leftoverRisk) return false;
      if (leftover === "only" && !uw.leftoverRisk) return false;
      if (uw.effectiveLtv > maxLtv) return false;
      if (lien.amountDue > maxFace) return false;
      if (query) {
        const blob = `${lien.address} ${lien.owner} ${lien.owner2} ${lien.parcel} ${lien.description} ${lien.saleResult?.bidderName ?? ""} ${lien.saleResult?.bidderId ?? ""}`.toLowerCase();
        if (!blob.includes(query)) return false;
      }
      return true;
    });
  }, [rows, q, district, verdict, situs, scale, kind, leftover, maxLtv, maxFace]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const selected = rows.find((r) => r.lien.id === selectedId) ?? slice[0] ?? filtered[0];

  const exportCsv = () => {
    const header = [
      "id",
      "address",
      "owner",
      "amountDue",
      "assessedValue",
      "effectiveLtv",
      "netYield",
      "score",
      "verdict",
      "propertyType",
      "leftoverRisk",
    ];
    const lines = [
      header.join(","),
      ...filtered.map(({ lien, uw }) =>
        [
          lien.id,
          `"${lien.address.replaceAll('"', '""')}"`,
          `"${lien.owner.replaceAll('"', '""')}"`,
          lien.amountDue,
          lien.assessedValue,
          uw.effectiveLtv.toFixed(4),
          uw.netAnnualizedYield.toFixed(4),
          uw.score,
          uw.verdict,
          classifyProperty(lien).kind,
          uw.leftoverRisk ? "yes" : "no",
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certus-shortlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="layout-split">
      <div>
        <section className="filters panel">
          <div className="field">
            <label className="field-label">Search</label>
            <input
              value={q}
              placeholder="Address, owner, parcel…"
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="field">
            <label className="field-label">District</label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">
              <Hint entry={TERM_HELP.verdict}>Verdict</Hint>
            </label>
            <select
              value={verdict}
              onChange={(e) => {
                setVerdict(e.target.value as "all" | Verdict);
                setPage(0);
              }}
            >
              <option value="all">All</option>
              <option value="ACCUMULATE">Accumulate</option>
              <option value="UNDERWRITE">Underwrite</option>
              <option value="MONITOR">Monitor</option>
              <option value="DECLINE">Decline</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Situs</label>
            <select
              value={situs}
              onChange={(e) => {
                setSitus(e.target.value as typeof situs);
                setPage(0);
              }}
            >
              <option value="all">All</option>
              <option value="situs">Has street number</option>
              <option value="vacant">No street number</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">
              <Hint entry={TERM_HELP.propertyType}>Property type</Hint>
            </label>
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as typeof kind);
                setPage(0);
              }}
            >
              <option value="all">All types</option>
              {PROPERTY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {PROPERTY_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Collateral scale</label>
            <select
              value={scale}
              onChange={(e) => {
                setScale(e.target.value as typeof scale);
                setPage(0);
              }}
            >
              <option value="house">House-scale $75k–$750k</option>
              <option value="commercial">Commercial / $750k+</option>
              <option value="all">All assessments</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">
              <Hint entry={TERM_HELP.leftover}>Leftover / OTC</Hint>
            </label>
            <select
              value={leftover}
              onChange={(e) => {
                setLeftover(e.target.value as typeof leftover);
                setPage(0);
              }}
            >
              <option value="hide">Hide leftover risk</option>
              <option value="all">Show all</option>
              <option value="only">Leftover risk only</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Max eff. LTV</label>
            <input
              type="number"
              step="0.01"
              value={maxLtv}
              onChange={(e) => {
                setMaxLtv(Number(e.target.value) || 0);
                setPage(0);
              }}
            />
          </div>
          <div className="field">
            <label className="field-label">Max face $</label>
            <input
              type="number"
              value={maxFace}
              onChange={(e) => {
                setMaxFace(Number(e.target.value) || 0);
                setPage(0);
              }}
            />
          </div>
        </section>

        <div className="table-tools" style={{ margin: "12px 0" }}>
          <span className="owner">{filtered.length.toLocaleString()} certificates after gates</span>
          <button className="chip" onClick={() => { setVerdict("all"); setSitus("situs"); setScale("house"); setKind("house"); setLeftover("hide"); setMaxLtv(0.15); setMaxFace(15000); setPage(0); }}>
            Pre-auction book
          </button>
          <button className="chip" onClick={() => { setVerdict("ACCUMULATE"); setSitus("situs"); setScale("house"); setKind("all"); setLeftover("hide"); setMaxLtv(0.15); setMaxFace(15000); setPage(0); }}>
            Conservative book
          </button>
          <button className="chip" onClick={() => { setVerdict("all"); setSitus("situs"); setScale("house"); setKind("all"); setLeftover("hide"); setMaxLtv(0.2); setMaxFace(25000); setPage(0); }}>
            Institutional 20%
          </button>
          <button className="chip" onClick={() => { setVerdict("all"); setSitus("all"); setScale("commercial"); setKind("all"); setLeftover("all"); setMaxLtv(0.2); setMaxFace(500000); setPage(0); }}>
            Commercial takeout
          </button>
          <button className="chip" onClick={() => { setVerdict("all"); setSitus("all"); setScale("all"); setKind("all"); setLeftover("only"); setMaxLtv(1); setMaxFace(5_000_000); setPage(0); }}>
            Show leftovers
          </button>
          <button className="btn" onClick={exportCsv}>Export CSV</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><Hint entry={TERM_HELP.score}>Score</Hint></th>
                <th><Hint entry={TERM_HELP.verdict}>Verdict</Hint></th>
                <th>Address</th>
                <th><Hint entry={TERM_HELP.propertyType}>Type</Hint></th>
                <th><Hint entry={TERM_HELP.face}>Face</Hint></th>
                <th><Hint entry={TERM_HELP.assessed}>Assessed</Hint></th>
                <th><Hint entry={TERM_HELP.ltv}>Eff. LTV</Hint></th>
                <th><Hint entry={TERM_HELP.yield}>Net yield</Hint></th>
                {hasResults ? <th><Hint entry={TERM_HELP.winningBid}>Winning bid</Hint></th> : null}
                {hasResults ? <th><Hint entry={TERM_HELP.hbp}>HBP</Hint></th> : null}
                <th><Hint entry={TERM_HELP.flags}>Flags</Hint></th>
              </tr>
            </thead>
            <tbody>
              {slice.map(({ lien, uw }) => (
                <tr
                  key={lien.id}
                  className={selected?.lien.id === lien.id ? "selected" : ""}
                  onClick={() => onSelect(lien.id)}
                >
                  <td className="mono">{uw.score}</td>
                  <td>
                    <VerdictChip verdict={uw.verdict} />
                    {uw.leftoverRisk ? (
                      <div className="owner leftover-tag">Leftover / OTC</div>
                    ) : null}
                  </td>
                  <td>
                    {lien.address || "—"}
                    <div className="owner">{lien.id} · {acresLabel(lien.acres, lien.sqft)}</div>
                  </td>
                  <td><TypeChip kind={classifyProperty(lien).kind} /></td>
                  <td className="mono">{moneyExact(lien.amountDue)}</td>
                  <td className="mono">{money(lien.assessedValue)}</td>
                  <td className="mono">{percent(uw.effectiveLtv)}</td>
                  <td className="mono">{percent(uw.netAnnualizedYield)}</td>
                  {hasResults ? (
                    <td className="mono">{lien.saleResult ? money(lien.saleResult.winningBid) : "—"}</td>
                  ) : null}
                  {hasResults ? (
                    <td className="mono">{lien.saleResult ? money(lien.saleResult.hbp) : "—"}</td>
                  ) : null}
                  <td>{uw.flags.filter((f) => f.severity !== "info").length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <button className="chip" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </button>
          <span>
            Page {safePage + 1} / {pageCount}
          </span>
          <button
            className="chip"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {selected ? <LienDetail lien={selected.lien} uw={selected.uw} assumptions={assumptions} /> : null}
    </div>
  );
}
