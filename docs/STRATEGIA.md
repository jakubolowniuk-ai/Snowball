# Snowcraft: strategia

Stan na 26.11.2026. Ten dokument mówi **dokąd zmierzamy i dlaczego**. Co i w jakiej kolejności robimy, jest w `PLAN_WDROZENIA.md`. Jak pracujemy, jest w `INSTRUKCJA_WDRAZANIA.md`. Jak gra działa dziś, jest w `ZASADY_GRY.md`.

## Cel
Gra na telefon w przeglądarce dla Jakuba i znajomych, inspirowana grą Snowcraft (Nicholson NY, 1998). Jedna aplikacja rośnie od prototypu do kampanii i multiplayera, bez przepisywania od zera.

## Inspiracja: oryginał (fakty)
- Gra przeglądarkowa (Shockwave/Flash) z 1998 r., rozsyłana jako świąteczna kartka. Tylko jeden gracz przeciw komputerowi.
- Gracz steruje trzema czerwonymi chłopcami, komputer drużyną zielonych. Cel: wyeliminować całą drużynę przeciwną. Dwa trafienia ogłuszają, trzecie eliminuje.
- Sterowanie myszą: zaznaczony chłopiec z niebieskim pierścieniem, przytrzymanie ładuje siłę (pionowy pasek), puszczenie = rzut. Przeciwnik unosi śnieżkę nad głowę przed rzutem.
- Brak przeszkód, interfejs prawie żaden (napis „Level N”).
- **Nie kopiujemy grafik ani nazw z oryginału.** Wszystkie grafiki są własne.

## Zasady architektury
1. **Dane oddzielone od kodu.** Mapy, poziomy, typy przeciwników i bonusy to dane, nie liczby wpisane w kod. Dziś wszystkie są w `config.js`. Od etapu 2 mapy (a potem poziomy) przechodzą do osobnych plików z danymi.
2. **Logika oddzielona od ekranu.** Jądro gry (`ai.js`, `bonusy.js`, `stanowiska.js`, `przeszkody.js`, logika w `game.js`) nie używa canvasa ani dotyku. To samo jądro działa w grze, w edytorze map i później na serwerze multiplayera.
3. **Pliki danych to pliki `.js`, nie `.json`.** Przeglądarka blokuje wczytywanie plików JSON otwartych z dysku, a gra musi działać po otwarciu `index.html` bez konfiguracji. Dlatego dane mają postać `MAPY.arena_1 = { ... }` i wczytuje się je tagiem `<script>`. Tak już działają dane klatek (`sprites.json` przepisany do `obrazy.js`).

## Technologia (stała)
- Czysty HTML, CSS i JavaScript, bez frameworków i bez narzędzi budowania. Rysowanie na `<canvas>`.
- Hosting GitHub Pages (pliki statyczne, bez serwera).
- Sterowanie Pointer Events, wiele palców naraz.
- Tylko orientacja pozioma.

## Decyzje
| Data | Decyzja |
|---|---|
| 21.11 | Jeden zawodnik po stronie gracza. Drużyna 3 zawodników odłożona. |
| 21.11 | Dekoracje są przeszkodami (zatrzymują śnieżki i postacie). |
| 21.11 | Stały joystick do ruchu, drugi palec celuje w dowolny punkt. Siła zmienia tylko prędkość śnieżki. |
| 25.11 | Typy przeciwników jako profile kompromisów (koncepcja A), życia w składzie poziomu, nie w typie. |
| 25.11 | Teren map z kafelków, edytor map jako jedna strona dla telefonu i komputera. |
| 25.11 | Umiejętności z bonusów tylko dla typów elitarnych, poza poziomami 1–20. |
| 26.11 | Przeciwnik wybiera cel w trakcie zamachu (czas na reakcję gracza w typie). |
| 26.11 | W Wielkiej arenie przeciwnik rzuca tylko z odległości typu, bez zasady awaryjnej. |
| 26.11 | Zbijanie śnieżek jako cecha typu (kolor do wyboru). |

## Kierunek rozwoju (etapy)
Szczegóły i status każdego etapu: `PLAN_WDROZENIA.md`.
1. Umowa dla grafik i partia próbna (nowe kategorie, kafelki terenu).
2. Format map i ładowanie z pliku (Arena i Wielka arena z `config.js` do `mapy/`).
3. Edytor map (teren, dekoracje, stanowiska, starty, eksport, „Zagraj”).
4. Poziomy jako dane i wybór mapy w menu.
5. Hurtowa produkcja grafik i map.
6. Kampania (kolejność poziomów, mapa kampanii, zapis postępów, bossowie, inne cele).
7. PWA albo opakowanie w aplikację (opcjonalnie).
8. Multiplayer.

## Czego nie robimy
- **Nie przepisujemy gry** w silniku (Godot, Unity) ani natywnie na Androida. Gra działa płynnie, a przepisanie to pisanie od zera kilku tysięcy linii działającego kodu.
- **Nie robimy na razie:** PWA, dźwięku, multiplayera, zapisu postępów, drużyny kilku zawodników. Każda z tych rzeczy ma swój etap.
- **Nie stawiamy serwera** przed edytorem i kampanią.
- **Nie robimy dwóch edytorów** (telefon i komputer). Jedna strona obsługuje dotyk i mysz.
- **Nie hurtujemy grafik przed edytorem.** Najpierw partia próbna.
- **Nie zapisujemy z przeglądarki bezpośrednio do repozytorium** (wymagałoby tokena dostępu w przeglądarce). Mapy eksportujemy plikiem, do repozytorium wgrywa je Claude Code.

## Multiplayer (późny etap)
- Serwer uruchamia to samo jądro gry w JavaScripcie (kierunek: Cloudflare Workers z Durable Objects). Telefony wysyłają dotyk i rysują stan z serwera.
- Wymaga wcześniej: stałego kroku czasu (np. 1/60 s) i własnego generatora losowości z ziarnem zamiast `Math.random` (dziś losowanie jest w wielu miejscach logiki).
- Najłatwiejszy krok pośredni: dwóch graczy na jednym telefonie.
- Orientacyjny koszt (sprawdzone 24.11.2026, ceny mogą się zmienić):

| Opcja | Koszt | Uwagi |
|---|---|---|
| Cloudflare Workers + Durable Objects, plan darmowy | 0 | [limity](https://developers.cloudflare.com/durable-objects/platform/pricing), m.in. 100 000 żądań dziennie; po przekroczeniu operacje kończą się błędem |
| Cloudflare, plan płatny | od 5 USD miesięcznie | [cennik](https://developers.cloudflare.com/workers/platform/pricing/) |
| Własny VPS (np. Hetzner) | ok. 5,99 € miesięcznie | [przegląd](https://betterstack.com/community/guides/web-servers/hetzner-cloud-review/), sam odpowiadasz za aktualizacje |

Większym kosztem niż serwer jest przebudowa logiki: w multiplayerze o trafieniach decyduje serwer.

## Ryzyka
- **Edytor może rozrosnąć się ponad plan.** Wersja 1 ustawia tylko teren, dekoracje, stanowiska i starty.
- **Multiplayer jest najtrudniejszy.** Opóźnienie internetu mobilnego (orientacyjnie 50–150 ms) będzie wyczuwalne przy rzucaniu w ruchome cele.
- **Stare pliki w telefonie.** Przeglądarka pamięta pliki, dlatego każda zmiana kodu podbija numer wersji w `index.html` (`?v=`). Przy PWA ten problem będzie większy.
- **Grafiki w złej skali.** Już raz trzeba było zmniejszać gotowe grafiki, dlatego najpierw partia próbna.
- **Kafelki bez przejść wyglądają kratkowo.** Miękkie granice (autotiling) są odłożone.
- **Limity płótna w telefonie.** Duże bufory (np. teren Wielkiej areny) trzeba rysować w kawałkach albo w skali ekranu.
- **Dokumentacja rozjeżdża się z kodem.** Dlatego liczby są tylko w `config.js`, a dokumenty opisują mechanizmy.
