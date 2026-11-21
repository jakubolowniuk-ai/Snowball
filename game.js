// Stan gry, skalowanie i pętla gry.

const canvas = document.getElementById("plansza");
const ctx = canvas.getContext("2d");

// Stan gry
const stan = {
  gracz: { druzyna: "czerwoni", x: CONFIG.startGracz.x, y: CONFIG.startGracz.y },
  przeciwnicy: CONFIG.startPrzeciwnicy.map((p) => ({ druzyna: "zieloni", x: p.x, y: p.y })),
  palec: null, // gdzie jest palec trzymający kropkę (null = nikt jej nie trzyma)
  chwyt: null, // zapamiętane przy złapaniu: gdzie był palec i kropka względem zawodnika
};

// Wywoływane, gdy palec złapie kropkę: zapamiętujemy sztywne przesunięcia
function zlapKropke(stan, palec) {
  const g = stan.gracz;
  const k = pozycjaKropki(stan);
  stan.chwyt = {
    palecX: palec.x - g.x, palecY: palec.y - g.y, // palec względem zawodnika
    kropkaX: k.x - g.x, kropkaY: k.y - g.y, // kropka względem zawodnika
  };
  stan.palec = palec;
}

function pusc(stan) {
  stan.palec = null;
  stan.chwyt = null;
}

// Odległość środka kropki od środka zawodnika
function odlegloscKropkiOdSrodka() {
  return CONFIG.promienZawodnika + CONFIG.odlegloscKropki;
}

// Gdzie leży kropka: gdy jest trzymana, w stałym miejscu względem zawodnika (sztywno),
// a w spoczynku za zawodnikiem, po przeciwnej stronie niż najbliższy przeciwnik.
function pozycjaKropki(stan) {
  const g = stan.gracz;
  if (stan.chwyt) return { x: g.x + stan.chwyt.kropkaX, y: g.y + stan.chwyt.kropkaY };

  let najblizszy = null;
  let najmniej = Infinity;
  for (const p of stan.przeciwnicy) {
    const d = Math.hypot(p.x - g.x, p.y - g.y);
    if (d < najmniej) {
      najmniej = d;
      najblizszy = p;
    }
  }

  // Kierunek od przeciwnika do gracza (domyślnie w lewo)
  let kx = -1;
  let ky = 0;
  if (najblizszy && najmniej > 0) {
    kx = (g.x - najblizszy.x) / najmniej;
    ky = (g.y - najblizszy.y) / najmniej;
  }
  return { x: g.x + kx * odlegloscKropkiOdSrodka(), y: g.y + ky * odlegloscKropkiOdSrodka() };
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
  const g = stan.gracz;
  const palec = stan.palec;
  if (!palec) return;

  // Kropka jest sztywno przyczepiona: zawodnik chce stanąć tak,
  // żeby palec był w tym samym miejscu względem niego co przy złapaniu.
  const celX = palec.x - stan.chwyt.palecX;
  const celY = palec.y - stan.chwyt.palecY;

  // Krok w stronę celu, z limitem prędkości
  const dx = celX - g.x;
  const dy = celY - g.y;
  const dystans = Math.hypot(dx, dy);
  const krok = CONFIG.predkoscZawodnika * dt;
  if (dystans <= krok) {
    g.x = celX;
    g.y = celY;
  } else {
    g.x += (dx / dystans) * krok;
    g.y += (dy / dystans) * krok;
  }

  // Nie wychodzi poza planszę
  const r = CONFIG.promienZawodnika;
  g.x = Math.min(Math.max(g.x, r), CONFIG.szerokoscPlanszy - r);
  g.y = Math.min(Math.max(g.y, r), CONFIG.wysokoscPlanszy - r);
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
