// Przeszkody: dekoracje z mapy (stan.mapa), opisane w dane/dekoracje.js.
// Dekoracja z kolizją "owal" ma "podstawę", czyli owal na ziemi: w podstawie zatrzymują się
// śnieżki i nie mogą w nią wejść zawodnicy (stopy zawodnika zostają poza owalem).
// Dekoracja z kolizją "brak" to sama ozdoba (rysujemy ją, ale nic nie blokuje).

let _przeszkody = null;
let _przeszkodyMapa = null;

// Lista dekoracji mapy w jednostkach pola (liczona raz na mapę, przy pierwszym użyciu)
function wszystkieDekoracje() {
  if (_przeszkody && _przeszkodyMapa === stan.mapa) return _przeszkody;
  _przeszkodyMapa = stan.mapa;
  _przeszkody = stan.mapa.dekoracje
    .filter((d) => DEKORACJE[d.id])
    .map((d) => {
      const opis = DEKORACJE[d.id];
      return {
        sciezka: opis.plik,
        x: j(d.x),
        y: j(d.y), // środek podstawy (tu stoi dekoracja)
        rx: (opis.podstawa.szer / 2) * CONFIG.skalaGrafik, // połowa szerokości owalu
        ry: (opis.podstawa.wys / 2) * CONFIG.skalaGrafik, // połowa głębokości owalu
        kolizja: opis.kolizja !== "brak",
        naZiemi: opis.warstwa === "ziemia", // rysowana zawsze pod postaciami
      };
    });
  return _przeszkody;
}

// Tylko dekoracje, które blokują ruch i śnieżki
function przeszkody() {
  return wszystkieDekoracje().filter((p) => p.kolizja);
}

// Nowy poziom: lista przeszkód od nowa (zamieć mogła część usunąć)
function resetPrzeszkod() {
  _przeszkody = null;
}

// Zamieć: przeszkody poza granicą świata znikają z chmurką
function usunPrzeszkodyPoza(stan) {
  const lista = wszystkieDekoracje();
  for (let i = lista.length - 1; i >= 0; i--) {
    const p = lista[i];
    if (pozaGranica(stan, p.x, p.y, 0)) {
      chmurkaZamieci(stan, p.x, p.y - 20);
      lista.splice(i, 1);
    }
  }
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
