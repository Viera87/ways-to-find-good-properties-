import { useMemo, useRef, useState } from "react";
import type { Lien } from "../types";
import { DAT_OMBUDSMAN, DAT_SCHEDULE, MARYLAND_SALES, saleStatus } from "../lib/counties";
import { parseAdvertisingFile } from "../lib/parseAdvertising";

type Props = {
  activeCounty: string;
  lienCount: number;
  onImport: (countyId: string, countyName: string, liens: Lien[], fileName: string) => void;
};

const STATUS_LABEL = {
  held: "2026 sale held — leftover / OTC at the finance office",
  window: "Inside the 45-day registration / sale window",
  upcoming: "Upcoming — watch DAT for the confirmed date",
};

export function Counties({ activeCounty, lienCount, onImport }: Props) {
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importCounty, setImportCounty] = useState(activeCounty);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MARYLAND_SALES.filter((c) => {
      if (!query) return true;
      return `${c.name} ${c.portalName} ${c.typicalWindow}`.toLowerCase().includes(query);
    }).sort((a, b) => a.datSort.localeCompare(b.datSort));
  }, [q]);

  const loadFile = async (file: File) => {
    setError(null);
    const text = await file.text();
    const county = MARYLAND_SALES.find((c) => c.id === importCounty) ?? MARYLAND_SALES[0];
    const liens = parseAdvertisingFile(text, county.id);
    if (liens.length === 0) {
      setError("No parcel rows found. Use a tab- or comma-separated advertising list with Amount Due and Assessed Value columns.");
      return;
    }
    onImport(county.id, county.name, liens, file.name);
  };

  return (
    <div className="counties">
      <section className="detail-card">
        <p className="section-kicker">Maryland · 24 collectors</p>
        <h2 className="address" style={{ fontSize: 26 }}>There is no statewide feed — and no statewide registration</h2>
        <p className="owner">
          Auction vendors (RealAuction, county portals) do not publish a public listing API. CERTUS cannot
          pull live bid sheets from behind those logins. What it can do: track every collector on the DAT
          calendar, open the official portal, and underwrite an advertising file the moment you download it.
        </p>
        <p className="owner">
          <strong>Do you have to apply in each county?</strong> Yes. Maryland has no umbrella bidder
          registration. A RealAuction master login is not enough — you still register for that county’s
          sale, pay that county’s $100–$150 fee (and any deposit), submit a W-9, set ACH, and sign that
          collector’s terms. Windows typically open 30–45 days before the sale and close 1–2 weeks prior.
          Miss one deadline and a neighboring county’s approval does not carry over.
        </p>
        <p className="owner">
          Unsold certificates often sit <strong>over-the-counter</strong> at the finance office after the
          annual auction. DAT keeps the official date list as collectors confirm:
          {" "}
          <a href={DAT_SCHEDULE} target="_blank" rel="noreferrer">2026 tax sale schedule</a>
          {" · "}
          <a href={DAT_OMBUDSMAN} target="_blank" rel="noreferrer">Tax Sale Ombudsman</a>
        </p>
      </section>

      <section className="detail-card">
        <p className="section-kicker">Load a county advertising list</p>
        <p className="owner">
          Baltimore County’s 2026 advertising file is already on the Pipeline ({lienCount.toLocaleString()} names
          {activeCounty ? ` · ${activeCounty}` : ""}). For any other collector, download their published list
          (or the registered-bidder spreadsheet) and drop it here.
        </p>
        <div className="import-row">
          <select value={importCounty} onChange={(e) => setImportCounty(e.target.value)}>
            {MARYLAND_SALES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="btn primary" type="button" onClick={() => fileRef.current?.click()}>
            Import TSV / CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.tsv,.csv,.tab"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void loadFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {error ? <p className="import-error">{error}</p> : null}
      </section>

      <div className="table-tools">
        <input
          value={q}
          placeholder="Filter counties…"
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <span className="owner">{rows.length} jurisdictions · DAT dates are the official tracker</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>County</th>
              <th>DAT 2026 date</th>
              <th>Typical window</th>
              <th>Portal</th>
              <th>Register?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const status = saleStatus(c.datSort);
              return (
                <tr key={c.id}>
                  <td>
                    {c.name}
                    <div className="owner">{c.vendor} · {c.feeNote}</div>
                  </td>
                  <td className="mono">{c.datDate2026}</td>
                  <td>{c.typicalWindow}</td>
                  <td>
                    <a href={c.portalUrl} target="_blank" rel="noreferrer">{c.portalName}</a>
                  </td>
                  <td>Separate application</td>
                  <td><span className={`status-pill ${status}`}>{STATUS_LABEL[status]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
