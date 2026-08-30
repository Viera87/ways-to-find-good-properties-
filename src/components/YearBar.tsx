import type { LienBook } from "../types";
import { booksForYear, shortCounty } from "../lib/books";
import { SALE_YEARS, type SaleYear } from "../lib/counties";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

type Props = {
  year: SaleYear;
  countyId: string | null;
  books: LienBook[];
  counts: Partial<Record<number, number>>;
  onChangeYear: (year: SaleYear) => void;
  onChangeCounty: (countyId: string) => void;
};

export function YearBar({ year, countyId, books, counts, onChangeYear, onChangeCounty }: Props) {
  const yearBooks = booksForYear(books, year);

  return (
    <div className="year-stack">
      <div className="year-bar">
        <span className="field-label">
          <Hint entry={TERM_HELP.saleYear}>Sale year</Hint>
        </span>
        {SALE_YEARS.map((y) => (
          <button
            key={y}
            type="button"
            className={y === year ? "active" : ""}
            onClick={() => onChangeYear(y)}
          >
            {y}
            <small>{counts[y] ? counts[y]!.toLocaleString() : "empty"}</small>
          </button>
        ))}
      </div>
      {yearBooks.length > 0 ? (
        <div className="year-bar">
          <span className="field-label">
            <Hint entry={TERM_HELP.countyBook}>County book</Hint>
          </span>
          {yearBooks.map((b) => (
            <button
              key={b.countyId}
              type="button"
              className={b.countyId === countyId ? "active" : ""}
              onClick={() => onChangeCounty(b.countyId)}
            >
              {shortCounty(b.countyName)}
              <small>{b.liens.length.toLocaleString()}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
