import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";

function gesture() {
  const module = { exports: {} as Record<string, (...args: any[]) => any> };
  const appRoot = existsSync(resolve(process.cwd(), "src/app.config.ts"))
    ? process.cwd()
    : resolve(process.cwd(), "apps/group-rank-miniapp");
  const local = {};
  const data = { locked: false, width: 390, height: 650, ready: true,
    cannext: true, canback: true, backready: true, backheight: 650 };
  const styles = new Map<string, Record<string, string>>();
  const frames: (() => void)[] = [];
  const accept = vi.fn();
  let time = 0;
  runInNewContext(readFileSync(resolve(appRoot, "src/native/notebook-corner/fold.wxs"), "utf8"), {
    module,
    getDate: () => ({ getTime: () => time }),
  });
  const owner = {
    selectComponent: (selector: string) => ({
      getState: () => local,
      getDataset: () => data,
      setStyle: (style: Record<string, string>) => {
        styles.set(selector, style);
      },
    }),
    callMethod: accept,
    requestAnimationFrame: (callback: () => void) => frames.push(callback),
  };
  function send(name: string, x: number, y: number, locked = false, direction = 1) {
    data.locked = locked;
    const point = { clientX: x, clientY: y };
    return module.exports[name]({
      currentTarget: { dataset: { direction } },
      touches: name === "end" ? [] : [point],
      changedTouches: [point],
    }, owner);
  }
  function animate() {
    for (let frame = 0; frame < 20 && frames.length; frame += 1) {
      time += 16;
      frames.shift()!();
    }
  }
  return { send, styles, accept, animate, fold: module.exports.fold, request: (pulse: number) => module.exports.request(pulse, 0, owner) };
}

it("clips the actual front in two different directions before release and restores it after a short pull", () => {
  const { send, styles, accept, animate } = gesture();
  send("start", 350, 640);
  expect(styles.get(".sheet-back")?.opacity).toBe("1");
  expect(styles.get(".sheet-next")?.["clip-path"]).toMatch(/^polygon\(/);
  send("move", 295, 628);
  const horizontal = styles.get(".sheet-front")?.["clip-path"];
  send("move", 338, 585);
  expect(styles.get(".sheet-front")?.["clip-path"]).not.toEqual(horizontal);
  expect(accept).not.toHaveBeenCalled();
  send("end", 338, 585);
  animate();
  expect(styles.get(".sheet-front")?.["clip-path"]).toBe("none");
  expect(styles.get(".sheet-next")?.opacity).toBe("0");
  expect(accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: false, direction: 1 });
});

it("finishes the paper sweep before advancing once, and handles a stationary tap", () => {
  const { send, accept, styles, animate } = gesture();
  send("start", 374, 640);
  send("move", 180, 574);
  send("end", 180, 574);
  expect(accept).not.toHaveBeenCalled();
  animate();
  expect(styles.get(".sheet-front")?.["clip-path"]).toBe("polygon(0 0,0 0,0 0)");
  expect(accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: true, direction: 1 });
  const tap = gesture();
  tap.send("start", 350, 640);
  tap.send("end", 350, 640);
  tap.animate();
  expect(tap.accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: true, direction: 1 });
});

it("restores the real sheet when an ongoing finger gesture is cancelled or locked", () => {
  const { send, accept, styles, animate } = gesture();
  send("start", 350, 640);
  send("move", 220, 600);
  send("cancel", 220, 600);
  send("end", 220, 600);
  animate();
  expect(styles.get(".sheet-back")?.opacity).toBe("0");
  send("start", 350, 640, true);
  send("end", 220, 600, true);
  expect(accept).not.toHaveBeenCalled();
});


it.each([
  [320, 520, 130, 4],
  [390, 680, 155, 155],
  [430, 1350, 10, 180],
])("masks the next page past the projected crease on a %i × %i sheet", (width, height, left, up) => {
  const { fold } = gesture();
  const shape = fold(left, up, width, height, 0);
  const normal = [Math.cos(shape.angle), Math.sin(shape.angle)];
  const project = (path: string) => [...path.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g)]
    .map(([, x, y]) => (width - Number(x)) * normal[0] + (height - Number(y)) * normal[1]);

  const front = project(shape.front);
  const next = project(shape.exposed);
  const radius = Math.min(34, 3 + Math.hypot(left, up) * 0.11);
  const silhouette = (Math.hypot(left, up) + Math.PI * radius) / 2 - radius;

  expect(Math.max(...next)).toBeCloseTo(silhouette, 0);
  expect(Math.min(...front)).toBeCloseTo(silhouette - 1, 0);
  expect(Math.min(...next)).toBe(0);
  expect(Math.max(...front)).toBeCloseTo(width * normal[0] + height * normal[1], 0);
});


it("reveals a taller target to its own bottom before the current sheet is replaced", () => {
  const { fold } = gesture();
  const bottom = (path: string) => Math.max(...[...path.matchAll(/-?[\d.]+px (-?[\d.]+)px/g)]
    .map(([, y]) => Number(y)));
  expect(bottom(fold(190, 40, 390, 500, 0, 700).exposed)).toBe(500);
  expect(bottom(fold(190, 40, 390, 500, 0.5, 700).exposed)).toBe(600);
  expect(bottom(fold(190, 40, 390, 500, 1, 700).exposed)).toBe(700);
});


it("mirrors the geometry and exposes only the previous layer while dragging from the left edge", () => {
  const { send, accept, styles, animate, fold } = gesture();
  const forward = fold(148, 40, 390, 650, 0, 650, false);
  const backward = fold(148, 40, 390, 650, 0, 650, true);
  const firstX = (path: string) => Number(path.match(/-?[\d.]+(?=px)/)?.[0]);
  expect(firstX(forward.exposed) + firstX(backward.exposed)).toBe(390);
  send("start", 12, 630, false, -1);
  send("move", 179, 590, false, -1);
  expect(styles.get(".sheet-previous")?.opacity).toBe("1");
  expect(styles.get(".sheet-next")?.opacity).toBe("0");
  expect(accept).not.toHaveBeenCalled();
  send("end", 179, 590, false, -1);
  animate();
  expect(accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: true, direction: -1 });
});

it("follows a right swipe over the page, leaving vertical scrolling alone", () => {
  const right = gesture();
  right.send("start", 90, 440, false, 0);
  right.send("move", 122, 438, false, 0);
  expect(right.styles.get(".sheet-previous")?.opacity).toBe("1");
  right.send("end", 158, 439, false, 0);
  right.animate();
  expect(right.accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: true, direction: -1 });

  const vertical = gesture();
  vertical.send("start", 90, 440, false, 0);
  vertical.send("move", 95, 399, false, 0);
  vertical.send("end", 97, 345, false, 0);
  expect(vertical.styles.get(".sheet-previous")?.opacity).toBe("0");
  expect(vertical.accept).not.toHaveBeenCalled();
});

it("uses the same backward sweep for the footer arrow", () => {
  const { request, styles, animate, accept } = gesture();
  request(-1);
  expect(accept).not.toHaveBeenCalled();
  animate();
  expect(styles.get(".sheet-previous")?.opacity).toBe("1");
  expect(accept).toHaveBeenCalledExactlyOnceWith("finishGesture", { turn: true, direction: -1 });
});
