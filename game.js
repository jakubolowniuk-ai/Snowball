// Stan gry, skalowanie i pętla gry.

const canvas = document.getElementById("plansza");
const ctx = canvas.getContext("2d");

// Wewnątrz kodu pole gry ma 1000 jednostek szerokości.
// Funkcja j() zamienia ułamek szerokości z config.js na te jednostki.
const SZEROKOSC_POLA = 1000;
const WYSOKOSC_POLA = SZEROKOSC_POLA / CONFIG.ASPECT;
function j(ulamek) {
  return ulamek * SZEROKOSC_POLA;
}

const PROMIEN_POSTACI = j(CONFIG.rozmiarPostaci) / 2;

// Stan gry
const stan = {
  gracz: { druzyna: "czerwoni", x: j(CONFIG.startGracz.x), y: j(CONFIG.startGracz.y) },
  przeciwnicy: CONFIG.startPrzeciwnicy.map((p) => ({ druzyna: "zieloni", x: j(p.x), y: j(p.y) })),
  palec: null, // gdzie jest palec trzymający kropkę (null = nikt jej nie trzyma)
  chwyt: null, // zapamiętane przy złapaniu: gdzie był palec i kropka względem zawodnika
  poziom: 1,
  czasPoziomu: 0, // ile sekund trwa obecny poziom
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
  return PROMIEN_POSTACI + j(CONFIG.odlegloscKropki);
}

// Gdzie leży kropka: gdy jest trzymana, w stałym miejscu względem zawodnika (sztywno),
// a w spoczynku za zawodnikiem, po przeciwnej stronie niż najbliższy przeciwnik.
// Nigdy nie wychodzi poza widoczny ekran, żeby dało się jej dotknąć.
function pozycjaKropki(stan) {
  const g = stan.gracz;
  let k;
  if (stan.chwyt) {
    k = { x: g.x + stan.chwyt.kropkaX, y: g.y + stan.chwyt.kropkaY };
  } else {
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
    k = { x: g.x + kx * odlegloscKropkiOdSrodka(), y: g.y + ky * odlegloscKropkiOdSrodka() };
  }

  const r = j(CONFIG.promienKropki);
  k.x = Math.min(Math.max(k.x, widoczny.x0 + r), widoczny.x1 - r);
  k.y = Math.min(Math.max(k.y, widoczny.y0 + r), widoczny.y1 - r);
  return k;
}

// --- Skalowanie pola gry do ekranu ---
let skala = 1;
let przesuniecieX = 0;
let przesuniecieY = 0;
// Widoczny fragment ekranu w jednostkach pola (razem z marginesami poza polem)
const widoczny = { x0: 0, y0: 0, x1: SZEROKOSC_POLA, y1: WYSOKOSC_POLA };

function dopasujDoEkranu() {
  const dpr = window.devicePixelRatio || 1; // ile pikseli ekranu na jeden piksel CSS
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  // Całe pole ma się zmieścić, wyśrodkowane
  skala = Math.min(w / SZEROKOSC_POLA, h / WYSOKOSC_POLA);
  przesuniecieX = (w - SZEROKOSC_POLA * skala) / 2;
  przesuniecieY = (h - WYSOKOSC_POLA * skala) / 2;

  widoczny.x0 = -przesuniecieX / skala;
  widoczny.y0 = -przesuniecieY / skala;
  widoczny.x1 = (w - przesuniecieX) / skala;
  widoczny.y1 = (h - przesuniecieY) / skala;

  // Od teraz rysujemy w jednostkach pola
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
  stan.czasPoziomu += dt;

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
  const krok = j(CONFIG.predkoscZawodnika) * dt;
  if (dystans <= krok) {
    g.x = celX;
    g.y = celY;
  } else {
    g.x += (dx / dystans) * krok;
    g.y += (dy / dystans) * krok;
  }

  // Nie wychodzi poza pole gry
  const r = PROMIEN_POSTACI;
  g.x = Math.min(Math.max(g.x, r), SZEROKOSC_POLA - r);
  g.y = Math.min(Math.max(g.y, r), WYSOKOSC_POLA - r);
}

// --- Pętla gry ---
let poprzedniCzas = performance.now();

function klatka(teraz) {
  // Czas od poprzedniej klatki w sekundach (max 0,1 s, gdy karta była w tle)
  const dt = Math.min((teraz - poprzedniCzas) / 1000, 0.1);
  poprzedniCzas = teraz;

  aktualizuj(dt);
  rysujScene(ctx, stan);
  requestAnimationFrame(klatka);
}

requestAnimationFrame(klatka);
