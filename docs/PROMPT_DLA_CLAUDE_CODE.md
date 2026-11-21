# Prompt dla Claude Code (wklej w sesji w repozytorium Snowball)

> Uwaga: prompt już wykonany. Jakub zmienił potem jedną decyzję: dekoracje są przeszkodami (zatrzymują śnieżki i postacie), a nie samą ozdobą. Aktualne zasady są w CLAUDE.md.

Przeczytaj CLAUDE.md i docs/snowcraft-plan.md. Dodaję do repo gotowe grafiki. Są w folderze `assets/` w paczce snowcraft_assets.zip, a rozmiary i kotwice opisują `sprites.json` i `README_GRAFIKI.md`. WAŻNE: grafiki są zmniejszone względem obecnych rozmiarów gry. W kroku 3 zmień w `config.js` `rozmiarPostaci` na `1 / 16` i `promienSniezki` na `0.0065`, żeby hitbox i śnieżka pasowały do grafik (sprawdź też `odlegloscKropki`, `promienDotykuKropki` i inne wartości zależne od rozmiaru postaci i zaproponuj korekty).

Pracuj małymi krokami według CLAUDE.md: najpierw pokaż krótki plan i poczekaj na moją zgodę, potem jeden krok = jedna rzecz do sprawdzenia na telefonie, commit po każdym kroku, numer `?v=` w index.html podbijaj przy każdym kroku.

Kroki do zaproponowania w planie:
1. Wgraj folder `assets/` do repo i dodaj ładowanie obrazków (osobny plik `obrazy.js`). Gra startuje po załadowaniu wszystkich obrazków. Wygląd bez zmian.
2. Tło: rysuj `assets/tlo/tlo_plansza.png` jako tło całego ekranu. Pole gry leży w tym pliku od punktu (200, 250) px, ma 2000 x 1000 px (2 px = 1 jednostka pola). Zapytaj mnie, czy zostawić niebieskie przyciemnienie brzegów pola.
3. Zawodnicy: zamień kółka na grafiki. Gracz = `gracze/czerwony_przod.png`, przeciwnik = `gracze/zielony_przod.png`. Rozmiar bierz z `sprites.json` (szer_jedn, wys_jedn), podeszwy butów kładź w punkcie (z.x, z.y + 0.85 * PROMIEN_POSTACI) z użyciem kotwicy. Cień, pierścień, kropki żyć i ogłuszenie (przezroczystość) zostają w kodzie. Uwaga: grafika zawodnika trzyma śnieżkę w ręce, a kod rysuje uniesioną śnieżkę przeciwnika osobno. Powiedz mi wprost, jak to najlepiej rozwiązać, i poczekaj na moją decyzję.
4. Efekty: śnieżka z `efekty/sniezka.png` (ok. 13 jednostek średnicy) zamiast białego koła, chmurka po trafieniu z `obloczek_sniegu_*` i losowego `rozbryzg_*`. Cienie śnieżek zostają w kodzie.
5. Dekoracje (`dekoracje/`): tylko ozdoba, BEZ kolizji. Pozycje trzymaj w `config.js` jako listę {plik, x, y}. Zaproponuj 4–6 pozycji i pokaż mi je przed wdrożeniem. Omijaj miejsca startowe i środek pola, rysuj razem z postaciami posortowane po y.
6. Na końcu, osobno: zawodnik z tyłu (`*_tyl.png`).

Zasady: nie zmieniaj reguł gry, nie dodawaj kolizji, nie dodawaj funkcji, o które nie prosiłem. Jeśli obiekty okażą się za duże na telefonie, dodaj w `config.js` jeden mnożnik skali grafik, zamiast zmieniać pliki.
