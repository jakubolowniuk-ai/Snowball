Snowcraft – plan i pomysły
Status: planowanie. Nic jeszcze nie zbudowane. Budujemy z agentem Claude Code.
Ostatnia aktualizacja: 19.11.2026
CZĘŚĆ A: Oryginał (fakty)
Pochodzenie
Gra przeglądarkowa (Shockwave/Flash) od Nicholson NY, 1998 r. Rozsyłana jako świąteczna kartka. Wersje na Windows datowane na 2000/2001. Była też wersja na iPhone'a (2010).
Tylko jeden gracz (przeciw komputerowi).
Zasady
Gracz steruje trzema chłopcami w czerwonych strojach. Przeciwnik (komputer) ma drużynę zielonych.
Cel: wyeliminować całą drużynę przeciwną śnieżkami.
Poziom 1: 3 przeciwników. Poziom 2: 5 przeciwników. Dalej liczba rośnie, a przeciwnicy lepiej unikają trafień.
Trafienia (potwierdzone przez Jakuba): pierwsze dwa trafienia ogłuszają (chwilowo nie można sterować dzieciakiem), trzecie eliminuje. Różne strony podają różnie (2 lub 3), przyjmujemy wersję Jakuba.
Brak przeszkód i osłon w oryginale (potwierdzone przez Jakuba). Osłony to nasze rozszerzenie.
Widok: stały ekran, skośnie z góry (wg opisu serwisu z grami porzuconymi).
Sterowanie w oryginale (mysz)
Steruje się jednym chłopcem naraz. Najechanie kursorem na swojego dzieciaka zaznacza go (pojawia się celownik).
Trzymasz przycisk myszy i przesuwasz go po ekranie. Czas przytrzymania ustawia siłę rzutu.
Puszczenie przycisku: dzieciak rzuca śnieżką.
Ruch i ładowanie siły dzieją się razem.
Nieznane (nie zgadujemy)
Dokładne celowanie w oryginale (kierunek rzutu).
Czy był limit śnieżek.
CZĘŚĆ B: Nasza wersja
Decyzje podjęte
Platforma: telefon (przeglądarka, PWA), hosting GitHub Pages.
Drużyna: 3 zawodników.
Grafika: kreskówkowa jak w oryginale, trochę dopracowana, z dodatkowymi detalami.
Odbiorcy: Jakub i znajomi.
Tryby: kampania jednoosobowa najpierw. Multiplayer przez internet później.
Zaczynamy od prototypu, który ma już dawać poczucie gry, a nie być surową aplikacją.
Osłony i przeszkody w zimowym/świątecznym stylu.
Mechanika (ustalona z Jakubem)
Zaznaczanie zawodnika: w dowolnej chwili można zaznaczyć każdego z trzech swoich zawodników.
Ruch: po zaznaczeniu przesuwamy zawodnika, trzymając palec w pobliżu niego. Zawodnik idzie w stronę palca.
Celowanie: każdy zawodnik ma przypisany własny cel. Można zaznaczyć tylu celów, ilu zawodników jest w drużynie. Rzut leci w najbliższego z zaznaczonych. Bez zaznaczenia: w najbliższego przeciwnika. Zmiana celu: dotknięcie nowego celu dodaje go do zaznaczonych. Gdy limit jest pełny, odznacza się ten zaznaczony cel, który jest najbliżej (czyli zwykle ten, w który właśnie rzucamy). Przy jednym zawodniku dotknięcie nowego celu po prostu zastępuje stary. "Najbliżej" oznacza najbliżej zaznaczonego zawodnika. Ponowne dotknięcie zaznaczonego celu odznacza go. Limit zaznaczeń maleje, gdy zawodnik odpada z gry (limit = liczba zawodników w drużynie).
Bonusy zaznacza się tak samo jak przeciwników (jako cel) i trafia śnieżką. Zaznaczony bonus zajmuje jedno z miejsc w limicie zaznaczeń.
Niezaznaczeni zawodnicy: unikają trafień automatycznie, w takim stopniu jak ustawiony poziom komputera. Rzucają sami (automatycznie, gdy się przeładują).
Rzut gracza: przed zaznaczonym zawodnikiem jest pole rzutu, które przesuwa się razem z nim. Wciśnięcie pola powoduje rzut. Im dłużej pole jest przytrzymane, tym silniejszy rzut. Maksymalny czas przytrzymania: 1,5 s.
Śnieżka: leci przez całą planszę. Im słabszy rzut, tym wolniej leci. Trafia każdego, kto stoi na drodze, także zawodnika z własnej drużyny.
Przeładowanie: po rzucie zawodnik ładuje się 3 sekundy plus czas, który przytrzymaliśmy siłę (mocniejszy rzut = dłuższe czekanie). W tym czasie może się ruszać.
Trafienia: dwa trafienia ogłuszają, trzecie eliminuje. Ogłuszenie trwa 3 sekundy. Liczba trafień zawodnika liczy się przez cały poziom.
Przeciwnicy: te same reguły co gracz (ładowanie, przeładowanie, ogłuszenie). W miarę wzrostu poziomu coraz lepiej unikają śnieżek. Liczba przeciwników rośnie jak w oryginale (3, 5, …).
Gest jednym palcem (potwierdzony przez Jakuba)
Dotyk zaczęty poza polem rzutu: zawodnik idzie w stronę palca.
Wsunięcie palca na pole rzutu (bez odrywania): zawodnik się zatrzymuje, zaczyna się ładowanie siły.
Puszczenie palca na polu: rzut.
Zsunięcie palca z pola przed puszczeniem: anulowanie rzutu, wracamy do ruchu.
Pole jest wygaszone i pokazuje odliczanie, gdy zawodnik się przeładowuje.
Pole leży na linii zawodnik → cel, w stałej odległości. Gdy palec jest na polu, jego położenie jest zablokowane (żeby zmiana "najbliższego" nie wyrywała pola spod palca).
Do rozstrzygnięcia (pytania otwarte)
Co robi pole, gdy zawodnik stoi przy krawędzi planszy i pole wypadałoby poza ekran.
Orientacja ekranu (domyślnie poziomo jak w oryginale).
Prototyp (zakres v0)
Jeden poziom: 3 zawodników vs 3 przeciwników.
Mechanika z listy powyżej.
Prosta sztuczna inteligencja przeciwników (poruszanie, unikanie, rzut).
Wygrana/przegrana i restart.
1–2 bonusy do przetestowania.
2–3 osłony zimowe/świąteczne.
Cel: sprawdzić, czy sterowanie jednym palcem (ruch + zaznaczanie + rzut) dobrze się czuje na telefonie.
Przeciwnicy według poziomów
Poziomy 1–3: chodzą losowo, reagują wolno albo wcale.
Środek: widzą start śnieżki i po krótkiej reakcji robią krok w bok.
Wyższe: przewidują tor i uciekają, ale zwinność jest ograniczona.
Trudność = czas reakcji, szansa uniku, celność, częstość rzutów.
Osłony i przeszkody (nasze rozszerzenie)
Choinki, bałwany, mury ze śniegu, skrzynki z prezentami, laski cukrowe jako płotek, igloo, sanie, zamarznięty staw (ślizganie), zaspy (spowolnienie).
Bonusy (pojawiają się na planszy)
Aktywowane trafieniem śnieżką. Bonus zaznacza się jak przeciwnika.
Bombka: tarcza na jedno trafienie.
Laska cukrowa: szybszy bieg na kilka sekund.
Gwiazdka: podwójny rzut.
Pierniczek: przywraca jednego eliminowanego zawodnika.
Gorące kakao: zamrożenie przeciwników na 2–3 s.
Duża kula: większy zasięg trafienia następnej śnieżki.
Mocny rzut: następne 3 śnieżki mocniejsze.
Pomysł: bonusy negatywne.
Kampania (później)
Typy przeciwników: unikający, celni, goniący.
Boss na końcu rozdziału.
Inne cele: zdobądź flagę, obroń fort, przetrwaj 60 sekund.
Gwiazdki za poziom (czas, straty).
Odblokowywanie postaci i skórek (czapki, szaliki).
Multiplayer przez internet (późny etap)
GitHub Pages to hosting statyczny, nie ma serwera. Potrzebne będzie osobne rozwiązanie: serwer WebSocket (stałe połączenie przeglądarka–serwer) lub WebRTC (bezpośrednie połączenie telefonów).
Najłatwiejszy krok pośredni: dwóch graczy na jednym telefonie.
Decyzja o technologii dopiero po tym, jak działa kampania.
Jak pracować z Claude Code
Plan i przygotowanie robimy na czacie, budujemy w Claude Code.
Plik CLAUDE.md w głównym folderze repozytorium (stała pamięć projektu dla agenta).
Małe kroki, test na telefonie po każdym kroku.
GitHub Pages włączone od początku, commit po każdym działającym kroku.
