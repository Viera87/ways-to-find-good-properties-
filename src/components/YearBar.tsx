import { SALE_YEARS, type SaleYear } from "../lib/counties";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

type Props = {
  year: SaleYear;
  counts: Partial<Record<number, number>>;
  onChange: (year: SaleYear) => void;
};

export function YearBar({ year, counts, onChange }: Props) {
  return (
    <div className="year-bar">
      <span className="field-label">
        <Hint entry={TERM_HELP.saleYear}>Sale year</Hint>
      </span>
      {SALE_YEARS.map((y) => (
        <button
          key={y}
          type="button"
          className={y === year ? "active" : ""}
          onClick={() => onChange(y)}
        >
          {y}
          <small>{counts[y] ? counts[y]!.toLocaleString() : "empty"}</small>
        </button>
      ))}
    </div>
  );
}
