import type { Assumptions } from "../types";

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
        <label className="field-label">Statutory rate</label>
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
        <label className="field-label">Hold (months)</label>
        <input
          type="number"
          min="1"
          max="36"
          value={value.holdMonths}
          onChange={(e) => set("holdMonths", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">As-is BPO haircut</label>
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
        <label className="field-label">Modeled overbid $</label>
        <input
          type="number"
          min="0"
          value={value.overbid}
          onChange={(e) => set("overbid", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Legal / FC overhead</label>
        <input
          type="number"
          min="0"
          value={value.legalOverhead}
          onChange={(e) => set("legalOverhead", e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Max effective LTV</label>
        <input
          type="number"
          step="0.01"
          min="0.05"
          max="0.5"
          value={value.maxEffectiveLtv}
          onChange={(e) => set("maxEffectiveLtv", e.target.value)}
        />
      </div>
    </section>
  );
}
