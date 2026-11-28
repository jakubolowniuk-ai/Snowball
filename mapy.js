// Mapy: układ planszy (świat, teren, dekoracje, stanowiska, starty) w osobnych plikach mapy/*.js.
// Każdy plik mapy dopisuje się do MAPY, np. MAPY.arena_1 = { ... } (plik .js, a nie .json,
// bo przeglądarka nie wczyta JSON-a z dysku). Format: docs/PLAN_WDROZENIA.md, "Format mapy".
// Liczby rozgrywki zostają w config.js, w mapie jest tylko układ.

const MAPY = {};
const WERSJA_MAPY = 1; // najnowsza wersja formatu mapy

// Mapa dla trybu (każdy poziom dostanie swoją mapę w etapie 4; na razie jedna na tryb)
// Do testów: adres z ?mapa=nazwa (np. index.html?mapa=arena_2) wybiera inną mapę tego trybu.
function mapaDlaTrybu(tryb) {
  const zAdresu = new URLSearchParams(location.search).get("mapa");
  if (zAdresu && MAPY[zAdresu] && MAPY[zAdresu].tryb === tryb) return MAPY[zAdresu];
  const id = CONFIG.tryby.mapy[tryb];
  const mapa = MAPY[id];
  if (!mapa) throw new Error(`Brak mapy "${id}" dla trybu "${tryb}" (czy plik mapy/${id}.js jest w index.html?)`);
  return mapa;
}

// Sprawdza mapę. Zwraca listę błędów po polsku (pusta = mapa poprawna).
function bledyMapy(mapa) {
  const bledy = [];
  if (!mapa || typeof mapa !== "object") return ["mapa jest pusta"];
  if (mapa.wersja !== WERSJA_MAPY) bledy.push(`nieznana wersja mapy: ${mapa.wersja} (gra zna ${WERSJA_MAPY})`);
  if (!mapa.swiat || !(mapa.swiat.szerokoscPol > 0) || !(mapa.swiat.wysokoscPol > 0)) bledy.push("zły rozmiar świata");
  for (const d of mapa.dekoracje || []) {
    if (!DEKORACJE[d.id]) bledy.push(`nieznana dekoracja "${d.id}"`);
  }
  const st = mapa.stanowiska || {};
  if (mapa.tryb === "arena" && !(st.czerwoni && st.zieloni)) bledy.push("Arena potrzebuje stanowisk obu drużyn");
  if (mapa.tryb === "wielkaArena" && !st.neutralne) bledy.push("Wielka arena potrzebuje stanowisk neutralnych");
  if (!mapa.start || !mapa.start.gracz || !mapa.start.przeciwnicy) bledy.push("brak miejsc startu");
  const t = mapa.teren;
  if (!t || !(t.rozmiarPola > 0)) bledy.push("zły rozmiar pola terenu");
  else if (t.domyslny !== "tlo" && !MATERIALY[t.domyslny]) bledy.push(`nieznany materiał domyślny "${t.domyslny}"`);
  return bledy;
}

// Wszystkie dekoracje użyte w mapach (do wczytania grafik)
function dekoracjeUzyteWMapach() {
  const id = new Set();
  for (const mapa of Object.values(MAPY)) for (const d of mapa.dekoracje || []) id.add(d.id);
  return [...id].filter((k) => DEKORACJE[k]);
}

// Rozmiary i kotwice dekoracji trafiają do SPRITY, z których korzysta rysowanie
for (const d of Object.values(DEKORACJE)) {
  SPRITY[d.plik] = { szer: d.szer, wys: d.wys, kotwicaX: d.kotwicaX, kotwicaY: d.kotwicaY };
}
