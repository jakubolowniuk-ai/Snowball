// Animacje zawodnika: maszyna stanów, czyli kod, który pamięta, co postać teraz robi
// (stoi, idzie, ...) i wybiera klatkę z atlasu.
// Akcje (mają pierwszeństwo przed stanie/chod): "zamach" (celowanie: zamach_1, potem
// zamach_2 trzymana do rzutu; u przeciwnika to ostrzeżenie przed rzutem) i "rzut"
// (rzut, przedluzenie, powrot; śnieżka wylatuje od razu, w klatce "rzut").
// Stany ruchu: "stanie" i "chod". Klatka chodu zależy od przebytej drogi, nie od czasu,
// więc nogi nadążają za prędkością (wolny chód = wolniejsze kroki).
// Kierunek (widok): w dół = przód, w górę = tył, w bok = przód odbity w poziomie.
// Przy celowaniu postać patrzy w stronę celu, w bezruchu zostaje ostatni kierunek.

const A = () => CONFIG.animacje; // skrót do ustawień animacji

// Stan animacji nowej postaci
function nowaAnimacja(z) {
  return {
    stan: "stanie", // "stanie" albo "chod"
    droga: 0, // ile jednostek przeszła od początku chodu (wybiera klatkę chodu)
    bezRuchu: 0, // ile sekund stoi w miejscu (krótkie postoje nie przerywają chodu)
    poprzX: z.x, // pozycja z poprzedniej klatki
    poprzY: z.y,
    // Na starcie: gracz tyłem (patrzy na przeciwników), przeciwnicy przodem
    widok: z.druzyna === "czerwoni" ? "tyl" : "przod",
    odbicie: false, // przód odbity w poziomie (ruch w lewo)
    akcja: null, // { typ: "zamach" | "rzut", czas } albo null
  };
}

// Wywoływane przy rzucie (wykonajRzut): zaczyna animację rzutu
function zacznijAnimacjeRzutu(z) {
  if (!z.anim) z.anim = nowaAnimacja(z);
  z.anim.akcja = { typ: "rzut", czas: 0 };
}

// Klatka z listy [klatka, ms] po czasie t sekund (ostatnia trzymana); zwraca też, czy minęła cała
function klatkaZListy(klatki, t) {
  let suma = 0;
  for (const [nazwa, ms] of klatki) {
    suma += ms / 1000;
    if (t < suma) return { nazwa, koniec: false };
  }
  return { nazwa: klatki[klatki.length - 1][0], koniec: true };
}

// Kierunek z wektora (dx, dy) na ekranie: blisko poziomu (do katBoku stopni) = bok,
// w górę = tył, w dół = przód. Bok w prawo = przód bez odbicia, w lewo = odbity.
function ustawKierunek(a, dx, dy) {
  if (dx === 0 && dy === 0) return;
  const tgBoku = Math.tan((A().katBoku * Math.PI) / 180);
  if (Math.abs(dy) < Math.abs(dx) * tgBoku) {
    a.widok = "przod";
    a.odbicie = dx < 0;
  } else {
    a.widok = dy < 0 ? "tyl" : "przod";
    a.odbicie = false;
  }
}

// Wektor celowania postaci albo null: gracz celujący palcem, przeciwnik unoszący śnieżkę
function wektorCelowania(stan, z) {
  if (z === stan.gracz && stan.celowanie) return { dx: stan.celowanie.x - z.x, dy: stan.celowanie.y - z.y };
  if (z.ai && z.ai.unoszenie) {
    const b = z.ai.unoszenie.bonus;
    const cel = b && stan.bonusy.includes(b) ? b : stan.gracz;
    return { dx: cel.x - z.x, dy: cel.y - z.y };
  }
  return null;
}

// Co klatkę: czy postać się rusza i o ile
function aktualizujAnimacje(stan, dt) {
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (!z.anim) z.anim = nowaAnimacja(z);
    const a = z.anim;
    const dx = z.x - a.poprzX;
    const dy = z.y - a.poprzY;
    const d = Math.hypot(dx, dy);
    a.poprzX = z.x;
    a.poprzY = z.y;
    if (z.wyeliminowany) continue;

    // Rusza się, gdy prędkość przekracza próg (drobne wypchnięcia przez przeszkody się nie liczą)
    const rusza = dt > 0 && d / dt > j(A().progRuchu);
    // Akcje: celowanie = zamach; rzut trwa do końca swoich klatek
    const cel = wektorCelowania(stan, z);
    if (cel) {
      if (!a.akcja || a.akcja.typ !== "zamach") a.akcja = { typ: "zamach", czas: 0 };
      a.akcja.czas += dt;
    } else if (a.akcja && a.akcja.typ === "zamach") {
      a.akcja = null; // celowanie przerwane bez rzutu (np. anulowanie, trafienie)
    } else if (a.akcja && a.akcja.typ === "rzut") {
      a.akcja.czas += dt;
      if (klatkaZListy(ZAWODNIK.animacje[a.widok].rzut.klatki, a.akcja.czas).koniec) a.akcja = null;
    }

    // Kierunek: celowanie ma pierwszeństwo, potem kierunek ruchu; w bezruchu bez zmian.
    // W trakcie rzutu kierunek stoi (rzucająca ręka zostaje po tej samej stronie).
    if (cel) ustawKierunek(a, cel.dx, cel.dy);
    else if (rusza && !(a.akcja && a.akcja.typ === "rzut")) ustawKierunek(a, dx, dy);

    if (rusza) {
      a.bezRuchu = 0;
      if (a.stan !== "chod") {
        a.stan = "chod";
        a.droga = 0;
      }
      a.droga += d;
    } else {
      a.bezRuchu += dt;
      if (a.bezRuchu >= A().opoznienieStania) a.stan = "stanie";
    }
  }
}

// Nazwa klatki z atlasu dla obecnego stanu animacji
function nazwaKlatki(z) {
  const a = z.anim;
  if (a && a.akcja) {
    const lista = ZAWODNIK.animacje[a.widok][a.akcja.typ].klatki;
    return klatkaZListy(lista, a.akcja.czas).nazwa; // zamach: zamach_2 trzymana do rzutu
  }
  if (!a || a.stan === "stanie") return "stanie";
  // Chód: klatki z sprites.json (chod_1, chod_2, chod_3, chod_2), co drogaNaKlatkeChodu
  const klatki = ZAWODNIK.animacje.przod.chod.klatki;
  const i = Math.floor(a.droga / j(A().drogaNaKlatkeChodu)) % klatki.length;
  return klatki[i][0];
}
