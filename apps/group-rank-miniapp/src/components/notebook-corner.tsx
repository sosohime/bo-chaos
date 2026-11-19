import type { ReactNode } from "react";
import { Slot } from "@tarojs/components";
import type { PageDirection } from "../lib/notebook";

export type NotebookCornerProps = {
  label: string;
  backLabel?: string;
  onTurn: (direction: PageDirection) => void;
  disabled?: boolean;
  leafKey: string;
  turnPulse?: number;
  next?: ReactNode;
  previous?: ReactNode;
  children: ReactNode;
};

export default function NotebookCorner({
  label, backLabel, onTurn, disabled, leafKey, turnPulse, next, previous, children,
}: NotebookCornerProps) {
  return <notebook-corner
    label={label}
    backlabel={backLabel ?? ""}
    disabled={!!disabled}
    leafkey={leafKey}
    ready={!!next}
    backready={!!previous}
    turnpulse={turnPulse ?? 0}
    onTurn={event => onTurn(event.detail.direction === -1 ? -1 : 1)}
  >
    {next && <Slot name="next">{next}</Slot>}
    {previous && <Slot name="previous">{previous}</Slot>}
    {children}
  </notebook-corner>;
}
