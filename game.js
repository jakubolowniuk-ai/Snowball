// Stan gry, skalowanie i pętla gry.

const canvas = document.getElementById("plansza");
const ctx = canvas.getContext("2d");

// Stan gry: wszyscy zawodnicy, kto jest zaznaczony i dokąd idzie
const stan = {
  zawodnicy: [],
  zaznaczony: null,
  cel: null, // punkt, do którego idzie zaznaczony (gdy palec jest przytrzymany)
};

for (const p of CONFIG.startCzerwoni) {
  stan.zawodnicy.push({ druzyna: "czerwoni", x: p.x, y: p.y });
}
for (const p of CONFIG.startZieloni) {
  stan.zawodnicy.push({ druzyna: "zieloni", x: p.x, y: p.y });
}

// --- Skalowanie planszy do ekranu ---
let skala = 1;
let przesuniecieX = 0;
let przesuniecieY = 0;

function dopasujDoEkranu() {
  const dpr = window.devicePixelRatio || 1; // ile pikseli ekranu na jeden piksel CSS
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  // Cała plansza ma się zmieścić, wyśrodkowana
  skala = Math.min(w / CONFIG.szerokoscPlanszy, h / CONFIG.wysokoscPlanszy);
  przesuniecieX = (w - CONFIG.szerokoscPlanszy * skala) / 2;
  przesuniecieY = (h - CONFIG.wysokoscPlanszy * skala) / 2;

  // Od teraz rysujemy w jednostkach planszy
  ctx.setTransform(dpr * skala, 0, 0, dpr * skala, dpr * przesuniecieX, dpr * przesuniecieY);
}

function ekranNaPlansze(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left - przesuniecieX) / skala,
    y: (clientY - r.top - przesuniecieY) / skala,
  };
}

window.addEventListener("resize", dopasujDoEkranu);
dopasujDoEkranu();
podepnijSterowanie(canvas, stan, ekranNaPlansze);

// --- Aktualizacja świata ---
function aktualizuj(dt) {
  const z = stan.zaznaczony;
  if (z && stan.cel) {
    const dx = stan.cel.x - z.x;
    const dy = stan.cel.y - z.y;
    const dystans = Math.hypot(dx, dy);
    const krok = CONFIG.predkoscZawodnika * dt;
    if (dystans <= krok) {
      // Doszedł do palca
      z.x = stan.cel.x;
      z.y = stan.cel.y;
    } else {
      z.x += (dx / dystans) * krok;
      z.y += (dy / dystans) * krok;
    }
    // Nie wychodzi poza planszę
    const r = CONFIG.promienZawodnika;
    z.x = Math.min(Math.max(z.x, r), CONFIG.szerokoscPlanszy - r);
    z.y = Math.min(Math.max(z.y, r), CONFIG.wysokoscPlanszy - r);
  }
}

// --- Pętla gry ---
let poprzedniCzas = performance.now();

function klatka(teraz) {
  // Czas od poprzedniej klatki w sekundach (max 0,1 s, gdy karta była w tle)
  const dt = Math.min((teraz - poprzedniCzas) / 1000, 0.1);
  poprzedniCzas = teraz;

  aktualizuj(dt);

  // Czyścimy cały canvas (także pasy poza planszą)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  rysujScene(ctx, stan);
  requestAnimationFrame(klatka);
}

requestAnimationFrame(klatka);
