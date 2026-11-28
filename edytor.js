// Edytor map. Wczytuje mapę z mapy/*.js i pokazuje ją: tło, teren, dekoracje, stanowiska,
// miejsca startu i siatkę pól. Dwa palce (albo kółko myszy) zawsze przesuwają i powiększają,
// jeden palec używa wybranego narzędzia (rączka przesuwa, narzędzia terenu w edytorTeren.js).
// Rysujemy tylko po zmianie (przesunięcie, powiększenie), a tło z terenem raz do bufora.

const widokPlotno = document.getElementById("widok");
const wctx = widokPlotno.getContext("2d");
const TLO_EDYTORA = "assets/tlo/tlo_plansza.png";

const edytor = {
  idMapy: null,
  mapa: null, // kopia mapy, którą oglądamy (później: edytujemy)
  bufor: null, // płótno z tłem i terenem całej mapy
  buforSkala: 1, // pikseli bufora na jednostkę pola
  widok: { x: 0, y: 0, zoom: 1 }, // lewy górny róg ekranu w świecie i pikseli CSS na jednostkę
  siatka: true,
  doNarysowania: true,
  narzedzie: "raczka", // wybrane narzędzie (edytorTeren.js)
};
// Miejsce na ekranie zajęte przez paski (pikseli CSS): góra, lewo (narzędzia), prawo (paleta)
const MARGINES = { gora: 60, lewo: 64, prawo: 76, dol: 40 };

// --- Wczytanie grafik (tło, wszystkie dekoracje, tekstury terenu) ---
function wczytajGrafikiEdytora(gotowe) {
  const sciezki = [TLO_EDYTORA, ...Object.values(DEKORACJE).map((d) => d.plik), ...Object.values(MATERIALY).map((m) => m.plik)];
  let zostalo = sciezki.length;
  for (const sciezka of sciezki) {
    const img = new Image();
    img.onload = () => {
      OBRAZY[sciezka] = img;
      if (--zostalo === 0) gotowe();
    };
    img.onerror = () => {
      console.error("Nie wczytano obrazka: " + sciezka);
      if (--zostalo === 0) gotowe();
    };
    img.src = sciezka;
  }
}

// --- Mapa ---
function rozmiarSwiata(mapa) {
  return { w: mapa.swiat.szerokoscPol * SZEROKOSC_POLA, h: mapa.swiat.wysokoscPol * WYSOKOSC_POLA };
}

function wczytajMape(id) {
  edytor.idMapy = id;
  edytor.mapa = JSON.parse(JSON.stringify(MAPY[id])); // kopia: oryginał zostaje bez zmian
  przygotujTerenDoEdycji(); // pełna siatka pól (edytorTeren.js), nowa historia cofania
  zbudujBuforEdytora();
  dopasujWidok();
  pokazInfo();
  document.getElementById("przyciskGraj").href = "index.html?mapa=" + id;
  edytor.doNarysowania = true;
}

// Tło (śnieg z obrazka tła powtórzony) i teren całej mapy, raz do bufora
function zbudujBuforEdytora() {
  const mapa = edytor.mapa;
  const { w, h } = rozmiarSwiata(mapa);
  // Ostrość bufora: 2 piksele na jednostkę (jak grafiki), mniej przy bardzo dużych mapach
  const R = Math.min(2, Math.sqrt(CONFIG.maxPikseliTla / (w * h)));
  const plotno = document.createElement("canvas");
  plotno.width = Math.ceil(w * R);
  plotno.height = Math.ceil(h * R);
  const c = plotno.getContext("2d");
  c.scale(R, R);
  const obraz = OBRAZY[TLO_EDYTORA];
  if (obraz) {
    // Wycinek tła z samym polem gry, powtarzany jak kafelki (jak w Wielkiej arenie w grze)
    const s = SPRITY[TLO_EDYTORA];
    const px = obraz.width / s.szer;
    const wycinek = document.createElement("canvas");
    wycinek.width = Math.round(SZEROKOSC_POLA * px);
    wycinek.height = Math.round(WYSOKOSC_POLA * px);
    wycinek.getContext("2d").drawImage(obraz, s.poleX * px, s.poleY * px, wycinek.width, wycinek.height, 0, 0, wycinek.width, wycinek.height);
    const wzor = c.createPattern(wycinek, "repeat");
    wzor.setTransform(new DOMMatrix().scale(1 / px));
    edytor.wzorTla = wzor;
  } else {
    edytor.wzorTla = CONFIG.kolorSniegu;
  }
  edytor.buforCtx = c;
  edytor.wzory = {}; // wzory materiałów dla tego bufora
  c.fillStyle = edytor.wzorTla;
  c.fillRect(0, 0, w, h);
  // Teren: wiersze pól, sąsiednie pola z tym samym materiałem jako jeden prostokąt
  const teren = mapa.teren;
  const r = teren.rozmiarPola;
  for (let wiersz = 0; wiersz < Math.ceil(h / r); wiersz++) {
    let k = 0;
    const kolumn = Math.ceil(w / r);
    while (k < kolumn) {
      const id = materialPola(teren, k, wiersz);
      let koniec = k + 1;
      while (koniec < kolumn && materialPola(teren, koniec, wiersz) === id) koniec++;
      const wzor = id && wzorBufora(id);
      if (wzor) {
        c.fillStyle = wzor;
        c.fillRect(k * r, wiersz * r, (koniec - k) * r, r);
      }
      k = koniec;
    }
  }
  edytor.bufor = plotno;
  edytor.buforSkala = R;
}

function wzorBufora(id) {
  if (!edytor.wzory[id]) edytor.wzory[id] = wzorMaterialu(edytor.buforCtx, id);
  return edytor.wzory[id];
}

// Rysuje od nowa jedno pole w buforze (po malowaniu pędzlem, bez przebudowy całości)
function odswiezPoleBufora(k, w) {
  const c = edytor.buforCtx;
  const r = edytor.mapa.teren.rozmiarPola;
  const { w: sw, h: sh } = rozmiarSwiata(edytor.mapa);
  const x = k * r;
  const y = w * r;
  const szer = Math.min(r, sw - x);
  const wys = Math.min(r, sh - y);
  c.fillStyle = edytor.wzorTla;
  c.fillRect(x, y, szer, wys);
  const id = materialPola(edytor.mapa.teren, k, w);
  const wzor = id && wzorBufora(id);
  if (wzor) {
    c.fillStyle = wzor;
    c.fillRect(x, y, szer, wys);
  }
  edytor.doNarysowania = true;
}

function pokazInfo() {
  const m = edytor.mapa;
  const { w, h } = rozmiarSwiata(m);
  const r = m.teren.rozmiarPola;
  const bledy = bledyMapy(m);
  const el = document.getElementById("info");
  // Krótko, żeby zmieściło się w jednej linii na telefonie (nazwa mapy jest na liście)
  el.textContent =
    `${m.tryb === "arena" ? "Arena" : "Wielka arena"} · ${Math.ceil(w / r)}×${Math.ceil(h / r)} pól · ${m.dekoracje.length} dekoracji` +
    (bledy.length ? ` · BŁĘDY: ${bledy.join("; ")}` : "");
  el.className = bledy.length ? "blad" : "";
}

// --- Widok: przesuwanie i powiększanie ---
let gestosc = 1;

function dopasujPlotno() {
  gestosc = Math.min(window.devicePixelRatio || 1, CONFIG.maxGestoscEkranu);
  widokPlotno.width = Math.round(widokPlotno.clientWidth * gestosc);
  widokPlotno.height = Math.round(widokPlotno.clientHeight * gestosc);
  edytor.doNarysowania = true;
}

// Najmniejsze powiększenie: cała mapa (z marginesem) mieści się na ekranie
function zoomDopasowany() {
  const { w, h } = rozmiarSwiata(edytor.mapa);
  const szer = widokPlotno.clientWidth - MARGINES.lewo - MARGINES.prawo;
  const wys = widokPlotno.clientHeight - MARGINES.gora - MARGINES.dol;
  return Math.min(szer / (w * 1.04), wys / (h * 1.06));
}

function dopasujWidok() {
  const { w, h } = rozmiarSwiata(edytor.mapa);
  const zoom = zoomDopasowany();
  edytor.widok.zoom = zoom;
  const srodekX = (MARGINES.lewo + widokPlotno.clientWidth - MARGINES.prawo) / 2;
  const srodekY = (MARGINES.gora + widokPlotno.clientHeight - MARGINES.dol) / 2;
  edytor.widok.x = w / 2 - srodekX / zoom;
  edytor.widok.y = h / 2 - srodekY / zoom;
  edytor.doNarysowania = true;
}

// Powiększenie razy "ile" wokół punktu ekranu (sx, sy) w pikselach CSS
function powieksz(ile, sx, sy) {
  const v = edytor.widok;
  const min = zoomDopasowany() * 0.5;
  const max = zoomDopasowany() * 10;
  const nowy = Math.min(max, Math.max(min, v.zoom * ile));
  // Punkt świata pod palcem zostaje pod palcem
  const wx = v.x + sx / v.zoom;
  const wy = v.y + sy / v.zoom;
  v.zoom = nowy;
  v.x = wx - sx / nowy;
  v.y = wy - sy / nowy;
  edytor.doNarysowania = true;
}

function przesun(dx, dy) {
  edytor.widok.x -= dx / edytor.widok.zoom;
  edytor.widok.y -= dy / edytor.widok.zoom;
  edytor.doNarysowania = true;
}

// Palce (i mysz) rozpoznawane po pointerId: jeden przesuwa, dwa przesuwają i powiększają
const palce = new Map();

function srodekIRozstaw() {
  const p = [...palce.values()];
  return {
    x: (p[0].x + p[1].x) / 2,
    y: (p[0].y + p[1].y) / 2,
    d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1,
  };
}

// Punkt ekranu (piksele CSS) -> punkt świata (jednostki pola)
function ekranNaSwiat(sx, sy) {
  return { x: edytor.widok.x + sx / edytor.widok.zoom, y: edytor.widok.y + sy / edytor.widok.zoom };
}

widokPlotno.addEventListener("pointerdown", (e) => {
  widokPlotno.setPointerCapture(e.pointerId);
  palce.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (palce.size === 1) {
    if (edytor.narzedzie !== "raczka") zacznijNarzedzie(ekranNaSwiat(e.clientX, e.clientY));
  } else {
    przerwijNarzedzie(); // drugi palec: to gest przesuwania, a nie malowanie
  }
});

widokPlotno.addEventListener("pointermove", (e) => {
  const p = palce.get(e.pointerId);
  if (!p) return;
  if (palce.size === 1) {
    if (edytor.narzedzie === "raczka") przesun(e.clientX - p.x, e.clientY - p.y);
    else ruchNarzedzia(ekranNaSwiat(e.clientX, e.clientY));
  } else if (palce.size === 2) {
    const przed = srodekIRozstaw();
    p.x = e.clientX;
    p.y = e.clientY;
    const po = srodekIRozstaw();
    przesun(po.x - przed.x, po.y - przed.y);
    powieksz(po.d / przed.d, po.x, po.y);
    return;
  }
  p.x = e.clientX;
  p.y = e.clientY;
});

function puscPalec(e) {
  if (palce.size === 1 && palce.has(e.pointerId)) zakonczNarzedzie(ekranNaSwiat(e.clientX, e.clientY));
  palce.delete(e.pointerId);
}
widokPlotno.addEventListener("pointerup", puscPalec);
widokPlotno.addEventListener("pointercancel", puscPalec);

widokPlotno.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    powieksz(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
  },
  { passive: false }
);

// --- Rysowanie ---
function rysujEdytor() {
  const v = edytor.widok;
  const mapa = edytor.mapa;
  const { w, h } = rozmiarSwiata(mapa);
  wctx.setTransform(1, 0, 0, 1, 0, 0);
  wctx.clearRect(0, 0, widokPlotno.width, widokPlotno.height);
  // Od teraz rysujemy w jednostkach świata
  const s = gestosc * v.zoom;
  wctx.setTransform(s, 0, 0, s, -v.x * s, -v.y * s);
  const piksel = 1 / v.zoom; // jeden piksel CSS w jednostkach świata (grubość linii, napisy)

  if (edytor.bufor) wctx.drawImage(edytor.bufor, 0, 0, w, h);

  // Siatka pól terenu (gdy pola nie są za małe na ekranie)
  const r = mapa.teren.rozmiarPola;
  if (edytor.siatka && r * v.zoom >= 6) {
    wctx.strokeStyle = "rgba(42, 74, 102, 0.25)";
    wctx.lineWidth = piksel;
    wctx.beginPath();
    for (let x = 0; x <= w; x += r) {
      wctx.moveTo(x, 0);
      wctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += r) {
      wctx.moveTo(0, y);
      wctx.lineTo(w, y);
    }
    wctx.stroke();
  }

  rysujPodgladNarzedzia(wctx, piksel); // np. ramka prostokąta w trakcie przeciągania

  // Arena: przekątna, czyli granica drużyn
  if (mapa.tryb === "arena") {
    wctx.save();
    wctx.setLineDash([8 * piksel, 6 * piksel]);
    wctx.strokeStyle = "rgba(42, 111, 214, 0.7)";
    wctx.lineWidth = 2 * piksel;
    wctx.beginPath();
    wctx.moveTo(0, h);
    wctx.lineTo(w, 0);
    wctx.stroke();
    wctx.restore();
  }

  // Granica świata
  wctx.strokeStyle = "#2a4a66";
  wctx.lineWidth = 2 * piksel;
  wctx.strokeRect(0, 0, w, h);

  rysujStartyEdytora(mapa, piksel);

  // Dekoracje i stanowiska od góry do dołu (bliższe zasłaniają dalsze), ozdoby na ziemi najpierw
  const obiekty = [];
  for (const d of mapa.dekoracje) {
    const opis = DEKORACJE[d.id];
    if (!opis) continue;
    obiekty.push({ y: opis.warstwa === "ziemia" ? -Infinity : j(d.y), rysuj: () => rysujDekoracjeEdytora(opis, j(d.x), j(d.y)) });
  }
  for (const [druzyna, para] of Object.entries(mapa.stanowiska)) {
    for (const [typ, poz] of Object.entries(para)) {
      obiekty.push({ y: j(poz.y), rysuj: () => rysujStanowiskoEdytora(typ, druzyna, j(poz.x), j(poz.y), piksel) });
    }
  }
  obiekty.sort((a, b) => a.y - b.y);
  for (const o of obiekty) o.rysuj();
}

function rysujDekoracjeEdytora(opis, x, y) {
  const obraz = OBRAZY[opis.plik];
  const sz = opis.szer * CONFIG.skalaGrafik;
  const wy = opis.wys * CONFIG.skalaGrafik;
  if (obraz) wctx.drawImage(obraz, x - opis.kotwicaX * sz, y - opis.kotwicaY * wy, sz, wy);
}

const KOLOR_DRUZYNY = { czerwoni: CONFIG.kolorCzerwony, zieloni: CONFIG.kolorZielony, neutralne: "#7f8c8d" };

// Stanowisko jako prosty znak: stos = trzy śnieżki, armatka = szara lufa; obwódka w kolorze drużyny
function rysujStanowiskoEdytora(typ, druzyna, x, y, piksel) {
  const kolor = KOLOR_DRUZYNY[druzyna] || "#7f8c8d";
  wctx.lineWidth = 2 * piksel;
  wctx.strokeStyle = kolor;
  wctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  wctx.beginPath();
  wctx.ellipse(x, y, 30, 12, 0, 0, Math.PI * 2);
  wctx.fill();
  wctx.stroke();
  if (typ === "stos") {
    wctx.fillStyle = "#ffffff";
    for (const [dx, dy] of [[-9, -6], [9, -6], [0, -18]]) {
      wctx.beginPath();
      wctx.arc(x + dx, y + dy, 8, 0, Math.PI * 2);
      wctx.fill();
      wctx.stroke();
    }
  } else {
    wctx.fillStyle = "#6e6e7a";
    wctx.fillRect(x - 14, y - 22, 28, 12);
    wctx.strokeRect(x - 14, y - 22, 28, 12);
  }
  podpis(typ === "stos" ? "stos" : "armatka", x, y + 26, kolor, piksel);
}

// Start gracza (czerwone kółko) i linia startu przeciwników (zielona przerywana)
function rysujStartyEdytora(mapa, piksel) {
  const g = mapa.start.gracz;
  wctx.fillStyle = "rgba(217, 58, 58, 0.35)";
  wctx.strokeStyle = CONFIG.kolorCzerwony;
  wctx.lineWidth = 2 * piksel;
  wctx.beginPath();
  wctx.arc(j(g.x), j(g.y), PROMIEN_POSTACI, 0, Math.PI * 2);
  wctx.fill();
  wctx.stroke();
  podpis("start gracza", j(g.x), j(g.y) + PROMIEN_POSTACI + 14 * piksel, CONFIG.kolorCzerwony, piksel);

  // Linia startu przeciwników (reguła "linia", jak w grze: od lewej krawędzi do górnej)
  const a = mapa.start.przeciwnicy.wartosc;
  const W = mapa.swiat.szerokoscPol;
  const H = mapa.swiat.wysokoscPol / CONFIG.ASPECT;
  const naArenie = mapa.tryb === "arena";
  const p1 = naArenie ? { x: 0, y: j(a / CONFIG.ASPECT) } : { x: 0, y: j(a * H) };
  const p2 = naArenie ? { x: j(a), y: 0 } : { x: j(a * W), y: 0 };
  wctx.save();
  wctx.setLineDash([10 * piksel, 6 * piksel]);
  wctx.strokeStyle = CONFIG.kolorZielony;
  wctx.lineWidth = 3 * piksel;
  wctx.beginPath();
  wctx.moveTo(p1.x, p1.y);
  wctx.lineTo(p2.x, p2.y);
  wctx.stroke();
  wctx.restore();
  podpis("start przeciwników", (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, CONFIG.kolorZielony, piksel);
}

// Napis o stałej wielkości na ekranie (niezależnie od powiększenia)
function podpis(tekst, x, y, kolor, piksel) {
  wctx.font = `${12 * piksel}px sans-serif`;
  wctx.textAlign = "center";
  wctx.textBaseline = "middle";
  wctx.lineWidth = 3 * piksel;
  wctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  wctx.strokeText(tekst, x, y);
  wctx.fillStyle = kolor;
  wctx.fillText(tekst, x, y);
}

// --- Przyciski ---
const wybor = document.getElementById("wyborMapy");
for (const [id, m] of Object.entries(MAPY)) {
  const opcja = document.createElement("option");
  opcja.value = id;
  opcja.textContent = m.nazwa;
  wybor.appendChild(opcja);
}
wybor.addEventListener("change", () => wczytajMape(wybor.value));
document.getElementById("przyciskDopasuj").addEventListener("click", dopasujWidok);
document.getElementById("przyciskSiatka").addEventListener("click", (e) => {
  edytor.siatka = !edytor.siatka;
  e.currentTarget.classList.toggle("wlaczony", edytor.siatka);
  edytor.doNarysowania = true;
});

// --- Pętla: rysuje tylko, gdy coś się zmieniło ---
function klatkaEdytora() {
  if (edytor.doNarysowania && edytor.mapa) {
    edytor.doNarysowania = false;
    rysujEdytor();
  }
  requestAnimationFrame(klatkaEdytora);
}

window.addEventListener("resize", () => {
  dopasujPlotno();
  if (edytor.mapa) dopasujWidok();
});
dopasujPlotno();
wczytajGrafikiEdytora(() => {
  przygotujPaski(); // narzędzia i paleta materiałów (edytorTeren.js)
  // Mapa z adresu (editor.html?mapa=arena_2) albo pierwsza z listy
  const zAdresu = new URLSearchParams(location.search).get("mapa");
  const id = MAPY[zAdresu] ? zAdresu : Object.keys(MAPY)[0];
  wybor.value = id;
  wczytajMape(id);
  requestAnimationFrame(klatkaEdytora);
});
