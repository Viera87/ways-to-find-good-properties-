import { useEffect, useMemo, useRef, useState } from "react";
import type { Lien, LienBook } from "../types";
import {
  DAT_OMBUDSMAN,
  DAT_SCHEDULE,
  MARYLAND_SALES,
  type SaleYear,
  saleStatus,
  statusLabel,
} from "../lib/counties";
import { booksForYear, shortCounty } from "../lib/books";
import { parseAdvertisingFile } from "../lib/parseAdvertising";

type Props = {
  year: SaleYear;
  books: LienBook[];
  activeCounty: string;
  onOpenBook: (year: SaleYear, countyId: string) => void;
  onImport: (year: SaleYear, countyId: string, countyName: string, liens: Lien[], fileName: string) => void;
};

export function Counties({ year, books, activeCounty, onOpenBook, onImport }: Props) {
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importCounty, setImportCounty] = useState(activeCounty);
  const fileRef = useRef<HTMLInputElement>(null);
  const yearBooks = booksForYear(books, year);
  const selectedBook = yearBooks.find((b) => b.countyId === importCounty);

  useEffect(() => {
    setImportCounty(activeCounty);
  }, [activeCounty, year]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MARYLAND_SALES.filter((c) => {
      if (!query) return true;
      return `${c.name} ${c.portalName} ${c.typicalWindow}`.toLowerCase().includes(query);
    }).sort((a, b) => {
      const as = a.dates[year].sort ?? "9999";
      const bs = b.dates[year].sort ?? "9999";
      return as.localeCompare(bs);
    });
  }, [q, year]);

  const loadFile = async (file: File) => {
    setError(null);
    const text = await file.text();
    const county = MARYLAND_SALES.find((c) => c.id === importCounty) ?? MARYLAND_SALES[0];
    const liens = parseAdvertisingFile(text, county.id);
    if (liens.length === 0) {
      setError("No parcel rows found. Use a tab- or comma-separated advertising list with Amount Due and Assessed Value columns.");
      return;
    }
    onImport(year, county.id, county.name, liens, file.name);
  };

  return (
    <div className="counties">
      <section className="detail-card">
        <p className="section-kicker">Maryland · 24 collectors · {year}</p>
        <h2 className="address" style={{ fontSize: 26 }}>One book per county</h2>
        <p className="owner">
          Import one advertising file at a time. Each file is stored as <strong>{year} + that
          collector</strong>. A Cecil import does not replace Baltimore County; re-importing the same
          county replaces only that county’s book. Other sale years stay untouched.
        </p>
        <p className="owner">
          There is still no statewide feed or umbrella registration. Official tracker:
          {" "}
          <a href={DAT_SCHEDULE} target="_blank" rel="noreferrer">DAT tax sale schedule</a>
          {" · "}
          <a href={DAT_OMBUDSMAN} target="_blank" rel="noreferrer">Tax Sale Ombudsman</a>
        </p>
      </section>

      <section className="detail-card">
        <p className="section-kicker">Load a {year} advertising list</p>
        <p className="owner">
          {yearBooks.length === 0
            ? `No advertising book for ${year} yet. Pick a collector, download that year’s list from its portal, and import it here.`
            : `${yearBooks.length} county ${yearBooks.length === 1 ? "book" : "books"} loaded for ${year}: ${yearBooks.map((b) => `${shortCounty(b.countyName)} (${b.liens.length.toLocaleString()})`).join(" · ")}. Import another collector without wiping these.`}
        </p>
        {yearBooks.length > 0 ? (
          <div className="table-tools" style={{ marginTop: 10 }}>
            {yearBooks.map((b) => (
              <button
                key={b.countyId}
                className="chip"
                type="button"
                onClick={() => onOpenBook(year, b.countyId)}
              >
                Open {shortCounty(b.countyName)}
              </button>
            ))}
          </div>
        ) : null}
        <div className="import-row">
          <select value={importCounty} onChange={(e) => setImportCounty(e.target.value)}>
            {MARYLAND_SALES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="btn primary" type="button" onClick={() => fileRef.current?.click()}>
            Import {year} TSV / CSV
          </button>
          <span className="owner">
            {selectedBook
              ? `Replaces the ${selectedBook.liens.length.toLocaleString()}-name ${selectedBook.countyName} book only.`
              : "Adds a new county book next to the ones already loaded."}
          </span>
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
        <span className="owner">{rows.length} jurisdictions · DAT {year}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>County</th>
              <th>DAT {year} date</th>
              <th>Typical window</th>
              <th>Portal</th>
              <th>Register?</th>
              <th>Book</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const stamp = c.dates[year];
              const status = saleStatus(stamp.sort);
              const loaded = yearBooks.find((b) => b.countyId === c.id);
              return (
                <tr key={c.id}>
                  <td>
                    {c.name}
                    <div className="owner">{c.vendor} · {c.feeNote}</div>
                  </td>
                  <td className="mono">{stamp.label}</td>
                  <td>{c.typicalWindow}</td>
                  <td>
                    <a href={c.portalUrl} target="_blank" rel="noreferrer">{c.portalName}</a>
                  </td>
                  <td>Separate application</td>
                  <td>
                    {loaded ? (
                      <button className="chip" type="button" onClick={() => onOpenBook(year, c.id)}>
                        {loaded.liens.length.toLocaleString()} loaded
                      </button>
                    ) : (
                      <span className="owner">—</span>
                    )}
                  </td>
                  <td><span className={`status-pill ${status}`}>{statusLabel(status, year)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
