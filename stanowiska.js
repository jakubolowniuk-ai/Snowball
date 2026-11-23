// Stanowiska: stos gałek (krótsze przeładowanie) i armatka (szybki ogień).
// Każda drużyna ma swój stos i swoją armatkę. Nie blokują ruchu ani śnieżek.
// Pozycje x, y to punkt na ziemi (jak podstawa dekoracji). Strefy sprawdzamy
// względem stóp postaci (z.y + 0.85 * promień postaci).

const ST = () => CONFIG.stanowiska; // skrót do ustawień stanowisk

// Na początku poziomu: nowe stanowiska z pełną amunicją
function zacznijStanowiska(stan) {
  stan.stanowiska = [];
  if (jestWielka(stan)) {
    zacznijStanowiskaNeutralne(stan);
    return;
  }
  for (const druzyna of ["czerwoni", "zieloni"]) {
    const poz = ST().pozycje[druzyna];
    const znak = druzyna === "czerwoni" ? 1 : -1; // miejsce stania lustrzanie dla zielonych
    const iloscStosu = Math.round(losuj(ST().stos.amunicjaMin - 0.49, ST().stos.amunicjaMax + 0.49));
    stan.stanowiska.push({
      typ: "stos",
      druzyna,
      x: j(poz.stos.x),
      y: j(poz.stos.y),
      amunicja: iloscStosu,
      amunicjaStart: iloscStosu,
      zajety: null, // przeciwnik, który do niego idzie albo przy nim stoi
    });
    stan.stanowiska.push({
      typ: "armatka",
      druzyna,
      x: j(poz.armatka.x),
      y: j(poz.armatka.y),
      stoiX: j(poz.armatka.x + ST().armatka.miejsceStania.x * znak), // tu trzeba stać (stopy)
      stoiY: j(poz.armatka.y + ST().armatka.miejsceStania.y * znak),
      amunicja: ST().armatka.amunicja,
      amunicjaStart: ST().armatka.amunicja,
      zajety: null,
    });
  }
}

// Wielka arena: jeden stos i jedna armatka dla każdego (druzyna: null = neutralne,
// amunicja wspólna, korzysta ten, kto pierwszy dojdzie)
function zacznijStanowiskaNeutralne(stan) {
  const poz = CONFIG.tryby.wielkaArena.stanowiska;
  const iloscStosu = Math.round(losuj(ST().stos.amunicjaMin - 0.49, ST().stos.amunicjaMax + 0.49));
  stan.stanowiska.push({
    typ: "stos",
    druzyna: null,
    x: j(poz.stos.x),
    y: j(poz.stos.y),
    amunicja: iloscStosu,
    amunicjaStart: iloscStosu,
    zajety: null,
  });
  stan.stanowiska.push({
    typ: "armatka",
    druzyna: null,
    x: j(poz.armatka.x),
    y: j(poz.armatka.y),
    stoiX: j(poz.armatka.x + ST().armatka.miejsceStania.x),
    stoiY: j(poz.armatka.y + ST().armatka.miejsceStania.y),
    amunicja: ST().armatka.amunicja,
    amunicjaStart: ST().armatka.amunicja,
    zajety: null,
  });
}

// Czy postać może używać stanowiska? (swoje albo neutralne)
function stanowiskoDlaDruzyny(st, z) {
  return st.druzyna === null || st.druzyna === z.druzyna;
}

// Stopy postaci (tu sprawdzamy strefy stanowisk)
function stopyPostaci(z) {
  return { x: z.x, y: z.y + PROMIEN_POSTACI * 0.85 };
}

// Czy postać z stoi w strefie stanowiska st? (bez sprawdzania amunicji)
function wStrefieStanowiska(z, st) {
  const s = stopyPostaci(z);
  if (st.typ === "armatka") return odleglosc(s.x, s.y, st.stoiX, st.stoiY) <= j(ST().armatka.promienStania);
  return odleglosc(s.x, s.y, st.x, st.y) <= j(ST().stos.promien);
}

// Stanowisko z amunicją, które działa przy rzucie postaci z (armatka ma pierwszeństwo), albo null
function stanowiskoDlaRzutu(stan, z) {
  const moje = stan.stanowiska.filter((st) => stanowiskoDlaDruzyny(st, z) && st.amunicja > 0 && wStrefieStanowiska(z, st));
  return moje.find((st) => st.typ === "armatka") || moje.find((st) => st.typ === "stos") || null;
}

// Przeładowanie po rzucie postaci z, z uwzględnieniem stanowiska (zużywa jedną gałkę)
function przeladowanieZeStanowiskiem(stan, z, normalne) {
  const st = stanowiskoDlaRzutu(stan, z);
  if (!st) return normalne;
  st.amunicja -= 1;
  if (st.typ === "armatka") {
    return Math.max(normalne * ST().armatka.mnoznikPrzeladowania, ST().armatka.minOdstepStrzalow);
  }
  // Stos: skrócone przeładowanie; pusty stos znika z chmurką śniegu
  if (st.amunicja <= 0) {
    stan.chmurki.push({
      x: st.x,
      y: st.y - j(ST().stos.promien) * 0.3,
      czas: 0,
      obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
      rozbryzg: null,
    });
  }
  return normalne * ST().stos.mnoznikPrzeladowania;
}

// Stanowiska widoczne na planszy (pusty stos już nie istnieje, pusta armatka zostaje)
function widoczneStanowiska(stan) {
  return stan.stanowiska.filter((st) => st.typ === "armatka" || st.amunicja > 0);
}

// Czy punkt (stopy/ziemia) jest za blisko któregoś stanowiska? (dla bonusów)
function bliskoStanowiska(stan, x, y, zapas) {
  for (const st of widoczneStanowiska(stan)) {
    if (st.typ === "stos" && odleglosc(x, y, st.x, st.y) < j(ST().stos.promien) + zapas) return true;
    if (st.typ === "armatka") {
      if (odleglosc(x, y, st.x, st.y) < j(ST().armatka.promienStania) * 2 + zapas) return true;
      if (odleglosc(x, y, st.stoiX, st.stoiY) < j(ST().armatka.promienStania) + zapas) return true;
    }
  }
  return false;
}

// Wolne stanowiska drużyny z amunicją dla przeciwnika z (nikt inny przy nim nie stoi)
function wolneStanowiska(stan, z) {
  return stan.stanowiska.filter(
    (st) =>
      stanowiskoDlaDruzyny(st, z) &&
      st.amunicja > 0 &&
      (!st.zajety || st.zajety === z || st.zajety.wyeliminowany)
  );
}
