# Prompty dla agenta (Claude Code)

Każdy prompt wklejasz osobno, w osobnej rozmowie z agentem, i sprawdzasz grę na telefonie przed następnym. Agent czyta CLAUDE.md i docs/snowcraft-plan.md z `main`, więc **najpierw scal gałąź z dokumentacją** (pull request), inaczej nie zobaczy ustaleń. Po scaleniu zamiast wklejać cały prompt możesz napisać agentowi: „Wykonaj krok A1 z docs/PROMPTY_DLA_AGENTA.md".

## Stan na 25.11
Kroki A1–A4 i B2–B5 są zrobione i scalone w `main`. **Teraz obowiązuje część C na końcu pliku** (koncepcja typów A i 20 poziomów, test na Wielkiej arenie). Część C zastępuje ustalenia z A1/A3/A4 o życiach (życia są w składzie poziomu, nie w typie) i o Limonkowym (bez Laski cukrowej). Kroki wklejaj po kolei: C0 (opcjonalny), C1, C2, ..., C10.

## Zalecana kolejność (stara, kroki A i B zrobione)
1. **A1** typy + Zielony na poziomach 1–3
2. **A2** śnieżka nie trafia swoich
3. **A3** Limonkowy + poziomy 4–6
4. **A4** poziomy 7–12, rozmieszczenie, bonusy na wysokich poziomach
5. **B1** sześć bonusów: **już zrobione i scalone w `main`** (nie wklejaj). Prompt zostaje tylko jako zapis.
6. **B2** Niewidzialność
7. **B3** Miotacz
8. **B4** Wieżyczka
9. **B5** Sojusznik (najtrudniejszy, po A1–A4)

Wartości oznaczone „(propozycja)" nie były jeszcze zatwierdzone. Są w config.js, więc można je zmienić po teście.

---

## A1. Typy przeciwników + Zielony na poziomach 1–3

```
Zadanie: krok 1 systemu typów przeciwników. Wprowadź typy przeciwników ze stałymi parametrami i zrób pierwszy typ, Zielony, na poziomach 1–3 w Arenie.

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcje "Typy przeciwników" i "Karty typów"), potem ai.js, game.js, config.js, tryby.js. Pracuj wg zasad z CLAUDE.md: najpierw pokaż Jakubowi krótki plan (kilka punktów) i poczekaj na zgodę. Po zgodzie zrób jeden commit po polsku i powiedz, jak sprawdzić na telefonie. Komentarze po polsku, nowe terminy techniczne wyjaśnij jednym zdaniem. Wszystkie liczby w config.js. Nie dodawaj niczego, o co nie prosiłem.

CO ZROBIĆ
1. W config.js nowa sekcja `typy` z typem `zielony` (wartości niżej). Każdy przeciwnik dostaje `typ`, a jego parametry czytane są z typu, nie ze wspólnych ustawień. Gracz dalej używa wspólnych ustawień (nie zmieniaj jego zasad).
2. Parametry typu, które dziś są wspólne albo ustawiane na poziom, a mają być per typ: życia, czasOgluszenia, mnoznikPredkosci (przez istniejącą funkcję predkoscPostaci), postoj, krok, odlegloscRzutu, czasAwaryjny, przerwa, sila, zamachMin, rozrzut, szansaUniku, czasReakcji, mnoznikPrzeladowania, szansaBonusu, szansaStanowiska.
3. Poziomy 1–3 używają typu Zielony: poziom 1: 1 przeciwnik, 2: 2, 3: 3. Poziomy 4 i dalej mają działać DOKŁADNIE jak dotąd (zostają na tabeli `poziomy`), to rozwiązanie tymczasowe. Wygodnie zrobić to przez `skladPoziomow` w config (poziom → lista {typ, ile}); poziom bez wpisu = stare zachowanie.
4. Wielka arena: bez zmian w jej zasadach podchodzenia (zostaje odlegloscAI). Zielony ma tam po prostu działać z resztą parametrów typu. To świadoma różnica na ten krok (tam podchodzi na ok. 0,5, a nie na 5–6 ludzików); wspomnij o niej Jakubowi.
5. Rysowanie: draw.js (ok. linii 92) i animacje.js wybierają atlas postaci po drużynie (kolorGracza / kolorPrzeciwnika). Dodaj postaci pole `kolor` (z typu; gracz: kolorGracza) i użyj go przy rysowaniu. W obrazy.js ładuj atlasy dla kolorGracza i dla wszystkich kolorów z config.typy (sprites.json ma wszystkie 16 kolorów, a pliki assets/gracze/atlasy/<kolor>.webp istnieją).
6. Kropki żyć w draw.js (ok. linii 486) czytają dziś CONFIG.trafieniaDoEliminacji: zamień na liczbę żyć danej postaci.
7. trafienie() w game.js (ok. linii 90–101) używa CONFIG.trafieniaDoEliminacji i CONFIG.czasOgluszenia: zamień na wartości postaci (gracz dostaje je ze wspólnych ustawień, bez zmiany zasad).

ZIELONY (najsłabszy, Rekrut), WARTOŚCI DO config.js
- zycia: początkowe 2, +1 co 2 poziomy, max 4 (poziomy 1–2: 2, 3–4: 3, 5+: 4). Liczone z numeru poziomu przy starcie poziomu.
- czasOgluszenia 1.5 s
- rozmiar 1.15 (mnożnik hitboxu). UWAGA: PROMIEN_POSTACI jest użyty w wielu miejscach. Jeśli zmiana dotyka wielu miejsc, POMIŃ ten parametr i powiedz o tym Jakubowi.
- mnoznikPredkosci 0.7
- ruch: tylko krótkie kroki w stronę gracza. Długość kroku 0.05–0.09 szerokości pola, kierunek do gracza z losowym odchyleniem do ±25° (odchylenieKroku). Po kroku postój 1.0–1.5 s. W zasięgu rzutu stoi w miejscu, a gdy gracz się oddali, znów podchodzi. Dalej obowiązuje przekątna i przeszkody.
- odlegloscRzutu: losowa z zakresu 0.3125–0.375 szerokości pola (5–6 ludzików) przy każdej decyzji o rzucie. Rzuca tylko z tej odległości albo bliżej.
- zasada awaryjna: jeśli przez czasAwaryjny (5 s) nie jest w stanie podejść bliżej (np. gracz stoi daleko w prawym dolnym rogu, a on nie przekroczy przekątnej), rzuca z największej odległości, jaką da się osiągnąć.
- przerwa między rzutami 3.0–4.5 s
- sila 0.05–0.15 (śnieżka leci wolno)
- zamachMin 0.5 s: czas zamachu (animacja przed rzutem, ostrzeżenie) = max(zamachMin, sila × MAX_CHARGE)
- rozrzut 0.045 (ok. 70% trafień w stojącego gracza), celuje w aktualne miejsce gracza, bez wyprzedzania
- szansaUniku 0.15, czasReakcji 0.5 s, odskok jak dotąd
- mnoznikPrzeladowania 1.0
- szansaBonusu 0.1, szansaStanowiska 0 (nie używa stanowisk)

WAŻNE PUŁAPKI W KODZIE
- wykonajRzut(stan, z, celX, celY, czasLadowania) wylicza siłę z czasu ładowania (sila(czasLadowania)). Siła i czas zamachu mają być teraz dwiema osobnymi liczbami: przeciwnik losuje siłę z typu, a czas zamachu jest osobny. Nie zmieniaj tego dla gracza (jego siła dalej wynika z czasu przytrzymania). Przeładowanie przeciwnika liczone jak dotąd: czasPrzeladowania × mnoznikPrzeladowania + czas równoważny sile (sila × MAX_CHARGE).
- Życia i ogłuszenie zapisz na postaci (np. z.maxTrafien, z.czasOgluszenia), żeby nie ruszać zasad gracza.
- Miejsca, gdzie powstają przeciwnicy i czytane są parametry: nowaPostac(druzyna, start) (game.js ok. linii 17), zacznijPoziom (ok. linii 54–70), nowyStanAI(param) (ai.js ok. linii 11) i parametryPoziomu(stan), używane w ai.js (ok. linii 33) oraz game.js.
- Łańcuch mnożników przeładowania i przerwy (przeladowanieZeStanowiskiem, przerwaPoRzucie, mnoznikPrzeladowaniaBonusow, mnoznikSpowolnieniaPrzeladowania w bonusy.js) ma działać jak dziś. Mnożnik typu dochodzi do niego, nie zastępuje go. Bonus Pełna siła (wykonajRzut) nadal wymusza siłę 1.
- Poziomy 4+ i gracz muszą działać bez zmian. Po zmianie sprawdź, że poziom 4 i 5 zachowują się jak wcześniej.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (sekcja Przeciwnicy) i docs/snowcraft-plan.md (sekcje "Przeciwnicy według poziomów", 9. punkt mechaniki i "Karty typów"): opis typu Zielony przenieś z "planowanych" do "obecnych", zaznacz, że poziomy 4+ są jeszcze na starej tabeli.
- Powiedz Jakubowi, jak sprawdzić na telefonie:
  Arena, poziom 1: przeciwnik idzie w twoją stronę krótkimi krokami, staje na 1–1,5 s, zamachuje się (min. 0,5 s widoczny zamach) i rzuca z odległości ok. 5–6 ludzików. Śnieżka jest wolna. Stojącego gracza trafia mniej więcej 7 razy na 10, poruszającego się prawie nigdy. Dwa trafienia eliminują go na poziomie 1, a ogłuszony stoi 1,5 s.
  Poziom 3: trzech przeciwników, każdy ma 3 życia.
  Awaryjna: stań w prawym dolnym rogu i nie ruszaj się; po ok. 5 s przeciwnik rzuca z największej odległości, jaką da się osiągnąć.
```

---

## A2. Śnieżka nie trafia własnej drużyny

```
Zadanie: zawieś zasadę, że śnieżka trafia własną drużynę. Od teraz śnieżka nie trafia członków drużyny rzucającego.

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcja "Poziomy Areny"), potem game.js (lot śnieżki, sprawdzanie trafień). Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; potem jeden commit po polsku i powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby i przełączniki w config.js. Nie dodawaj niczego, o co nie prosiłem.

CO ZROBIĆ
- W lotSniezki (game.js, pętla po postaciach ok. linii 143–145, dziś pomija tylko rzucającego) pomijaj postacie z tej samej drużyny (pole `druzyna`) co rzucający. Odbite śnieżki Bombki mają `rzucajacy` = odbijający, więc zadziała to poprawnie. Przy okazji popraw nieaktualny komentarz o bonusach w tej funkcji. Dotyczy wszystkich trybów (Arena i Wielka arena) i wszystkich przeciwników, także stanów ogłuszenia i leżących wyeliminowanych.
- Nadal działa: trafianie drużyny przeciwnej, rozbijanie się o przeszkody, trafianie bonusów przez dowolną śnieżkę (tak jak dziś). Wachlarz Gwiazdki działa tak samo.
- W config.js przełącznik `trafianieSwoich: false` (true przywraca stare zachowanie).
- Sprawdź ai.js: jeśli coś zakłada, że swój przeciwnik blokuje linię rzutu, popraw to. Jeśli nic takiego nie ma, nie zmieniaj AI.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (sekcja Trafienia: "śnieżka trafia każdego na drodze" → "każdego z drużyny przeciwnej") i docs/snowcraft-plan.md (zasada jest już wprowadzona, nie planowana).
- Powiedz Jakubowi, jak sprawdzić: na poziomie 3 (trzech przeciwników) ustaw się tak, by jeden przeciwnik stał na linii rzutu drugiego. Śnieżka drugiego przelatuje przez pierwszego bez trafienia. Twoje śnieżki dalej trafiają każdego z nich.
```

---

## A3. Limonkowy + poziomy 4–6

```
Zadanie: dodaj typ Limonkowy (Zwiadowca) i użyj go na poziomach 4–6 Areny razem z Zielonym.

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md ("Typy przeciwników", "Karty typów", "Poziomy Areny"), potem config.js (sekcja typy i skladPoziomow) i ai.js. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; potem jeden commit po polsku i powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem.

CO ZROBIĆ
1. W config.js, w sekcji `typy`, dodaj typ `limonkowy` (kolor kurtki "limonkowy"; atlas assets/gracze/atlasy/limonkowy.webp ładuje i rysuje już mechanizm z kroku A1, tylko sprawdź, że Limonkowy poprawnie się rysuje i animuje).
2. W `skladPoziomow`: poziom 4: 3 Zielone + 1 Limonkowy, poziom 5: 3 Z + 2 L, poziom 6: 3 Z + 3 L. Poziomy 7 i dalej zostają na starej tabeli `poziomy` (jak dotąd).

LIMONKOWY, WARTOŚCI
- zycia: 3 stałe (nie zależą od poziomu)
- czasOgluszenia 1.2 s, rozmiar 1.0
- umiejętność stała "Laska cukrowa": mnoznikPredkosci 1.4. Z pola 0,3 daje 0,42, czyli szybszy niż gracz bez bonusu. To zamierzone (to Zwiadowca).
- ruch: postój 0.5–1.0 s, krok 0.08–0.12 szerokości pola, w stronę gracza z odchyleniem do ±25°. W zasięgu rzutu stoi, gdy gracz odejdzie, znów podchodzi.
- odlegloscRzutu 0.375–0.4375 (6–7 ludzików), ta sama zasada awaryjna po 5 s co u Zielonego
- przerwa 3.0–4.5 s
- sila 0.1–0.3
- zamachMin 0.4 s
- rozrzut 0.042 (ok. 80% trafień w stojącego), bez wyprzedzania
- szansaUniku 0.3, czasReakcji 0.6 s
- mnoznikPrzeladowania 1.0
- szansaBonusu 0.2, szansaStanowiska 0.1
Cena umiejętności: słabsze śnieżki i rzadsze rzuty niż to, co sugeruje szybkość.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md: karta Limonkowego jest zrobiona, poziomy 4–6 mają nowy skład.
- Powiedz Jakubowi, jak sprawdzić: Arena, poziom 4 (trzy Zielone i jeden Limonkowy): Limonkowy porusza się szybciej, ma krótsze postoje, rzuca z odległości 6–7 ludzików, jego śnieżki są wolne. Poziomy 5 i 6 mają kolejnych Limonkowych. Poziom 7 i dalej działa jak dotąd.
```

---

## A4. Poziomy 7–12 i rozmieszczenie na starcie

```
Zadanie: dokończ poziomy Areny 7–12 z Zielonymi i Limonkowymi, rozmieść wszystkich przeciwników na starcie i dopasuj bonusy do dużej liczby przeciwników.

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md ("Poziomy Areny"), potem game.js (pozycjePrzeciwnikow, zacznijPoziom), config.js, ai.js, bonusy.js, tryby.js. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; jeden commit po polsku; powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem. Jeśli któryś punkt okaże się nieproporcjonalnie duży, powiedz o tym i zaproponuj, co pominąć.

CO ZROBIĆ
1. skladPoziomow: poziom 7: 3Z+4L, 8: 4Z+4L, 9: 4Z+5L, 10: 5Z+5L, 11: 5Z+6L, 12: 6Z+6L (Z = Zielony, L = Limonkowy). Poziom 13 i dalej używa składu poziomu 12.
2. Wszyscy przeciwnicy wchodzą od razu. Opcjonalny `maxNaraz` w config (domyślnie null = bez limitu). Jeśli ustawiony na liczbę, reszta czeka i wchodzi po 2 s od eliminacji któregoś, a poziom kończy się, gdy nie ma nikogo ani w kolejce. Jeśli to zbyt skomplikowane, pomiń i zgłoś.
3. Rozmieszczenie na starcie: do 6 przeciwników na linii jak dotąd (liniaPrzeciwnikow), kolejni w drugim i trzecim rzędzie równoległym do przekątnej, bliżej lewego górnego rogu (co ok. 0.15 w liczbie liniaPrzeciwnikow), naprzemiennie przesunięci. Odstęp między dwiema postaciami co najmniej 1.2 × rozmiarPostaci. Wszyscy w lewym górnym trójkącie, poza przeszkodami.
4. Sprawdź, czy postacie się wzajemnie blokują. Jeśli nie i na planszy zrobi się nieczytelny tłum, dodaj bardzo miękkie odpychanie postaci (tylko przeciwników od siebie), ale tylko jeśli to konieczne i proste.
5. Rozłożenie pierwszych rzutów: pierwszy rzut każdego przeciwnika po napisie "Level N" + zwykła przerwa + losowe 0–3 s (`opoznienieStartuMax`), żeby nie rzucali naraz.
6. Bonusy w Arenie: maxNaraz [1, 1, 2, 2, 3] dla poziomów 1–5, dalej 3.
7. Wielka arena: liczba przeciwników = suma ze składu × mnoznikPrzeciwnikow, typy jak w składzie. Jej zasady podchodzenia (odlegloscAI) bez zmian.
8. Gdy nic już nie używa starej tabeli `poziomy` (sprawdź grepem), usuń ją z config.js i z ai.js/game.js. Jeśli coś jeszcze z niej korzysta, zostaw i napisz, co.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (Zasady gry: poziom N = N przeciwników, typy, skład) i docs/snowcraft-plan.md.
- Powiedz Jakubowi, jak sprawdzić: poziomy 7–12 w Arenie, czy przeciwnicy nie nakładają się na starcie, czy gra jest czytelna na telefonie, czy nie ma błędów w konsoli i czy poziom 12 jest do przejścia. Zaproponuj, co zmienić w config, jeśli poziomy 10–12 są nieczytelne (np. maxNaraz).
```

---

## B1. Sześć bonusów (ZROBIONE, nie wklejaj)

```
Zadanie: dodaj 5 nowych bonusów i zmień Bombkę. Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcja "Planowane bonusy"), potem bonusy.js, config.js (sekcja bonusy), game.js i ai.js.

ZASADY PRACY (z CLAUDE.md)
- Najpierw pokaż Jakubowi krótki plan 6 kroków poniżej (kilka punktów) i poczekaj na zgodę.
- Jeden krok = jeden bonus = jeden commit po polsku. Po każdym kroku powiedz Jakubowi, jak to sprawdzić na telefonie, i poczekaj na jego "dalej". Nie rób kilku kroków naraz.
- Wszystkie liczby w config.js. Komentarze po polsku, krótkie. Każdy nowy termin techniczny wyjaśnij jednym zdaniem.
- Nie dodawaj niczego, o co nie prosiłem. Nie rób niewidzialności, Miotacza, Wieżyczki ani Sojusznika.
- Działa w Arenie i w Wielkiej arenie. Przeciwnicy zbierają nowe bonusy tak samo jak obecne (istniejąca logika szansaBonusu). Gdy przeciwnik zbierze bonus, który działa na "przeciwną drużynę", działa on na gracza.
- Wygląd zastępczy: kolorowa kula (grafika: null), ikona z odliczaniem nad głową jak przy obecnych bonusach. Nowy poziom czyści wszystkie efekty. Wyeliminowanych postaci efekty nie obejmują.

NA POCZĄTEK (mała pomoc do testów)
W config.js, w sekcji bonusy, dodaj opcję wymusTyp (domyślnie null). Gdy ustawiona na id bonusu (np. "kakao"), każdy pojawiający się bonus jest tego typu. Dzięki temu Jakub sprawdza każdy bonus bez czekania na los. Wymień ją w opisie commitu.

KROK 1: KAKAO (id "kakao", kolor #6b3f26, waga 3)
- Przeładowanie ×0,3 przez 10 s (czasTrwania 10, mnoznikPrzeladowania 0,3 w config).
- Zbiera się z mnożnikami stanowisk tak: weź najmniejszy z mnożników (stos, armatka, kakao), nie mnóż ich przez siebie. Zapisz to w komentarzu.

KROK 2: PEŁNA SIŁA (id "pelnaSila", kolor #ff8c1a, waga 3)
- Przez 10 s albo 10 rzutów (co pierwsze) każdy rzut leci z maksymalną siłą (czyli prędkością), nawet po krótkim dotknięciu.
- Przeładowanie liczy się od faktycznego czasu przytrzymania (0,5 s + ile realnie trzymał), nie od 1,5 s. To jest sens bonusu: szybkie, mocne rzuty.
- Przeciwnicy: rzut z pełną siłą, ale czas zamachu (ostrzeżenie) bez zmian.
- Gwiazdka (wachlarz) liczy się jako jeden rzut.

KROK 3: SPOWOLNIENIE PRZECIWNIKÓW (id "spowolnieniePrzeciwnikow", kolor #7fd6ff, waga 2)
- Zbiera go ktoś z jednej drużyny, a efekt dostają wszyscy żywi z drużyny przeciwnej na 8 s.
- Mają wolniejsze chodzenie (mnoznikPredkosci 0,5) i wolniejsze przeładowanie (mnoznikPrzeladowania 2). Wartości w config.
- Ikona z odliczaniem nad głową każdego spowolnionego. Ponowne zdobycie odnawia czas.
- Przy przeładowaniu: najpierw najmniejszy mnożnik (stos/armatka/kakao), potem pomnóż przez mnożnik spowolnienia.

KROK 4: SPOWOLNIENIE ŚNIEŻEK (id "spowolnienieSniezek", kolor #3acfb0, waga 2)
- Zbiera ktoś z jednej drużyny. Przez 8 s wszystkie śnieżki rzucone przez drużynę przeciwną lecą o połowę wolniej (mnoznikPredkosci 0,5), także te, które już lecą.
- Ikona z odliczaniem nad zbierającym. Zakończenie efektu nie "teleportuje" śnieżek, po prostu wracają do zwykłej prędkości.

KROK 5: BOMBKA ODBIJAJĄCA (zmiana istniejącej Bombki)
- Zamiast pochłaniać trafienie, odbija śnieżkę w rzucającego: nowa śnieżka leci od trafionego do miejsca, gdzie stoi rzucający w chwili odbicia, z tą samą prędkością. Pierwotna znika. Bombka pęka jak teraz (jedno odbicie, max 12 s).
- Odbita śnieżka liczy się jako rzucona przez drużynę odbijającego: trafia drużynę przeciwną (w tym rzucającego) i, jeśli zasada trafiania swoich jest włączona, także własną. Oznacz ją jako "odbita": nie może zostać odbita ponownie (trafia normalnie).
- Dodaj w config przełącznik bombka.odbija (true), false przywraca stare pochłanianie.

KROK 6: UPICIE (id "upicie", kolor #a64ad6, waga 2)
- Trafiony bonus wybucha w miejscu, gdzie leży. Nikt go nie "zbiera". Wszyscy żywi w promieniu promienUpicia (0,12 szerokości pola) są upici na 10 s: wszystkie drużyny, także ten, kto rzucił, jeśli stoi w kręgu.
- Upity: kierunek ruchu jest skręcany o losowy kąt (do ±80°), zmieniany płynnie co 0,3–0,6 s. Gracz trzyma pad, ale postać idzie nie tam, gdzie chce. Przeciwnik też. Granice, przekątna i przeszkody działają jak zawsze. Rzucanie bez zmian.
- Wybuch: widoczny rozszerzający się fioletowy krąg o tym promieniu (czasChmurki). Nad upitym ikona z odliczaniem.
- Wartości w config: sekcja upicie { promien, czasTrwania, maxSkret, zmianaCo: [min, max] }.

PO KAŻDYM KROKU
- Zaktualizuj opis w CLAUDE.md (sekcja Bonusy) i w docs/snowcraft-plan.md: przenieś zrobiony bonus z "Planowanych" do opisu obecnych.
- Sprawdź brak błędów w konsoli i że obie areny działają.
```

---

## B2. Niewidzialność

```
Zadanie: dodaj bonus Niewidzialność.

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcja "Planowane bonusy"), potem bonusy.js, game.js, ai.js, draw.js, config.js. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; jeden commit po polsku; powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem. Jeśli w config.js jest opcja bonusy.wymusTyp, użyj jej do testów.

OPIS
- id "niewidzialnosc", waga 1 (rzadki). Ikona jest już w assets/bonusy/niewidzialnosc.png (patrz docs/README_BONUSY.md): ustaw ją w polu `grafika` typu w config.js; kolor zastępczy #bfe9ff zostaje na wypadek braku obrazka.
- Zbiera go ten, kto go trafi śnieżką, jak inne bonusy. Działa na zbierającego przez czasTrwania (propozycja 6 s, w config).
- Wygląd: zbierający jest półprzezroczysty (alfa ok. 0.35, w config). Gracz widzi siebie półprzezroczystego. Gdy niewidzialny jest przeciwnik, gracz też widzi go półprzezroczystego (nie znika całkowicie).
- Rzut nie odsłania niewidzialności. Po upływie czasu postać znów jest w pełni widoczna.
- AI: gdy cel (gracz) jest niewidzialny, przeciwnik nie wie, gdzie jest. Zapamiętuje pozycję, w której gracz był w chwili rozpoczęcia niewidzialności, i rzuca w losowy punkt w kole o promieniu promienPoszukiwania (propozycja 0.12 szerokości pola, w config) wokół niej. Gdy niewidzialność się skończy, wraca do zwykłego celowania.
- Przeciwnicy zbierają ten bonus tak jak inne (szansaBonusu typu).
- Działa w Arenie i Wielkiej arenie. Nowy poziom czyści efekt. Wyeliminowanych nie obejmuje.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (Bonusy) i docs/snowcraft-plan.md: przenieś Niewidzialność z "Planowanych" do obecnych.
- Powiedz Jakubowi, jak sprawdzić: ustaw wymusTyp na "niewidzialnosc", zdobądź bonus, zobacz półprzezroczystą postać i że przeciwnicy rzucają w okolice, a nie dokładnie w ciebie; po ok. 6 s znów jesteś widoczny.
```

---

## B3. Miotacz

```
Zadanie: dodaj bonus Miotacz (armatka ręczna).

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcja "Planowane bonusy"), potem bonusy.js, game.js, input.js, ai.js, config.js. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; jeden commit po polsku; powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem. Jeśli w config.js jest opcja bonusy.wymusTyp, użyj jej do testów.

OPIS
- id "miotacz", waga 2. Ikona jest już w assets/bonusy/miotacz.png (patrz docs/README_BONUSY.md): ustaw ją w polu `grafika` typu w config.js; kolor zastępczy #ff9a2e zostaje na wypadek braku obrazka.
- Zbierający dostaje 20 gałek (amunicja w config).
- Sterowanie: drugi palec dotyka punktu planszy i trzyma. Dopóki trzyma, postać strzela co odstepStrzalow (propozycja 0.3 s) w punkt pod palcem; jeśli palec się przesuwa, celuje w aktualny punkt. Puszczenie palca = koniec strzelania, amunicja zostaje.
- Bez ładowania siły: każdy strzał leci z siłą silaStrzalu (propozycja 0.7, w config). Bez przeładowania między strzałami, ale po zakończeniu bonusu wraca zwykłe przeładowanie.
- Bonus wygasa, gdy skończą się gałki albo po bezpiecznik czasowy czasMax (propozycja 20 s, do potwierdzenia przez Jakuba).
- Licznik gałek nad postacią jak przy armatce. Wachlarz Gwiazdki to jedna gałka.
- Przeciwnicy: zbierający Miotacz strzela seriami po seriaAI (5) strzałów co odstepStrzalow w gracza z rozrzutem swojego typu, potem robi zwykłą przerwę swojego typu, do wyczerpania amunicji.
- Działa w Arenie i Wielkiej arenie. Nowy poziom czyści efekt.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md: przenieś Miotacz z "Planowanych" do obecnych.
- Powiedz Jakubowi, jak sprawdzić: wymusTyp "miotacz"; po zdobyciu przytrzymaj palec na planszy, a śnieżki lecą seriami, licznik maleje; puszczenie przerywa strzelanie.
```

---

## B4. Wieżyczka

```
Zadanie: dodaj bonus Wieżyczka (armatka automatyczna).

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcja "Planowane bonusy"), potem bonusy.js, stanowiska.js, game.js, draw.js, config.js. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; jeden commit po polsku; powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem. Jeśli w config.js jest opcja bonusy.wymusTyp, użyj jej do testów. To nowy rodzaj obiektu w grze: jeśli plan wyjdzie duży, zaproponuj podział na dwa commity i poczekaj na zgodę.

OPIS
- id "wiezyczka", waga 1 (rzadki). Ikona bonusu jest już w assets/bonusy/wiezyczka.png (patrz docs/README_BONUSY.md): ustaw ją w polu `grafika` typu w config.js; kolor zastępczy #6e6e7a zostaje na wypadek braku obrazka. Samą wieżyczkę na planszy na razie rysuj kodem (prosta bryła), bez grafiki.
- Trafiony bonus nie jest "zbierany": w jego miejscu pojawia się wieżyczka drużyny tego, kto trafił.
- Wieżyczka ma 3 życia (trafienie przeciwnika odejmuje życie, nie ogłusza; po trzecim znika z chmurką) i 30 gałek. Strzela co odstepStrzalow (3 s, w config) w losowy żywy cel przeciwnej drużyny, z większym prawdopodobieństwem w najbliższego (np. 60% najbliższy, reszta losowo), z siłą silaStrzalu 0.5 i rozrzutem 0.05 (propozycje, w config). Śnieżki rozbijają się o przeszkody jak każde inne.
- Nie blokuje ruchu ani śnieżek własnej drużyny. Śnieżki drużyny przeciwnej ją trafiają (promień trafienia 0.025). Własnej drużyny nie trafia (jeśli włączona jest zasada niehitowania swoich).
- Najwyżej jedna wieżyczka na drużynę: nowa zastępuje starą.
- Licznik gałek nad wieżyczką, kropki żyć jak przy postaciach. Gdy skończą się gałki, zostaje jako dekoracja bez efektu, aż ją zniszczą albo skończy się poziom.
- Przeciwnicy też zbierają ten bonus: wieżyczka drużyny przeciwników strzela w gracza.
- Działa w Arenie i Wielkiej arenie (poza granicą zamieci znika z chmurką jak inne rzeczy). Nowy poziom usuwa wieżyczki.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md: przenieś Wieżyczkę z "Planowanych" do obecnych.
- Powiedz Jakubowi, jak sprawdzić: wymusTyp "wiezyczka"; po trafieniu bonusu pojawia się wieżyczka i co 3 s strzela w przeciwników; po trzech trafieniach przeciwników znika.
```

---

## B5. Sojusznik

```
Zadanie: dodaj bonus Sojusznik (zawodnik sterowany przez komputer po stronie zbierającego).

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md ("Planowane bonusy", "Typy przeciwników", "Karty typów"), potem bonusy.js, game.js, ai.js, draw.js, animacje.js, config.js. To największy krok: jeśli plan wyjdzie za duży, zaproponuj podział na dwa commity (1: sojusznik jako postać z AI, 2: przeciwnicy celują też w niego) i poczekaj na zgodę. Pracuj wg zasad z CLAUDE.md: pokaż Jakubowi krótki plan i poczekaj na zgodę; jeden commit po polsku; powiedz, jak sprawdzić na telefonie. Komentarze po polsku. Liczby w config.js. Nie dodawaj niczego, o co nie prosiłem. Jeśli w config.js jest opcja bonusy.wymusTyp, użyj jej do testów. Wykonuj dopiero po krokach A1–A4 (system typów musi istnieć).

OPIS
- id "sojusznik", waga 1 (rzadki). Ikona jest już w assets/bonusy/czapka.png (patrz docs/README_BONUSY.md): ustaw ją w polu `grafika` typu w config.js; kolor zastępczy #d93a3a zostaje na wypadek braku obrazka.
- Zbiera go ten, kto go trafi śnieżką. Obok zbierającego pojawia się nowy zawodnik jego drużyny, sterowany przez AI (ten sam kod co przeciwnik, tylko po stronie zbierającego), z 3 życiami, do końca poziomu.
- Wygląd i parametry: sojusznik gracza ma czerwoną kurtkę (czerwony oznacza naszą drużynę) i parametry losowego typu z config.typy. Sojusznik przeciwników to po prostu kolejny przeciwnik losowego typu (z własnym kolorem kurtki).
- AI sojusznika: tak jak przeciwnik, ale celuje w najbliższego żywego przeciwnika; porusza się w swojej części pola (po swojej stronie przekątnej w Arenie). Zbiera bonusy i używa stanowisk według parametrów typu.
- Przeciwnicy muszą umieć celować też w sojusznika gracza: cel to najbliższy żywy członek drużyny przeciwnej (gracz albo sojusznik).
- Wygrana: wszyscy przeciwnicy wyeliminowani. Przegrana: tylko wyeliminowany zawodnik gracza (sojusznik nie wpływa na przegraną).
- Najwyżej jeden sojusznik naraz na drużynę; bonus nie losuje się, gdy drużyna go ma. Nowy poziom usuwa sojusznika.
- Działa w Arenie i Wielkiej arenie.

UWAGA NA KOD
- Wiele miejsc iteruje po [stan.gracz, ...stan.przeciwnicy] (animacje.js, bonusy.js, draw.js, game.js, tryby.js, razem ok. 11). Wprowadź jedną funkcję zwracającą wszystkie postacie (np. wszystkiePostacie(stan)) i użyj jej zamiast kopiować logikę. sprawdzKoniec w game.js sprawdza stan.przeciwnicy.every(...), więc sojusznik gracza nie może trafić do tej listy. Sojusznik przeciwników (gdy zbierze go przeciwnik) to zwykły dodatkowy przeciwnik i też musi zostać wyeliminowany do wygranej.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (zasada "gramy jednym zawodnikiem" dostaje wyjątek: Sojusznik jest sterowany przez komputer) i docs/snowcraft-plan.md: przenieś Sojusznika z "Planowanych" do obecnych.
- Powiedz Jakubowi, jak sprawdzić: wymusTyp "sojusznik"; po trafieniu bonusu obok ciebie pojawia się czerwony zawodnik, który sam rzuca w przeciwników; przeciwnicy celują także w niego; przegrywasz tylko po wyeliminowaniu ciebie.
```


---

# CZĘŚĆ C: koncepcja typów A i 20 poziomów (test na Wielkiej arenie)

Wspólne zasady dla każdego kroku C (są też w CLAUDE.md): najpierw krótki plan i zgoda Jakuba, jeden commit po polsku, komentarze po polsku, nowe terminy techniczne wyjaśnione jednym zdaniem, wszystkie liczby w config.js, nic ponad prośbę, na końcu napisz Jakubowi, jak sprawdzić na telefonie. Wartości oznaczone „(start)" są wstępne: Jakub stroi je po graniu w config.js. Rozrzut podany niżej to wartość startowa: sprawdź symulacją jak w kroku A1, ile trafień w stojącego daje, i popraw tak, by wyszedł podany cel w procentach.

## C0. Poziom startowy do testów (opcjonalny)

```
Zadanie: opcja testowa w config.js, dzięki której można zacząć grę od wybranego poziomu.

Najpierw przeczytaj CLAUDE.md, potem game.js (start gry, przejście do następnego poziomu) i tryby.js (start z menu). Pokaż krótki plan i poczekaj na zgodę.

CO ZROBIĆ
1. W config.js: `poziomStartowy: 1` (komentarz: do testów, np. 15 zaczyna grę od poziomu 15, po wygranej idzie 16 itd.).
2. Przy starcie gry z menu (Arena i Wielka arena) pierwszy poziom to poziomStartowy. Nic innego się nie zmienia (restart po przegranej jak dotąd).
3. Zaktualizuj CLAUDE.md jednym zdaniem.

Powiedz Jakubowi, jak sprawdzić: ustaw poziomStartowy: 8, wejdź w Arenę, na ekranie powinno być "Level 8".
```

## C1. Życia w składzie poziomu, Limonkowy bez Laski, poziomy 1–5

```
Zadanie: życia przeniesione do składu poziomu, Limonkowy bez Laski cukrowej, nowe poziomy 1–5 (obie areny).

Najpierw przeczytaj CLAUDE.md i docs/snowcraft-plan.md (sekcje "Koncepcja typów A" i "Poziomy Areny 1–20"), potem config.js, game.js (typyPoziomu, tworzenie postaci, zacznijPoziom, trafienie), draw.js (kropki żyć) i bonusy.js (Sojusznik). Pracuj wg zasad z CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. Życia nie są już parametrem typu. Wpis składu poziomu ma postać { typ, ile, zycia } (zycia = liczba trafień do eliminacji). Usuń `zycia` z typów `zielony` i `limonkowy` (także wzór { poczatkowe, coIlePoziomow, max }). Ten sam typ może wystąpić w jednym poziomie w kilku wpisach z różnymi życiami (np. Zielone po 3 i po 2 życia).
2. typyPoziomu zwraca listę obiektów { typ, zycia } (dalej przeplatane między wpisami, żeby przy limicie maxNaraz weszły różne typy), a zacznijPoziom i kolejka przepisują zycia na postać. Sprawdź grepem `zycia` i `maxTrafien` w całym kodzie, w tym w bonusie Sojusznik (jego `zycia: 3` z config.bonusy zostaje, ale nie może czytać żyć z typu).
3. Życie 1 oznacza, że pierwsze trafienie od razu eliminuje, bez fazy ogłuszenia. Sprawdź, że animacja eliminacji, kropki żyć w draw.js (jedna kropka) i ekran końca poziomu działają.
4. Limonkowy: zdejmij "Laskę cukrową": mnoznikPredkosci 1.0 (było 1.4). Nazwa "Limonkowy (Standard)", popraw komentarze. Reszta parametrów bez zmian.
5. skladPoziomow: usuń stare wpisy 1–12 i wpisz poziomy 1–5:
   1: zielony 2 szt. po 1 życiu
   2: zielony 4 po 1
   3: zielony 2 po 1 + limonkowy 1 po 1
   4: zielony 3 po 1 + limonkowy 2 po 1
   5: zielony 3 po 2 + limonkowy 2 po 1
   Poziom 6 i dalej na razie bez wpisów, czyli biorą skład poziomu 5 (tymczasowo; kolejne kroki dopisują poziomy do 20).
6. maxNaraz w config.js: 8 (było 6).
7. Wielka arena używa tego samego składu (mnoznikPrzeciwnikow 1). Nic więcej się w niej nie zmienia.

PO ZMIANIE
- Zaktualizuj CLAUDE.md (Zasady gry, Przeciwnicy: życia ze składu poziomu, Limonkowy bez Laski, skład poziomów 1–5) i docs/snowcraft-plan.md (karty Zielonego i Limonkowego: życia i Laska nieaktualne).
- Powiedz Jakubowi, jak sprawdzić: Arena i Wielka arena, poziom 1: dwa Zielone, każdy ginie od jednego trafienia; poziom 5: Zielone mają po 2 życia (ogłuszenie po pierwszym trafieniu), Limonkowe po 1; Limonkowy chodzi tak szybko jak gracz, nie szybciej.
```

## C2. Wielka arena: dystans z typu

```
Zadanie: w Wielkiej arenie przeciwnik ma trzymać dystans zależny od swojego typu zamiast jednej wartości odlegloscAI.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md ("Koncepcja typów A"), tryby.js (celWielkiejAreny i warunek rzucania, maxOdlegloscRzutuAI) i ai.js. Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W celWielkiejAreny idealna odległość od gracza (celu) = losowa z przedziału `odlegloscRzutuMin`–`odlegloscRzutuMax` typu przeciwnika (te same pola, które w Arenie decydują, z jakiej odległości rzuca). `tryby.wielkaArena.odlegloscAI` zostaje tylko jako wartość zapasowa dla postaci bez typu.
2. Progi "za daleko" (×1,25) i "za blisko" (×0,6) liczone od tej idealnej odległości, jak dotąd.
3. Warunek rzucania w Wielkiej arenie: nadal tylko na ekranie gracza, z czystą linią i w zasięgu. `maxOdlegloscRzutuAI` musi być co najmniej równy największej odlegloscRzutuMax ze wszystkich typów (jeśli któryś typ ma więcej, zgłoś Jakubowi zamiast cicho zmieniać).
4. Stanowiska i bonusy zostają bez zmian.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md (Wielka arena: dystans z typu).
- Powiedz Jakubowi, jak sprawdzić: Wielka arena, poziom 1: Zielone podchodzą na ok. 5–6 ludzików (a nie ok. 0,5 szerokości widoku jak wcześniej), poziom 4–5: Limonkowe stają nieco dalej niż Zielone.
```

## C3. Żółty (Biegacz) + poziomy 6–7

```
Zadanie: dodaj typ Żółty (Biegacz) i poziomy 6–7.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md (sekcje "Koncepcja typów A", "Poziomy Areny 1–20"), config.js (typy, skladPoziomow) i ai.js. Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `zolty` (kolor "zolty"; atlas assets/gracze/atlasy/zolty.webp ładuje mechanizm z A1, sprawdź tylko, że postać rysuje się i animuje).
ŻÓŁTY, WARTOŚCI (Biegacz: szybki, ale niecelny)
- czasOgluszenia 1.0, mnoznikPredkosci 1.4
- ruch: krok 0.10–0.16, odchylenieKroku 45 (kręci się nerwowo), postój 0.3–0.7
- odlegloscRzutu 0.30–0.40, czasAwaryjny 5
- przerwa 2.5–3.5, sila 0.1–0.3, zamachMin 0.4
- rozrzut: start 0.077, cel ok. 30% trafień w stojącego
- szansaUniku 0.35, czasReakcji 0.35
- mnoznikPrzeladowania 1, szansaBonusu 0.15, szansaStanowiska 0.1
Cena umiejętności: bardzo słaba celność.
2. skladPoziomow (wpisy { typ, ile, zycia }):
   6: zielony 3 po 3, limonkowy 2 po 2, zolty 1 po 2
   7: zielony 3 po 3, zielony 1 po 2, limonkowy 2 po 2, zolty 1 po 2
   Poziom 8 i dalej na razie biorą skład poziomu 7.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md (karta Żółtego zrobiona, poziomy 6–7).
- Powiedz Jakubowi, jak sprawdzić (z poziomStartowy 6, jeśli C0 zrobione): poziom 6, Żółty biega szybciej niż gracz i często pudłuje; sprawdź, czy da się go w ogóle trafić i czy jest zabawny, nie irytujący.
```

## C4. Pomarańczowy (Snajper) + poziomy 8–9

```
Zadanie: dodaj typ Pomarańczowy (Snajper) i poziomy 8–9.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md ("Koncepcja typów A", "Poziomy Areny 1–20"), config.js, ai.js (rzucWGracza, zamach). Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `pomaranczowy` (kolor "pomaranczowy").
POMARAŃCZOWY, WARTOŚCI (Snajper: celny i daleko, ale z długim zamachem i długą przerwą)
- czasOgluszenia 1.2, mnoznikPredkosci 0.8
- ruch: krok 0.06–0.10, odchylenieKroku 25, postój 1.0–2.0
- odlegloscRzutu 0.50–0.60, czasAwaryjny 5
- przerwa 5–6, sila 0.35–0.55, zamachMin 0.9
- rozrzut: start 0.038 (cel: praktycznie zawsze trafia stojącego)
- szansaUniku 0.1, czasReakcji 0.7
- mnoznikPrzeladowania 1, szansaBonusu 0.1, szansaStanowiska 0.1
2. WAŻNE: sprawdź w ai.js, w którym momencie ustalany jest punkt celu: ma być zapamiętany na początku zamachu, żeby gracz widział ostrzeżenie (zamach z ręką za głową) i mógł zejść z miejsca. Jeśli cel jest ustalany dopiero przy puszczeniu, powiedz Jakubowi i zaproponuj zmianę tylko dla tego typu (nie zmieniaj reszty bez zgody).
3. W małej Arenie (trójkąt) odległość 0.5–0.6 bywa nieosiągalna; zasada awaryjna (czasAwaryjny 5 s) ma wtedy sprawić, że rzuca z miejsca. Sprawdź, że tak działa.
4. skladPoziomow:
   8: zielony 3 po 3, zielony 1 po 2, limonkowy 2 po 2, zolty 1 po 2, pomaranczowy 1 po 2
   9: zielony 3 po 3, zielony 2 po 2, limonkowy 2 po 2, zolty 1 po 2, pomaranczowy 1 po 2
   Poziom 10 i dalej biorą skład poziomu 9.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 8): Pomarańczowy stoi daleko, długo zamierza się (ostrzeżenie), rzuca szybką gałką i prawie zawsze trafia, jeśli nie zejdziesz z miejsca.
```

## C5. Turkusowy (Szybkostrzelec) + poziomy 10–11

```
Zadanie: dodaj typ Turkusowy (Szybkostrzelec) i poziomy 10–11.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md i config.js. Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `turkusowy` (kolor "turkusowy").
TURKUSOWY, WARTOŚCI (Szybkostrzelec: często rzuca, ale słabo i niecelnie)
- czasOgluszenia 1.2, mnoznikPredkosci 0.9
- ruch: krok 0.06–0.10, odchylenieKroku 25, postój 0.5–1.0
- odlegloscRzutu 0.35–0.45, czasAwaryjny 5
- przerwa 1.5–2.5, sila 0.1–0.2, zamachMin 0.3
- rozrzut: start 0.071, cel ok. 40%
- szansaUniku 0.25, czasReakcji 0.5
- mnoznikPrzeladowania 1, szansaBonusu 0.15, szansaStanowiska 0.2
2. skladPoziomow:
   10: zielony 3 po 3, zielony 2 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy po 1 (każdy po 2 życia)
   11: zielony 3 po 3, zielony 3 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy po 1 po 2
   Poziom 12 i dalej biorą skład poziomu 11.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 10): Turkusowy rzuca bardzo często słabymi, wolnymi gałkami; poziom 10 ma 10 przeciwników, na planszy jest ich naraz najwyżej maxNaraz (8), reszta wchodzi z kolejki.
```

## C6. Błękitny (Unikacz) + poziomy 12–13

```
Zadanie: dodaj typ Błękitny (Unikacz) z nowym zachowaniem "ucieka" i poziomy 12–13.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md, config.js, ai.js (ruch w Arenie) i tryby.js (celWielkiejAreny już cofa się, gdy jest za blisko). Pracuj wg zasad CLAUDE.md i wspólnych zasad części C. To nowe zachowanie, więc koniecznie najpierw pokaż plan i poczekaj na zgodę.

CO ZROBIĆ
1. W config.typy dodaj `blekitny` (kolor "blekitny").
BŁĘKITNY, WARTOŚCI (Unikacz: często unika i trzyma dystans, ale rzuca słabo)
- czasOgluszenia 1.0, mnoznikPredkosci 1.0
- ruch: krok 0.08–0.12, odchylenieKroku 25, postój 0.3–0.8
- odlegloscRzutu 0.45–0.55, czasAwaryjny 5
- NOWE pole `ucieka`: true. Gdy gracz jest bliżej niż 0.8 × odlegloscRzutuMin, przeciwnik zamiast podchodzić robi krok od gracza (kierunek od gracza z odchyleniem odchylenieKroku), z uwzględnieniem granic, przekątnej (Arena) i przeszkód. Jeśli jest w rogu i nie ma dokąd uciec, stoi i rzuca. W Wielkiej arenie cofanie już istnieje dla wszystkich typów, więc tam bez zmian; pole `ucieka` dotyczy Areny.
- przerwa 3–4.5, sila 0.1–0.3, zamachMin 0.45
- rozrzut: start 0.068, cel ok. 45%
- szansaUniku 0.6, czasReakcji 0.25
- mnoznikPrzeladowania 1, szansaBonusu 0.2, szansaStanowiska 0.1
2. skladPoziomow:
   12: zielony 3 po 3, zielony 3 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny po 1 po 2
   13: zielony 3 po 3, zielony 4 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny po 1 po 2
   Poziom 14 i dalej biorą skład poziomu 13.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 12): Błękitny cofa się, gdy do niego podchodzisz, często robi uniki; w rogu w końcu staje i rzuca.
```

## C7. Szary (Wytrwały) + poziomy 14–15

```
Zadanie: dodaj typ Szary (Wytrwały) i poziomy 14–15.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md i config.js. Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `szary` (kolor "szary").
SZARY, WARTOŚCI (Wytrwały: wolny, krótko ogłuszony, rzadko rzuca)
- czasOgluszenia 0.4 (krótkie)
- mnoznikPredkosci 0.5
- ruch: krok 0.04–0.07, odchylenieKroku 25, postój 1.5–2.5
- odlegloscRzutu 0.70–0.80 (praktycznie stoi tam, gdzie jest; zasada awaryjna po 5 s), czasAwaryjny 5
- przerwa 5–6.5, sila 0.15–0.35, zamachMin 0.5
- rozrzut: start 0.059, cel ok. 60%
- szansaUniku 0.2, czasReakcji 0.6
- mnoznikPrzeladowania 1, szansaBonusu 0.05, szansaStanowiska 0.1
2. skladPoziomow:
   14: zielony 3 po 3, zielony 4 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny, szary po 1 po 2
   15: zielony 3 po 3, zielony 5 po 2, reszta jak na 14
   Poziom 16 i dalej biorą skład poziomu 15.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 14): Szary wolno chodzi, rzadko rzuca, a po trafieniu prawie od razu wraca do gry.
```

## C8. Fioletowy (Siłacz) + poziomy 16–17

```
Zadanie: dodaj typ Fioletowy (Siłacz) i poziomy 16–17.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md i config.js. Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `fioletowy` (kolor "fioletowy").
FIOLETOWY, WARTOŚCI (Siłacz: bardzo szybkie gałki, ale długi zamach i rzadkie rzuty)
- czasOgluszenia 1.2, mnoznikPredkosci 0.6
- ruch: krok 0.05–0.08, odchylenieKroku 25, postój 1.0–2.0
- odlegloscRzutu 0.40–0.50, czasAwaryjny 5
- przerwa 5–6, sila 0.85–1.0, zamachMin 0.8 (uwaga: zamach = max(zamachMin, sila × 1,5 s), więc w praktyce ok. 1,3–1,5 s, to jest zamierzone ostrzeżenie)
- rozrzut: start 0.053, cel ok. 70%
- szansaUniku 0.1, czasReakcji 0.7
- mnoznikPrzeladowania 1, szansaBonusu 0.1, szansaStanowiska 0.3
2. skladPoziomow:
   16: zielony 3 po 3, zielony 5 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny, szary, fioletowy po 1 po 2
   17: zielony 3 po 3, zielony 6 po 2, reszta jak na 16
   Poziom 18 i dalej biorą skład poziomu 17.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 16): Fioletowy długo się zamierza, jego gałka leci wyraźnie szybciej niż inne; da się ją ominąć, jeśli zareagujesz na zamach.
```

## C9. Brązowy (od stanowisk) + poziomy 18–19

```
Zadanie: dodaj typ Brązowy (przeciwnik od stanowisk) i poziomy 18–19.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md, config.js i stanowiska.js (jak przeciwnicy wybierają stanowisko, szansaStanowiska). Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `brazowy` (kolor "brazowy").
BRĄZOWY, WARTOŚCI (po każdym rzucie z dużą szansą idzie do stosu albo armatki)
- czasOgluszenia 1.2, mnoznikPredkosci 0.9
- ruch: krok 0.06–0.10, odchylenieKroku 25, postój 0.5–1.0
- odlegloscRzutu 0.375–0.45, czasAwaryjny 5
- przerwa 3–4.5, sila 0.2–0.4, zamachMin 0.4
- rozrzut: start 0.050, cel ok. 75%
- szansaUniku 0.25, czasReakcji 0.5
- mnoznikPrzeladowania 1, szansaBonusu 0.2, szansaStanowiska 0.9
2. Sprawdź, że przy dużej szansie (0.9) kilku przeciwników nie blokuje się nawzajem przy jednym stanowisku (zasada: najwyżej jeden przy stanowisku, reszta robi to, co zwykle).
3. skladPoziomow:
   18: zielony 3 po 3, zielony 6 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny, szary, fioletowy, brazowy po 1 po 2
   19: zielony 3 po 3, zielony 7 po 2, reszta jak na 18
   Poziom 20 i dalej biorą skład poziomu 19.

PO ZMIANIE: zaktualizuj CLAUDE.md i docs/snowcraft-plan.md. Powiedz Jakubowi, jak sprawdzić (poziom 18): Brązowy po rzucie idzie do stosu albo armatki i tam stoi, rzucając szybko.
```

## C10. Magenta (od bonusów) + poziom 20

```
Zadanie: dodaj typ Magenta (zbieracz bonusów) i poziom 20, na koniec podsumowanie.

Najpierw przeczytaj CLAUDE.md, docs/snowcraft-plan.md, config.js i bonusy.js (przeciwnicyZbierajaBonusy, szansaBonusu). Pracuj wg zasad CLAUDE.md i wspólnych zasad części C.

CO ZROBIĆ
1. W config.typy dodaj `magenta` (kolor "magenta").
MAGENTA, WARTOŚCI (poluje na bonusy)
- czasOgluszenia 1.0, mnoznikPredkosci 1.1
- ruch: krok 0.08–0.12, odchylenieKroku 35, postój 0.4–0.9
- odlegloscRzutu 0.375–0.45, czasAwaryjny 5
- przerwa 3–4.5, sila 0.2–0.4, zamachMin 0.4
- rozrzut: start 0.053, cel ok. 70%
- szansaUniku 0.3, czasReakcji 0.5
- mnoznikPrzeladowania 1, szansaBonusu 0.8, szansaStanowiska 0.1
2. skladPoziomow:
   20: zielony 3 po 3, zielony 7 po 2, limonkowy 2 po 2, zolty, pomaranczowy, turkusowy, blekitny, szary, fioletowy, brazowy, magenta po 1 po 2. Poziom 21 i dalej biorą skład poziomu 20.
3. Sprawdź, że suma przeciwników to dokładnie N na poziomach 1–20 poza poziomami 1–5 (1–5: 2, 4, 3, 5, 5) i że poziom N od 6 w górę ma N przeciwników.

PO ZMIANIE
- Zaktualizuj CLAUDE.md i docs/snowcraft-plan.md (komplet 20 poziomów zrobiony, test na Wielkiej arenie).
- Powiedz Jakubowi, jak sprawdzić: Magenta często celuje w bonusy zamiast w gracza. Przejdź kilka poziomów w Wielkiej arenie (np. 1, 6, 10, 15, 20) i napisz, które są za łatwe, za trudne albo nieczytelne; zmiany stroi się w config.js (życia we wpisach składu, maxNaraz, parametry typów).
```
