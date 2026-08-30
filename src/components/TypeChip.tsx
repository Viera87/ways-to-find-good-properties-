import { PROPERTY_KIND_LABEL, type PropertyKind } from "../lib/propertyType";
import { TERM_HELP } from "../lib/glossary";
import { Hint } from "./Hint";

export function TypeChip({ kind }: { kind: PropertyKind }) {
  return (
    <Hint entry={TERM_HELP.propertyType}>
      <span className={`type-chip ${kind}`}>{PROPERTY_KIND_LABEL[kind]}</span>
    </Hint>
  );
}
