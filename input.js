// Dotyk i mysz przez Pointer Events (jedno API dla obu).
// Każdy palec ma swój numer (pointerId), więc później dojdzie drugi palec do rzutu.

function odleglosc(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Podpina obsługę wskaźnika do canvasa.
// ekranNaPlansze: funkcja zamieniająca współrzędne ekranu na współrzędne planszy.
function podepnijSterowanie(canvas, stan, ekranNaPlansze) {
  // Numer palca, który trzyma kropkę (null = nikt)
  let palecKropki = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (palecKropki !== null) return;
    const p = ekranNaPlansze(e.clientX, e.clientY);
    const k = pozycjaKropki(stan);
    if (odleglosc(p.x, p.y, k.x, k.y) <= j(CONFIG.promienDotykuKropki)) {
      palecKropki = e.pointerId;
      zlapKropke(stan, p);
      // Dalej dostajemy ruchy palca, nawet gdy wyjedzie poza canvas
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== palecKropki) return;
    stan.palec = ekranNaPlansze(e.clientX, e.clientY);
  });

  function puszczenie(e) {
    if (e.pointerId !== palecKropki) return;
    palecKropki = null;
    pusc(stan);
  }
  canvas.addEventListener("pointerup", puszczenie);
  canvas.addEventListener("pointercancel", puszczenie);
}
