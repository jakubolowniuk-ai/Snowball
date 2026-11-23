// Wszystkie liczby wpływające na grę. Zmieniaj tutaj, żeby stroić rozgrywkę.
// Rozmiary, odległości i pozycje to ułamki SZEROKOŚCI pola gry (1 = cała szerokość).
// Przykład: 1/8 to jedna ósma szerokości pola. Czasy w sekundach.

const CONFIG = {
  // Pole gry: szerokość do wysokości (2 = pole dwa razy szersze niż wyższe)
  ASPECT: 2,

  // Zawodnik
  rozmiarPostaci: 1 / 16, // średnica okręgu trafień (hitbox) zawodnika
  predkoscZawodnika: 0.3, // limit prędkości: szerokości pola na sekundę

  // Joystick (pad) do ruchu: stały, w prawym dolnym rogu widocznego ekranu.
  // 1 cm na telefonie to ok. 0,08-0,11 szerokości pola (zależnie od telefonu).
  promienPadu: 0.12, // promień podstawy (ok. 1,4 cm)
  promienGalki: 0.05, // promień gałki
  marginesPadu: 0.05, // odstęp podstawy od prawej i dolnej krawędzi ekranu
  promienDotykuPadu: 0.03, // zapas: dotyk tyle poza podstawą też łapie pad
  strefaMartwaPadu: 0.12, // wychylenie mniejsze niż to (0-1) nie rusza zawodnika
  przezroczystoscPadu: 0.35, // gdy nikt go nie dotyka
  przezroczystoscPaduAktywnego: 0.6, // gdy kciuk jest na padzie

  // Rzut
  MAX_CHARGE: 1.5, // ile sekund ładuje się pełna siła
  // false: śnieżka zawsze leci do dotkniętego punktu, siła zmienia tylko prędkość.
  // true: stare zachowanie, siła zmienia też zasięg (od zasiegMin do zasiegMax).
  zasiegZalezyOdSily: false,
  zasiegMin: 0.25, // zasięg śnieżki przy najsłabszym rzucie (tylko gdy zasiegZalezyOdSily)
  zasiegMax: 0.9, // zasięg przy pełnej sile
  predkoscSniezkiMin: 0.6, // szerokości pola na sekundę, najsłabszy rzut
  predkoscSniezkiMax: 1.6, // przy pełnej sile
  promienAnulowania: 0.05, // puszczenie palca bliżej zawodnika anuluje rzut
  promienCelu: 0.03, // pierścień celu pod palcem
  promienSniezki: 0.0065,
  wysokoscLuku: 0.15, // jak wysoko leci śnieżka (ułamek długości lotu), tylko wygląd
  maxWysokoscLuku: 0.035, // ale nie wyżej niż tyle (ułamek szerokości pola, ok. 35 jednostek)
  czasPrzeladowania: 0.5, // po rzucie: ten czas plus czas ładowania siły
  kolorPrzeladowania: "#b8c4d0", // szary pierścień pod stopami w trakcie przeładowania

  // Trafienia
  trafieniaDoEliminacji: 3, // wcześniejsze trafienia tylko ogłuszają
  czasOgluszenia: 1, // sekundy bez ruchu i bez rzutu
  wibracjaTrafienia: 60, // milisekundy wibracji telefonu przy trafieniu (Android)
  czasChmurki: 0.5, // jak długo widać obłoczek i rozbryzg po trafieniu
  czasNapisuKonca: 2, // ile sekund widać "Wygrana!"/"Przegrana" przed restartem

  // Poziomy: ilu przeciwników i jak dobrze grają.
  // Po ostatnim poziomie gra idzie dalej (Level 6, 7...) z ustawieniami ostatniego.
  //  czasReakcji: ile sekund mija, zanim zauważy lecącą śnieżkę i zacznie unik
  //  szansaUniku: szansa (0-1), że w ogóle spróbuje uniknąć śnieżki
  //  rozrzut: jak bardzo chybia (promień losowego błędu celowania)
  //  przerwaMin/Max: przerwa między rzutami jednego przeciwnika (sekundy, losowo)
  //  silaMin/Max: siła rzutu (0-1) losowana z tego zakresu (gdy zasięg nie zależy od siły)
  //  szansaBonusu: szansa (0-1), że zamiast w gracza rzuci w bonus (bliższy jemu niż graczowi)
  //  szansaStanowiska: szansa (0-1), że po rzucie pójdzie do wolnego stanowiska swojej drużyny
  poziomy: [
    { przeciwnicy: 1, czasReakcji: 0.8, szansaUniku: 0.3, rozrzut: 0.04, przerwaMin: 1.5, przerwaMax: 3, silaMin: 0.1, silaMax: 0.5, szansaBonusu: 0.2, szansaStanowiska: 0.25 },
    { przeciwnicy: 2, czasReakcji: 0.7, szansaUniku: 0.4, rozrzut: 0.035, przerwaMin: 2, przerwaMax: 3.5, silaMin: 0.2, silaMax: 0.6, szansaBonusu: 0.3, szansaStanowiska: 0.35 },
    { przeciwnicy: 3, czasReakcji: 0.6, szansaUniku: 0.5, rozrzut: 0.03, przerwaMin: 2.5, przerwaMax: 4, silaMin: 0.3, silaMax: 0.75, szansaBonusu: 0.4, szansaStanowiska: 0.45 },
    { przeciwnicy: 4, czasReakcji: 0.5, szansaUniku: 0.6, rozrzut: 0.025, przerwaMin: 3, przerwaMax: 4.5, silaMin: 0.4, silaMax: 0.9, szansaBonusu: 0.5, szansaStanowiska: 0.6 },
    { przeciwnicy: 5, czasReakcji: 0.4, szansaUniku: 0.7, rozrzut: 0.02, przerwaMin: 3.5, przerwaMax: 5, silaMin: 0.5, silaMax: 1, szansaBonusu: 0.6, szansaStanowiska: 0.7 },
  ],

  // Zachowanie przeciwnika (na każdym poziomie takie samo)
  wedrowka: 0.12, // jak daleko odchodzi przy losowym chodzeniu
  postojMin: 0.4, // ile stoi między krokami (sekundy, losowo od min do max)
  postojMax: 1.2,
  odskok: 0.08, // jak daleko odskakuje w bok przy uniku
  zapasSily: 0.15, // ile sekund dłużej ładuje siłę, żeby na pewno dorzucić

  // Pozycje startowe (y też jako ułamek szerokości; wysokość pola to 1 / ASPECT)
  startGracz: { x: 0.62, y: 0.42 }, // prawa dolna część pola, poza padem
  // Przeciwnicy stoją w lewym górnym trójkącie, równo rozłożeni na linii równoległej
  // do przekątnej. 0 = w samym lewym górnym rogu, 1 = na przekątnej (granicy).
  liniaPrzeciwnikow: 0.55,

  // Niebieskawe przyciemnienie przy brzegach pola: jak głęboko wchodzi
  glebokoscBrzegu: 0.05,
  silaPrzyciemnienia: 0.6, // 0 = brak przyciemnienia, 1 = pełny kolor brzegu

  // Napis "Level N" na początku poziomu
  czasNapisuLevel: 1.5,
  rozmiarNapisuLevel: 0.07,

  // Bonusy: ozdoby choinkowe przy przekątnej; trafienie śnieżką daje bonus rzucającemu
  bonusy: {
    pierwszyPoSekundach: 8, // pierwszy bonus po tylu sekundach poziomu (bez napisu "Level")
    odstepMin: 12, // kolejne co losowo od odstepMin do odstepMax sekund
    odstepMax: 18,
    czasZycia: 10, // ile sekund bonus leży na planszy
    miganieOstatnie: 2, // ostatnie sekundy życia bonus miga
    maxNaraz: [1, 1, 2], // ile naraz na poziomie 1, 2, 3 (dalej jak ostatni)
    promienTrafienia: 0.02, // okrąg trafienia bonusu (i jego wielkość na ekranie)
    pasPrzekatnej: 0.08, // szerokość pasa wokół przekątnej, w którym się pojawia
    marginesKrawedzi: 0.05, // odstęp od krawędzi pola
    odstepOdPostaci: 0.08, // nie bliżej żadnej postaci niż tyle
    zapasPrzeszkody: 0.02, // nie bliżej podstawy przeszkody niż tyle
    przeciwnicyZbierajaBonusy: true, // false: śnieżki przeciwników przelatują przez bonusy
    czasSerduszka: 1, // ile sekund widać serduszko po zjedzeniu Pierniczka
    typy: [
      // grafika: ścieżka do obrazka (np. "assets/bonusy/bombka.png") albo null = kula zastępcza
      // Bombka: tarcza, pochłania jedno trafienie
      { id: "bombka", nazwa: "Bombka", kolor: "#3a7de0", czasTrwania: 12, waga: 3, grafika: null },
      // Gwiazdka: następne rzuty (najwyżej "rzuty", najdłużej czasTrwania s) to wachlarz śnieżek
      { id: "gwiazdka", nazwa: "Gwiazdka", kolor: "#f2c417", czasTrwania: 8, waga: 3, grafika: null, rzuty: 3, katyWachlarza: [-10, 0, 10] },
      // Laska cukrowa: szybszy bieg
      { id: "laska", nazwa: "Laska cukrowa", kolor: "#e03a3a", czasTrwania: 6, waga: 3, grafika: null, mnoznikPredkosci: 1.4 },
      // Pierniczek: od razu zdejmuje jedno trafienie (czasTrwania 0 = działa natychmiast)
      { id: "pierniczek", nazwa: "Pierniczek", kolor: "#b5733a", czasTrwania: 0, waga: 1, grafika: null },
    ],
  },

  // Stanowiska: stos gałek i armatka, osobno dla każdej drużyny. Nie blokują ruchu ani śnieżek.
  stanowiska: {
    // Stos: postać w promieniu ma przeładowanie razy mnoznikPrzeladowania; każdy taki rzut = 1 gałka
    stos: { amunicjaMin: 7, amunicjaMax: 9, promien: 0.06, mnoznikPrzeladowania: 0.3, grafika: null },
    // Armatka: postać w miejscu stania (za armatką) rzuca bez przeładowania, ale nie częściej
    // niż co minOdstepStrzalow sekund; każdy rzut = 1 gałka; pusta zostaje jako dekoracja
    armatka: {
      amunicja: 20,
      mnoznikPrzeladowania: 0,
      minOdstepStrzalow: 0.2,
      miejsceStania: { x: 0.025, y: 0.025 }, // przesunięcie od armatki (dla zielonych lustrzanie)
      promienStania: 0.035,
      grafika: null,
    },
    // Pozycje (punkt na ziemi, ułamki szerokości pola)
    pozycje: {
      czerwoni: { stos: { x: 0.54, y: 0.4 }, armatka: { x: 0.3, y: 0.42 } },
      zieloni: { stos: { x: 0.46, y: 0.1 }, armatka: { x: 0.7, y: 0.08 } },
    },
  },

  // Tryby gry. Arena działa jak dotąd (świat = pole). Wielka arena: większy świat i kamera.
  tryby: {
    wielkaArena: {
      swiatSzerokosc: 2, // świat ma tyle szerokości pola
      swiatWysokosc: 2, // i tyle wysokości pola
      wygladzanieKamery: 4, // jak szybko kamera dogania gracza (większe = szybciej)
      startGracz: { x: 1.6, y: 0.82 }, // prawa dolna część świata
      liniaPrzeciwnikow: 0.55, // przeciwnicy na linii w lewej górnej części (0 = róg)
      mnoznikPrzeciwnikow: 1, // liczba przeciwników = poziomy[N].przeciwnicy razy to
      odlegloscAI: 0.5, // z jakiej odległości od gracza przeciwnik chce rzucać
      maxOdlegloscRzutuAI: 0.9, // dalej nie rzuca
      marginesWidoku: 0.05, // przeciwnik rzuca tylko na ekranie gracza (z tym zapasem)
      zasiegSniezki: 1, // śnieżka leci najwyżej tyle (szerokość widoku = 1), nie przez cały świat
      bonusyMaxNaraz: [2, 3, 4], // ile bonusów naraz na poziomie 1, 2, 3 i dalej
      // Odstęp między bonusami w Wielkiej arenie (krótszy niż w Arenie; przy 12-18 s
      // i czasie życia 10 s na planszy nigdy nie byłoby więcej niż jeden bonus)
      bonusyOdstepMin: 4,
      bonusyOdstepMax: 7,
      // Neutralne stanowiska (dla każdego, kto pierwszy dojdzie; amunicja wspólna)
      stanowiska: { stos: { x: 1.0, y: 0.52 }, armatka: { x: 1.3, y: 0.3 } },
      // Strzałki przy krawędzi ekranu do przeciwników poza widokiem
      strzalkaRozmiar: 0.018,
      strzalkaMargines: 0.03, // odstęp strzałki od krawędzi ekranu
      // Zamieć: po czasDoZwezania s granice zwężają się przez czasZwezania s do jednego pola
      czasDoZwezania: 90,
      czasZwezania: 30,
      ostrzezenieZamieci: 10, // tyle sekund wcześniej napis "Zamieć się zbliża!"
      predkoscWiatru: 0.15, // jak szybko wiatr spycha postać spoza granicy (szerokości pola/s)
      szerokoscZamieci: 0.06, // szerokość mgły wchodzącej do środka przy granicy
      gestoscZamieci: 0.75, // jak gęsta jest mgła poza granicą (0-1)
      kolorZamieci: "196, 212, 230", // kolor mgły (r, g, b): szaroniebieski, żeby było ją widać na śniegu
      wysokoscPodskoku: 0.012, // podskok postaci niesionej wiatrem (tylko wygląd)
      // Dekoracje (przeszkody) w całym świecie: x od 0 do 2, y od 0 do 1
      dekoracje: [
        { plik: "choinka_1", x: 0.1, y: 0.12 },
        { plik: "fort_1", x: 0.45, y: 0.2 },
        { plik: "balwan_1", x: 0.85, y: 0.1 },
        { plik: "plot_1", x: 1.3, y: 0.15 },
        { plik: "choinka_2", x: 1.75, y: 0.12 },
        { plik: "balwan_2", x: 0.2, y: 0.45 },
        { plik: "plot_2", x: 0.7, y: 0.42 },
        { plik: "choinka_3", x: 1.05, y: 0.35 },
        { plik: "fort_2", x: 1.45, y: 0.45 },
        { plik: "balwan_3", x: 1.9, y: 0.4 },
        { plik: "fort_3", x: 0.35, y: 0.72 },
        { plik: "choinka_4", x: 0.8, y: 0.68 },
        { plik: "balwan_4", x: 1.15, y: 0.75 },
        { plik: "plot_3", x: 1.55, y: 0.65 },
        { plik: "choinka_1", x: 0.08, y: 0.92 },
        { plik: "plot_4", x: 0.6, y: 0.92 },
        { plik: "fort_4", x: 1.1, y: 0.93 },
        { plik: "choinka_2", x: 1.92, y: 0.88 },
      ],
    },
  },

  // Grafiki postaci i mnożnik ich wielkości (1 = rozmiar z sprites.json).
  // Mnożnik zmienia tylko wygląd; okrąg trafień ustawia rozmiarPostaci.
  // Animacje zawodnika (tylko wygląd)
  animacje: {
    drogaNaKlatkeChodu: 0.04, // co tyle drogi (ułamek szerokości pola) następna klatka chodu
    progRuchu: 0.02, // od tej prędkości (szerokości pola/s) postać "idzie"
    opoznienieStania: 0.1, // po tylu sekundach bez ruchu wraca do "stanie" (bez migania przy krótkich postojach)
    katBoku: 30, // ruch do tylu stopni od poziomu = widok z boku (przód odbity), dalej przód albo tył
    // Przeładowanie (animacja wypełnia czas przeładowania, który zostaje po animacji rzutu)
    progSchylania: 0.25, // gdy zostaje mniej sekund, zawodnik się nie schyla
    progPelnegoPrzeladowania: 0.9, // od tylu sekund pełne przeładowanie (z lepieniem), poniżej krótkie
    czasPrzenikania: 0.12, // płynne przejście z "wstawanie" do "stanie" (sekundy)
    // Trafienie z tyłu (brak klatek): drżenie i czerwony błysk
    drzenie: 0.004, // jak mocno drży w poziomie (ułamek szerokości pola)
    czasDrzenia: 0.5, // jak długo drży (sekundy)
    silaBlysku: 0.6, // jak mocny jest czerwony błysk (0-1)
    czasBlysku: 0.35, // jak długo znika błysk (sekundy)
    lepionaSniezkaPromien: 6, // z tyłu: śnieżka przy stopach (jednostki pola) przy końcu lepienia
    lepionaSniezkaOd: 0.3, // na początku ma tyle swojej końcowej wielkości
    lepionaSniezkaX: 0.3, // przesunięcie w bok od stóp (ułamek szerokości postaci), żeby było ją widać
  },

  // Kolory zawodników: nazwa atlasu w assets/gracze/atlasy/ (16 kolorów, lista w README_GRAFIKI)
  kolorGracza: "czerwony",
  kolorPrzeciwnika: "zielony",
  skalaGrafik: 1,
  skalaSniezki: 1.6, // śnieżka rysowana większa niż jej okrąg trafień (lepiej widoczna)
  promienKropekZycia: 0.006, // kropki z trafieniami nad głową
  gruboscPierscienia: 0.004, // linia pierścienia pod stopami gracza

  // Dekoracje: zatrzymują śnieżki, zawodnicy nie mogą przez nie przejść.
  // plik: nazwa z assets/dekoracje/; x, y: środek podstawy (ułamek szerokości pola)
  dekoracje: [
    { plik: "choinka_1", x: 0.06, y: 0.105 }, // róg zielonych
    { plik: "plot_2", x: 0.33, y: 0.23 }, // osłona przed linią zielonych
    { plik: "balwan_3", x: 0.09, y: 0.44 }, // lewy dolny róg
    { plik: "fort_1", x: 0.6, y: 0.28 }, // osłona gracza
    { plik: "balwan_1", x: 0.47, y: 0.47 }, // strona gracza, u dołu
    { plik: "choinka_2", x: 0.96, y: 0.14 }, // prawy górny róg
  ],

  // Podstawa (owal na ziemi) jako ułamek szerokości grafiki dekoracji
  podstawaSzerokosc: 0.4, // połowa szerokości owalu
  podstawaGlebokosc: 0.15, // połowa głębokości owalu

  // Kolory
  kolorCzerwony: "#d93a3a",
  kolorZielony: "#3a9a4a",
  kolorPierscienia: "#2a6fd6",
  kolorPadu: "#2a6fd6",
  kolorSniegu: "#ffffff",
  kolorBrzegu: "#b9d0e6", // przyciemnienie poza polem i przy jego brzegach
  kolorNapisu: "#8cc4ee",
  kolorCelu: "#2a6fd6",
  kolorZasiegu: "#e0902a", // łuk siły (niepełna siła) albo pierścień zasięgu, gdy nie doleci
  kolorZasieguDoleci: "#3a9a4a", // pełna siła albo zasięg sięga celu
};
