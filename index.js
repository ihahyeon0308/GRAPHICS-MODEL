const BACKGROUND = "#101010"
const FOREGROUND = "#00FF00"

// canvas 크기 고정
// console.log(G)
// G.width = 800
// G.height = 800

const G = document.getElementById("G")
const ctx = G.getContext("2d")

const SCALE = 100

// 반응형 캔버스 설정
function resizeCanvas() {
    G.width = window.innerWidth
    G.height = window.innerHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

console.log(ctx)

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, G.width, G.height)
}

function point({x, y}) {
    const s = 20
    ctx.fillStyle = FOREGROUND
    ctx.fillRect(x - s/2, y - s/2, s, s)
}

function line(p1, p2) {
    ctx.lineWith = 3;
    ctx.strokeStyle = FOREGROUND;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

// HTML 좌표계 -> 함수 좌표계
function screen(p) { // 픽셀 한 점인 객체 p
    const size = Math.min(G.width, G.height);
    return {
        x : (p.x * size) + G.width / 2,
        y : G.height / 2 - (p.y * size) + size * 0.10,
        // x : (p.x + 1) / 2 * G.width,
        // y : (1 - p.y) / 2 * G.height,
    }
}

function projection({x, y, z}) {
    return {
        x : x / z,
        y : y / z,
    }
}

const FPS = 60 // FPS = Frames Per Second→ 1초에 60번 화면을 갱신하겠다는 뜻
let dz = 2.2;
let angle = 0;

function translate_z({x, y, z}, dz) {
    return {x, y, z: z + dz};
}

function rotate_xz({x, y, z}, angle) {
const c = Math.cos(angle);
const s = Math.sin(angle);
return {
    x: x*c-z*s,
    y,
    z: x*s+z*c,
};
}
// ------------정육면체가 회전-----------------
// const vs = [
//     {x: 0.25, y: 0.25, z: 0.25},
//     {x: 0.25, y: -0.25, z: 0.25},
//     {x: -0.25, y: -0.25, z: 0.25},
//     {x: -0.25, y: 0.25, z: 0.25},

//     {x: 0.25, y: 0.25, z: -0.25},
//     {x: 0.25, y: -0.25, z: -0.25},
//     {x: -0.25, y: -0.25, z: -0.25},
//     {x: -0.25, y: 0.25, z: -0.25},
// ]

// const fs = [
//     [0, 1, 2, 3],
//     [4, 5, 6, 7],

//     [0, 4],
//     [1, 5],
//     [2, 6],
//     [3, 7],
// ]
// -----------------------------------------------------

// -------------------라퓨타 성 회전-----------------------
const vs = []
let vidx = 0
const SEG = 20

// 함수들을 먼저 선언
const fs = []

function closeRing(s) {
  const row = []; for (let i=0;i<SEG;i++) row.push(s+i); fs.push(row)
}
function bridgeRings(s1, s2) {
  for (let i=0;i<SEG;i++) fs.push([s1+i, s2+i])
}
function bridgeToPoint(s, p) {
  for (let i=0;i<SEG;i++) fs.push([s+i, p])
}

function mkRing(y, r) {
  const start = vidx
  for (let i = 0; i < SEG; i++) {
    const t = (i / SEG) * Math.PI * 2
    vs.push({ x: r * Math.cos(t), y, z: r * Math.sin(t) })
    vidx++
  }
  return start
}

// 하부 기계 돔
// vs.push({ x:0, y:-0.78, z:0 }); const domeApex = vidx++
// const dome = [mkRing(-0.68,0.08), mkRing(-0.56,0.19), mkRing(-0.44,0.29), mkRing(-0.34,0.35)]
// vs.push({ x:0, y:-0.80, z:0 }); const domeApex = vidx++
// const dome = [
//   mkRing(-0.72, 0.06),
//   mkRing(-0.64, 0.16),
//   mkRing(-0.54, 0.27),
//   mkRing(-0.42, 0.36),
//   mkRing(-0.34, 0.38),
// ]
// 평평한 원판
const RING_Y=-0.18, RING_THICK=0.04, RING_OUTER=0.58, RING_INNER=0.22
const ringTopOuter=mkRing(RING_Y,         RING_OUTER)
const ringTopInner=mkRing(RING_Y,         RING_INNER)
const ringBotOuter=mkRing(RING_Y-RING_THICK, RING_OUTER)
const ringBotInner=mkRing(RING_Y-RING_THICK, RING_INNER)
closeRing(ringTopOuter); closeRing(ringTopInner)
closeRing(ringBotOuter); closeRing(ringBotInner)
bridgeRings(ringTopOuter, ringBotOuter)   // 바깥 벽
bridgeRings(ringTopInner, ringBotInner)   // 안쪽 구멍 벽
bridgeRings(ringTopOuter, ringTopInner)   // 윗면
bridgeRings(ringBotOuter, ringBotInner)   // 아랫면

// 완벽한 반구 (원판 안쪽 구멍에서 아래로)
const HC=RING_Y-RING_THICK, HR=0.36
vs.push({x:0, y:HC-HR, z:0}); const domeApex=vidx++
const dome=[]
for(let s=1;s<=9;s++){
  const phi=(s/9)*(Math.PI/2)
  dome.push(mkRing(HC-HR*Math.cos(phi), HR*Math.sin(phi)))
}

// 암석 기반
// const rock = [mkRing(-0.28,0.38), mkRing(-0.20,0.46), mkRing(-0.12,0.54)]
const rock = [mkRing(-0.12, 0.54)]

// 1층 성벽
const t1 = [mkRing(-0.12,0.56), mkRing(-0.02,0.54), mkRing(0.08,0.52), mkRing(0.12,0.52)]
const t1i = [mkRing(0.00,0.44), mkRing(0.08,0.42)]
// 2층 성벽
const t2 = [mkRing(0.12,0.44), mkRing(0.20,0.42), mkRing(0.28,0.40), mkRing(0.32,0.40)]
const t2i = [mkRing(0.20,0.33), mkRing(0.28,0.31)]
// 3층 성벽
const t3 = [mkRing(0.32,0.34), mkRing(0.38,0.32), mkRing(0.44,0.30), mkRing(0.48,0.30)]
// 상부 플랫폼
const plat = [mkRing(0.48,0.24), mkRing(0.54,0.18), mkRing(0.58,0.12)]
// 돔 수평 격자선 (기계적 느낌)
const domeInner = [
  mkRing(-0.62, 0.04),
  mkRing(-0.52, 0.12),
  mkRing(-0.42, 0.20),
]
domeInner.forEach(s => closeRing(s))
// 작은 흰 돔 건물들
const smallDomes = []
for (let i = 0; i < 9; i++) {
  const a = (i / 9) * Math.PI * 2
  smallDomes.push({ cx: 0.26 * Math.cos(a), cz: 0.26 * Math.sin(a) })
}
for (const { cx, cz } of smallDomes) {
  const h = 0.09, r = 0.04, sy = 0.48   // ← sy: 0.60→0.48 (3층 꼭대기)
  const db = mkRing(sy, r);          closeRing(db)
  const dt = mkRing(sy + h, r * 0.7); closeRing(dt)
  bridgeRings(db, dt)
  vs.push({ x: cx, y: sy + h + r * 0.7, z: cz })
  bridgeToPoint(dt, vidx - 1); vidx++
  for (let i = db; i < vidx - 1; i++) { vs[i].x += cx; vs[i].z += cz }
}
// 나무 캐노피
const treeBase = mkRing(0.60,0.06)
const treeRings = [
  mkRing(0.64,0.16), mkRing(0.70,0.28), mkRing(0.76,0.36),
  mkRing(0.82,0.38), mkRing(0.88,0.36), mkRing(0.94,0.28),
  mkRing(1.00,0.16), mkRing(1.04,0.07)
]
vs.push({ x:0, y:1.08, z:0 }); const treeApex = vidx++

function closeRing(s) {
  const row = []; for (let i=0;i<SEG;i++) row.push(s+i); fs.push(row)
}
function bridgeRings(s1, s2) {
  for (let i=0;i<SEG;i++) fs.push([s1+i, s2+i])
}
function bridgeToPoint(s, p) {
  for (let i=0;i<SEG;i++) fs.push([s+i, p])
}

// 하부 돔
// dome.forEach(s => closeRing(s))
// bridgeToPoint(dome[0], domeApex)
// for (let i=0;i<dome.length-1;i++) bridgeRings(dome[i], dome[i+1])
dome.forEach(s=>closeRing(s))
bridgeToPoint(dome[0], domeApex)
for(let i=0;i<dome.length-1;i++) bridgeRings(dome[i],dome[i+1])
bridgeRings(ringBotInner, dome[dome.length-1])  // 원판 안쪽 ↔ 반구 입구

// 암석 기반
// rock.forEach(s => closeRing(s))
// bridgeRings(dome[3], rock[0])
// bridgeRings(dome[4], rock[0])
// for (let i=0;i<rock.length-1;i++) bridgeRings(rock[i], rock[i+1])
rock.forEach(s=>closeRing(s))
bridgeRings(ringTopOuter, rock[0])  // 원판 바깥 ↔ 성벽 시작

// 1층
t1.forEach(s => closeRing(s)); t1i.forEach(s => closeRing(s))
// bridgeRings(rock[2], t1[0]);
bridgeRings(rock[0], t1[0])  // rock이 1개로 줄었으니

bridgeRings(t1i[0],t1i[1])
for (let i=0;i<t1.length-1;i++) bridgeRings(t1[i],t1[i+1])
// 2층
t2.forEach(s => closeRing(s)); t2i.forEach(s => closeRing(s))
bridgeRings(t1[3], t2[0]); bridgeRings(t2i[0],t2i[1])
for (let i=0;i<t2.length-1;i++) bridgeRings(t2[i],t2[i+1])
// 3층
t3.forEach(s => closeRing(s))
bridgeRings(t2[3], t3[0])
for (let i=0;i<t3.length-1;i++) bridgeRings(t3[i],t3[i+1])
// 플랫폼
plat.forEach(s => closeRing(s))
bridgeRings(t3[3], plat[0])
for (let i=0;i<plat.length-1;i++) bridgeRings(plat[i],plat[i+1])
// 나무
closeRing(treeBase); treeRings.forEach(s => closeRing(s))
bridgeRings(plat[2], treeBase); bridgeRings(treeBase, treeRings[0])
for (let i=0;i<treeRings.length-1;i++) bridgeRings(treeRings[i],treeRings[i+1])
bridgeToPoint(treeRings[treeRings.length-1], treeApex)

// -----------------------------------------------------------

function frame() {
    const dt = 1/FPS // dt = 1/FPS → 한 프레임당 흐르는 시간(초 단위) => 한 프레임은 1/60초, 이건 물리 시뮬레이션에서 기본 개념이다.
    // dz += 1*dt // dz += 1*dt → 속도 × 시간 = 이동 거리
    angle += Math.PI* 0.2 *dt;
    clear()
    // for (const v of vs) {
    //     point(screen(projection(translate_z(rotate_xz(v, angle), dz))))
    // }
    for (const f of fs) {
        for (let i = 0; i < f.length; ++i) {
            const a = vs[f[i]];
            const b = vs[f[(i+1)%f.length]];
            line(screen(projection(translate_z(rotate_xz(a, angle), dz))),
                screen(projection(translate_z(rotate_xz(b, angle), dz))))
        }
    }
    setTimeout(frame, 1000/FPS); // 1000/FPS → 프레임 간격을 밀리초(ms)로 변환
}
setTimeout(frame, 1000/FPS); // 1000/FPS → 프레임 간격을 밀리초(ms)로 변환 => JS에서 시간 단위는 밀리초(ms)