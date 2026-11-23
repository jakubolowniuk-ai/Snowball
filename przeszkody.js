// Przeszkody: dekoracje z config.js (choinki, bałwany, płotki, forty).
// Każda ma "podstawę", czyli owal na ziemi. W podstawie zatrzymują się śnieżki
// i nie mogą w nią wejść zawodnicy (stopy zawodnika zostają poza owalem).

let _przeszkody = null;
let _przeszkodyTryb = null;

// Lista przeszkód w jednostkach pola (liczona raz na tryb, przy pierwszym użyciu).
// Wielka arena ma własną, dłuższą listę dekoracji.
function przeszkody() {
  if (_przeszkody && _przeszkodyTryb === stan.tryb) return _przeszkody;
  _przeszkodyTryb = stan.tryb;
  const lista = jestWielka(stan) ? CONFIG.tryby.wielkaArena.dekoracje : CONFIG.dekoracje;
  _przeszkody = lista.map((d) => {
    const sciezka = `assets/dekoracje/${d.plik}.png`;
    const szer = SPRITY[sciezka].szer * CONFIG.skalaGrafik;
    return {
      sciezka,
      x: j(d.x),
      y: j(d.y), // środek podstawy (tu stoi dekoracja)
      rx: szer * CONFIG.podstawaSzerokosc, // połowa szerokości owalu
      ry: szer * CONFIG.podstawaGlebokosc, // połowa głębokości owalu
    };
  });
  return _przeszkody;
}

// Czy odcinek (ax, ay)-(bx, by) przecina podstawę przeszkody p?
// Liczymy w "spłaszczonych" współrzędnych, w których owal staje się kołem o promieniu 1.
function odcinekPrzecinaPodstawe(p, ax, ay, bx, by) {
  const d = odlegloscOdOdcinka(0, 0, (ax - p.x) / p.rx, (ay - p.y) / p.ry, (bx - p.x) / p.rx, (by - p.y) / p.ry);
  return d <= 1;
}

// Pierwsza przeszkoda, w którą wjeżdża odcinek (najbliżej jego początku), albo null
function przeszkodaNaOdcinku(ax, ay, bx, by) {
  let pierwsza = null;
  let najblizej = Infinity;
  for (const p of przeszkody()) {
    if (!odcinekPrzecinaPodstawe(p, ax, ay, bx, by)) continue;
    const d = Math.hypot(p.x - ax, p.y - ay);
    if (d < najblizej) {
      najblizej = d;
      pierwsza = p;
    }
  }
  return pierwsza;
}

// Owal, w który nie mogą wejść stopy zawodnika: podstawa powiększona o "grubość" stóp
function owalDlaStop(p) {
  return { rx: p.rx + PROMIEN_POSTACI * 0.5, ry: p.ry + PROMIEN_POSTACI * 0.25 };
}

// Czy punkt stóp (x, y) jest w którejś przeszkodzie?
function stopyWPrzeszkodzie(x, y) {
  return przeszkody().some((p) => {
    const o = owalDlaStop(p);
    const dx = (x - p.x) / o.rx;
    const dy = (y - p.y) / o.ry;
    return dx * dx + dy * dy < 1;
  });
}

// Wypycha zawodnika z przeszkód na brzeg owalu (dzięki temu "ślizga się" po przeszkodzie)
function wypchnijZPrzeszkod(z) {
  const przesuniecieStop = PROMIEN_POSTACI * 0.85; // stopy są niżej niż środek zawodnika
  for (const p of przeszkody()) {
    const o = owalDlaStop(p);
    let dx = (z.x - p.x) / o.rx;
    let dy = (z.y + przesuniecieStop - p.y) / o.ry;
    const d2 = dx * dx + dy * dy;
    if (d2 >= 1) continue;
    if (d2 === 0) dy = -1; // dokładnie w środku: wypychamy do góry
    const k = 1 / Math.sqrt(dx * dx + dy * dy);
    z.x = p.x + dx * k * o.rx;
    z.y = p.y + dy * k * o.ry - przesuniecieStop;
  }
}
