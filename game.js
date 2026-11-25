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
    bonusy: [], // aktywne bonusy postaci: { typ, pozostalo }
    wyeliminowany: false,
    // Wspólne ustawienia (gracz i przeciwnicy ze starej tabeli); typ przeciwnika je zmienia
    kolor: druzyna === "czerwoni" ? CONFIG.kolorGracza : CONFIG.kolorPrzeciwnika, // kolor atlasu
    maxTrafien: CONFIG.trafieniaDoEliminacji, // tyle trafień eliminuje (liczba żyć)
    czasOgluszenia: CONFIG.czasOgluszenia,
    mnoznikPredkosci: 1,
    mnoznikPrzeladowania: 1,
  };
}

// Przeciwnik dostaje typ: kolor, życia (zależne od poziomu), ogłuszenie, prędkość, przeładowanie
function ustawTyp(z, typId, poziom) {
  const t = CONFIG.typy[typId];
  z.typ = typId;
  z.kolor = t.kolor;
  // Życia: stała liczba albo { poczatkowe, coIlePoziomow, max } (rosną z poziomem)
  z.maxTrafien =
    typeof t.zycia === "number"
      ? t.zycia
      : Math.min(t.zycia.max, t.zycia.poczatkowe + Math.floor((poziom - 1) / t.zycia.coIlePoziomow));
  z.czasOgluszenia = t.czasOgluszenia;
  z.mnoznikPredkosci = t.mnoznikPredkosci;
  z.mnoznikPrzeladowania = t.mnoznikPrzeladowania;
}

// Parametry zachowania przeciwnika (AI) z jego typu
function parametryPrzeciwnika(stan, z) {
  return CONFIG.typy[z.typ];
}

// Lista typów przeciwników na poziomie (np. ["zielony", "zielony"]).
// Poziom bez wpisu w skladPoziomow bierze skład najbliższego niższego (13+ jak 12).
function typyPoziomu(poziom) {
  const numery = Object.keys(CONFIG.skladPoziomow).map(Number).filter((n) => n <= poziom);
  const sklad = CONFIG.skladPoziomow[Math.max(...numery)];
  // Typy przeplatane (Z, L, Z, L, ...), żeby przy limicie maxNaraz na planszy były oba
  const lista = [];
  const zostalo = sklad.map(({ typ, ile }) => ({ typ, ile }));
  while (zostalo.some((s) => s.ile > 0)) {
    for (const s of zostalo) {
      if (s.ile > 0) {
        lista.push(s.typ);
        s.ile -= 1;
      }
    }
  }
  return lista;
}

// Stan gry (wypełnia go zacznijPoziom). tryb: "arena" albo "wielkaArena"; wMenu: widać menu
const stan = { tryb: "arena", wMenu: true };

// Pozycje startowe n przeciwników w Arenie: rzędy równoległe do przekątnej w lewym górnym
// trójkącie. Pierwszy rząd na liniaPrzeciwnikow, kolejne bliżej rogu (co odstepRzedow),
// najwyżej maxWRzedzie w rzędzie i tyle, ile się zmieści przy minOdstep; rzędy nieparzyste
// przesunięte o pół odstępu (naprzemiennie).
function pozycjePrzeciwnikow(n) {
  const wysokosc = 1 / CONFIG.ASPECT; // wysokość pola jako ułamek szerokości
  const r = CONFIG.rozmiarPostaci / 2; // promień postaci (ułamek szerokości): zapas od brzegu
  const odstep = CONFIG.minOdstep * CONFIG.rozmiarPostaci;
  const pozycje = [];
  let a = CONFIG.liniaPrzeciwnikow;
  for (let rzad = 0; pozycje.length < n; rzad++, a -= CONFIG.odstepRzedow) {
    // Brak miejsca w trójkącie (bardzo dużo przeciwników): kolejni znów od pierwszego rzędu
    if (a < 4 * CONFIG.rozmiarPostaci) a = CONFIG.liniaPrzeciwnikow - CONFIG.odstepRzedow / 2;
    // Punkt rzędu: (t × a, (1 - t) × a × wysokosc); t tylko tam, gdzie postać nie dotyka brzegu
    const tMin = r / a;
    const tMax = 1 - r / (a * wysokosc);
    const dlugosc = Math.max(tMax - tMin, 0) * Math.hypot(a, a * wysokosc);
    const miesci = Math.floor(dlugosc / odstep - 0.5);
    const ile = Math.max(1, Math.min(n - pozycje.length, CONFIG.maxWRzedzie, miesci));
    const przesuniecie = rzad % 2 ? 0.5 : 0; // rzędy nieparzyste o pół miejsca dalej
    for (let i = 0; i < ile; i++) {
      const t = tMin + (tMax - tMin) * ((i + 0.5 + przesuniecie) / (ile + 0.5));
      pozycje.push({ x: t * a, y: (1 - t) * a * wysokosc });
    }
  }
  return pozycje;
}

// Ustawia wszystko od nowa na początek poziomu o numerze "poziom"
function zacznijPoziom(stan, poziom) {
  stan.poziom = poziom;
  ustawSwiat(stan); // Arena: świat = pole; Wielka arena: większy świat
  resetPrzeszkod(); // wszystkie dekoracje z powrotem (zamieć mogła je usunąć)
  const wielka = jestWielka(stan);
  stan.gracz = nowaPostac("czerwoni", wielka ? CONFIG.tryby.wielkaArena.startGracz : CONFIG.startGracz);
  const typy = typyPoziomu(poziom);
  const ilu = wielka ? Math.max(1, Math.round(typy.length * CONFIG.tryby.wielkaArena.mnoznikPrzeciwnikow)) : typy.length;
  const pozycje = wielka ? pozycjePrzeciwnikowWielka(ilu) : pozycjePrzeciwnikow(ilu);
  // Wszyscy przeciwnicy poziomu; pierwszych maxNaraz wchodzi od razu, reszta czeka w kolejce
  const wszyscy = pozycje.map((p, i) => nowyPrzeciwnik(stan, typy[i % typy.length], p));
  const naraz = CONFIG.maxNaraz || wszyscy.length;
  stan.przeciwnicy = wszyscy.slice(0, naraz);
  stan.kolejka = wszyscy.slice(naraz);
  stan.doWejscia = CONFIG.opoznienieWejscia;
  stan.czasPoziomu = 0; // ile sekund trwa obecny poziom
  stan.celowanie = null; // { x, y, czas } gdy palec celuje; czas = ile sekund ładuje się siła
  stan.sniezki = []; // śnieżki w locie
  stan.chmurki = []; // białe chmurki po trafieniach
  stan.koniec = null; // { wynik: "wygrana" | "przegrana", czas } po końcu poziomu
  zacznijStanowiska(stan); // stos i armatka z pełną amunicją
  zacznijBonusy(stan); // bonusy na planszy znikają, licznik od nowa
  ustawKamere(stan);
}
zacznijPoziom(stan, 1);

// Nowy przeciwnik typu typId w punkcie start (ułamki szerokości pola)
function nowyPrzeciwnik(stan, typId, start) {
  const p = nowaPostac("zieloni", start);
  ustawTyp(p, typId, stan.poziom);
  ograniczDoSwojejStrony(p); // nie za blisko brzegu
  wypchnijZPrzeszkod(p); // nie w środku dekoracji
  p.ai = nowyStanAI(parametryPrzeciwnika(stan, p));
  return p;
}

// Miękkie odpychanie: dwaj żywi przeciwnicy bliżej niż rozmiarPostaci rozsuwają się powoli
function odepchnijPrzeciwnikow(stan, dt) {
  const zywi = stan.przeciwnicy.filter((p) => !p.wyeliminowany);
  const min = j(CONFIG.rozmiarPostaci);
  const k = Math.min(1, CONFIG.odpychaniePrzeciwnikow * dt);
  for (let i = 0; i < zywi.length; i++) {
    for (let n = i + 1; n < zywi.length; n++) {
      const a = zywi[i];
      const b = zywi[n];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d = Math.hypot(dx, dy);
      if (d >= min) continue;
      if (d === 0) {
        dx = 1; // ten sam punkt: rozsuwamy w poziomie
        d = 1;
      }
      const przesun = ((min - d) / 2) * k;
      a.x -= (dx / d) * przesun;
      a.y -= (dy / d) * przesun;
      b.x += (dx / d) * przesun;
      b.y += (dy / d) * przesun;
      for (const p of [a, b]) {
        ograniczDoSwojejStrony(p);
        wypchnijZPrzeszkod(p);
      }
    }
  }
}

// Kolejka (gdy ustawiony maxNaraz): gdy na planszy jest mniej żywych niż maxNaraz,
// po opoznienieWejscia s wchodzi następny z kolejki (na swoje miejsce startowe)
function aktualizujKolejke(stan, dt) {
  if (!stan.kolejka.length) return;
  const zywych = stan.przeciwnicy.filter((p) => !p.wyeliminowany).length;
  if (zywych >= CONFIG.maxNaraz) {
    stan.doWejscia = CONFIG.opoznienieWejscia;
    return;
  }
  stan.doWejscia -= dt;
  if (stan.doWejscia > 0) return;
  const p = stan.kolejka.shift();
  p.ai.przerwa -= CONFIG.czasNapisuLevel; // napis "Level N" już minął
  stan.przeciwnicy.push(p);
  stan.doWejscia = CONFIG.opoznienieWejscia;
}

// Czy gracz może teraz sterować (ruch i rzut)
function graczMozeSterowac(stan) {
  return !stan.koniec && !stan.gracz.wyeliminowany && stan.gracz.ogluszenie <= 0;
}

// --- Trafienia ---

// sn: śnieżka, która trafiła (Bombka może ją odbić); może być pusta
function trafienie(stan, z, sn) {
  // Bombka (tarcza) zatrzymuje trafienie (odbija albo pochłania): bez zliczenia i ogłuszenia
  if (tarczaPochlania(stan, z, sn)) return;
  z.trafienia += 1;
  if (z.trafienia >= z.maxTrafien) {
    z.wyeliminowany = true;
    z.ogluszenie = 0;
    z.bonusy = []; // wyeliminowanych efekty bonusów nie obejmują
  } else {
    z.ogluszenie = z.czasOgluszenia;
  }
  zacznijAnimacjeTrafienia(z, z.wyeliminowany); // ogłuszenie albo upadek
  // Obłoczek i rozbryzg na wysokości tułowia, losowo wybrane grafiki
  const tulow = stopyY(z) - rozmiarPostaci(z).wys * 0.45;
  stan.chmurki.push({
    x: z.x,
    y: tulow,
    czas: 0,
    obloczek: `assets/efekty/obloczek_sniegu_${1 + Math.floor(Math.random() * 2)}.png`,
    rozbryzg: `assets/efekty/rozbryzg_${1 + Math.floor(Math.random() * 8)}.png`,
  });

  // Krótka wibracja (działa na Androidzie; iPhone tego nie obsługuje)
  if (navigator.vibrate) navigator.vibrate(CONFIG.wibracjaTrafienia);

  // Trafiony gracz traci celowanie (pad zostaje pod kciukiem), przeciwnik traci uniesiony rzut
  if (z === stan.gracz) stan.celowanie = null;
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
  // Spowolnienie śnieżek zmienia tylko prędkość, więc po końcu efektu śnieżka nie skacze
  const predkosc = sn.predkosc * mnoznikPredkosciSniezki(stan, sn);
  sn.przebyte = Math.min(sn.przebyte + predkosc * dt, sn.dlugosc);
  const po = pozycjaSniezki(sn);

  const zasiegTrafienia = PROMIEN_POSTACI + j(CONFIG.promienSniezki);
  let pierwszy = null;
  let najblizej = Infinity;
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z === sn.rzucajacy || z.wyeliminowany) continue;
    // Swoich (drużyna rzucającego) nie trafia, chyba że rzucał upity albo trafianieSwoich: true
    if (z.druzyna === sn.rzucajacy.druzyna && !CONFIG.trafianieSwoich && !sn.upita) continue;
    if (odlegloscOdOdcinka(z.x, z.y, przed.x, przed.y, po.x, po.y) > zasiegTrafienia) continue;
    // Gdy na odcinku jest kilka postaci, trafia ta bliżej początku
    const d = Math.hypot(z.x - przed.x, z.y - przed.y);
    if (d < najblizej) {
      najblizej = d;
      pierwszy = z;
    }
  }
  // Bonus na drodze? (traktowany jak postać; zbiera go każda śnieżka, gdy przeciwnicyZbierajaBonusy)
  let bonus = null;
  if (sniezkaZbieraBonusy(stan, sn)) {
    const zasiegBonusu = j(CONFIG.bonusy.promienTrafienia) + j(CONFIG.promienSniezki);
    for (const b of stan.bonusy) {
      if (odlegloscOdOdcinka(b.x, b.y, przed.x, przed.y, po.x, po.y) > zasiegBonusu) continue;
      const d = Math.hypot(b.x - przed.x, b.y - przed.y);
      if (d < najblizej) {
        najblizej = d;
        bonus = b;
        pierwszy = null; // bonus jest bliżej startu niż postać
      }
    }
  }

  // Przeszkoda na drodze? Sprawdzamy tor cienia (na wysokości stóp).
  const stopy = PROMIEN_POSTACI * 0.85;
  const p = przeszkodaNaOdcinku(przed.x, przed.y + stopy, po.x, po.y + stopy);
  if (p && ((!pierwszy && !bonus) || Math.hypot(p.x - przed.x, p.y - stopy - przed.y) < najblizej)) {
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
  if (bonus) {
    zdobadzBonus(stan, sn.rzucajacy, bonus);
    return true;
  }
  if (pierwszy) {
    trafienie(stan, pierwszy, sn);
    return true;
  }
  return sn.przebyte >= sn.dlugosc;
}

// Wygrana: wszyscy przeciwnicy wyeliminowani. Przegrana: gracz wyeliminowany.
function sprawdzKoniec(stan) {
  if (stan.koniec) return;
  if (stan.gracz.wyeliminowany) {
    stan.koniec = { wynik: "przegrana", czas: 0 };
  } else if (stan.przeciwnicy.every((p) => p.wyeliminowany) && !stan.kolejka.length) {
    stan.koniec = { wynik: "wygrana", czas: 0 };
  }
  if (stan.koniec) {
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

// p: punkt w oknie ekranu. Zapamiętujemy go, bo w Wielkiej arenie kamera się przesuwa,
// a cel ma zostać pod palcem (x, y w świecie liczymy co klatkę).
function zacznijCelowanie(stan, p) {
  const s = oknoNaSwiat(p);
  // Z Miotaczem: przytrzymany palec strzela seriami (pierwszy strzał od razu)
  const miotacz = maEfekt(stan.gracz, "miotacz");
  stan.celowanie = { oknoX: p.x, oknoY: p.y, x: s.x, y: s.y, czas: 0, miotacz, doStrzalu: 0 };
}

// Miotacz gracza: dopóki palec trzyma, strzał co odstepStrzalow w punkt pod palcem
function strzelajZMiotacza(stan, dt) {
  const c = stan.celowanie;
  const g = stan.gracz;
  if (!c || !c.miotacz) return;
  if (!maEfekt(g, "miotacz")) {
    stan.celowanie = null; // skończyły się gałki albo czas: koniec strzelania
    return;
  }
  c.doStrzalu -= dt;
  if (c.doStrzalu > 0) return;
  const typ = typBonusu("miotacz");
  c.doStrzalu = typ.odstepStrzalow;
  if (odleglosc(g.x, g.y, c.x, c.y) < j(CONFIG.promienAnulowania)) return; // za blisko: nie strzela
  wykonajRzut(stan, g, c.x, c.y, 0, typ.silaStrzalu, true);
}

function przesunCelowanie(stan, p) {
  const c = stan.celowanie;
  c.oknoX = p.x;
  c.oknoY = p.y;
  const s = oknoNaSwiat(p);
  c.x = s.x;
  c.y = s.y;
}

// Puszczenie palca celującego (p: punkt w oknie ekranu): rzut w miejsce palca albo anulowanie.
// Przy Miotaczu puszczenie tylko kończy strzelanie (amunicja zostaje).
function rzuc(stan, pOkno) {
  const c = stan.celowanie;
  stan.celowanie = null;
  if (!c || c.miotacz) return;
  const p = oknoNaSwiat(pOkno);

  const g = stan.gracz;
  const d = odleglosc(g.x, g.y, p.x, p.y);
  if (d < j(CONFIG.promienAnulowania)) return; // za blisko zawodnika: anulowane
  wykonajRzut(stan, g, p.x, p.y, c.czas);
}

// Rzut postaci z w punkt (celX, celY) po ładowaniu siły przez czasLadowania sekund.
// Te same reguły dla gracza i przeciwników. silaTypu: siła wylosowana przez przeciwnika
// z typem (wtedy zamach i siła to osobne liczby); bez niej siła wynika z czasu ładowania.
// miotacz: strzał z Miotacza (siła podana, bez przeładowania, zużywa gałkę Miotacza).
function wykonajRzut(stan, z, celX, celY, czasLadowania, silaTypu, miotacz = false) {
  const d = odleglosc(z.x, z.y, celX, celY);
  if (d === 0) return;
  // Pełna siła: każdy rzut z maksymalną prędkością (przeładowanie i tak bez zmian)
  const pelna = maEfekt(z, "pelnaSila");
  const zTypu = silaTypu !== undefined;
  const s = pelna ? 1 : zTypu ? silaTypu : sila(czasLadowania);
  const kx = (celX - z.x) / d;
  const ky = (celY - z.y) / d;

  zacznijAnimacjeRzutu(z); // rzut, przedłużenie, powrót (śnieżka wylatuje teraz)

  // Gwiazdka: wachlarz śnieżek (kąty z config.js), bez niej jedna śnieżka prosto
  const gwiazdka = z.bonusy.find((ab) => ab.typ === "gwiazdka");
  const katy = gwiazdka ? typBonusu("gwiazdka").katyWachlarza : [0];
  for (const katStopnie of katy) {
    const a = (katStopnie * Math.PI) / 180;
    stan.sniezki.push({
      rzucajacy: z, // rzucającego śnieżka nie trafia
      startX: z.x,
      startY: z.y,
      kierX: kx * Math.cos(a) - ky * Math.sin(a), // kierunek obrócony o kąt
      kierY: kx * Math.sin(a) + ky * Math.cos(a),
      // Leci do celu; gdy zasięg zależy od siły, najwyżej do końca zasięgu;
      // w Wielkiej arenie najwyżej na szerokość widoku
      dlugosc: Math.min(
        CONFIG.zasiegZalezyOdSily ? Math.min(d, zasieg(s)) : d,
        jestWielka(stan) ? j(CONFIG.tryby.wielkaArena.zasiegSniezki) : Infinity
      ),
      predkosc: j(pomiedzy(CONFIG.predkoscSniezkiMin, CONFIG.predkoscSniezkiMax, s)),
      przebyte: 0,
      upita: maEfekt(z, "upicie"), // rzucona przez upitego: może trafić swoich
    });
  }
  // Wachlarz to jeden rzut, także dla Pełnej siły
  if (gwiazdka) zuzyjRzutEfektu(z, "gwiazdka");
  if (pelna) zuzyjRzutEfektu(z, "pelnaSila");

  // Miotacz: bez przeładowania między strzałami, każdy strzał to jedna gałka
  if (miotacz) {
    zuzyjRzutEfektu(z, "miotacz");
    return;
  }

  // Przeładowanie: stały czas plus faktyczny czas ładowania siły (także z Pełną siłą);
  // stos, armatka i Kakao je skracają, Spowolnienie przeciwników wydłuża
  // (przeciwnik z typem: mnożnik typu i czas równoważny sile, nie długość zamachu)
  const ladowanie = zTypu ? silaTypu * CONFIG.MAX_CHARGE : Math.min(czasLadowania, CONFIG.MAX_CHARGE);
  const normalne = CONFIG.czasPrzeladowania * z.mnoznikPrzeladowania + ladowanie;
  z.przeladowanie = przeladowanieZeStanowiskiem(stan, z, normalne);
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

// Każda drużyna zostaje na swojej stronie przekątnej i w świecie.
// W Wielkiej arenie nie ma przekątnej: ograniczają tylko granice świata.
function ograniczDoSwojejStrony(z) {
  const r = PROMIEN_POSTACI;
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  // Postać niesiona wiatrem zamieci jest poza granicą: trzymamy ją tylko w pełnym świecie
  const s = z.wiatr ? stan.swiatPelny : stan.swiat;
  const wPolu = () => {
    z.x = Math.min(Math.max(z.x, s.x0 + r), s.x1 - r);
    z.y = Math.min(Math.max(z.y, s.y0 + r), s.y1 - r);
  };
  wPolu();
  if (jestWielka(stan)) return;
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

// Prędkość postaci w jednostkach na sekundę (Laska cukrowa zwiększa, Spowolnienie zmniejsza)
function predkoscPostaci(z) {
  const laska = maEfekt(z, "laska") ? typBonusu("laska").mnoznikPredkosci : 1;
  const wolno = maEfekt(z, "spowolnieniePrzeciwnikow") ? typBonusu("spowolnieniePrzeciwnikow").mnoznikPredkosci : 1;
  return j(CONFIG.predkoscZawodnika) * z.mnoznikPredkosci * laska * wolno; // z.mnoznikPredkosci: z typu
}

// Krok postaci w stronę punktu, z limitem prędkości. Zwraca true, gdy doszła.
function idzDo(z, celX, celY, dt) {
  const dx = celX - z.x;
  const dy = celY - z.y;
  const dystans = Math.hypot(dx, dy);
  const krok = predkoscPostaci(z) * dt;
  let doszla = false;
  if (dystans <= krok) {
    z.x = celX;
    z.y = celY;
    doszla = true;
  } else {
    const k = kierunekPoUpiciu(z, dx / dystans, dy / dystans); // upity idzie krzywo
    z.x += k.dx * krok;
    z.y += k.dy * krok;
  }
  ograniczDoSwojejStrony(z);
  if (!z.wiatr) wypchnijZPrzeszkod(z); // przez przeszkody nie da się przejść (wiatr przenosi)
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

// --- Joystick (pad) ---

// Stan pada (nie zeruje się między poziomami: kciuk może zostać na padzie).
// wychylX, wychylY: wychylenie gałki od -1 do 1 (długość wektora najwyżej 1)
const pad = { wychylX: 0, wychylY: 0, dotykany: false };

// Środek pada: prawy dolny róg WIDOCZNEGO ekranu (nie pola gry), z marginesem
function pozycjaPada() {
  const odKrawedzi = j(CONFIG.marginesPadu) + j(CONFIG.promienPadu);
  return { x: widoczny.x1 - odKrawedzi, y: widoczny.y1 - odKrawedzi };
}

// Czy punkt p (jednostki pola) łapie pad?
function naPadzie(p) {
  const s = pozycjaPada();
  return odleglosc(p.x, p.y, s.x, s.y) <= j(CONFIG.promienPadu) + j(CONFIG.promienDotykuPadu);
}

// Ustawia wychylenie gałki według palca w punkcie p; gałka nie wychodzi poza podstawę
function ustawWychylenie(p) {
  const s = pozycjaPada();
  let wx = (p.x - s.x) / j(CONFIG.promienPadu);
  let wy = (p.y - s.y) / j(CONFIG.promienPadu);
  const dl = Math.hypot(wx, wy);
  if (dl > 1) {
    wx /= dl;
    wy /= dl;
  }
  pad.wychylX = wx;
  pad.wychylY = wy;
}

function puscPad() {
  pad.wychylX = 0;
  pad.wychylY = 0;
  pad.dotykany = false;
}

// Ruch gracza z pada: kierunek wychylenia, prędkość rośnie z wychyleniem.
// Poniżej strefy martwej stoi; powyżej wychylenie przeskalowane do 0-1.
function ruchZPada(z, dt) {
  const m = Math.hypot(pad.wychylX, pad.wychylY);
  const martwa = CONFIG.strefaMartwaPadu;
  if (m <= martwa) return;
  const sila = Math.min((m - martwa) / (1 - martwa), 1);
  const krok = predkoscPostaci(z) * sila * dt; // pełne wychylenie = pełna prędkość (z Laską też)
  const k = kierunekPoUpiciu(z, pad.wychylX / m, pad.wychylY / m); // upity idzie krzywo
  z.x += k.dx * krok;
  z.y += k.dy * krok;
  ograniczDoSwojejStrony(z);
  if (!z.wiatr) wypchnijZPrzeszkod(z);
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

  // Ładowanie siły, dopóki palec celuje; cel zostaje pod palcem, gdy kamera jedzie
  if (stan.celowanie) {
    stan.celowanie.czas += dt;
    przesunCelowanie(stan, { x: stan.celowanie.oknoX, y: stan.celowanie.oknoY });
  }
  if (graczMozeSterowac(stan)) strzelajZMiotacza(stan, dt);

  // Lot śnieżek: znikają po trafieniu albo na końcu lotu.
  // Śnieżki odbite przez Bombkę w tej klatce trafiają do nowej listy i też zostają.
  const lecace = stan.sniezki;
  stan.sniezki = [];
  const zostaja = lecace.filter((sn) => !lotSniezki(stan, sn, dt));
  stan.sniezki = zostaja.concat(stan.sniezki);

  // Odliczanie ogłuszenia i przeładowania (niezależnie od siebie)
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (z.ogluszenie > 0) z.ogluszenie = Math.max(z.ogluszenie - dt, 0);
    if (z.przeladowanie > 0) z.przeladowanie = Math.max(z.przeladowanie - dt, 0);
  }

  // Chmurki śniegu znikają po chwili
  for (const ch of stan.chmurki) ch.czas += dt;
  stan.chmurki = stan.chmurki.filter((ch) => ch.czas < (ch.trwa || CONFIG.czasChmurki));

  // Animacje zawodników (także po końcu poziomu, żeby upadek wyeliminowanego się odegrał)
  aktualizujAnimacje(stan, dt);

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

  // Zamieć w Wielkiej arenie: zwężanie świata, wiatr, znikanie rzeczy poza granicą
  aktualizujZamiec(stan, dt);

  // Bonusy: pojawianie, znikanie, odliczanie (stoją w trakcie napisu i po końcu poziomu)
  aktualizujBonusy(stan, dt);

  // Kolejka przeciwników (gdy ustawiony maxNaraz)
  aktualizujKolejke(stan, dt);

  // Przeciwnicy (ruch, uniki, rzuty) - logika w ai.js
  for (const p of stan.przeciwnicy) aktualizujPrzeciwnika(stan, p, dt);

  // Przeciwnicy nie stoją jeden na drugim
  odepchnijPrzeciwnikow(stan, dt);

  // Gracz: ruch z joysticka (ogłuszony stoi, ale kciuk może zostać na padzie)
  if (graczMozeSterowac(stan)) ruchZPada(stan.gracz, dt);

  // Kamera podąża za graczem (tylko w Wielkiej arenie)
  aktualizujKamere(stan, dt);

}

// --- Pętla gry ---
let poprzedniCzas = 0;

function klatka(teraz) {
  // Czas od poprzedniej klatki w sekundach (max 0,1 s, gdy karta była w tle)
  const dt = Math.min((teraz - poprzedniCzas) / 1000, 0.1);
  poprzedniCzas = teraz;

  if (stan.wMenu) {
    rysujTlo(ctx); // za menu samo tło
  } else {
    aktualizuj(dt);
    rysujScene(ctx, stan);
  }
  aktualizujPrzyciskMenu(stan);
  requestAnimationFrame(klatka);
}

// Start: najpierw napis "Ładowanie...", gra rusza po wczytaniu wszystkich obrazków
rysujTlo(ctx);
rysujNapis(ctx, "Ładowanie...");
wczytajObrazy(() => {
  pokazMenu(stan); // po wczytaniu: menu z wyborem trybu
  poprzedniCzas = performance.now();
  requestAnimationFrame(klatka);
});
