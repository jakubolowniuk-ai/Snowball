# Snowcraft: zasady gry (jak gra działa dziś)

Stan na 26.11.2026. Ten dokument opisuje **mechanizmy**. Dokładne liczby są tylko w `config.js` (w nawiasach podane są nazwy pól). Gdy zmieniasz zachowanie gry, popraw ten dokument. Gdy zmieniasz tylko liczbę w `config.js`, tego dokumentu nie trzeba ruszać.

## Ogólnie
- Gracz steruje jednym czerwonym zawodnikiem (zawsze zaznaczony niebieskim pierścieniem pod stopami). Przeciwnicy to drużyna sterowana przez komputer, w kurtkach w kolorze swojego typu. Wyjątek po stronie gracza: bonus Sojusznik.
- **Wygrana:** wyeliminowani wszyscy przeciwnicy, także ci czekający w kolejce. **Przegrana:** wyeliminowany zawodnik gracza. Po końcu poziomu napis przez `czasNapisuKonca` s i automatyczny restart (wygrana = następny poziom, przegrana = ten sam).
- Gra tylko w poziomie (w pionie komunikat „Obróć telefon”). Pole gry ma proporcje 2:1 (`ASPECT`), wszystkie rozmiary są ułamkami szerokości pola, w kodzie pole ma 1000 jednostek szerokości.

## Sterowanie
- **Ruch: stały joystick (pad)** w prawym dolnym rogu ekranu. Gałka idzie za kciukiem (nie wychodzi poza podstawę, palec może), prędkość rośnie z wychyleniem (po strefie martwej `strefaMartwaPadu`) do `predkoscZawodnika`. Puszczenie zatrzymuje zawodnika. W strefie pada dotyk steruje ruchem, nie celuje.
- **Rzut:** drugi palec dotyka dowolnego punktu planszy. Znacznik celu jest pod palcem, cienka linia łączy go z zawodnikiem. Przytrzymanie ładuje siłę (do `MAX_CHARGE` s), łuk wokół celu pokazuje siłę (pełna = zielony). Puszczenie = rzut. Puszczenie bardzo blisko zawodnika (`promienAnulowania`) anuluje rzut. Rzut można ładować w trakcie ruchu.
- Obsługa wielu palców naraz (każdy palec po `pointerId`).

## Śnieżka
- Siła zmienia **tylko prędkość** (`predkoscSniezkiMin`–`Max`). Śnieżka leci prosto do celu i zatrzymuje się w nim, nigdy dalej. Łuk lotu i cień to tylko wygląd. (`zasiegZalezyOdSily: true` przywraca stary zasięg zależny od siły.)
- **Trafia pierwszą postać z drużyny przeciwnej** na swojej drodze (liczone na ziemi). Swoich nie trafia (`trafianieSwoich: false`). Wyjątek: rzucona przez upitego (bonus Upicie) trafia też swoich.
- Rozbija się o podstawę dekoracji (owal na ziemi). Trafia też bonusy, wieżyczki (drużyny przeciwnej) i je zbiera albo uszkadza (szczegóły niżej).
- **Zbijanie śnieżek:** śnieżka przeciwnika typu z `zbijaSniezki: true` zderza się ze śnieżką drużyny przeciwnej, gdy zbliżą się na `promienZderzeniaSniezek` (najbliższe zbliżenie w czasie klatki). Obie znikają z rozbryzgiem. Na razie żaden typ nie ma włączonego zbijania.
- **Przeładowanie:** po rzucie `czasPrzeladowania` plus czas ładowania siły (u przeciwnika: siła × `MAX_CHARGE`). W tym czasie można się ruszać, ale nie rzucać. Pierścień pod stopami pokazuje odliczanie.

## Trafienia, ogłuszenie, eliminacja
- Każda postać ma liczbę żyć (`maxTrafien`). Gracz: `trafieniaDoEliminacji`. Przeciwnik: `zycia` z wpisu składu poziomu. Sojusznik: `zycia` z bonusu.
- Trafienie, które nie eliminuje, **ogłusza**: postać nie rusza się i nie rzuca przez swój czas ogłuszenia (gracz `czasOgluszenia`, przeciwnik z typu). Ostatnie trafienie eliminuje. Przy 1 życiu pierwsze trafienie od razu eliminuje, bez ogłuszenia.
- Trafienia liczą się przez cały poziom. Wyeliminowani leżą do końca poziomu. Przy trafieniu: biała chmurka, rozbryzg, krótka wibracja telefonu.
- Kropki nad głową pokazują życia (pełne = zostały).

## Strony pola i tryby
- **Arena:** jedno pole. Granica drużyn to przekątna od lewego dolnego do prawego górnego rogu. Gracz w prawym dolnym trójkącie, przeciwnicy w lewym górnym. Nikt nie przechodzi przez przekątną. Kamera stoi.
- **Wielka arena:** świat `swiatSzerokosc` × `swiatWysokosc` pól, kamera łagodnie jedzie za graczem, bez przekątnej (ograniczają tylko granice świata). Zielone strzałki przy krawędzi ekranu pokazują przeciwników poza widokiem. Zasięg śnieżki najwyżej `zasiegSniezki` (szerokość widoku). Stanowiska są neutralne (jeden stos i jedna armatka dla wszystkich).
- **Zamieć (Wielka arena):** po `czasDoZwezania` s granice zwężają się przez `czasZwezania` s do jednego pola, `ostrzezenieZamieci` s wcześniej napis „Zamieć się zbliża!”. Poza granicą mgła, przeszkody, stanowiska i bonusy znikają, wiatr spycha postacie do środka (bez obrażeń).
- **Menu:** Arena, Wielka arena, Kampania (wyszarzona, „wkrótce”). Na ekranie końca poziomu mały przycisk „Menu”.
- **Do testów:** `poziomStartowy` (od którego poziomu zaczyna się gra z menu).

## Poziomy
- Skład poziomu: `skladPoziomow`, lista wpisów `{ typ, ile, zycia }`. Ten sam typ może mieć kilka wpisów z różnymi życiami. Poziom bez wpisu bierze skład najbliższego niższego (poziom 21+ = 20).
- Wpisy są przeplatane (jeden z każdego wpisu po kolei, zaczynając od ostatniego wpisu, czyli najnowszego koloru), więc przy limicie widać różne typy, a najnowsze kolory są na planszy od startu.
- Na planszy najwyżej `maxNaraz` przeciwników. Reszta czeka w kolejce i wchodzi `opoznienieWejscia` s po zwolnieniu miejsca, na swoje miejsce startowe.
- Start w Arenie: rzędy równoległe do przekątnej. W Wielkiej arenie: linia w lewej górnej części świata. Pierwszy rzut każdego: po napisie „Level N”, zwykłej przerwie i losowo do `opoznienieStartuMax` s.
- Plan poziomów 1–20 (kto wchodzi na którym poziomie i dlaczego) jest w `PLAN_WDROZENIA.md`, aktualne wartości w `config.js`.

## Przeciwnicy
Te same reguły co gracz (prędkość, siła, przeładowanie, ogłuszenie). Różnią się tym, że decyzje podejmuje komputer (`ai.js`). Przeciwnicy bliżej siebie niż rozmiar postaci miękko się odpychają.

### Rzut przeciwnika
1. Decyzja: cel jest w odległości rzutu typu (losowanej przed każdym rzutem z `odlegloscRzutuMin`–`Max`), minęła przerwa (`przerwaMin`–`Max`) i przeładowanie, przeciwnik nie jest w trakcie kroku.
2. Siła losowana z typu (`silaMin`–`Max`). Zamach (ręka za głową, ostrzeżenie) trwa max(`zamachMin`, siła × `MAX_CHARGE`).
3. **Wybór celu w trakcie zamachu:** `celPrzedRzutem` [od, do] = ile sekund przed rzutem przeciwnik ustala punkt rzutu (Twoje miejsce plus losowy błąd w kole o promieniu `rozrzut`). To jest czas, w którym możesz zejść z miejsca. Od tej chwili patrzy w ten punkt.
4. Rzut w zapamiętany punkt. Przeciwnik nie wyprzedza ruchu gracza.
5. Z szansą `szansaBonusu` celuje zamiast tego dokładnie w bonus (tylko gdy bonus jest bliżej niego niż gracza i ma do niego czystą linię).
6. Cel przeciwnika to najbliższy z drużyny gracza: gracz, sojusznik (w Wielkiej arenie tylko na ekranie) albo wieżyczka gracza.

### Ruch przeciwnika
- **Arena:** krótkie kroki w stronę celu (`krokMin`–`Max`, odchylenie `odchylenieKroku`), po kroku postój (`postojMin`–`Max`). W odległości rzutu stoi i rzuca. **Zasada awaryjna:** gdy przez `czasAwaryjny` s nie podejdzie bliżej (np. przekątna nie pozwala), rzuca z miejsca.
- **Wielka arena:** poza ekranem albo dalej niż `zaDaleko` × odległość typu idzie bez postojów odcinkami (`przejscieDaleko`). Bliżej: krótkie kroki z postojami jak w Arenie. Bliżej niż `zaBlisko` × odległość typu cofa się. Rzuca tylko z odległości typu albo bliżej, na ekranie gracza (zapas `marginesWidoku`) i z czystą linią. Zasada awaryjna wyłączona (`zasadaAwaryjna: false`).
- **Ucieczka** (typ z `ucieka: true`, Arena): gdy cel jest bliżej niż `progUcieczki` × `odlegloscRzutuMin`, robi krok od niego. W rogu albo przy przeszkodzie stoi i rzuca.
- **Unik:** gdy śnieżka drużyny przeciwnej leci blisko, z szansą `szansaUniku` po `czasReakcji` s odskakuje w bok (`odskok`). Unik przerywa zamach. Śnieżek własnej drużyny nie unika. Przy stanowisku nie robi uników.
- **Stanowiska:** po rzucie z szansą `szansaStanowiska` idzie do wolnego stanowiska (najwyżej jeden przy stanowisku), stoi tam do wyczerpania amunicji albo ogłuszenia i rzuca z każdej odległości. W Wielkiej arenie wybiera stanowisko tylko, gdy cel jest od niego najwyżej `odlegloscRzutuMax`, i odchodzi, gdy cel się oddali.

### Typy przeciwników
Każdy kolor kurtki to profil kompromisów: lepszy w jednym, słabszy w czymś innym. Liczby w `config.js` → `typy`. „Trafia” to zakładana szansa trafienia stojącego gracza (rozrzut dobrany symulacją, opis w `INSTRUKCJA_WDRAZANIA.md`).

| Typ | Rola | Mocna strona | Cena | Trafia |
|---|---|---|---|---|
| Zielony | Rekrut | dużo czasu na reakcję | wolny, słabe gałki | ok. 70% |
| Limonkowy | Standard | celny, tak szybki jak gracz | nic szczególnego | ok. 80% |
| Żółty | Biegacz | bardzo szybki, rzuca często | bardzo niecelny | ok. 30% |
| Pomarańczowy | Snajper | celny z daleka | długi zamach, długa przerwa | ok. 99% |
| Turkusowy | Szybkostrzelec | rzuca najczęściej | słabe, niecelne gałki | ok. 40% |
| Błękitny | Unikacz | często unika, ucieka przed graczem | słabe rzuty | ok. 45% |
| Szary | Wytrwały | bardzo krótkie ogłuszenie | wolny, rzadko rzuca | ok. 60% |
| Fioletowy | Siłacz | najszybsze gałki | bardzo długi zamach, rzadkie rzuty | ok. 70% |
| Brązowy | od stanowisk | prawie zawsze idzie do stanowiska | zwykły poza nim | ok. 75% |
| Magenta | od bonusów | często celuje w bonusy | zwykły poza tym | ok. 70% |

Typy elitarne (kolory 11–15) są zaplanowane, ale niezrobione (`PLAN_WDROZENIA.md`).

## Bonusy
Ozdoby choinkowe na planszy (`bonusy.js`, ustawienia w `config.js` → `bonusy`). Zdobywa je ten, kto trafi je śnieżką (kosztuje to rzut). Przeciwnicy też je zbierają.
- **Pojawianie się:** Arena: w pasie wokół przekątnej. Wielka arena: w całym aktualnym świecie. Pierwszy po `pierwszyPoSekundach` s, potem co `odstepMin`–`Max` s (Wielka arena: `bonusyOdstepMin`–`Max`), najwyżej `maxNaraz` naraz (zależnie od poziomu), każdy żyje `czasZycia` s i miga pod koniec. Nigdy w strefie pada, w przeszkodzie, przy postaci, za przeszkodą widzianą od gracza ani na stanowisku.
- **Aktywne bonusy** widać jako ikony nad głową z odliczaniem (przy Gwiazdce, Pełnej sile i Miotaczu liczba pozostałych rzutów). Jeden bonus danego typu naraz, ponowne zdobycie odnawia czas. Liczniki stoją w trakcie napisu „Level N” i po końcu poziomu. Nowy poziom i eliminacja czyszczą bonusy.
- Bonus zebrany przez przeciwnika, który działa na drużynę przeciwną, działa na gracza.
- Losowanie według wag (`waga`), do testów `wymusTyp` (każdy nowy bonus tego typu).

| Bonus | Działanie |
|---|---|
| Bombka | tarcza na jedno trafienie (bez zliczenia i ogłuszenia), bańka pęka; przy `odbija: true` śnieżka wraca do rzucającego (odbita nie odbija się drugi raz) |
| Gwiazdka | kilka następnych rzutów albo kilka sekund: wachlarz 3 śnieżek, jedno przeładowanie |
| Laska cukrowa | szybszy bieg przez kilka sekund |
| Pierniczek | od razu zdejmuje jedno trafienie, serduszko nad głową |
| Kakao | krótsze przeładowanie (u przeciwników też przerwa); ze stosem/armatką liczy się najmniejszy mnożnik |
| Pełna siła | kilka rzutów albo kilka sekund: każdy rzut z maksymalną prędkością |
| Spowolnienie przeciwników | drużyna przeciwna chodzi wolniej i dłużej przeładowuje, niebieskawy odcień |
| Spowolnienie śnieżek | śnieżki drużyny przeciwnej lecą wolniej (także te w locie), turkusowa poświata |
| Upicie | wybuch w miejscu bonusu; wszyscy w kręgu (obie drużyny) idą krzywo i kołyszą się; rzut upitego trafia też swoich |
| Niewidzialność | gracz półprzezroczysty; przeciwnicy rzucają na oślep w koło wokół miejsca, gdzie był w chwili zebrania |
| Miotacz | przytrzymany palec strzela seriami bez przeładowania (licznik gałek); przeciwnik strzela seriami |
| Wieżyczka | w miejscu bonusu staje wieżyczka drużyny trafiającego: życia, amunicja, strzela w drużynę przeciwną; nie blokuje ruchu; najwyżej jedna na drużynę |
| Sojusznik | obok zbierającego pojawia się zawodnik jego drużyny sterowany przez komputer (parametry losowego typu, do końca poziomu); u gracza czerwona kurtka, nie liczy się do wygranej ani przegranej; najwyżej jeden na drużynę |

Ikony: `assets/bonusy/`, przypisanie w polu `grafika` typu bonusu (opis w `GRAFIKI.md`).

## Stanowiska
`stanowiska.js`, ustawienia w `config.js` → `stanowiska`. Nie blokują ruchu ani śnieżek. Nowy poziom ustawia amunicję od nowa. W Arenie każda drużyna ma swój stos i swoją armatkę (pozycje lustrzane), w Wielkiej arenie są neutralne ze wspólną amunicją.
- **Stos gałek:** postać w jego promieniu ma przeładowanie razy `mnoznikPrzeladowania`, każdy taki rzut zużywa gałkę, stos maleje i znika.
- **Armatka:** postać w miejscu stania (tuż za armatką) rzuca bez przeładowania, najczęściej co `minOdstepStrzalow` s. Licznik gałek nad armatką, pusta zostaje jako dekoracja. Armatka ma pierwszeństwo przed stosem.
- Gwiazdka (wachlarz) to jeden rzut = jedna gałka. Przy postaci w strefie widać delikatny okrąg.

## Przeszkody i wygląd
- **Mapy** (`mapy.js`, pliki `mapy/<nazwa>.js`): układ planszy, czyli rozmiar świata, teren, dekoracje, stanowiska i miejsca startu. Którą mapę ma tryb: `tryby.mapy` w `config.js` (później każdy poziom ma swoją mapę). Mapa z błędem daje komunikat w konsoli.
- **Teren** (`teren.js`, materiały w `dane/teren.js`): mapa ma siatkę pól (`teren.rozmiarPola`), każde pole ma znak materiału (śnieg, ubity śnieg, lód) albo `.` (zwykłe tło). Gra wypełnia pola teksturą materiału powtarzaną bez szwów, rysuje tylko widoczne pola. W wersji 1 teren zmienia tylko wygląd.
- **Dekoracje** (opis w `dane/dekoracje.js`): z kolizją `owal` są przeszkodami (śnieżka rozbija się o podstawę, postacie nie mogą przez nie przejść), z kolizją `brak` to same ozdoby. Dekoracje z warstwy `ziemia` (np. zamarznięty staw) rysują się zawsze pod postaciami.
- Widok skośnie z góry, tło `assets/tlo/tlo_plansza.png` z niebieskawym przyciemnieniem poza polem i przy brzegach. Cienie, pierścienie, kropki żyć, linie celowania i napisy rysuje kod.
- Postacie z atlasów animacji (`assets/gracze/atlasy/<kolor>.webp`, dane klatek w `obrazy.js`). Kierunek widoku: ruch w dół = przód, w górę = tył, w bok = przód odbity. Animacje: chód, zamach, rzut, przeładowanie (dopasowane do jego czasu), ogłuszenie, eliminacja. Szczegóły klatek w `GRAFIKI.md`.
- **Animacje** (`animacje.js`, ustawienia w `config.js` → `animacje`):
  - Kierunek widoku: w bok do `katBoku` od poziomu = przód odbity. Przy celowaniu (gracz: palec, przeciwnik: zamach) postać patrzy w stronę celu. W bezruchu zostaje ostatni kierunek. Na starcie gracz tyłem, przeciwnicy przodem.
  - Celowanie = zamach (`zamach_1`, potem trzymana `zamach_2`). Puszczenie = rzut, przedłużenie, powrót. Śnieżka wylatuje od razu, kierunek w trakcie rzutu stoi.
  - Przeładowanie dopasowuje się do swojego czasu: zaczyna się po animacji rzutu. Gdy zostaje mniej niż `progSchylania`, zawodnik się nie schyla. Do `progPelnegoPrzeladowania` krótkie (schylenie, przysiad, wstawanie), powyżej pełne (z lepieniem). W ruchu idzie z pustą ręką. Z tyłu przy stopach rośnie śnieżka rysowana kodem. Przejście wstawanie → stanie płynne (`czasPrzenikania`). Śnieżka w dłoni dopiero po końcu przeładowania.
  - Ogłuszenie: `trafiony`, potem `ogluszony_a`/`ogluszony_b` na zmianę tak długo, jak trwa ogłuszenie. Z tyłu (brak klatek) `stanie` z drżeniem i czerwonym błyskiem.
  - Eliminacja: `trafiony`, `upadek`, `siedzi`, `lezy` (zostaje), zawsze z klatek przodu. Czerwony leży głową w lewo, przeciwnicy odbici. Animacje działają też na ekranie końca poziomu.
- Interfejs minimalny: napis „Level N” na początku poziomu, napis końca poziomu, ostrzeżenie o zamieci, strzałki do przeciwników poza ekranem, ikony bonusów i kropki żyć nad głowami.
