// Rysowanie tła, zawodników, śnieżek, kropki i napisów.
// Rysujemy w jednostkach pola (szerokość 1000), skalowanie robi game.js.

const TLO = "assets/tlo/tlo_plansza.png";

function rysujTlo(ctx) {
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  const g = j(CONFIG.glebokoscBrzegu);
  const ekranX = widoczny.x0;
  const ekranY = widoczny.y0;
  const ekranW = widoczny.x1 - widoczny.x0;
  const ekranH = widoczny.y1 - widoczny.y0;

  // Kolor pod spodem (widać go tylko przed wczytaniem grafik albo na bardzo
  // nietypowym ekranie, gdzie obrazek tła nie sięga do krawędzi)
  ctx.fillStyle = CONFIG.kolorBrzegu;
  ctx.fillRect(ekranX, ekranY, ekranW, ekranH);

  const obraz = OBRAZY[TLO];
  if (obraz) {
    // Obrazek tła tak, żeby pole gry leżało dokładnie w miejscu z sprites.json
    const s = SPRITY[TLO];
    ctx.drawImage(obraz, -s.poleX, -s.poleY, s.szer, s.wys);
  } else {
    ctx.fillStyle = CONFIG.kolorSniegu;
    ctx.fillRect(0, 0, W, H);
  }

  // Przyciemnienie: poza polem półprzezroczysty niebieskawy kolor,
  // a przy brzegach pola płynne przejście do przezroczystości
  ctx.save();
  ctx.globalAlpha = CONFIG.silaPrzyciemnienia;
  ctx.fillStyle = CONFIG.kolorBrzegu;
  ctx.fillRect(ekranX, ekranY, ekranW, -ekranY); // nad polem
  ctx.fillRect(ekranX, H, ekranW, ekranY + ekranH - H); // pod polem
  ctx.fillRect(ekranX, 0, -ekranX, H); // na lewo od pola
  ctx.fillRect(W, 0, ekranX + ekranW - W, H); // na prawo od pola
  const brzegi = [
    [0, 0, 0, g, 0, 0, W, g], // góra
    [0, H, 0, H - g, 0, H - g, W, g], // dół
    [0, 0, g, 0, 0, 0, g, H], // lewo
    [W, 0, W - g, 0, W - g, 0, g, H], // prawo
  ];
  for (const [x1, y1, x2, y2, rx, ry, rw, rh] of brzegi) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, CONFIG.kolorBrzegu);
    gradient.addColorStop(1, "rgba(185, 208, 230, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(rx, ry, rw, rh);
  }
  ctx.restore();
}

function kolorDruzyny(z) {
  return z.druzyna === "czerwoni" ? CONFIG.kolorCzerwony : CONFIG.kolorZielony;
}

// Ścieżka grafiki postaci
function grafikaPostaci(z) {
  return z.druzyna === "czerwoni" ? CONFIG.grafikaGracza : CONFIG.grafikaPrzeciwnika;
}

// Rozmiar grafiki w jednostkach pola (z mnożnikiem skali z config.js)
function rozmiarGrafiki(sciezka) {
  const s = SPRITY[sciezka];
  return { szer: s.szer * CONFIG.skalaGrafik, wys: s.wys * CONFIG.skalaGrafik };
}

// Rysuje obrazek tak, żeby jego kotwica (z sprites.json) wypadła w punkcie (x, y).
// Zwraca false, gdy obrazek się nie wczytał (wtedy rysujemy kształt zastępczy).
function rysujSprite(ctx, sciezka, x, y) {
  const obraz = OBRAZY[sciezka];
  if (!obraz) return false;
  const s = SPRITY[sciezka];
  const { szer, wys } = rozmiarGrafiki(sciezka);
  ctx.drawImage(obraz, x - s.kotwicaX * szer, y - s.kotwicaY * wys, szer, wys);
  return true;
}

// Wysokość "stóp" postaci: tu stoją podeszwy, cień i pierścień
function stopyY(z) {
  return z.y + PROMIEN_POSTACI * 0.85;
}

// Wyeliminowany leży na ziemi: grafika postaci obrócona o 90 stopni
// i lekko spłaszczona (widok skośnie z góry). Docelowo dojdzie osobna grafika.
function rysujLezacego(ctx, z) {
  const sciezka = grafikaPostaci(z);
  const { szer, wys } = rozmiarGrafiki(sciezka);
  const y = stopyY(z);
  const splaszczenie = 0.7;

  // Cień pod leżącym
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, y, wys * 0.5, szer * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  const obraz = OBRAZY[sciezka];
  if (!obraz) return;
  ctx.save();
  ctx.translate(z.x, y - (szer / 2) * splaszczenie);
  ctx.scale(1, splaszczenie);
  // Czerwony leży głową w lewo, zielony głową w prawo
  ctx.rotate(z.druzyna === "czerwoni" ? -Math.PI / 2 : Math.PI / 2);
  ctx.drawImage(obraz, -szer / 2, -wys / 2, szer, wys);
  ctx.restore();
}

// Trzy małe kropki nad głową: pełne = trafienia, które zostały
function rysujZycia(ctx, z) {
  const ile = CONFIG.trafieniaDoEliminacji;
  const zostalo = ile - z.trafienia;
  const rk = j(CONFIG.promienKropekZycia);
  const odstep = rk * 3;
  const { wys } = rozmiarGrafiki(grafikaPostaci(z));
  // Nad głową, ale nie wyżej niż górna krawędź ekranu
  const y = Math.max(stopyY(z) - wys - rk * 2, widoczny.y0 + rk * 1.5);
  for (let i = 0; i < ile; i++) {
    const x = z.x + (i - (ile - 1) / 2) * odstep;
    ctx.beginPath();
    ctx.arc(x, y, rk, 0, Math.PI * 2);
    if (i < zostalo) {
      ctx.fillStyle = kolorDruzyny(z);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = rk * 0.35;
    ctx.stroke();
  }
}

function rysujZawodnika(ctx, z, toGracz) {
  if (z.wyeliminowany) {
    rysujLezacego(ctx, z);
    return;
  }
  const r = PROMIEN_POSTACI;
  const y = stopyY(z);

  ctx.save();
  // Ogłuszony jest wyblakły
  if (z.ogluszenie > 0) ctx.globalAlpha = 0.45;

  // Cień: spłaszczony owal pod postacią
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, y, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Niebieski owalny pierścień pod stopami gracza.
  // W trakcie przeładowania jest szary, a niebieski łuk dorysowuje się jak wskazówka zegara.
  if (toGracz) {
    const rx = r * 1.15;
    const ry = r * 0.42;
    ctx.lineWidth = j(CONFIG.gruboscPierscienia);
    let postep = 1;
    if (z.przeladowanie > 0) {
      postep = 1 - z.przeladowanie / z.przeladowanieCalosc;
      ctx.strokeStyle = CONFIG.kolorPrzeladowania;
      ctx.beginPath();
      ctx.ellipse(z.x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (postep > 0) {
      // Zaczyna się z przodu (na dole), żeby postać nie zasłaniała początku łuku
      const start = Math.PI / 2;
      ctx.strokeStyle = CONFIG.kolorPierscienia;
      ctx.beginPath();
      ctx.ellipse(z.x, y, rx, ry, 0, start, start + postep * Math.PI * 2);
      ctx.stroke();
    }
  }

  // Postać z grafiki (podeszwy w punkcie stóp); gdy grafiki brak, kółko jak dawniej
  if (!rysujSprite(ctx, grafikaPostaci(z), z.x, y)) {
    ctx.fillStyle = kolorDruzyny(z);
    ctx.beginPath();
    ctx.arc(z.x, z.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  rysujUniesionaSniezke(ctx, z);
}

// Przeciwnik przed rzutem unosi śnieżkę: od ręki aż nad głowę, im większa siła, tym wyżej.
// (Grafika ma też śnieżkę w ręce; osobna grafika rzutu dojdzie później.)
function rysujUniesionaSniezke(ctx, z) {
  if (!z.ai || !z.ai.unoszenie) return;
  const s = sila(z.ai.unoszenie.czas);
  const { szer, wys } = rozmiarGrafiki(grafikaPostaci(z));
  const rs = j(CONFIG.promienSniezki) * 1.1;
  const reka = { x: z.x + szer * 0.51, y: stopyY(z) - wys * 0.61 }; // śnieżka w ręce na grafice
  const nadGlowa = { x: z.x, y: stopyY(z) - wys - j(CONFIG.promienKropekZycia) * 5 };
  const x = reka.x + (nadGlowa.x - reka.x) * s;
  const y = reka.y + (nadGlowa.y - reka.y) * s;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(60, 90, 130, 0.7)";
  ctx.lineWidth = rs * 0.25;
  ctx.beginPath();
  ctx.arc(x, y, rs, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// Biała chmurka śniegu: kilka kółek rozlatuje się i znika
function rysujChmurki(ctx, stan) {
  const r = PROMIEN_POSTACI;
  for (const ch of stan.chmurki) {
    const t = ch.czas / CONFIG.czasChmurki; // od 0 do 1
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
    ctx.strokeStyle = `rgba(150, 180, 210, ${0.6 * (1 - t)})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const kat = (i / 7) * Math.PI * 2;
      const odl = r * (0.3 + 0.9 * t);
      ctx.beginPath();
      ctx.arc(ch.x + Math.cos(kat) * odl, ch.y + Math.sin(kat) * odl * 0.7, r * (0.35 - 0.15 * t), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function rysujKropke(ctx, stan) {
  if (stan.gracz.wyeliminowany || stan.koniec) return;
  const k = pozycjaKropki(stan);
  const r = j(CONFIG.promienKropki);
  ctx.save();
  // Półprzezroczysta, gdy nikt jej nie trzyma; ledwo widoczna przy ogłuszeniu
  ctx.globalAlpha = stan.palec ? 1 : CONFIG.przezroczystoscKropki;
  if (stan.gracz.ogluszenie > 0) ctx.globalAlpha = 0.15;
  ctx.fillStyle = CONFIG.kolorKropki;
  ctx.beginPath();
  ctx.arc(k.x, k.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.25;
  ctx.stroke();
  ctx.restore();
}

// Napis na środku pola (cienka jasnoniebieska czcionka)
function rysujNapis(ctx, tekst) {
  const rozmiar = j(CONFIG.rozmiarNapisuLevel);
  ctx.fillStyle = CONFIG.kolorNapisu;
  ctx.font = `300 ${rozmiar}px "Helvetica Neue", Roboto, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tekst, SZEROKOSC_POLA / 2, WYSOKOSC_POLA / 2);
}

// "Level N" na początku poziomu, "Wygrana!"/"Przegrana" na końcu
function rysujNapisy(ctx, stan) {
  if (stan.koniec) {
    rysujNapis(ctx, stan.koniec.wynik === "wygrana" ? "Wygrana!" : "Przegrana");
  } else if (stan.czasPoziomu <= CONFIG.czasNapisuLevel) {
    rysujNapis(ctx, `Level ${stan.poziom}`);
  }
}

// Linia od zawodnika do palca, pierścień celu i pierścień zasięgu
function rysujCelowanie(ctx, stan) {
  const c = stan.celowanie;
  if (!c) return;
  const g = stan.gracz;
  const d = odleglosc(g.x, g.y, c.x, c.y);
  const rCelu = j(CONFIG.promienCelu);

  // Cienka linia
  ctx.strokeStyle = "rgba(42, 111, 214, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(c.x, c.y);
  ctx.stroke();

  // Pierścień celu dokładnie pod palcem
  ctx.strokeStyle = CONFIG.kolorCelu;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c.x, c.y, rCelu, 0, Math.PI * 2);
  ctx.stroke();

  // Pierścień zasięgu na linii: rośnie z siłą, zatrzymuje się na celu
  if (d > 0) {
    const z = zasieg(sila(c.czas));
    const doleci = z >= d;
    const odl = Math.min(z, d);
    ctx.strokeStyle = doleci ? CONFIG.kolorZasieguDoleci : CONFIG.kolorZasiegu;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(g.x + ((c.x - g.x) / d) * odl, g.y + ((c.y - g.y) / d) * odl, rCelu * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function rysujCienieSniezek(ctx, stan) {
  const r = j(CONFIG.promienSniezki);
  ctx.fillStyle = "rgba(60, 90, 130, 0.3)";
  for (const sn of stan.sniezki) {
    const p = pozycjaSniezki(sn);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function rysujSniezki(ctx, stan) {
  const r = j(CONFIG.promienSniezki);
  for (const sn of stan.sniezki) {
    const p = pozycjaSniezki(sn);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(60, 90, 130, 0.6)";
    ctx.lineWidth = r * 0.25;
    ctx.beginPath();
    ctx.arc(p.x, p.y - p.wysokosc, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function rysujScene(ctx, stan) {
  rysujTlo(ctx);
  rysujCienieSniezek(ctx, stan);

  // Najpierw leżący (są na ziemi), potem stojący od góry do dołu,
  // żeby bliżsi (niżej) zasłaniali dalszych
  const wszyscy = [stan.gracz, ...stan.przeciwnicy];
  const lezacy = wszyscy.filter((z) => z.wyeliminowany);
  const stojacy = wszyscy.filter((z) => !z.wyeliminowany).sort((a, b) => a.y - b.y);
  for (const z of [...lezacy, ...stojacy]) {
    rysujZawodnika(ctx, z, z === stan.gracz);
  }
  // Kropki z trafieniami na końcu, żeby żadna postać ich nie zasłoniła
  for (const z of stojacy) rysujZycia(ctx, z);

  rysujCelowanie(ctx, stan); // nad postaciami, żeby cel na przeciwniku był widoczny
  rysujSniezki(ctx, stan); // śnieżki są w powietrzu, więc nad postaciami
  rysujChmurki(ctx, stan);
  rysujKropke(ctx, stan);
  rysujNapisy(ctx, stan);
}
