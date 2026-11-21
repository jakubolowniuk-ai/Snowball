// Rysowanie pola gry, zasp, zawodników, kropki i napisu.
// Rysujemy w jednostkach pola (szerokość 1000), skalowanie robi game.js.

function rysujTlo(ctx) {
  const W = SZEROKOSC_POLA;
  const H = WYSOKOSC_POLA;
  const g = j(CONFIG.glebokoscBrzegu);

  // Cały ekran (także margines poza polem) w kolorze brzegu
  ctx.fillStyle = CONFIG.kolorBrzegu;
  ctx.fillRect(widoczny.x0, widoczny.y0, widoczny.x1 - widoczny.x0, widoczny.y1 - widoczny.y0);

  // Biała połać śniegu na polu gry
  ctx.fillStyle = CONFIG.kolorSniegu;
  ctx.fillRect(0, 0, W, H);

  // Przyciemnienie przy brzegach pola: gradient od koloru brzegu do przezroczystości
  const brzegi = [
    [0, 0, 0, g, 0, 0, W, g], // góra
    [0, H, 0, H - g, 0, H - g, W, g], // dół
    [0, 0, g, 0, 0, 0, g, H], // lewo
    [W, 0, W - g, 0, W - g, 0, g, H], // prawo
  ];
  for (const [x1, y1, x2, y2, rx, ry, rw, rh] of brzegi) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, CONFIG.kolorBrzegu);
    gradient.addColorStop(1, "rgba(207, 225, 241, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(rx, ry, rw, rh);
  }
}

function rysujZaspy(ctx) {
  for (const z of CONFIG.zaspy) {
    const x = j(z.x);
    const y = j(z.y);
    const rx = j(z.szer) / 2;
    const ry = j(z.wys) / 2;

    // Niebieskawy cień pod zaspą
    ctx.fillStyle = "rgba(120, 160, 205, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + rx * 0.08, y + ry * 0.35, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sama zaspa: owal biały u góry, lekko niebieskawy na dole (wygląda na wypukły)
    const gradient = ctx.createLinearGradient(0, y - ry, 0, y + ry);
    gradient.addColorStop(0, CONFIG.kolorSniegu);
    gradient.addColorStop(1, "#dde9f5");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 0.95, ry * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function rysujZawodnika(ctx, z, toGracz) {
  const r = PROMIEN_POSTACI;
  const stopyY = z.y + r * 0.85; // wysokość "stóp" (dół postaci)

  // Cień: spłaszczony owal pod postacią
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, stopyY, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Niebieski owalny pierścień pod stopami gracza
  if (toGracz) {
    ctx.strokeStyle = CONFIG.kolorPierscienia;
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.ellipse(z.x, stopyY, r * 1.15, r * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ciało zawodnika
  ctx.fillStyle = z.druzyna === "czerwoni" ? CONFIG.kolorCzerwony : CONFIG.kolorZielony;
  ctx.beginPath();
  ctx.arc(z.x, z.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
}

function rysujKropke(ctx, stan) {
  const k = pozycjaKropki(stan);
  const r = j(CONFIG.promienKropki);
  ctx.save();
  // Półprzezroczysta, gdy nikt jej nie trzyma
  ctx.globalAlpha = stan.palec ? 1 : CONFIG.przezroczystoscKropki;
  ctx.fillStyle = CONFIG.kolorKropki;
  ctx.beginPath();
  ctx.arc(k.x, k.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.25;
  ctx.stroke();
  ctx.restore();
}

// Napis "Level N" na środku, tylko na początku poziomu
function rysujNapisLevel(ctx, stan) {
  if (stan.czasPoziomu > CONFIG.czasNapisuLevel) return;
  const rozmiar = j(CONFIG.rozmiarNapisuLevel);
  ctx.fillStyle = CONFIG.kolorNapisu;
  ctx.font = `300 ${rozmiar}px "Helvetica Neue", Roboto, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Level ${stan.poziom}`, SZEROKOSC_POLA / 2, WYSOKOSC_POLA / 2);
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
  rysujZaspy(ctx);
  rysujCienieSniezek(ctx, stan);

  // Rysujemy od góry do dołu, żeby bliżsi (niżej) zasłaniali dalszych
  const wszyscy = [stan.gracz, ...stan.przeciwnicy].sort((a, b) => a.y - b.y);
  for (const z of wszyscy) {
    rysujZawodnika(ctx, z, z === stan.gracz);
  }

  rysujCelowanie(ctx, stan); // nad postaciami, żeby cel na przeciwniku był widoczny
  rysujSniezki(ctx, stan); // śnieżki są w powietrzu, więc nad postaciami
  rysujKropke(ctx, stan);
  rysujNapisLevel(ctx, stan);
}
