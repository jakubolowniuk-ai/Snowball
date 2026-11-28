# Snowcraft: instrukcje dla agenta

## O projekcie
Snowcraft (repozytorium Snowball) to gra na telefon w przeglądarce inspirowana klasyczną grą Flash z 1998 r. od Nicholson NY. Gracz (czerwony zawodnik) rzuca śnieżkami w drużynę przeciwników sterowaną przez komputer. Gra jest dla właściciela projektu (Jakub) i jego znajomych. **Gramy jednym zawodnikiem po stronie gracza** (wyjątek: bonus Sojusznik daje zawodnika sterowanego przez komputer).

## Dokumenty (przeczytaj, co dotyczy zadania)
- `docs/ZASADY_GRY.md`: jak gra działa dziś (mechanizmy, typy przeciwników, bonusy, tryby). **Czytaj przy każdym zadaniu dotyczącym rozgrywki.**
- `docs/INSTRUKCJA_WDRAZANIA.md`: jak pracujemy krok po kroku, testy, numer wersji, który dokument poprawić. **Czytaj przy każdym zadaniu z kodem.**
- `docs/PLAN_WDROZENIA.md`: etapy ze statusem, kroki (edytor map), pytania otwarte.
- `docs/STRATEGIA.md`: cel, zasady architektury, decyzje, czego nie robimy.
- `docs/GRAFIKI.md`: skala, kotwice, pliki grafik, umowa dla nowych grafik.
- `config.js`: wszystkie liczby rozgrywki (jedyne miejsce, gdzie są wartości).
- `mapy/*.js`, `dane/dekoracje.js` i `dane/teren.js`: układ plansz (świat, teren, dekoracje, stanowiska, starty) i opis dekoracji (rozmiar, kolizja). Nowe mapy i dekoracje idą tam, nie do `config.js`.
- `editor.html`, `edytor.js`, `edytorTeren.js` (narzędzia terenu), `edytor.css`: edytor map (osobna strona, nie ładuje game.js). Wspólne stałe gry i edytora są w `podstawy.js`; edytor ma własny numer `?v=` w `editor.html`.
- `docs/archiwum/`: stare plany i wykonane prompty, nieaktualne, tylko historia.

## Jak ze mną pracować (Jakub)
- Piszemy po polsku. Komentarze w kodzie też po polsku, proste i krótkie.
- Jakub dopiero uczy się programowania. Każdy nowy termin techniczny wyjaśnij jednym zdaniem przy pierwszym użyciu.
- Pracuj małymi krokami. Jeden krok = jedna działająca rzecz, którą Jakub może sprawdzić na telefonie. Nie rób wielu funkcji naraz.
- Przed większą zmianą pokaż krótki plan (kilka punktów) i poczekaj na zgodę.
- Jeśli widzisz słaby punkt pomysłu lub błąd w założeniach, powiedz to wprost, bez łagodzenia.
- Dawaj gotowy, działający kod, a nie podpowiedzi. To jest jego własny projekt, nie ćwiczenie.
- Nie dodawaj funkcji, o które nikt nie prosił. Zapytaj, gdy coś jest niejasne.
- Po każdym działającym kroku zrób commit (zapis zmian w historii) z krótkim opisem po polsku, wypchnij gałąź, załóż pull request do `main` i **na końcu odpowiedzi zawsze podaj link do scalenia**. Powiedz Jakubowi, jak sprawdzić grę.

## Technologia
- Czysty HTML, CSS i JavaScript. Bez frameworków i bez narzędzi budowania. Rysowanie na `<canvas>` (element HTML do rysowania grafiki 2D).
- Brak serwera. Hosting: GitHub Pages (darmowy hosting plików statycznych). Gra musi działać po otwarciu `index.html` bez żadnej dodatkowej konfiguracji. Dlatego dane w osobnych plikach mają postać plików `.js` (np. `MAPY.arena_1 = {...}`), nie `.json`: przeglądarka nie wczyta pliku JSON otwartego z dysku.
- **Przy każdej zmianie pliku `.js` lub `.css` podbij numer wersji `?v=` we wszystkich odnośnikach w `index.html`**, inaczej telefon może używać starych, zapamiętanych plików.
- Sterowanie dotykiem przez Pointer Events (jedno API na dotyk i mysz). **Obsługuj wiele dotknięć naraz** (każdy palec po `pointerId`), bo gracz używa dwóch palców naraz. Wyłącz przewijanie i powiększanie gestem na canvasie (`touch-action: none`).
- Pole gry ma **stałe proporcje 2:1** (`ASPECT` w `config.js`) i jest skalowane tak, żeby mieściło się w ekranie telefonu w poziomie. Tło wychodzi poza pole gry i wypełnia resztę ekranu. Wszystkie rozmiary liczymy względem szerokości pola gry, nie pikseli ekranu. Uwzględnij `devicePixelRatio` (ostrość). Gra tylko w poziomie, w pionie komunikat "Obróć telefon".
- Wszystkie liczby wpływające na rozgrywkę (czasy, prędkości, zasięgi, limity) trzymaj w `config.js`, z komentarzem po polsku. Dokumenty opisują mechanizmy i nazwy pól, nie przepisują wartości.
- Struktura plików ma być prosta, kilka małych plików zamiast jednego wielkiego. Logika (`ai.js`, `bonusy.js`, `stanowiska.js`, `przeszkody.js`) nie używa canvasa ani dotyku.
- Grafiki rysujemy własne i nie kopiujemy grafik z oryginału.

## Czego nie robić bez prośby Jakuba
- PWA, dźwięku, multiplayera online, zapisu postępów, drużyny kilku zawodników.
- Typów elitarnych (kolory 11–15) i kroków z `docs/PLAN_WDROZENIA.md`, o które Jakub nie poprosił.
- Odpowiedzi na pytania otwarte z planu: to decyzje Jakuba.

## Definicja "gotowe"
Krok jest gotowy, gdy: działa na telefonie po otwarciu linku z GitHub Pages, nie ma błędów w konsoli, zmiany są zapisane commitem i scalone przez pull request, a Jakub wie, jak je sprawdzić.
