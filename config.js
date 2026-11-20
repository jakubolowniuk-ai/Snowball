// Wszystkie liczby wpływające na grę. Zmieniaj tutaj, żeby stroić rozgrywkę.
// Jednostki: "jednostki planszy" (logiczne piksele planszy 960x540) i sekundy.

const CONFIG = {
  // Logiczna wielkość planszy (skalowana do ekranu telefonu)
  szerokoscPlanszy: 960,
  wysokoscPlanszy: 540,

  // Zawodnik
  promienZawodnika: 22,
  predkoscZawodnika: 160, // jednostek planszy na sekundę

  // Sterowanie
  promienPobliza: 150, // jak daleko od zaznaczonego można dotknąć, żeby szedł
  zapasDotyku: 10, // ile dodać do promienia zawodnika, żeby łatwiej trafić palcem

  // Pozycje startowe (x, y)
  startCzerwoni: [
    { x: 150, y: 140 },
    { x: 110, y: 270 },
    { x: 150, y: 400 },
  ],
  startZieloni: [
    { x: 810, y: 140 },
    { x: 850, y: 270 },
    { x: 810, y: 400 },
  ],

  // Kolory
  kolorCzerwony: "#d93a3a",
  kolorZielony: "#3a9a4a",
  kolorZaznaczenia: "#ffd23f",
};
