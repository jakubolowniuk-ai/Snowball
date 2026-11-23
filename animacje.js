// Animacje zawodnika: maszyna stanów, czyli kod, który pamięta, co postać teraz robi
// (stoi, idzie, ...) i wybiera klatkę z atlasu.
// Krok 2: tylko "stanie" i "chod". Klatka chodu zależy od przebytej drogi, nie od czasu,
// więc nogi nadążają za prędkością (wolny chód = wolniejsze kroki).

const A = () => CONFIG.animacje; // skrót do ustawień animacji

// Stan animacji nowej postaci
function nowaAnimacja(z) {
  return {
    stan: "stanie", // "stanie" albo "chod"
    droga: 0, // ile jednostek przeszła od początku chodu (wybiera klatkę chodu)
    bezRuchu: 0, // ile sekund stoi w miejscu (krótkie postoje nie przerywają chodu)
    poprzX: z.x, // pozycja z poprzedniej klatki
    poprzY: z.y,
  };
}

// Co klatkę: czy postać się rusza i o ile
function aktualizujAnimacje(stan, dt) {
  for (const z of [stan.gracz, ...stan.przeciwnicy]) {
    if (!z.anim) z.anim = nowaAnimacja(z);
    const a = z.anim;
    const d = Math.hypot(z.x - a.poprzX, z.y - a.poprzY);
    a.poprzX = z.x;
    a.poprzY = z.y;
    if (z.wyeliminowany) continue;

    // Rusza się, gdy prędkość przekracza próg (drobne wypchnięcia przez przeszkody się nie liczą)
    const rusza = dt > 0 && d / dt > j(A().progRuchu);
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
