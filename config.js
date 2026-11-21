// Wszystkie liczby wpływające na grę. Zmieniaj tutaj, żeby stroić rozgrywkę.
// Rozmiary, odległości i pozycje to ułamki SZEROKOŚCI pola gry (1 = cała szerokość).
// Przykład: 1/8 to jedna ósma szerokości pola. Czasy w sekundach.

const CONFIG = {
  // Pole gry: szerokość do wysokości (2 = pole dwa razy szersze niż wyższe)
  ASPECT: 2,

  // Zawodnik
  rozmiarPostaci: 1 / 8, // średnica kółka
  predkoscZawodnika: 0.3, // limit prędkości: szerokości pola na sekundę

  // Kropka (uchwyt) za zawodnikiem
  odlegloscKropki: 0.075, // od krawędzi zawodnika (ok. 1 cm na telefonie)
  promienKropki: 0.0125, // wielkość rysowanej kropki
  promienDotykuKropki: 0.04, // jak blisko kropki trzeba dotknąć, żeby ją złapać
  przezroczystoscKropki: 0.4, // gdy nikt jej nie dotyka (1 = pełna)

  // Rzut
  MAX_CHARGE: 1.5, // ile sekund ładuje się pełna siła
  zasiegMin: 0.25, // zasięg śnieżki przy najsłabszym rzucie
  zasiegMax: 0.9, // zasięg przy pełnej sile
  predkoscSniezkiMin: 0.6, // szerokości pola na sekundę, najsłabszy rzut
  predkoscSniezkiMax: 1.6, // przy pełnej sile
  promienAnulowania: 0.08, // puszczenie palca bliżej zawodnika anuluje rzut
  promienCelu: 0.03, // pierścień celu pod palcem
  promienSniezki: 0.012,
  wysokoscLuku: 0.15, // jak wysoko leci śnieżka (ułamek długości lotu), tylko wygląd
  czasPrzeladowania: 1, // po rzucie: ten czas plus czas ładowania siły
  kolorPrzeladowania: "#b8c4d0", // szary pierścień pod stopami w trakcie przeładowania

  // Trafienia
  trafieniaDoEliminacji: 3, // wcześniejsze trafienia tylko ogłuszają
  czasOgluszenia: 3, // sekundy bez ruchu i bez rzutu
  wibracjaTrafienia: 60, // milisekundy wibracji telefonu przy trafieniu (Android)
  czasChmurki: 0.4, // jak długo widać białą chmurkę śniegu po trafieniu
  czasNapisuKonca: 2, // ile sekund widać "Wygrana!"/"Przegrana" przed restartem

  // Pozycje startowe (y też jako ułamek szerokości; wysokość pola to 1 / ASPECT)
  startGracz: { x: 0.15, y: 0.25 },
  startPrzeciwnicy: [{ x: 0.85, y: 0.25 }],

  // Dwie dekoracyjne zaspy (bez kolizji): środek, szerokość i wysokość owalu
  zaspy: [
    { x: 0.35, y: 0.1, szer: 0.16, wys: 0.045 },
    { x: 0.62, y: 0.41, szer: 0.2, wys: 0.05 },
  ],

  // Niebieskawe przyciemnienie przy brzegach pola: jak głęboko wchodzi
  glebokoscBrzegu: 0.05,

  // Napis "Level N" na początku poziomu
  czasNapisuLevel: 1.5,
  rozmiarNapisuLevel: 0.07,

  // Kolory
  kolorCzerwony: "#d93a3a",
  kolorZielony: "#3a9a4a",
  kolorPierscienia: "#2a6fd6",
  kolorKropki: "#2a6fd6",
  kolorSniegu: "#ffffff",
  kolorBrzegu: "#cfe1f1", // przyciemnienie brzegów i tło poza polem
  kolorNapisu: "#8cc4ee",
  kolorCelu: "#2a6fd6",
  kolorZasiegu: "#e0902a", // pierścień zasięgu, gdy śnieżka jeszcze nie doleci
  kolorZasieguDoleci: "#3a9a4a", // gdy zasięg sięga celu
};
