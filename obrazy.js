// Wczytywanie grafik. Gra startuje dopiero, gdy wszystkie obrazki są gotowe.
// Dane poniżej są przepisane z sprites.json (przeglądarka nie pozwala wczytać
// pliku JSON, gdy index.html jest otwarty prosto z dysku, więc trzymamy je tutaj).
// szer, wys: rozmiar w grze w jednostkach pola; kotwica: punkt obrazka (ułamek
// szerokości i wysokości), który kładziemy na pozycji obiektu.

const SPRITY = {
  "assets/dekoracje/choinka_1.png": { szer: 72.0, wys: 102.0, kotwicaX: 0.5, kotwicaY: 0.97 },
  "assets/dekoracje/choinka_2.png": { szer: 58.0, wys: 87.5, kotwicaX: 0.5, kotwicaY: 0.97 },
  "assets/dekoracje/choinka_3.png": { szer: 50.5, wys: 64.5, kotwicaX: 0.5, kotwicaY: 0.97 },
  "assets/dekoracje/choinka_4.png": { szer: 44.5, wys: 51.5, kotwicaX: 0.5, kotwicaY: 0.97 },
  "assets/dekoracje/balwan_1.png": { szer: 77.0, wys: 83.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/balwan_2.png": { szer: 76.0, wys: 85.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/balwan_3.png": { szer: 71.5, wys: 81.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/balwan_4.png": { szer: 71.0, wys: 81.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/plot_1.png": { szer: 78.0, wys: 45.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/plot_2.png": { szer: 88.5, wys: 42.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/plot_3.png": { szer: 87.0, wys: 43.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/plot_4.png": { szer: 75.0, wys: 39.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/fort_1.png": { szer: 102.0, wys: 51.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/fort_2.png": { szer: 99.5, wys: 43.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/fort_3.png": { szer: 99.0, wys: 55.0, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/dekoracje/fort_4.png": { szer: 99.5, wys: 47.5, kotwicaX: 0.5, kotwicaY: 0.95 },
  "assets/efekty/rozbryzg_1.png": { szer: 47.0, wys: 43.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_2.png": { szer: 47.0, wys: 42.0, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_3.png": { szer: 47.0, wys: 45.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_4.png": { szer: 47.0, wys: 43.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_5.png": { szer: 45.5, wys: 47.0, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_6.png": { szer: 45.5, wys: 47.0, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_7.png": { szer: 47.0, wys: 44.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/rozbryzg_8.png": { szer: 47.0, wys: 46.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/obloczek_sniegu_1.png": { szer: 57.0, wys: 49.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/obloczek_sniegu_2.png": { szer: 57.0, wys: 42.5, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/sniezka.png": { szer: 13.5, wys: 14.0, kotwicaX: 0.5, kotwicaY: 0.5 },
  "assets/efekty/kupka_sniezek.png": { szer: 32.0, wys: 27.0, kotwicaX: 0.5, kotwicaY: 0.9 },
  "assets/gracze/czerwony_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/zielony_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/niebieski_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/zolty_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/pomaranczowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/fioletowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/rozowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/blekitny_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/limonkowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/brazowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/turkusowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/granatowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/magenta_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/szary_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/bordowy_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/zloty_przod.png": { szer: 57.0, wys: 72.0, kotwicaX: 0.367, kotwicaY: 0.98 },
  "assets/gracze/czerwony_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/zielony_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/niebieski_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/zolty_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/pomaranczowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/fioletowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/rozowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/blekitny_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/limonkowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/brazowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/turkusowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/granatowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/magenta_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/szary_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/bordowy_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  "assets/gracze/zloty_tyl.png": { szer: 55.0, wys: 71.5, kotwicaX: 0.563, kotwicaY: 0.98 },
  // Tło: pole gry zaczyna się w nim w punkcie (poleX, poleY) jednostek od lewego górnego rogu
  "assets/tlo/tlo_plansza.png": { szer: 1200.0, wys: 750.0, poleX: 100.0, poleY: 125.0 },
};

// Wczytane obrazki: OBRAZY["assets/..."] to gotowy obrazek do rysowania
const OBRAZY = {};

// Wczytuje wszystkie obrazki z listy SPRITY, potem wywołuje gotowe().
// Gdy któryś się nie wczyta, piszemy błąd w konsoli, a gra i tak startuje.
function wczytajObrazy(gotowe) {
  // Grafiki z sprites.json i grafiki bonusów (tylko te, które mają ustawioną ścieżkę)
  const sciezki = [
    ...Object.keys(SPRITY),
    ...CONFIG.bonusy.typy.filter((t) => t.grafika).map((t) => t.grafika),
    ...[CONFIG.stanowiska.stos, CONFIG.stanowiska.armatka].filter((t) => t.grafika).map((t) => t.grafika),
  ];
  let zostalo = sciezki.length;
  const jedenGotowy = () => {
    zostalo -= 1;
    if (zostalo === 0) gotowe();
  };
  for (const sciezka of sciezki) {
    const img = new Image();
    img.onload = () => {
      OBRAZY[sciezka] = img;
      jedenGotowy();
    };
    img.onerror = () => {
      console.error("Nie wczytano obrazka: " + sciezka);
      jedenGotowy();
    };
    img.src = sciezka;
  }
}
