// Dynamic geometry of the theraband tension bench: the parts whose SHAPE changes with the model.
// These exact functions run twice: at build time (preview pages, the static first frame) and in the
// browser (their source is inlined into index.html by build.mjs), so the picture and the numbers can
// never drift apart. Keep them self-contained: they may only use their arguments and the kit names
// extrude / lineOnTop / iso, which the inlined runtime kit provides under the same names.
import { extrude, lineOnTop, iso } from "../../../.claude/skills/anatomy/kit/iso-kit.mjs";

// Half-width of the band at world x. Full width at both clamps; under stretch it necks in the middle
// (width ∝ √(L0 / L), the same rule the original figure used), easing back to full width at each jaw.
export function bandHalf(C, cm, x) {
  const s = cm * C.U, xc = C.XC0 + s, L = C.L0 + s;
  const wm = C.W0 * Math.sqrt(C.L0 / L);
  if (x >= xc) return C.W0 / 2;
  const t = Math.min(1, Math.max(0, (x - C.XA) / (xc - C.XA)));
  const bump = Math.pow(Math.sin(Math.PI * t), 0.55);
  return C.W0 / 2 - ((C.W0 - wm) / 2) * bump;
}

// The band as a thin waisted prism from the anchor jaw face (x = XA) into the carriage jaw (x = xc + JAW).
export function bandSolid(C, P, cm) {
  const s = cm * C.U, xc = C.XC0 + s, n = 30, near = [], far = [];
  for (let i = 0; i <= n; i++) {
    const x = C.XA + ((xc - C.XA) * i) / n, h = bandHalf(C, cm, x);
    near.push([x, h]);
    far.push([x, -h]);
  }
  near.push([xc + C.JAW, C.W0 / 2]);
  far.push([xc + C.JAW, -C.W0 / 2]);
  const ring = [...far, ...near.reverse()];
  return extrude(ring, C.ZB - C.BT / 2, C.BT, P, { convex: false });
}

// Printed marks across the band, every MARK units of REST length: they spread apart as the band stretches.
export function bandMarks(C, P, cm) {
  const s = cm * C.U, L = C.L0 + s, out = [];
  for (let m = C.MARK; m < C.L0 - 1e-6; m += C.MARK) {
    const x = C.XA + (m * L) / C.L0, h = bandHalf(C, cm, x) - 0.05;
    out.push(lineOnTop([x, -h], [x, h], C.ZB + C.BT / 2, P));
  }
  return out.join("");
}

// The resistance arrow lying on the bench: its tail sits at the carriage, it points back at the anchor,
// and its length is proportional to the force on the hand (ARROW_PER_KG world units per kg).
export function arrowSolid(C, P, cm, kg) {
  const tail = C.XC0 + cm * C.U - C.ARROW_GAP, y = C.ARROW_Y;
  const len = C.ARROW_MIN + kg * C.ARROW_PER_KG, head = Math.min(C.ARROW_HEAD, len);
  const neck = tail - len + head, tip = tail - len;
  const ring = [[tail, y - C.ARROW_W], [neck, y - C.ARROW_W], [neck, y - C.ARROW_HW], [tip, y], [neck, y + C.ARROW_HW], [neck, y + C.ARROW_W], [tail, y + C.ARROW_W]];
  return extrude(ring, 0, C.ARROW_T, P, { convex: false });
}

// Needle of the dial on the load cell's front face (a vertical plane facing +y): 0 kg at lower left,
// KGMAX at lower right, sweeping clockwise over the top as the reader sees it.
export function needleD(C, P, kg) {
  const share = Math.min(1.03, Math.max(-0.02, kg / C.KGMAX));
  const a = C.FROM + share * C.SPAN, sx = Math.sin(a), sz = Math.cos(a);
  const [x, y, z] = C.DIAL, yn = y + C.NEEDLE_Y;
  const p0 = iso([x - sx * C.NEEDLE_TAIL, yn, z - sz * C.NEEDLE_TAIL], P), p1 = iso([x + sx * C.NEEDLE_R, yn, z + sz * C.NEEDLE_R], P);
  return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
}

// Screen position of world x on the band line, and the screen vector of one centimetre of stretch,
// used to turn a pointer drag into centimetres.
export function screenOfCm(C, P, cm) {
  return iso([C.XC0 + cm * C.U, 0, C.ZB], P);
}
