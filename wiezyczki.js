// Wieżyczka (bonus): po trafieniu bonusu w jego miejscu staje wieżyczka drużyny rzucającego.
// Sama strzela co odstepStrzalow w żywych z drużyny przeciwnej (najczęściej w najbliższego).
// Ma życia (trafienie śnieżką drużyny przeciwnej odejmuje jedno) i gałki; bez gałek zostaje
// jako dekoracja, aż ją zniszczą. Najwyżej jedna na drużynę. Nie blokuje ruchu.
// Wieżyczka w stan.wiezyczki: { wiezyczka: true, druzyna, x, y, zycia, amunicja, doStrzalu, katLufy }
// (x, y to środek, jak u postaci; ziemia jest niżej o stopy)

const WZ = () => typBonusu("wiezyczka"); // skrót do ustawień wieżyczki

// Stawia wieżyczkę drużyny w punkcie (x, y); stara wieżyczka tej drużyny znika
function postawWiezyczke(stan, druzyna, x, y) {
  stan.wiezyczki = stan.wiezyczki.filter((w) => w.druzyna !== druzyna);
  stan.wiezyczki.push({
    wiezyczka: true, // po tym poznajemy, że śnieżkę rzuciła wieżyczka, a nie postać
    druzyna,
    x,
    y,
    zycia: WZ().zycia,
    amunicja: WZ().amunicja,
    doStrzalu: WZ().odstepStrzalow,
    katLufy: druzyna === "czerwoni" ? -2.5 : 0.6, // na start lufa w stronę przeciwników
  });
}

// Cel wieżyczki: żywy z drużyny przeciwnej (w Wielkiej arenie tylko w zasięgu śnieżki).
// Z szansą szansaNajblizszego najbliższy, inaczej losowy. Niewidzialnego gracza widzi
// tylko w zapamiętanym miejscu (jak przeciwnicy). Zwraca punkt albo null.
function celWiezyczki(stan, w) {
  const cele = wszystkiePostacie(stan)
    .filter((z) => !z.wyeliminowany && z.druzyna !== w.druzyna)
    .map((z) => widocznyCel(stan, z))
    .filter((p) => !jestWielka(stan) || odleglosc(w.x, w.y, p.x, p.y) <= j(CONFIG.tryby.wielkaArena.zasiegSniezki));
  if (!cele.length) return null;
  if (Math.random() < WZ().szansaNajblizszego) {
    return cele.reduce((a, b) => (odleglosc(w.x, w.y, a.x, a.y) <= odleglosc(w.x, w.y, b.x, b.y) ? a : b));
  }
  return cele[Math.floor(Math.random() * cele.length)];
}

// Co klatkę: wieżyczki z gałkami strzelają co odstepStrzalow
function aktualizujWiezyczki(stan, dt) {
  for (const w of stan.wiezyczki) {
    if (w.amunicja <= 0) continue;
    w.doStrzalu -= dt;
    if (w.doStrzalu > 0) continue;
    w.doStrzalu = WZ().odstepStrzalow;
    const cel = celWiezyczki(stan, w);
    if (!cel) continue;
    // Losowy błąd w kole o promieniu rozrzut
    const kat = Math.random() * Math.PI * 2;
    const blad = j(WZ().rozrzut) * Math.sqrt(Math.random());
    const cx = cel.x + Math.cos(kat) * blad;
    const cy = cel.y + Math.sin(kat) * blad;
    const d = odleglosc(w.x, w.y, cx, cy);
    if (d === 0) continue;
    w.katLufy = Math.atan2(cy - w.y, cx - w.x);
    w.amunicja -= 1;
    stan.sniezki.push({
      rzucajacy: w,
      startX: w.x,
      startY: w.y,
      kierX: (cx - w.x) / d,
      kierY: (cy - w.y) / d,
      dlugosc: d,
      predkosc: j(pomiedzy(CONFIG.predkoscSniezkiMin, CONFIG.predkoscSniezkiMax, WZ().silaStrzalu)),
      przebyte: 0,
      upita: false,
    });
  }
}

// Wieżyczka trafiona śnieżką: traci życie; po ostatnim znika z chmurką
function trafienieWiezyczki(stan, w) {
  w.zycia -= 1;
  chmurkaSniegu(stan, w.x, w.y);
  if (w.zycia <= 0) stan.wiezyczki = stan.wiezyczki.filter((x) => x !== w);
}

// Zamieć: wieżyczki poza granicą świata znikają z chmurką
function usunWiezyczkiPoza(stan) {
  for (const w of stan.wiezyczki) if (pozaGranica(stan, w.x, w.y, 0)) chmurkaZamieci(stan, w.x, w.y);
  stan.wiezyczki = stan.wiezyczki.filter((w) => !pozaGranica(stan, w.x, w.y, 0));
}

// Rysunek zastępczy (kodem): podstawa, kopułka w kolorze drużyny, lufa w stronę ostatniego celu,
// kropki żyć i licznik gałek nad wieżyczką
function rysujWiezyczke(ctx, w) {
  const ziemia = w.y + PROMIEN_POSTACI * 0.85;
  const r = j(WZ().promienTrafienia);
  ctx.save();
  // Cień
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(w.x, ziemia, r * 1.4, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Podstawa
  ctx.fillStyle = "#4a515c";
  ctx.fillRect(w.x - r * 0.9, ziemia - r * 1.2, r * 1.8, r * 1.2);
  // Lufa (z widoku skośnie z góry: pion spłaszczony o połowę)
  const sx = w.x;
  const sy = ziemia - r * 1.6;
  ctx.strokeStyle = "#3a3f47";
  ctx.lineWidth = r * 0.45;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + Math.cos(w.katLufy) * r * 1.5, sy + Math.sin(w.katLufy) * r * 0.75);
  ctx.stroke();
  // Kopułka w kolorze drużyny
  ctx.fillStyle = kolorDruzyny(w);
  ctx.strokeStyle = "#2b2f36";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.75, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Kropki żyć
  const rk = j(CONFIG.promienKropekZycia);
  const yk = sy - r * 1.3;
  for (let i = 0; i < WZ().zycia; i++) {
    const x = w.x + (i - (WZ().zycia - 1) / 2) * rk * 3;
    ctx.beginPath();
    ctx.arc(x, yk, rk, 0, Math.PI * 2);
    if (i < w.zycia) {
      ctx.fillStyle = kolorDruzyny(w);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = rk * 0.35;
    ctx.stroke();
  }
  // Licznik gałek (pusta wieżyczka bez licznika)
  if (w.amunicja > 0) {
    ctx.fillStyle = "#2a4a66";
    ctx.font = `bold ${rk * 3}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(w.amunicja, w.x, yk - rk * 1.5);
  }
  ctx.restore();
}
