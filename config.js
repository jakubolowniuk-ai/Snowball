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
  czasPrzeladowania: 0.5, // po rzucie: ten czas plus czas ładowania siły
  kolorPrzeladowania: "#b8c4d0", // szary pierścień pod stopami w trakcie przeładowania

  // Trafienia
  trafieniaDoEliminacji: 3, // wcześniejsze trafienia tylko ogłuszają
  czasOgluszenia: 1, // sekundy bez ruchu i bez rzutu
  wibracjaTrafienia: 60, // milisekundy wibracji telefonu przy trafieniu (Android)
  czasChmurki: 0.4, // jak długo widać białą chmurkę śniegu po trafieniu
  czasNapisuKonca: 2, // ile sekund widać "Wygrana!"/"Przegrana" przed restartem

  // Poziomy: ilu przeciwników i jak dobrze grają.
  // Po ostatnim poziomie gra idzie dalej (Level 6, 7...) z ustawieniami ostatniego.
  //  czasReakcji: ile sekund mija, zanim zauważy lecącą śnieżkę i zacznie unik
  //  szansaUniku: szansa (0-1), że w ogóle spróbuje uniknąć śnieżki
  //  rozrzut: jak bardzo chybia (promień losowego błędu celowania)
  //  przerwaMin/Max: przerwa między rzutami jednego przeciwnika (sekundy, losowo)
  poziomy: [
    { przeciwnicy: 1, czasReakcji: 0.8, szansaUniku: 0.3, rozrzut: 0.08, przerwaMin: 1.5, przerwaMax: 3 },
    { przeciwnicy: 2, czasReakcji: 0.7, szansaUniku: 0.4, rozrzut: 0.07, przerwaMin: 2, przerwaMax: 3.5 },
    { przeciwnicy: 3, czasReakcji: 0.6, szansaUniku: 0.5, rozrzut: 0.06, przerwaMin: 2.5, przerwaMax: 4 },
    { przeciwnicy: 4, czasReakcji: 0.5, szansaUniku: 0.6, rozrzut: 0.05, przerwaMin: 3, przerwaMax: 4.5 },
    { przeciwnicy: 5, czasReakcji: 0.4, szansaUniku: 0.7, rozrzut: 0.04, przerwaMin: 3.5, przerwaMax: 5 },
  ],

  // Zachowanie przeciwnika (na każdym poziomie takie samo)
  wedrowka: 0.12, // jak daleko odchodzi przy losowym chodzeniu
  postojMin: 0.4, // ile stoi między krokami (sekundy, losowo od min do max)
  postojMax: 1.2,
  odskok: 0.12, // jak daleko odskakuje w bok przy uniku
  zapasSily: 0.15, // ile sekund dłużej ładuje siłę, żeby na pewno dorzucić

  // Pozycje startowe (y też jako ułamek szerokości; wysokość pola to 1 / ASPECT)
  startGracz: { x: 0.15, y: 0.25 },
  // Przeciwnicy stoją na zmianę w dwóch kolumnach (x), równo rozłożeni w pionie
  kolumnyPrzeciwnikow: [0.85, 0.68],

  // Niebieskawe przyciemnienie przy brzegach pola: jak głęboko wchodzi
  glebokoscBrzegu: 0.05,
  silaPrzyciemnienia: 0.6, // 0 = brak przyciemnienia, 1 = pełny kolor brzegu

  // Napis "Level N" na początku poziomu
  czasNapisuLevel: 1.5,
  rozmiarNapisuLevel: 0.07,

  // Kolory
  kolorCzerwony: "#d93a3a",
  kolorZielony: "#3a9a4a",
  kolorPierscienia: "#2a6fd6",
  kolorKropki: "#2a6fd6",
  kolorSniegu: "#ffffff",
  kolorBrzegu: "#b9d0e6", // przyciemnienie poza polem i przy jego brzegach
  kolorNapisu: "#8cc4ee",
  kolorCelu: "#2a6fd6",
  kolorZasiegu: "#e0902a", // pierścień zasięgu, gdy śnieżka jeszcze nie doleci
  kolorZasieguDoleci: "#3a9a4a", // gdy zasięg sięga celu
};
