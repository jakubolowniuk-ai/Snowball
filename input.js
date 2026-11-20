// Dotyk i mysz przez Pointer Events (jedno API dla obu).

function odleglosc(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Podpina obsługę wskaźnika do canvasa.
// ekranNaPlansze: funkcja zamieniająca współrzędne ekranu na współrzędne planszy.
function podepnijSterowanie(canvas, stan, ekranNaPlansze) {
  // Śledzimy tylko jeden palec naraz
  let aktywnyPalec = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (aktywnyPalec !== null) return;
    const p = ekranNaPlansze(e.clientX, e.clientY);

    // Czy dotknięto czerwonego zawodnika? Wtedy go zaznaczamy.
    const zasieg = CONFIG.promienZawodnika + CONFIG.zapasDotyku;
    const trafiony = stan.zawodnicy.find(
      (z) => z.druzyna === "czerwoni" && odleglosc(p.x, p.y, z.x, z.y) <= zasieg
    );
    if (trafiony) {
      stan.zaznaczony = trafiony;
      stan.cel = null;
      return;
    }

    // Czy dotyk jest w pobliżu zaznaczonego? Wtedy zawodnik idzie do palca.
    const z = stan.zaznaczony;
    if (z && odleglosc(p.x, p.y, z.x, z.y) <= CONFIG.promienPobliza) {
      aktywnyPalec = e.pointerId;
      stan.cel = p;
      // Dalej dostajemy ruchy palca, nawet gdy wyjedzie poza canvas
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== aktywnyPalec) return;
    stan.cel = ekranNaPlansze(e.clientX, e.clientY);
  });

  function puszczenie(e) {
    if (e.pointerId !== aktywnyPalec) return;
    aktywnyPalec = null;
    stan.cel = null;
  }
  canvas.addEventListener("pointerup", puszczenie);
  canvas.addEventListener("pointercancel", puszczenie);
}
