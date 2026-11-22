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
    przeladowanie: 0, // ile sekund przeładowania zostało (0 = może rzucać)
    przeladowanieCalosc: 0, // ile trwało całe obecne przeładowanie (do rysowania postępu)
    wyeliminowany: false,
  };
}

// Stan gry (wypełnia go zacznijPoziom)
const stan = {};

// Parametry obecnego poziomu z config.js (po ostatnim zostają ustawienia ostatniego)
function parametryPoziomu(stan) {
  const ile = CONFIG.poziomy.length;
  return CONFIG.poziomy[Math.min(stan.poziom, ile) - 1];
}

// Pozycje startowe n przeciwników: równo na linii równoległej do przekątnej,
// w lewym górnym trójkącie (od lewego brzegu do górnego)
function pozycjePrzeciwnikow(n) {
  const wysokosc = 1 / CONFIG.ASPECT; // wysokość pola jako ułamek szerokości
  const a = CONFIG.liniaPrzeciwnikow;
  const pozycje = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n; // od 0 (lewy brzeg) do 1 (górny brzeg)
    pozycje.push({ x: t * a, y: (1 - t) * a * wysokosc });
  }
  return pozycje;
}

// Ustawia wszystko od nowa na początek poziomu o numerze "poziom"
function zacznijPoziom(stan, poziom) {
  stan.poziom = poziom;
  const param = parametryPoziomu(stan);
  stan.gracz = nowaPostac("czerwoni", CONFIG.startGracz);
  stan.przeciwnicy = pozycjePrzeciwnikow(param.przeciwnicy).map((p) => nowaPostac("zieloni", p));
  for (const p of stan.przeciwnicy) {
    ograniczDoSwojejStrony(p); // nie za blisko brzegu
    wypchnijZPrzeszkod(p); // nie w środku dekoracji
  }
  for (const p of stan.przeciwnicy) p.ai = nowyStanAI(param);
  stan.palec = null; // gdzie jest palec trzymający kropkę (null = nikt jej nie trzyma)
  stan.chwyt = null; // zapamiętane przy złapaniu: gdzie był palec i kropka względem zawodnika
  stan.czasPoziomu = 0; // ile sekund trwa obecny poziom
  stan.celowanie = null; // { x, y, czas } gdy palec celuje; czas = ile sekund ładuje się siła
  stan.sniezki = []; // śnieżki w locie
  stan.chmurki = []; // białe chmurki po trafieniach
  stan.koniec = null; // { wynik: "wygrana" | "przegrana", czas } po końcu poziomu
}
zacznijPoziom(stan, 1);

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
  // Obłoczek i rozbryzg na wysokości tułowia, losowo wybrane grafiki
  const tulow = stopyY(z) - rozmiarGrafiki(grafikaPostaci(z)).wys * 0.45;
  stan.chmurki.push({
    x: z.x,
    y: tulow,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: `assets/efekty/rozbryzg_${1 + Math.floor(Math.random() * 8)}.png`,
  });

  // Krótka wibracja (działa na Androidzie; iPhone tego nie obsługuje)
  if (navigator.vibrate) navigator.vibrate(CONFIG.wibracjaTrafienia);

  // Trafiony gracz traci kropkę i celowanie, trafiony przeciwnik traci uniesiony rzut
  if (z === stan.gracz) {
    pusc(stan);
    stan.celowanie = null;
  }
  if (z.ai) z.ai.unoszenie = null;
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
  // Przeszkoda na drodze? Sprawdzamy tor cienia (na wysokości stóp).
  const stopy = PROMIEN_POSTACI * 0.85;
  const p = przeszkodaNaOdcinku(przed.x, przed.y + stopy, po.x, po.y + stopy);
  if (p && (!pierwszy || Math.hypot(p.x - przed.x, p.y - stopy - przed.y) < najblizej)) {
    // Śnieżka rozbija się o przeszkodę: sam rozbryzg, bez trafienia.
    // Rozbryzg nie wyżej niż czubek grafiki przeszkody.
    const czubek = p.y - rozmiarGrafiki(p.sciezka).wys * SPRITY[p.sciezka].kotwicaY;
    stan.chmurki.push({
      x: po.x,
      y: Math.max(po.y - po.wysokosc, czubek),
      czas: 0,
      obloczek: null,
      rozbryzg: `assets/efekty/rozbryzg_${1 + Math.floor(Math.random() * 8)}.png`,
    });
    return true;
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
  wykonajRzut(stan, g, p.x, p.y, c.czas);
}

// Rzut postaci z w punkt (celX, celY) po ładowaniu siły przez czasLadowania sekund.
// Te same reguły dla gracza i przeciwników.
function wykonajRzut(stan, z, celX, celY, czasLadowania) {
  const d = odleglosc(z.x, z.y, celX, celY);
  if (d === 0) return;
  const s = sila(czasLadowania);
  stan.sniezki.push({
    rzucajacy: z, // rzucającego śnieżka nie trafia
    startX: z.x,
    startY: z.y,
    kierX: (celX - z.x) / d,
    kierY: (celY - z.y) / d,
    dlugosc: Math.min(d, zasieg(s)), // leci do celu albo do końca zasięgu
    predkosc: j(pomiedzy(CONFIG.predkoscSniezkiMin, CONFIG.predkoscSniezkiMax, s)),
    przebyte: 0,
  });

  // Przeładowanie: stały czas plus czas ładowania siły
  z.przeladowanie = CONFIG.czasPrzeladowania + Math.min(czasLadowania, CONFIG.MAX_CHARGE);
  z.przeladowanieCalosc = z.przeladowanie;
}

// --- Ruch ---

// Każda drużyna chodzi tylko po swojej połowie pola
// Granica drużyn to przekątna pola od lewego dolnego do prawego górnego rogu.
// Czerwoni grają w prawym dolnym trójkącie, zieloni w lewym górnym.
// Zwraca odległość punktu od przekątnej: dodatnia po stronie czerwonych.
function odlegloscOdPrzekatnej(x, y) {
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  // Przekątna to x/W + y/H = 1; dzielimy przez długość wektora (1/W, 1/H)
  return (x / W + y / H - 1) / Math.hypot(1 / W, 1 / H);
}

// Każda drużyna zostaje na swojej stronie przekątnej i w polu gry
function ograniczDoSwojejStrony(z) {
  const r = PROMIEN_POSTACI;
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  const wPolu = () => {
    z.x = Math.min(Math.max(z.x, r), W - r);
    z.y = Math.min(Math.max(z.y, r), H - r);
  };
  wPolu();
  // Strona: czerwoni co najmniej r za przekątną (+), zieloni co najmniej r przed nią (-)
  const znak = z.druzyna === "czerwoni" ? 1 : -1;
  const d = odlegloscOdPrzekatnej(z.x, z.y) * znak;
  if (d < r) {
    // Przesuwamy prostopadle do przekątnej, na jej właściwą stronę
    const dl = Math.hypot(1 / W, 1 / H);
    const nx = (1 / W / dl) * znak;
    const ny = (1 / H / dl) * znak;
    z.x += nx * (r - d);
    z.y += ny * (r - d);
    wPolu();
  }
}

// Krok postaci w stronę punktu, z limitem prędkości. Zwraca true, gdy doszła.
function idzDo(z, celX, celY, dt) {
  const dx = celX - z.x;
  const dy = celY - z.y;
  const dystans = Math.hypot(dx, dy);
  const krok = j(CONFIG.predkoscZawodnika) * dt;
  let doszla = false;
  if (dystans <= krok) {
    z.x = celX;
    z.y = celY;
    doszla = true;
  } else {
    z.x += (dx / dystans) * krok;
    z.y += (dy / dystans) * krok;
  }
  ograniczDoSwojejStrony(z);
  wypchnijZPrzeszkod(z); // przez przeszkody nie da się przejść (to ważniejsze niż granica)
  return doszla;
}

// Najwyższy punkt łuku: rośnie z długością lotu, ale nie ponad maxWysokoscLuku
function wysokoscLukuSniezki(sn) {
  return Math.min(CONFIG.wysokoscLuku * sn.dlugosc, j(CONFIG.maxWysokoscLuku));
}

// Pozycja śnieżki na ziemi (cień) i wysokość nad ziemią (łuk, tylko wygląd)
function pozycjaSniezki(sn) {
  const t = sn.przebyte / sn.dlugosc;
  return {
    x: sn.startX + sn.kierX * sn.przebyte,
    y: sn.startY + sn.kierY * sn.przebyte,
    wysokosc: 4 * t * (1 - t) * wysokoscLukuSniezki(sn),
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
// a w spoczynku zawsze po prawej (z dala od przeciwników, pod prawym kciukiem).
// Nigdy nie wychodzi poza widoczny ekran, żeby dało się jej dotknąć.
function pozycjaKropki(stan) {
  const g = stan.gracz;
  let k;
  if (stan.chwyt) {
    k = { x: g.x + stan.chwyt.kropkaX, y: g.y + stan.chwyt.kropkaY };
  } else {
    k = { x: g.x + odlegloscKropkiOdSrodka(), y: g.y };
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

  // Odliczanie ogłuszenia i przeładowania (niezależnie od siebie)
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z.ogluszenie > 0) z.ogluszenie = Math.max(z.ogluszenie - dt, 0);
    if (z.przeladowanie > 0) z.przeladowanie = Math.max(z.przeladowanie - dt, 0);
  }

  // Chmurki śniegu znikają po chwili
  for (const ch of stan.chmurki) ch.czas += dt;
  stan.chmurki = stan.chmurki.filter((ch) => ch.czas < CONFIG.czasChmurki);

  // Koniec poziomu: napis, a po chwili automatyczny restart
  sprawdzKoniec(stan);
  if (stan.koniec) {
    stan.koniec.czas += dt;
    if (stan.koniec.czas >= CONFIG.czasNapisuKonca) {
      // Wygrana: następny poziom. Przegrana: ten sam poziom od nowa.
      const nastepny = stan.koniec.wynik === "wygrana" ? stan.poziom + 1 : stan.poziom;
      zacznijPoziom(stan, nastepny);
    }
    return;
  }

  // Przeciwnicy (ruch, uniki, rzuty) - logika w ai.js
  for (const p of stan.przeciwnicy) aktualizujPrzeciwnika(stan, p, dt);

  // Gracz: kropka jest sztywno przyczepiona, więc zawodnik chce stanąć tak,
  // żeby palec był w tym samym miejscu względem niego co przy złapaniu.
  const palec = stan.palec;
  if (palec) idzDo(stan.gracz, palec.x - stan.chwyt.palecX, palec.y - stan.chwyt.palecY, dt);
}

// --- Pętla gry ---
let poprzedniCzas = 0;

function klatka(teraz) {
  // Czas od poprzedniej klatki w sekundach (max 0,1 s, gdy karta była w tle)
  const dt = Math.min((teraz - poprzedniCzas) / 1000, 0.1);
  poprzedniCzas = teraz;

  aktualizuj(dt);
  rysujScene(ctx, stan);
  requestAnimationFrame(klatka);
}

// Start: najpierw napis "Ładowanie...", gra rusza po wczytaniu wszystkich obrazków
rysujTlo(ctx);
rysujNapis(ctx, "Ładowanie...");
wczytajObrazy(() => {
  zacznijPoziom(stan, 1); // od nowa, gdyby ktoś dotykał ekranu w trakcie ładowania
  poprzedniCzas = performance.now();
  requestAnimationFrame(klatka);
});
