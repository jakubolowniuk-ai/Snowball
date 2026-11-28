// Warstwa tła: osobne płótno POD płótnem gry. Tło (śnieg, teren, przyciemnienie brzegów) rysujemy
// na nim tylko wtedy, gdy coś się zmieni (inna mapa, obrót telefonu), a nie w każdej klatce.
// Rysowanie tła co klatkę zabierało ok. 80% czasu klatki. W Wielkiej arenie warstwa obejmuje
// cały świat, a za kamerą przesuwamy ją przez CSS (przesuwa ją karta graficzna, bez malowania).

const tloPlotno = document.getElementById("tlo");
const tloCtx = tloPlotno.getContext("2d");
let _kluczTla = ""; // opis tego, co jest teraz narysowane (zmiana = rysujemy od nowa)
let _obszarTla = null; // fragment świata na warstwie (jednostki pola)
let _pozycjaTla = ""; // ostatnie przesunięcie CSS warstwy

// Fragment świata do narysowania: cały świat plus marginesy ekranu wokół niego
function obszarTla() {
  const sw = stan.swiatPelny || stan.swiat || { x0: 0, y0: 0, x1: SZEROKOSC_POLA, y1: WYSOKOSC_POLA };
  return {
    x0: sw.x0 + widoczny.x0,
    y0: sw.y0 + widoczny.y0,
    x1: sw.x1 + (widoczny.x1 - SZEROKOSC_POLA),
    y1: sw.y1 + (widoczny.y1 - WYSOKOSC_POLA),
  };
}

// Co klatkę: rysuje tło od nowa tylko po zmianie, potem ustawia warstwę pod kamerą
function aktualizujWarstweTla() {
  const o = obszarTla();
  const klucz = [
    stan.mapa && stan.mapa.nazwa,
    stan.tryb,
    canvas.width,
    canvas.height,
    o.x0, o.y0, o.x1, o.y1,
    !!OBRAZY[TLO],
    !!buforTerenu(),
  ].join("|");
  if (klucz !== _kluczTla) {
    _kluczTla = klucz;
    _obszarTla = o;
    let pxNaJednostke = gestoscEkranu * skala;
    const szer = o.x1 - o.x0;
    const wys = o.y1 - o.y0;
    // Telefony nie obsłużą bardzo dużych płócien (iPhone: ok. 16 mln pikseli): wtedy mniej ostro
    const limit = CONFIG.maxPikseliTla;
    if (szer * wys * pxNaJednostke * pxNaJednostke > limit) pxNaJednostke = Math.sqrt(limit / (szer * wys));
    tloPlotno.width = Math.ceil(szer * pxNaJednostke);
    tloPlotno.height = Math.ceil(wys * pxNaJednostke);
    tloPlotno.style.width = szer * skala + "px";
    tloPlotno.style.height = wys * skala + "px";
    tloCtx.setTransform(pxNaJednostke, 0, 0, pxNaJednostke, -o.x0 * pxNaJednostke, -o.y0 * pxNaJednostke);
    rysujTlo(tloCtx, o);
    _pozycjaTla = "";
  }
  // Warstwa leży tam, gdzie kamera pokazuje świat
  const x = przesuniecieX + (_obszarTla.x0 - kamera.x) * skala;
  const y = przesuniecieY + (_obszarTla.y0 - kamera.y) * skala;
  const pozycja = `translate3d(${x}px, ${y}px, 0)`;
  if (pozycja !== _pozycjaTla) {
    tloPlotno.style.transform = pozycja;
    _pozycjaTla = pozycja;
  }
}

// Czyści płótno gry (jest przezroczyste, pod nim widać warstwę tła)
function wyczyscPlansze() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
