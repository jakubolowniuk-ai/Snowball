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
  // Śnieżka nie trafia drużyny rzucającego (wyjątek: rzucił upity). true = stare zachowanie,
  // w którym trafia każdego na drodze oprócz rzucającego.
  trafianieSwoich: false,
  trafieniaDoEliminacji: 3, // wcześniejsze trafienia tylko ogłuszają
  czasOgluszenia: 1, // sekundy bez ruchu i bez rzutu
  wibracjaTrafienia: 60, // milisekundy wibracji telefonu przy trafieniu (Android)
  czasChmurki: 0.5, // jak długo widać obłoczek i rozbryzg po trafieniu
  czasNapisuKonca: 2, // ile sekund widać "Wygrana!"/"Przegrana" przed restartem

  // Typy przeciwników: każdy typ ma stałe parametry, a poziom to skład (ile i jakich typów).
  // Gracz ich nie używa, ma wspólne ustawienia (trafieniaDoEliminacji, czasOgluszenia, ...).
  // Odległości i kroki to ułamki szerokości pola, czasy w sekundach, siła 0-1.
  typy: {
    // Zielony: najsłabszy (Rekrut). Rozmiar ×1,15 z karty typu pominięty (promień postaci
    // jest wspólny i używany w wielu miejscach kodu).
    zielony: {
      nazwa: "Zielony (Rekrut)",
      kolor: "zielony", // atlas assets/gracze/atlasy/<kolor>.webp
      // Życia: na starcie poczatkowe, +1 co coIlePoziomow poziomów, najwyżej max
      zycia: { poczatkowe: 2, coIlePoziomow: 2, max: 4 },
      czasOgluszenia: 1.5,
      mnoznikPredkosci: 0.7, // chodzi wolniej niż gracz
      // Ruch w Arenie: krótkie kroki w stronę gracza, kierunek z losowym odchyleniem
      krokMin: 0.05,
      krokMax: 0.09,
      odchylenieKroku: 25, // stopnie
      postojMin: 1.0, // postój po kroku
      postojMax: 1.5,
      // Rzuca z tej odległości albo bliżej (losowana przy każdej decyzji o rzucie)
      odlegloscRzutuMin: 0.3125,
      odlegloscRzutuMax: 0.375,
      czasAwaryjny: 5, // gdy przez tyle sekund nie podejdzie bliżej, rzuca z miejsca
      przerwaMin: 3, // przerwa między rzutami
      przerwaMax: 4.5,
      silaMin: 0.05, // siła rzutu = prędkość śnieżki (0-1)
      silaMax: 0.15,
      zamachMin: 0.5, // zamach (ostrzeżenie) trwa max(zamachMin, sila × MAX_CHARGE)
      // Celuje w miejsce gracza z tym błędem: 0,053 = ok. 70% trafień w stojącego (sprawdzone
      // symulacją; pudło "za" graczem i tak przez niego przelatuje, więc wzór z planu zaniżał)
      rozrzut: 0.053,
      szansaUniku: 0.15,
      czasReakcji: 0.5,
      mnoznikPrzeladowania: 1, // razy czasPrzeladowania
      szansaBonusu: 0.1,
      szansaStanowiska: 0,
    },
    // Limonkowy: Zwiadowca. Stała umiejętność "Laska cukrowa" (szybszy niż gracz bez bonusu);
    // cena: słabe śnieżki i rzadkie rzuty.
    limonkowy: {
      nazwa: "Limonkowy (Zwiadowca)",
      kolor: "limonkowy",
      zycia: 3, // liczba = stałe życia (nie zależą od poziomu)
      czasOgluszenia: 1.2,
      mnoznikPredkosci: 1.4,
      krokMin: 0.08,
      krokMax: 0.12,
      odchylenieKroku: 25,
      postojMin: 0.5,
      postojMax: 1.0,
      odlegloscRzutuMin: 0.375, // 6-7 ludzików
      odlegloscRzutuMax: 0.4375,
      czasAwaryjny: 5,
      przerwaMin: 3,
      przerwaMax: 4.5,
      silaMin: 0.1,
      silaMax: 0.3,
      zamachMin: 0.4,
      rozrzut: 0.047, // ok. 80% trafień w stojącego
      szansaUniku: 0.3,
      czasReakcji: 0.6,
      mnoznikPrzeladowania: 1,
      szansaBonusu: 0.2,
      szansaStanowiska: 0.1,
    },
  },
  // Skład poziomu: lista { typ, ile }. Poziom bez wpisu bierze skład najbliższego niższego.
  skladPoziomow: {
    1: [{ typ: "zielony", ile: 1 }],
    2: [{ typ: "zielony", ile: 2 }],
    3: [{ typ: "zielony", ile: 3 }],
    4: [{ typ: "zielony", ile: 3 }, { typ: "limonkowy", ile: 1 }],
    5: [{ typ: "zielony", ile: 3 }, { typ: "limonkowy", ile: 2 }],
    6: [{ typ: "zielony", ile: 3 }, { typ: "limonkowy", ile: 3 }],
    7: [{ typ: "zielony", ile: 3 }, { typ: "limonkowy", ile: 4 }],
    8: [{ typ: "zielony", ile: 4 }, { typ: "limonkowy", ile: 4 }],
    9: [{ typ: "zielony", ile: 4 }, { typ: "limonkowy", ile: 5 }],
    10: [{ typ: "zielony", ile: 5 }, { typ: "limonkowy", ile: 5 }],
    11: [{ typ: "zielony", ile: 5 }, { typ: "limonkowy", ile: 6 }],
    12: [{ typ: "zielony", ile: 6 }, { typ: "limonkowy", ile: 6 }],
    // poziom 13 i dalej: skład ostatniego wpisu (12)
  },
  // Ilu przeciwników naraz na planszy (null = wszyscy od razu). Reszta czeka w kolejce
  // i wchodzi opoznienieWejscia s po tym, jak zwolni się miejsce (ktoś odpadnie).
  maxNaraz: 6,
  opoznienieWejscia: 2,
  // Pierwszy rzut każdego przeciwnika: po napisie "Level N" + zwykła przerwa + losowo 0-tyle s
  opoznienieStartuMax: 3,
  // Ustawienie na starcie w Arenie: rzędy równoległe do przekątnej (pierwszy: liniaPrzeciwnikow),
  // kolejne bliżej lewego górnego rogu co odstepRzedow, najwyżej maxWRzedzie w rzędzie,
  // postacie nie bliżej siebie niż minOdstep × rozmiarPostaci
  odstepRzedow: 0.14, // z przesunięciem rzędów daje odstęp co najmniej minOdstep × rozmiarPostaci
  maxWRzedzie: 6,
  minOdstep: 1.2,
  // Miękkie odpychanie przeciwników od siebie (żeby nie stali jeden na drugim):
  // postacie bliżej niż rozmiarPostaci rozsuwają się, im większe, tym szybciej (na sekundę)
  odpychaniePrzeciwnikow: 4,

  // Zachowanie przeciwników wspólne dla wszystkich typów
  wedrowka: 0.12, // Wielka arena: jak daleko odchodzi przy losowym chodzeniu
  odskok: 0.08, // jak daleko odskakuje w bok przy uniku

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
    maxNaraz: [1, 1, 2, 2, 3], // ile naraz na poziomie 1, 2, 3, ... (dalej jak ostatni)
    promienTrafienia: 0.02, // okrąg trafienia bonusu (i jego wielkość na ekranie)
    pasPrzekatnej: 0.08, // szerokość pasa wokół przekątnej, w którym się pojawia
    marginesKrawedzi: 0.05, // odstęp od krawędzi pola
    odstepOdPostaci: 0.08, // nie bliżej żadnej postaci niż tyle
    zapasPrzeszkody: 0.02, // nie bliżej podstawy przeszkody niż tyle
    przeciwnicyZbierajaBonusy: true, // false: śnieżki przeciwników przelatują przez bonusy
    czasSerduszka: 1, // ile sekund widać serduszko po zjedzeniu Pierniczka
    // Upicie: promień wybuchu (ułamek szerokości pola), czas, największy skręt ruchu (stopnie)
    // i co ile sekund (od-do) losuje się nowy skręt
    upicie: { promien: 0.12, czasTrwania: 10, maxSkret: 80, zmianaCo: [0.3, 0.6] },
    rozmiarIkony: 0.034, // ikona bonusu leżącego na planszy (zawodnik ma ok. 0.072 wysokości)
    rozmiarIkonyAktywnej: 0.022, // ikona aktywnego bonusu nad głową postaci
    // Efekty widoczne na postaciach i śnieżkach
    odcienSpowolnienia: "120, 200, 255", // niebieskawy odcień spowolnionej postaci (R, G, B)
    silaOdcieniaSpowolnienia: 0.35, // 0 = brak, 1 = cała postać w tym kolorze
    kolysanieUpicia: 8, // upity kołysze się na boki o tyle stopni
    szybkoscKolysaniaUpicia: 3, // jak szybko (większe = szybciej)
    poswiataSpowolnionejSniezki: "rgba(58, 207, 176, 0.45)", // poświata wolniejszych śnieżek
    wymusTyp: null, // do testów: id bonusu (np. "kakao"), wtedy każdy nowy bonus jest tego typu; null = losowo
    typy: [
      // grafika: ikona bonusu (to jedyne miejsce przypisania bonus -> ikona) albo null = kula zastępcza
      // Bombka: tarcza na jedno trafienie. odbija: true = odbija śnieżkę w rzucającego,
      // false = tylko pochłania trafienie (stare zachowanie)
      { id: "bombka", nazwa: "Bombka", kolor: "#3a7de0", czasTrwania: 12, waga: 3, grafika: "assets/bonusy/bombka.png", odbija: true },
      // Gwiazdka: następne rzuty (najwyżej "rzuty", najdłużej czasTrwania s) to wachlarz śnieżek
      { id: "gwiazdka", nazwa: "Gwiazdka", kolor: "#f2c417", czasTrwania: 8, waga: 3, grafika: "assets/bonusy/gwiazdka.png", rzuty: 3, katyWachlarza: [-10, 0, 10] },
      // Laska cukrowa: szybszy bieg
      { id: "laska", nazwa: "Laska cukrowa", kolor: "#e03a3a", czasTrwania: 6, waga: 3, grafika: "assets/bonusy/laska_cukrowa.png", mnoznikPredkosci: 1.4 },
      // Pierniczek: od razu zdejmuje jedno trafienie (czasTrwania 0 = działa natychmiast)
      { id: "pierniczek", nazwa: "Pierniczek", kolor: "#b5733a", czasTrwania: 0, waga: 1, grafika: "assets/bonusy/pierniczek.png" },
      // Kakao: krótsze przeładowanie (ze stosem/armatką liczy się najmniejszy mnożnik, nie iloczyn)
      { id: "kakao", nazwa: "Kakao", kolor: "#6b3f26", czasTrwania: 10, waga: 3, grafika: "assets/bonusy/kakao.png", mnoznikPrzeladowania: 0.3 },
      // Pełna siła: najwyżej "rzuty" rzutów albo czasTrwania s każdy rzut z maksymalną prędkością
      { id: "pelnaSila", nazwa: "Pełna siła", kolor: "#ff8c1a", czasTrwania: 10, waga: 3, grafika: "assets/bonusy/pelna_sila.png", rzuty: 10 },
      // Spowolnienie przeciwników: wszyscy żywi z drużyny przeciwnej wolniej chodzą i przeładowują
      { id: "spowolnieniePrzeciwnikow", nazwa: "Spowolnienie przeciwników", kolor: "#7fd6ff", czasTrwania: 8, waga: 2, grafika: "assets/bonusy/spowolnienie_przeciwnikow.png", mnoznikPredkosci: 0.5, mnoznikPrzeladowania: 2 },
      // Spowolnienie śnieżek: śnieżki drużyny przeciwnej lecą wolniej (także te już w locie)
      { id: "spowolnienieSniezek", nazwa: "Spowolnienie śnieżek", kolor: "#3acfb0", czasTrwania: 8, waga: 2, grafika: "assets/bonusy/spowolnienie_sniezek.png", mnoznikPredkosci: 0.5 },
      // Niewidzialność: postać półprzezroczysta (alfa), przeciwnicy rzucają na oślep w koło
      // o promieniu promienPoszukiwania wokół miejsca, gdzie gracz był w chwili zebrania
      { id: "niewidzialnosc", nazwa: "Niewidzialność", kolor: "#bfe9ff", czasTrwania: 6, waga: 1, grafika: "assets/bonusy/niewidzialnosc.png", alfa: 0.35, promienPoszukiwania: 0.12 },
      // Miotacz (armatka ręczna): "rzuty" = gałki; przytrzymany palec strzela co odstepStrzalow
      // z siłą silaStrzalu, bez przeładowania; czasTrwania = bezpiecznik czasu (decyzja: 20 s).
      // Przeciwnik strzela seriami po seriaAI strzałów, potem zwykła przerwa.
      { id: "miotacz", nazwa: "Miotacz", kolor: "#ff9a2e", czasTrwania: 20, waga: 2, grafika: "assets/bonusy/miotacz.png", rzuty: 20, odstepStrzalow: 0.3, silaStrzalu: 0.7, seriaAI: 5 },
      // Wieżyczka: po trafieniu staje w miejscu bonusu (drużyna trafiającego). zycia, amunicja (gałki),
      // strzał co odstepStrzalow s z siłą silaStrzalu i rozrzutem; z szansą szansaNajblizszego
      // w najbliższego z drużyny przeciwnej, inaczej w losowego; promien trafienia wieżyczki.
      { id: "wiezyczka", nazwa: "Wieżyczka", kolor: "#6e6e7a", czasTrwania: 0, waga: 1, grafika: "assets/bonusy/wiezyczka.png", zycia: 3, amunicja: 30, odstepStrzalow: 3, silaStrzalu: 0.5, rozrzut: 0.05, szansaNajblizszego: 0.6, promienTrafienia: 0.025 },
      // Upicie: bonus wybucha, wszyscy żywi w kręgu idą krzywo (czas i reszta w sekcji upicie wyżej)
      { id: "upicie", nazwa: "Upicie", kolor: "#a64ad6", waga: 2, grafika: "assets/bonusy/upicie.png" },
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
      mnoznikPrzeciwnikow: 1, // liczba przeciwników = suma ze składu poziomu razy to
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
