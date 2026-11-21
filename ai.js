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
  };
}

function aktualizujPrzeciwnika(stan, z, dt) {
  if (z.wyeliminowany) return;
  const ai = z.ai;
  const param = parametryPoziomu(stan);

  // Ogłuszony: stoi i nic nie robi
  if (z.ogluszenie > 0) {
    ai.unoszenie = null;
    ai.cel = null;
    return;
  }

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
      rzucWGracza(stan, z, param);
      ai.unoszenie = null;
      ai.przerwa = losuj(param.przerwaMin, param.przerwaMax);
    }
    return;
  }

  // Czy pora zacząć rzut?
  ai.przerwa -= dt;
  const g = stan.gracz;
  if (ai.przerwa <= 0 && z.przeladowanie <= 0 && !g.wyeliminowany && !ai.cel) {
    // Siła tak dobrana, żeby dorzucić do gracza (plus mały zapas).
    // Im dalej gracz, tym dłużej trwa unoszenie.
    const d = odleglosc(z.x, z.y, g.x, g.y) / SZEROKOSC_POLA;
    const potrzebna = (d - CONFIG.zasiegMin) / (CONFIG.zasiegMax - CONFIG.zasiegMin);
    const calosc = Math.min(
      Math.max(potrzebna, 0) * CONFIG.MAX_CHARGE + CONFIG.zapasSily,
      CONFIG.MAX_CHARGE
    );
    ai.unoszenie = { czas: 0, calosc };
    return;
  }

  // Losowe chodzenie: idzie do punktu, stoi chwilę, wybiera następny
  if (ai.cel) {
    const przedX = z.x;
    const przedY = z.y;
    const doszedl = idzDo(z, ai.cel.x, ai.cel.y, dt);
    // Prawie stoi w miejscu (np. opiera się o przeszkodę): odpuszcza ten cel
    const ruszyl = Math.hypot(z.x - przedX, z.y - przedY) > j(CONFIG.predkoscZawodnika) * dt * 0.2;
    if (doszedl || !ruszyl) {
      ai.cel = null;
      ai.postoj = losuj(CONFIG.postojMin, CONFIG.postojMax);
    }
  } else {
    ai.postoj -= dt;
    if (ai.postoj <= 0) {
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
    if (Math.random() < param.szansaUniku) {
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

// Rzut w gracza z losowym błędem (rozrzut)
function rzucWGracza(stan, z, param) {
  const g = stan.gracz;
  if (g.wyeliminowany) return;
  const kat = Math.random() * Math.PI * 2;
  const blad = j(param.rozrzut) * Math.sqrt(Math.random()); // losowy punkt w kole
  wykonajRzut(stan, z, g.x + Math.cos(kat) * blad, g.y + Math.sin(kat) * blad, z.ai.unoszenie.czas);
}
