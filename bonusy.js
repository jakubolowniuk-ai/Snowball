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
  const lista = jestWielka(stan) ? CONFIG.tryby.wielkaArena.bonusyMaxNaraz : B().maxNaraz;
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
  if (B().wymusTyp) return typBonusu(B().wymusTyp); // tryb testowy: zawsze ten typ
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
  const sw = stan.swiat;
  if (x < sw.x0 + m || x > sw.x1 - m || y < sw.y0 + m || y > sw.y1 - m) return false;
  // Nie w podstawie przeszkody (plus zapas)
  const zapas = j(B().zapasPrzeszkody) + r;
  for (const p of przeszkody()) {
    const dx = (x - p.x) / (p.rx + zapas);
    const dy = (y + stopy - p.y) / (p.ry + zapas);
    if (dx * dx + dy * dy < 1) return false;
  }
  // Nie na stanowisku (stos, armatka i miejsce stania)
  if (bliskoStanowiska(stan, x, y + stopy, r + j(B().zapasPrzeszkody))) return false;
  // Nie w strefie pada (pad liczony w jednostkach pola, dla obecnego ekranu)
  const pad = oknoNaSwiat(pozycjaPada()); // pad jest na ekranie, przeliczamy na świat
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
  if (jestWielka(stan)) return polozBonusWielka(stan);
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

// Wielka arena: losowy punkt w całym aktualnym świecie (te same reguły miejsca)
function polozBonusWielka(stan) {
  const sw = stan.swiat;
  for (let proba = 0; proba < 30; proba++) {
    const x = losuj(sw.x0, sw.x1);
    const y = losuj(sw.y0, sw.y1);
    if (dobreMiejsceBonusu(stan, x, y)) {
      stan.bonusy.push({ typ: losujTypBonusu().id, x, y, zostalo: B().czasZycia });
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
      const wa = CONFIG.tryby.wielkaArena;
      stan.doBonusu = jestWielka(stan)
        ? losuj(wa.bonusyOdstepMin, wa.bonusyOdstepMax)
        : losuj(B().odstepMin, B().odstepMax);
    } else {
      stan.doBonusu = 1; // brak dobrego miejsca: spróbujemy za sekundę
    }
  }

  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    for (const ab of z.bonusy) {
      ab.pozostalo -= dt;
      if (ab.typ === "upicie") aktualizujUpicie(ab, dt);
    }
    z.bonusy = z.bonusy.filter((ab) => ab.pozostalo > 0);
  }
}

// Czy śnieżka może zebrać bonus? (w kroku B1 tylko śnieżki gracza)
function sniezkaZbieraBonusy(stan, sn) {
  return sn.rzucajacy === stan.gracz || B().przeciwnicyZbierajaBonusy;
}

// Ile sekund trwa efekt danego typu (Upicie ma ustawienia we własnej sekcji)
function czasTrwaniaTypu(typ) {
  return typ.id === "upicie" ? B().upicie.czasTrwania : typ.czasTrwania;
}

// Daje postaci z efekt typu id albo odnawia jego czas (jeden danego typu naraz)
function dodajEfekt(z, id) {
  const typ = typBonusu(id);
  let ab = z.bonusy.find((x) => x.typ === id);
  if (!ab) {
    ab = { typ: id };
    z.bonusy.push(ab);
  }
  ab.pozostalo = czasTrwaniaTypu(typ);
  if (typ.rzuty) ab.rzuty = typ.rzuty; // Gwiazdka, Pełna siła: ile rzutów zostało
  return ab;
}

// Czy postać ma teraz efekt typu id?
function maEfekt(z, id) {
  return z.bonusy.some((ab) => ab.typ === id);
}

// Rzut postaci z zużywa jeden rzut efektu id (gdy rzuty się skończą, efekt znika)
function zuzyjRzutEfektu(z, id) {
  const ab = z.bonusy.find((x) => x.typ === id);
  if (!ab) return;
  ab.rzuty -= 1;
  if (ab.rzuty <= 0) z.bonusy = z.bonusy.filter((x) => x !== ab);
}

// Biały obłoczek śniegu w punkcie (x, y)
function chmurkaSniegu(stan, x, y) {
  stan.chmurki.push({
    x,
    y,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: null,
  });
}

// Rzucający z zdobywa bonus b: bonus znika z chmurką, postać dostaje (albo odnawia) bonus
function zdobadzBonus(stan, z, b) {
  stan.bonusy = stan.bonusy.filter((x) => x !== b);
  const typ = typBonusu(b.typ);

  // Upicia nikt nie zbiera: wybucha w miejscu bonusu i upija wszystkich żywych w kręgu
  // (wszystkie drużyny, także rzucającego, jeśli stoi w kręgu)
  if (typ.id === "upicie") {
    const promien = j(B().upicie.promien);
    stan.chmurki.push({ wybuch: true, x: b.x, y: b.y, promien, kolor: typ.kolor, czas: 0 });
    for (const p of [stan.gracz, ...stan.przeciwnicy]) {
      if (p.wyeliminowany || odleglosc(p.x, p.y, b.x, b.y) > promien) continue;
      const ab = dodajEfekt(p, "upicie");
      if (ab.kat === undefined) {
        ab.kat = 0; // obecny skręt ruchu (radiany)
        ab.katCel = 0; // skręt, do którego kąt płynnie dochodzi
        ab.doZmiany = 0; // za ile sekund nowy losowy skręt
      }
    }
    return;
  }

  if (z.wyeliminowany) return; // rzucający odpadł, zanim śnieżka doleciała
  chmurkaSniegu(stan, b.x, b.y);

  // Pierniczek działa od razu: zdejmuje jedno trafienie (jeśli jest) i pokazuje serduszko
  if (typ.id === "pierniczek") {
    if (z.trafienia > 0) z.trafienia -= 1;
    stan.chmurki.push({ serce: z, czas: 0, trwa: B().czasSerduszka });
    return;
  }

  // Spowolnienie przeciwników: efekt dostają wszyscy żywi z drużyny przeciwnej
  if (typ.id === "spowolnieniePrzeciwnikow") {
    for (const p of [stan.gracz, ...stan.przeciwnicy]) {
      if (!p.wyeliminowany && p.druzyna !== z.druzyna) dodajEfekt(p, typ.id);
    }
    return;
  }

  dodajEfekt(z, typ.id);
}

// Upicie: skręt ruchu płynnie dochodzi do losowego kąta, nowy kąt co zmianaCo s
function aktualizujUpicie(ab, dt) {
  const u = B().upicie;
  ab.doZmiany -= dt;
  if (ab.doZmiany <= 0) {
    ab.katCel = (losuj(-u.maxSkret, u.maxSkret) * Math.PI) / 180;
    ab.doZmiany = losuj(u.zmianaCo[0], u.zmianaCo[1]);
  }
  // Tak, żeby kąt doszedł do celu dokładnie w chwili następnej zmiany
  ab.kat += (ab.katCel - ab.kat) * Math.min(1, dt / ab.doZmiany);
}

// Kierunek ruchu (dx, dy) obrócony o skręt upicia (bez upicia bez zmian)
function kierunekPoUpiciu(z, dx, dy) {
  const ab = z.bonusy.find((x) => x.typ === "upicie");
  if (!ab) return { dx, dy };
  const c = Math.cos(ab.kat);
  const s = Math.sin(ab.kat);
  return { dx: dx * c - dy * s, dy: dx * s + dy * c };
}

// Bombka (tarcza) na jedno trafienie. Zwraca true, gdy zatrzymała trafienie.
// Z odbija: true śnieżka sn wraca do miejsca, gdzie teraz stoi rzucający (ta sama prędkość),
// a pierwotna znika. Odbita śnieżka nie odbija się drugi raz: trafia normalnie, mimo Bombki.
// Z odbija: false Bombka tylko pochłania trafienie (stare zachowanie).
function tarczaPochlania(stan, z, sn) {
  const tarcza = z.bonusy.find((ab) => ab.typ === "bombka");
  if (!tarcza) return false;
  const odbija = typBonusu("bombka").odbija;
  if (odbija && sn && sn.odbita) return false;
  z.bonusy = z.bonusy.filter((ab) => ab !== tarcza);
  // Bańka pęka: chmurka śniegu na wysokości tułowia
  chmurkaSniegu(stan, z.x, stopyY(z) - rozmiarPostaci(z).wys * 0.45);
  const r = sn && sn.rzucajacy;
  if (odbija && r && !r.wyeliminowany) {
    const d = odleglosc(z.x, z.y, r.x, r.y);
    if (d > 0) {
      stan.sniezki.push({
        rzucajacy: z, // odbijającego nie trafia; bonus po drodze dostaje odbijający
        startX: z.x,
        startY: z.y,
        kierX: (r.x - z.x) / d,
        kierY: (r.y - z.y) / d,
        dlugosc: d,
        predkosc: sn.predkosc,
        przebyte: 0,
        odbita: true,
      });
    }
  }
  return true;
}

// Mnożnik prędkości śnieżki sn: Spowolnienie śnieżek u kogoś żywego z drużyny przeciwnej
// rzucającemu. Liczony co klatkę, więc działa też na śnieżki już w locie.
function mnoznikPredkosciSniezki(stan, sn) {
  const druzyna = sn.rzucajacy.druzyna;
  const ktos = [stan.gracz, ...stan.przeciwnicy].some(
    (p) => !p.wyeliminowany && p.druzyna !== druzyna && maEfekt(p, "spowolnienieSniezek")
  );
  return ktos ? typBonusu("spowolnienieSniezek").mnoznikPredkosci : 1;
}

// Mnożnik przeładowania z Kakao (1 = bez zmian). Ze stanowiskiem bierzemy najmniejszy.
function mnoznikPrzeladowaniaBonusow(z) {
  return maEfekt(z, "kakao") ? typBonusu("kakao").mnoznikPrzeladowania : 1;
}

// Mnożnik spowolnienia przeładowania (Spowolnienie przeciwników); mnożymy przez niego na końcu
function mnoznikSpowolnieniaPrzeladowania(z) {
  return maEfekt(z, "spowolnieniePrzeciwnikow") ? typBonusu("spowolnieniePrzeciwnikow").mnoznikPrzeladowania : 1;
}
