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

// Nowa postać na starcie poziomu
function nowaPostac(druzyna, start) {
  return {
    druzyna,
    x: j(start.x),
    y: j(start.y),
    trafienia: 0, // liczą się przez cały poziom
    ogluszenie: 0, // ile sekund ogłuszenia zostało (0 = nieogłuszony)
    wyeliminowany: false,
  };
}

// Stan gry (wypełnia go zacznijPoziom)
const stan = {};

// Ustawia wszystko od nowa na początek poziomu
function zacznijPoziom(stan) {
  stan.gracz = nowaPostac("czerwoni", CONFIG.startGracz);
  stan.przeciwnicy = CONFIG.startPrzeciwnicy.map((p) => nowaPostac("zieloni", p));
  stan.palec = null; // gdzie jest palec trzymający kropkę (null = nikt jej nie trzyma)
  stan.chwyt = null; // zapamiętane przy złapaniu: gdzie był palec i kropka względem zawodnika
  stan.poziom = 1;
  stan.czasPoziomu = 0; // ile sekund trwa obecny poziom
  stan.celowanie = null; // { x, y, czas } gdy palec celuje; czas = ile sekund ładuje się siła
  stan.sniezki = []; // śnieżki w locie
  stan.chmurki = []; // białe chmurki po trafieniach
  stan.koniec = null; // { wynik: "wygrana" | "przegrana", czas } po końcu poziomu
}
zacznijPoziom(stan);

// Czy gracz może teraz sterować (ruch i rzut)
function graczMozeSterowac(stan) {
  return !stan.koniec && !stan.gracz.wyeliminowany && stan.gracz.ogluszenie <= 0;
}

// --- Trafienia ---

function trafienie(stan, z) {
  z.trafienia += 1;
  if (z.trafienia >= CONFIG.trafieniaDoEliminacji) {
    z.wyeliminowany = true;
    z.ogluszenie = 0;
  } else {
    z.ogluszenie = CONFIG.czasOgluszenia;
  }
  stan.chmurki.push({ x: z.x, y: z.y, czas: 0 });

  // Krótka wibracja (działa na Androidzie; iPhone tego nie obsługuje)
  if (navigator.vibrate) navigator.vibrate(CONFIG.wibracjaTrafienia);

  // Trafiony gracz traci kropkę i celowanie
  if (z === stan.gracz) {
    pusc(stan);
    stan.celowanie = null;
  }
}

// Najmniejsza odległość punktu (px, py) od odcinka (ax, ay)-(bx, by)
function odlegloscOdOdcinka(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dl2 = dx * dx + dy * dy;
  let t = dl2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / dl2 : 0;
  t = Math.min(Math.max(t, 0), 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

// Przesuwa śnieżkę i sprawdza, czy po drodze kogoś trafiła.
// Sprawdzamy cały odcinek z tej klatki, żeby szybka śnieżka nie "przeskoczyła" postaci.
// Zwraca true, gdy śnieżka ma zniknąć.
function lotSniezki(stan, sn, dt) {
  const przed = pozycjaSniezki(sn);
  sn.przebyte = Math.min(sn.przebyte + sn.predkosc * dt, sn.dlugosc);
  const po = pozycjaSniezki(sn);

  const zasiegTrafienia = PROMIEN_POSTACI + j(CONFIG.promienSniezki);
  let pierwszy = null;
  let najblizej = Infinity;
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z === sn.rzucajacy || z.wyeliminowany) continue;
    if (odlegloscOdOdcinka(z.x, z.y, przed.x, przed.y, po.x, po.y) > zasiegTrafienia) continue;
    // Gdy na odcinku jest kilka postaci, trafia ta bliżej początku
    const d = Math.hypot(z.x - przed.x, z.y - przed.y);
    if (d < najblizej) {
      najblizej = d;
      pierwszy = z;
    }
  }
  if (pierwszy) {
    trafienie(stan, pierwszy);
    return true;
  }
  return sn.przebyte >= sn.dlugosc;
}

// Wygrana: wszyscy przeciwnicy wyeliminowani. Przegrana: gracz wyeliminowany.
function sprawdzKoniec(stan) {
  if (stan.koniec) return;
  if (stan.gracz.wyeliminowany) {
    stan.koniec = { wynik: "przegrana", czas: 0 };
  } else if (stan.przeciwnicy.every((p) => p.wyeliminowany)) {
    stan.koniec = { wynik: "wygrana", czas: 0 };
  }
  if (stan.koniec) {
    pusc(stan);
    stan.celowanie = null;
  }
}

// --- Rzut ---

// Liniowe przejście od a do b, gdy t idzie od 0 do 1
function pomiedzy(a, b, t) {
  return a + (b - a) * t;
}

// Siła od 0 do 1 zależnie od czasu przytrzymania
function sila(czas) {
  return Math.min(czas / CONFIG.MAX_CHARGE, 1);
}

function zasieg(s) {
  return j(pomiedzy(CONFIG.zasiegMin, CONFIG.zasiegMax, s));
}

function zacznijCelowanie(stan, p) {
  stan.celowanie = { x: p.x, y: p.y, czas: 0 };
}

// Puszczenie palca celującego: rzut w miejsce palca albo anulowanie
function rzuc(stan, p) {
  const c = stan.celowanie;
  stan.celowanie = null;
  if (!c) return;

  const g = stan.gracz;
  const d = odleglosc(g.x, g.y, p.x, p.y);
  if (d < j(CONFIG.promienAnulowania)) return; // za blisko zawodnika: anulowane

  const s = sila(c.czas);
  stan.sniezki.push({
    rzucajacy: g, // rzucającego śnieżka nie trafia
    startX: g.x,
    startY: g.y,
    kierX: (p.x - g.x) / d,
    kierY: (p.y - g.y) / d,
    dlugosc: Math.min(d, zasieg(s)), // leci do celu albo do końca zasięgu
    predkosc: j(pomiedzy(CONFIG.predkoscSniezkiMin, CONFIG.predkoscSniezkiMax, s)),
    przebyte: 0,
  });
}

// Pozycja śnieżki na ziemi (cień) i wysokość nad ziemią (łuk, tylko wygląd)
function pozycjaSniezki(sn) {
  const t = sn.przebyte / sn.dlugosc;
  return {
    x: sn.startX + sn.kierX * sn.przebyte,
    y: sn.startY + sn.kierY * sn.przebyte,
    wysokosc: 4 * t * (1 - t) * CONFIG.wysokoscLuku * sn.dlugosc,
  };
}

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
      if (p.wyeliminowany) continue;
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

  // Ładowanie siły, dopóki palec celuje
  if (stan.celowanie) stan.celowanie.czas += dt;

  // Lot śnieżek: znikają po trafieniu albo na końcu lotu
  stan.sniezki = stan.sniezki.filter((sn) => !lotSniezki(stan, sn, dt));

  // Odliczanie ogłuszenia
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z.ogluszenie > 0) z.ogluszenie = Math.max(z.ogluszenie - dt, 0);
  }

  // Chmurki śniegu znikają po chwili
  for (const ch of stan.chmurki) ch.czas += dt;
  stan.chmurki = stan.chmurki.filter((ch) => ch.czas < CONFIG.czasChmurki);

  // Koniec poziomu: napis, a po chwili automatyczny restart
  sprawdzKoniec(stan);
  if (stan.koniec) {
    stan.koniec.czas += dt;
    if (stan.koniec.czas >= CONFIG.czasNapisuKonca) zacznijPoziom(stan);
    return;
  }

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
