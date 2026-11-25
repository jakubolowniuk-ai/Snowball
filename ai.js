// Sterowanie przeciwnikiem (AI, czyli "sztuczna inteligencja" komputera).
// Przeciwnik ma te same reguły co gracz: ten sam limit prędkości, siła, zasięg,
// przeładowanie i ogłuszenie. Różni się tylko tym, że decyzje podejmuje komputer.

// Losowa liczba od a do b
function losuj(a, b) {
  return a + Math.random() * (b - a);
}

// Stan "myślenia" przeciwnika na początku poziomu
function nowyStanAI(param) {
  return {
    cel: null, // punkt, do którego idzie (null = stoi)
    postoj: losuj(param.postojMin, param.postojMax), // ile jeszcze postoi
    // Pierwszy rzut dopiero po napisie "Level N"
    // (plus losowe opóźnienie, żeby przeciwnicy nie rzucali naraz)
    przerwa: CONFIG.czasNapisuLevel + losuj(param.przerwaMin, param.przerwaMax) + losuj(0, CONFIG.opoznienieStartuMax),
    unoszenie: null, // { czas, calosc } gdy unosi śnieżkę nad głowę (ładuje siłę)
    unik: null, // { za, sn } zaplanowany unik przed śnieżką sn za "za" sekund
    widziane: new Set(), // śnieżki, które już ocenił (każdą ocenia tylko raz)
    stanowisko: null, // stanowisko, do którego idzie albo przy którym stoi
    // Przeciwnik z typem w Arenie (podchodzenie do gracza):
    odlRzutu: null, // z jakiej odległości rzuci (losowana przy każdej decyzji o rzucie)
    najblizej: Infinity, // najmniejsza odległość od gracza od ostatniego postępu
    bezPostepu: 0, // ile sekund nie podszedł bliżej (zasada awaryjna)
  };
}

// Przeciwnik odchodzi od stanowiska (koniec amunicji, ogłuszenie, nie da się dojść)
function zwolnijStanowisko(z) {
  if (z.ai.stanowisko) z.ai.stanowisko.zajety = null;
  z.ai.stanowisko = null;
}

function aktualizujPrzeciwnika(stan, z, dt) {
  if (z.wyeliminowany) return;
  const ai = z.ai;
  const param = parametryPrzeciwnika(stan, z); // z typu albo ze starej tabeli poziomy

  // Ogłuszony: stoi i nic nie robi (i odchodzi od stanowiska)
  if (z.ogluszenie > 0) {
    ai.unoszenie = null;
    ai.seria = null; // ogłuszenie przerywa serię z Miotacza
    ai.cel = null;
    zwolnijStanowisko(z);
    return;
  }
  // Stanowisko bez amunicji: odchodzi
  if (ai.stanowisko && ai.stanowisko.amunicja <= 0) zwolnijStanowisko(z);

  zauwazSniezki(stan, z, param);

  // Zaplanowany unik: po czasie reakcji odskakuje w bok od toru śnieżki
  if (ai.unik) {
    ai.unik.za -= dt;
    if (ai.unik.za <= 0) {
      odskocz(z, ai.unik.sn);
      ai.unik = null;
    }
  }

  // Seria z Miotacza: stoi i strzela co odstepStrzalow, potem zwykła przerwa
  if (ai.seria) {
    ai.seria.doStrzalu -= dt;
    if (ai.seria.doStrzalu <= 0) {
      const typ = typBonusu("miotacz");
      ai.seria.doStrzalu = typ.odstepStrzalow;
      ai.seria.zostalo -= 1;
      if (maEfekt(z, "miotacz") && !stan.gracz.wyeliminowany) {
        const p = punktRzutuWGracza(stan, z, param);
        wykonajRzut(stan, z, p.x, p.y, 0, typ.silaStrzalu, true);
      }
      if (ai.seria.zostalo <= 0 || !maEfekt(z, "miotacz")) {
        ai.seria = null;
        ai.przerwa = przerwaPoRzucie(stan, z, param);
      }
    }
    return;
  }

  // Unoszenie śnieżki nad głowę (ładowanie siły). Wtedy stoi.
  if (ai.unoszenie) {
    ai.unoszenie.czas += dt;
    if (ai.unoszenie.czas >= ai.unoszenie.calosc) {
      const b = ai.unoszenie.bonus;
      if (b && stan.bonusy.includes(b)) {
        // w bonus: dokładnie, bez rozrzutu
        wykonajRzut(stan, z, b.x, b.y, ai.unoszenie.czas, ai.unoszenie.sila);
      } else {
        rzucWGracza(stan, z, param); // bonus zniknął albo celuje w gracza
      }
      ai.unoszenie = null;
      ai.odlRzutu = null; // przy następnej decyzji nowa odległość rzutu
      ai.przerwa = przerwaPoRzucie(stan, z, param);
    }
    return;
  }

  ai.przerwa -= dt;

  // Idzie do swojego stanowiska; w drodze nie rzuca
  if (ai.stanowisko && !wStrefieStanowiska(z, ai.stanowisko)) {
    const st = ai.stanowisko;
    const celX = st.typ === "armatka" ? st.stoiX : st.x;
    const celY = (st.typ === "armatka" ? st.stoiY : st.y) - PROMIEN_POSTACI * 0.85; // stopy na miejscu
    const przedX = z.x;
    const przedY = z.y;
    idzDo(z, celX, celY, dt);
    const ruszyl = Math.hypot(z.x - przedX, z.y - przedY) > predkoscPostaci(z) * dt * 0.2;
    if (!ruszyl && !wStrefieStanowiska(z, st)) zwolnijStanowisko(z); // nie da się dojść
    return;
  }

  // Przeciwnik z typem w zwykłej Arenie: podchodzi krótkimi krokami i rzuca z odległości typu.
  // Przy stanowisku stoi i rzuca niezależnie od odległości (jak dawniej, kod niżej).
  if (z.typ && !jestWielka(stan) && !ai.stanowisko) {
    podchodzenieWArenie(stan, z, param, dt);
    return;
  }

  // Czy pora zacząć rzut?
  const g = stan.gracz;
  // W Wielkiej arenie rzuca tylko, gdy jest na ekranie gracza, w zasięgu i z czystą linią
  const wolnoRzucic = !jestWielka(stan) || mozeRzucicWielka(stan, z);
  if (ai.przerwa <= 0 && z.przeladowanie <= 0 && !g.wyeliminowany && !ai.cel && wolnoRzucic) {
    zacznijZamach(stan, z, param);
    return;
  }

  // Przy stanowisku stoi w miejscu (nie chodzi losowo)
  if (ai.stanowisko) return;

  // Losowe chodzenie: idzie do punktu, stoi chwilę, wybiera następny
  if (ai.cel) {
    const przedX = z.x;
    const przedY = z.y;
    const doszedl = idzDo(z, ai.cel.x, ai.cel.y, dt);
    // Prawie stoi w miejscu (np. opiera się o przeszkodę): odpuszcza ten cel
    const ruszyl = Math.hypot(z.x - przedX, z.y - przedY) > predkoscPostaci(z) * dt * 0.2;
    if (doszedl || !ruszyl) {
      ai.cel = null;
      ai.postoj = losuj(param.postojMin, param.postojMax);
    }
  } else {
    ai.postoj -= dt;
    if (ai.postoj <= 0 && jestWielka(stan)) {
      // Wielka arena: podchodzi do gracza na odległość rzutu i trzyma dystans
      const cel = celWielkiejAreny(stan, z);
      if (!stopyWPrzeszkodzie(cel.x, cel.y + PROMIEN_POSTACI * 0.85)) ai.cel = { x: cel.x, y: cel.y };
    } else if (ai.postoj <= 0) {
      const kat = Math.random() * Math.PI * 2;
      const odl = j(CONFIG.wedrowka) * losuj(0.3, 1);
      const cel = { druzyna: z.druzyna, x: z.x + Math.cos(kat) * odl, y: z.y + Math.sin(kat) * odl };
      ograniczDoSwojejStrony(cel); // cel też musi być po jego stronie przekątnej
      // Punktu w przeszkodzie nie wybiera; spróbuje znowu w następnej klatce
      if (!stopyWPrzeszkodzie(cel.x, cel.y + PROMIEN_POSTACI * 0.85)) ai.cel = { x: cel.x, y: cel.y };
    }
  }
}

// Początek zamachu (ostrzeżenie przed rzutem). Przeciwnik losuje siłę z typu,
// a zamach trwa max(zamachMin, siła × MAX_CHARGE).
// Z Miotaczem zamiast zamachu zaczyna serię strzałów.
function zacznijZamach(stan, z, param) {
  if (maEfekt(z, "miotacz")) {
    z.ai.seria = { zostalo: typBonusu("miotacz").seriaAI, doStrzalu: 0 };
    return;
  }
  const g = celPrzeciwnika(stan, z);
  let silaTypu = losuj(param.silaMin, param.silaMax);
  if (CONFIG.zasiegZalezyOdSily) {
    // Gdy zasięg zależy od siły: co najmniej tyle siły, żeby dorzucić do gracza
    const d = odleglosc(z.x, z.y, g.x, g.y) / SZEROKOSC_POLA;
    const potrzebna = (d - CONFIG.zasiegMin) / (CONFIG.zasiegMax - CONFIG.zasiegMin);
    silaTypu = Math.min(Math.max(silaTypu, potrzebna), 1);
  }
  const calosc = Math.max(param.zamachMin, silaTypu * CONFIG.MAX_CHARGE);
  // Z szansą szansaBonusu celuje w bonus zamiast w gracza
  const bonus = Math.random() < param.szansaBonusu ? wybierzBonusDlaPrzeciwnika(stan, z) : null;
  z.ai.unoszenie = { czas: 0, calosc, bonus, sila: silaTypu };
}

// Przeciwnik z typem w zwykłej Arenie: krótkie kroki w stronę gracza (z losowym odchyleniem),
// po kroku postój. W odległości rzutu (lub bliżej) stoi i rzuca. Zasada awaryjna: gdy przez
// czasAwaryjny nie podszedł bliżej (np. przekątna nie pozwala), rzuca z miejsca, gdzie stoi.
function podchodzenieWArenie(stan, z, param, dt) {
  const ai = z.ai;
  if (stan.gracz.wyeliminowany) return;
  const g = celPrzeciwnika(stan, z); // gracz (niewidzialny: zapamiętane miejsce) albo jego wieżyczka
  if (ai.odlRzutu === null) ai.odlRzutu = j(losuj(param.odlegloscRzutuMin, param.odlegloscRzutuMax));
  const d = odleglosc(z.x, z.y, g.x, g.y);

  // Postęp: podszedł bliżej niż dotąd (o więcej niż 1 jednostkę, drobne drgania się nie liczą).
  // Gdy gracz odszedł o więcej niż długość kroku, liczymy od nowa.
  if (d < ai.najblizej - 1 || d > ai.najblizej + j(param.krokMax)) {
    ai.najblizej = d;
    ai.bezPostepu = 0;
  } else {
    ai.bezPostepu += dt;
  }
  const wZasiegu = d <= ai.odlRzutu;
  const awaryjnie = ai.bezPostepu >= param.czasAwaryjny;

  // Rzut: w zasięgu albo awaryjnie, po przerwie i przeładowaniu, nie w trakcie kroku
  if ((wZasiegu || awaryjnie) && ai.przerwa <= 0 && z.przeladowanie <= 0 && !ai.cel) {
    zacznijZamach(stan, z, param);
    return;
  }

  // Krok (albo odskok po uniku) w toku
  if (ai.cel) {
    const przedX = z.x;
    const przedY = z.y;
    const doszedl = idzDo(z, ai.cel.x, ai.cel.y, dt);
    const ruszyl = Math.hypot(z.x - przedX, z.y - przedY) > predkoscPostaci(z) * dt * 0.2;
    if (doszedl || !ruszyl) {
      ai.cel = null;
      ai.postoj = losuj(param.postojMin, param.postojMax);
    }
    return;
  }
  // W zasięgu stoi w miejscu; poza zasięgiem po postoju robi następny krok
  ai.postoj -= dt;
  if (wZasiegu || ai.postoj > 0) return;
  const kat = Math.atan2(g.y - z.y, g.x - z.x) + (losuj(-1, 1) * param.odchylenieKroku * Math.PI) / 180;
  const dl = j(losuj(param.krokMin, param.krokMax));
  const cel = { druzyna: z.druzyna, x: z.x + Math.cos(kat) * dl, y: z.y + Math.sin(kat) * dl };
  ograniczDoSwojejStrony(cel); // przekątnej nie przekracza
  // Punktu w przeszkodzie nie wybiera; spróbuje znowu w następnej klatce
  if (!stopyWPrzeszkodzie(cel.x, cel.y + PROMIEN_POSTACI * 0.85)) ai.cel = { x: cel.x, y: cel.y };
}

// Ocenia nowe śnieżki lecące w jego stronę: z pewną szansą planuje unik
function zauwazSniezki(stan, z, param) {
  const ai = z.ai;
  for (const sn of stan.sniezki) {
    if (sn.rzucajacy === z || ai.widziane.has(sn)) continue;
    ai.widziane.add(sn);
    // Czy tor śnieżki w ogóle przechodzi blisko niego?
    const koniecX = sn.startX + sn.kierX * sn.dlugosc;
    const koniecY = sn.startY + sn.kierY * sn.dlugosc;
    const blisko = odlegloscOdOdcinka(z.x, z.y, sn.startX, sn.startY, koniecX, koniecY);
    if (blisko > PROMIEN_POSTACI * 1.5) continue;
    // Przy stanowisku nie robi uników (inaczej od razu by je zostawił)
    if (!ai.stanowisko && Math.random() < param.szansaUniku) {
      ai.unik = { za: param.czasReakcji, sn };
    }
  }
}

// Odskok w bok, prostopadle do toru śnieżki, na stronę dalszą od toru
function odskocz(z, sn) {
  // Kierunek prostopadły do lotu
  let px = -sn.kierY;
  let py = sn.kierX;
  // Po której stronie toru stoi? Odskakuje dalej w tę samą stronę.
  const strona = (z.x - sn.startX) * px + (z.y - sn.startY) * py;
  if (strona < 0 || (strona === 0 && Math.random() < 0.5)) {
    px = -px;
    py = -py;
  }
  const odl = j(CONFIG.odskok);
  const cel = { druzyna: z.druzyna, x: z.x + px * odl, y: z.y + py * odl };
  ograniczDoSwojejStrony(cel);
  z.ai.cel = { x: cel.x, y: cel.y };
  z.ai.unoszenie = null; // unik ważniejszy niż rzut
}

// Bonus, w który przeciwnik może rzucić: z czystą linią (bez przeszkody)
// i bliższy jemu niż graczowi; z takich najbliższy jemu. Brak takiego = null.
function wybierzBonusDlaPrzeciwnika(stan, z) {
  const g = celPrzeciwnika(stan, z);
  const stopy = PROMIEN_POSTACI * 0.85;
  let najlepszy = null;
  let najblizej = Infinity;
  for (const b of stan.bonusy) {
    const dz = odleglosc(z.x, z.y, b.x, b.y);
    if (dz >= odleglosc(g.x, g.y, b.x, b.y)) continue;
    if (przeszkodaNaOdcinku(z.x, z.y + stopy, b.x, b.y + stopy)) continue;
    if (dz < najblizej) {
      najblizej = dz;
      najlepszy = b;
    }
  }
  return najlepszy;
}

// Przerwa po rzucie. Przy stanowisku krótsza (jak przeładowanie gracza):
// stos mnoży przerwę, armatka zostawia tylko minOdstepStrzalow.
// Bez stanowiska: z szansą szansaStanowiska wybiera wolne stanowisko swojej drużyny.
// Kakao skraca przerwę tak samo (ze stosem: najmniejszy mnożnik, nie iloczyn),
// Spowolnienie przeciwników na końcu ją wydłuża.
function przerwaPoRzucie(stan, z, param) {
  return przerwaBezSpowolnienia(stan, z, param) * mnoznikSpowolnieniaPrzeladowania(z);
}

function przerwaBezSpowolnienia(stan, z, param) {
  const ai = z.ai;
  const bonus = mnoznikPrzeladowaniaBonusow(z);
  const zwykla = losuj(param.przerwaMin, param.przerwaMax);
  const st = ai.stanowisko;
  if (st && wStrefieStanowiska(z, st)) {
    if (st.typ === "armatka") return CONFIG.stanowiska.armatka.minOdstepStrzalow;
    return zwykla * Math.min(CONFIG.stanowiska.stos.mnoznikPrzeladowania, bonus);
  }
  if (!st && Math.random() < param.szansaStanowiska) {
    const wolne = wolneStanowiska(stan, z);
    if (wolne.length) {
      const wybrane = wolne[Math.floor(Math.random() * wolne.length)];
      wybrane.zajety = z;
      ai.stanowisko = wybrane;
      ai.cel = null;
    }
  }
  return zwykla * bonus;
}

// Cel przeciwnika z: najbliższy z drużyny gracza, czyli sam gracz (niewidzialnego widzi tylko
// w zapamiętanym miejscu) albo wieżyczka drużyny gracza (przeciwnicy strzelają też w nią).
function celPrzeciwnika(stan, z) {
  const cele = [widocznyCel(stan)];
  for (const w of stan.wiezyczki) if (w.druzyna !== z.druzyna) cele.push({ x: w.x, y: w.y, niewidzialny: false });
  return cele.reduce((a, b) => (odleglosc(z.x, z.y, a.x, a.y) <= odleglosc(z.x, z.y, b.x, b.y) ? a : b));
}

// Punkt, w który przeciwnik rzuca w gracza: jego miejsce z losowym błędem (rozrzut).
// Niewidzialnego gracza nie widzi: losowy punkt koła promienPoszukiwania wokół zapamiętanego miejsca.
function punktRzutuWGracza(stan, z, param) {
  const g = celPrzeciwnika(stan, z);
  const promien = g.niewidzialny ? j(typBonusu("niewidzialnosc").promienPoszukiwania) : j(param.rozrzut);
  const kat = Math.random() * Math.PI * 2;
  const blad = promien * Math.sqrt(Math.random()); // losowy punkt w kole
  return { x: g.x + Math.cos(kat) * blad, y: g.y + Math.sin(kat) * blad };
}

// Rzut w gracza po zamachu
function rzucWGracza(stan, z, param) {
  if (stan.gracz.wyeliminowany) return;
  const p = punktRzutuWGracza(stan, z, param);
  const u = z.ai.unoszenie;
  wykonajRzut(stan, z, p.x, p.y, u.czas, u.sila);
}
