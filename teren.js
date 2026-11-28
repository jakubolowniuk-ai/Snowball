// Rysowanie terenu mapy: siatka pól (stan.mapa.teren), każde pole ma materiał z dane/teren.js.
// W każdej klatce rysujemy tylko widoczne pola, a sąsiednie pola z tym samym materiałem
// w jednym wierszu łączymy w jeden prostokąt (mniej rysowania). Tekstura to "wzór" (pattern):
// obrazek powtarzany w nieskończoność, przyklejony do współrzędnych świata.

const _wzoryTerenu = {};

// Wzór (pattern) materiału albo null, gdy tekstura jeszcze się nie wczytała
function wzorMaterialu(ctx, id) {
  if (_wzoryTerenu[id]) return _wzoryTerenu[id];
  const m = MATERIALY[id];
  const obraz = m && OBRAZY[m.plik];
  if (!obraz) return null;
  const wzor = ctx.createPattern(obraz, "repeat");
  const skala = m.szer / obraz.width; // jednostek pola na piksel tekstury
  wzor.setTransform(new DOMMatrix().scale(skala));
  _wzoryTerenu[id] = wzor;
  return wzor;
}

// Znak w mapie -> id materiału ("." albo nieznany znak = brak)
const _materialPoZnaku = {};
for (const [id, m] of Object.entries(MATERIALY)) _materialPoZnaku[m.znak] = id;

// Materiał pola (kolumna, wiersz) albo null (brak materiału, widać tło)
function materialPola(teren, kol, wiersz) {
  const linia = teren.wiersze[wiersz];
  const znak = linia ? linia[kol] : undefined;
  if (znak !== undefined) return _materialPoZnaku[znak] || null;
  return MATERIALY[teren.domyslny] ? teren.domyslny : null; // poza wpisanymi wierszami: domyślny
}

// Rysuje teren (we współrzędnych świata, po tle, przed postaciami)
function rysujTeren(ctx) {
  const teren = stan.mapa && stan.mapa.teren;
  if (!teren) return;
  const r = teren.rozmiarPola;
  const sw = stan.swiatPelny || stan.swiat;
  const e = widokSwiata();
  const k0 = Math.max(0, Math.floor(e.x0 / r));
  const k1 = Math.min(Math.ceil(sw.x1 / r), Math.ceil(e.x1 / r));
  const w0 = Math.max(0, Math.floor(e.y0 / r));
  const w1 = Math.min(Math.ceil(sw.y1 / r), Math.ceil(e.y1 / r));
  for (let w = w0; w < w1; w++) {
    let k = k0;
    while (k < k1) {
      const id = materialPola(teren, k, w);
      let koniec = k + 1;
      while (koniec < k1 && materialPola(teren, koniec, w) === id) koniec++;
      const wzor = id && wzorMaterialu(ctx, id);
      if (wzor) {
        ctx.fillStyle = wzor;
        // Pole nie wychodzi poza świat (ostatni wiersz może być niepełny)
        const y0 = w * r;
        ctx.fillRect(k * r, y0, (koniec - k) * r, Math.min(r, sw.y1 - y0));
      }
      k = koniec;
    }
  }
}
