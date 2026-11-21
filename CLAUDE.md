# Snowcraft: instrukcje dla agenta

## O projekcie
Snowcraft to gra na telefon (przeglądarka) inspirowana klasyczną grą Flash z 1998 r. od Nicholson NY. Gracz (czerwony zawodnik) rzuca śnieżkami w przeciwników (zieloni, sterowani przez komputer). Gra jest dla właściciela projektu (Jakub) i jego znajomych. Dokładna specyfikacja jest w `docs/snowcraft-plan.md`. Przeczytaj ją przed rozpoczęciem pracy, a ten plik traktuj jako skrót. **Na razie gramy jednym zawodnikiem po stronie gracza.**

## Jak ze mną pracować (Jakub)
- Piszemy po polsku. Komentarze w kodzie też po polsku, proste i krótkie.
- Jakub dopiero uczy się programowania. Każdy nowy termin techniczny wyjaśnij jednym zdaniem przy pierwszym użyciu.
- Pracuj małymi krokami. Jeden krok = jedna działająca rzecz, którą Jakub może sprawdzić na telefonie. Nie rób wielu funkcji naraz.
- Przed większą zmianą pokaż krótki plan (kilka punktów) i poczekaj na zgodę.
- Jeśli widzisz słaby punkt pomysłu lub błąd w założeniach, powiedz to wprost, bez łagodzenia.
- Dawaj gotowy, działający kod, a nie podpowiedzi. To jest jego własny projekt, nie ćwiczenie.
- Nie dodawaj funkcji, o które nikt nie prosił. Zapytaj, gdy coś jest niejasne.
- Po każdym działającym kroku zrób commit (zapis zmian w historii) z krótkim opisem po polsku. Powiedz Jakubowi, jak sprawdzić grę.

## Technologia
- Czysty HTML, CSS i JavaScript. Bez frameworków i bez narzędzi budowania. Rysowanie na `<canvas>` (element HTML do rysowania grafiki 2D).
- Brak serwera. Hosting: GitHub Pages (darmowy hosting plików statycznych). Gra musi działać po otwarciu `index.html` bez żadnej dodatkowej konfiguracji.
- Sterowanie dotykiem przez Pointer Events (jedno API na dotyk i mysz). **Obsługuj wiele dotknięć naraz** (każdy palec rozpoznawaj po `pointerId`), bo gracz używa dwóch palców naraz. Wyłącz przewijanie i powiększanie gestem na canvasie (`touch-action: none`).
- Pole gry ma **stałe proporcje 2:1** (`ASPECT` w `config.js`) i jest skalowane tak, żeby mieściło się w ekranie telefonu w poziomie. Tło śnieżne wychodzi poza pole gry i wypełnia resztę ekranu. Wszystkie rozmiary liczymy względem szerokości pola gry, nie pikseli ekranu. Uwzględnij `devicePixelRatio` (ostrość). Gra tylko w poziomie, w pionie komunikat "Obróć telefon".
- Wszystkie liczby wpływające na rozgrywkę (czasy, prędkości, zasięgi, limity) trzymaj w jednym pliku `config.js`, żeby dało się je łatwo stroić.
- Struktura plików ma być prosta, kilka małych plików zamiast jednego wielkiego.
- Na razie nie robimy: PWA (instalacja jako aplikacja), dźwięku, multiplayera online, zapisu postępów, drużyny kilku zawodników.

## Zasady gry (skrót)
- Jeden zawodnik gracza, zawsze zaznaczony (niebieski owalny pierścień pod stopami). Przeciwników na poziomie N jest N (poziom 1: 1, poziom 2: 2, itd.).
- **Ruch:** za zawodnikiem jest **kropka (uchwyt)** w stałej odległości (ok. 1 cm), zawsze po lewej stronie (z tyłu, bo przeciwnicy są po prawej). Podczas przeciągania jest sztywno przyczepiona i się nie obraca. Dotknięcie kropki i przeciąganie porusza zawodnika (idzie za kropką, z limitem prędkości). Palec dotyka kropki, nie zawodnika, więc go nie zasłania.
- **Rzut:** drugi palec dotyka dowolnego punktu planszy (poza kropką). Znacznik celu jest dokładnie w miejscu dotyku, cienka linia łączy go z zawodnikiem. Przytrzymanie ładuje siłę (max 1,5 s). Siła zwiększa **prędkość i maksymalny zasięg** śnieżki. Puszczenie palca = rzut.
- **Lot śnieżki:** leci prosto do celu. Zatrzymuje się w punkcie celu albo na końcu zasięgu, jeśli jest bliżej. Dłuższe przytrzymanie nie sprawia, że leci za cel. Rysuj ją z cieniem na ziemi (efekt łuku), to tylko wygląd.
- Bez paska siły. Wzdłuż linii do celu rośnie pierścień zasięgu, a gdy sięga celu, zmienia kolor na zielony.
- **Połowy pola:** gracz chodzi tylko po lewej połowie, przeciwnicy tylko po prawej.
- Rzut można ładować w trakcie ruchu (jeden palec na kropce, drugi na planszy).
- Puszczenie palca bardzo blisko zawodnika anuluje rzut (promień w `config.js`).
- **Trafienia:** śnieżka trafia **każdego, kto stoi na jej drodze**. Pierwsze 2 trafienia ogłuszają na 1 s (`czasOgluszenia` w `config.js`, nie można wtedy ruszać się ani rzucać), trzecie eliminuje. Liczba trafień liczy się przez cały poziom. Dotyczy gracza i przeciwników.
- **Przeładowanie:** po rzucie 0,5 s plus czas ładowania siły (`czasPrzeladowania` w `config.js`). W tym czasie można się ruszać, ale nowe dotknięcie planszy nic nie rzuca. Odliczanie pokazuje pierścień pod stopami.
- **Przeciwnicy:** te same reguły co gracz. Przed rzutem unoszą śnieżkę nad głowę (ostrzeżenie), im silniejszy rzut, tym dłużej. Wyższe poziomy: lepsze uniki i celność.
- **Wygrana:** wyeliminowani wszyscy przeciwnicy. **Przegrana:** wyeliminowany zawodnik gracza.
- **Bonusy** (później): pojawiają się na planszy i aktywują się trafieniem śnieżką.

## Układ planszy
Wzorowany na oryginale: widok skośnie z góry, tło z grafiki `assets/tlo/tlo_plansza.png` z delikatnym niebieskawym przyciemnieniem poza polem i przy jego brzegach, cień pod postaciami. Dekoracje (choinki, bałwany, płotki, forty) z `assets/dekoracje/` (pozycje w `config.js`) są przeszkodami: śnieżka, która wjedzie w podstawę dekoracji (owal na ziemi), rozbija się o nią, a zawodnicy nie mogą przez nie przejść. Rysowanych zasp już nie ma. Postacie z grafik (`assets/gracze/`); okrąg trafień ma 1/16 szerokości pola (`rozmiarPostaci`), wygląd skaluje `skalaGrafik`. Interfejs minimalny: tylko napis "Level N" na środku przez 1–2 s. Wyeliminowani zostają leżeć na planszy do końca poziomu. Przy trafieniu: biała chmurka śniegu i krótka wibracja telefonu (`navigator.vibrate`, jeśli działa). Grafiki rysujemy własne i nie kopiujemy grafik z oryginału.

## Styl graficzny
Kreskówkowy, jak w oryginale, ale dopracowany. Na początku wystarczą proste kształty zastępcze (kółka, kolory). Grafikę dopracujemy dopiero, gdy rozgrywka będzie działać.

## Definicja "gotowe"
Krok jest gotowy, gdy: działa na telefonie po otwarciu linku z GitHub Pages, nie ma błędów w konsoli, zmiany są zapisane commitem, a Jakub wie, jak je sprawdzić.
