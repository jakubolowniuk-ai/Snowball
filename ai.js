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
    postoj: losuj(CONFIG.postojMin, CONFIG.postojMax), // ile jeszcze postoi
    // Pierwszy rzut dopiero po napisie "Level N"
    przerwa: CONFIG.czasNapisuLevel + losuj(param.przerwaMin, param.przerwaMax),
    unoszenie: null, // { czas, calosc } gdy unosi śnieżkę nad głowę (ładuje siłę)
    unik: null, // { za, sn } zaplanowany unik przed śnieżką sn za "za" sekund
    widziane: new Set(), // śnieżki, które już ocenił (każdą ocenia tylko raz)
    stanowisko: null, // stanowisko, do którego idzie albo przy którym stoi
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
  const param = parametryPoziomu(stan);

  // Ogłuszony: stoi i nic nie robi (i odchodzi od stanowiska)
  if (z.ogluszenie > 0) {
    ai.unoszenie = null;
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

  // Unoszenie śnieżki nad głowę (ładowanie siły). Wtedy stoi.
  if (ai.unoszenie) {
    ai.unoszenie.czas += dt;
    if (ai.unoszenie.czas >= ai.unoszenie.calosc) {
      const b = ai.unoszenie.bonus;
      if (b && stan.bonusy.includes(b)) {
        wykonajRzut(stan, z, b.x, b.y, ai.unoszenie.czas); // w bonus: dokładnie, bez rozrzutu
      } else {
        rzucWGracza(stan, z, param); // bonus zniknął albo celuje w gracza
      }
      ai.unoszenie = null;
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

  // Czy pora zacząć rzut?
  const g = stan.gracz;
  // W Wielkiej arenie rzuca tylko, gdy jest na ekranie gracza, w zasięgu i z czystą linią
  const wolnoRzucic = !jestWielka(stan) || mozeRzucicWielka(stan, z);
  if (ai.przerwa <= 0 && z.przeladowanie <= 0 && !g.wyeliminowany && !ai.cel && wolnoRzucic) {
    // Dobór siły. Unoszenie trwa tyle, ile ładowanie siły (silniejszy = dłużej).
    let calosc;
    if (CONFIG.zasiegZalezyOdSily) {
      // Siła tak dobrana, żeby dorzucić do gracza (plus mały zapas)
      const d = odleglosc(z.x, z.y, g.x, g.y) / SZEROKOSC_POLA;
      const potrzebna = (d - CONFIG.zasiegMin) / (CONFIG.zasiegMax - CONFIG.zasiegMin);
      calosc = Math.min(Math.max(potrzebna, 0) * CONFIG.MAX_CHARGE + CONFIG.zapasSily, CONFIG.MAX_CHARGE);
    } else {
      // Śnieżka i tak doleci, więc siła (czyli prędkość) jest losowa z zakresu poziomu
      calosc = losuj(param.silaMin, param.silaMax) * CONFIG.MAX_CHARGE;
    }
    // Z szansą szansaBonusu celuje w bonus zamiast w gracza
    const bonus = Math.random() < param.szansaBonusu ? wybierzBonusDlaPrzeciwnika(stan, z) : null;
    ai.unoszenie = { czas: 0, calosc, bonus };
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
      ai.postoj = losuj(CONFIG.postojMin, CONFIG.postojMax);
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
  const g = stan.gracz;
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
// Kakao skraca przerwę tak samo (ze stosem: najmniejszy mnożnik, nie iloczyn).
function przerwaPoRzucie(stan, z, param) {
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

// Rzut w gracza z losowym błędem (rozrzut)
function rzucWGracza(stan, z, param) {
  const g = stan.gracz;
  if (g.wyeliminowany) return;
  const kat = Math.random() * Math.PI * 2;
  const blad = j(param.rozrzut) * Math.sqrt(Math.random()); // losowy punkt w kole
  wykonajRzut(stan, z, g.x + Math.cos(kat) * blad, g.y + Math.sin(kat) * blad, z.ai.unoszenie.czas);
}
