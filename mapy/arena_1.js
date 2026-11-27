// Mapa "Arena 1" (format: docs/PLAN_WDROZENIA.md, sekcja "Format mapy").
// Pozycje to ułamki szerokości pola gry. Dekoracje po id z dane/dekoracje.js.
MAPY.arena_1 = {
  wersja: 1,
  nazwa: "Arena 1",
  tryb: "arena",
  swiat: {
    szerokoscPol: 1,
    wysokoscPol: 1
  },
  teren: {
    rozmiarPola: 50,
    domyslny: "snieg",
    wiersze: []
  },
  dekoracje: [
    {
      id: "choinka_1",
      x: 0.06,
      y: 0.105
    },
    {
      id: "plot_2",
      x: 0.33,
      y: 0.23
    },
    {
      id: "balwan_3",
      x: 0.09,
      y: 0.44
    },
    {
      id: "fort_1",
      x: 0.6,
      y: 0.28
    },
    {
      id: "balwan_1",
      x: 0.47,
      y: 0.47
    },
    {
      id: "choinka_2",
      x: 0.96,
      y: 0.14
    }
  ],
  stanowiska: {
    czerwoni: {
      stos: {
        x: 0.54,
        y: 0.4
      },
      armatka: {
        x: 0.3,
        y: 0.42
      }
    },
    zieloni: {
      stos: {
        x: 0.46,
        y: 0.1
      },
      armatka: {
        x: 0.7,
        y: 0.08
      }
    }
  },
  start: {
    gracz: {
      x: 0.62,
      y: 0.42
    },
    przeciwnicy: {
      regula: "linia",
      wartosc: 0.55
    }
  }
};
