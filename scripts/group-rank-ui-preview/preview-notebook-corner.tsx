import { useEffect, useRef, type PointerEvent } from "react";
import type { NotebookCornerProps } from "../../apps/group-rank-miniapp/src/components/notebook-corner";
import type { PageDirection } from "../../apps/group-rank-miniapp/src/lib/notebook";
import paper from "../../apps/group-rank-miniapp/src/native/notebook-corner/fold.wxs";
import styles from "../../apps/group-rank-miniapp/src/native/notebook-corner/index.wxss?raw";

export default function PreviewNotebookCorner(props: NotebookCornerProps) {
  const { label, backLabel, disabled, leafKey, turnPulse = 0, next, previous, children } = props;
  const sheet = useRef<HTMLDivElement>(null);
  const state = useRef({});
  const pointer = useRef<number | null>(null);
  const previousPulse = useRef(0);
  const latest = useRef(props);
  latest.current = props;

  const measure = (selector: string) => sheet.current?.querySelector(selector)?.getBoundingClientRect();
  const owner = {
    selectComponent(selector: string) {
      const node = selector === ".sheet" ? sheet.current : sheet.current?.querySelector<HTMLElement>(selector);
      if (!node) return null;
      return {
        getState: () => state.current,
        getDataset: () => ({
          locked: !!latest.current.disabled,
          cannext: !!latest.current.label,
          canback: !!latest.current.backLabel,
          ready: !!latest.current.next,
          backready: !!latest.current.previous,
          width: measure(".sheet-front")?.width,
          height: measure(".sheet-front")?.height,
          nextheight: measure(".sheet-next")?.height,
          backheight: measure(".sheet-previous")?.height,
        }),
        setStyle: (properties: Record<string, string>) => {
          for (const [name, value] of Object.entries(properties)) node.style.setProperty(name, value);
        },
      };
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => requestAnimationFrame(callback),
    callMethod(_name: string, payload: { turn: boolean; direction: PageDirection }) {
      if (payload.turn && !latest.current.disabled) latest.current.onTurn(payload.direction);
    },
  };

  useEffect(() => { paper.replace(leafKey, null, owner); }, [leafKey]);
  useEffect(() => { if (!disabled) paper.replace(leafKey, null, owner); }, [disabled]);
  useEffect(() => {
    paper.request(turnPulse, previousPulse.current, owner);
    previousPulse.current = turnPulse;
  }, [turnPulse]);

  function send(event: PointerEvent<HTMLElement>, method: "start" | "move" | "end" | "cancel", direction: number) {
    const point = { clientX: event.clientX, clientY: event.clientY };
    const result = paper[method]({
      currentTarget: { dataset: { direction } },
      touches: method === "end" ? [] : [point],
      changedTouches: [point],
    }, owner);
    if (direction || result === false) event.stopPropagation();
    return result;
  }

  function bind(direction: -1 | 0 | 1) {
    return {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (!event.isPrimary || event.button !== 0 || disabled) return;
        pointer.current = event.pointerId;
        if (direction) event.currentTarget.setPointerCapture(event.pointerId);
        send(event, "start", direction);
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        if (pointer.current !== event.pointerId) return;
        if (send(event, "move", direction) === false && !direction)
          event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerUp(event: PointerEvent<HTMLElement>) {
        if (pointer.current !== event.pointerId) return;
        pointer.current = null;
        send(event, "end", direction);
      },
      onPointerCancel(event: PointerEvent<HTMLElement>) {
        if (pointer.current !== event.pointerId) return;
        pointer.current = null;
        send(event, "cancel", direction);
      },
    };
  }

  function corner(direction: PageDirection, text: string) {
    return <button
      type="button"
      className={`corner-hit corner-${direction < 0 ? "previous" : "next"}${disabled ? " corner-disabled" : ""}`}
      aria-label={text}
      aria-disabled={disabled}
      onTouchStart={event => event.stopPropagation()}
      onTouchMove={event => event.stopPropagation()}
      onTouchEnd={event => event.stopPropagation()}
      {...bind(direction)}
      onClick={event => { if (event.detail === 0 && !disabled) paper.request(direction, 0, owner); }}
    >
      {direction === 1 && <span className="corner-lip" aria-hidden />}
    </button>;
  }

  return <div className="sheet" ref={sheet}>
    <style>{styles}</style>
    <div className={next ? "sheet-next" : "sheet-next sheet-target-placeholder"} aria-hidden>{next}</div>
    <div className={previous ? "sheet-previous" : "sheet-previous sheet-target-placeholder"} aria-hidden>{previous}</div>
    <div className="sheet-shadow" aria-hidden />
    <div className="sheet-front" {...(backLabel ? bind(0) : {})}>{children}</div>
    <div className="sheet-back" aria-hidden />
    {backLabel && corner(-1, backLabel)}
    {label && corner(1, label)}
  </div>;
}
