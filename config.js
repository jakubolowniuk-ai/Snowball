// Wszystkie liczby wpływające na grę. Zmieniaj tutaj, żeby stroić rozgrywkę.
// Jednostki: "jednostki planszy" (logiczne piksele planszy 960x540) i sekundy.

const CONFIG = {
  // Logiczna wielkość planszy (skalowana do ekranu telefonu)
  szerokoscPlanszy: 960,
  wysokoscPlanszy: 540,

  // Zawodnik
  promienZawodnika: 22,
  predkoscZawodnika: 280, // limit prędkości: jednostek planszy na sekundę

  // Kropka (uchwyt) za zawodnikiem
  odlegloscKropki: 77, // od krawędzi zawodnika, ok. 8% szerokości planszy (ok. 1 cm na telefonie)
  promienKropki: 12, // wielkość rysowanej kropki
  promienDotykuKropki: 35, // jak blisko kropki trzeba dotknąć, żeby ją złapać
  przezroczystoscKropki: 0.4, // gdy nikt jej nie dotyka (1 = pełna)

  // Pozycje startowe (x, y)
  startGracz: { x: 150, y: 270 },
  startPrzeciwnicy: [{ x: 810, y: 270 }],

  // Kolory
  kolorCzerwony: "#d93a3a",
  kolorZielony: "#3a9a4a",
  kolorZaznaczenia: "#ffd23f",
  kolorKropki: "#2a6fd6",
};
