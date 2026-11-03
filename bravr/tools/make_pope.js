// Builds bravr/pope.glb: Pope John Paul II, the secret boss, as a low-poly figure skinned to robot.glb's
// skeleton (same nodes, bind pose and inverse bind matrices), so the game drives, curls and tears him like the robot.
// Run: npm i three@0.128.0 in any folder, then  NODE_PATH=<folder>/node_modules node bravr/tools/make_pope.js
// Units below are robot mesh units x 1000 ("U", about 1.16 cm in the game); Z is up, the face looks down -Y,
// +X is his left.
const fs = require('fs'), path = require('path'), THREE = require('three');
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const OUT = path.join(__dirname, '..', 'pope.glb');

/* ---------- robot skeleton ---------- */
const SRC = fs.readFileSync(path.join(__dirname, '..', 'robot.glb'));
const JLEN = SRC.readUInt32LE(12), J = JSON.parse(SRC.slice(20, 20 + JLEN).toString()), BIN = SRC.slice(28 + JLEN);
const SKIN = J.skins[0], JOINTS = SKIN.joints.map(i => J.nodes[i].name);
const IBM = (() => { const a = J.accessors[SKIN.inverseBindMatrices], v = J.bufferViews[a.bufferView], o = (v.byteOffset || 0) + (a.byteOffset || 0);
  return BIN.slice(o, o + a.count * 64); })();
// B[name] = {p: head, t: tail, y: bone axis} in U
const B = {};
SKIN.joints.forEach((ni, k) => {
  const m = new THREE.Matrix4().fromArray(Array.from({length:16}, (_, i) => IBM.readFloatLE((k * 16 + i) * 4))).invert();
  const node = J.nodes[ni], kid = (node.children || []).map(c => J.nodes[c])[0];
  const p = V(0, 0, 0).applyMatrix4(m).multiplyScalar(1000);
  const t = kid ? V(...kid.translation).applyMatrix4(m).multiplyScalar(1000) : p.clone();
  B[node.name] = {p, t, y:t.clone().sub(p).normalize()};
});
// bone heads are joint positions; a bone's tail is its first child's head
for (const n in B){ const kid = (J.nodes[SKIN.joints[JOINTS.indexOf(n)]].children || []).map(c => J.nodes[c].name).find(c => B[c]); if (kid){ B[n].t = B[kid].p.clone(); B[n].y = B[n].t.clone().sub(B[n].p).normalize(); } }

/* ---------- materials (linear output, so these are the colours you see) ---------- */
const MATS = {
  Cassock:{c:[0.93, 0.91, 0.86], m:0, r:0.85},
  Face:{c:[1, 1, 1], m:0, r:0.75, tex:'popeface.jpg'},   // make_popeface.py
  Skin:{c:[0.792, 0.522, 0.392], m:0, r:0.75},            // the photo's cheeks, which make_popeface.py prints
  Hair:{c:[0.74, 0.73, 0.71], m:0, r:0.95},
  Gold:{c:[1.0, 0.76, 0.22], m:0.3, r:0.35},   // the game has no environment map, so real metal would render brown
  Shoes:{c:[0.36, 0.09, 0.08], m:0.1, r:0.45},
};

/* ---------- geometry helpers ---------- */
const parts = [];
// w(p) → {bone: weight}; smooth keeps shared normals (skin), everything else is faceted like the rest of the game;
// uv(p, triangle centre) → [u, v] for textured parts
function add(g, mat, w, smoothShade = false, uv = null){ fixWinding(g); parts.push({g, mat, w, smoothShade, uv}); return g; }
// turn a part inside out if its triangles enclose a negative volume (lofts built top-down)
function fixWinding(g){
  const p = g.attributes.position, idx = g.index;
  const c = V(0, 0, 0); for (let i = 0; i < p.count; i++) c.add(V(p.getX(i), p.getY(i), p.getZ(i))); c.divideScalar(p.count);
  let vol = 0; const a = V(), b = V(), d = V();
  for (let t = 0; t < idx.count; t += 3){
    a.fromBufferAttribute(p, idx.getX(t)).sub(c); b.fromBufferAttribute(p, idx.getX(t + 1)).sub(c); d.fromBufferAttribute(p, idx.getX(t + 2)).sub(c);
    vol += a.dot(b.cross(d));
  }
  if (vol < 0) for (let t = 0; t < idx.count; t += 3){ const x = idx.getX(t + 1); idx.setX(t + 1, idx.getX(t + 2)); idx.setX(t + 2, x); }
}
function mesh(pos, idx){ const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g; }
// rings of ellipses round a vertical axis: {z, rx, ry, cx, cy}; angle 0 is the front (-Y), growing towards +X
function loft(rings, n, capLo = true, capHi = true, shape){
  const pos = [], idx = [];
  rings.forEach(r => { for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, k = shape ? shape(a, r) : 1;
    pos.push((r.cx || 0) + Math.sin(a) * r.rx * k, (r.cy || 0) - Math.cos(a) * r.ry * k, r.z); } });
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < n; i++){
    const a = j * n + i, b = j * n + (i + 1) % n, c = a + n, d = b + n; idx.push(a, b, d, a, d, c);
  }
  const cap = (j, flip) => { const r = rings[j], ci = pos.length / 3; pos.push(r.cx || 0, r.cy || 0, r.z);
    for (let i = 0; i < n; i++){ const a = j * n + i, b = j * n + (i + 1) % n; flip ? idx.push(ci, b, a) : idx.push(ci, a, b); } };
  if (capLo) cap(0, true); if (capHi) cap(rings.length - 1, false);
  return mesh(pos, idx);
}
// tube through points with radii (number, or [ra, rb] for an ellipse whose ra axis lies along `up` × tangent)
function tube(pts, radii, n = 8, caps = true, up = V(0, 0, 1), phase = 0){
  const pos = [], idx = [], T = pts.map((p, i) => pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize());
  let N = Math.abs(T[0].dot(up)) > 0.9 ? V(0, -1, 0) : up.clone();
  pts.forEach((p, j) => {
    N = N.clone().sub(T[j].clone().multiplyScalar(N.dot(T[j]))).normalize();
    const Bn = T[j].clone().cross(N), r = radii[j], ra = Array.isArray(r) ? r[0] : r, rb = Array.isArray(r) ? r[1] : r;
    for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2 + phase; const q = p.clone().addScaledVector(Bn, Math.cos(a) * ra).addScaledVector(N, Math.sin(a) * rb); pos.push(q.x, q.y, q.z); }
  });
  for (let j = 0; j < pts.length - 1; j++) for (let i = 0; i < n; i++){ const a = j * n + i, b = j * n + (i + 1) % n; idx.push(a, b + n, b, a, a + n, b + n); }
  if (caps) [[0, -1], [pts.length - 1, 1]].forEach(([j, s]) => { const ci = pos.length / 3, c = pts[j].clone().addScaledVector(T[j], s * (phase ? 0 : 0.3) * (Array.isArray(radii[j]) ? radii[j][0] : radii[j]));
    pos.push(c.x, c.y, c.z); for (let i = 0; i < n; i++) s < 0 ? idx.push(ci, j * n + i, j * n + (i + 1) % n) : idx.push(ci, j * n + (i + 1) % n, j * n + i); });
  return mesh(pos, idx);
}
// a flat bar: half-width w across (up × direction), half-thickness th along `up`
const bar = (pts, w, th, up) => tube(pts, pts.map(() => [w * Math.SQRT2, th * Math.SQRT2]), 4, true, up, Math.PI / 4);
// a unit sphere (Z up) pushed through f(unit dir) → point; keep(dir) drops triangles (shells, caps)
function blob(f, ws = 12, hs = 8, keep){
  const s = new THREE.SphereGeometry(1, ws, hs).toNonIndexed(), p = s.attributes.position, pos = [];
  for (let t = 0; t < p.count; t += 3){
    const d = [0, 1, 2].map(k => V(p.getX(t + k), -p.getZ(t + k), p.getY(t + k)));
    if (keep && !keep(d[0].clone().add(d[1]).add(d[2]).normalize())) continue;
    d.forEach(u => { const q = f(u.clone().normalize()); pos.push(q.x, q.y, q.z); });
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return weld(g);
}
// merge coincident vertices so smooth normals and index-based code work
function weld(g){
  const p = g.attributes.position, map = new Map(), pos = [], idx = [];
  for (let i = 0; i < p.count; i++){
    const k = [p.getX(i), p.getY(i), p.getZ(i)].map(v => v.toFixed(4)).join();
    if (!map.has(k)){ map.set(k, pos.length / 3); pos.push(p.getX(i), p.getY(i), p.getZ(i)); }
    idx.push(map.get(k));
  }
  return mesh(pos, idx);
}
const ell = (c, r, ws, hs, rot) => blob(u => { const q = V(u.x * r.x, u.y * r.y, u.z * r.z); if (rot) q.applyEuler(rot); return q.add(c); }, ws, hs);
// front surface of a geometry: smallest y hit by a ray along +Y at (x, z)
function frontY(g, x, z){
  const p = g.attributes.position, idx = g.index, ray = new THREE.Ray(V(x, -200, z), V(0, 1, 0)), a = V(), b = V(), c = V(), hit = V();
  let best = Infinity;
  for (let t = 0; t < idx.count; t += 3){
    a.fromBufferAttribute(p, idx.getX(t)); b.fromBufferAttribute(p, idx.getX(t + 1)); c.fromBufferAttribute(p, idx.getX(t + 2));
    if (ray.intersectTriangle(a, b, c, false, hit)) best = Math.min(best, hit.y);
  }
  return best;
}
const lerpV = (a, b, t) => a.clone().lerp(b, t);

/* ---------- weights ---------- */
const one = n => () => ({[n]:1});
const side = p => p.x >= 0 ? 'L' : 'R';
// trunk: chest above the sash, hips below, blended through the waist
const trunkW = p => { const u = smooth(77, 87, p.z); return {'spine.003':u, 'spine.002':1 - u}; };
// skirt: the hips hold its shape, the legs swing it; the front and back centre follow both legs
function skirtW(p){
  const t = clamp((76 - p.z) / 70), hip = 1 - 0.65 * smooth(0, 0.45, t), leg = 1 - hip;
  const sL = smooth(-5, 5, p.x), knee = smooth(38, 52, p.z), w = {'spine.002':hip};
  [['L', sL], ['R', 1 - sL]].forEach(([S, s]) => { w['thigh.' + S] = leg * s * knee; w['shin.' + S] = leg * s * (1 - knee); });
  return w;
}
// sleeve: upper arm to the elbow, forearm past it, with a little of the chest at the shoulder seam
function sleeveW(S){
  const sh = B['upper_arm.' + S].p, el = B['forearm.' + S].p, wr = B['hand.' + S].p;
  const axis = B['upper_arm.' + S].y.clone().add(B['forearm.' + S].y).normalize();
  return p => {
    const f = smooth(-1.8, 1.8, p.clone().sub(el).dot(axis)), ch = 0.35 * (1 - smooth(0, 3, p.clone().sub(sh).dot(B['upper_arm.' + S].y)));
    return {['upper_arm.' + S]:(1 - f) * (1 - ch), ['forearm.' + S]:f, 'spine.003':(1 - f) * ch};
  };
}

/* ---------- head ---------- */
const HC = V(0, -0.6, 115.1);
// an egg shaped to the photo's face: flat front, high forehead, tucked chin
function headPt(u, k = 1){
  const front = clamp(-u.y), low = clamp(-u.z);
  let x = u.x * 4.75, y = u.y * 5.9, z = u.z * 7.4;
  if (u.y < 0) y *= 1 - 0.16 * front;                 // flatter face
  if (u.z < -0.55) z = -0.55 * 7.4 + (z + 0.55 * 7.4) * 0.7; // shorter, rounder chin
  if (u.y > 0 && u.z < 0) y *= 1 - 0.25 * low;        // nape tucks into the neck
  return V(x * k, y * k, z * k).add(HC);
}
// the photo (bravr/popehead.png, 699 x 864) is projected straight onto the front of the head: his eyes (pixel row
// 395) at z 115.7, the chin (855) at the bottom of the head, 65.7 px per U down and 54 across (a little wider than
// the photo, which is narrower than a head); the face leans in the photo, so its centre slides left down the jaw.
// Triangles facing away from the front take a corner of the texture, which is plain skin.
const faceUV = (p, c) => {
  if (c.clone().sub(HC).normalize().y > -0.15) return [0.01, 0.01];
  const py = 395 - (p.z - 115.7) * 65.7, cx = Math.max(316, 368 - 0.2 * Math.max(0, py - 395));
  return [clamp((cx + p.x * 54) / 699), clamp(py / 864)];
};
add(blob(u => headPt(u), 32, 24), 'Face', one('head'), true, faceUV);
// hair: grey-white round the sides and back (the photo has the temples); the crown is under the zucchetto
add(blob(u => headPt(u, 1.045), 28, 20, u => { const el = Math.asin(u.z), az = Math.atan2(u.x, -u.y), a = Math.abs(az);
  return el < 0.95 && el > -0.35 + 0.3 * clamp((2.0 - a) / 1.0) && a > 1.35 - 0.2 * clamp(el / 0.6); }), 'Hair', one('head'));
// zucchetto: a white skullcap on the crown, set a little towards the back, with a rolled rim and its stem
const ZA = V(0, Math.sin(0.2), Math.cos(0.2)), ZC = 0.6;
add(blob(u => headPt(u, 1.06), 32, 24, u => u.dot(ZA) > ZC), 'Cassock', one('head'));
{ const e1 = V(1, 0, 0), e2 = ZA.clone().cross(e1), s = Math.sqrt(1 - ZC * ZC);
  const rim = Array.from({length:29}, (_, i) => { const a = i / 28 * Math.PI * 2;
    return headPt(ZA.clone().multiplyScalar(ZC).addScaledVector(e1, Math.cos(a) * s).addScaledVector(e2, Math.sin(a) * s).normalize(), 1.055); });
  add(tube(rim, rim.map(() => 0.3), 6, false), 'Cassock', one('head')); }
const crown = headPt(ZA, 1.06);
add(tube([crown.clone().addScaledVector(ZA, -0.1), crown.clone().addScaledVector(ZA, 0.55)], [0.32, 0.26], 6), 'Cassock', one('head'));
// ears, level with the photo's (it shows them only edge-on)
['L', 'R'].forEach(S => { const s = S === 'L' ? 1 : -1;
  add(ell(V(s * 4.85, 0.3, 115.3), V(0.55, 1.3, 2.0), 10, 8, new THREE.Euler(0, -s * 0.15, 0)), 'Skin', one('head'), true); });

/* ---------- neck, trunk, cape, sash ---------- */
add(tube([V(0, -0.9, 104.0), V(0, -0.9, 108.5), V(0, -0.3, 111.5)], [3.15, 3.15, 3.0], 12), 'Skin', one('neck'), true);
// standing collar of the cassock
add(loft([{z:104.3, rx:3.9, ry:3.85, cy:-0.9}, {z:108.6, rx:3.8, ry:3.7, cy:-0.9}], 16, false, false), 'Cassock', one('spine.003'));
const torso = add(loft([
  {z:70, rx:10.4, ry:7.8, cy:0.6}, {z:76, rx:10.6, ry:8.1, cy:0.4}, {z:84, rx:11.0, ry:8.4, cy:0.1}, {z:92, rx:11.6, ry:7.9, cy:0.4},
  {z:100, rx:12.2, ry:7.2, cy:0.9}, {z:104, rx:12.8, ry:6.4, cy:1.0}, {z:106.3, rx:9.0, ry:5.2, cy:0.4}, {z:107.2, rx:4.2, ry:4.0, cy:-0.6}
], 20), 'Cassock', trunkW);
// pellegrina: the short shoulder cape, flared over the upper arms; its sides swing with the arms
// (rounded over the shoulders: the profile is a quarter ellipse from the collar to the hem)
const capeRings = [[0, 3.95, 3.9], [0.08, 8.2, 5.9], [0.2, 12.6, 7.6], [0.36, 15.8, 8.9], [0.55, 18.2, 9.9], [0.75, 19.6, 10.5], [1, 20.4, 10.9]]
  .map(([t, rx, ry]) => ({z:108.2 - 16.7 * Math.pow(t, 1.7), rx, ry, cy:-0.8 + 2.5 * Math.min(1, t * 2.5)}));
const capeW = p => { const a = 0.75 * smooth(10, 18, Math.abs(p.x)) * smooth(104, 93, p.z), S = side(p);
  return {'spine.003':1 - a, ['upper_arm.' + S]:a}; };
const cape = add(loft(capeRings.concat([{z:91.5, rx:19.8, ry:10.3, cy:1.7}, {z:94, rx:19.2, ry:10.0, cy:1.7}]), 40, false, false), 'Cassock', capeW);
// sash (fascia) at the waist, its two fringed ends hanging on his left hip
add(loft([{z:73.4, rx:11.0, ry:8.5, cy:0.5}, {z:73.9, rx:11.6, ry:9.0, cy:0.5}, {z:78.6, rx:11.7, ry:8.9, cy:0.4}, {z:79.1, rx:11.0, ry:8.4, cy:0.4}], 24), 'Cassock', one('spine.002'));
{ const sashW = p => { const t = smooth(74, 52, p.z) * 0.45; return {'spine.002':1 - t, 'thigh.L':t}; };
  [[0.62, 51.5, 0], [0.92, 54.0, 0.6]].forEach(([ang, bottom, dy]) => {
    const dir = V(Math.sin(ang), -Math.cos(ang), 0), across = V(Math.cos(ang), Math.sin(ang), 0);
    const at = z => { const rx = 11.9 + (76 - z) * 0.045, ry = 9.2 + (76 - z) * 0.035; return V(Math.sin(ang) * rx, 0.5 - Math.cos(ang) * ry - dy, z); };
    const strip = (z0, z1, w, th, mat) => add(bar([z0, (z0 + z1) / 2, z1].map(at), w, th, dir), mat, sashW);
    strip(77.5, bottom + 1.6, 1.85, 0.32, 'Cassock');
    strip(bottom + 1.6, bottom, 1.95, 0.36, 'Gold');                      // fringe
  }); }
// skirt down to the ankles; the hem shows the toes of the shoes
const skirt = add(loft([{z:76, rx:10.9, ry:8.3, cy:0.4}, {z:66, rx:12.4, ry:9.0, cy:0.6}, {z:45, rx:13.8, ry:9.5, cy:0.9},
  {z:22, rx:14.9, ry:9.7, cy:1.2}, {z:6.0, rx:15.5, ry:9.5, cy:1.5}, {z:6.0, rx:14.6, ry:8.7, cy:1.5}, {z:8.5, rx:14.2, ry:8.4, cy:1.5}], 28, false, true), 'Cassock', skirtW);
// buttons down the front, from the cape's hem to the skirt's, skipping the sash
for (let z = 89; z > 9; z -= 3.3){
  if (z > 72.5 && z < 80) continue;
  add(ell(V(0, frontY(z > 79 ? torso : skirt, 0, z) + 0.05, z), V(0.48, 0.38, 0.48), 6, 4), 'Cassock', z > 79 ? trunkW : skirtW);
}
// pectoral cross on its chain, over the cape
{ const cz = 95.5, top = cz + 4.6, yc = Math.min(...[cz - 4, cz, top].map(z => frontY(cape, 0, z))) - 0.75;
  add(bar([V(0, yc, cz - 4.3), V(0, yc, top)], 0.62, 0.36, V(0, 1, 0)), 'Gold', one('spine.003'));
  add(bar([V(-2.7, yc, cz + 1.6), V(2.7, yc, cz + 1.6)], 0.62, 0.36, V(0, 1, 0)), 'Gold', one('spine.003'));
  add(tube([V(0, yc, top + 0.15), V(0, yc, top + 1.0)], [0.34, 0.34], 6), 'Gold', one('spine.003'));
  ['L', 'R'].forEach(S => { const s = S === 'L' ? 1 : -1;
    const pts = [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => { const x = s * 3.9 * (1 - t) + s * 0.25 * t, z = 106.2 * (1 - t) + (top + 0.9) * t; return V(x, Math.min(frontY(cape, x, z) - 0.2, t > 0.9 ? yc : 0), z); });
    add(tube(pts, pts.map(() => 0.2), 5, false), 'Gold', one('spine.003')); }); }

/* ---------- arms and hands ---------- */
['L', 'R'].forEach(S => {
  const sh = B['upper_arm.' + S].p, el = B['forearm.' + S].p, wr = B['hand.' + S].p, fa = B['forearm.' + S].y;
  const inset = sh.clone().addScaledVector(B['upper_arm.' + S].y, 2.5);   // starts under the cape
  add(tube([inset, lerpV(inset, el, 0.5), el, lerpV(el, wr, 0.55), wr.clone().addScaledVector(fa, -1.6)], [2.5, 3.0, 2.75, 2.6, 2.75], 12), 'Cassock', sleeveW(S));
  add(tube([wr.clone().addScaledVector(fa, -2.0), wr.clone().addScaledVector(fa, 0.15)], [3.05, 3.05], 12), 'Cassock', one('forearm.' + S));
  add(tube([wr.clone().addScaledVector(fa, -1.0), wr.clone().addScaledVector(B['hand.' + S].y, 0.9)], [1.45, 1.5], 8), 'Skin', one('hand.' + S), true);
  // palm: a slab from the wrist to the knuckles
  const i1 = B['f_index.01.' + S].p, p1 = B['f_pinky.01.' + S].p, across = p1.clone().sub(i1).normalize();
  const along = B['f_middle.01.' + S].p.clone().sub(wr).normalize(), nrm = along.clone().cross(across).normalize();
  const w0 = wr.clone().addScaledVector(along, 0.6), c = [
    w0.clone().addScaledVector(across, -1.4), w0.clone().addScaledVector(across, 1.4),
    i1.clone().addScaledVector(across, -0.55), p1.clone().addScaledVector(across, 0.55)];
  const slab = []; [-0.8, 0.8].forEach(o => c.forEach(q => slab.push(q.clone().addScaledVector(nrm, o))));
  const pos = slab.flatMap(q => [q.x, q.y, q.z]);
  add(mesh(pos, [0, 1, 3, 0, 3, 2, 4, 6, 7, 4, 7, 5, 0, 2, 6, 0, 6, 4, 1, 5, 7, 1, 7, 3, 0, 4, 5, 0, 5, 1, 2, 3, 7, 2, 7, 6]), 'Skin', one('hand.' + S));
  // fingers and thumb: two segments each, on their own bones so the game can close the fist
  [['f_index', 0.72], ['f_middle', 0.74], ['f_ring', 0.7], ['f_pinky', 0.6], ['thumb', 0.8]].forEach(([f, r]) => {
    const a = B[f + '.01.' + S], b = B[f + '.02.' + S], tip = b.p.clone().addScaledVector(b.y, f === 'thumb' ? 1.8 : 1.9);
    add(tube([a.p.clone().addScaledVector(a.y, -0.35), b.p], [r, r * 0.95], 7), 'Skin', one(f + '.01.' + S), true);
    add(tube([b.p, tip], [r * 0.95, r * 0.82], 7), 'Skin', one(f + '.02.' + S), true);
  });
});

/* ---------- legs and shoes (the legs only show when he kicks) ---------- */
['L', 'R'].forEach(S => {
  const hip = B['thigh.' + S].p, knee = B['shin.' + S].p, ank = B['foot.' + S].p;
  add(tube([hip.clone().add(V(0, 0, 2)), knee], [4.0, 3.2], 10), 'Cassock', p => { const k = smooth(knee.z + 2, knee.z - 2, p.z); return {['thigh.' + S]:1 - k, ['shin.' + S]:k}; });
  add(tube([knee, ank.clone().add(V(0, 0, 1))], [3.1, 2.4], 10), 'Cassock', one('shin.' + S));
  const toe = B['toe.' + S].p;
  add(blob(u => { const q = V(u.x * 2.55, u.y * 6.6, u.z * 2.4); if (u.y < 0) q.x *= 1 - 0.25 * -u.y; q.add(V(ank.x, -2.4, 1.85)); q.z = Math.max(q.z, 0.15); return q; }, 14, 10),
    'Shoes', p => { const t = smooth(toe.y + 1.2, toe.y - 1.2, p.y); return {['foot.' + S]:1 - t, ['toe.' + S]:t}; });
});

/* ---------- write the GLB ---------- */
const chunks = [], views = [], accs = []; let off = 0;
function view(arr, target){
  const buf = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
  views.push({buffer:0, byteOffset:off, byteLength:buf.length, ...(target ? {target} : {})}); chunks.push(buf); off += buf.length;
  const pad = (4 - off % 4) % 4; if (pad){ chunks.push(Buffer.alloc(pad)); off += pad; }
  return views.length - 1;
}
function acc(arr, comp, type, count, target, minmax){ accs.push({bufferView:view(arr, target), componentType:comp, count, type, ...(minmax || {})}); return accs.length - 1; }
acc(new Float32Array(IBM.buffer.slice(IBM.byteOffset, IBM.byteOffset + IBM.length)), 5126, 'MAT4', JOINTS.length);

const primitives = [], materials = [], textures = [], images = [];
let tris = 0;
for (const name in MATS){
  const mine = parts.filter(p => p.mat === name); if (!mine.length) continue;
  // corners of the triangles, shared where position, normal and weights all match
  const P = [], N = [], JI = [], W = [], UV = [], I = [], seen = new Map();
  mine.forEach(({g, w, smoothShade, uv}) => {
    let h = g;
    if (smoothShade){ h.computeVertexNormals(); h = h.toNonIndexed(); } else { h = h.toNonIndexed(); h.computeVertexNormals(); }
    const p = h.attributes.position, n = h.attributes.normal;
    for (let i = 0; i < p.count; i++){
      const v = V(p.getX(i), p.getY(i), p.getZ(i));
      const ws = Object.entries(w(v)).filter(([, x]) => x > 1e-4).sort((a, b) => b[1] - a[1]).slice(0, 4);
      const sum = ws.reduce((s, [, x]) => s + x, 0);
      ws.forEach(([b]) => { if (!JOINTS.includes(b)) throw new Error('no bone ' + b); });
      while (ws.length < 4) ws.push([JOINTS[0], 0]);
      const t = i - i % 3, c = V(0, 0, 0); for (let k = 0; k < 3; k++) c.add(V(p.getX(t + k), p.getY(t + k), p.getZ(t + k)));
      const tc = uv ? uv(v, c.divideScalar(3)) : [];
      const key = [v.x, v.y, v.z, n.getX(i), n.getY(i), n.getZ(i), ...tc].map(x => x.toFixed(4)).join() + ws.map(([b, x]) => b + (x / sum).toFixed(4)).join();
      if (seen.has(key)){ I.push(seen.get(key)); continue; }
      seen.set(key, P.length / 3); I.push(P.length / 3);
      P.push(v.x / 1000, v.y / 1000, v.z / 1000); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(...tc);
      ws.forEach(([b, x]) => { JI.push(JOINTS.indexOf(b)); W.push(x / sum); });
    }
  });
  const count = P.length / 3; tris += I.length / 3;
  const min = [0, 1, 2].map(k => Math.min(...P.filter((_, i) => i % 3 === k))), max = [0, 1, 2].map(k => Math.max(...P.filter((_, i) => i % 3 === k)));
  const index = count < 65536 ? new Uint16Array(I) : new Uint32Array(I);
  primitives.push({
    attributes:{
      POSITION:acc(new Float32Array(P), 5126, 'VEC3', count, 34962, {min, max}),
      NORMAL:acc(new Float32Array(N), 5126, 'VEC3', count, 34962),
      JOINTS_0:acc(new Uint8Array(JI), 5121, 'VEC4', count, 34962),
      WEIGHTS_0:acc(new Float32Array(W), 5126, 'VEC4', count, 34962),
      ...(UV.length ? {TEXCOORD_0:acc(new Float32Array(UV), 5126, 'VEC2', count, 34962)} : {})
    },
    indices:acc(index, count < 65536 ? 5123 : 5125, 'SCALAR', I.length, 34963),
    material:materials.length, mode:4
  });
  const m = MATS[name];
  const pbr = {baseColorFactor:[...m.c, 1], metallicFactor:m.m, roughnessFactor:m.r};
  if (m.tex){
    images.push({bufferView:view(fs.readFileSync(path.join(__dirname, m.tex))), mimeType:'image/jpeg'});
    textures.push({sampler:0, source:images.length - 1}); pbr.baseColorTexture = {index:textures.length - 1};
  }
  materials.push({name, pbrMetallicRoughness:pbr});
}
const gltf = {
  asset:{version:'2.0', generator:'bravr/tools/make_pope.js'}, scene:0, scenes:[{name:'Pope', nodes:[0]}],
  nodes:J.nodes.map((n, i) => i === 1 ? {...n, name:'pope'} : n),
  skins:[{...SKIN, inverseBindMatrices:0}], meshes:[{name:'pope', primitives}], materials,
  ...(textures.length ? {textures, images, samplers:[{magFilter:9729, minFilter:9987, wrapS:33071, wrapT:33071}]} : {}),
  accessors:accs, bufferViews:views, buffers:[{byteLength:off}]
};
let js = Buffer.from(JSON.stringify(gltf)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
const bin = Buffer.concat(chunks), hdr = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
hdr.write('glTF', 0); hdr.writeUInt32LE(2, 4); hdr.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
jh.writeUInt32LE(js.length, 0); jh.write('JSON', 4); bh.writeUInt32LE(bin.length, 0); bh.write('BIN\0', 4);
fs.writeFileSync(OUT, Buffer.concat([hdr, jh, js, bh, bin]));
console.log(`pope.glb: ${tris} triangles, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB, ${materials.length} materials`);
