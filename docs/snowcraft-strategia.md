# Snowcraft: strategia aplikacji i plan wdrożenia

Stan na 25.11.2026

## Cel i główna zasada

Jedna aplikacja rośnie od prototypu do kampanii i multiplayera, bez przepisywania od zera. Umożliwiają to dwie zasady:

- **Dane oddzielone od kodu:** mapy, poziomy, typy przeciwników i bonusy to pliki z danymi, nie liczby wpisane w kod.
- **Logika oddzielona od ekranu:** jądro gry nic nie wie o canvasie i dotyku. To samo jądro działa w grze, w edytorze map i później na serwerze multiplayera.

Technologia się nie zmienia: czysty HTML, CSS i JavaScript, hosting GitHub Pages, gra w przeglądarce telefonu. Zmieniamy tylko organizację kodu i danych.

## Stan obecny repozytorium

Repozytorium Snowball ma dobry punkt wyjścia: logika gry jest w osobnych plikach i prawie nie dotyka rysowania.

**Co jest dobre:**

- `ai.js`, `bonusy.js`, `stanowiska.js` i `przeszkody.js` nie używają canvasa ani elementów strony. To przyszłe jądro gry.
- Wszystkie liczby rozgrywki są w `config.js`.
- Czysty JavaScript bez narzędzi budowania, działa na GitHub Pages.
- Grafiki mają opisaną skalę i kotwice (`docs/README_GRAFIKI.md`, `sprites.json`).

**Co trzeba uporządkować:**

- Układ plansz jest wpisany na stałe w `config.js`: 6 dekoracji dla Areny, 18 dla Wielkiej areny, osobno pozycje stanowisk i startów.
- `Math.random` jest rozsiane po logice (ok. 19 miejsc w `ai.js`, `bonusy.js`, `game.js`, `tryby.js`, `stanowiska.js`). Multiplayer będzie wymagał losowości kontrolowanej przez serwer.
- Czas liczy się zmiennym krokiem z `requestAnimationFrame`. Dla multiplayera potrzebny będzie stały krok.
- `tryby.js` miesza logikę (zamieć, kamera) z menu i elementami strony.
- Nie ma żadnego zapisu danych, więc kampania nie ma gdzie trzymać postępów.
- Tło to jeden obraz 2400 × 1500 px, bez możliwości składania terenu.

## Decyzje architektoniczne

1. **Format mapy:** plik z danymi i polem `wersja`, w katalogu `mapy/`. Przejmuje układ z `config.js` (dekoracje, stanowiska, starty).
2. **Teren z kafelków** (decyzja z 25.11.2026): mapa ma warstwę terenu z siatki kafelków i zestawy kafelków w `assets/teren/`. Szczegóły w planie edytora.
3. **Opis dekoracji:** plik `dekoracje.json` z kategorią, rozmiarem i typem kolizji każdej dekoracji. Paleta edytora i gra czytają z niego.
4. **Poziom jako dane:** poziom = mapa + lista przeciwników + cel + bonusy. Kampania to kolejność poziomów.
5. **Jądro gry bez ekranu:** logika dostaje wejście (dotyk, czas) i zwraca stan świata. Rysowanie i dotyk są osobno.
6. **Stały krok czasowy** (np. 1/60 s) i własny generator losowości z ziarnem zamiast `Math.random`. Konieczne przed multiplayerem, a w edytorze i testach też pomaga (te same wyniki za każdym razem).
7. **Jeden edytor** dla telefonu i komputera, korzystający z kodu gry do rysowania i kolizji, żeby to, co widzisz w edytorze, było dokładnie tym, co zobaczysz w grze.
8. **Multiplayer:** serwer uruchamia to samo jądro gry w JavaScripcie (np. Cloudflare Workers). Telefony wysyłają dotyk i rysują stan otrzymany z serwera.

## Etapy wdrożenia

Każdy etap kończy się czymś, co działa na telefonie po otwarciu linku z GitHub Pages, bez błędów w konsoli, z commitem (zapisem zmian w historii) i wiedzą, jak to sprawdzić.

1. **Etap 1: umowa dla grafik i partia próbna.** Dopisać nowe kategorie (krzak, dom, ściana, pagórek, kafelki terenu) do `docs/README_GRAFIKI.md`. Zrobić 1–2 sztuki z każdej kategorii i 3 kafelki jednego zestawu. Wynik: pliki zgodne ze skalą, gotowe do testu w edytorze.
2. **Etap 2: format map i ładowanie z pliku.** Arena i Wielka arena przechodzą z `config.js` do `mapy/*.js`. Wprowadzamy `dekoracje.json`. Wynik: obie areny wyglądają i grają identycznie jak dziś.
3. **Etap 3: edytor map** (plan w osobnym dokumencie). Teren z kafelków, dekoracje, stanowiska, starty, eksport, przycisk „Zagraj". Wynik: mapa zrobiona na telefonie działa w grze.
4. **Etap 4: poziomy jako dane i wybór mapy w menu.** Poziom = mapa + przeciwnicy + cel + bonusy. Wynik: kilka poziomów z różnymi mapami.
5. **Etap 5: hurtowa produkcja grafik i map.** Dopiero po edytorze, kiedy wiadomo, jakie rozmiary i style pasują w kontekście. Wynik: pełne zestawy dekoracji i kafelków.
6. **Etap 6: kampania.** Kolejność poziomów, mapa kampanii odkrywana od prawej do lewej, zapis postępów w pamięci telefonu, bossowie i inne cele. Wynik: kampania do przejścia od początku do końca.
7. **Etap 7: PWA albo opakowanie w APK** (opcjonalnie). PWA to strona instalowana na ekranie głównym, z zapamiętanymi plikami (service worker). Wersja w każdym pliku, żeby telefon nie trzymał starej gry. Wynik: ikona na ekranie i pełny ekran.
8. **Etap 8: multiplayer.** Najpierw porządkowanie jądra (ziarno losowości, stały krok), potem serwer, na końcu tryb dwóch graczy. Wynik: dwie osoby grają w jednej grze przez internet. Zaczynamy po ukończeniu kampanii.

## Czego nie robimy

- **Nie przepisujemy gry** w silniku (Godot, Unity) ani natywnie na Androida. Obecna gra działa płynnie, a przepisanie oznacza pisanie od zera ponad 3600 linii działającego kodu.
- **Nie stawiamy serwera przed edytorem i kampanią.** Serwer powstaje raz, na gotowej grze.
- **Nie dopisujemy nowych map, poziomów ani typów do `config.js`.** Od etapu 2 nowe rzeczy idą do plików z danymi.
- **Nie robimy dwóch wersji edytora** (telefon i komputer). Jedna strona obsługuje dotyk i mysz.
- **Nie hurtujemy grafik przed edytorem.** Najpierw partia próbna.
- **Nie zapisujemy z przeglądarki bezpośrednio do repozytorium.** Wymagałoby to tokena dostępu w przeglądarce, co jest ryzykowne. Mapy eksportujemy plikiem.

## Ryzyka i słabe punkty

- **Edytor może rozrosnąć się ponad plan.** Wersja 1 ustawia tylko teren, dekoracje, stanowiska i starty. Triggery, cele i mapa kampanii dopiero później.
- **Multiplayer jest najtrudniejszy.** Opóźnienie internetu mobilnego (orientacyjnie 50–150 ms) będzie wyczuwalne przy rzucaniu w ruchome cele. Wymaga przewidywania ruchu i wygładzania. Dlatego robimy go na grze ukończonej i dobrze działającej.
- **Przebudowa pod multiplayer jest większym kosztem niż serwer.** Dziś cała logika działa na telefonie gracza. W multiplayerze o trafieniach decyduje serwer, a telefony wysyłają tylko dotyk.
- **Stare wersje po PWA.** Service worker zapamiętuje pliki, więc telefon może pokazywać starą wersję po zmianie kodu. Potrzebny numer wersji wymuszający odświeżenie.
- **Zapis map do repozytorium jest ręczny.** Edytor eksportuje plik, a do repo wgrywa go Claude Code. To celowy kompromis (brak tokena w przeglądarce), ale oznacza dodatkowy krok.
- **Grafiki w złej skali.** Już raz trzeba było zmniejszać gotowe grafiki. Dlatego partia próbna przed hurtem.
- **Kafelki bez przejść wyglądają kratkowo.** Miękkie granice (autotiling) są odkładane, więc pierwsze mapy będą mniej płynne wizualnie.

## Grafiki i koszt serwera

**Umowa dla grafik** (rozszerzenie `docs/README_GRAFIKI.md`):

- skala 2 piksele pliku = 1 jednostka pola, przezroczyste tło, bez wypalonych cieni (cienie rysuje kod),
- kotwica dekoracji to środek podstawy,
- nazwy `kategoria_numer`, np. `krzak_1`, `dom_2`, `sciana_1`, `pagorek_1`,
- kafelki terenu: kwadrat 100 × 100 px, bez cieni i bez elementów wystających poza krawędź, warianty jako osobne pliki.

**Kolejność:** partia próbna (1–2 sztuki z każdej nowej kategorii i 3 kafelki jednego zestawu) przed edytorem. Hurtowa produkcja dopiero po edytorze, kiedy widać rozmiary i styl na mapie.

**Orientacyjny koszt serwera multiplayera** (sprawdzone 24.11.2026, ceny mogą się zmienić):

| Opcja | Koszt | Uwagi |
| --- | --- | --- |
| Cloudflare Workers + Durable Objects, plan darmowy | 0 | [limity](https://developers.cloudflare.com/durable-objects/platform/pricing), m.in. 100 000 żądań dziennie. Po przekroczeniu limitu operacje kończą się błędem. |
| Cloudflare, plan płatny | od 5 USD miesięcznie | [cennik](https://developers.cloudflare.com/workers/platform/pricing/), opłata minimalna za konto |
| Własny VPS (np. Hetzner) | ok. 5,99 € miesięcznie | [przegląd](https://betterstack.com/community/guides/web-servers/hetzner-cloud-review/), z IPv4, bez VAT. Sam odpowiadasz za aktualizacje i restarty. |

Dla gry w gronie znajomych koszt hostingu to od 0 do ok. 25–30 zł miesięcznie. Większym kosztem jest przebudowa logiki pod serwer (ryzyka wyżej).

## Otwarte decyzje

Szczegóły edytora i pytania do ustalenia są w drugim dokumencie (plan budowy edytora map). Najważniejsze z nich wpływają na całą strategię:

- [ ] Obie areny (Arena i Wielka arena) od razu, czy najpierw jedna?
- [ ] Czy kafelki terenu mają wpływać na rozgrywkę (spowolnienie, ślizg), czy tylko na wygląd?
- [ ] Jaką kolizję mają mieć nowe obiekty (ściany, pagórki, domy)?
- [ ] Jakie zestawy kafelków na start (zima, noc, lodowisko, inne)?
- [ ] Jedna mapa na poziom, losowa mapa czy wybór w menu?
- [ ] Czy zostajemy przy regule, że przekątna Areny jest zawsze?
