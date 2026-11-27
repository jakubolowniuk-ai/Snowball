# Snowcraft: instrukcja wdrażania

Stan na 26.11.2026. Ten dokument mówi **jak pracujemy**: od pomysłu na czacie do działającej zmiany na telefonie. Dla agenta (Claude Code) i dla Jakuba.

## Mapa dokumentów
| Plik | Co zawiera | Kiedy czytać |
|---|---|---|
| `CLAUDE.md` | krótkie zasady pracy dla agenta i mapa dokumentów | agent czyta zawsze |
| `docs/ZASADY_GRY.md` | jak gra działa dziś (mechanizmy) | zadanie dotyczy rozgrywki |
| `docs/STRATEGIA.md` | cel, zasady architektury, decyzje, czego nie robimy | większe zmiany, nowe etapy |
| `docs/PLAN_WDROZENIA.md` | etapy ze statusem, kroki, pytania otwarte | wybór następnego kroku |
| `docs/INSTRUKCJA_WDRAZANIA.md` | ten plik | zawsze przy pracy nad krokiem |
| `docs/GRAFIKI.md` | skala, kotwice, pliki grafik, umowa dla nowych grafik | zadanie dotyczy grafik |
| `config.js` | **wszystkie liczby rozgrywki** | strojenie |
| `mapy/*.js`, `dane/dekoracje.js` | układ plansz (mapy) i opis dekoracji | zmiany plansz, edytor map |
| `docs/archiwum/` | stare plany i wykonane prompty | tylko do historii |

## Zasady pracy
1. **Rozmowa po polsku**, komentarze w kodzie po polsku, krótko. Każdy nowy termin techniczny wyjaśniony jednym zdaniem przy pierwszym użyciu (Jakub uczy się programowania).
2. **Małe kroki.** Jeden krok = jedna działająca rzecz do sprawdzenia na telefonie.
3. **Plan przed większą zmianą.** Kilka punktów, potem czekamy na zgodę Jakuba. Gdy Jakub zgodzi się na kilka kroków naraz, każdy krok i tak ma osobny commit.
4. **Słabe punkty mówimy wprost**, bez łagodzenia.
5. **Gotowy kod, nie podpowiedzi.** Nic ponad prośbę. Gdy coś jest niejasne, pytamy.
6. **Liczby tylko w `config.js`.** Dokumenty opisują mechanizmy i podają nazwy pól, nie przepisują wartości (inaczej się rozjeżdżają). Wyjątek: tabele planu (np. poziomy 1–20) jako zapis decyzji.

## Krok po kroku
1. **Przeczytaj** `CLAUDE.md`, potrzebne dokumenty z mapy i kod, którego dotyczy zmiana.
2. **Plan** (gdy zmiana jest większa niż poprawka jednej liczby) i zgoda Jakuba.
3. **Zmiana w kodzie**, liczby w `config.js` z komentarzem po polsku.
4. **Numer wersji:** przy każdej zmianie pliku `.js` albo `.css` podbij `?v=` we wszystkich odnośnikach w `index.html` (np. `?v=24` → `?v=25`). Bez tego telefon może używać starych, zapamiętanych plików.
5. **Test w przeglądarce** (niżej) i brak błędów w konsoli.
6. **Dokumenty:** popraw te, których dotyczy zmiana (tabela niżej).
7. **Commit** z krótkim opisem po polsku, jeden na krok.
8. **Wypchnięcie i pull request** do `main` (prośba o scalenie zmian). Link do scalenia podawaj Jakubowi **zawsze** na końcu skończonego zadania.
9. **Jak sprawdzić:** napisz Jakubowi, co i gdzie zobaczyć na telefonie (np. `poziomStartowy: 8`, Wielka arena).

**Gotowe** = działa na telefonie po otwarciu linku z GitHub Pages, bez błędów w konsoli, zmiana jest w commicie i scalona, Jakub wie, jak ją sprawdzić.

## Który dokument poprawić
| Zmiana | Popraw |
|---|---|
| Tylko liczba w `config.js` | nic (komentarz w `config.js`, jeśli zmienia sens) |
| Nowe albo zmienione zachowanie gry | `ZASADY_GRY.md` |
| Krok z planu zrobiony | `PLAN_WDROZENIA.md` (status, krótki wpis w „co jest zrobione”) |
| Nowa decyzja Jakuba | `STRATEGIA.md` (tabela decyzji), a jeśli zmienia plan, też `PLAN_WDROZENIA.md` |
| Nowe pytanie albo odpowiedź na pytanie otwarte | `PLAN_WDROZENIA.md` (pytania otwarte) |
| Nowa grafika albo zmiana skali | `GRAFIKI.md` |
| Zmiana sposobu pracy | ten plik i, jeśli trzeba, `CLAUDE.md` |

## Gałęzie i scalanie
- Agent pracuje na swojej gałęzi, wypycha ją i zakłada pull request do `main`. Jakub scala go na GitHubie („Merge pull request”, „Confirm merge”). GitHub Pages odświeża się w 1–2 minuty.
- Gdy pull request z gałęzi jest już scalony, następna praca zaczyna się od aktualnego `main` i ma nowy pull request.
- Agent nie scala sam i nie wypycha do `main`.

## Testowanie
**Narzędzia w `config.js`:**
- `poziomStartowy`: od którego poziomu zaczyna się gra z menu (po testach wróć do 1).
- `bonusy.wymusTyp`: id bonusu, każdy nowy bonus jest tego typu (po testach `null`).
- `tryby.wielkaArena.czasDoZwezania`: duża liczba wyłącza zamieć na czas testu długich poziomów.

**Test w przeglądarce (agent):** Chromium z Playwright otwiera `index.html` z dysku, klika „Arena” albo „Wielka arena”, sprawdza konsolę. Przez `page.evaluate` można zmieniać `CONFIG` przed startem, sprawdzać `stan` (np. `stan.przeciwnicy`, `stan.sniezki`) i podmieniać funkcje, żeby zapisywać zdarzenia (np. każdy rzut z odległością). Przed oddaniem zmiany: wszystkie poziomy 1–20 w obu arenach po kilka sekund bez błędów w konsoli.

**Strojenie celności (rozrzut):** przeciwnik celuje w punkt gracza z błędem losowym w kole o promieniu `rozrzut`. Śnieżka trafia, gdy jej tor przechodzi bliżej niż ok. 0,038 od środka gracza (promień postaci plus śnieżki), także gdy punkt celu jest za graczem. Dlatego prosty wzór P ≈ (0,038 / rozrzut)² zaniża wynik. Rozrzut dobieramy symulacją Monte Carlo (wiele losowych rzutów, liczymy odsetek trafień): punkty odniesienia 0,111 ≈ 30%, 0,084 ≈ 40%, 0,075 ≈ 45%, 0,058 ≈ 60%, 0,052 ≈ 70%, 0,049 ≈ 75%, 0,047 ≈ 80%, 0,038 ≈ 99% (gracz stoi, odległość rzutu ma mały wpływ).

**Test na telefonie (Jakub):** po scaleniu otwórz link z GitHub Pages. Gdy zmiany nie widać, odśwież stronę (numer `?v=` powinien to załatwić).

## Jak pisać prośby do agenta
- Wystarczy opis po polsku, co ma się zmienić i jak to poznać w grze. Agent sam pokaże plan.
- Dobrze działa: „Zrób krok X z PLAN_WDROZENIA.md”, „Sprawdź, dlaczego na poziomie 6 w Wielkiej arenie…”, „Ustalamy, niczego nie przerabiaj”.
- Gdy coś w grze wygląda źle, opisz: tryb (Arena/Wielka arena), poziom, kto (kolor), co robi i co powinien robić.

## Przed większym etapem
- Przejrzyj pytania otwarte w `PLAN_WDROZENIA.md` dotyczące tego etapu.
- Sprawdź, czy zasady z `STRATEGIA.md` (np. pliki danych jako `.js`) są zachowane w planie kroku.
