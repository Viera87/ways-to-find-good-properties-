import type { LienBook } from "../types";
import type { SaleYear } from "./counties";

export function bookKey(year: number, countyId: string): string {
  return `${year}:${countyId}`;
}

export function booksForYear(books: LienBook[], year: number): LienBook[] {
  return books.filter((b) => b.year === year).sort((a, b) => a.countyName.localeCompare(b.countyName));
}

export function findBook(books: LienBook[], year: number, countyId: string | null): LienBook | undefined {
  const yearBooks = booksForYear(books, year);
  if (countyId) {
    const match = yearBooks.find((b) => b.countyId === countyId);
    if (match) return match;
  }
  return yearBooks[0];
}

export function yearCounts(books: LienBook[]): Partial<Record<SaleYear, number>> {
  const counts: Partial<Record<number, number>> = {};
  for (const book of books) {
    counts[book.year] = (counts[book.year] ?? 0) + book.liens.length;
  }
  return counts;
}

export function shortCounty(name: string): string {
  return name.replace(/, Maryland$/, "");
}

export function upsertBook(books: LienBook[], incoming: LienBook): LienBook[] {
  return [...books.filter((b) => !(b.year === incoming.year && b.countyId === incoming.countyId)), incoming];
}
