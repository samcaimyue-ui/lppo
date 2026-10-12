// Theraband tension bench — the anatomy figure for 基礎運動療法マップ › 動く図解 › セラバンド (id "band").
//
//   node tools/anatomy/theraband/build.mjs                 → writes tools/anatomy/theraband/out/generated.js
//   node tools/anatomy/theraband/build.mjs --preview DIR   → also writes standalone preview pages to DIR
//                                                            (light/dark × poses) for scripts/lines.mjs and 4× crops
//   node tools/anatomy/theraband/inject.mjs                → puts the entry into index.html between the markers
//
// What moves and what it means: you pull the carriage along the rail (= how far the band is stretched,
// read on the ruler in cm), the band necks and its printed marks spread apart, the load cell's dial needle
// and the red arrow on the bench show the resistance in kg. Every number comes from kgOf() in live.js
// (the table read from the lecture photo); the geometry here only draws it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../../.claude/skills/anatomy/kit/lathe.mjs";
import * as dyn from "./dyn.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT_SRC = join(HERE, "../../../.claude/skills/anatomy/kit/iso-kit.mjs");

/* ---------- world ---------- */
const WIDTH = 640, PAD = 12;
const C = {
  U: 2,              // world units per cm of stretch
  XA: -96,           // anchor jaw face (band leaves it here)
  XC0: 24,           // carriage jaw face at natural length
  L0: 120,           // natural length (60 cm × U, as in the original figure)
  ZB: 18, BT: 1.4,   // band mid-height and thickness
  W0: 26,            // band width at the jaws
  JAW: 5,            // how far the band runs into the carriage jaw
  MARK: 15,          // printed mark every 15 units of rest length
  ARROW_Y: 34, ARROW_W: 1.6, ARROW_HW: 4.4, ARROW_HEAD: 7.5, ARROW_T: 1.1, ARROW_GAP: 6, ARROW_MIN: 3, ARROW_PER_KG: 11,
  DIAL: [-157, 26 + 2.6, 31], DIAL_R: 19, KGMAX: 8, NEEDLE_Y: 0.7,
  FROM: (-135 * Math.PI) / 180, SPAN: (270 * Math.PI) / 180, NEEDLE_R: 17.4, NEEDLE_TAIL: 3.6,
  CMMAX: 60,
};
const PLATE = { x: -198, y: -44, w: 400, d: 100, r: 8 };
const PLATE_H = 12, FOOT_H = 5;
const RAIL_Y = [-18, 18], RAIL_X0 = 2, RAIL_X1 = 190;
const RULER = { x: 16, y: 47, w: 136, d: 8, r: 1 }, RULER_H = 0.8;
const HOUSING = { x: -183, y: -26, w: 52, d: 52, r: 4 }, HOUSING_TOP = 56;
const FLANGE = { x: -188, y: -31, w: 62, d: 62, r: 5 };
const RACK = { x: -186, y: 34, w: 112, d: 16, r: 2 };
const LABEL = { x: 160, y: 31, w: 32, d: 16, r: 1.5 };
const LEVEL = { x: -58, y: 37, w: 34, d: 11, r: 2 };
const COLORS = ["tan", "yellow", "red", "green", "blue", "black", "silver", "gold"];
const HEX = { tan: "#d7b98e", yellow: "#f2d53c", red: "#d8352f", green: "#3a9a4a", blue: "#2f5fc2", black: "#2a2a2a", silver: "#a8adb3", gold: "#c9a227" };
const TILE = (i) => ({ x: -182.5 + i * 13.4, y: 36.5, w: 10.8, d: 11, r: 1.2 });
const TILE_Z = 2.2, TILE_H = 2.4, LIFT = 3.4;
// carriage, built at its jaw face x = 0 and moved by translateAlong([XC0 + cm·U, 0, 0])
const CAR = { x: 0, y: -25, w: 36, d: 50, r: 3 }, CAR_Z = 7, CAR_TOP = 11;
const GRIP = [24, 0], GRIP_R = 7, GRIP_Z = 44, GRIP_TOP = 52;

const reach = [C.XC0, C.XC0 + C.CMMAX * C.U];
// fit to the width, then cut the viewBox height to what the bench needs (plus room for its soft shadow)
const FIT = [
  ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
  [HOUSING.x, HOUSING.y, HOUSING_TOP + 4], [HOUSING.x + HOUSING.w, HOUSING.y, HOUSING_TOP + 4],
  ...reach.map((x) => [x + GRIP[0], 0, GRIP_TOP + 1]),
];
const HEIGHT = (() => {
  const P0 = k.fitProjection(FIT, WIDTH, 2000, { pad: PAD, azimuth: 60 });
  const ys = FIT.map((p) => k.iso(p, P0)[1]);
  return Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2 + 4);
})();
const P = k.fitProjection(FIT, WIDTH, HEIGHT, { pad: PAD, azimuth: 60, headroom: 0 });
P.origin[1] -= 2; // the halo under the base needs more room below than the dial needs above

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const paint = (paths, color, extra = "") => S(paths, { className: "tb-paint" }).replace('<g class="iso-solid tb-paint"', `<g class="iso-solid tb-paint" style="--tb-c:${color}"${extra}`);
const screw = (x, y, z, r = 1.9) => L(k.ring(x, y, r, z, P, 16), { tone: "lo" }) + D([at([x, y, z])], { size: 0.5 });

/* ---------- base ---------- */
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H + 3.5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  out.push(L(k.planOutline({ x: -118, y: -35.5, w: 306, d: 4.6, r: 2.3 }, 0, P, 4), { tone: "lo" }) + L(k.planOutline({ x: -116.6, y: -34.6, w: 303.2, d: 2.8, r: 1.4 }, 0, P, 4), { tone: "faint" }));
  out.push(k.corners(PLATE, 11).map(([x, y]) => screw(x, y, 0, 2.3)).join(""));
  return out.join("");
}

function ruler() {
  const out = [S(k.slabOf(RULER, 0, RULER_H, P, 3), { tone: "lo" })];
  const edge = RULER.y + RULER.d - 0.7, top = RULER_H, xs = [0, 20, 40, 60].map((cm) => C.XC0 + cm * C.U);
  // ticks grow back from the ruler's front edge, so they line up with the scale printed on the bench's front face
  const minor = [], mid = [];
  for (let cm = 0; cm <= 60; cm += 2) {
    if (cm % 20 === 0) continue;
    const x = C.XC0 + cm * C.U, len = cm % 10 === 0 ? 4.4 : 2.4;
    (cm % 10 === 0 ? mid : minor).push(k.lineOnTop([x, edge], [x, edge - len], top, P));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(mid.join(""), { tone: "mid" }));
  out.push(L(xs.map((x) => k.lineOnTop([x, RULER.y], [x, RULER.y + RULER.d], top, P)).join(""), { tone: "hi" }));
  out.push(D([at([RULER.x + 3, RULER.y + 2.6, top]), at([RULER.x + RULER.w - 3, RULER.y + 2.6, top])], { size: 0.45 }));
  return out.join("");
}
// the printed scale on the bench's front face: majors run from the top edge down, numerals under them
function frontScale() {
  const face = PLATE.y + PLATE.d, out = [];
  out.push(L([0, 20, 40, 60].map((cm) => k.segment([C.XC0 + cm * C.U, face, 0], [C.XC0 + cm * C.U, face, -3], P)).join(""), { tone: "hi" }));
  for (const cm of [0, 20, 40, 60]) out.push(k.faceTextSvg(k.sideMatrix([C.XC0 + cm * C.U, face], -3.9, P, "left"), cm ? `+${cm}` : "0", { size: 3.6, tone: "hi", anchor: "middle" }).replace("<text", '<text dominant-baseline="hanging"'));
  out.push(k.faceTextSvg(k.sideMatrix([C.XC0 + 60 * C.U + 9, face], -3.9, P, "left"), "cm", { size: 3, tone: "mid", anchor: "start" }).replace("<text", '<text dominant-baseline="hanging"'));
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of RAIL_Y) {
    out.push(S(k.slabOf({ x: RAIL_X0, y: y - 2.5, w: RAIL_X1 - RAIL_X0, d: 5, r: 1 }, 0, 4, P, 3, 0.4), { tone: "mid" }));
    out.push(D([20, 60, 100, 140, 180].map((x) => at([x, y, 4])), { size: 0.4 }));
  }
  out.push(endStop(RAIL_X0 - 6));
  return out.join("");
}
function endStop(x) {
  return S(k.slabOf({ x, y: -24, w: 6, d: 48, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }) + D([at([x + 3, -19, 8]), at([x + 3, 19, 8])], { size: 0.45 });
}

function level() {
  // a spirit level set into the bench: body, glass vial in a window, centred bubble
  const out = [S(k.slabOf(LEVEL, 0, 3.4, P, 4, 0.5), { tone: "mid" })];
  const win = { x: LEVEL.x + 6, y: LEVEL.y + 3, w: LEVEL.w - 12, d: LEVEL.d - 6, r: 2.5 };
  out.push(L(k.planOutline(win, 3.4, P, 4), { tone: "lo" }));
  out.push(S(k.slabOf(k.insetPlan(win, 0.9), 3.4, 0.5, P, 4), { tone: "hi", lit: true, crease: "none" }));
  const cx = LEVEL.x + LEVEL.w / 2, cy = LEVEL.y + LEVEL.d / 2;
  out.push(L(k.lineOnTop([cx - 4, win.y + 0.9], [cx - 4, win.y + win.d - 0.9], 3.9, P) + k.lineOnTop([cx + 4, win.y + 0.9], [cx + 4, win.y + win.d - 0.9], 3.9, P), { tone: "mid" }));
  out.push(L(k.ring(cx, cy, 2.2, 3.9, P, 24), { tone: "hi" }));
  out.push(D([at([LEVEL.x + 3, cy, 3.4]), at([LEVEL.x + LEVEL.w - 3, cy, 3.4])], { size: 0.45 }));
  return out.join("");
}

function label() {
  const out = [S(k.slabOf(LABEL, 0, 0.8, P, 4), { tone: "lo" })];
  out.push(L(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P), { tone: "faint" }));
  const rule = (y, w) => L(k.lineOnTop([LABEL.x + 5, y], [LABEL.x + 5 + w, y], 0.8, P), { tone: "lo", free: true });
  out.push(rule(LABEL.y + 5, 18), rule(LABEL.y + 8.5, 13), rule(LABEL.y + 12, 16));
  out.push(D([at([LABEL.x + LABEL.w - 3.4, LABEL.y + 3.4, 0.8]), at([LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d - 3.4, 0.8])], { size: 0.45 }));
  return out.join("");
}

/* ---------- load cell with a dial on its front face ---------- */
function loadCell() {
  const out = [];
  out.push(S(k.slabOf(FLANGE, 0, 3, P, 6, 0.6), { tone: "mid" }));
  out.push(k.corners(FLANGE, 3.6).map(([x, y]) => D([at([x, y, 3])], { size: 0.5 })).join(""));
  const top = HOUSING_TOP;
  out.push(S(k.slabOf(HOUSING, 3, top - 3, P, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(HOUSING, 8, P, 6) + k.sideSeam(HOUSING, top - 5, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(HOUSING, 2.8), top, P, 6), { tone: "faint" }));
  out.push(screw(HOUSING.x + 6, HOUSING.y + 6, top, 1.7), screw(HOUSING.x + 6, HOUSING.y + HOUSING.d - 6, top, 1.7), screw(HOUSING.x + HOUSING.w - 6, HOUSING.y + 6, top, 1.7));
  // zero-adjust knob on the lid
  const kn = [HOUSING.x + HOUSING.w - 9, HOUSING.y + HOUSING.d - 9];
  out.push(S(k.cylinder(kn[0], kn[1], 4.2, top, 4, P, 28, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(kn[0], kn[1], 4.2, top, top + 4, 26, P, 0.5), { tone: "lo" }));
  out.push(L(k.lineOnTop([kn[0] - 2.6, kn[1] + 2.6], [kn[0] + 2.6, kn[1] - 2.6], top + 4, P), { tone: "hi" }));
  // the dial, turned along +y out of the front face: bezel ring, white face, scale 0–8 kg
  const [x, y, z] = C.DIAL, R = C.DIAL_R, face0 = HOUSING.y + HOUSING.d;
  const F = G.frameOf([x, face0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 1.2, R + 3.6, F, P), { tone: "mid" }));
  out.push(S(G.ringBand(1.2, y - face0 + 1, R, R + 2.4, F, P), { tone: "mid" }));
  out.push(fadedRibs(F, 1.4, y - face0 + 0.8, R + 2.4, 72));
  out.push(S(G.disc(1.2, y - face0, R, F, P), { tone: "hi", lit: true }));
  const fy = y + 0.05, pt = (a, r) => [x + Math.sin(a) * r, fy, z + Math.cos(a) * r];
  out.push(`<path class="tb-face" d="${G.circleOf(G.frameOf([x, fy, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, R - 0.5, P, 96)}"/>`);
  const tick = (count, every, lengths) => {
    const minor = [], major = [];
    for (let i = 0; i <= count; i++) {
      const a = C.FROM + (i / count) * C.SPAN, big = i % every === 0, r1 = R - 1.6, r0 = r1 - (big ? lengths[1] : lengths[0]);
      (big ? major : minor).push(k.segment(pt(a, r0), pt(a, r1), P));
    }
    return { minor: minor.join(""), major: major.join("") };
  };
  out.push(L(G.circleOf(G.frameOf([x, fy, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, R - 1.6, P, 96), { tone: "lo" }));
  const t = tick(40, 5, [1.3, 2.8]);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "hi" }));
  for (const kg of [0, 2, 4, 6, 8]) {
    const a = C.FROM + (kg / C.KGMAX) * C.SPAN, p = pt(a, R - 8.2);
    out.push(k.faceTextSvg(k.sideMatrix([p[0], fy], p[2] - 1.25, P, "left"), String(kg), { size: 3.6, tone: "hi", anchor: "middle" }));
  }
  out.push(k.faceTextSvg(k.sideMatrix([x, fy], z - 6.2, P, "left"), "kg", { size: 2.8, tone: "mid", anchor: "middle" }));
  return out.join("");
}
function fadedRibs(F, s0, s1, r, count) {
  return k.fadedSvg(G.ribsOf(F, s0, s1, r, count, P, { fade: [0.1, 0.55] }), { tone: "lo" });
}
function dialHub() {
  const [x, y, z] = C.DIAL;
  const F = G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  return S(G.sphereOf([x, y + 0.6, z], 1.8, P), { tone: "hi" }) + D([at([x, y + 2.2, z])], { size: 0.55, tone: "red" });
}

/* ---------- shaft from the load cell to the anchor jaw ---------- */
function shaft() {
  const F = G.frameAlong([HOUSING.x + HOUSING.w, 0, C.ZB], [1, 0, 0]);
  const out = [];
  out.push(S(G.disc(0, 3, 5.2, F, P), { tone: "mid", inner: L(G.circleOf(F, 3, 3.2, P, 40), { tone: "faint" }) }));
  out.push(S(G.disc(3, C.XA - 8 - (HOUSING.x + HOUSING.w), 2.3, F, P), { tone: "mid", crease: "none" }));
  return out.join("");
}
function jaw(x0, y0, w, d, zTop, screws) {
  const lo = { x: x0, y: y0, w, d, r: 1.4 };
  const out = [];
  out.push(S(k.slabOf(lo, C.ZB - 7, 7 - C.BT / 2, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf(lo, C.ZB + C.BT / 2, zTop - C.ZB - C.BT / 2, P, 3, 0.4), { tone: "hi", crease: "lo" }));
  for (const [sx, sy] of screws) {
    out.push(S(k.cylinder(sx, sy, 2.1, zTop, 1.3, P, 20), { tone: "mid" }));
    out.push(L(k.lineOnTop([sx - 1.6, sy], [sx + 1.6, sy], zTop + 1.3, P), { tone: "lo" }));
  }
  return out.join("");
}
function anchorJaw() {
  return jaw(C.XA - 8, -16, 8, 32, C.ZB + 7, [[C.XA - 4, -9.5], [C.XA - 4, 9.5]]);
}

/* ---------- colour samples (levels −2 … +5) ---------- */
function rack() {
  const out = [S(k.slabOf(RACK, 0, TILE_Z, P, 4, 0.4), { tone: "mid" })];
  COLORS.forEach((_, i) => out.push(L(k.planOutline(k.insetPlan(TILE(i), -0.5), TILE_Z, P, 3), { tone: "faint" })));
  out.push(D([at([RACK.x + 2.2, RACK.y + RACK.d / 2, TILE_Z]), at([RACK.x + RACK.w - 2.2, RACK.y + RACK.d / 2, TILE_Z])], { size: 0.45 }));
  COLORS.forEach((c, i) => out.push(`<g class="tb-tile" data-tile="${c}">${paint(k.slabOf(TILE(i), TILE_Z, TILE_H, P, 3, 0.3), HEX[c])}</g>`));
  return out.join("");
}

/* ---------- carriage ---------- */
function carriage() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 3), 2, 0.1, P)}" style="filter:blur(5px)"/>`];
  const bush = byDepth([[2, -22.5], [24, -22.5], [2, 13.5], [24, 13.5]]);
  for (const [x, y] of bush) {
    const plan = { x, y, w: 10, d: 9, r: 1.2 };
    out.push(S(k.slabOf(plan, 2, CAR_Z - 2, P, 3, 0.3), { tone: "mid" }));
  }
  out.push(S(k.slabOf(CAR, CAR_Z, CAR_TOP - CAR_Z, P, 5, 0.6), { tone: "mid", inner: L(k.sideSeam(CAR, CAR_Z + 1.6, P, 5), { tone: "faint" }) }));
  out.push(D([7, 15, 21, 29].map((x) => at([x, CAR.y + CAR.d - 2.4, CAR_TOP])), { size: 0.4, tone: "lo" }));
  out.push(L(k.lineOnTop([12, CAR.y], [12, CAR.y + CAR.d], CAR_TOP, P), { tone: "faint" }));
  // index bracket that reaches down to the ruler; its hairline marks the jaw face = stretch in cm
  out.push(S(k.slabOf({ x: -2, y: CAR.y + CAR.d - 1, w: 4, d: 22, r: 0.8 }, CAR_TOP - 1.6, 1.6, P, 2), { tone: "mid" }));
  const FOOT_Z = RULER_H + 0.4;
  out.push(S(k.slabOf({ x: -2, y: 43.6, w: 4, d: 2.4, r: 0.5 }, FOOT_Z + 0.6, CAR_TOP - 1.6 - FOOT_Z - 0.6, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: -3, y: 43.6, w: 6, d: 12, r: 0.8 }, FOOT_Z, 0.6, P, 2), { tone: "hi", lit: true }));
  out.push(L(k.lineOnTop([0, 44], [0, 55.2], FOOT_Z + 0.6, P), { tone: "red" }));
  // jaw that grips the band
  out.push(jaw(0, -16, 10, 32, C.ZB + 7, [[5, -9.5], [5, 9.5]]));
  // handle: collar, post, knurled grip with a top ring (◎)
  const [gx, gy] = GRIP;
  out.push(S(k.cylinder(gx, gy, 5.2, CAR_TOP, 3, P, 28, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(gx, gy, 2.4, CAR_TOP + 3, GRIP_Z - CAR_TOP - 3, P, 20), { tone: "mid", crease: "none", inner: L(k.sideArc(gx, gy, 2.4, 30, P, 12), { tone: "faint" }) }));
  out.push(paint(k.cylinder(gx, gy, GRIP_R, GRIP_Z, GRIP_TOP - GRIP_Z, P, 40, 0.5), "var(--tbf-blue)"));
  out.push(`<g class="tb-knurl">${L(k.knurl(gx, gy, GRIP_R, GRIP_Z, GRIP_TOP, 30, P, 0.6), { tone: "lo" })}</g>`);
  out.push(L(k.ring(gx, gy, 4.4, GRIP_TOP, P, 40), { tone: "hi" }));
  out.push(D([at([gx, gy, GRIP_TOP])], { size: 0.8, tone: "hi" }));
  // generous invisible hit area around the grip and post
  const [hx, hy] = at([gx, gy, (GRIP_TOP + CAR_TOP) / 2]);
  out.push(`<ellipse class="tb-hit" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="${(k.screenRise(40, P)).toFixed(1)}" ry="${(k.screenRise(44, P)).toFixed(1)}"/>`);
  return out.join("");
}

/* ---------- dynamic parts: empty shells the live code fills (same functions as dyn.mjs) ---------- */
const solidShell = (cls, extra = "") => `<g class="iso-solid ${cls}"${extra}><path class="iso-fill"/><path class="iso-shade" data-shade="0"/><path class="iso-shade" data-shade="1"/><path class="iso-shade" data-shade="2"/><path class="iso-shade" data-shade="3"/><path class="iso-top"/><path class="iso-line iso-crease" data-tone="faint"/><path class="iso-line iso-edge" data-tone="hi"/></g>`;

function figure({ cm = 0, color = "red", kg = 0 } = {}) {
  const startX = C.XC0 + cm * C.U;
  const body = [
    base(),
    frontScale(),
    rails(),
    `<g data-part="arrow">${solidShell("tb-paint", ' style="--tb-c:var(--tbf-red)"')}</g>`,
    ruler(),
    loadCell(),
    `<path data-part="needle" class="iso-line" data-tone="red" data-free="start" d=""/>`,
    dialHub(),
    rack(),
    level(),
    shaft(),
    anchorJaw(),
    `<g data-part="band" style="--tb-c:${HEX[color]}">${solidShell("tb-paint")}<path class="tb-mark" data-part="marks"/></g>`,
    `<g data-part="carriage" data-drag transform="${k.translateAlong(P, [startX, 0, 0])}">${carriage()}</g>`,
    endStop(RAIL_X1),
    label(),
  ];
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "セラバンドの張力テスト台。左の荷重計(目盛り0〜8kg)にバンドの一端を固定し、右の把手つきの台車をレールに沿って引くとバンドが伸びる。前のものさしが伸ばした長さ(自然長〜+60cm)、針と床の赤い矢印が手にかかる抵抗を示す。",
    body,
  });
}

/* ---------- runtime kit: the few kit functions the browser needs, tree-shaken from iso-kit.mjs ---------- */
function runtimeKit(roots) {
  const src = readFileSync(KIT_SRC, "utf8");
  const stop = src.indexOf("export const ISO_CSS");
  const lines = src.slice(0, stop).split("\n");
  const chunks = [];
  for (const line of lines) {
    const m = line.match(/^(?:export )?(?:function|const) (\w+)/);
    if (m) chunks.push({ name: m[1], text: line.replace(/^export /, "") + "\n" });
    else if (chunks.length) chunks[chunks.length - 1].text += line + "\n";
  }
  const names = new Map(chunks.map((c) => [c.name, c]));
  const need = new Set();
  const visit = (name) => {
    if (need.has(name) || !names.has(name)) return;
    need.add(name);
    const body = names.get(name).text;
    for (const other of names.keys()) if (other !== name && new RegExp(`\\b${other}\\b`).test(body)) visit(other);
  };
  roots.forEach(visit);
  return chunks.filter((c) => need.has(c.name)).map((c) => c.text.split("\n").map((l) => l.trim()).filter(Boolean).join("\n")).join("\n");
}
const fnSource = (fn) => fn.toString().split("\n").map((l) => l.trim()).filter(Boolean).join("\n");

/* ---------- write the generated block ---------- */
const css = readFileSync(join(HERE, "style.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*\n\s*/g, "").trim();
const svg = figure();
const kitCode = runtimeKit(["extrude", "lineOnTop", "translateAlong", "axisVector", "iso"]);
const dynCode = [dyn.bandHalf, dyn.bandSolid, dyn.bandMarks, dyn.arrowSolid, dyn.needleD, dyn.screenOfCm].map(fnSource).join("\n");
const generated = `const TB=(function(){
${kitCode}
${dynCode}
const C=${JSON.stringify(C)};
const P=${JSON.stringify(P)};
return {C,P,extrude,lineOnTop,translateAlong,axisVector,iso,bandSolid,bandMarks,arrowSolid,needleD,screenOfCm,
css:${JSON.stringify(css)},
svg:${JSON.stringify(svg)}};
})();`;
if (/<\/script/i.test(generated)) throw new Error("generated code must not contain </script");
mkdirSync(join(HERE, "out"), { recursive: true });
writeFileSync(join(HERE, "out", "generated.js"), generated);
console.log(`generated.js  ${(generated.length / 1024).toFixed(1)} KB  (svg ${(svg.length / 1024).toFixed(1)} KB, kit ${(kitCode.length / 1024).toFixed(1)} KB, css ${(css.length / 1024).toFixed(1)} KB)`);
const solids = (svg.match(/class="iso-solid/g) || []).length, paths = (svg.match(/<path/g) || []).length;
console.log(`solids ${solids}, paths ${paths}`);

/* ---------- preview pages (lines.mjs + 4× crops outside the site's shadow DOM) ---------- */
const pv = process.argv.indexOf("--preview");
if (pv > 0) {
  const dir = process.argv[pv + 1];
  mkdirSync(dir, { recursive: true });
  const BD = { tan: [0.7, 1.0, 1.1], yellow: [0.9, 1.3, 1.6], red: [1.0, 1.4, 1.7], green: [1.3, 1.8, 2.2], blue: [1.7, 2.5, 3.0], black: [2.0, 2.9, 3.6], silver: [2.9, 4.3, 5.2], gold: [3.8, 5.7, 7.0] };
  const kgOf = (c, x) => { const v = BD[c]; x = Math.min(60, Math.max(0, x)); return x <= 20 ? (v[0] * x) / 20 : x <= 40 ? v[0] + ((v[1] - v[0]) * (x - 20)) / 20 : v[1] + ((v[2] - v[1]) * (x - 40)) / 20; };
  const poses = [["rest", 0, "red"], ["x30", 30, "red"], ["x60", 60, "red"], ["gold60", 60, "gold"]];
  for (const theme of ["light", "dark"]) {
    for (const [name, cm, color] of poses) {
      const kg = kgOf(color, cm);
      const fill = (svgText) => {
        const band = dyn.bandSolid(C, P, cm), arrow = dyn.arrowSolid(C, P, cm, kg);
        const shell = (s) => `<path class="iso-fill" d="${s.fill}"/>${s.shades.map((d, i) => `<path class="iso-shade" data-shade="${i}" d="${d}"/>`).join("")}<path class="iso-top" d="${s.top}"/><path class="iso-line iso-crease" data-tone="faint" d="${s.crease}"/><path class="iso-line iso-edge" data-tone="hi" d="${s.outline}"/>`;
        let out = svgText.replace(/(<g data-part="band"[^>]*>)<g class="iso-solid tb-paint">[\s\S]*?<\/g><path class="tb-mark" data-part="marks"\/>/, (_, open) => `${open.replace(/--tb-c:[^"]*/, `--tb-c:${HEX[color]}`)}<g class="iso-solid tb-paint">${shell(band)}</g><path class="tb-mark" data-part="marks" d="${dyn.bandMarks(C, P, cm)}"/>`);
        out = out.replace(/(<g data-part="arrow"><g class="iso-solid tb-paint"[^>]*>)[\s\S]*?(<\/g><\/g>)/, (_, a, b) => (kg < 0.05 ? `${a}${b}` : `${a}${shell(arrow)}${b}`));
        out = out.replace('data-free="start" d=""/>', `data-free="start" d="${dyn.needleD(C, P, kg)}"/>`);
        out = out.replace(/data-tile="(\w+)"/g, (m, c) => (c === color ? `${m} style="transform:translate(0px,${-k.screenRise(LIFT, P).toFixed(2)}px)"` : m));
        return out;
      };
      const svgPose = fill(figure({ cm, color, kg }));
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--surface-raised:${theme === "light" ? "#f7f1e3" : "#1b1b1b"};--rule:${theme === "light" ? "#141414" : "#efe6d3"};--m-surface:var(--surface-raised);--m-ink:var(--rule);--m-muted:${theme === "light" ? "#4d473d" : "#b3ab9b"};--bh-red:${theme === "light" ? "#d13a26" : "#ef5a42"};--bh-blue:${theme === "light" ? "#1d52b0" : "#5c8ff0"};--bh-yellow:#f2b51c;--font-display:Archivo,sans-serif;--font-num:Archivo,sans-serif}
body{margin:0;background:var(--surface-raised);font:14px/1.6 sans-serif}main{width:min(900px,100% - 24px);margin:24px auto}
${readFileSync(join(HERE, "style.css"), "utf8")}</style></head><body><main><figure class="tbf"${theme === "dark" ? ' data-tone="dark"' : ""}><div class="tbf-plate iso-plate">${svgPose}</div></figure></main></body></html>`;
      writeFileSync(join(dir, `${name}-${theme}.html`), html);
    }
  }
  console.log("previews in", dir);
}
