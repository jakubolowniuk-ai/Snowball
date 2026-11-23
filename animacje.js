// Animacje zawodnika: maszyna stanów, czyli kod, który pamięta, co postać teraz robi
// (stoi, idzie, ...) i wybiera klatkę z atlasu.
// Akcje (mają pierwszeństwo przed stanie/chod): "zamach" (celowanie: zamach_1, potem
// zamach_2 trzymana do rzutu; u przeciwnika to ostrzeżenie przed rzutem) i "rzut"
// (rzut, przedluzenie, powrot; śnieżka wylatuje od razu, w klatce "rzut").
// Przeładowanie: schylanie i lepienie, gdy postać stoi w trakcie przeładowania (w ruchu
// idzie z pustą ręką). Klatkę liczymy z postępu przeładowania, więc animacja zawsze
// mieści się w czasie gry (czas gry się nie zmienia, to animacja się dopasowuje).
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
    ostatniaKlatka: "stanie", // do wykrycia końca wstawania
    przenikanie: null, // { klatka, czas }: poprzednia klatka znikająca płynnie (po wstawaniu)
  };
}

// Suma czasów listy klatek w sekundach
function czasListy(klatki) {
  return klatki.reduce((s, [, ms]) => s + ms / 1000, 0);
}

// Klatka przeładowania w chwili t (sekundy od końca animacji rzutu), gdy na przeładowanie
// zostaje "dostepne" sekund. Zwraca nazwę klatki albo null (bez schylania).
function klatkaPrzeladowania(widok, t, dostepne) {
  if (t < 0 || dostepne < A().progSchylania) return null;
  const anim = ZAWODNIK.animacje[widok];
  if (dostepne < A().progPelnegoPrzeladowania) {
    // Krótkie: wszystkie klatki rozciągnięte albo ściśnięte do dostępnego czasu
    const lista = anim.przeladowanie_krotkie.klatki;
    return klatkaZListy(lista, (t * czasListy(lista)) / dostepne).nazwa;
  }
  // Pełne: początek (schylenie, przysiad) i koniec (wstawanie) w swoich czasach,
  // a środek (lepienie) powtarzany tyle, ile potrzeba
  const lista = anim.przeladowanie_pelne.klatki;
  const srodek = anim.przeladowanie_pelne.petlaSrodek;
  const pierwszySrodek = lista.findIndex(([n]) => srodek.includes(n));
  const poczatek = lista.slice(0, pierwszySrodek);
  const koniec = lista.slice(pierwszySrodek + srodek.length);
  const petla = lista.slice(pierwszySrodek, pierwszySrodek + srodek.length);
  const tPoczatku = czasListy(poczatek);
  const tKonca = czasListy(koniec);
  if (t < tPoczatku) return klatkaZListy(poczatek, t).nazwa;
  if (t >= dostepne - tKonca) return klatkaZListy(koniec, t - (dostepne - tKonca)).nazwa;
  const tPetli = czasListy(petla);
  return klatkaZListy(petla, (t - tPoczatku) % tPetli).nazwa;
}

// Czy postać jest teraz w klatce przeładowania (schylona)? Zwraca nazwę klatki albo null
function przeladowanieTeraz(z) {
  const a = z.anim;
  if (!a || !(z.przeladowanie > 0) || a.stan !== "stanie") return null;
  const tRzutu = czasListy(ZAWODNIK.animacje[a.widok].rzut.klatki);
  const minelo = z.przeladowanieCalosc - z.przeladowanie;
  return klatkaPrzeladowania(a.widok, minelo - tRzutu, z.przeladowanieCalosc - tRzutu);
}

// Wywoływane przy trafieniu: ogłuszenie (trafiony, potem ogluszony_a/b na zmianę, tak
// długo jak trwa ogłuszenie w grze) albo eliminacja (trafiony, upadek, siedzi, lezy na stałe)
function zacznijAnimacjeTrafienia(z, eliminacja) {
  if (!z.anim) z.anim = nowaAnimacja(z);
  z.anim.akcja = { typ: eliminacja ? "eliminacja" : "trafiony", czas: 0 };
  z.anim.przenikanie = null;
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
    if (z.wyeliminowany) {
      if (a.akcja && a.akcja.typ === "eliminacja") a.akcja.czas += dt;
      continue;
    }

    // Rusza się, gdy prędkość przekracza próg (drobne wypchnięcia przez przeszkody się nie liczą)
    const rusza = dt > 0 && d / dt > j(A().progRuchu);
    // Akcje: trafienie trwa tyle, co ogłuszenie; celowanie = zamach; rzut do końca klatek
    const cel = wektorCelowania(stan, z);
    if (a.akcja && a.akcja.typ === "trafiony") {
      a.akcja.czas += dt;
      if (!(z.ogluszenie > 0)) a.akcja = null;
    } else if (cel) {
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
    const kierunekStoi = a.akcja && (a.akcja.typ === "rzut" || a.akcja.typ === "trafiony");
    if (cel && !kierunekStoi) ustawKierunek(a, cel.dx, cel.dy);
    else if (rusza && !kierunekStoi) ustawKierunek(a, dx, dy);

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

    // Płynne przejście po wstawaniu (w "wstawanie" śnieżka jest w obu dłoniach, w "stanie" w jednej)
    const teraz = nazwaKlatki(z);
    if (a.ostatniaKlatka === "wstawanie" && teraz !== "wstawanie") a.przenikanie = { klatka: "wstawanie", czas: 0 };
    a.ostatniaKlatka = teraz;
    if (a.przenikanie) {
      a.przenikanie.czas += dt;
      if (a.przenikanie.czas >= A().czasPrzenikania) a.przenikanie = null;
    }
  }
}

// Nazwa klatki z atlasu dla obecnego stanu animacji
// Klatka trafienia: "trafiony", potem ogluszony_a i ogluszony_b na zmianę (z tyłu: "stanie")
function klatkaTrafienia(a) {
  if (a.widok === "tyl") return "stanie"; // z tyłu nie ma tych klatek: drżenie i błysk rysuje draw.js
  const lista = ZAWODNIK.animacje.przod.trafiony.klatki;
  const t1 = lista[0][1] / 1000;
  if (a.akcja.czas < t1) return lista[0][0];
  const petla = lista.slice(1);
  return klatkaZListy(petla, (a.akcja.czas - t1) % czasListy(petla)).nazwa;
}

function nazwaKlatki(z) {
  const a = z.anim;
  if (a && a.akcja && a.akcja.typ === "trafiony") return klatkaTrafienia(a);
  if (a && a.akcja && a.akcja.typ === "eliminacja") {
    return klatkaZListy(ZAWODNIK.animacje.przod.eliminacja.klatki, a.akcja.czas).nazwa; // "lezy" zostaje
  }
  if (a && a.akcja) {
    const lista = ZAWODNIK.animacje[a.widok][a.akcja.typ].klatki;
    return klatkaZListy(lista, a.akcja.czas).nazwa; // zamach: zamach_2 trzymana do rzutu
  }
  const przeladowanie = przeladowanieTeraz(z);
  if (przeladowanie) return przeladowanie;
  if (!a || a.stan === "stanie") return "stanie";
  // Chód: klatki z sprites.json (chod_1, chod_2, chod_3, chod_2), co drogaNaKlatkeChodu
  const klatki = ZAWODNIK.animacje.przod.chod.klatki;
  const i = Math.floor(a.droga / j(A().drogaNaKlatkeChodu)) % klatki.length;
  return klatki[i][0];
}
