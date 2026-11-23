// Tryby gry (Arena, Wielka arena), świat, kamera i menu.
// Świat: obszar, po którym chodzą postacie (jednostki pola). W Arenie świat = pole gry.
// Kamera: okno wielkości jednego pola, które pokazuje fragment świata.
// kamera.x, kamera.y to lewy górny róg okna w świecie (w Arenie zawsze 0, 0).

const WA = () => CONFIG.tryby.wielkaArena; // skrót do ustawień Wielkiej areny

function jestWielka(stan) {
  return stan.tryb === "wielkaArena";
}

// Granice świata dla obecnego trybu
function ustawSwiat(stan) {
  if (jestWielka(stan)) {
    stan.swiat = { x0: 0, y0: 0, x1: SZEROKOSC_POLA * WA().swiatSzerokosc, y1: WYSOKOSC_POLA * WA().swiatWysokosc };
  } else {
    stan.swiat = { x0: 0, y0: 0, x1: SZEROKOSC_POLA, y1: WYSOKOSC_POLA };
  }
  // Pełny świat na starcie (zamieć zwęża stan.swiat, a ten zostaje bez zmian)
  stan.swiatPelny = { ...stan.swiat };
}

// --- Zamieć (Wielka arena) ---
// Po czasDoZwezania sekundach granice świata (stan.swiat) zwężają się liniowo
// przez czasZwezania sekund do rozmiaru jednego pola, w stronę środka świata.

function postepZamieci(stan) {
  const t = stan.czasPoziomu - WA().czasDoZwezania;
  return Math.min(Math.max(t / WA().czasZwezania, 0), 1); // 0 = pełny świat, 1 = jedno pole
}

// Czy punkt jest poza obecnymi granicami (z zapasem)?
function pozaGranica(stan, x, y, zapas) {
  const s = stan.swiat;
  return x < s.x0 - zapas || x > s.x1 + zapas || y < s.y0 - zapas || y > s.y1 + zapas;
}

function chmurkaZamieci(stan, x, y) {
  stan.chmurki.push({
    x,
    y,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: null,
  });
}

function aktualizujZamiec(stan, dt) {
  if (!jestWielka(stan)) return;
  // Nowe granice: liniowo od pełnego świata do jednego pola wokół środka
  const p = postepZamieci(stan);
  const P = stan.swiatPelny;
  const sx = (P.x0 + P.x1) / 2;
  const sy = (P.y0 + P.y1) / 2;
  const koniec = { x0: sx - SZEROKOSC_POLA / 2, y0: sy - WYSOKOSC_POLA / 2, x1: sx + SZEROKOSC_POLA / 2, y1: sy + WYSOKOSC_POLA / 2 };
  for (const k of ["x0", "y0", "x1", "y1"]) stan.swiat[k] = P[k] + (koniec[k] - P[k]) * p;
  if (p <= 0) return;

  // Przeszkody, stanowiska i bonusy poza granicą znikają z chmurką
  usunPrzeszkodyPoza(stan);
  for (const st of stan.stanowiska) {
    if (st.amunicja >= 0 && !st.zniknelo && pozaGranica(stan, st.x, st.y, 0)) {
      st.amunicja = 0; // przeciwnicy od razu je zostawią
      st.zniknelo = true;
      chmurkaZamieci(stan, st.x, st.y - 15);
    }
  }
  stan.stanowiska = stan.stanowiska.filter((st) => !st.zniknelo);
  for (const b of stan.bonusy) if (pozaGranica(stan, b.x, b.y, 0)) chmurkaZamieci(stan, b.x, b.y);
  stan.bonusy = stan.bonusy.filter((b) => !pozaGranica(stan, b.x, b.y, 0));

  // Wiatr: postać poza granicą jest spychana do środka (przez przeszkody, bez obrażeń)
  const v = j(WA().predkoscWiatru) * dt;
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z.wyeliminowany) continue;
    z.wiatr = pozaGranica(stan, z.x, z.y, -PROMIEN_POSTACI);
    if (!z.wiatr) continue;
    const dx = sx - z.x;
    const dy = sy - z.y;
    const d = Math.hypot(dx, dy) || 1;
    z.x += (dx / d) * Math.min(v, d);
    z.y += (dy / d) * Math.min(v, d);
  }
}

// Ostrzeżenie: ostatnie sekundy przed zwężaniem
function ostrzezenieZamieci(stan) {
  if (!jestWielka(stan)) return false;
  const doZwezania = WA().czasDoZwezania - stan.czasPoziomu;
  return doZwezania > 0 && doZwezania <= WA().ostrzezenieZamieci;
}

// Zamieć na brzegu: poza granicą biała mgła, przy granicy płynne przejście
function rysujZamiec(ctx, stan) {
  if (!jestWielka(stan) || postepZamieci(stan) <= 0) return;
  const s = stan.swiat;
  const e = widokSwiata();
  const g = j(WA().szerokoscZamieci);
  const mgla = WA().gestoscZamieci;
  const kolor = WA().kolorZamieci; // "r, g, b"
  ctx.save();
  ctx.fillStyle = `rgba(${kolor}, ${mgla})`;
  ctx.fillRect(e.x0, e.y0, e.x1 - e.x0, s.y0 - e.y0); // nad granicą
  ctx.fillRect(e.x0, s.y1, e.x1 - e.x0, e.y1 - s.y1); // pod
  ctx.fillRect(e.x0, s.y0, s.x0 - e.x0, s.y1 - s.y0); // na lewo
  ctx.fillRect(s.x1, s.y0, e.x1 - s.x1, s.y1 - s.y0); // na prawo
  const brzegi = [
    [s.x0, s.y0, s.x0, s.y0 + g, s.x0, s.y0, s.x1 - s.x0, g],
    [s.x0, s.y1, s.x0, s.y1 - g, s.x0, s.y1 - g, s.x1 - s.x0, g],
    [s.x0, s.y0, s.x0 + g, s.y0, s.x0, s.y0, g, s.y1 - s.y0],
    [s.x1, s.y0, s.x1 - g, s.y0, s.x1 - g, s.y0, g, s.y1 - s.y0],
  ];
  for (const [x1, y1, x2, y2, rx, ry, rw, rh] of brzegi) {
    const gr = ctx.createLinearGradient(x1, y1, x2, y2);
    gr.addColorStop(0, `rgba(${kolor}, ${mgla})`);
    gr.addColorStop(1, `rgba(${kolor}, 0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(rx, ry, rw, rh);
  }
  // Płatki śniegu niesione wiatrem w mgle (proste kreski, przesuwają się z czasem)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  const t = stan.czasPoziomu;
  for (let i = 0; i < 80; i++) {
    const x = e.x0 + ((i * 137.5 + t * 160) % (e.x1 - e.x0));
    const y = e.y0 + ((i * 71.3 + t * 40) % (e.y1 - e.y0));
    if (!pozaGranica(stan, x, y, -g * 0.5)) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y + 3);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Kamera ---
const kamera = { x: 0, y: 0 };

// Gdzie kamera chce być: gracz na środku okna, ale okno nie wychodzi poza świat.
// W trakcie zwężania trzyma się pełnego świata (żeby było widać zamieć),
// po zwężeniu do jednego pola staje w miejscu.
function celKamery(stan) {
  const s = jestWielka(stan) && postepZamieci(stan) < 1 ? stan.swiatPelny : stan.swiat;
  const x = stan.gracz.x - SZEROKOSC_POLA / 2;
  const y = stan.gracz.y - WYSOKOSC_POLA / 2;
  return {
    x: Math.min(Math.max(x, s.x0), Math.max(s.x0, s.x1 - SZEROKOSC_POLA)),
    y: Math.min(Math.max(y, s.y0), Math.max(s.y0, s.y1 - WYSOKOSC_POLA)),
  };
}

// Kamera od razu na miejscu (start poziomu)
function ustawKamere(stan) {
  if (!jestWielka(stan)) {
    kamera.x = 0;
    kamera.y = 0;
    return;
  }
  const c = celKamery(stan);
  kamera.x = c.x;
  kamera.y = c.y;
}

// Kamera łagodnie podąża za graczem (im większe wygladzanieKamery, tym szybciej)
function aktualizujKamere(stan, dt) {
  if (!jestWielka(stan)) return;
  const c = celKamery(stan);
  const k = 1 - Math.exp(-WA().wygladzanieKamery * dt);
  kamera.x += (c.x - kamera.x) * k;
  kamera.y += (c.y - kamera.y) * k;
}

// Punkt z okna ekranu (jednostki pola) na punkt w świecie
function oknoNaSwiat(p) {
  return { x: p.x + kamera.x, y: p.y + kamera.y };
}

// Widoczny fragment świata (cały ekran, razem z marginesami)
function widokSwiata() {
  return { x0: widoczny.x0 + kamera.x, y0: widoczny.y0 + kamera.y, x1: widoczny.x1 + kamera.x, y1: widoczny.y1 + kamera.y };
}

// Czy punkt świata jest na ekranie (z zapasem)?
function naEkranie(x, y, zapas) {
  const w = widokSwiata();
  return x >= w.x0 - zapas && x <= w.x1 + zapas && y >= w.y0 - zapas && y <= w.y1 + zapas;
}

// --- Start w Wielkiej arenie ---

// Przeciwnicy na linii w lewej górnej części świata (jak w Arenie, ale w większym świecie)
function pozycjePrzeciwnikowWielka(n) {
  const a = WA().liniaPrzeciwnikow;
  const W = WA().swiatSzerokosc; // w ułamkach szerokości pola
  const H = WA().swiatWysokosc / CONFIG.ASPECT;
  const pozycje = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    pozycje.push({ x: t * a * W, y: (1 - t) * a * H });
  }
  return pozycje;
}

// --- Przeciwnik w Wielkiej arenie ---

// Rzuca tylko, gdy sam jest w widoku kamery (gracz go widzi), gracz jest w zasięgu
// i między nimi nie ma przeszkody
function mozeRzucicWielka(stan, z) {
  const g = stan.gracz;
  if (!naEkranie(z.x, z.y, j(WA().marginesWidoku))) return false;
  if (odleglosc(z.x, z.y, g.x, g.y) > j(WA().maxOdlegloscRzutuAI)) return false;
  const stopy = PROMIEN_POSTACI * 0.85;
  return !przeszkodaNaOdcinku(z.x, z.y + stopy, g.x, g.y + stopy);
}

// Dokąd iść: daleko od gracza - podchodzi, za blisko - cofa się, w sam raz - kręci się w pobliżu
function celWielkiejAreny(stan, z) {
  const g = stan.gracz;
  const d = odleglosc(z.x, z.y, g.x, g.y) || 1;
  const idealna = j(WA().odlegloscAI);
  const kx = (z.x - g.x) / d; // kierunek od gracza do przeciwnika
  const ky = (z.y - g.y) / d;
  let x;
  let y;
  if (d > idealna * 1.25 || d < idealna * 0.6) {
    // Punkt na linii gracz-przeciwnik w odległości idealnej, z małym losowym przesunięciem
    const bok = losuj(-0.3, 0.3) * idealna;
    x = g.x + kx * idealna - ky * bok;
    y = g.y + ky * idealna + kx * bok;
  } else {
    const kat = Math.random() * Math.PI * 2;
    const odl = j(CONFIG.wedrowka) * losuj(0.3, 1);
    x = z.x + Math.cos(kat) * odl;
    y = z.y + Math.sin(kat) * odl;
  }
  const cel = { druzyna: z.druzyna, x, y };
  ograniczDoSwojejStrony(cel);
  return cel;
}

// --- Strzałki do przeciwników poza ekranem ---

// Rysowane w oknie ekranu (bez kamery): przy krawędzi, w stronę przeciwnika
function rysujStrzalki(ctx, stan) {
  if (!jestWielka(stan)) return;
  const m = j(WA().strzalkaMargines);
  const r = j(WA().strzalkaRozmiar);
  const srodekX = (widoczny.x0 + widoczny.x1) / 2;
  const srodekY = (widoczny.y0 + widoczny.y1) / 2;
  for (const z of stan.przeciwnicy) {
    if (z.wyeliminowany || naEkranie(z.x, z.y, 0)) continue;
    // Kierunek od środka ekranu do przeciwnika (w oknie ekranu)
    const dx = z.x - kamera.x - srodekX;
    const dy = z.y - kamera.y - srodekY;
    // Punkt na krawędzi ekranu (z marginesem) w tym kierunku
    const polW = (widoczny.x1 - widoczny.x0) / 2 - m;
    const polH = (widoczny.y1 - widoczny.y0) / 2 - m;
    const k = Math.min(polW / Math.abs(dx || 1e-6), polH / Math.abs(dy || 1e-6));
    const x = srodekX + dx * k;
    const y = srodekY + dy * k;
    const kat = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(kat);
    ctx.fillStyle = CONFIG.kolorZielony;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = r * 0.25;
    ctx.beginPath();
    ctx.moveTo(r * 1.2, 0);
    ctx.lineTo(-r * 0.8, -r * 0.9);
    ctx.lineTo(-r * 0.4, 0);
    ctx.lineTo(-r * 0.8, r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// --- Menu ---

const menu = document.getElementById("menu");
const przyciskMenu = document.getElementById("przyciskMenu");

function pokazMenu(stan) {
  stan.wMenu = true;
  kamera.x = 0; // tło za menu bez przesunięcia
  kamera.y = 0;
  menu.style.display = "flex";
  przyciskMenu.style.display = "none";
  puscPad();
  stan.celowanie = null;
}

function zacznijTryb(stan, tryb) {
  stan.tryb = tryb;
  stan.wMenu = false;
  menu.style.display = "none";
  zacznijPoziom(stan, 1);
}

document.getElementById("przyciskArena").addEventListener("click", () => zacznijTryb(stan, "arena"));
document.getElementById("przyciskWielka").addEventListener("click", () => zacznijTryb(stan, "wielkaArena"));
przyciskMenu.addEventListener("click", () => pokazMenu(stan));

// Mały przycisk "Menu" widać tylko na ekranie końca poziomu
function aktualizujPrzyciskMenu(stan) {
  const pokaz = !stan.wMenu && !!stan.koniec;
  przyciskMenu.style.display = pokaz ? "block" : "none";
}
