// Materiały terenu (podłoże mapy). Mapa zapisuje w siatce tylko znak materiału każdego pola,
// a gra wypełnia ten obszar teksturą materiału (tekstura powtarza się bez szwów).
// Plik .js, a nie .json, bo przeglądarka nie wczyta JSON-a z dysku.
// Pola: znak (litera w mapie), nazwa (dla edytora), plik (tekstura), szer (ile jednostek pola
// zajmuje jedno powtórzenie tekstury), wlasciwosci (na później: ślizg, spowolnienie; gra ich nie używa).
// Znak "." w mapie = brak materiału: widać zwykłe tło (assets/tlo/tlo_plansza.png).

const MATERIALY = {
  snieg: { znak: "s", nazwa: "Śnieg", plik: "assets/teren/zima/snieg.jpg", szer: 400, wlasciwosci: {} },
  ubity: { znak: "u", nazwa: "Ubity śnieg", plik: "assets/teren/zima/ubity.jpg", szer: 600, wlasciwosci: {} },
  lod: { znak: "l", nazwa: "Lód", plik: "assets/teren/zima/lod.jpg", szer: 400, wlasciwosci: {} },
};
