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
6. **Trafienia:** śnieżka **trafia każdego, kto stoi na jej drodze** (przeciwnika, nie samego rzucającego). Dwa trafienia ogłuszają na 1 s, trzecie eliminuje. Liczba trafień liczy się przez cały poziom.
7. **Ruch w trakcie ładowania** jest dozwolony (dwa kciuki: jeden na padzie, drugi na planszy).
8. **Przeładowanie:** po rzucie 0,5 s plus czas, który przytrzymaliśmy siłę. W tym czasie można się ruszać, ale nowe dotknięcie planszy nic nie rzuca. Pierścień pod stopami pokazuje odliczanie.
9. **Przeciwnicy:** te same reguły co gracz. Przed rzutem **unoszą śnieżkę nad głowę** (ostrzeżenie): im silniejszy rzut, tym dłużej unoszenie. Poziom 1: 1 przeciwnik, poziom 2: 2, poziom 3: 3 itd. Wyższe poziomy: lepsze uniki i celność.
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
- **Wielka arena:** świat 2 × 2 pola, kamera jedzie za graczem, bez przekątnej, 18 dekoracji w całym świecie. Przeciwnicy podchodzą na odległość rzutu i rzucają tylko, gdy są na ekranie gracza. Kroki: W1 (zrobione: menu, świat, kamera, ruch, AI), W2 (zrobione: strzałki do przeciwników poza ekranem, zasięg śnieżki do szerokości widoku, neutralne stanowiska ze wspólną amunicją, bonusy w całym świecie, do 4 naraz, co 4–7 s), W3 (zamieć: po 90 s świat przez 30 s zwęża się do jednego pola, ostrzeżenie 10 s wcześniej, wiatr spycha postacie do środka).

### Przeciwnicy według poziomów
- Poziomy 1–3: chodzą losowo, reagują wolno albo wcale.
- Środek: widzą start śnieżki i po krótkiej reakcji robią krok w bok.
- Wyższe: przewidują tor i uciekają, ale zwinność jest ograniczona.
- Trudność = czas reakcji, szansa uniku, celność, częstość rzutów.

### Osłony i przeszkody (nasze rozszerzenie)
Choinki, bałwany, mury ze śniegu, skrzynki z prezentami, laski cukrowe jako płotek, igloo, sanie, zamarznięty staw (ślizganie), zaspy (spowolnienie).

### Bonusy (pomysły)
Aktywowane trafieniem śnieżką (rzut w miejsce bonusu).
- Bombka: tarcza na jedno trafienie.
- Laska cukrowa: szybszy bieg na kilka sekund.
- Gwiazdka: podwójny rzut.
- Pierniczek: przywraca jedno trafienie (zdejmuje ogłuszenie lub trafienie).
- Gorące kakao: zamrożenie przeciwników na 2–3 s.
- Mocny rzut: następne 3 śnieżki mocniejsze.
- Pomysł: bonusy negatywne.

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
