import type { Verdict } from "../types";
import { VERDICT_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  return (
    <Hint entry={VERDICT_HELP[verdict]}>
      <span className={`verdict ${verdict}`}>{verdict}</span>
    </Hint>
  );
}
