// Rysowanie planszy i zawodników.

function rysujTlo(ctx) {
  const W = CONFIG.szerokoscPlanszy;
  const H = CONFIG.wysokoscPlanszy;

  // Śnieg: od niebieskawego u góry do białego na dole
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#dbeaf7");
  gradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Delikatny pas pośrodku planszy
  ctx.fillStyle = "rgba(120, 160, 200, 0.12)";
  ctx.fillRect(W / 2 - 3, 0, 6, H);

  // Ramka planszy
  ctx.strokeStyle = "rgba(90, 130, 170, 0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
}

function rysujZawodnika(ctx, z, zaznaczony) {
  const r = CONFIG.promienZawodnika;

  // Cień: spłaszczony owal pod postacią
  ctx.fillStyle = "rgba(60, 90, 130, 0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, z.y + r * 0.9, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pierścień zaznaczenia
  if (zaznaczony) {
    ctx.strokeStyle = CONFIG.kolorZaznaczenia;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(z.x, z.y, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ciało zawodnika
  ctx.fillStyle = z.druzyna === "czerwoni" ? CONFIG.kolorCzerwony : CONFIG.kolorZielony;
  ctx.beginPath();
  ctx.arc(z.x, z.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function rysujScene(ctx, stan) {
  rysujTlo(ctx);

  // Rysujemy od góry do dołu, żeby bliżsi (niżej) zasłaniali dalszych
  const posortowani = [...stan.zawodnicy].sort((a, b) => a.y - b.y);
  for (const z of posortowani) {
    rysujZawodnika(ctx, z, z === stan.zaznaczony);
  }
}
