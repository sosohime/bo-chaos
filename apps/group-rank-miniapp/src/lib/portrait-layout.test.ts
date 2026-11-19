import { expect, it } from "vitest";
import { portraitLayout, portraitPose } from "./portrait-layout";

const people = (count: number) => Array.from({ length: count }, (_, i) => ({ displayName: ["山间来信", "小满", "阿川"][i % 3], score: ["668", "520.1", "486"][i % 3], rank: i + 1, pendingClaim: false }));

it.each([320, 375, 390, 430])("keeps portrait groups and scores separated throughout collapse at %i", width => {
  const layout = portraitLayout(people(3), "尿酸王", width);
  expect(layout.expanded / width * 390).toBeGreaterThan(190);
  expect(layout.expanded / width * 390).toBeLessThan(230);
  expect(layout.compact / width * 390).toBeGreaterThan(88);
  expect(layout.compact / width * 390).toBeLessThan(110);
  for (const progress of [0, .25, .5, .75, 1]) {
    const poses = people(3).map((_, i) => portraitPose(layout, i, progress));
    for (const pose of poses) {
      expect(pose.photoTop + pose.photoSize).toBeLessThanOrEqual(pose.nameTop);
      expect(pose.nameLeft).toBeGreaterThanOrEqual(0);
      expect(pose.valueLeft + pose.valueWidth).toBeLessThanOrEqual(layout.column + .01);
      expect(pose.valueTop + pose.valueHeight).toBeLessThanOrEqual(pose.height);
      const sharesColumn = pose.nameLeft < pose.valueLeft + pose.valueWidth && pose.nameLeft + pose.nameWidth > pose.valueLeft;
      if (sharesColumn) expect(pose.nameTop + pose.nameHeight).toBeLessThanOrEqual(pose.valueTop + .01);
    }
  }
});

it("aligns two portrait apertures and preserves equal prominence for ties", () => {
  for (const rows of [people(2), people(3).map(p => ({ ...p, rank: 1 }))]) {
    const layout = portraitLayout(rows, "榜单", 375);
    for (const progress of [0, .5, 1]) {
      const poses = rows.map((_, i) => portraitPose(layout, i, progress));
      expect(new Set(poses.map(p => p.photoTop))).toHaveLength(1);
      expect(new Set(poses.map(p => p.photoSize))).toHaveLength(1);
    }
  }
});

it("reserves complete long values and pending actions instead of intersecting labels", () => {
  const rows = people(3).map(p => ({ ...p, displayName: "很长的群友昵称需要完整展示", score: "-999999999.999", pendingClaim: true }));
  const layout = portraitLayout(rows, "这个榜单名字比较长也需要完整显示", 320);
  expect(layout.nameHeight).toBeGreaterThan(30);
  for (const progress of [0, .5, 1]) for (let i = 0; i < 3; i++) {
    const p = portraitPose(layout, i, progress);
    expect(p.valueTop).toBeGreaterThanOrEqual(p.nameTop + p.nameHeight);
    expect(p.actionTop + p.actionHeight).toBeLessThanOrEqual(p.height);
  }
});
