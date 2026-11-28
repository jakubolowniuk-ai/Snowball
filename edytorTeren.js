// Edytor map: malowanie terenu (krok E4). Narzędzia: rączka (przesuwanie), pędzel, wypełnienie,
// prostokąt, gumka, pipeta. Cofnij i ponów (do HISTORIA_MAX kroków), rozmiar pola do wpisania.
// Teren mapy to siatka znaków (mapa.teren.wiersze): znak materiału z dane/teren.js albo "." (tło).
// Jeden ruch palca (od dotknięcia do puszczenia) to jeden krok w historii cofania.

const HISTORIA_MAX = 50;
const NARZEDZIA = [
  { id: "raczka", ikona: "✋", nazwa: "Rączka: przesuwanie mapy" },
  { id: "pedzel", ikona: "🖌️", nazwa: "Pędzel: maluje pola" },
  { id: "wypelnienie", ikona: "🪣", nazwa: "Wypełnienie: zalewa spójny obszar" },
  { id: "prostokat", ikona: "⬛", nazwa: "Prostokąt: przeciągnij palcem" },
  { id: "gumka", ikona: "🧽", nazwa: "Gumka: przywraca tło" },
  { id: "pipeta", ikona: "💧", nazwa: "Pipeta: bierze materiał z pola" },
];

edytor.material = "snieg"; // wybrany materiał (id z MATERIALY albo "tlo")
edytor.historia = { wstecz: [], naprzod: [] };
edytor.akcja = null; // trwający ruch narzędzia

// --- Siatka pól ---
function wymiarySiatki() {
  const { w, h } = rozmiarSwiata(edytor.mapa);
  const r = edytor.mapa.teren.rozmiarPola;
  return { kolumn: Math.ceil(w / r), wierszy: Math.ceil(h / r), r };
}

function znakMaterialu(id) {
  return MATERIALY[id] ? MATERIALY[id].znak : ".";
}

// Po wczytaniu mapy: wpisujemy pełną siatkę (każde pole ma swój znak), czyścimy historię
function przygotujTerenDoEdycji() {
  const teren = edytor.mapa.teren;
  const { kolumn, wierszy } = wymiarySiatki();
  const wiersze = [];
  for (let w = 0; w < wierszy; w++) {
    let linia = "";
    for (let k = 0; k < kolumn; k++) linia += znakMaterialu(materialPola(teren, k, w));
    wiersze.push(linia);
  }
  teren.wiersze = wiersze;
  edytor.historia = { wstecz: [], naprzod: [] };
  edytor.akcja = null;
  odswiezPrzyciski();
}

// Pole pod punktem świata albo null (poza mapą)
function poleWPunkcie(p) {
  const { kolumn, wierszy, r } = wymiarySiatki();
  const k = Math.floor(p.x / r);
  const w = Math.floor(p.y / r);
  if (k < 0 || w < 0 || k >= kolumn || w >= wierszy) return null;
  return { k, w };
}

// Zmienia znak jednego pola; zwraca true, gdy coś się zmieniło
function ustawPole(k, w, znak) {
  const wiersze = edytor.mapa.teren.wiersze;
  const linia = wiersze[w];
  if (linia[k] === znak) return false;
  wiersze[w] = linia.slice(0, k) + znak + linia.slice(k + 1);
  return true;
}

// --- Historia (cofnij / ponów) ---
function migawka() {
  const t = edytor.mapa.teren;
  return { rozmiarPola: t.rozmiarPola, wiersze: t.wiersze.slice() };
}

function takieSame(a, b) {
  return a.rozmiarPola === b.rozmiarPola && a.wiersze.join("\n") === b.wiersze.join("\n");
}

function przywroc(m) {
  edytor.mapa.teren.rozmiarPola = m.rozmiarPola;
  edytor.mapa.teren.wiersze = m.wiersze.slice();
  zbudujBuforEdytora();
  pokazInfo();
  odswiezPrzyciski();
  edytor.doNarysowania = true;
}

function zapiszKrok(przed) {
  if (takieSame(przed, migawka())) return;
  edytor.historia.wstecz.push(przed);
  if (edytor.historia.wstecz.length > HISTORIA_MAX) edytor.historia.wstecz.shift();
  edytor.historia.naprzod = [];
  odswiezPrzyciski();
}

function cofnij() {
  const h = edytor.historia;
  if (!h.wstecz.length) return;
  h.naprzod.push(migawka());
  przywroc(h.wstecz.pop());
}

function ponow() {
  const h = edytor.historia;
  if (!h.naprzod.length) return;
  h.wstecz.push(migawka());
  przywroc(h.naprzod.pop());
}

// --- Narzędzia ---
function zacznijNarzedzie(p) {
  const pole = poleWPunkcie(p);
  const przed = migawka();
  const n = edytor.narzedzie;
  if (n === "pipeta") {
    if (pole) wybierzMaterial(materialPola(edytor.mapa.teren, pole.k, pole.w) || "tlo");
    wybierzNarzedzie("pedzel"); // po pobraniu materiału od razu można malować
    return;
  }
  if (n === "wypelnienie") {
    if (pole && wypelnij(pole.k, pole.w, znakMaterialu(edytor.material))) {
      zbudujBuforEdytora();
      edytor.doNarysowania = true;
    }
    zapiszKrok(przed);
    return;
  }
  edytor.akcja = { narzedzie: n, przed, ostatni: p, start: pole, koniec: pole };
  if (n === "pedzel" || n === "gumka") malujPole(pole);
  edytor.doNarysowania = true;
}

function ruchNarzedzia(p) {
  const a = edytor.akcja;
  if (!a) return;
  if (a.narzedzie === "pedzel" || a.narzedzie === "gumka") {
    // Pola między poprzednim a obecnym punktem, żeby szybki ruch palca nie zostawiał dziur
    const krok = edytor.mapa.teren.rozmiarPola / 3;
    const d = Math.hypot(p.x - a.ostatni.x, p.y - a.ostatni.y);
    const ile = Math.max(1, Math.ceil(d / krok));
    for (let i = 1; i <= ile; i++) {
      const t = i / ile;
      malujPole(poleWPunkcie({ x: a.ostatni.x + (p.x - a.ostatni.x) * t, y: a.ostatni.y + (p.y - a.ostatni.y) * t }));
    }
    a.ostatni = p;
  } else if (a.narzedzie === "prostokat") {
    const pole = poleWPunkcie(p);
    if (pole) a.koniec = pole;
    edytor.doNarysowania = true;
  }
}

function zakonczNarzedzie() {
  const a = edytor.akcja;
  if (!a) return;
  edytor.akcja = null;
  if (a.narzedzie === "prostokat" && a.start && a.koniec) {
    const znak = znakMaterialu(edytor.material);
    for (let w = Math.min(a.start.w, a.koniec.w); w <= Math.max(a.start.w, a.koniec.w); w++) {
      for (let k = Math.min(a.start.k, a.koniec.k); k <= Math.max(a.start.k, a.koniec.k); k++) ustawPole(k, w, znak);
    }
    zbudujBuforEdytora();
  }
  zapiszKrok(a.przed);
  edytor.doNarysowania = true;
}

// Drugi palec w trakcie malowania: to był gest powiększania, więc cofamy rozpoczęty ruch
function przerwijNarzedzie() {
  const a = edytor.akcja;
  if (!a) return;
  edytor.akcja = null;
  if (!takieSame(a.przed, migawka())) przywroc(a.przed);
  edytor.doNarysowania = true;
}

function malujPole(pole) {
  if (!pole) return;
  const znak = edytor.akcja.narzedzie === "gumka" ? "." : znakMaterialu(edytor.material);
  if (ustawPole(pole.k, pole.w, znak)) odswiezPoleBufora(pole.k, pole.w);
}

// Wypełnienie: wszystkie pola połączone bokami z polem startowym i mające ten sam znak
function wypelnij(k0, w0, znak) {
  const wiersze = edytor.mapa.teren.wiersze;
  const stary = wiersze[w0][k0];
  if (stary === znak) return false;
  const { kolumn, wierszy } = wymiarySiatki();
  const doSprawdzenia = [[k0, w0]];
  while (doSprawdzenia.length) {
    const [k, w] = doSprawdzenia.pop();
    if (k < 0 || w < 0 || k >= kolumn || w >= wierszy || wiersze[w][k] !== stary) continue;
    ustawPole(k, w, znak);
    doSprawdzenia.push([k + 1, w], [k - 1, w], [k, w + 1], [k, w - 1]);
  }
  return true;
}

// Ramka prostokąta w trakcie przeciągania
function rysujPodgladNarzedzia(c, piksel) {
  const a = edytor.akcja;
  if (!a || a.narzedzie !== "prostokat" || !a.start || !a.koniec) return;
  const r = edytor.mapa.teren.rozmiarPola;
  const x = Math.min(a.start.k, a.koniec.k) * r;
  const y = Math.min(a.start.w, a.koniec.w) * r;
  const szer = (Math.abs(a.start.k - a.koniec.k) + 1) * r;
  const wys = (Math.abs(a.start.w - a.koniec.w) + 1) * r;
  c.fillStyle = "rgba(42, 111, 214, 0.25)";
  c.fillRect(x, y, szer, wys);
  c.strokeStyle = "#2a6fd6";
  c.lineWidth = 2 * piksel;
  c.strokeRect(x, y, szer, wys);
}

// --- Rozmiar pola ---
// Nowa siatka: każde nowe pole bierze materiał starego pola, w które wypada jego środek
function zmienRozmiarPola(nowy) {
  const teren = edytor.mapa.teren;
  if (!(nowy >= 10 && nowy <= 200) || nowy === teren.rozmiarPola) {
    odswiezPrzyciski();
    return;
  }
  const przed = migawka();
  const stary = { rozmiarPola: teren.rozmiarPola, wiersze: teren.wiersze.slice(), domyslny: teren.domyslny };
  teren.rozmiarPola = nowy;
  const { kolumn, wierszy } = wymiarySiatki();
  const wiersze = [];
  for (let w = 0; w < wierszy; w++) {
    let linia = "";
    for (let k = 0; k < kolumn; k++) {
      const ks = Math.floor(((k + 0.5) * nowy) / stary.rozmiarPola);
      const ws = Math.floor(((w + 0.5) * nowy) / stary.rozmiarPola);
      linia += znakMaterialu(materialPola(stary, ks, ws));
    }
    wiersze.push(linia);
  }
  teren.wiersze = wiersze;
  zbudujBuforEdytora();
  pokazInfo();
  zapiszKrok(przed);
  edytor.doNarysowania = true;
}

// --- Paski: narzędzia (lewo), materiały (prawo), cofnij / ponów / rozmiar pola (góra) ---
function wybierzNarzedzie(id) {
  edytor.narzedzie = id;
  for (const b of document.querySelectorAll("#narzedzia button")) b.classList.toggle("wlaczony", b.dataset.id === id);
}

function wybierzMaterial(id) {
  edytor.material = id;
  for (const b of document.querySelectorAll("#paleta button")) b.classList.toggle("wlaczony", b.dataset.id === id);
  // Wybór materiału z gumką albo rączką w ręku: przełączamy na pędzel
  if (edytor.narzedzie === "gumka" || edytor.narzedzie === "raczka" || edytor.narzedzie === "pipeta") wybierzNarzedzie("pedzel");
}

function odswiezPrzyciski() {
  const wstecz = document.getElementById("przyciskCofnij");
  if (!wstecz || !edytor.mapa) return;
  wstecz.disabled = !edytor.historia.wstecz.length;
  document.getElementById("przyciskPonow").disabled = !edytor.historia.naprzod.length;
  document.getElementById("rozmiarPola").value = edytor.mapa.teren.rozmiarPola;
}

function przygotujPaski() {
  const narzedzia = document.getElementById("narzedzia");
  for (const n of NARZEDZIA) {
    const b = document.createElement("button");
    b.dataset.id = n.id;
    b.textContent = n.ikona;
    b.title = n.nazwa;
    b.addEventListener("click", () => wybierzNarzedzie(n.id));
    narzedzia.appendChild(b);
  }
  const paleta = document.getElementById("paleta");
  const materialy = [...Object.entries(MATERIALY).map(([id, m]) => ({ id, nazwa: m.nazwa, plik: m.plik })), { id: "tlo", nazwa: "Tło", plik: null }];
  for (const m of materialy) {
    const b = document.createElement("button");
    b.dataset.id = m.id;
    b.title = m.nazwa;
    const probka = document.createElement("span");
    probka.className = "probka";
    probka.style.backgroundImage = m.plik ? `url("${m.plik}")` : `url("${TLO_EDYTORA}")`;
    const podpis = document.createElement("span");
    podpis.textContent = m.nazwa;
    b.append(probka, podpis);
    b.addEventListener("click", () => wybierzMaterial(m.id));
    paleta.appendChild(b);
  }
  document.getElementById("przyciskCofnij").addEventListener("click", cofnij);
  document.getElementById("przyciskPonow").addEventListener("click", ponow);
  document.getElementById("rozmiarPola").addEventListener("change", (e) => zmienRozmiarPola(Math.round(Number(e.target.value))));
  wybierzNarzedzie("raczka");
  wybierzMaterial("snieg");
  wybierzNarzedzie("raczka"); // na starcie rączka (wybór materiału przełączył na pędzel)
  odswiezPrzyciski();
}
