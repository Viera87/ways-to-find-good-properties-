import type { Assumptions } from "../types";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

type Props = {
  value: Assumptions;
  onChange: (next: Assumptions) => void;
};

export function AssumptionsBar({ value, onChange }: Props) {
  const set = <K extends keyof Assumptions>(key: K, raw: string) => {
    const numeric = Number(raw);
    onChange({ ...value, [key]: Number.isFinite(numeric) ? numeric : value[key] });
  };

  return (
    <section className="assumptions panel">
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.statutoryRate}>Statutory rate</Hint></label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="0.3"
          value={value.statutoryRate}
          onChange={(e) => set("statutoryRate", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.hold}>Hold (months)</Hint></label>
        <input
          type="number"
          min="1"
          max="36"
          value={value.holdMonths}
          onChange={(e) => set("holdMonths", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.haircut}>As-is BPO haircut</Hint></label>
        <input
          type="number"
          step="0.05"
          min="0.3"
          max="1"
          value={value.bpoHaircut}
          onChange={(e) => set("bpoHaircut", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.overbid}>Modeled overbid $</Hint></label>
        <input
          type="number"
          min="0"
          value={value.overbid}
          onChange={(e) => set("overbid", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.legal}>Legal / FC overhead</Hint></label>
        <input
          type="number"
          min="0"
          value={value.legalOverhead}
          onChange={(e) => set("legalOverhead", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.maxLtv}>Max effective LTV</Hint></label>
        <input
          type="number"
          step="0.01"
          min="0.05"
          max="0.5"
          value={value.maxEffectiveLtv}
          onChange={(e) => set("maxEffectiveLtv", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.subTaxRate}>Sub-tax millage</Hint></label>
        <input
          type="number"
          step="0.001"
          min="0"
          max="0.05"
          value={value.subsequentTaxRate}
          onChange={(e) => set("subsequentTaxRate", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label"><Hint entry={TERM_HELP.subTaxMonth}>First sub-tax month</Hint></label>
        <input
          type="number"
          min="1"
          max="24"
          value={value.subTaxMonth}
          onChange={(e) => set("subTaxMonth", e.target.value)}
        />
      </div>
    </section>
  );
}
