// Rysowanie tła, zawodników, śnieżek, joysticka i napisów.
// Rysujemy w jednostkach pola (szerokość 1000), skalowanie robi game.js.

const TLO = "assets/tlo/tlo_plansza.png";

// Wzór śniegu do kafelkowania dużego świata: fragment tła z samym polem gry
let _wzorSniegu = null;
function wzorSniegu(ctx) {
  if (_wzorSniegu) return _wzorSniegu;
  const obraz = OBRAZY[TLO];
  if (!obraz) return null;
  const s = SPRITY[TLO];
  const px = obraz.width / s.szer; // pikseli obrazka na jednostkę
  const wycinek = document.createElement("canvas");
  wycinek.width = Math.round(SZEROKOSC_POLA * px);
  wycinek.height = Math.round(WYSOKOSC_POLA * px);
  wycinek
    .getContext("2d")
    .drawImage(obraz, s.poleX * px, s.poleY * px, wycinek.width, wycinek.height, 0, 0, wycinek.width, wycinek.height);
  _wzorSniegu = ctx.createPattern(wycinek, "repeat");
  _wzorSniegu.setTransform(new DOMMatrix().scale(1 / px)); // piksele obrazka -> jednostki pola
  return _wzorSniegu;
}

// Tło: śnieg na całym ekranie, przyciemnienie poza światem i przy jego brzegach.
// Rysowane we współrzędnych świata (wywołuj po przesunięciu o kamerę).
function rysujTlo(ctx) {
  // Przyciemnienie przy brzegach pełnego świata (zwężanie pokazuje zamieć, nie tło)
  const sw = stan.swiatPelny || stan.swiat || { x0: 0, y0: 0, x1: SZEROKOSC_POLA, y1: WYSOKOSC_POLA };
  const X0 = sw.x0;
  const Y0 = sw.y0;
  const W = sw.x1 - sw.x0;
  const H = sw.y1 - sw.y0;
  const g = j(CONFIG.glebokoscBrzegu);
  const e = widokSwiata();
  const ekranX = e.x0;
  const ekranY = e.y0;
  const ekranW = e.x1 - e.x0;
  const ekranH = e.y1 - e.y0;

  // Kolor pod spodem (widać go tylko przed wczytaniem grafik albo poza obrazkiem tła)
  ctx.fillStyle = CONFIG.kolorBrzegu;
  ctx.fillRect(ekranX, ekranY, ekranW, ekranH);

  const obraz = OBRAZY[TLO];
  if (obraz && !jestWielka(stan)) {
    // Arena: obrazek tła tak, żeby pole gry leżało dokładnie w miejscu z sprites.json
    const s = SPRITY[TLO];
    ctx.drawImage(obraz, -s.poleX, -s.poleY, s.szer, s.wys);
  } else if (obraz) {
    // Wielka arena: śnieg z tła powtórzony jak kafelki na cały ekran
    ctx.fillStyle = wzorSniegu(ctx);
    ctx.fillRect(ekranX, ekranY, ekranW, ekranH);
  } else {
    ctx.fillStyle = CONFIG.kolorSniegu;
    ctx.fillRect(X0, Y0, W, H);
  }

  rysujTeren(ctx); // podłoże mapy (materiały z dane/teren.js), pod przyciemnieniem brzegów

  // Przyciemnienie: poza światem półprzezroczysty niebieskawy kolor,
  // a przy jego brzegach płynne przejście do przezroczystości
  ctx.save();
  ctx.globalAlpha = CONFIG.silaPrzyciemnienia;
  ctx.fillStyle = CONFIG.kolorBrzegu;
  ctx.fillRect(ekranX, ekranY, ekranW, Y0 - ekranY); // nad światem
  ctx.fillRect(ekranX, Y0 + H, ekranW, ekranY + ekranH - Y0 - H); // pod światem
  ctx.fillRect(ekranX, Y0, X0 - ekranX, H); // na lewo
  ctx.fillRect(X0 + W, Y0, ekranX + ekranW - X0 - W, H); // na prawo
  const brzegi = [
    [X0, Y0, X0, Y0 + g, X0, Y0, W, g], // góra
    [X0, Y0 + H, X0, Y0 + H - g, X0, Y0 + H - g, W, g], // dół
    [X0, Y0, X0 + g, Y0, X0, Y0, g, H], // lewo
    [X0 + W, Y0, X0 + W - g, Y0, X0 + W - g, Y0, g, H], // prawo
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

// --- Zawodnik z atlasu animacji ---

// Atlas (obrazek z klatkami) w kolorze drużyny
function atlasPostaci(z) {
  return ZAWODNIK.atlas(z.kolor); // kolor postaci (gracz: kolorGracza, przeciwnik: z typu)
}

// Widok postaci ("przod" albo "tyl"), ustawia go animacje.js wg kierunku ruchu i celowania
function widokPostaci(z) {
  if (z.anim) return z.anim.widok;
  return z.druzyna === "czerwoni" ? "tyl" : "przod";
}

// Obecna klatka postaci: { dane, odbicie } (klatkę wybiera animacje.js)
function klatkaPostaci(z) {
  // Eliminacja jest zawsze z klatek przodu; czerwony leży głową w lewo (jak w grafice),
  // zielony odbity (głową w prawo)
  if (z.anim && z.anim.akcja && z.anim.akcja.typ === "eliminacja") {
    return { dane: ZAWODNIK.klatki.przod[nazwaKlatki(z)], odbicie: z.druzyna !== "czerwoni" };
  }
  const klatki = ZAWODNIK.klatki[widokPostaci(z)];
  return { dane: klatki[nazwaKlatki(z)] || klatki.stanie, odbicie: !!(z.anim && z.anim.odbicie) };
}

// Rozmiar postaci w jednostkach pola (z mnożnikiem skali z config.js).
// Bierzemy klatkę "stanie", żeby kropki nad głową i bańka nie skakały przy każdej klatce.
function rozmiarPostaci(z) {
  const k = ZAWODNIK.klatki[widokPostaci(z)].stanie;
  return { szer: k.szer * CONFIG.skalaGrafik, wys: k.wys * CONFIG.skalaGrafik };
}

// Rysuje klatkę z atlasu tak, żeby jej kotwica wypadła w (x, y). Odbicie: lustro w poziomie
// (wtedy kotwica x zamienia się na 1 - x). Zwraca false, gdy atlas się nie wczytał.
function rysujKlatke(ctx, atlas, k, x, y, odbicie) {
  const obraz = OBRAZY[atlas];
  if (!obraz) return false;
  const szer = k.szer * CONFIG.skalaGrafik;
  const wys = k.wys * CONFIG.skalaGrafik;
  const kx = odbicie ? 1 - k.kotwicaX : k.kotwicaX;
  ctx.save();
  ctx.translate(x - kx * szer, y - k.kotwicaY * wys);
  if (odbicie) {
    ctx.translate(szer, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(obraz, k.ax, k.ay, k.aw, k.ah, 0, 0, szer, wys);
  ctx.restore();
  return true;
}

// Punkt dłoni klatki (środek trzymanej śnieżki) w świecie, albo null, gdy klatka go nie ma
function punktReki(k, x, y, odbicie) {
  if (!k.reka) return null;
  const szer = k.szer * CONFIG.skalaGrafik;
  const wys = k.wys * CONFIG.skalaGrafik;
  const kx = odbicie ? 1 - k.kotwicaX : k.kotwicaX;
  const rx = odbicie ? 1 - k.reka.x : k.reka.x;
  return { x: x + (rx - kx) * szer, y: y - (k.kotwicaY - k.reka.y) * wys, promien: k.reka.promien * CONFIG.skalaGrafik };
}

// Postać: klatka z atlasu plus śnieżka w dłoni rysowana kodem (grafiki jej nie mają)
// Upity kołysze się na boki (obrót wokół stóp)
function katKolysania(z) {
  if (!z.bonusy.some((ab) => ab.typ === "upicie")) return 0;
  const b = CONFIG.bonusy;
  return (Math.sin(stan.czasPoziomu * b.szybkoscKolysaniaUpicia + z.x) * b.kolysanieUpicia * Math.PI) / 180;
}

function rysujPostac(ctx, z, x0, y) {
  const kat = katKolysania(z);
  if (kat) {
    ctx.save();
    ctx.translate(x0, y);
    ctx.rotate(kat);
    ctx.translate(-x0, -y);
  }
  const wynik = rysujPostacProsto(ctx, z, x0, y);
  if (kat) ctx.restore();
  return wynik;
}

function rysujPostacProsto(ctx, z, x0, y) {
  const { dane, odbicie } = klatkaPostaci(z);
  const x = x0 + drzenieTrafienia(z); // z tyłu trafiony drży
  if (!rysujKlatke(ctx, atlasPostaci(z), dane, x, y, odbicie)) return false;
  // Spowolniona postać ma niebieskawy odcień
  if (z.bonusy.some((ab) => ab.typ === "spowolnieniePrzeciwnikow")) {
    rysujBlysk(ctx, z, dane, x, y, odbicie, CONFIG.bonusy.silaOdcieniaSpowolnienia, CONFIG.bonusy.odcienSpowolnienia);
  }
  rysujBlysk(ctx, z, dane, x, y, odbicie, silaBlysku(z));
  // Po wstawaniu: poprzednia klatka znika płynnie na wierzchu nowej
  const p = z.anim && z.anim.przenikanie;
  const stara = p && ZAWODNIK.klatki[widokPostaci(z)][p.klatka];
  if (stara) {
    ctx.save();
    ctx.globalAlpha *= 1 - p.czas / CONFIG.animacje.czasPrzenikania;
    rysujKlatke(ctx, atlasPostaci(z), stara, x, y, odbicie);
    ctx.restore();
  }
  // Z tyłu schylony zawodnik nie ma widocznych dłoni: lepiona śnieżka rośnie przy stopach
  if (widokPostaci(z) === "tyl" && przeladowanieTeraz(z)) {
    const postep = 1 - z.przeladowanie / z.przeladowanieCalosc;
    const a = CONFIG.animacje;
    const promien = a.lepionaSniezkaPromien * (a.lepionaSniezkaOd + (1 - a.lepionaSniezkaOd) * postep);
    const { szer } = rozmiarPostaci(z);
    rysujSniezkeOPromieniu(ctx, x + szer * a.lepionaSniezkaX, y - promien, promien);
  }
  // Śnieżka w dłoni: tylko w klatkach z dłonią i dopiero po przeładowaniu (po rzucie ręka pusta)
  const r = punktReki(dane, x, y, odbicie);
  if (r && !(z.przeladowanie > 0)) rysujSniezkeOPromieniu(ctx, r.x, r.y, r.promien);
  return true;
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
  const y = stopyY(z);
  const { dane, odbicie } = klatkaPostaci(z);
  // Cień pod leżącym (szerszy, gdy już leży)
  const szer = dane.szer * CONFIG.skalaGrafik;
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, y, szer * 0.5, szer * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  rysujKlatke(ctx, atlasPostaci(z), dane, z.x, y, odbicie);
}

// Z tyłu nie ma klatek trafienia: drżenie w poziomie (przesunięcie) i czerwony błysk
function drzenieTrafienia(z) {
  const a = z.anim;
  if (!a || !a.akcja || a.akcja.typ !== "trafiony" || a.widok !== "tyl") return 0;
  const zanik = Math.max(0, 1 - a.akcja.czas / CONFIG.animacje.czasDrzenia);
  return Math.sin(a.akcja.czas * 60) * j(CONFIG.animacje.drzenie) * zanik;
}

function silaBlysku(z) {
  const a = z.anim;
  if (!a || !a.akcja || a.akcja.typ !== "trafiony" || a.widok !== "tyl") return 0;
  return Math.max(0, 1 - a.akcja.czas / CONFIG.animacje.czasBlysku) * CONFIG.animacje.silaBlysku;
}

// Klatka zabarwiona na czerwono (błysk): rysujemy ją na osobnym małym canvasie,
// barwimy tylko jej piksele i kładziemy na planszę
const _blysk = document.createElement("canvas");
function rysujBlysk(ctx, z, k, x, y, odbicie, sila, kolor = "230, 40, 40") {
  const obraz = OBRAZY[atlasPostaci(z)];
  if (!obraz || sila <= 0) return;
  _blysk.width = k.aw;
  _blysk.height = k.ah;
  const c = _blysk.getContext("2d");
  c.clearRect(0, 0, k.aw, k.ah);
  c.drawImage(obraz, k.ax, k.ay, k.aw, k.ah, 0, 0, k.aw, k.ah);
  c.globalCompositeOperation = "source-atop"; // farba tylko tam, gdzie jest postać
  c.fillStyle = `rgba(${kolor}, ${sila})`;
  c.fillRect(0, 0, k.aw, k.ah);
  c.globalCompositeOperation = "source-over";
  const szer = k.szer * CONFIG.skalaGrafik;
  const wys = k.wys * CONFIG.skalaGrafik;
  const kx = odbicie ? 1 - k.kotwicaX : k.kotwicaX;
  ctx.save();
  ctx.translate(x - kx * szer, y - k.kotwicaY * wys);
  if (odbicie) {
    ctx.translate(szer, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(_blysk, 0, 0, szer, wys);
  ctx.restore();
}

// --- Stanowiska ---

// Delikatny okrąg strefy na ziemi, gdy w strefie stoi postać tej drużyny
function rysujStrefeStanowiska(ctx, stan, st) {
  if (st.amunicja <= 0) return;
  const ktos = wszystkiePostacie(stan).some(
    (z) => stanowiskoDlaDruzyny(st, z) && !z.wyeliminowany && wStrefieStanowiska(z, st)
  );
  if (!ktos) return;
  const armatka = st.typ === "armatka";
  const r = j(armatka ? CONFIG.stanowiska.armatka.promienStania : CONFIG.stanowiska.stos.promien);
  ctx.save();
  ctx.strokeStyle = "rgba(42, 111, 214, 0.45)";
  ctx.fillStyle = "rgba(42, 111, 214, 0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(armatka ? st.stoiX : st.x, armatka ? st.stoiY : st.y, r, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Stos gałek: im mniej amunicji, tym mniejszy (6, 3 albo 1 kula)
function rysujStos(ctx, st) {
  const czesc = st.amunicja / st.amunicjaStart;
  const cfg = CONFIG.stanowiska.stos;
  const obraz = cfg.grafika && OBRAZY[cfg.grafika];
  const rb = 9; // promień jednej kuli (jednostki pola)
  // Cień
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(st.x, st.y, rb * 3.4, rb * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (obraz) {
    const rozmiar = j(cfg.promien) * 1.6 * (0.5 + 0.5 * czesc);
    ctx.drawImage(obraz, st.x - rozmiar / 2, st.y - rozmiar * 0.9, rozmiar, rozmiar);
    return;
  }
  // Kule w piramidzie: dolny rząd, środkowy, górny
  let kule;
  if (czesc > 0.66) kule = [[-2, 0], [0, 0], [2, 0], [-1, -1.6], [1, -1.6], [0, -3.2]];
  else if (czesc > 0.33) kule = [[-1, 0], [1, 0], [0, -1.6]];
  else kule = [[0, 0]];
  for (const [kx, ky] of kule) {
    const x = st.x + kx * rb;
    const y = st.y - rb + ky * rb;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(60, 90, 130, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, rb, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

// Armatka: szary korpus z kołami i lufą skierowaną w stronę przeciwnika; nad nią licznik
function rysujArmatke(ctx, st) {
  const cfg = CONFIG.stanowiska.armatka;
  const obraz = cfg.grafika && OBRAZY[cfg.grafika];
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(st.x, st.y, 26, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (obraz) {
    const rozmiar = 56;
    ctx.drawImage(obraz, st.x - rozmiar / 2, st.y - rozmiar * 0.9, rozmiar, rozmiar);
  } else {
    // Lufa: w lewo-górę u czerwonych, w prawo-dół u zielonych
    // (neutralna armatka w Wielkiej arenie celuje w lewo-górę, jak armatka gracza)
    const kierunek = st.druzyna === "zieloni" ? 1 : -1;
    const dx = 0.85 * kierunek;
    const dy = 0.5 * kierunek;
    const sx = st.x;
    const sy = st.y - 14;
    ctx.strokeStyle = "#5b6470";
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx * 30, sy + dy * 30);
    ctx.stroke();
    ctx.lineCap = "butt";
    // Korpus i koła
    ctx.fillStyle = "#7d8792";
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3f4650";
    for (const kx of [-11, 11]) {
      ctx.beginPath();
      ctx.arc(sx + kx, st.y - 4, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Licznik amunicji
  if (st.amunicja > 0) {
    ctx.fillStyle = "#2a4a66";
    ctx.font = `bold 15px "Helvetica Neue", Roboto, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(st.amunicja), st.x, st.y - 42);
  }
}

function rysujStanowisko(ctx, st) {
  if (st.typ === "stos") rysujStos(ctx, st);
  else rysujArmatke(ctx, st);
}

// --- Bonusy ---

// Ikona bonusu (środek w (x, y), bok kwadratu "rozmiar"); bez ikony kolorowa kula o promieniu r
function rysujKuleBonusu(ctx, typ, x, y, r, rozmiar) {
  const obraz = typ.grafika && OBRAZY[typ.grafika];
  if (obraz) {
    ctx.drawImage(obraz, x - rozmiar / 2, y - rozmiar / 2, rozmiar, rozmiar);
    return;
  }
  // Kształt zastępczy: kolorowa kula z białym obrysem i jasnym odblaskiem
  ctx.fillStyle = typ.kolor;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.2;
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Bonus na planszy: miękki cień na ziemi i ikona lekko unosząca się w górę i w dół
// (cień i unoszenie rysuje kod, grafiki ich nie mają). Okrąg trafienia bez zmian.
// W ostatnich sekundach życia miga.
function rysujBonusNaPlanszy(ctx, stan, b) {
  if (b.zostalo < CONFIG.bonusy.miganieOstatnie && Math.floor(b.zostalo * 6) % 2 === 0) return;
  const r = j(CONFIG.bonusy.promienTrafienia);
  const ziemia = b.y + PROMIEN_POSTACI * 0.85;
  const unoszenie = Math.sin(stan.czasPoziomu * 3 + b.x) * r * 0.3;
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(b.x, ziemia, r * 1.1, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  rysujKuleBonusu(ctx, typBonusu(b.typ), b.x, b.y + unoszenie, r, j(CONFIG.bonusy.rozmiarIkony));
}

// Bańka wokół postaci z Bombką (tarczą)
function rysujBanke(ctx, z) {
  if (!z.bonusy.some((ab) => ab.typ === "bombka")) return;
  const { wys } = rozmiarPostaci(z);
  const x = z.x;
  const y = stopyY(z) - wys * 0.48;
  const r = wys * 0.62;
  ctx.save();
  ctx.fillStyle = "rgba(180, 220, 255, 0.22)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Odblask
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.8, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
}

// Ikony aktywnych bonusów nad kropkami trafień, z kołowym odliczaniem czasu
// i liczbą pozostałych rzutów (Gwiazdka, Pełna siła)
function rysujIkonyBonusow(ctx, z, yKropek) {
  if (!z.bonusy.length) return;
  const ri = j(CONFIG.promienKropekZycia) * 1.4;
  const y = yKropek - ri * 2.6;
  z.bonusy.forEach((ab, i) => {
    const typ = typBonusu(ab.typ);
    const odstep = Math.max(ri * 2.8, j(CONFIG.bonusy.rozmiarIkonyAktywnej) * 1.35); // miejsce na liczbę rzutów
    const x = z.x + (i - (z.bonusy.length - 1) / 2) * odstep;
    rysujKuleBonusu(ctx, typ, x, y, ri, j(CONFIG.bonusy.rozmiarIkonyAktywnej));
    if (ab.rzuty !== undefined) {
      // Liczba pozostałych rzutów w prawym dolnym rogu ikony
      ctx.save();
      ctx.font = `bold ${ri * 1.2}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = ri * 0.35;
      ctx.strokeStyle = "rgba(20, 30, 60, 0.9)";
      ctx.fillStyle = "#ffffff";
      ctx.strokeText(ab.rzuty, x + ri * 0.95, y + ri * 0.85);
      ctx.fillText(ab.rzuty, x + ri * 0.95, y + ri * 0.85);
      ctx.restore();
    }
    // Odliczanie: biały łuk znika zgodnie z ruchem wskazówek zegara
    const czesc = ab.pozostalo / czasTrwaniaTypu(typ);
    ctx.strokeStyle = "rgba(40, 60, 90, 0.8)";
    ctx.lineWidth = ri * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, ri * 1.45, -Math.PI / 2, -Math.PI / 2 + czesc * Math.PI * 2);
    ctx.stroke();
  });
}

// Trzy małe kropki nad głową: pełne = trafienia, które zostały
function rysujZycia(ctx, z) {
  const ile = z.maxTrafien; // liczba żyć tej postaci
  const zostalo = ile - z.trafienia;
  const rk = j(CONFIG.promienKropekZycia);
  const odstep = rk * 3;
  const { wys } = rozmiarPostaci(z);
  // Nad głową, ale nie wyżej niż górna krawędź ekranu (z miejscem na ikony bonusów nad kropkami)
  const ri = rk * 1.4;
  const zapasIkon = z.bonusy.length ? ri * 2.6 + Math.max(ri * 1.45, j(CONFIG.bonusy.rozmiarIkonyAktywnej) / 2) : 0;
  const y = Math.max(stopyY(z) - wys - rk * 2, widokSwiata().y0 + rk * 1.5 + zapasIkon);
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
  rysujIkonyBonusow(ctx, z, y);
}

function rysujZawodnika(ctx, z, toGracz) {
  if (z.wyeliminowany) {
    rysujLezacego(ctx, z);
    return;
  }
  const r = PROMIEN_POSTACI;
  const y = stopyY(z);

  ctx.save();

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
  // Niesiony wiatrem zamieci podskakuje (cień zostaje na ziemi)
  const podskok = z.wiatr ? Math.abs(Math.sin(stan.czasPoziomu * 12)) * j(CONFIG.tryby.wielkaArena.wysokoscPodskoku) : 0;
  // Niewidzialny: półprzezroczysty (widać go, także samego siebie, ale słabo)
  const alfa = z.bonusy.some((ab) => ab.typ === "niewidzialnosc") ? typBonusu("niewidzialnosc").alfa : 1;
  ctx.globalAlpha *= alfa;
  if (!rysujPostac(ctx, z, z.x, y - podskok)) {
    ctx.fillStyle = kolorDruzyny(z);
    ctx.beginPath();
    ctx.arc(z.x, z.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= alfa;
  rysujBanke(ctx, z);
  ctx.restore();
}


// Po trafieniu: obłoczek śniegu i rozbryzg. Rosną i znikają w czasie czasChmurki.
// Serduszko po Pierniczku: unosi się nad głową postaci i znika
function rysujSerduszko(ctx, ch) {
  const z = ch.serce;
  const t = ch.czas / ch.trwa; // od 0 do 1
  const { wys } = rozmiarPostaci(z);
  const r = j(CONFIG.promienKropekZycia) * 1.6;
  const x = z.x;
  const y = stopyY(z) - wys - r * 6 - t * r * 4;
  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.fillStyle = "#e0304a";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.3;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 1.2);
  ctx.bezierCurveTo(x - r * 2, y, x - r * 1.2, y - r * 1.4, x, y - r * 0.5);
  ctx.bezierCurveTo(x + r * 1.2, y - r * 1.4, x + r * 2, y, x, y + r * 1.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Wybuch Upicia: fioletowy krąg rośnie do promienia wybuchu i znika (przez czasChmurki)
function rysujWybuchUpicia(ctx, ch) {
  const t = ch.czas / CONFIG.czasChmurki; // od 0 do 1
  const r = ch.promien * Math.min(1, t * 2); // w pierwszej połowie rośnie do pełnego promienia
  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.fillStyle = ch.kolor;
  ctx.globalAlpha *= 0.3;
  ctx.beginPath();
  ctx.arc(ch.x, ch.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha /= 0.3;
  ctx.strokeStyle = ch.kolor;
  ctx.lineWidth = j(CONFIG.gruboscPierscienia);
  ctx.stroke();
  ctx.restore();
}

function rysujChmurki(ctx, stan) {
  for (const ch of stan.chmurki) {
    if (ch.serce) {
      rysujSerduszko(ctx, ch);
      continue;
    }
    if (ch.wybuch) {
      rysujWybuchUpicia(ctx, ch);
      continue;
    }
    const t = ch.czas / CONFIG.czasChmurki; // od 0 do 1
    ctx.save();
    ctx.globalAlpha = 1 - t * t; // na początku wyraźne, pod koniec szybko znikają
    for (const [sciezka, skala] of [
      [ch.obloczek, 0.8 + 0.5 * t],
      [ch.rozbryzg, 0.6 + 0.6 * t],
    ]) {
      const obraz = sciezka && OBRAZY[sciezka];
      if (!obraz) continue;
      const { szer, wys } = rozmiarGrafiki(sciezka);
      ctx.drawImage(obraz, ch.x - (szer * skala) / 2, ch.y - (wys * skala) / 2, szer * skala, wys * skala);
    }
    ctx.restore();
  }
}

// Joystick: półprzezroczysta podstawa i gałka przesunięta o wychylenie
function rysujPad(ctx) {
  const s = pozycjaPada();
  const R = j(CONFIG.promienPadu);
  const rg = j(CONFIG.promienGalki);
  const gx = s.x + pad.wychylX * R;
  const gy = s.y + pad.wychylY * R;
  ctx.save();
  ctx.globalAlpha = pad.dotykany ? CONFIG.przezroczystoscPaduAktywnego : CONFIG.przezroczystoscPadu;
  // Podstawa: pierścień z lekko wypełnionym środkiem
  ctx.fillStyle = CONFIG.kolorPadu;
  ctx.globalAlpha *= 0.35;
  ctx.beginPath();
  ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha /= 0.35;
  ctx.strokeStyle = CONFIG.kolorPadu;
  ctx.lineWidth = R * 0.06;
  ctx.stroke();
  // Gałka
  ctx.beginPath();
  ctx.arc(gx, gy, rg, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = rg * 0.15;
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
  } else if (ostrzezenieZamieci(stan)) {
    rysujNapis(ctx, "Zamieć się zbliża!");
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

  // Siła na pierścieniu celu (gdy zasięg nie zależy od siły): blady okrąg
  // i łuk od góry, który wypełnia się proporcjonalnie do siły
  if (!CONFIG.zasiegZalezyOdSily) {
    const s = sila(c.czas);
    const rLuku = rCelu * 1.35;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(120, 140, 160, 0.35)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, rLuku, 0, Math.PI * 2);
    ctx.stroke();
    if (s > 0) {
      ctx.strokeStyle = s >= 1 ? CONFIG.kolorZasieguDoleci : CONFIG.kolorZasiegu;
      ctx.beginPath();
      ctx.arc(c.x, c.y, rLuku, -Math.PI / 2, -Math.PI / 2 + s * Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

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

const GRAFIKA_SNIEZKI = "assets/efekty/sniezka.png";

// Cień śnieżki sunie po ziemi (na wysokości stóp), a śnieżka leci nad nim łukiem
function rysujCienieSniezek(ctx, stan) {
  const r = j(CONFIG.promienSniezki) * CONFIG.skalaSniezki;
  ctx.fillStyle = "rgba(50, 80, 120, 0.4)";
  for (const sn of stan.sniezki) {
    const p = pozycjaSniezki(sn);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + PROMIEN_POSTACI * 0.85, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Śnieżka z grafiki (powiększona o skalaSniezki, żeby była lepiej widoczna)
function rysujJednaSniezke(ctx, x, y, skala = 1) {
  const obraz = OBRAZY[GRAFIKA_SNIEZKI];
  const { szer, wys } = rozmiarGrafiki(GRAFIKA_SNIEZKI);
  const k = CONFIG.skalaSniezki * skala; // skala: mnożnik dla mniejszych śnieżek (np. w dłoni)
  if (obraz) {
    ctx.drawImage(obraz, x - (szer * k) / 2, y - (wys * k) / 2, szer * k, wys * k);
  } else {
    const r = j(CONFIG.promienSniezki) * k;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Śnieżka o zadanym promieniu (np. trzymana w dłoni)
function rysujSniezkeOPromieniu(ctx, x, y, promien) {
  const { szer } = rozmiarGrafiki(GRAFIKA_SNIEZKI);
  rysujJednaSniezke(ctx, x, y, (promien * 2) / (szer * CONFIG.skalaSniezki));
}

function rysujSniezki(ctx, stan) {
  for (const sn of stan.sniezki) {
    const p = pozycjaSniezki(sn);
    if (mnoznikPredkosciSniezki(stan, sn) < 1) {
      // Spowolniona śnieżka: delikatna turkusowa poświata
      ctx.fillStyle = CONFIG.bonusy.poswiataSpowolnionejSniezki;
      ctx.beginPath();
      ctx.arc(p.x, p.y - p.wysokosc, j(CONFIG.promienSniezki) * CONFIG.skalaSniezki * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    rysujJednaSniezke(ctx, p.x, p.y - p.wysokosc);
  }
}

function rysujScene(ctx, stan) {
  // Świat rysujemy przesunięty o kamerę; pad i napisy na końcu, bez przesunięcia
  ctx.save();
  ctx.translate(-kamera.x, -kamera.y);
  rysujSwiat(ctx, stan);
  ctx.restore();
  rysujStrzalki(ctx, stan);
  rysujPad(ctx);
  rysujNapisy(ctx, stan);
}

// Rysujemy tylko to, co widać na ekranie (z zapasem na wysokie grafiki)
function widac(x, y) {
  return naEkranie(x, y, 150);
}

function rysujSwiat(ctx, stan) {
  rysujTlo(ctx);
  rysujCienieSniezek(ctx, stan);

  // Najpierw leżący (są na ziemi), potem stojący od góry do dołu,
  // żeby bliżsi (niżej) zasłaniali dalszych
  const wszyscy = wszystkiePostacie(stan);
  const lezacy = wszyscy.filter((z) => z.wyeliminowany);
  const stojacy = wszyscy.filter((z) => !z.wyeliminowany);
  for (const p of wszystkieDekoracje()) if (p.naZiemi && widac(p.x, p.y)) rysujSprite(ctx, p.sciezka, p.x, p.y);
  for (const z of lezacy) rysujZawodnika(ctx, z, z === stan.gracz);
  for (const st of widoczneStanowiska(stan)) rysujStrefeStanowiska(ctx, stan, st);

  // Stojący zawodnicy i dekoracje razem, od góry do dołu według poziomu stóp/podstawy:
  // kto stoi niżej na ekranie (bliżej nas), zasłania tego, kto stoi wyżej
  const obiekty = [
    ...stojacy.map((z) => ({ x: z.x, y: stopyY(z), rysuj: () => rysujZawodnika(ctx, z, z === stan.gracz) })),
    ...wszystkieDekoracje().filter((p) => !p.naZiemi).map((p) => ({ x: p.x, y: p.y, rysuj: () => rysujSprite(ctx, p.sciezka, p.x, p.y) })),
    ...widoczneStanowiska(stan).map((st) => ({ x: st.x, y: st.y, rysuj: () => rysujStanowisko(ctx, st) })),
    ...stan.bonusy.map((b) => ({ x: b.x, y: b.y + PROMIEN_POSTACI * 0.85, rysuj: () => rysujBonusNaPlanszy(ctx, stan, b) })),
    ...stan.wiezyczki.map((w) => ({ x: w.x, y: w.y + PROMIEN_POSTACI * 0.85, rysuj: () => rysujWiezyczke(ctx, w) })),
  ]
    .filter((o) => widac(o.x, o.y))
    .sort((a, b) => a.y - b.y);
  for (const o of obiekty) o.rysuj();
  // Kropki z trafieniami na końcu, żeby żadna postać ich nie zasłoniła
  for (const z of stojacy) rysujZycia(ctx, z);

  rysujCelowanie(ctx, stan); // nad postaciami, żeby cel na przeciwniku był widoczny
  rysujSniezki(ctx, stan); // śnieżki są w powietrzu, więc nad postaciami
  rysujChmurki(ctx, stan);
  rysujZamiec(ctx, stan);
}
