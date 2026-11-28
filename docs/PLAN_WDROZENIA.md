# Snowcraft: plan wdrożenia

Stan na 26.11.2026. Ten dokument mówi **co i w jakiej kolejności robimy**. Dlaczego, jest w `STRATEGIA.md`. Jak, jest w `INSTRUKCJA_WDRAZANIA.md`.

Statusy: ✅ zrobione · 🔨 teraz · ⏳ później · ❓ do decyzji.

## Etapy

| # | Etap | Status |
|---|---|---|
| 0 | Gra podstawowa: Arena, Wielka arena, bonusy, stanowiska, typy przeciwników, 20 poziomów | ✅ (strojenie po graniu trwa) |
| 1 | Umowa dla grafik i partia próbna | ✅ (27.11; brakuje tylko muru ze śnieżnych bloków w stylu gry) |
| 2 | Format map i ładowanie z pliku (kroki E0–E2) | ✅ |
| 3 | Edytor map (kroki E3–E7) | 🔨 teraz |
| 4 | Poziomy jako dane i wybór mapy w menu (krok E8 i dalej) | ⏳ |
| 5 | Hurtowa produkcja grafik i map | ⏳ |
| 6 | Kampania | ⏳ |
| 7 | PWA albo aplikacja (opcjonalnie) | ⏳ |
| 8 | Multiplayer | ⏳ |

## Etap 0: co jest zrobione
Krótki zapis historii. Stare prompty kroków są w `docs/archiwum/`.
- **Prototyp i sterowanie:** stały joystick, rzut drugim palcem w dowolny punkt, siła = prędkość śnieżki, przeładowanie, ogłuszenie i eliminacja.
- **Grafika:** tło, dekoracje jako przeszkody, atlasy animacji zawodników w 16 kolorach, efekty, 13 ikon bonusów.
- **Bonusy (B1–B5):** 13 bonusów, w tym Niewidzialność, Miotacz, Wieżyczka i Sojusznik.
- **Stanowiska:** stos gałek i armatka.
- **Wielka arena (W1–W3):** świat 2 × 2 pola, kamera, strzałki, neutralne stanowiska, zamieć.
- **Typy przeciwników (A1–A4, C0–C10):** 10 typów jako profile kompromisów, życia w składzie poziomu, 20 poziomów, `maxNaraz` 8, `poziomStartowy` do testów, ucieczka Błękitnego.
- **Poprawki z 26.11:** w Wielkiej arenie rzut tylko z odległości typu, podchodzenie krokami, stanowisko tylko blisko gracza, bez zasady awaryjnej; cel wybierany w trakcie zamachu (`celPrzedRzutem`); zbijanie śnieżek jako cecha typu.

### Poziomy 1–20 (obowiązujące, do strojenia po graniu)
Poziomy 1–5 ustalił Jakub. Od poziomu 6 poziom N = N przeciwników. Co drugi poziom wchodzi nowy kolor, w pozostałych dochodzi Zielony z 2 życiami. Nowe kolory mają 2 życia. Testowane najpierw na Wielkiej arenie.

| Poz. | Skład (Z = Zielony, L = Limonkowy, w nawiasie życia) | Wrogów | Trafień |
|---|---|---|---|
| 1 | 2 Z(1) | 2 | 2 |
| 2 | 4 Z(1) | 4 | 4 |
| 3 | 2 Z(1), 1 L(1) | 3 | 3 |
| 4 | 3 Z(1), 2 L(1) | 5 | 5 |
| 5 | 3 Z(2), 2 L(1) | 5 | 8 |
| 6 | 3 Z(3), 2 L(2), Żółty(2) | 6 | 15 |
| 7 | jak 6 + Z(2) | 7 | 17 |
| 8 | jak 7 + Pomarańczowy(2) | 8 | 19 |
| 9 | jak 8 + Z(2) | 9 | 21 |
| 10 | jak 9 + Turkusowy(2) | 10 | 23 |
| 11 | jak 10 + Z(2) | 11 | 25 |
| 12 | jak 11 + Błękitny(2) | 12 | 27 |
| 13 | jak 12 + Z(2) | 13 | 29 |
| 14 | jak 13 + Szary(2) | 14 | 31 |
| 15 | jak 14 + Z(2) | 15 | 33 |
| 16 | jak 15 + Fioletowy(2) | 16 | 35 |
| 17 | jak 16 + Z(2) | 17 | 37 |
| 18 | jak 17 + Brązowy(2) | 18 | 39 |
| 19 | jak 18 + Z(2) | 19 | 41 |
| 20 | jak 19 + Magenta(2) | 20 | 43 |

21 i dalej: skład poziomu 20.

### Typy elitarne (zaplanowane, niezrobione, nie robić bez prośby Jakuba)
Kolory 11–15, poza poziomami 1–20. Tylko one dostają umiejętności z bonusów, każda umiejętność ma cenę w innych liczbach typu. Bossowie później, z osobną grafiką.

| # | Kolor | chód | trafia | zamach | siła | unik | umiejętność |
|---|---|---|---|---|---|---|---|
| 11 | Różowy | 1,3 | 90% | 0,70 | 0,15 | 20% | wachlarz kilku śnieżek |
| 12 | Granatowy | 0,7 | 95% | 0,50 | 0,30 | 55% | niewidzialność (10–15 s od startu i po każdym trafieniu) |
| 13 | Bordowy | 1,3 | 40% | 0,50 | 0,80 | 25% | serie jak z armatki |
| 14 | Niebieski | 0,6 | 95% | 0,70 | 0,75 | 10% | dwie umiejętności |
| 15 | Złoty | 1,2 | 90% | 0,30 | 0,70 | 50% | dwie umiejętności |

## Etap 1: umowa dla grafik i partia próbna 🔨
- Dopisać do `GRAFIKI.md` nowe kategorie (krzak, dom, ściana, pagórek) i zasady kafelków terenu (już dopisane, do potwierdzenia przez Jakuba).
- Zrobić 1–2 sztuki z każdej nowej kategorii i 3 kafelki zestawu „zima” (np. śnieg, śnieg ubity, lód).
- Wynik: pliki zgodne ze skalą, gotowe do testu w edytorze.

## Etapy 2–4: mapy i edytor
Edytor to jedna strona `editor.html`, działa na telefonie i komputerze, pozwala zbudować mapę i od razu w nią zagrać.

**Wersja 1 edytuje:** teren z kafelków, dekoracje, stanowiska (stos i armatka), start gracza i przeciwników, rozmiar świata Wielkiej areny.
**Później:** cele poziomu, bonusy na stałych pozycjach, strefy specjalne, mapa kampanii, tło poza polem.
**Poza zakresem:** konta, zapis online, współdzielenie przez serwer.

### Format mapy
Plik `mapy/<nazwa>.js` z jedną linią `MAPY.<nazwa> = { ... }` (powód: `STRATEGIA.md`, zasada 3). Pole `wersja` pozwala wczytać stare mapy po zmianach formatu. Przykład danych:

```js
MAPY.arena_1 = {
  wersja: 1,
  nazwa: "Arena 1",
  tryb: "arena",
  swiat: { szerokoscPol: 1, wysokoscPol: 1 },
  teren: { rozmiarKafla: 50, zestaw: "zima", wiersze: ["ssssssssssssssssssss", "ssssllssssssssssssss"] },
  dekoracje: [{ id: "choinka_1", x: 0.06, y: 0.105 }],
  stanowiska: {
    czerwoni: { stos: { x: 0.54, y: 0.4 }, armatka: { x: 0.3, y: 0.42 } },
    zieloni: { stos: { x: 0.46, y: 0.1 }, armatka: { x: 0.7, y: 0.08 } },
  },
  start: { gracz: { x: 0.62, y: 0.42 }, przeciwnicy: { regula: "linia", wartosc: 0.55 } },
};
```

- Pozycje to ułamki szerokości pola, jak w `config.js`.
- Stanowiska Areny są per drużyna, Wielkiej areny neutralne. Format obsługuje oba.
- Dekoracje odwołują się po `id` do opisu dekoracji `dane/dekoracje.js` (kategoria, rozmiar, typ kolizji). Paleta edytora czyta ten plik, więc nowa grafika pojawia się po dodaniu jednego wpisu.
- Znaki w `wiersze` to identyfikatory kafelków z opisu zestawu `assets/teren/<zestaw>/zestaw.js`.

### Teren z kafelków
- Siatka 50 × 50 jednostek. Arena ma 20 × 10 pól siatki, Wielka arena 40 × 20 (800).
- **Zmiana z 27.11:** pole siatki zapisuje tylko **materiał** (np. śnieg, ubity śnieg, lód). Gra wypełnia obszar materiału jego teksturą dopasowaną do świata, więc tekstura może być duża i prostokątna (otrzymane tekstury są 16:9) i zawsze się łączy. Wycinanie kwadratów 100 × 100 px psułoby łączenie.
- Zestaw kafelków: folder `assets/teren/<zestaw>/` z plikiem `zestaw.js` (jednoznakowy `id`, plik, nazwa, liczba wariantów). Wariant wynika z pozycji kafelka (zawsze ten sam, bez migania).
- **Rysowanie (zrobione w E2, poprawione 28.11):** teren razem z tłem pod nim rysowany RAZ do bufora (osobne płótno na każde pole gry, `rozdzielczoscTerenu` pikseli na jednostkę), w każdej klatce gra tylko kopiuje bufor, a zwykłe tło rysuje już tylko poza światem. Pierwsza wersja (wypełnianie teksturą co klatkę) przycinała grę na telefonie: pomiar przy spowolnionym procesorze 152 ms na klatkę zamiast 93 ms. Po poprawce teren nie dokłada widocznego kosztu. **Druga poprawka 28.11 (cała gra):** pomiar pokazał, że ok. 80% czasu klatki zabierało rysowanie tła od nowa w każdej klatce, a rysowanie postaci kodem prawie nic. Tło przeniesione na osobną warstwę rysowaną tylko po zmianie, gęstość płótna ograniczona do 2: czas klatki w pomiarze 110 ms → ok. 23 ms (Arena), ok. 32 ms (Wielka arena). Zmiana technologii niepotrzebna. Licznik `?fps=1` do pomiaru na telefonie. Pamięć: ok. 8 MB na pole gry (Wielka arena 2 × 2 = ok. 32 MB), tylko dla map z materiałami.
- W wersji 1 kafelki zmieniają tylko wygląd. Pole na właściwości (spowolnienie, ślizg, woda) jest w opisie zestawu od początku, ale gra go nie używa.
- Brak przejść między podłożami w wersji 1 (granice kratkowane). Tło poza mapą zostaje (`tlo_plansza.png`).

### Interfejs edytora
- W poziomie jak gra. Płótno mapy na środku, narzędzia po lewej, paleta po prawej (zakładki: Teren, Dekoracje, Stanowiska), u góry: cofnij, ponów, siatka, zapisz, eksport, zagraj.
- Jeden palec używa narzędzia, dwa palce przesuwają i powiększają mapę.
- Narzędzia terenu: pędzel, wypełnienie, prostokąt, gumka, pipeta.
- Dekoracje przyciągają się do siatki pół kafelka (25 jednostek), da się to wyłączyć. Zaznaczona dekoracja: usuń, duplikuj, następny wariant, przesuń o 1 jednostkę strzałkami.
- Podgląd kolizji (owale podstaw, starty, strefy stanowisk). Cofnij i ponów: co najmniej 50 kroków. Przyciski co najmniej 44 × 44 px.

### Kroki
| Krok | Co | Wynik |
|---|---|---|
| E0 ✅ | Dane wstępne: `dane/dekoracje.js` dla 16 dekoracji (kategoria, rozmiar, kolizja `owal`), zestaw `zima` (co najmniej 3 kafelki) z `zestaw.js` | pliki z danymi, gra bez zmian |
| E1 ✅ | Format mapy i ładowanie: Arena i Wielka arena z `mapy/*.js` zamiast z `config.js`, teren z jednego kafelka | obie areny wyglądają i grają jak dziś (porównanie liczb) |
| E2 ✅ | Rysowanie terenu w grze z bufora (w kawałkach), test na ręcznie wpisanej mapie | teren z kafelków bez spadku płynności |
| E3 | Szkielet `editor.html`: wczytanie mapy, widok, przesuwanie i powiększanie, siatka | można oglądać mapy na telefonie |
| E4 | Malowanie terenu, cofnij i ponów | można zmienić podłoże |
| E5 | Dekoracje: paleta, stawianie, przesuwanie, usuwanie, duplikowanie, warianty, podgląd kolizji | można przestawić przeszkody |
| E6 | Stanowiska i starty, ostrzeżenia (coś w przeszkodzie, za blisko startu) | pełna mapa do edycji |
| E7 | Zapis roboczy w pamięci telefonu, eksport i import pliku, sprawdzanie poprawności, „Zagraj tę mapę” | pętla: zrób mapę, zagraj, popraw |
| E8 | Wybór mapy w menu, pierwsze mapy w repozytorium | znajomi wybierają mapę w grze |

**Zmiany w grze przy E1–E2:** `przeszkody.js` czyta dekoracje z mapy, `stanowiska.js` i `tryby.js` czytają stanowiska i starty z mapy, `draw.js` rysuje teren z bufora, nowy plik `mapy.js` wczytuje i sprawdza mapę, rozmiar świata z mapy zastępuje `swiatSzerokosc` i `swiatWysokosc`. Kolizje w wersji 1: `owal` (jak dziś) i `brak`. Prostokąt (ściany, pagórki) dopiero z pierwszą taką grafiką.

**Testy:** po E1 te same pozycje przeszkód, stanowisk i startów co przed zmianą. Po E2 Wielka arena z 800 kafelkami bez spowolnienia na telefonie. Po E7 mapa z edytora wygląda i zachowuje się w grze tak samo, łącznie z kolizjami. Uszkodzona albo stara mapa daje czytelny komunikat zamiast pustego ekranu.

## Etapy 5–8
- **5. Hurtowa produkcja grafik i map:** dopiero po edytorze, gdy widać rozmiary i styl na mapie.
- **6. Kampania:** kolejność poziomów, mapa kampanii odkrywana od prawej do lewej, zapis postępów w pamięci telefonu, bossowie, inne cele (flaga, fort, przetrwaj 60 s), gwiazdki, odblokowywanie skórek.
- **7. PWA albo aplikacja:** instalacja na ekranie głównym, pełny ekran, numer wersji wymuszający odświeżenie. Jakub chce PWA zaraz po edytorze (decyzja 27.11). Co PWA zmienia w edytorze (sprawdzone 27.11):
  - Kroki E0–E6 bez zmian: PWA to tylko manifest (opis aplikacji) i service worker (skrypt, który zapamiętuje pliki gry w telefonie), logika i rysowanie zostają.
  - E7 (eksport): w zainstalowanej PWA na iPhonie zwykłe pobieranie pliku nie działa dobrze. Eksport ma używać udostępniania pliku (Web Share API), a gdy go brak, pobierania; dodatkowo „Kopiuj tekst mapy”.
  - Zapis roboczy w `localStorage` (pamięci strony w telefonie) jest wspólny dla gry i edytora z tego samego adresu, więc „Zagraj tę mapę” działa także w PWA.
  - Service worker musi zapamiętywać `editor.html`, `mapy/*.js` i `dane/*.js`. Numer wersji `?v=` zastąpi wersja pamięci service workera.
  - Wniosek: PWA nie trzeba robić przed edytorem. Robienie jej wcześniej utrudniłoby testowanie (telefon trzymałby stare pliki przy każdej zmianie).
- **8. Multiplayer:** najpierw stały krok czasu i losowość z ziarnem, potem serwer, na końcu tryb dwóch graczy. Po kampanii.

## Odłożone pomysły (bez etapu)
- Drużyna 3 zawodników (zaznaczanie zawodnika i celów, automatyczni koledzy).
- Bonusy negatywne.
- Przeszkody z własnym działaniem: zamarznięty staw (ślizganie), zaspy (spowolnienie), igloo, sanie, skrzynki z prezentami.
- Grafiki stanowisk (dziś kształty zastępcze).

## Pytania otwarte ❓
Przy każdym propozycja. Wystarczy odpowiedzieć „domyślnie” albo poprawić wybrane.

Odpowiedzi Jakuba z 27.11 są zapisane przy pytaniach (✔). Otwarte zostają tylko pytania, które pojawią się później.

**Rozgrywka (strojenie)** ✔
- [x] Zbijanie śnieżek: na razie żaden kolor.
- [x] Najnowszy kolor na planszy od startu poziomu (zrobione 27.11: przeplatanie wpisów od ostatniego).
- [x] Skok trudności z poziomu 5 na 6: zostaje.
- [x] Długie poziomy a zamieć po 90 s: na razie zostaje.

**Mapy i edytor** ✔
- [x] Kolizje nowych przeszkód: blokują głaz, kamienie_trzy, kamień średni, kłoda, pniak, krzak średni i duży, ostrokrzew, zaspy (wysoka, długa, z sankami, z łopatą), pagórek, murek, szopa, dom; same ozdoby: trawa, gałęzie, kamień mały, krzak mały, zaspa mała, staw.
- [x] Rozmieszczenie przeszkód: na stałe w mapie.
- [x] Rozmiar pola siatki terenu: do wpisania w edytorze (pole mapy, domyślnie 50 jednostek).
- [x] Teren w wersji 1: tylko wygląd.
- [x] Materiały na start: śnieg, ubity śnieg, lód.
- [x] Obie areny od razu.
- [x] Zakres wersji 1 edytora: teren, dekoracje, stanowiska, starty, rozmiar świata.
- [x] Kolizje w wersji 1: owal i brak; prostokąt dopiero, gdy obiekt go potrzebuje.
- [x] Tło poza polem wspólne dla wszystkich map.
- [x] Przekątna w Arenie zawsze.
- [x] **Każdy poziom ma swoją mapę** (powiązanie poziom → mapa w etapie 4; do tego czasu poziomy bez własnej mapy używają domyślnej mapy trybu).
- [x] Cofnij i ponów: 50 kroków.
- [x] Liczby rozgrywki dalej w `config.js`, w plikach map tylko układ (teren, pozycje).
