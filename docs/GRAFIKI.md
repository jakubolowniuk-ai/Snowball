# Snowcraft: grafiki

Stan na 26.11.2026. Skala, kotwice, pliki grafik w grze i umowa dla nowych grafik. Wszystkie grafiki są własne (nie kopiujemy z oryginału), wycięte, z przezroczystym tłem, bez wypalonych cieni.

## Skala
- Pole gry ma 1000 x 500 jednostek (tyle co w `game.js`). **2 piksele pliku = 1 jednostka pola**, czyli pole to 2000 x 1000 px.
- Zawodnik stojący przodem ma ok. 72 jednostki wysokości, okrąg trafień ma średnicę 1/16 szerokości pola (`rozmiarPostaci`), śnieżka ok. 13 jednostek średnicy.
- Gdy obiekty są za duże lub za małe, zmień mnożnik w `config.js` (`skalaGrafik`, `skalaSniezki`) zamiast grafik.
- Rozmiary i kotwice: `sprites.json` (źródło) przepisany do `obrazy.js` (przeglądarka nie wczyta pliku JSON otwartego z dysku). Po zmianie `sprites.json` trzeba przepisać dane do `obrazy.js`.

## Kotwica
Punkt grafiki, który kładziemy na pozycji obiektu w grze. Podana jako ułamek rozmiaru obrazka (x od lewej, y od góry).
- **Zawodnik:** kotwica jest osobna dla każdej klatki animacji (pole `kotwica`): x = środek głowy (przy leżeniu: środek klatki), y = podeszwy. Rysowana w punkcie `(z.x, z.y + 0.85 * PROMIEN_POSTACI)`.
- **Dekoracje:** środek podstawy. **Efekty i ikony bonusów:** środek obrazka.

## Zasady
- **Cieni na grafikach nie ma.** Cienie, pierścień pod stopami, kropki żyć, linię i pierścienie celowania oraz napisy rysuje kod.
- **Dekoracje są przeszkodami:** śnieżki rozbijają się o ich podstawę (owal na ziemi), postacie nie mogą przez nie przejść.
- Forty pochodzą z arkusza w stylu miękkiego śniegu (wybrany przez Jakuba).

## Tło
`assets/tlo/tlo_plansza.png` ma 2400 x 1500 px (1200 x 750 jednostek). Pole gry leży na środku: od punktu (200, 250) px, rozmiar 2000 x 1000 px. Zapas wokół pola pokrywa ekrany od 4:3 do 2,4:1. W Wielkiej arenie śnieg to powtórzony fragment tła.

### Dekoracje

| Plik | Rozmiar w grze (jednostki pola) | Rozmiar pliku (px) | Kotwica (ułamek rozmiaru) |
| --- | --- | --- | --- |
| `dekoracje/balwan_1.png` | 77.0 x 83.5 | 154 x 167 | x 0.5, y 0.95 |
| `dekoracje/balwan_2.png` | 76.0 x 85.5 | 152 x 171 | x 0.5, y 0.95 |
| `dekoracje/balwan_3.png` | 71.5 x 81.0 | 143 x 162 | x 0.5, y 0.95 |
| `dekoracje/balwan_4.png` | 71.0 x 81.0 | 142 x 162 | x 0.5, y 0.95 |
| `dekoracje/choinka_1.png` | 72.0 x 102.0 | 144 x 204 | x 0.5, y 0.97 |
| `dekoracje/choinka_2.png` | 58.0 x 87.5 | 116 x 175 | x 0.5, y 0.97 |
| `dekoracje/choinka_3.png` | 50.5 x 64.5 | 101 x 129 | x 0.5, y 0.97 |
| `dekoracje/choinka_4.png` | 44.5 x 51.5 | 89 x 103 | x 0.5, y 0.97 |
| `dekoracje/fort_1.png` | 102.0 x 51.0 | 204 x 102 | x 0.5, y 0.95 |
| `dekoracje/fort_2.png` | 99.5 x 43.0 | 199 x 86 | x 0.5, y 0.95 |
| `dekoracje/fort_3.png` | 99.0 x 55.0 | 198 x 110 | x 0.5, y 0.95 |
| `dekoracje/fort_4.png` | 99.5 x 47.5 | 199 x 95 | x 0.5, y 0.95 |
| `dekoracje/plot_1.png` | 78.0 x 45.5 | 156 x 91 | x 0.5, y 0.95 |
| `dekoracje/plot_2.png` | 88.5 x 42.5 | 177 x 85 | x 0.5, y 0.95 |
| `dekoracje/plot_3.png` | 87.0 x 43.0 | 174 x 86 | x 0.5, y 0.95 |
| `dekoracje/plot_4.png` | 75.0 x 39.5 | 150 x 79 | x 0.5, y 0.95 |

### Efekty

| Plik | Rozmiar w grze (jednostki pola) | Rozmiar pliku (px) | Kotwica (ułamek rozmiaru) |
| --- | --- | --- | --- |
| `efekty/kupka_sniezek.png` | 32.0 x 27.0 | 64 x 54 | x 0.5, y 0.9 |
| `efekty/obloczek_sniegu_1.png` | 57.0 x 49.5 | 114 x 99 | x 0.5, y 0.5 |
| `efekty/obloczek_sniegu_2.png` | 57.0 x 42.5 | 114 x 85 | x 0.5, y 0.5 |
| `efekty/rozbryzg_1.png` | 47.0 x 43.5 | 94 x 87 | x 0.5, y 0.5 |
| `efekty/rozbryzg_2.png` | 47.0 x 42.0 | 94 x 84 | x 0.5, y 0.5 |
| `efekty/rozbryzg_3.png` | 47.0 x 45.5 | 94 x 91 | x 0.5, y 0.5 |
| `efekty/rozbryzg_4.png` | 47.0 x 43.5 | 94 x 87 | x 0.5, y 0.5 |
| `efekty/rozbryzg_5.png` | 45.5 x 47.0 | 91 x 94 | x 0.5, y 0.5 |
| `efekty/rozbryzg_6.png` | 45.5 x 47.0 | 91 x 94 | x 0.5, y 0.5 |
| `efekty/rozbryzg_7.png` | 47.0 x 44.5 | 94 x 89 | x 0.5, y 0.5 |
| `efekty/rozbryzg_8.png` | 47.0 x 46.5 | 94 x 93 | x 0.5, y 0.5 |
| `efekty/sniezka.png` | 13.5 x 14.0 | 27 x 28 | x 0.5, y 0.5 |

### Dekoracje „zimowy ogród” (`assets/dekoracje/zima/`, od kroku E0)
- 59 grafik z paczki „zima” (24.11.2026): kamienie, głazy, pnie, kłody, zaspy, pagórki, krzaki, ostrokrzew, trawa, gałęzie. Każdy obiekt ma warianty `_a`, `_b`, `_c` (czasem `_d`) o tej samej szerokości, kotwica x 0,5, y 0,88.
- 13 grafik dodanych 27.11.2026 (wygenerowane, przycięte i przeskalowane przez Claude Code): `dom_a`–`dom_d` (170 jednostek szerokości), `szopa_a`–`szopa_d` (140), `murek_a`–`murek_d` (150), `staw_a` (200, zamarznięty staw leżący na ziemi).
- Rozmiary, kotwice, kolizje i podstawy wszystkich 88 dekoracji (stare i nowe) są w `dane/dekoracje.js`. Bez kolizji (same ozdoby): trawa, gałęzie, kamień mały, krzak mały, zaspa mała, staw. Staw ma warstwę `ziemia` (zawsze pod postaciami).

## Zawodnik: animacje (przód i tył, 16 kolorów)

Kolory (nazwa: bazowy odcień kurtki): czerwony #E02020, zielony #2E9E3F, niebieski #2A6FD6, zolty #F2C417, pomaranczowy #F28A1C, fioletowy #8E44C9, rozowy #F06BA8, blekitny #4FC3F7, limonkowy #9ACD32, brazowy #8B5A2B, turkusowy #1ABC9C, granatowy #1F3A7A, magenta #D81B8C, szary #7F8C8D, bordowy #8B1E3F, zloty #D4A017. Żółty, błękitny, limonkowy i złoty słabiej widać na białym śniegu, warto je sprawdzić na telefonie.

### Pliki
- `assets/gracze/atlasy/<kolor>.webp`: jeden atlas na kolor (1024 x 532 px, bezstratny WebP, wszystkie klatki przód i tył). **Układ klatek jest taki sam dla wszystkich kolorów**, więc współrzędne z `sprites.json` działają dla każdego atlasu.
- Klatki jako osobne pliki PNG (`assets/gracze/klatki/...`) są w paczce grafik, ale nie w repozytorium (gra używa tylko atlasów).
- `sprites.json` → `zawodnik`: współrzędne klatek w atlasie, rozmiar w jednostkach, kotwica, punkt dłoni (`reka`) i definicje animacji (`animacje`) z czasami.
- Podglądy (`podglad/...`) są tylko w paczce grafik, nie w repozytorium.
- Stare pliki `gracze/<kolor>_przod.png` i `_tyl.png` zostały usunięte. Ich następcą jest klatka `stanie`.

### Skala
Wszystkie klatki mają wspólną skalę: 2 px = 1 jednostka pola, zawodnik stojący z przodu ma 72 jednostki wysokości. Rozmiar każdej klatki jest w `szer_jedn` i `wys_jedn`. Klatki mają różną wielkość (zawodnik w przysiadzie jest niższy, leżący szerszy), więc zawsze rysuj klatkę w jej własnym rozmiarze, nie w jednym stałym.

### Klatki (przód)
stanie, chod_1, chod_2, chod_3, zamach_1, zamach_2, rzut, przedluzenie, powrot, schylenie, przysiad, lepienie_a, lepienie_b, wstawanie, trafiony, ogluszony_a, ogluszony_b, upadek, siedzi, lezy (20 klatek).

### Klatki (tył)
stanie, chod_1, chod_2, chod_3, zamach_1, zamach_2, rzut, przedluzenie, powrot, schylenie, przysiad, lepienie, wstawanie (13 klatek). Z tyłu nie ma klatek trafienia, ogłuszenia i eliminacji (patrz uwagi niżej).

### Ręka i śnieżka
- Śnieżkę trzymaną w ręce **rysuje kod**. Grafiki zawodnika mają ją usuniętą (rękawica jest zamalowana na szaro).
- Pole `reka` (x, y jako ułamek rozmiaru klatki, `promien_jedn` w jednostkach pola) jest tylko w klatkach, w których zawodnik trzyma śnieżkę: `stanie`, `chod_*`, `zamach_1` (przód i tył) oraz `zamach_2` z tyłu. Brak pola `reka` = nie rysuj śnieżki w ręce. Dotyczy to też `zamach_2` z przodu, bo dłoń ze śnieżką jest wtedy schowana za kapturem.
- Rzucająca ręka to zawsze ta sama: z przodu po prawej stronie obrazka, z tyłu po lewej. Po odbiciu klatki w poziomie strona też się odbija, a `reka.x` trzeba wtedy zamienić na `1 - x`.
- Klatki `schylenie`, `przysiad`, `lepienie_*`, `wstawanie` mają śnieżkę **wbudowaną w grafikę** (biała, lepiona w dłoniach). Nie rysuj wtedy drugiej.

### Boki
Nie ma osobnych klatek z boku. Ruch w bok = klatki z przodu odbite w poziomie.

### Animacje i czasy (`animacje` w `sprites.json`)
- `chod`: chod_1, chod_2, chod_3, chod_2 po 140 ms, w pętli (najlepiej sterować klatką dystansem przebytym, nie czasem).
- `zamach`: zamach_1 (90 ms), zamach_2 (trzymana do puszczenia przycisku).
- `rzut`: rzut (70), przedluzenie (110), powrot (140), potem stanie. Śnieżka wylatuje w momencie klatki `rzut`.
- `przeladowanie_krotkie` (po szybkim rzucie, ok. 0,5 s): schylenie (150), przysiad (120), wstawanie (150).
- `przeladowanie_pelne` (po rzucie z pełną siłą, ok. 2 s): schylenie (200), przysiad (200), lepienie_a i lepienie_b naprzemiennie po 250 ms, aż minie ok. 1,4 s, wstawanie (200). Z tyłu jest jedna klatka `lepienie`.
- `trafiony`: trafiony (150), potem ogluszony_a i ogluszony_b naprzemiennie po 150 ms, razem ok. 1 s.
- `eliminacja`: trafiony (160), upadek (220), siedzi (260), lezy (zostaje na stałe).

## Ikony bonusów
13 ikon, każda 128 x 128 px, wyśrodkowana w kwadracie (ok. 90% kwadratu). W grze rysowane mniejsze (`rozmiarIkony` na planszy, `rozmiarIkonyAktywnej` nad głową). Przypisanie bonus → ikona tylko w polu `grafika` typu bonusu w `config.js` (`null` = kolorowa kula zastępcza). Plik `assets/bonusy/bonusy.json` to opis ikon z paczki grafik; gra go nie czyta.

| Plik | Bonus |
| --- | --- |
| `assets/bonusy/bombka.png` | Bombka (niebieska) |
| `assets/bonusy/gwiazdka.png` | Gwiazdka (żółta) |
| `assets/bonusy/laska_cukrowa.png` | Laska cukrowa |
| `assets/bonusy/pierniczek.png` | Pierniczek |
| `assets/bonusy/kakao.png` | Kakao |
| `assets/bonusy/czapka.png` | Sojusznik (czerwona czapka) |
| `assets/bonusy/miotacz.png` | Miotacz (armatka ręczna) |
| `assets/bonusy/wiezyczka.png` | Wieżyczka (armatka automatyczna) |
| `assets/bonusy/pelna_sila.png` | Pełna siła (błyskawica) |
| `assets/bonusy/niewidzialnosc.png` | Niewidzialność (płatek śniegu) |
| `assets/bonusy/spowolnienie_przeciwnikow.png` | Spowolnienie przeciwników (sopel) |
| `assets/bonusy/spowolnienie_sniezek.png` | Spowolnienie śnieżek (klepsydra) |
| `assets/bonusy/upicie.png` | Upicie (spirala) |

- Wszystkie mają ciemnogranatowy obrys, więc są czytelne na białym śniegu. Jasne ikony (płatek, sopel) są najsłabsze, ale obrys je ratuje.
- Cieni na grafikach nie ma. Okrągłe tło, poświatę, licznik czasu i pulsowanie rysuje kod.
- Ikony nie mają jednakowej proporcji (np. sopel jest wąski), ale każda jest dopasowana do kwadratu 128 px, więc zajmuje go w różnym stopniu.
- Ikony pochodzą z dwóch arkuszy (świąteczne i bojowe), styl jest spójny.


## Stanowiska (grafiki do zrobienia)
Do czasu dodania gra rysuje kształty zastępcze (białe kule, szara armatka). Przezroczysty PNG, ok. 128 x 128 px, bez cienia. Po wgraniu ustaw w `config.js` w `stanowiska.stos.grafika` i `stanowiska.armatka.grafika` ścieżki plików.

| Plik | Co to | Opis |
| --- | --- | --- |
| `assets/stanowiska/stos_sniegu.png` | Stos gałek (krótsze przeładowanie) | piramida śnieżek; gra zmniejsza obrazek, gdy ubywa gałek |
| `assets/stanowiska/armatka.png` | Armatka na śnieżki (szybki ogień) | mała armatka na kołach, lufa skierowana w lewo-górę (dla drugiej drużyny gra ją odbija) |

## Umowa dla nowych grafik (etap 1)
- Skala 2 px = 1 jednostka pola, przezroczyste tło, bez wypalonych cieni.
- Kotwica dekoracji: środek podstawy.
- Nazwy `kategoria_numer`, np. `krzak_1`, `dom_2`, `sciana_1`, `pagorek_1`. Nowe kategorie: krzak, dom, ściana, pagórek.
- Opis każdej dekoracji (kategoria, rozmiar, typ kolizji) w `dane/dekoracje.js` (od kroku E0, `PLAN_WDROZENIA.md`).
- Kolizje: `owal` (jak dziś) albo `brak` (sama ozdoba). Prostokąt dla ścian i pagórków dopiero z pierwszą taką grafiką.

### Kafelki terenu
- Kwadrat 100 x 100 px (50 x 50 jednostek), bez cieni i bez elementów wystających poza krawędź.
- Folder `assets/teren/<zestaw>/` (np. `zima`) z opisem `zestaw.js`: jednoznakowy `id`, plik, nazwa, liczba wariantów.
- Warianty jako osobne pliki. Przejść między podłożami (miękkich krawędzi) w wersji 1 nie ma.
- Partia próbna przed hurtem: 3 kafelki jednego zestawu i 1–2 sztuki z każdej nowej kategorii.

## Znane wady i braki
- **Skok przy wstawaniu:** w klatce `wstawanie` zawodnik trzyma śnieżkę w obu dłoniach, a w `stanie` kod rysuje ją w jednej. Złagodzone płynnym przejściem (`czasPrzenikania`).
- **Tył jest niższy niż przód:** stojący tyłem ma ok. 61 jednostek wysokości, przodem 72. Przy obrocie postaci widać lekki skok wysokości.
- **Z tyłu schylony zawodnik nie ma widocznych dłoni ani śnieżki.** Kod rysuje rosnącą śnieżkę przy stopach.
- **Trafienie, ogłuszenie i eliminacja są tylko z przodu.** Z tyłu kod używa klatki `stanie` z drżeniem i czerwonym błyskiem, przy eliminacji klatek z przodu.
- **Leżący leży głową w lewo.** Druga drużyna ma klatki odbite w poziomie.
- Ogłuszony zawodnik ma wielkość głowy dopasowaną na oko (±5%).
- Arkusze źródłowe miały rozdzielczość ok. 800 x 1000 px, więc przy powiększeniu ponad 1 px = 1/2 jednostki grafiki będą miękkie.
- Brakuje: muru ze śnieżnych bloków w stylu gry (próba z 27.11 miała inny styl), śladów, latarni. Grafiki stanowisk są wygenerowane (armatka z niebieskimi obręczami, stos), czekają na podpięcie.
- Tekstury terenu (śnieg, ubity śnieg, lód) z 27.11: śnieg i pojedynczy ubity łączą się bez szwów, lód ma widoczny szew (do poprawy programowo przy E2). Są prostokątne (16:9), dlatego teren to materiały wypełniane teksturą, a nie kwadratowe kafelki 100 × 100 px (`PLAN_WDROZENIA.md`, E2).
