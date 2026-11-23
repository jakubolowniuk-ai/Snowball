// Dotyk i mysz przez Pointer Events (jedno API dla obu).
// Każdy palec ma swój numer (pointerId), dzięki temu obsługujemy dwa palce naraz:
// jeden na joysticku (ruch), drugi gdziekolwiek indziej (celowanie i rzut).

function odleglosc(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Podpina obsługę wskaźnika do canvasa.
// ekranNaPlansze: funkcja zamieniająca współrzędne ekranu na współrzędne planszy.
function podepnijSterowanie(canvas, stan, ekranNaPlansze) {
  let palecPada = null; // numer palca na joysticku (null = nikt)
  let palecCelu = null; // numer palca, który celuje (null = nikt)

  // Punkty z ekranNaPlansze są w oknie ekranu (bez kamery): tak sprawdzamy pad.
  // Celowanie samo przelicza je na punkty świata (z przesunięciem kamery).
  canvas.addEventListener("pointerdown", (e) => {
    if (stan.wMenu) return;
    const p = ekranNaPlansze(e.clientX, e.clientY);

    if (palecPada === null && naPadzie(p)) {
      // Pad można złapać zawsze, także przy ogłuszeniu (zawodnik ruszy, gdy minie)
      palecPada = e.pointerId;
      pad.dotykany = true;
      ustawWychylenie(p);
    } else if (!naPadzie(p) && palecCelu === null && graczMozeSterowac(stan) && stan.gracz.przeladowanie <= 0) {
      // Celowanie: nie przy ogłuszeniu, nie po końcu poziomu i nie w trakcie przeładowania
      palecCelu = e.pointerId;
      zacznijCelowanie(stan, p);
    } else {
      return; // trzeci palec i kolejne pomijamy
    }
    // Dalej dostajemy ruchy palca, nawet gdy wyjedzie poza canvas albo poza pad
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = ekranNaPlansze(e.clientX, e.clientY);
    if (e.pointerId === palecPada) ustawWychylenie(p);
    // Po trafieniu gra sama przerywa celowanie; wtedy ruchy palca pomijamy
    if (e.pointerId === palecCelu && stan.celowanie) przesunCelowanie(stan, p);
  });

  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerId === palecPada) {
      palecPada = null;
      puscPad(); // gałka wraca na środek, zawodnik staje
    }
    if (e.pointerId === palecCelu) {
      palecCelu = null;
      rzuc(stan, ekranNaPlansze(e.clientX, e.clientY));
    }
  });

  // Przerwany dotyk (np. przyszło powiadomienie): puszczamy pad, rzutu nie ma
  canvas.addEventListener("pointercancel", (e) => {
    if (e.pointerId === palecPada) {
      palecPada = null;
      puscPad();
    }
    if (e.pointerId === palecCelu) {
      palecCelu = null;
      stan.celowanie = null;
    }
  });
}
