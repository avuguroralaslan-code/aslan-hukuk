/* ============================================================
   Aslan Hukuk — Hesaplama Araçları
   Daha önce hesaplama.html içinde satır içi <script> olarak duruyordu.
   Buraya taşındı çünkü _headers dosyasındaki güvenlik politikası
   (script-src 'self') satır içi script ve onclick kullanımını engeller —
   o hâliyle araçlar canlıda sessizce çalışmıyordu.
   ============================================================ */

/* ------------------------------------------------------------
   RESMİ PARAMETRELER — güncelleme gerektiğinde YALNIZCA burayı değiştirin.
   ------------------------------------------------------------ */
const VERI = {
  guncelleme: "10 Temmuz 2026",
  // Hazine ve Maliye Bakanlığı — 2026/2. dönem (01.07.2026–31.12.2026)
  kidemTavani: 73729.84,
  // Damga vergisi oranı (488 s. K. — ücret ödemeleri): binde 7,59
  damgaOrani: 0.00759,
  // TÜİK — 12 aylık ortalama TÜFE (Haziran 2026 verisi, Temmuz 2026 kira dönemi)
  tufe12Ort: 32.03
};

const TL = v => v.toLocaleString("tr-TR", {
  style: "currency", currency: "TRY",
  minimumFractionDigits: 2, maximumFractionDigits: 2
});

function crSatir(ad, deger, muted) {
  return '<div class="cr-line' + (muted ? ' muted' : '') + '"><span>' + ad + '</span><span>' + deger + '</span></div>';
}
function crToplam(ad, deger) {
  return '<div class="cr-total"><span class="t-label">' + ad + '</span><span class="t-value">' + deger + '</span></div>';
}

/* --- 1. KIDEM TAZMİNATI (1475 s. İş K. m.14) --- */
function hesaplaKidem() {
  const giris = new Date(document.getElementById("kidemGiris").value);
  const cikis = new Date(document.getElementById("kidemCikis").value);
  const brut  = parseFloat(document.getElementById("kidemUcret").value);
  const hedef = document.getElementById("kidemSonuc");

  if (isNaN(giris) || isNaN(cikis) || isNaN(brut) || brut <= 0) {
    hedef.innerHTML = '<p class="cr-empty">Lütfen tüm alanları doldurun.</p>'; return;
  }
  if (cikis <= giris) {
    hedef.innerHTML = '<p class="cr-empty">Çıkış tarihi giriş tarihinden sonra olmalıdır.</p>'; return;
  }
  const gunMs = 1000 * 60 * 60 * 24;
  const toplamGun = Math.floor((cikis - giris) / gunMs);
  if (toplamGun < 365) {
    hedef.innerHTML = '<div class="cr-warn">Hizmet süresi 1 yılın altında görünüyor. 1475 sayılı İş Kanunu m.14 uyarınca kıdem tazminatına hak kazanılması için en az 1 tam yıl çalışma gerekir.</div>'; return;
  }
  const yil = Math.floor(toplamGun / 365);
  const artikGun = toplamGun - yil * 365;

  const tavanUygulandi = brut > VERI.kidemTavani;
  const esasUcret = Math.min(brut, VERI.kidemTavani);
  const brutKidem = esasUcret * yil + esasUcret * (artikGun / 365);
  const damga = brutKidem * VERI.damgaOrani;
  const net = brutKidem - damga;

  let html = "";
  html += crSatir("Hizmet süresi", yil + " yıl " + artikGun + " gün");
  html += crSatir("Esas alınan brüt ücret", TL(esasUcret));
  if (tavanUygulandi) html += crSatir("— Kıdem tavanı uygulandı", TL(VERI.kidemTavani), true);
  html += crSatir("Brüt kıdem tazminatı", TL(brutKidem));
  html += crSatir("Damga vergisi (binde 7,59)", "− " + TL(damga), true);
  html += crToplam("Net Kıdem Tazminatı", TL(net));
  html += '<p class="cr-note">Kıdem tazminatından gelir vergisi kesilmez; yalnızca damga vergisi kesintisi yapılır.</p>';
  hedef.innerHTML = html;
}

/* --- 2. İHBAR TAZMİNATI (4857 s. İş K. m.17) --- */
function hesaplaIhbar() {
  const hafta = parseInt(document.getElementById("ihbarSure").value, 10);
  const brut  = parseFloat(document.getElementById("ihbarUcret").value);
  const vergiOran = parseFloat(document.getElementById("ihbarVergi").value) / 100;
  const hedef = document.getElementById("ihbarSonuc");

  if (isNaN(brut) || brut <= 0) {
    hedef.innerHTML = '<p class="cr-empty">Lütfen brüt ücreti girin.</p>'; return;
  }
  const gunlukUcret = brut / 30;
  const brutIhbar = gunlukUcret * 7 * hafta;
  const gelirVergisi = brutIhbar * vergiOran;
  const damga = brutIhbar * VERI.damgaOrani;
  const net = brutIhbar - gelirVergisi - damga;

  let html = "";
  html += crSatir("İhbar süresi", hafta + " hafta (" + hafta * 7 + " gün)");
  html += crSatir("Günlük brüt ücret", TL(gunlukUcret));
  html += crSatir("Brüt ihbar tazminatı", TL(brutIhbar));
  html += crSatir("Gelir vergisi (%" + (vergiOran * 100) + ")", "− " + TL(gelirVergisi), true);
  html += crSatir("Damga vergisi (binde 7,59)", "− " + TL(damga), true);
  html += crToplam("Net İhbar Tazminatı", TL(net));
  html += '<p class="cr-note">Gelir vergisi oranı, yıl içindeki kümülatif vergi matrahınıza göre %15–40 arasında değişir; seçtiğiniz dilim tahminidir.</p>';
  hedef.innerHTML = html;
}

/* --- 3. KİRA ARTIŞI (TBK m.344) --- */
function hesaplaKira() {
  const mevcut = parseFloat(document.getElementById("kiraMevcut").value);
  const oran = parseFloat(document.getElementById("kiraOran").value);
  const hedef = document.getElementById("kiraSonuc");

  if (isNaN(mevcut) || mevcut <= 0 || isNaN(oran) || oran < 0) {
    hedef.innerHTML = '<p class="cr-empty">Lütfen kira tutarını ve oranı girin.</p>'; return;
  }
  const artis = mevcut * (oran / 100);
  const yeni = mevcut + artis;

  let html = "";
  html += crSatir("Mevcut kira", TL(mevcut));
  html += crSatir("Uygulanan oran", "%" + oran.toLocaleString("tr-TR"));
  html += crSatir("Aylık artış tutarı", "+ " + TL(artis));
  html += crToplam("Yeni Aylık Kira", TL(yeni));
  if (oran > VERI.tufe12Ort) {
    html += '<div class="cr-warn">Girdiğiniz oran, güncel yasal üst sınır olan %' + VERI.tufe12Ort.toLocaleString("tr-TR") + " (12 aylık ortalama TÜFE) üzerindedir. TBK m.344 uyarınca bu sınırı aşan artış anlaşmaları geçersizdir.</div>";
  }
  html += '<p class="cr-note">Bu oran, sözleşmenin yenilendiği aya ait TÜİK 12 aylık ortalama TÜFE verisidir; kiracı aleyhine daha yüksek oran kararlaştırılamaz.</p>';
  hedef.innerHTML = html;
}

/* ------------------------------------------------------------
   OLAY BAĞLAMA — onclick yerine addEventListener (CSP uyumlu)
   ------------------------------------------------------------ */
const HESAPLAYICILAR = {
  kidem: hesaplaKidem,
  ihbar: hesaplaIhbar,
  kira:  hesaplaKira
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-hesapla]").forEach(function (btn) {
    const fn = HESAPLAYICILAR[btn.getAttribute("data-hesapla")];
    if (fn) btn.addEventListener("click", fn);
  });

  // Formların sayfayı yeniden yüklemesini engelle (onsubmit="return false" yerine)
  document.querySelectorAll(".calc-card form").forEach(function (form) {
    form.addEventListener("submit", function (e) { e.preventDefault(); });
  });
});
