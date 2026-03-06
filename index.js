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
    return {
        // x : (p.x * SCALE) + G.width / 2,
        // y : G.height / 2 - (p.y * SCALE),
        x : (p.x + 1) / 2 * G.width,
        y : (1 - p.y) / 2 * G.height,
    }
}

function projection({x, y, z}) {
    return {
        x : x / z,
        y : y / z,
    }
}

const FPS = 60 // FPS = Frames Per Second→ 1초에 60번 화면을 갱신하겠다는 뜻
let dz = 1;
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

const vs = [
    {x: 0.25, y: 0.25, z: 0.25},
    {x: 0.25, y: -0.25, z: 0.25},
    {x: -0.25, y: -0.25, z: 0.25},
    {x: -0.25, y: 0.25, z: 0.25},

    {x: 0.25, y: 0.25, z: -0.25},
    {x: 0.25, y: -0.25, z: -0.25},
    {x: -0.25, y: -0.25, z: -0.25},
    {x: -0.25, y: 0.25, z: -0.25},
]

const fs = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
]

function frame() {
    const dt = 1/FPS // dt = 1/FPS → 한 프레임당 흐르는 시간(초 단위) => 한 프레임은 1/60초, 이건 물리 시뮬레이션에서 기본 개념이다.
    // dz += 1*dt // dz += 1*dt → 속도 × 시간 = 이동 거리
    angle += Math.PI*dt;
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