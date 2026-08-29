import { useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GlossaryEntry } from "../lib/glossary";

type Props = {
  entry: GlossaryEntry;
  children: ReactNode;
  className?: string;
};

type Pos = { left: number; top: number; maxWidth: number };

function place(rect: DOMRect): Pos {
  const gutter = 12;
  const maxWidth = Math.min(340, window.innerWidth - gutter * 2);
  let left = rect.left;
  if (left + maxWidth > window.innerWidth - gutter) {
    left = window.innerWidth - gutter - maxWidth;
  }
  left = Math.max(gutter, left);
  const below = rect.bottom + 8;
  const above = rect.top - 8;
  const preferBelow = below + 140 < window.innerHeight;
  return { left, top: preferBelow ? below : Math.max(gutter, above - 140), maxWidth };
}

export function Hint({ entry, children, className }: Props) {
  const id = useId();
  const [pos, setPos] = useState<Pos | null>(null);

  const show = (node: HTMLElement) => setPos(place(node.getBoundingClientRect()));
  const hide = () => setPos(null);

  return (
    <span
      className={`hint ${className ?? ""}`.trim()}
      tabIndex={0}
      aria-describedby={pos ? id : undefined}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={hide}
    >
      {children}
      {pos
        ? createPortal(
            <div
              id={id}
              role="tooltip"
              className="hint-pop"
              style={{ left: pos.left, top: pos.top, maxWidth: pos.maxWidth }}
            >
              <strong>{entry.title}</strong>
              <p>{entry.body}</p>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
