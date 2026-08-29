const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdExact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const pctExact = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (n: number) => usd.format(n);
export const moneyExact = (n: number) => usdExact.format(n);
export const percent = (n: number) => pct.format(n);
export const percentExact = (n: number) => pctExact.format(n);

export function acresLabel(acres: number | null, sqft: number | null): string {
  if (acres != null) return `${acres.toLocaleString()} ac`;
  if (sqft != null) return `${sqft.toLocaleString()} sf`;
  return "—";
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
