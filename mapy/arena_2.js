// Mapa "Arena 2: Zimowy ogród" (format: docs/PLAN_WDROZENIA.md, sekcja "Format mapy").
// Mapa testowa terenu (krok E2): lodowisko, ścieżka z ubitego śniegu, nowe przeszkody.
// Do sprawdzenia: index.html?mapa=arena_2, potem "Arena".
// Teren: siatka pól po 50 jednostek (20 kolumn x 10 wierszy), "." = zwykłe tło, s = śnieg, u = ubity, l = lód.
MAPY.arena_2 = {
  wersja: 1,
  nazwa: "Arena 2: Zimowy ogród",
  tryb: "arena",
  swiat: { szerokoscPol: 1, wysokoscPol: 1 },
  teren: {
    rozmiarPola: 50,
    domyslny: "snieg",
    wiersze: [
      "ssssssssssssssssssss",
      "sssslllllsssssssssss",
      "ssslllllllssssssssss",
      "sssslllllsssssssssss",
      "sssssssssssssuuussss",
      "ssssssssssssuuusssss",
      "sssssssssssuuussssss",
      "ssssssssssuuusssssss",
      "sssssssssuuussssssss",
      "ssssssssuuusssssssss",
    ],
  },
  dekoracje: [
    { id: "dom_a", x: 0.1, y: 0.11 },
    { id: "murek_a", x: 0.33, y: 0.25 },
    { id: "krzak_duzy_b", x: 0.09, y: 0.44 },
    { id: "pagorek_a", x: 0.6, y: 0.28 },
    { id: "kamienie_trzy_a", x: 0.45, y: 0.47 },
    { id: "ostrokrzew_a", x: 0.96, y: 0.14 },
    { id: "trawa_b", x: 0.74, y: 0.2 },
    { id: "galezie_a", x: 0.26, y: 0.41 },
    { id: "krzak_maly_a", x: 0.6, y: 0.06 },
  ],
  stanowiska: {
    czerwoni: { stos: { x: 0.54, y: 0.4 }, armatka: { x: 0.3, y: 0.42 } },
    zieloni: { stos: { x: 0.46, y: 0.1 }, armatka: { x: 0.7, y: 0.08 } },
  },
  start: { gracz: { x: 0.62, y: 0.42 }, przeciwnicy: { regula: "linia", wartosc: 0.55 } },
};
