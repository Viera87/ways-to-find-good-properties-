import type { Assumptions, Lien, Underwriting } from "../types";
import { acresLabel, moneyExact, percentExact } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { PITFALL_CHECKS, pitfallStorageKey } from "../lib/pitfalls";
import { Hint } from "./Hint";
import { useEffect, useState } from "react";

type Props = {
  lien: Lien;
  uw: Underwriting;
  assumptions: Assumptions;
};

export function PitfallGate({ lien, uw, assumptions }: Props) {
  const storageKey = pitfallStorageKey(lien.id);
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

  const done = PITFALL_CHECKS.filter((p) => checked[p.id]).length;
  const ready = done === PITFALL_CHECKS.length;
  const lockMonths = assumptions.holdMonths;

  return (
    <section className={ready ? "pitfall-gate ready" : "pitfall-gate"}>
      <h3>
        <Hint entry={TERM_HELP.pitfalls}>Six pitfalls — not bid-ready until all six are checked</Hint>
      </h3>
      <p className="owner">
        {ready
          ? "All six gates checked on this certificate. That is still not a bid ticket — it means you did not skip the usual ways this book loses money."
          : `${done} of ${PITFALL_CHECKS.length} gates checked. Do not ACH this name yet.`}
      </p>

      <div className="metrics">
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.redemptionPath}>Expected path</Hint></div>
          <div className="metric-value">Redeem</div>
        </div>
        <div className="metric">
          <div className="field-label">Modeled interest</div>
          <div className="metric-value">{moneyExact(uw.grossInterest)}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.lockup}>Capital lockup</Hint></div>
          <div className="metric-value">{lockMonths} mo</div>
        </div>
        <div className="metric">
          <div className="field-label">Deed / takeout LTV</div>
          <div className="metric-value">{percentExact(uw.takeoutLtv)}</div>
        </div>
      </div>
      <p className="owner">
        You are purchasing a {(assumptions.statutoryRate * 100).toFixed(0)}% debt instrument. Historically
        most Maryland tax certificates redeem before a deed is ever taken. Base the bid on whether that
        yield pays for {lockMonths} months of locked cash. Acquiring {lien.address || "this parcel"} is
        the rare fallback, not the plan.
      </p>

      <div className="legal-match">
        <div className="field-label"><Hint entry={TERM_HELP.legalDesc}>Legal description vs parcel</Hint></div>
        <p className="mono legal-blob">
          Dist {lien.district} · Acct {lien.parcel}
          <br />
          {lien.description || "No legal description on the advertising list"}
          {lien.acres != null || lien.sqft != null ? ` · ${acresLabel(lien.acres, lien.sqft)}` : ""}
        </p>
        <p className="owner">
          Confirm this account polygon on county GIS. A house number on the list can sit next to a
          strip, alley, or residue lot that is what you actually buy.
        </p>
      </div>

      <div className="check-list">
        {PITFALL_CHECKS.map((item) => (
          <label key={item.id}>
            <input type="checkbox" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} />
            <span>
              <strong>{item.title}.</strong> {item.label}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
