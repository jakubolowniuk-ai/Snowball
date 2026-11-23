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
  // Tło: pole gry zaczyna się w nim w punkcie (poleX, poleY) jednostek od lewego górnego rogu
  "assets/tlo/tlo_plansza.png": { szer: 1200.0, wys: 750.0, poleX: 100.0, poleY: 125.0 },
};

// Zawodnik: klatki animacji w atlasie (jeden obrazek WebP na kolor, ten sam układ dla
// wszystkich kolorów). ax, ay, aw, ah: prostokąt klatki w atlasie (piksele);
// szer, wys: rozmiar w grze (jednostki pola); kotwica: punkt stóp (ułamek klatki);
// reka: środek śnieżki trzymanej w dłoni (tylko klatki, w których ją trzyma).
const ZAWODNIK = {
  atlas: (kolor) => `assets/gracze/atlasy/${kolor}.webp`,
  bezWidokuZTylu: ["trafiony", "ogluszony_a", "ogluszony_b", "upadek", "siedzi", "lezy"],
  klatki: {
    przod: {
      stanie: { ax: 0, ay: 0, aw: 114, ah: 144, szer: 57.0, wys: 72.0, kotwicaX: 0.494, kotwicaY: 0.986, reka: { x: 0.878, y: 0.38, promien: 3.6 } },
      wstawanie: { ax: 116, ay: 0, aw: 91, ah: 143, szer: 45.5, wys: 71.5, kotwicaX: 0.594, kotwicaY: 0.986 },
      zamach_1: { ax: 209, ay: 0, aw: 111, ah: 142, szer: 55.5, wys: 71.0, kotwicaX: 0.514, kotwicaY: 0.986, reka: { x: 0.882, y: 0.4, promien: 3.6 } },
      chod_2: { ax: 322, ay: 0, aw: 112, ah: 141, szer: 56.0, wys: 70.5, kotwicaX: 0.509, kotwicaY: 0.986, reka: { x: 0.889, y: 0.388, promien: 3.6 } },
      chod_3: { ax: 436, ay: 0, aw: 112, ah: 141, szer: 56.0, wys: 70.5, kotwicaX: 0.511, kotwicaY: 0.986, reka: { x: 0.889, y: 0.389, promien: 3.6 } },
      ogluszony_a: { ax: 550, ay: 0, aw: 103, ah: 141, szer: 51.5, wys: 70.5, kotwicaX: 0.501, kotwicaY: 0.986 },
      rzut: { ax: 655, ay: 0, aw: 114, ah: 140, szer: 57.0, wys: 70.0, kotwicaX: 0.499, kotwicaY: 0.986 },
      zamach_2: { ax: 771, ay: 0, aw: 98, ah: 140, szer: 49.0, wys: 70.0, kotwicaX: 0.582, kotwicaY: 0.986 },
      ogluszony_b: { ax: 871, ay: 0, aw: 105, ah: 139, szer: 52.5, wys: 69.5, kotwicaX: 0.537, kotwicaY: 0.986 },
      powrot: { ax: 0, ay: 146, aw: 104, ah: 139, szer: 52.0, wys: 69.5, kotwicaX: 0.544, kotwicaY: 0.986 },
      chod_1: { ax: 106, ay: 146, aw: 112, ah: 138, szer: 56.0, wys: 69.0, kotwicaX: 0.504, kotwicaY: 0.986, reka: { x: 0.883, y: 0.393, promien: 3.6 } },
      trafiony: { ax: 220, ay: 146, aw: 116, ah: 136, szer: 58.0, wys: 68.0, kotwicaX: 0.484, kotwicaY: 0.985 },
      upadek: { ax: 338, ay: 146, aw: 131, ah: 135, szer: 65.5, wys: 67.5, kotwicaX: 0.499, kotwicaY: 0.985 },
      siedzi: { ax: 471, ay: 146, aw: 129, ah: 134, szer: 64.5, wys: 67.0, kotwicaX: 0.501, kotwicaY: 0.985 },
      przedluzenie: { ax: 602, ay: 146, aw: 117, ah: 131, szer: 58.5, wys: 65.5, kotwicaX: 0.485, kotwicaY: 0.985 },
      przysiad: { ax: 721, ay: 146, aw: 95, ah: 125, szer: 47.5, wys: 62.5, kotwicaX: 0.604, kotwicaY: 0.984 },
      schylenie: { ax: 818, ay: 146, aw: 95, ah: 125, szer: 47.5, wys: 62.5, kotwicaX: 0.616, kotwicaY: 0.984 },
      lepienie_b: { ax: 99, ay: 287, aw: 92, ah: 124, szer: 46.0, wys: 62.0, kotwicaX: 0.595, kotwicaY: 0.984 },
      lepienie_a: { ax: 683, ay: 287, aw: 92, ah: 118, szer: 46.0, wys: 59.0, kotwicaX: 0.6, kotwicaY: 0.983 },
      lezy: { ax: 262, ay: 414, aw: 165, ah: 101, szer: 82.5, wys: 50.5, kotwicaX: 0.501, kotwicaY: 0.98 },
    },
    tyl: {
      rzut: { ax: 915, ay: 146, aw: 104, ah: 125, szer: 52.0, wys: 62.5, kotwicaX: 0.632, kotwicaY: 0.984 },
      zamach_2: { ax: 0, ay: 287, aw: 97, ah: 125, szer: 48.5, wys: 62.5, kotwicaX: 0.602, kotwicaY: 0.984, reka: { x: 0.177, y: 0.133, promien: 3.6 } },
      stanie: { ax: 193, ay: 287, aw: 94, ah: 123, szer: 47.0, wys: 61.5, kotwicaX: 0.527, kotwicaY: 0.984, reka: { x: 0.114, y: 0.476, promien: 3.6 } },
      chod_1: { ax: 289, ay: 287, aw: 96, ah: 122, szer: 48.0, wys: 61.0, kotwicaX: 0.608, kotwicaY: 0.984, reka: { x: 0.179, y: 0.39, promien: 3.6 } },
      chod_2: { ax: 387, ay: 287, aw: 95, ah: 122, szer: 47.5, wys: 61.0, kotwicaX: 0.613, kotwicaY: 0.984, reka: { x: 0.179, y: 0.387, promien: 3.6 } },
      chod_3: { ax: 484, ay: 287, aw: 95, ah: 122, szer: 47.5, wys: 61.0, kotwicaX: 0.613, kotwicaY: 0.984, reka: { x: 0.18, y: 0.388, promien: 3.6 } },
      zamach_1: { ax: 581, ay: 287, aw: 100, ah: 122, szer: 50.0, wys: 61.0, kotwicaX: 0.624, kotwicaY: 0.984, reka: { x: 0.136, y: 0.382, promien: 3.6 } },
      powrot: { ax: 777, ay: 287, aw: 91, ah: 118, szer: 45.5, wys: 59.0, kotwicaX: 0.58, kotwicaY: 0.983 },
      schylenie: { ax: 870, ay: 287, aw: 86, ah: 118, szer: 43.0, wys: 59.0, kotwicaX: 0.456, kotwicaY: 0.983 },
      wstawanie: { ax: 0, ay: 414, aw: 78, ah: 118, szer: 39.0, wys: 59.0, kotwicaX: 0.485, kotwicaY: 0.983 },
      przedluzenie: { ax: 80, ay: 414, aw: 101, ah: 117, szer: 50.5, wys: 58.5, kotwicaX: 0.622, kotwicaY: 0.983 },
      lepienie: { ax: 183, ay: 414, aw: 77, ah: 106, szer: 38.5, wys: 53.0, kotwicaX: 0.487, kotwicaY: 0.981 },
      przysiad: { ax: 429, ay: 414, aw: 84, ah: 101, szer: 42.0, wys: 50.5, kotwicaX: 0.507, kotwicaY: 0.98 },
    },
  },
  // Animacje: lista [klatka, milisekundy]; petlaSrodek: klatki powtarzane w środku
  animacje: {
    przod: {
      stanie: { klatki: [["stanie", 1000]], petla: true },
      chod: { klatki: [["chod_1", 140], ["chod_2", 140], ["chod_3", 140], ["chod_2", 140]], petla: true },
      zamach: { klatki: [["zamach_1", 90], ["zamach_2", 90]], petla: false },
      rzut: { klatki: [["rzut", 70], ["przedluzenie", 110], ["powrot", 140]], petla: false },
      przeladowanie_krotkie: { klatki: [["schylenie", 150], ["przysiad", 120], ["wstawanie", 150]], petla: false },
      przeladowanie_pelne: { klatki: [["schylenie", 200], ["przysiad", 200], ["lepienie_a", 250], ["lepienie_b", 250], ["wstawanie", 200]], petla: false, petlaSrodek: ["lepienie_a", "lepienie_b"], caloscMs: 2000 },
      trafiony: { klatki: [["trafiony", 150], ["ogluszony_a", 150], ["ogluszony_b", 150]], petla: false, petlaSrodek: ["ogluszony_a", "ogluszony_b"], caloscMs: 1000 },
      eliminacja: { klatki: [["trafiony", 160], ["upadek", 220], ["siedzi", 260], ["lezy", 1000]], petla: false },
    },
    tyl: {
      stanie: { klatki: [["stanie", 1000]], petla: true },
      chod: { klatki: [["chod_1", 140], ["chod_2", 140], ["chod_3", 140], ["chod_2", 140]], petla: true },
      zamach: { klatki: [["zamach_1", 90], ["zamach_2", 90]], petla: false },
      rzut: { klatki: [["rzut", 70], ["przedluzenie", 110], ["powrot", 140]], petla: false },
      przeladowanie_krotkie: { klatki: [["schylenie", 150], ["przysiad", 120], ["wstawanie", 150]], petla: false },
      przeladowanie_pelne: { klatki: [["schylenie", 200], ["przysiad", 200], ["lepienie", 500], ["wstawanie", 200]], petla: false, petlaSrodek: ["lepienie"], caloscMs: 2000 },
    },
  },
};

// Wczytane obrazki: OBRAZY["assets/..."] to gotowy obrazek do rysowania
const OBRAZY = {};

// Wczytuje wszystkie obrazki z listy SPRITY, potem wywołuje gotowe().
// Gdy któryś się nie wczyta, piszemy błąd w konsoli, a gra i tak startuje.
function wczytajObrazy(gotowe) {
  // Grafiki z sprites.json, atlasy kolorów zawodników w grze, grafiki bonusów i stanowisk
  const sciezki = [
    ...Object.keys(SPRITY),
    ...[CONFIG.kolorGracza, CONFIG.kolorPrzeciwnika].map(ZAWODNIK.atlas),
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
