// Mapa "Wielka arena 1" (format: docs/PLAN_WDROZENIA.md, sekcja "Format mapy").
// Pozycje to ułamki szerokości pola gry. Dekoracje po id z dane/dekoracje.js.
MAPY.wielka_1 = {
  wersja: 1,
  nazwa: "Wielka arena 1",
  tryb: "wielkaArena",
  swiat: {
    szerokoscPol: 2,
    wysokoscPol: 2
  },
  teren: {
    rozmiarPola: 50,
    domyslny: "snieg",
    wiersze: []
  },
  dekoracje: [
    {
      id: "choinka_1",
      x: 0.1,
      y: 0.12
    },
    {
      id: "fort_1",
      x: 0.45,
      y: 0.2
    },
    {
      id: "balwan_1",
      x: 0.85,
      y: 0.1
    },
    {
      id: "plot_1",
      x: 1.3,
      y: 0.15
    },
    {
      id: "choinka_2",
      x: 1.75,
      y: 0.12
    },
    {
      id: "balwan_2",
      x: 0.2,
      y: 0.45
    },
    {
      id: "plot_2",
      x: 0.7,
      y: 0.42
    },
    {
      id: "choinka_3",
      x: 1.05,
      y: 0.35
    },
    {
      id: "fort_2",
      x: 1.45,
      y: 0.45
    },
    {
      id: "balwan_3",
      x: 1.9,
      y: 0.4
    },
    {
      id: "fort_3",
      x: 0.35,
      y: 0.72
    },
    {
      id: "choinka_4",
      x: 0.8,
      y: 0.68
    },
    {
      id: "balwan_4",
      x: 1.15,
      y: 0.75
    },
    {
      id: "plot_3",
      x: 1.55,
      y: 0.65
    },
    {
      id: "choinka_1",
      x: 0.08,
      y: 0.92
    },
    {
      id: "plot_4",
      x: 0.6,
      y: 0.92
    },
    {
      id: "fort_4",
      x: 1.1,
      y: 0.93
    },
    {
      id: "choinka_2",
      x: 1.92,
      y: 0.88
    }
  ],
  stanowiska: {
    neutralne: {
      stos: {
        x: 1,
        y: 0.52
      },
      armatka: {
        x: 1.3,
        y: 0.3
      }
    }
  },
  start: {
    gracz: {
      x: 1.6,
      y: 0.82
    },
    przeciwnicy: {
      regula: "linia",
      wartosc: 0.55
    }
  }
};
