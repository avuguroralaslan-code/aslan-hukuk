/* ============================================================
   Aslan Hukuk — Arabuluculuk Ücreti Hesaplama
   Daha önce arabuluculuk.html içinde satır içi <script> olarak duruyordu.
   Buraya taşındı: _headers'taki güvenlik politikası (script-src 'self')
   satır içi script ve onchange/onclick kullanımını engelliyor.
   ============================================================ */
/* ============================================================
   ARABULUCULUK ÜCRETİ HESAPLAMA
   Kaynak: 2026 Yılı Arabuluculuk Asgari Ücret Tarifesi
   (Adalet Bakanlığı — RG 26.12.2025, Sayı 33119)
   Yıllık tarife değişiminde YALNIZCA aşağıdaki ARB_TARIFE'yi güncelleyin.
   ============================================================ */
const ARB_TARIFE = {
  yil: 2026,
  rg: "RG 26.12.2025, S. 33119",
  // İkinci Kısım — konusu para olan uyuşmazlıklar (anlaşma halinde)
  // [dilim tutarı, tek arabulucu oranı, birden fazla arabulucu oranı]
  dilimler: [
    [600000,   0.06,  0.09 ],
    [960000,   0.05,  0.075],
    [1560000,  0.04,  0.06 ],
    [3120000,  0.03,  0.045],
    [9360000,  0.02,  0.03 ],
    [12480000, 0.015, 0.025],
    [24960000, 0.01,  0.015],
    [Infinity, 0.005, 0.01 ]
  ],
  minGenel: 9000,    // Tarife m.7/7
  minTicari: 13000,  // Tarife m.7/6 (ticari + ortaklığın giderilmesi)
  // Birinci Kısım — saatlik ücretler [2 kişi taraf başına, 3-5, 6-10, 11+]
  saatlik: {
    aile:      [1000, 2200, 2300, 2400],
    ticariS:   [1500, 3200, 3300, 3400],
    isci:      [1130, 2460, 2560, 2660],
    tuketici:  [1000, 2200, 2300, 2400],
    kira:      [1170, 2540, 2640, 2740],
    ortaklikS: [1170, 2540, 2640, 2740],
    diger:     [1000, 2200, 2300, 2400]
  },
  saatlikAd: {
    aile: "Aile hukuku", ticariS: "Ticari", isci: "İşçi – işveren",
    tuketici: "Tüketici", kira: "Kira / komşu / kat mülkiyeti",
    ortaklikS: "Ortaklığın giderilmesi", diger: "Diğer"
  }
};

const arbTL = v => v.toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2, maximumFractionDigits: 2 });
function arbSatir(ad, deger, muted) {
  return '<div class="cr-line' + (muted ? ' muted' : '') + '"><span>' + ad + '</span><span>' + deger + '</span></div>';
}

function arbModDegisti() {
  const mod = document.getElementById("arbMod").value;
  document.getElementById("arbAnlasmaAlan").style.display = mod === "anlasma" ? "" : "none";
  document.getElementById("arbSaatlikAlan").style.display = mod === "saatlik" ? "" : "none";
  document.getElementById("arbSonuc").innerHTML = '<p class="cr-empty">Bilgileri girip "Hesapla" düğmesine basın.</p>';
}

function hesaplaArb() {
  const mod = document.getElementById("arbMod").value;
  const hedef = document.getElementById("arbSonuc");
  let html = "";

  if (mod === "anlasma") {
    const tutar = parseFloat(document.getElementById("arbTutar").value);
    const tur = document.getElementById("arbTur").value;
    const coklu = document.getElementById("arbSayi").value === "coklu";
    if (isNaN(tutar) || tutar <= 0) {
      hedef.innerHTML = '<p class="cr-empty">Lütfen anlaşma tutarını girin.</p>'; return;
    }
    let kalan = tutar, ucret = 0;
    for (const [dilim, tekOran, cokOran] of ARB_TARIFE.dilimler) {
      if (kalan <= 0) break;
      const pay = Math.min(kalan, dilim);
      ucret += pay * (coklu ? cokOran : tekOran);
      kalan -= pay;
    }
    const taban = tur === "ticari" ? ARB_TARIFE.minTicari : ARB_TARIFE.minGenel;
    const tabanUygulandi = ucret < taban;
    const nihai = Math.max(ucret, taban);

    html += arbSatir("Anlaşma tutarı", arbTL(tutar));
    html += arbSatir("Tarife dilim hesabı", arbTL(ucret));
    if (tabanUygulandi) html += arbSatir("— Asgari ücret uygulandı (m.7/" + (tur === "ticari" ? "6" : "7") + ")", arbTL(taban), true);
    html += '<div class="cr-total"><span class="t-label">Arabuluculuk Ücreti</span><span class="t-value">' + arbTL(nihai) + "</span></div>";
    html += arbSatir("Taraf başına düşen (eşit paylaşımda)", arbTL(nihai / 2), true);
    html += '<p class="cr-note">Aksi kararlaştırılmadıkça ücret taraflarca eşit ödenir (Tarife m.3/1). ' + (coklu ? "Birden fazla arabulucuda toplam ücret arabulucular arasında eşit bölünür (m.3/3)." : "") + "</p>";
  } else {
    const tur = document.getElementById("arbSaatTur").value;
    const tarafIdx = parseInt(document.getElementById("arbTaraf").value, 10);
    const saat = parseInt(document.getElementById("arbSaat").value, 10);
    if (isNaN(saat) || saat < 1) {
      hedef.innerHTML = '<p class="cr-empty">Lütfen görüşme süresini girin.</p>'; return;
    }
    const oran = ARB_TARIFE.saatlik[tur][tarafIdx];
    const ikiKisi = tarafIdx === 0;
    // 2 kişide ücret "taraf başına"dır; 3+ kişide taraf sayısı gözetmeksizin toplamdır.
    const toplam = ikiKisi ? oran * 2 * saat : oran * saat;

    html += arbSatir("Uyuşmazlık türü", ARB_TARIFE.saatlikAd[tur]);
    html += arbSatir("Saat ücreti", arbTL(oran) + (ikiKisi ? " (taraf başına)" : " (toplam)"));
    html += arbSatir("Görüşme süresi", saat + " saat");
    html += '<div class="cr-total"><span class="t-label">Arabuluculuk Ücreti</span><span class="t-value">' + arbTL(toplam) + "</span></div>";
    if (ikiKisi) html += arbSatir("Taraf başına düşen", arbTL(toplam / 2), true);
    html += '<p class="cr-note">Dava şartı (zorunlu) arabuluculukta anlaşamama halinde ilk iki saatlik ücret Adalet Bakanlığı bütçesinden karşılanır; iki saati aşan kısım taraflarca ödenir.</p>';
  }
  hedef.innerHTML = html;
}

/* ------------------------------------------------------------
   OLAY BAĞLAMA — onchange/onclick yerine addEventListener (CSP uyumlu)
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {
  var mod = document.getElementById("arbMod");
  if (mod) mod.addEventListener("change", arbModDegisti);

  var btn = document.querySelector('[data-hesapla="arabuluculuk"]');
  if (btn) btn.addEventListener("click", hesaplaArb);

  var form = document.getElementById("arbForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
});