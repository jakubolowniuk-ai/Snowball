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
}

// --- Kamera ---
const kamera = { x: 0, y: 0 };

// Gdzie kamera chce być: gracz na środku okna, ale okno nie wychodzi poza świat
function celKamery(stan) {
  const s = stan.swiat;
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
