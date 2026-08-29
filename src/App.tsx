import { useMemo, useState } from "react";
import rawLiens from "./data/liens.json";
import type { Assumptions, Lien } from "./types";
import { AssumptionsBar } from "./components/AssumptionsBar";
import { Allocator } from "./components/Allocator";
import { Methodology } from "./components/Methodology";
import { Pipeline } from "./components/Pipeline";
import { DEFAULT_ASSUMPTIONS, SALE, rankedLiens } from "./lib/underwrite";
import { money, percent } from "./lib/format";

const liens = rawLiens as Lien[];

type View = "pipeline" | "allocator" | "method";

export function App() {
  const [view, setView] = useState<View>("pipeline");
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = useMemo(() => rankedLiens(liens, assumptions), [assumptions]);
  const accumulate = ranked.filter((r) => r.uw.verdict === "ACCUMULATE");
  const underwriteable = ranked.filter((r) => r.uw.verdict === "ACCUMULATE" || r.uw.verdict === "UNDERWRITE");
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
          <button className={view === "method" ? "active" : ""} onClick={() => setView("method")}>
            Protocol
          </button>
        </nav>
        <div className="sale-meta">
          {SALE.county}
          <br />
          Collector’s sale {SALE.saleDate}
        </div>
      </header>

      <main className="page">
        <section className="kpis">
          <article className="kpi">
            <div className="kpi-label">Universe</div>
            <div className="kpi-value">{liens.length.toLocaleString()}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label">Accumulate</div>
            <div className="kpi-value">{accumulate.length}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label">Pass LTV gate</div>
            <div className="kpi-value">{underwriteable.length}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label">Median face</div>
            <div className="kpi-value">{money(medianFace)}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label">Top-25 auction cash</div>
            <div className="kpi-value">{money(topBook)}</div>
          </article>
          <article className="kpi">
            <div className="kpi-label">Max eff. LTV</div>
            <div className="kpi-value">{percent(assumptions.maxEffectiveLtv)}</div>
          </article>
        </section>

        <AssumptionsBar value={assumptions} onChange={setAssumptions} />

        {view === "pipeline" ? (
          <Pipeline
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
        {view === "method" ? <Methodology /> : null}
      </main>
    </div>
  );
}
