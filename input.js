// Dotyk i mysz przez Pointer Events (jedno API dla obu).
// Każdy palec ma swój numer (pointerId), dzięki temu obsługujemy dwa palce naraz:
// jeden na kropce (ruch), drugi gdziekolwiek indziej (celowanie i rzut).

function odleglosc(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Podpina obsługę wskaźnika do canvasa.
// ekranNaPlansze: funkcja zamieniająca współrzędne ekranu na współrzędne planszy.
function podepnijSterowanie(canvas, stan, ekranNaPlansze) {
  let palecKropki = null; // numer palca na kropce (null = nikt)
  let palecCelu = null; // numer palca, który celuje (null = nikt)

  canvas.addEventListener("pointerdown", (e) => {
    // Ogłuszony, wyeliminowany albo koniec poziomu: dotyk nic nie robi
    if (!graczMozeSterowac(stan)) return;
    const p = ekranNaPlansze(e.clientX, e.clientY);
    const k = pozycjaKropki(stan);
    const naKropce = odleglosc(p.x, p.y, k.x, k.y) <= j(CONFIG.promienDotykuKropki);

    if (naKropce && palecKropki === null) {
      palecKropki = e.pointerId;
      zlapKropke(stan, p);
    } else if (!naKropce && palecCelu === null && stan.gracz.przeladowanie <= 0) {
      // W trakcie przeładowania dotyk planszy nic nie robi
      palecCelu = e.pointerId;
      zacznijCelowanie(stan, p);
    } else {
      return; // trzeci palec i kolejne pomijamy
    }
    // Dalej dostajemy ruchy palca, nawet gdy wyjedzie poza canvas
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = ekranNaPlansze(e.clientX, e.clientY);
    // Po trafieniu gra sama puszcza kropkę i celowanie; wtedy ruchy palca pomijamy
    if (e.pointerId === palecKropki && stan.chwyt) stan.palec = p;
    if (e.pointerId === palecCelu && stan.celowanie) {
      stan.celowanie.x = p.x;
      stan.celowanie.y = p.y;
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerId === palecKropki) {
      palecKropki = null;
      pusc(stan);
    }
    if (e.pointerId === palecCelu) {
      palecCelu = null;
      rzuc(stan, ekranNaPlansze(e.clientX, e.clientY));
    }
  });

  // Przerwany dotyk (np. przyszło powiadomienie): puszczamy kropkę, rzutu nie ma
  canvas.addEventListener("pointercancel", (e) => {
    if (e.pointerId === palecKropki) {
      palecKropki = null;
      pusc(stan);
    }
    if (e.pointerId === palecCelu) {
      palecCelu = null;
      stan.celowanie = null;
    }
  });
}
