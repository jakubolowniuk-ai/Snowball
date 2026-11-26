# Snowcraft: plan budowy edytora map (teren z kafelków)

Stan na 25.11.2026

## Cel i zakres

Edytor to jedna strona (`editor.html`) w repozytorium Snowball, działająca na telefonie i na komputerze, która pozwala zbudować mapę i od razu w nią zagrać. Teren mapy składa się z kafelków.

**Wersja 1 edytuje:**

- teren z kafelków (podłoże mapy),
- dekoracje (choinki, bałwany, płoty, forty, a potem nowe),
- stanowiska: stos gałek i armatkę,
- start gracza i przeciwników,
- rozmiar świata dla Wielkiej areny.

**Później:** cele poziomu, bonusy na stałych pozycjach, strefy specjalne, mapa kampanii, tło poza polem gry.

**Poza zakresem:** konta, zapis online i współdzielenie map przez serwer. Mapy trafiają do repozytorium plikiem.

## Format mapy

Mapa to jeden plik z danymi i polem `wersja`, dzięki czemu stare mapy da się wczytać po zmianach gry. Plik leży w katalogu `mapy/`. Przykład (skrócony):

```json
{
  "wersja": 1,
  "nazwa": "Arena 1",
  "tryb": "arena",
  "swiat": { "szerokoscPol": 1, "wysokoscPol": 1 },
  "teren": {
    "rozmiarKafla": 50,
    "zestaw": "zima",
    "wiersze": [
      "ssssssssssssssssssss",
      "ssssllssssssssssssss"
    ]
  },
  "dekoracje": [
    { "id": "choinka_1", "x": 0.06, "y": 0.105 }
  ],
  "stanowiska": {
    "czerwoni": { "stos": { "x": 0.54, "y": 0.4 }, "armatka": { "x": 0.3, "y": 0.42 } },
    "zieloni": { "stos": { "x": 0.46, "y": 0.1 }, "armatka": { "x": 0.7, "y": 0.08 } }
  },
  "start": {
    "gracz": { "x": 0.62, "y": 0.42 },
    "przeciwnicy": { "regula": "linia", "wartosc": 0.55 }
  }
}
```

Zasady formatu:

- Pozycje `x` i `y` to ułamki szerokości pola gry, tak jak w `config.js` (jedna miara w całej grze).
- Stanowiska Areny są per drużyna, a Wielkiej areny neutralne (jedno miejsce, wspólna amunicja). Format obsługuje oba.
- Dekoracje odwołują się po `id` do pliku `dekoracje.json`, w którym każda ma kategorię, rozmiar i typ kolizji. Paleta edytora czyta ten plik, więc nowa grafika pojawia się po dodaniu jednego wpisu.
- Znaki w `wiersze` to identyfikatory kafelków z pliku zestawu (sekcja o terenie).

## Teren z kafelków

Podłoże mapy to siatka kwadratowych kafelków. Zasady wersji 1:

- **Rozmiar kafelka:** 50 × 50 jednostek pola (100 × 100 px przy skali 2 px = 1 jednostka). Arena (1000 × 500 jednostek) ma 20 × 10 kafelków, Wielka arena (2000 × 1000) ma 40 × 20, czyli 800 kafelków. Dla porównania zawodnik ma ok. 72 jednostki wysokości.
- **Zestaw kafelków:** folder `assets/teren/<zestaw>/` z plikiem `zestaw.json`. Każdy kafelek ma jednoznakowy `id`, plik grafiki, nazwę i liczbę wariantów. Zestawy zmieniają klimat mapy (zima, noc, lodowisko).
- **Warianty:** ten sam kafelek może mieć kilka wersji grafiki. Wybór wariantu wynika z pozycji kafelka, więc wzór jest za każdym razem taki sam i nie miga.
- **Rysowanie w grze:** kafelki są rysowane raz do osobnego płótna (bufora) przy wczytaniu mapy. W każdej klatce gra tylko kopiuje gotowy obraz, więc teren nie obciąża telefonu.
- **Wpływ na rozgrywkę:** w wersji 1 kafelki zmieniają tylko wygląd. Pole na późniejsze właściwości (spowolnienie na zaspie, ślizg na lodzie, woda blokująca ruch) jest w `zestaw.json` od początku, ale gra go nie używa.
- **Przejścia między podłożami:** w wersji 1 brak. Granice będą kratkowane. Miękkie krawędzie (autotiling, czyli automatyczny dobór kafelka według sąsiadów) dodamy, gdy będzie wiadomo, które podłoża naprawdę używasz.
- **Tło poza polem:** `tlo_plansza.png` zostaje jako tło poza mapą (z niebieskawym przyciemnieniem), tak jak dziś.

**Narzędzia terenu w edytorze:** pędzel (jeden kafelek), wypełnienie (zalewa sąsiadujące kafelki tego samego rodzaju), prostokąt, gumka (przywraca kafelek domyślny) i pipeta (bierze kafelek z mapy).

## Interfejs na telefonie

Edytor działa w poziomie, tak jak gra. Dotyk jest głównym sposobem sterowania, myszka działa tak samo.

- **Układ ekranu:** płótno mapy na środku, pasek narzędzi po lewej, paleta po prawej (zakładki: Teren, Dekoracje, Stanowiska), górny pasek z przyciskami: cofnij, ponów, siatka, zapisz, eksport, zagraj.
- **Gesty:** jeden palec używa wybranego narzędzia, dwa palce przesuwają i powiększają mapę. Dzięki temu mapa nie jest malowana przypadkiem przy przesuwaniu.
- **Siatka i przyciąganie:** dekoracje przyciągają się do siatki o rozmiarze połowy kafelka (25 jednostek). Przyciąganie można wyłączyć.
- **Dokładność:** zaznaczona dekoracja ma przyciski strzałek, które przesuwają ją o 1 jednostkę. Palec jest za gruby na precyzyjne ustawianie.
- **Podgląd kolizji:** przełącznik pokazuje owale podstaw dekoracji, miejsca startu i strefy stanowisk, żeby widać było, czy nic nie blokuje wejścia.
- **Cofnij i ponów:** pamięta co najmniej 50 ostatnich zmian.
- **Wielkość przycisków:** co najmniej 44 × 44 px, żeby dało się w nie trafić kciukiem.
- **Zaznaczona dekoracja:** usuń, duplikuj, następny wariant, przesuń o 1 jednostkę.

## Kroki budowy

Każdy krok to jedna rzecz do sprawdzenia na telefonie, z commitem na końcu. Przed większym krokiem Claude Code pokazuje krótki plan i czeka na zgodę.

1. **E0: dane wstępne.** Spisać `dekoracje.json` dla 16 istniejących dekoracji (kategoria, rozmiar, typ kolizji `owal`). Stworzyć pierwszy zestaw kafelków `zima` (co najmniej 3 kafelki, np. śnieg, śnieg ubity, lód) wraz z `zestaw.json`. Dopisać zasady grafik terenu do `docs/README_GRAFIKI.md`. Wynik: pliki z danymi, gra bez zmian.
2. **E1: format mapy i ładowanie.** Wczytać Arenę i Wielką arenę z `mapy/*.js` zamiast z `config.js`. Teren: jeden kafelek na całej mapie. Wynik: obie areny wyglądają i grają tak jak dziś (te same pozycje przeszkód, stanowisk i startów).
3. **E2: rysowanie terenu w grze.** Kafelki rysowane do bufora, test na ręcznie wpisanej mapie z kilkoma podłożami. Wynik: teren z kafelków w grze, bez spadku płynności na telefonie.
4. **E3: szkielet edytora.** `editor.html`: wczytanie mapy, rysowanie widoku, przesuwanie i powiększanie dwoma palcami, siatka. Wynik: można oglądać mapy na telefonie.
5. **E4: malowanie terenu.** Pędzel, wypełnienie, prostokąt, gumka, pipeta, cofnij i ponów. Wynik: można zmienić podłoże mapy.
6. **E5: dekoracje.** Paleta z `dekoracje.json`, stawianie, przesuwanie, usuwanie, duplikowanie, zmiana wariantu, podgląd kolizji. Wynik: można przestawić przeszkody.
7. **E6: stanowiska i starty.** Stos, armatka, start gracza i przeciwników. Ostrzeżenia, gdy coś stoi w przeszkodzie albo za blisko startu. Wynik: pełna mapa do edycji.
8. **E7: zapis i test.** Zapis roboczy w pamięci telefonu, eksport i import pliku mapy, sprawdzanie poprawności, przycisk „Zagraj tę mapę". Wynik: cała pętla zrób mapę, zagraj, popraw działa na telefonie.
9. **E8: wybór mapy w menu i pierwsze mapy.** Wybór mapy w menu gry. Pierwsze mapy z edytora trafiają do repozytorium (przez Claude Code). Wynik: znajomi mogą wybrać mapę w grze.

## Zmiany w grze

Edytor wymaga od gry kilku zmian. Wszystkie wchodzą w krokach E1 i E2, zanim powstanie sam edytor.

- **`przeszkody.js`** czyta dekoracje z wczytanej mapy zamiast z `CONFIG.dekoracje` i `CONFIG.tryby.wielkaArena.dekoracje`. Liczenie owali kolizji zostaje bez zmian.
- **`stanowiska.js` i `tryby.js`** czytają pozycje stanowisk, start gracza i regułę startu przeciwników z mapy.
- **`draw.js`** rysuje teren z bufora zamiast jednego tła w obrębie pola. Tło poza polem zostaje.
- **Nowy plik** (np. `mapy.js`) wczytuje mapę, sprawdza jej poprawność i buduje bufor terenu.
- **Rozmiar świata** z mapy zastępuje `swiatSzerokosc` i `swiatWysokosc` z `config.js`.
- **Kolizje:** w wersji 1 każda dekoracja ma kolizję `owal` jak dziś. Typ `brak` (sama ozdoba) dodajemy od razu, bo jest tani. Prostokąt dla ścian i pagórków dopiero, gdy te grafiki powstaną.
- **Pliki map nie jako czysty JSON.** Gra musi działać po otwarciu `index.html` bez konfiguracji (zasada z `CLAUDE.md`), a przeglądarka blokuje wczytywanie plików JSON z dysku. Dlatego mapa to plik `.js` z jedną linią `MAPY.arena_1 = { ... }`, wczytywany tagiem `<script>`. Zawartość to te same dane, co w przykładzie wyżej. Edytor eksportuje właśnie taki plik.

## Definicja gotowe, testy i ryzyka

**Krok jest gotowy, gdy:** działa na telefonie po otwarciu linku z GitHub Pages, w konsoli nie ma błędów, zmiany są zapisane commitem i wiadomo, jak je sprawdzić (zasada z `CLAUDE.md`).

**Testy:**

- **Po E1:** Arena i Wielka arena mają te same pozycje przeszkód, stanowisk i startów co przed zmianą. Porównanie liczb z `config.js` i z map.
- **Po E2:** teren z kilku podłoży działa płynnie na telefonie, a Wielka arena (800 kafelków) nie spowalnia gry.
- **Po E7:** mapa zrobiona w edytorze, wyeksportowana i wczytana w grze wygląda i zachowuje się tak, jak w edytorze, w tym kolizje.
- **Mapy uszkodzone lub sprzed zmian formatu:** gra pokazuje czytelny komunikat zamiast pustego ekranu.

**Ryzyka:**

- **Dokładność palca.** Rozwiązania: siatka, powiększanie, przyciski przesuwania o 1 jednostkę.
- **Edytor rozrośnie się ponad plan.** Trzymamy zakres wersji 1 z sekcji pierwszej.
- **Kratkowany teren.** Akceptujemy w wersji 1, miękkie granice później.
- **Zmiana formatu mapy.** Pole `wersja` i funkcja, która przerabia stare mapy na nową wersję.
- **Nowe typy kolizji** (prostokąt dla ścian i pagórków) zmieniają kod kolizji w `przeszkody.js`. Robimy je razem z pierwszą grafiką, która ich potrzebuje.

## Pytania otwarte

Przy każdym jest moja propozycja. Wystarczy odpowiedzieć „domyślnie" albo poprawić wybrane punkty.

- [ ] **Rozmiar kafelka:** 50 × 50 jednostek (100 × 100 px)? Propozycja: tak.
- [ ] **Wpływ kafelków na grę** (spowolnienie, ślizg, woda blokująca): od wersji 1 czy tylko wygląd? Propozycja: tylko wygląd, właściwości później.
- [ ] **Zestawy kafelków na start:** które podłoża (np. śnieg, lód, ziemia, trawa, woda) i ile wariantów każdego? Propozycja: jeden zestaw zima, 3–5 kafelków, 2 warianty każdego.
- [ ] **Obie areny od razu?** Propozycja: tak, bo format jest ten sam.
- [ ] **Zakres wersji 1:** teren, dekoracje, stanowiska, starty, rozmiar świata. Czy coś dodaje lub wyrzuca? Propozycja: tak jak w sekcji pierwszej.
- [ ] **Kolizje nowych obiektów** (ściany, pagórki, domy): owal jak dziś, brak kolizji, czy nowy prostokąt? Propozycja: owal i brak w wersji 1, prostokąt razem z pierwszą ścianą.
- [ ] **Tło poza polem:** zostaje jedna grafika wspólna dla wszystkich map? Propozycja: tak.
- [ ] **Format plików map:** `.js` z danymi zamiast czystego JSON (powody w sekcji o zmianach w grze)? Propozycja: tak.
- [ ] **Przekątna w Arenie:** zawsze, czy mapa może ją wyłączyć? Propozycja: zawsze.
- [ ] **Powiązanie mapy z poziomem:** jedna mapa na poziom, losowa czy wybór w menu? Propozycja: wybór w menu na start, powiązanie z poziomami w etapie 4.
- [ ] **Cofnij i ponów:** 50 kroków wystarczy? Propozycja: tak.
