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
};
