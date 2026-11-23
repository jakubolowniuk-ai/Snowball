// Animacje zawodnika: maszyna stanów, czyli kod, który pamięta, co postać teraz robi
// (stoi, idzie, ...) i wybiera klatkę z atlasu.
// Stany: "stanie" i "chod". Klatka chodu zależy od przebytej drogi, nie od czasu,
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
  };
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
    // Kierunek: celowanie ma pierwszeństwo, potem kierunek ruchu; w bezruchu bez zmian
    const cel = wektorCelowania(stan, z);
    if (cel) ustawKierunek(a, cel.dx, cel.dy);
    else if (rusza) ustawKierunek(a, dx, dy);

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
  if (!a || a.stan === "stanie") return "stanie";
  // Chód: klatki z sprites.json (chod_1, chod_2, chod_3, chod_2), co drogaNaKlatkeChodu
  const klatki = ZAWODNIK.animacje.przod.chod.klatki;
  const i = Math.floor(a.droga / j(A().drogaNaKlatkeChodu)) % klatki.length;
  return klatki[i][0];
}
