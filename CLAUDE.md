# Snowcraft: instrukcje dla agenta

## O projekcie
Snowcraft to gra na telefon (przeglądarka) inspirowana klasyczną grą Flash z 1998 r. od Nicholson NY. Dwie drużyny po 3 zawodników rzucają w siebie śnieżkami. Gracz prowadzi czerwonych, komputer zielonych. Gra jest dla właściciela projektu (Jakub) i jego znajomych. Dokładna specyfikacja jest w `docs/snowcraft-plan.md`. Przeczytaj ją przed rozpoczęciem pracy, a ten plik traktuj jako skrót.

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
- Sterowanie dotykiem przez Pointer Events (jedno API na dotyk i mysz, żeby można testować też na komputerze). Wyłącz przewijanie i powiększanie gestem na canvasie (`touch-action: none`).
- Stała logiczna wielkość planszy, skalowana do ekranu telefonu. Domyślnie orientacja pozioma, widok skośnie z góry jak w oryginale.
- Wszystkie liczby wpływające na rozgrywkę (czasy, prędkości, limity) trzymaj w jednym pliku `config.js`, żeby dało się je łatwo stroić.
- Struktura plików ma być prosta, kilka małych plików zamiast jednego wielkiego.
- Na razie nie robimy: PWA (instalacja jako aplikacja), dźwięku, multiplayera online, zapisu postępów.

## Zasady gry (skrót)
- Drużyna ma 3 zawodników. Poziom 1: 3 przeciwników, poziom 2: 5, dalej coraz więcej.
- Trafienia: pierwsze 2 ogłuszają zawodnika na 3 s (nie można nim sterować), trzecie go eliminuje. Liczba trafień liczy się przez cały poziom.
- Brak przeszkód w oryginale. U nas dojdą zimowe/świąteczne osłony, ale dopiero w późniejszym kroku.
- Gracz zaznacza jednego zawodnika naraz. Zaznaczony idzie w stronę palca trzymanego w jego pobliżu.
- **Pole rzutu** leży przed zaznaczonym zawodnikiem na linii zawodnik → cel, w stałej odległości, i porusza się razem z nim. Gest jednym palcem:
  - dotyk poza polem: zawodnik idzie,
  - wsunięcie palca na pole bez odrywania: zawodnik się zatrzymuje i ładuje siłę (max 1,5 s),
  - puszczenie palca na polu: rzut,
  - zsunięcie palca z pola przed puszczeniem: anulowanie rzutu.
  Gdy palec jest na polu, jego położenie jest zablokowane.
- Siła rzutu = prędkość śnieżki. Śnieżka leci przez całą planszę i trafia każdego na drodze, także swojego.
- Przeładowanie po rzucie: 3 s plus czas ładowania siły. W tym czasie zawodnik może się ruszać. Pole rzutu jest wygaszone i pokazuje odliczanie.
- Celowanie: dotknięcie przeciwnika lub bonusu zaznacza go jako cel. Limit zaznaczeń = liczba zawodników w drużynie. Rzut leci w najbliższy zaznaczony cel (a bez zaznaczenia w najbliższego przeciwnika). Gdy limit pełny, dotknięcie nowego celu odznacza zaznaczony cel najbliższy zaznaczonemu zawodnikowi. Ponowne dotknięcie zaznaczonego celu odznacza go.
- Niezaznaczeni zawodnicy gracza sami unikają śnieżek i sami rzucają. Skuteczność uników zależy od poziomu komputera (tak jak u przeciwników).
- Przeciwnicy mają te same reguły co gracz. Wyższe poziomy: lepsze uniki.

## Styl graficzny
Kreskówkowy, jak w oryginale, ale dopracowany. Na początku wystarczą proste kształty zastępcze (kółka, kolory). Grafikę dopracujemy dopiero, gdy rozgrywka będzie działać.

## Definicja "gotowe"
Krok jest gotowy, gdy: działa na telefonie po otwarciu linku z GitHub Pages, nie ma błędów w konsoli, zmiany są zapisane commitem, a Jakub wie, jak je sprawdzić.
