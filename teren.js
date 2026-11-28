// Rysowanie terenu mapy: siatka pól (stan.mapa.teren), każde pole ma materiał z dane/teren.js.
// Sąsiednie pola z tym samym materiałem w jednym wierszu łączymy w jeden prostokąt. Tekstura to "wzór" (pattern):
// obrazek powtarzany w nieskończoność, przyklejony do współrzędnych świata.

// Wzór (pattern) materiału albo null, gdy tekstura jeszcze się nie wczytała
function wzorMaterialu(ctx, id) {
  const m = MATERIALY[id];
  const obraz = m && OBRAZY[m.plik];
  if (!obraz) return null;
  const wzor = ctx.createPattern(obraz, "repeat");
  const skala = m.szer / obraz.width; // jednostek pola na piksel tekstury
  wzor.setTransform(new DOMMatrix().scale(skala));
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

// Bufor terenu: teren rysujemy RAZ do osobnych płócien (po jednym na pole gry, 1000 x 500
// jednostek), a w każdej klatce tylko je kopiujemy (jak obrazek tła). Rysowanie tekstur co klatkę
// było dla telefonu za wolne. Pola bez materiału zostają przezroczyste (widać pod nimi tło).
let _bufor = null;
let _buforMapa = null;

// Czy mapa ma jakikolwiek materiał (bez materiałów nie budujemy bufora, rysuje się samo tło)
function mapaMaTeren(mapa) {
  const t = mapa.teren;
  if (!t) return false;
  if (MATERIALY[t.domyslny] && t.wiersze.length * t.rozmiarPola < mapa.swiat.wysokoscPol * WYSOKOSC_POLA) return true;
  return t.wiersze.some((linia) => [...linia].some((z) => _materialPoZnaku[z]));
}

// Zwykłe tło w kawałku bufora: w Arenie obrazek tła, w Wielkiej arenie powtórzony śnieg
function rysujPodkladTla(c, x0, y0) {
  const obraz = OBRAZY[TLO];
  if (!obraz) return;
  if (jestWielka(stan)) {
    c.fillStyle = wzorSniegu(c, true);
    c.fillRect(x0, y0, SZEROKOSC_POLA, WYSOKOSC_POLA);
  } else {
    const s = SPRITY[TLO];
    c.drawImage(obraz, -s.poleX, -s.poleY, s.szer, s.wys);
  }
}

function zbudujBufor(mapa) {
  const teren = mapa.teren;
  const r = teren.rozmiarPola;
  const R = CONFIG.rozdzielczoscTerenu; // pikseli bufora na jednostkę pola
  const kawalki = [];
  for (let py = 0; py < mapa.swiat.wysokoscPol; py++) {
    for (let px = 0; px < mapa.swiat.szerokoscPol; px++) {
      const x0 = px * SZEROKOSC_POLA;
      const y0 = py * WYSOKOSC_POLA;
      const plotno = document.createElement("canvas");
      plotno.width = Math.round(SZEROKOSC_POLA * R);
      plotno.height = Math.round(WYSOKOSC_POLA * R);
      const c = plotno.getContext("2d");
      c.scale(R, R);
      c.translate(-x0, -y0);
      // Najpierw zwykłe tło (pod polami bez materiału), żeby w grze nie rysować go drugi raz
      rysujPodkladTla(c, x0, y0);
      const k0 = Math.floor(x0 / r);
      const k1 = Math.ceil((x0 + SZEROKOSC_POLA) / r);
      const w0 = Math.floor(y0 / r);
      const w1 = Math.ceil((y0 + WYSOKOSC_POLA) / r);
      for (let w = w0; w < w1; w++) {
        let k = k0;
        while (k < k1) {
          const id = materialPola(teren, k, w);
          let koniec = k + 1;
          while (koniec < k1 && materialPola(teren, koniec, w) === id) koniec++;
          const wzor = id && wzorMaterialu(c, id);
          if (wzor) {
            c.fillStyle = wzor;
            c.fillRect(k * r, w * r, (koniec - k) * r, r);
          }
          k = koniec;
        }
      }
      kawalki.push({ x: x0, y: y0, plotno });
    }
  }
  return kawalki;
}

// Gotowy bufor terenu tej mapy albo null (mapa bez materiałów albo tekstury jeszcze się wczytują)
function buforTerenu() {
  const mapa = stan.mapa;
  if (!mapa || !mapa.teren) return null;
  if (_buforMapa !== mapa) {
    if (!mapaMaTeren(mapa)) return null;
    // Bufor budujemy dopiero, gdy tekstury i tło są wczytane (inaczej zostałby pusty)
    if (!OBRAZY[TLO] || Object.values(MATERIALY).some((m) => !OBRAZY[m.plik])) return null;
    _bufor = zbudujBufor(mapa);
    _buforMapa = mapa;
  }
  return _bufor;
}

// Rysuje teren razem z tłem pod nim (we współrzędnych świata): kopiuje gotowe kawałki bufora
function rysujTeren(ctx) {
  const bufor = buforTerenu();
  if (!bufor) return;
  for (const k of bufor) {
    if (!naEkranie(k.x + SZEROKOSC_POLA / 2, k.y + WYSOKOSC_POLA / 2, SZEROKOSC_POLA)) continue;
    ctx.drawImage(k.plotno, k.x, k.y, SZEROKOSC_POLA, WYSOKOSC_POLA);
  }
}
