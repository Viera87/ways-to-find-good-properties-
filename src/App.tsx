import { useMemo, useState } from "react";
import rawLiens from "./data/liens.json";
import results2025 from "./data/bc-2025-results.json";
import type { Assumptions, Lien, LienBook } from "./types";
import { AssumptionsBar } from "./components/AssumptionsBar";
import { Allocator } from "./components/Allocator";
import { Counties } from "./components/Counties";
import { Methodology } from "./components/Methodology";
import { Pipeline } from "./components/Pipeline";
import { ResultsRecap } from "./components/ResultsRecap";
import { YearBar } from "./components/YearBar";
import type { SaleYear } from "./lib/counties";
import { findBook, upsertBook, yearCounts } from "./lib/books";
import { DEFAULT_ASSUMPTIONS, rankedLiens } from "./lib/underwrite";
import { money } from "./lib/format";
import { TERM_HELP } from "./lib/glossary";
import { Hint } from "./components/Hint";

const bundled = rawLiens as Lien[];

const STARTER_BOOK: LienBook = {
  year: 2026,
  countyId: "baltimore-county",
  countyName: "Baltimore County, Maryland",
  source: "2026 advertising file",
  liens: bundled,
};

const BOOK_2025: LienBook = {
  year: 2025,
  countyId: "baltimore-county",
  countyName: "Baltimore County, Maryland",
  source: "2025 winner detail · sale August 28",
  liens: results2025 as Lien[],
};

type View = "pipeline" | "allocator" | "counties" | "method";

export function App() {
  const [view, setView] = useState<View>("pipeline");
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<SaleYear>(2026);
  const [activeCounty, setActiveCounty] = useState("baltimore-county");
  const [books, setBooks] = useState<LienBook[]>([STARTER_BOOK, BOOK_2025]);

  const book = findBook(books, activeYear, activeCounty);
  const liens = book?.liens ?? [];
  const ranked = useMemo(() => rankedLiens(liens, assumptions), [liens, assumptions]);
  const accumulate = ranked.filter((r) => r.uw.verdict === "ACCUMULATE");
  const underwriteable = ranked.filter((r) => r.uw.verdict === "ACCUMULATE" || r.uw.verdict === "UNDERWRITE");
  const leftoverRisk = ranked.filter((r) => r.uw.leftoverRisk);
  const medianFace = ranked[Math.floor(ranked.length / 2)]?.lien.amountDue ?? 0;
  const topBook = underwriteable.slice(0, 25).reduce((sum, r) => sum + r.uw.auctionDayCapital, 0);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">CERTUS</div>
          <div className="brand-sub">Tax lien underwriting desk</div>
        </div>
        <nav className="nav">
          <button className={view === "pipeline" ? "active" : ""} onClick={() => setView("pipeline")}>
            Pipeline
          </button>
          <button className={view === "allocator" ? "active" : ""} onClick={() => setView("allocator")}>
            Allocator
          </button>
          <button className={view === "counties" ? "active" : ""} onClick={() => setView("counties")}>
            <Hint entry={TERM_HELP.counties}>Counties</Hint>
          </button>
          <button className={view === "method" ? "active" : ""} onClick={() => setView("method")}>
            Protocol
          </button>
        </nav>
        <div className="sale-meta">
          {activeYear} · {book?.countyName ?? "No book loaded"}
          <br />
          {book ? `${book.source} · ${liens.length.toLocaleString()} names` : "Import a list on Counties"}
        </div>
      </header>

      <main className="page">
        <YearBar
          year={activeYear}
          countyId={book?.countyId ?? activeCounty}
          books={books}
          counts={yearCounts(books)}
          onChangeYear={(year) => {
            setActiveYear(year);
            const next = findBook(books, year, activeCounty);
            setActiveCounty(next?.countyId ?? activeCounty);
            setSelectedId(null);
          }}
          onChangeCounty={(countyId) => {
            setActiveCounty(countyId);
            setSelectedId(null);
          }}
        />
        <section className="kpis">
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.universe}>Universe</Hint></div>
            <div className="kpi-value">{liens.length.toLocaleString()}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.accumulateKpi}>Accumulate</Hint></div>
            <div className="kpi-value">{accumulate.length}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.passGate}>Pass LTV gate</Hint></div>
            <div className="kpi-value">{underwriteable.length}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.medianFace}>Median face</Hint></div>
            <div className="kpi-value">{money(medianFace)}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.top25}>Top-25 auction cash</Hint></div>
            <div className="kpi-value">{money(topBook)}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label"><Hint entry={TERM_HELP.leftoverKpi}>OTC / leftover risk</Hint></div>
            <div className="kpi-value">{leftoverRisk.length.toLocaleString()}</div>
          </article>
        </section>

        <AssumptionsBar value={assumptions} onChange={setAssumptions} />
        {view === "pipeline" ? <ResultsRecap liens={liens} /> : null}

        {view === "pipeline" && liens.length === 0 ? (
          <section className="detail-card">
            <p className="section-kicker">{activeYear} book</p>
            <h2 className="address" style={{ fontSize: 24 }}>No advertising list for {activeYear}</h2>
            <p className="owner">
              Open Counties, pick the collector, and import that year’s TSV/CSV. Other counties
              already loaded for {activeYear} stay put — one book per county, not one book for the whole year.
            </p>
            <button className="btn primary" type="button" onClick={() => setView("counties")}>
              Go to {activeYear} counties
            </button>
          </section>
        ) : null}
        {view === "pipeline" && liens.length > 0 ? (
          <Pipeline
            key={`${activeYear}-${book?.countyId ?? "empty"}-${book?.source ?? "empty"}`}
            rows={ranked}
            assumptions={assumptions}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : null}
        {view === "allocator" ? (
          <Allocator
            liens={liens}
            assumptions={assumptions}
            onOpen={(id) => {
              setSelectedId(id);
              setView("pipeline");
            }}
          />
        ) : null}
        {view === "counties" ? (
          <Counties
            year={activeYear}
            books={books}
            activeCounty={book?.countyId ?? activeCounty}
            onOpenBook={(year, countyId) => {
              setActiveYear(year);
              setActiveCounty(countyId);
              setSelectedId(null);
              setView("pipeline");
            }}
            onImport={(year, countyId, countyName, next, fileName) => {
              setBooks((prev) =>
                upsertBook(prev, { year, countyId, countyName, source: fileName, liens: next }),
              );
              setActiveYear(year);
              setActiveCounty(countyId);
              setSelectedId(null);
              setView("pipeline");
            }}
          />
        ) : null}
        {view === "method" ? <Methodology /> : null}
      </main>
    </div>
  );
}
