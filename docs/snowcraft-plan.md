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
2. **Ruch:** za zawodnikiem jest **kropka (uchwyt)** w stałej odległości (ok. 1 cm), zawsze po lewej stronie (z tyłu, bo przeciwnicy są po prawej). Podczas przeciągania jest sztywno przyczepiona i się nie obraca. Każda drużyna chodzi tylko po swojej połowie pola. Dotknięcie kropki i przeciągnięcie porusza zawodnika, który idzie za kropką z ograniczonym limitem prędkości (w `config.js`). Palec nie zasłania zawodnika.
3. **Rzut:** **drugi palec** dotyka dowolnego punktu planszy (poza kropką) i wyznacza **cel** rzutu. Znacznik celu jest dokładnie w miejscu dotyku, cienka linia łączy go z zawodnikiem.
4. **Siła:** przytrzymanie ładuje siłę (max **1,5 s**). Siła zwiększa **prędkość i maksymalny zasięg** śnieżki. Bez paska siły: wzdłuż linii do celu rośnie pierścień zasięgu, a gdy sięga celu, zmienia kolor na zielony. Puszczenie palca = rzut.
5. **Lot śnieżki:** leci prosto w stronę celu. Zatrzymuje się w dotkniętym punkcie albo na końcu zasięgu, jeśli ten jest bliżej. Długie przytrzymanie nie sprawia, że leci za cel. Rysujemy ją z cieniem na ziemi (efekt łuku), to tylko wygląd.
6. **Trafienia:** śnieżka **trafia każdego, kto stoi na jej drodze** (przeciwnika, nie samego rzucającego). Dwa trafienia ogłuszają na 1 s, trzecie eliminuje. Liczba trafień liczy się przez cały poziom.
7. **Ruch w trakcie ładowania** jest dozwolony (dwa kciuki: jeden na kropce, drugi na planszy).
8. **Przeładowanie:** po rzucie 0,5 s plus czas, który przytrzymaliśmy siłę. W tym czasie można się ruszać, ale nowe dotknięcie planszy nic nie rzuca. Pierścień pod stopami pokazuje odliczanie.
9. **Przeciwnicy:** te same reguły co gracz. Przed rzutem **unoszą śnieżkę nad głowę** (ostrzeżenie): im silniejszy rzut, tym dłużej unoszenie. Poziom 1: 1 przeciwnik, poziom 2: 2, poziom 3: 3 itd. Wyższe poziomy: lepsze uniki i celność.
10. **Bonusy:** pojawiają się na planszy i aktywują się trafieniem śnieżką (rzut w ich miejsce).
11. **Wygrana:** wyeliminowanie wszystkich przeciwników. **Przegrana:** wyeliminowanie zawodnika.

### Do rozstrzygnięcia (pytania otwarte)
- Czy cel to pozycja palca w chwili puszczenia (można przesuwać palec podczas przytrzymania). Zakładamy: tak.
- Czy puszczenie palca bardzo blisko zawodnika anuluje rzut. Zakładamy: tak (promień w `config.js`).
- Skala postaci na małych telefonach (5–5,5 cala): sprawdzić po teście u znajomego.

### Układ i wygląd (na podstawie analizy rozgrywki z nagrania)
- **Pole gry:** stałe proporcje 2:1, skalowane tak, żeby mieściło się w ekranie w całości. Tło śnieżne wychodzi poza pole i wypełnia resztę ekranu, bez pustych pasów. Zawodnicy nie wychodzą poza pole, ale kropka może leżeć w marginesie. Wszyscy mają to samo pole gry niezależnie od telefonu.
- **Orientacja:** tylko pozioma. W pionie komunikat "Obróć telefon".
- **Wygląd:** biała połać śniegu z niebieskawym przyciemnieniem brzegów, widok skośnie z góry, cień pod postaciami. Dwie dekoracyjne zaspy w stałych miejscach (bez kolizji).
- **Postacie:** większe niż w oryginale (ok. 1/8 szerokości pola gry zamiast ok. 1/12). Czerwony to gracz, zieloni to przeciwnicy.
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
