// Bonusy: ozdoby choinkowe, które pojawiają się przy przekątnej.
// Kto trafi ozdobę śnieżką, dostaje bonus (zdobywa ten, kto rzucił).
// Bonus na planszy: { typ, x, y, zostalo } - x, y to środek kuli (jak środek postaci).
// Bonus postaci: { typ, pozostalo } w liście z.bonusy.

const B = () => CONFIG.bonusy; // skrót do ustawień bonusów

function typBonusu(id) {
  return B().typy.find((t) => t.id === id);
}

// Ile bonusów naraz może leżeć na planszy na tym poziomie
function maxBonusowNaraz(stan) {
  const lista = B().maxNaraz;
  return lista[Math.min(stan.poziom, lista.length) - 1];
}

// Na początku poziomu: pusta plansza, licznik do pierwszego bonusu
function zacznijBonusy(stan) {
  stan.bonusy = [];
  stan.doBonusu = B().pierwszyPoSekundach;
}

// Losowanie typu według wag
function losujTypBonusu() {
  const typy = B().typy;
  const suma = typy.reduce((s, t) => s + t.waga, 0);
  let r = Math.random() * suma;
  for (const t of typy) {
    r -= t.waga;
    if (r <= 0) return t;
  }
  return typy[typy.length - 1];
}

// Czy w punkcie (x, y) można położyć bonus?
function dobreMiejsceBonusu(stan, x, y) {
  const r = j(B().promienTrafienia);
  const stopy = PROMIEN_POSTACI * 0.85; // bonus "stoi" jak postać: ziemia jest niżej niż środek
  // W polu gry z marginesem
  const m = j(B().marginesKrawedzi);
  if (x < m || x > SZEROKOSC_POLA - m || y < m || y > WYSOKOSC_POLA - m) return false;
  // Nie w podstawie przeszkody (plus zapas)
  const zapas = j(B().zapasPrzeszkody) + r;
  for (const p of przeszkody()) {
    const dx = (x - p.x) / (p.rx + zapas);
    const dy = (y + stopy - p.y) / (p.ry + zapas);
    if (dx * dx + dy * dy < 1) return false;
  }
  // Nie w strefie pada (pad liczony w jednostkach pola, dla obecnego ekranu)
  const pad = pozycjaPada();
  if (odleglosc(x, y, pad.x, pad.y) < j(CONFIG.promienPadu) + j(CONFIG.promienDotykuPadu) + r) return false;
  // Nie za blisko żadnej postaci
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (odleglosc(x, y, z.x, z.y) < j(B().odstepOdPostaci)) return false;
  }
  // Gracz musi móc go trafić: odcinek od gracza nie przecina przeszkody
  const g = stan.gracz;
  if (przeszkodaNaOdcinku(g.x, g.y + stopy, x, y + stopy)) return false;
  // Nie na innym bonusie
  for (const b of stan.bonusy) {
    if (odleglosc(x, y, b.x, b.y) < r * 4) return false;
  }
  return true;
}

// Próbuje położyć nowy bonus w pasie wokół przekątnej. Zwraca true, gdy się udało.
function polozBonus(stan) {
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  const dl = Math.hypot(1 / W, 1 / H);
  const nx = 1 / W / dl; // kierunek prostopadły do przekątnej
  const ny = 1 / H / dl;
  const pol = j(B().pasPrzekatnej) / 2;
  for (let proba = 0; proba < 30; proba++) {
    const t = Math.random(); // miejsce wzdłuż przekątnej
    const o = (Math.random() * 2 - 1) * pol; // przesunięcie w poprzek
    const x = t * W + nx * o;
    const y = (1 - t) * H + ny * o;
    if (dobreMiejsceBonusu(stan, x, y)) {
      const typ = losujTypBonusu();
      stan.bonusy.push({ typ: typ.id, x, y, zostalo: B().czasZycia });
      return true;
    }
  }
  return false;
}

// Co klatkę (poza napisem "Level N" i końcem poziomu): pojawianie, znikanie,
// odliczanie aktywnych bonusów postaci
function aktualizujBonusy(stan, dt) {
  if (stan.czasPoziomu <= CONFIG.czasNapisuLevel) return;

  for (const b of stan.bonusy) b.zostalo -= dt;
  stan.bonusy = stan.bonusy.filter((b) => b.zostalo > 0);

  stan.doBonusu -= dt;
  if (stan.doBonusu <= 0 && stan.bonusy.length < maxBonusowNaraz(stan)) {
    if (polozBonus(stan)) {
      stan.doBonusu = losuj(B().odstepMin, B().odstepMax);
    } else {
      stan.doBonusu = 1; // brak dobrego miejsca: spróbujemy za sekundę
    }
  }

  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    for (const ab of z.bonusy) ab.pozostalo -= dt;
    z.bonusy = z.bonusy.filter((ab) => ab.pozostalo > 0);
  }
}

// Czy śnieżka może zebrać bonus? (w kroku B1 tylko śnieżki gracza)
function sniezkaZbieraBonusy(stan, sn) {
  return sn.rzucajacy === stan.gracz || B().przeciwnicyZbierajaBonusy;
}

// Rzucający z zdobywa bonus b: bonus znika z chmurką, postać dostaje (albo odnawia) bonus
function zdobadzBonus(stan, z, b) {
  stan.bonusy = stan.bonusy.filter((x) => x !== b);
  stan.chmurki.push({
    x: b.x,
    y: b.y,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: null,
  });
  const typ = typBonusu(b.typ);
  const juz = z.bonusy.find((ab) => ab.typ === b.typ);
  if (juz) juz.pozostalo = typ.czasTrwania; // ponowne zdobycie odnawia czas
  else z.bonusy.push({ typ: b.typ, pozostalo: typ.czasTrwania });
}

// Bombka (tarcza): pochłania jedno trafienie. Zwraca true, gdy pochłonęła.
function tarczaPochlania(stan, z) {
  const tarcza = z.bonusy.find((ab) => ab.typ === "bombka");
  if (!tarcza) return false;
  z.bonusy = z.bonusy.filter((ab) => ab !== tarcza);
  // Bańka pęka: chmurka śniegu na wysokości tułowia
  stan.chmurki.push({
    x: z.x,
    y: stopyY(z) - rozmiarGrafiki(grafikaPostaci(z)).wys * 0.45,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: null,
  });
  return true;
}
