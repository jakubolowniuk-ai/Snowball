# Snowcraft – plan i pomysły

Status: planowanie i pierwsze kroki prototypu. Budujemy z agentem Claude Code.
Ostatnia aktualizacja: 21.11.2026 (wersja z jednym zawodnikiem i rzutem w dowolny punkt)

---

## CZĘŚĆ A: Oryginał (fakty)

### Pochodzenie
- Gra przeglądarkowa (Shockwave/Flash) od Nicholson NY, 1998 r. Rozsyłana jako świąteczna kartka. Wersje na Windows datowane na 2000/2001. Była też wersja na iPhone'a (2010).
- Tylko jeden gracz (przeciw komputerowi).

### Zasady
- Gracz steruje trzema chłopcami w czerwonych strojach. Przeciwnik (komputer) ma drużynę zielonych.
- Cel: wyeliminować całą drużynę przeciwną śnieżkami.
- Poziom 1: 3 przeciwników. Poziom 2: 5 przeciwników. Dalej liczba rośnie, a przeciwnicy lepiej unikają trafień.
- **Trafienia (potwierdzone przez Jakuba):** pierwsze dwa trafienia ogłuszają (chwilowo nie można sterować dzieciakiem), trzecie eliminuje.
- **Brak przeszkód i osłon** w oryginale. Dwie zaspy na planszy są dekoracją (bez kolizji).
- Widok: stały ekran, skośnie z góry.

### Sterowanie w oryginale (mysz)
- Steruje się **jednym chłopcem naraz**. Zaznaczony ma niebieski owalny pierścień pod stopami (z małymi strzałkami po bokach), kursor łapie ten pierścień.
- Trzymasz przycisk i przesuwasz chłopca. Obok niego rośnie **pionowy, segmentowany zielony pasek** (miernik siły).
- Puszczenie przycisku: rzut. Śnieżka to biała kulka z cieniem na ziemi, oddzielonym od niej (łuk lotu).
- Przeciwnik przed rzutem unosi śnieżkę nad głowę (ostrzeżenie).
- Trafiony dostaje białą chmurkę śniegu. Wyeliminowani leżą na planszy z rozrzuconymi butami i czapką.
- Interfejs prawie żaden: tylko napis "Level N" na środku na początku poziomu.

### Nieznane (nie zgadujemy)
- Dokładne celowanie w oryginale.
- Czy był limit śnieżek.

---

## CZĘŚĆ B: Nasza wersja

### Decyzje podjęte
- Platforma: telefon (przeglądarka, PWA), hosting GitHub Pages (repozytorium Snowball).
- Odbiorcy: Jakub i znajomi.
- **Na razie jeden zawodnik po stronie gracza** (zawsze zaznaczony). Drużyna 3 zawodników, zaznaczanie zawodników i automatyczni koledzy są odłożone na później.
- Tryby: kampania jednoosobowa najpierw. Multiplayer przez internet później.
- Zaczynamy od prototypu, który ma już dawać poczucie gry.

### Mechanika (ustalona z Jakubem)
1. **Zawodnik gracza:** jeden, czerwony, zawsze zaznaczony (niebieski pierścień pod stopami).
2. **Ruch:** **stały joystick (pad)** w prawym dolnym rogu ekranu, sterowany prawym kciukiem. Ruch płynny: im większe wychylenie gałki, tym szybciej (do `predkoscZawodnika`), ze strefą martwą przy środku. Puszczenie pada zatrzymuje zawodnika. Wcześniejsza kropka (uchwyt) za zawodnikiem została usunięta, bo wymagała chodzenia palcem za zawodnikiem po planszy. Granica drużyn to przekątna pola: gracz (czerwony, widziany z tyłu) gra w prawym dolnym trójkącie, przeciwnicy (przodem) w lewym górnym. Nikt nie przechodzi przez przekątną. Gracz startuje poza strefą pada.
3. **Rzut:** **drugi palec** dotyka dowolnego punktu planszy (poza padem) i wyznacza **cel** rzutu. Znacznik celu jest dokładnie w miejscu dotyku, cienka linia łączy go z zawodnikiem.
4. **Siła:** przytrzymanie ładuje siłę (max **1,5 s**). Siła zwiększa **tylko prędkość** śnieżki, nie zasięg (opcja `zasiegZalezyOdSily` w `config.js` przywraca dawny zasięg zależny od siły). Bez paska siły: łuk wokół pierścienia celu wypełnia się proporcjonalnie do siły, a przy pełnej sile jest zielony. Puszczenie palca = rzut. Przeciwnicy losują siłę z zakresu zależnego od poziomu (wyżej = częściej mocny, szybki rzut).
5. **Lot śnieżki:** leci prosto w stronę celu i zatrzymuje się w dotkniętym punkcie, niezależnie od siły. Nigdy nie leci za cel. Rysujemy ją z cieniem na ziemi (efekt łuku), to tylko wygląd.
6. **Trafienia:** śnieżka **trafia każdego z drużyny przeciwnej, kto stoi na jej drodze** (swoich nie trafia, wyjątek: upity) (przeciwnika, nie samego rzucającego). Dwa trafienia ogłuszają na 1 s, trzecie eliminuje. Liczba trafień liczy się przez cały poziom.
7. **Ruch w trakcie ładowania** jest dozwolony (dwa kciuki: jeden na padzie, drugi na planszy).
8. **Przeładowanie:** po rzucie 0,5 s plus czas, który przytrzymaliśmy siłę. W tym czasie można się ruszać, ale nowe dotknięcie planszy nic nie rzuca. Pierścień pod stopami pokazuje odliczanie.
9. **Przeciwnicy:** te same reguły co gracz. Przed rzutem robią **zamach z ręką za głową** (ostrzeżenie): im silniejszy rzut, tym dłużej trwa zamach. Poziom 1: 1 przeciwnik, poziom 2: 2, poziom 3: 3 itd. Przeciwnicy mają **typy** ze stałymi parametrami (`typy` i `skladPoziomow` w `config.js`): poziomy 1–3 to Zielony (patrz „Karty typów”). Poziomy 4–12 to Zielony i Limonkowy (poziom N = N przeciwników, najwyżej 6 naraz, reszta w kolejce).
10. **Bonusy:** ozdoby choinkowe pojawiają się w pasie wokół przekątnej (co 12–18 s, żyją 10 s, ostatnie 2 s migają; 1 naraz na poziomach 1–2, 2 od poziomu 3). Zdobywa je ten, kto trafi je śnieżką (kosztuje rzut). Nie mogą leżeć w strefie pada, w przeszkodzie, przy postaci ani za przeszkodą widzianą od gracza. Bonusy: **Bombka** (tarcza na jedno trafienie, max 12 s, bańka wokół postaci), **Gwiazdka** (3 rzuty albo 8 s: wachlarz 3 śnieżek), **Laska cukrowa** (bieg ×1,4 przez 6 s), **Pierniczek** (rzadki, od razu zdejmuje jedno trafienie). Przeciwnicy też je zbierają: z szansą zależną od poziomu (0,2–0,6) rzucają dokładnie w bonus bliższy im niż graczowi, jeśli mają czystą linię. Aktywne bonusy każdej postaci widać jako ikony nad głową.
11. **Stanowiska:** każda drużyna ma stos gałek (7–9 gałek; przeładowanie ×0,3 w jego promieniu, stos maleje i znika) i armatkę (20 gałek; w miejscu stania tuż za nią rzut bez przeładowania, najczęściej co 0,2 s; licznik nad armatką; pusta zostaje jako dekoracja). Nie blokują ruchu ani śnieżek. Przeciwnicy z szansą zależną od poziomu (0,25–0,7) idą do swojego stanowiska i stoją tam do wyczerpania amunicji albo ogłuszenia (bez uników). Bonusy nie pojawiają się na stanowiskach.
12. **Wygrana:** wyeliminowanie wszystkich przeciwników. **Przegrana:** wyeliminowanie zawodnika.

### Do rozstrzygnięcia (pytania otwarte)
- Czy cel to pozycja palca w chwili puszczenia (można przesuwać palec podczas przytrzymania). Zakładamy: tak.
- Czy puszczenie palca bardzo blisko zawodnika anuluje rzut. Zakładamy: tak (promień w `config.js`).
- Skala postaci na małych telefonach (5–5,5 cala): sprawdzić po teście u znajomego.

### Układ i wygląd (na podstawie analizy rozgrywki z nagrania)
- **Pole gry:** stałe proporcje 2:1, skalowane tak, żeby mieściło się w ekranie w całości. Tło śnieżne wychodzi poza pole i wypełnia resztę ekranu, bez pustych pasów. Zawodnicy nie wychodzą poza pole. Joystick jest zakotwiczony do ekranu, nie do pola. Wszyscy mają to samo pole gry niezależnie od telefonu.
- **Orientacja:** tylko pozioma. W pionie komunikat "Obróć telefon".
- **Wygląd:** tło z grafiki (śnieżna tekstura) z niebieskawym przyciemnieniem poza polem i przy jego brzegach, widok skośnie z góry, cień pod postaciami. Dekoracje (choinki, bałwany, płotki, forty) są przeszkodami: zatrzymują śnieżki, a zawodnicy nie mogą przez nie przejść. Rysowanych zasp już nie ma.
- **Postacie:** z grafik, okrąg trafień ok. 1/16 szerokości pola gry (najpierw było 1/8, ale było za duże względem planszy). Czerwony to gracz, zieloni to przeciwnicy.
- **Interfejs:** minimalny. Tylko napis "Level N" na środku przez 1–2 s na początku poziomu.
- **Efekty:** biała chmurka śniegu przy trafieniu, wyeliminowani leżą na ziemi do końca poziomu, krótka wibracja telefonu przy trafieniu.
- **Poziomy:** krótkie (30–60 s), szybki restart bez ekranów pośrednich.
- Grafiki własne, nie kopiujemy z oryginału.

### Prototyp (zakres v0)
- Jeden poziom: 1 zawodnik vs 1 przeciwnik.
- Mechanika z listy powyżej.
- Prosta sztuczna inteligencja przeciwnika (poruszanie, unikanie, rzut z unoszeniem).
- Wygrana/przegrana i restart.
- 1–2 bonusy do przetestowania.
- 2–3 osłony zimowe/świąteczne (później).
- Cel: sprawdzić, czy sterowanie dwoma palcami (ruch + rzut w dowolny punkt) dobrze się czuje na telefonie.

### Tryby gry
- **Menu** po wczytaniu: Arena, Wielka arena, Kampania (wkrótce). Na ekranie końca poziomu przycisk "Menu".
- **Arena:** jedno pole z przekątną (wszystko jak wyżej).
- **Wielka arena:** świat 2 × 2 pola, kamera jedzie za graczem, bez przekątnej, 18 dekoracji w całym świecie. Przeciwnicy podchodzą na odległość rzutu i rzucają tylko, gdy są na ekranie gracza. Kroki: W1 (zrobione: menu, świat, kamera, ruch, AI), W2 (zrobione: strzałki do przeciwników poza ekranem, zasięg śnieżki do szerokości widoku, neutralne stanowiska ze wspólną amunicją, bonusy w całym świecie, do 4 naraz, co 4–7 s), W3 (zrobione: zamieć, po 90 s świat przez 30 s zwęża się do jednego pola, ostrzeżenie 10 s wcześniej, szaroniebieska mgła poza granicą, rzeczy poza granicą znikają, wiatr spycha postacie do środka przez przeszkody).

### Przeciwnicy według poziomów
(Stare założenia z początku projektu. Aktualny plan: sekcja „Typy przeciwników" niżej. Wszystkie poziomy mają już skład z typów (`skladPoziomow`), tabela `poziomy` jest usunięta.)
- Poziomy 1–3: chodzą losowo, reagują wolno albo wcale.
- Środek: widzą start śnieżki i po krótkiej reakcji robią krok w bok.
- Wyższe: przewidują tor i uciekają, ale zwinność jest ograniczona.
- Trudność = czas reakcji, szansa uniku, celność, częstość rzutów.

### Osłony i przeszkody (nasze rozszerzenie)
Choinki, bałwany, mury ze śniegu, skrzynki z prezentami, laski cukrowe jako płotek, igloo, sanie, zamarznięty staw (ślizganie), zaspy (spowolnienie).

### Bonusy (obecne)
Aktywowane trafieniem śnieżką (rzut w miejsce bonusu). Szczegóły w `CLAUDE.md`.
- Bombka: tarcza na jedno trafienie, odbija śnieżkę w rzucającego (przełącznik `odbija`).
- Laska cukrowa: szybszy bieg na kilka sekund.
- Gwiazdka: wachlarz 3 śnieżek przez 3 rzuty.
- Pierniczek: zdejmuje jedno trafienie.
- Kakao: przeładowanie ×0,3 przez 10 s (ze stosem/armatką najmniejszy mnożnik).
- Pełna siła: 10 s albo 10 rzutów z maksymalną prędkością, przeładowanie od faktycznego przytrzymania.
- Spowolnienie przeciwników: drużyna przeciwna przez 8 s chodzi ×0,5 i przeładowuje ×2.
- Spowolnienie śnieżek: śnieżki drużyny przeciwnej przez 8 s lecą ×0,5.
- Upicie: wybuch w miejscu bonusu, wszyscy w kręgu przez 10 s idą krzywo.
- Niewidzialność: 6 s półprzezroczystości; przeciwnicy rzucają na oślep w koło 0,12 wokół miejsca, gdzie gracz był w chwili zebrania.
- Miotacz: 20 gałek, przytrzymany palec strzela co 0,3 s z siłą 0,7, bez przeładowania; bezpiecznik 20 s; przeciwnik strzela seriami po 5.
- Wieżyczka: staje w miejscu trafionego bonusu, 3 życia, 30 gałek, strzela co 3 s w drużynę przeciwną (60% w najbliższego; w Wielkiej arenie tylko na szerokość ekranu); przeciwnicy celowo w nią strzelają (najbliższy cel); nie blokuje ruchu.
- Sojusznik: zawodnik drużyny zbierającego sterowany przez komputer (parametry losowego typu, 3 życia, do końca poziomu; u gracza czerwona kurtka); przeciwnicy celują w najbliższego z drużyny gracza; przegrana tylko po wyeliminowaniu gracza.

### Planowane bonusy (ustalone na czacie, jeszcze niezrobione)
Zrobione już: Kakao, Pełna siła, Spowolnienie przeciwników, Spowolnienie śnieżek, Upicie i Bombka odbijająca (patrz „Bonusy (obecne)"). Wszystkie są już zrobione (kroki B2–B5). Każdy działa na tej samej zasadzie co obecne: zdobywa go, kto trafi go śnieżką. Ikony to propozycje. Mocne bonusy (Wieżyczka, Sojusznik, Niewidzialność) mają mieć mniejszą wagę losowania. Kolejność robienia: Niewidzialność, Miotacz, a na końcu Wieżyczka i Sojusznik (nowe obiekty w kodzie).
- Pomysł: bonusy negatywne.

**Nazwy:** stanowiska drużyn nadal nazywają się „armatka" i „stos". Bonusowe to „Miotacz" i „Wieżyczka", żeby się nie myliły.

### Typy przeciwników (w planowaniu, nic nie ustalone poza zasadami)
- Zamiast tabeli poziomów, w której zmienia się naraz 8 parametrów, każdy **typ przeciwnika ma stałe parametry**, a poziom to skład (ile i jakich typów). Wyższe poziomy: więcej przeciwników albo typy z wyższymi parametrami.
- **Typów jest tyle, ile kolorów kurtek poza czerwonym** (czerwony to nasza drużyna). Każdy kolor = inne parametry **i** inna rola/umiejętność (np. Strzelec, Unikacz, Artylerzysta, Zbieracz, Twardziel; do rozpisania).
- Sojusznik (bonus) bierze parametry któregoś z kolorów, ale ma czerwoną kurtkę.
- Do rozpisania: lista typów i ich parametrów (życia, czas ogłuszenia, prędkość chodzenia, przeładowanie, czas reakcji, szansa uniku, rozrzut, siła rzutu, szansa na bonus/stanowisko), sposób oznaczenia typu na ekranie (przy tylu kolorach sam kolor może nie wystarczyć), układanie poziomów (ręcznie albo punkty budżetu), limit przeciwników naraz, poziom 6+. Życia, czas ogłuszenia i prędkość chodzenia są teraz wspólne dla gracza i przeciwników, trzeba je rozdzielić.
- Powód zmiany: poziom 5 jest za ciężki, bo tam wszystkie parametry osiągają maksimum naraz (5 przeciwników × 3 trafienia przeciw 3 trafieniom gracza).

#### Ustalenia o typach
- 15 kolorów kurtek poza czerwonym = 15 oddzielnych typów (bez „rodzin"). Żadnej roli na razie nie wyrzucamy. Czerwony to nasza drużyna.
- **Umiejętności z bonusów są ODŁOŻONE** (decyzja Jakuba 25.11): dostaną je dopiero typy elitarne, poza poziomami 1–20 (patrz „Koncepcja typów A"). Każda umiejętność ma mieć cenę w innych liczbach typu.
- Typ ma stałe parametry. **Życia NIE są parametrem typu**: są w składzie poziomu (`{ typ, ile, zycia }`), więc ten sam kolor może mieć na różnych poziomach różne życia (decyzja Jakuba 25.11).
- Parametry typu wpływające na trudność: życia, czas ogłuszenia, rozmiar postaci, prędkość chodzenia, wędrówka i postój, odskok, szansa uniku, czas reakcji, przerwa między rzutami (min/max), siła rzutu (min/max), czas zamachu (osobno, nie z siły), rozrzut, wyprzedzanie (0–1, nowe), mnożnik przeładowania, odległość rzutu, szansa na bonus, szansa na stanowisko, mnożnik amunicji stanowisk, mnożnik czasu bonusów, stałe umiejętności, tarcza na start. Dziś część z nich jest wspólna dla wszystkich i dla gracza (życia, ogłuszenie, rozmiar, chodzenie, wędrówka/postój, odskok, przeładowanie); trzeba je rozdzielić. Nie istnieją jeszcze: wyprzedzanie, osobny zamach, mnożniki czasu bonusów i amunicji, stałe umiejętności, tarcza na start, podchodzenie w zwykłej Arenie.
- Wskazówka do strojenia rozrzutu: błąd celowania jest losowy w kole o promieniu rozrzut; trafienie w stojącego, gdy błąd jest mniejszy niż ok. 0,038 (promień postaci plus śnieżki). Szansa trafienia P ≈ (0,038 / rozrzut)², więc rozrzut ≈ 0,038 / √P. Rozrzut poniżej 0,038 = zawsze trafia stojącego. Przeciw poruszającemu się graczowi prawie nigdy nie trafia, bo nie ma wyprzedzania.

#### Poziomy Areny: ZROBIONE (krok A4), ZASTĄPIONE planem 1–20 (niżej)
- Wprowadzone: skład 1–12 jak niżej (13+ jak 12), typy przeplatane; `maxNaraz: 6` (decyzja Jakuba: bez limitu poziom 12 to ok. 42 życia przeciwników na 3 gracza) z kolejką (wejście 2 s po zwolnieniu miejsca); start w rzędach równoległych do przekątnej (odstęp rzędów 0,14, naprzemiennie; przy 12 naraz najbliżsi stoją ok. 0,063 od siebie, trochę mniej niż 1,2 × rozmiar postaci, bo trójkąt jest za mały); pierwsze rzuty rozłożone o 0–3 s; miękkie odpychanie przeciwników; bonusy w Arenie `maxNaraz` [1, 1, 2, 2, 3]; stara tabela `poziomy` usunięta. Poniżej pierwotny plan.
- Poziom N = N przeciwników, **wszyscy wchodzą od razu** (bez limitu naraz i bez kolejki). Do poziomu 12 (ew. dalej).
- **Trafianie swoich: WPROWADZONE (krok A2).** Śnieżka nie trafia członków własnej drużyny (wszystkie tryby, także przyszły Sojusznik; przełącznik `trafianieSwoich` w `config.js`). Nadal trafia drużynę przeciwną, rozbija się o przeszkody i zbiera bonusy. Skutek: przeciwnik nie osłania innego własnym ciałem. **Wyjątek (decyzja Jakuba): upity (bonus Upicie) trafia też swoich.**
- Skład (Z = Zielony, L = Limonkowy): 1: 1Z · 2: 2Z · 3: 3Z · 4: 3Z+1L · 5: 3Z+2L · 6: 3Z+3L · 7: 3Z+4L · 8: 4Z+4L · 9: 4Z+5L · 10: 5Z+5L · 11: 5Z+6L · 12: 6Z+6L. Kolejne typy mają wchodzić od ok. poziomu 6–7 w miejsce części Zielonych i Limonkowych.
- Do rozwiązania: ustawienie 12 przeciwników na starcie (jedna linia nie wystarczy, potrzebne 2–3 rzędy równoległe do przekątnej), sprawdzić, czy postacie się blokują, opcjonalny limit `maxNaraz` w config (domyślnie bez limitu), więcej bonusów naraz na wysokich poziomach, rozłożenie pierwszych rzutów w czasie.
- Kolejność robienia: (1) system typów + Zielony na poziomach 1–3, (2) Limonkowy, (3) poziomy 4–12 i rozmieszczenie.

#### Koncepcja typów A (OBOWIĄZUJĄCA, ustalona z Jakubem 25.11)
- **Każdy kolor to profil kompromisów** (szybki, ale niecelny; celny, ale z długim zamachem itd.) zbudowany z parametrów mechaniki. Gracz realnie czuje pięć osi: **chód, celność, zamach (ostrzeżenie), siłę rzutu (prędkość gałki), unik**. Reszta (przerwa, ogłuszenie, odległość, szansa na bonus i stanowisko) jest dodatkiem.
- **Życia** są w składzie poziomu, nie w typie. Odrzucona została „drabinka B" (każdy kolor lepszy od poprzedniego o równy krok): sąsiednie kolory różniłyby się za mało, żeby to było czuć.
- **Odległość od gracza to oś typu** (`odlegloscRzutuMin/Max`): jedni muszą podejść blisko, inni stoją daleko, Błękitny ucieka, gdy gracz się zbliża (`ucieka`). W Wielkiej arenie przeciwnik trzyma dystans z typu (nie globalne `odlegloscAI`).
- **Umiejętności z bonusów tylko dla elity** (kolory 11–15, poza poziomami 1–20): Różowy wachlarz kilku śnieżek, Granatowy niewidzialność (10–15 s od startu i po każdym trafieniu), Bordowy serie jak z armatki, Niebieski i Złoty po dwie umiejętności. Bossowie później, z osobną grafiką.
- Skala: „chód" 1,0 = prędkość gracza bez bonusu; „trafia" = szansa trafienia stojącego gracza; „siła" = środek zakresu 0–1. Rozrzut dobierany symulacją jak w A1 (punkty odniesienia z gry: 0,053 = ok. 70%, 0,047 = ok. 80%).

| # | Kolor, rola | chód | trafia | zamach | siła | unik |
|---|---|---|---|---|---|---|
| 1 | Zielony, Rekrut | 0,7 | 70% | 0,50 | 0,10 | 15% |
| 2 | Limonkowy, Standard | 1,0 | 80% | 0,40 | 0,20 | 30% |
| 3 | Żółty, Biegacz | 1,4 | 30% | 0,40 | 0,20 | 35% |
| 4 | Pomarańczowy, Snajper | 0,8 | 100% | 0,90 | 0,45 | 10% |
| 5 | Turkusowy, Szybkostrzelec | 0,9 | 40% | 0,30 | 0,15 | 25% |
| 6 | Błękitny, Unikacz | 1,0 | 45% | 0,45 | 0,20 | 60% |
| 7 | Szary, Wytrwały | 0,5 | 60% | 0,50 | 0,25 | 20% |
| 8 | Fioletowy, Siłacz | 0,6 | 70% | 0,80 | 0,90 | 10% |
| 9 | Brązowy, od stanowisk | 0,9 | 75% | 0,40 | 0,30 | 25% |
| 10 | Magenta, od bonusów | 1,1 | 70% | 0,40 | 0,30 | 30% |
| 11 | Różowy (elita) | 1,3 | 90% | 0,70 | 0,15 | 20% |
| 12 | Granatowy (elita) | 0,7 | 95% | 0,50 | 0,30 | 55% |
| 13 | Bordowy (elita) | 1,3 | 40% | 0,50 | 0,80 | 25% |
| 14 | Niebieski (elita) | 0,6 | 95% | 0,70 | 0,75 | 10% |
| 15 | Złoty (elita) | 1,2 | 90% | 0,30 | 0,70 | 50% |

Dodatki typów 1–10 (pełne wartości są w promptach C3–C10 w `docs/PROMPTY_DLA_AGENTA.md`): Szary ma krótkie ogłuszenie (0,4 s) i rzadkie rzuty, Pomarańczowy i Fioletowy długie przerwy (5–6 s), Turkusowy krótkie (1,5–2,5 s), Brązowy 90% szansy na stanowisko, Magenta 80% na bonus. Uwaga: zamach = max(zamachMin, siła × 1,5 s), więc u Fioletowego (siła ok. 0,9) wychodzi ok. 1,3–1,5 s.

#### Poziomy Areny 1–20 (OBOWIĄZUJĄCE, do testu na Wielkiej arenie; robocze, do strojenia po graniu)
- Jakub chce przetestować te 20 poziomów **najpierw na Wielkiej arenie** (potem ewentualnie na Arenie). Skład jest wspólny dla obu aren (`skladPoziomow`, `mnoznikPrzeciwnikow` 1).
- Zasady: poziomy 1–5 ustalone przez Jakuba, od 6: co poziom +1 przeciwnik (poziom N = N osób). Co drugi poziom wchodzi **nowy kolor** (Żółty 6, Pomarańczowy 8, Turkusowy 10, Błękitny 12, Szary 14, Fioletowy 16, Brązowy 18, Magenta 20), w pozostałych dochodzi **nowy Zielony z 2 życiami** („dopełniaj zawsze od zielonych"). Nowe kolory też mają 2 życia (założenie robocze). Starsze grupy zostają przy swoich życiach (3 Zielone po 3, 2 Limonkowe po 2).
- Przy 20 przeciwnikach naraz plansza byłaby nieczytelna, więc działa `maxNaraz` (robocze 8, reszta czeka w kolejce, wchodzi 2 s po zwolnieniu miejsca). Do strojenia.
- Poziom 21 i dalej: skład poziomu 20.

| Poz. | Skład (Z = Zielony, L = Limonkowy, nowe kolory z 2ż) | Wrogów | Trafień |
|---|---|---|---|
| 1 | 2 Z po 1ż | 2 | 2 |
| 2 | 4 Z po 1ż | 4 | 4 |
| 3 | 2 Z po 1ż, 1 L po 1ż | 3 | 3 |
| 4 | 3 Z po 1ż, 2 L po 1ż | 5 | 5 |
| 5 | 3 Z po 2ż, 2 L po 1ż | 5 | 8 |
| 6 | 3 Z po 3ż, 2 L po 2ż, 1 Żółty | 6 | 15 |
| 7 | + 1 Z po 2ż | 7 | 17 |
| 8 | + Pomarańczowy | 8 | 19 |
| 9 | + Z (razem 2 nowe) | 9 | 21 |
| 10 | + Turkusowy | 10 | 23 |
| 11 | + Z (3 nowe) | 11 | 25 |
| 12 | + Błękitny | 12 | 27 |
| 13 | + Z (4 nowe) | 13 | 29 |
| 14 | + Szary | 14 | 31 |
| 15 | + Z (5 nowych) | 15 | 33 |
| 16 | + Fioletowy | 16 | 35 |
| 17 | + Z (6 nowych) | 17 | 37 |
| 18 | + Brązowy | 18 | 39 |
| 19 | + Z (7 nowych) | 19 | 41 |
| 20 | + Magenta | 20 | 43 |

- Poziomy 3 i 4 mają po 1 życiu (założenie, Jakub nie podał). Poziom 20: 10 Zielonych (3 po 3ż, 7 po 2ż), 2 Limonkowe, po jednym z ośmiu kolorów.
- Trafień przybywa równo o 2 na poziom. Dla porównania stara wersja (życia Zielonego rosnące do 4, Limonkowy 3 życia) miała 18 trafień na poziomie 5 i 38 na poziomie 11, czego Jakub nie mógł przejść.
- Słabe punkty do sprawdzenia w grze: poziomy 15–20 mogą być za długie (ok. 2 min i więcej, w Wielkiej arenie zamieć zwęża świat po 90 s: do testów można ustawić `czasDoZwezania` bardzo duże); połowa wrogów na wysokich poziomach to Zielone; Żółty (chód 1,4, trafia 30%) może być nie do trafienia; Snajper (100% trafień, zamach 0,9 s) wymaga, żeby punkt celu był ustalony na początku zamachu, inaczej ostrzeżenie nic nie daje.
- **Stan wdrożenia:** C0 (poziomStartowy) i C1 (życia w składzie, Limonkowy bez Laski, poziomy 1–5, `maxNaraz` 8) zrobione. C2 (Wielka arena: dystans z typu) zrobione; `maxOdlegloscRzutuAI` 0,9 wystarcza dla wszystkich typów do 20 (największa odległość rzutu: Szary 0,8). C3 zrobione. C4 zrobione. C5 zrobione. C6 zrobione.
- Kolejność robienia (prompty C0–C10 w `docs/PROMPTY_DLA_AGENTA.md`): C0 poziom startowy do testów (opcjonalnie), C1 życia w składzie + Limonkowy bez Laski + poziomy 1–5, C2 dystans z typu w Wielkiej arenie, C3 Żółty (6–7), C4 Pomarańczowy (8–9), C5 Turkusowy (10–11), C6 Błękitny (12–13), C7 Szary (14–15), C8 Fioletowy (16–17), C9 Brązowy (18–19), C10 Magenta (20).

#### Karty typów
(Uwaga: życia i „Laska cukrowa" Limonkowego z poniższych kart są nieaktualne od decyzji z 25.11, **wdrożone w kroku C1**: życia są w składzie poziomu (`{typ, ile, zycia}`), Limonkowy (Standard) ma chód ×1,0. Tabela życi Zielonego 2/3/4 też nieaktualna. Skład z kroku A4 (1–12) zastąpiony poziomami 1–5 z planu 1–20.)
**Zielony (najsłabszy, Rekrut): ZROBIONY (krok A1), poziomy 1–3 w obu arenach.** Uwagi z wdrożenia: rozmiar ×1,15 pominięty (promień postaci jest wspólny i używany w wielu plikach). Rozrzut z karty (0,045) dawał w grze ok. 83% trafień, nie 70% (pudło „za” graczem i tak przez niego przelatuje), więc w krokach A3 poprawiony na 0,053 (ok. 70%). W Wielkiej arenie od kroku C2 Zielony podchodzi na 5–6 ludzików (dystans z typu). Zamach przy sile 0,05–0,15 to zawsze 0,5 s (zamachMin).
- Życia zależne od poziomu: 1–2: 2 życia, 3–4: 3, od 5: 4.
- Ogłuszenie 1,5 s. Rozmiar postaci ×1,15 (do potwierdzenia).
- Chodzenie ×0,7, krótkie kroki w stronę gracza, postój 1–1,5 s po kroku.
- Rzuca z odległości 5–6 ludzików (0,31–0,375 szerokości pola). Zasada awaryjna: po ok. 5 s bez możliwości podejścia rzuca z największej możliwej odległości. Wymaga nowego zachowania w zwykłej Arenie (podchodzenie jest teraz tylko w Wielkiej arenie), bo nie przekracza przekątnej.
- Przerwa między rzutami 3–4,5 s. Siła rzutu 0,05–0,15 (śnieżka ok. 0,65–0,75 szerokości pola na sekundę). Zamach min. 0,5 s niezależnie od siły.
- Celuje tylko w punkt, w którym stoi gracz, bez wyprzedzania; rozrzut 0,053 (ok. 70% trafień w stojącego gracza).
- Unik 15%, czas reakcji 0,5 s (w praktyce kilka procent, bo rzuca z bliska).
- Bonusy: szansa 10%. Stanowiska: 0%. Umiejętności: brak.

**Limonkowy (Zwiadowca): ZROBIONY (krok A3), poziomy 4–6 (3Z+1L, 3Z+2L, 3Z+3L).**
- Życia 3 stałe, ogłuszenie 1,2 s, rozmiar 1,0.
- Stała umiejętność „Laska cukrowa”: chód ×1,4 (0,42 szerokości pola na sekundę, szybszy od gracza bez bonusu).
- Kroki 0,08–0,12 w stronę gracza (±25°), postój 0,5–1 s, rzuca z 0,375–0,4375 (6–7 ludzików), zasada awaryjna jak u Zielonego.
- Przerwa 3–4,5 s, siła 0,1–0,3, zamach min. 0,4 s, rozrzut 0,047 (ok. 80% trafień w stojącego).
- Unik 30%, reakcja 0,6 s, bonusy 20%, stanowiska 10%. Cena umiejętności: słabe śnieżki i rzadkie rzuty.

**Żółty (Biegacz): ZROBIONY (krok C3), od poziomu 6.** Wartości jak w prompcie C3. Rozrzut ze startu (0,077) dawał w symulacji ok. 45% trafień w stojącego, więc poprawiony na 0,111 (ok. 30%).

**Pomarańczowy (Snajper): ZROBIONY (krok C4), od poziomu 8.** Rozrzut 0,038 = ok. 99% trafień w stojącego (symulacja). W kodzie punkt celu był ustalany przy puszczeniu, więc dodane pole typu `celNaPoczatkuZamachu` (decyzja Jakuba: tylko Snajper): punkt celu zapamiętany na początku zamachu. W małej Arenie odległość 0,5–0,6 często jest nieosiągalna, wtedy rzuca z miejsca po zasadzie awaryjnej (5 s).

**Turkusowy (Szybkostrzelec): ZROBIONY (krok C5), od poziomu 10.** Rozrzut ze startu (0,071) dawał ok. 49%, poprawiony na 0,084 (ok. 40%).

**Błękitny (Unikacz): ZROBIONY (krok C6), od poziomu 12.** Nowe pola typu `ucieka` i `progUcieczki` (0,8), działają w Arenie (`podchodzenieWArenie` w ai.js). Rozrzut ze startu (0,068) dawał ok. 50%, poprawiony na 0,075 (ok. 45%).

### Odłożone na później
- Drużyna 3 zawodników: zaznaczanie zawodnika, zaznaczanie celów, automatyczne uniki i rzuty niezaznaczonych.
- Kampania: boss, inne cele (flaga, fort, przetrwaj 60 s), gwiazdki, odblokowywanie skórek.
- Multiplayer przez internet.

### Multiplayer przez internet (późny etap)
- GitHub Pages to hosting statyczny, nie ma serwera. Potrzebne będzie osobne rozwiązanie: serwer WebSocket (stałe połączenie przeglądarka–serwer) lub WebRTC (bezpośrednie połączenie telefonów).
- Najłatwiejszy krok pośredni: dwóch graczy na jednym telefonie.
- Decyzja o technologii dopiero po tym, jak działa kampania.

---

## Jak pracować z Claude Code
- Plan i przygotowanie robimy na czacie, budujemy w Claude Code.
- Plik `CLAUDE.md` w głównym folderze repozytorium (stała pamięć projektu dla agenta).
- Małe kroki, test na telefonie po każdym kroku.
- GitHub Pages włączone od początku, commit po każdym działającym kroku.
