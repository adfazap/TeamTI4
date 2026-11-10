/* =====================================================================
   SEMBUNYI.JS  -  bersembunyi di balik objek papan info (tombol E):
   syarat, mulai, keluar, dan hitung mundur 5 detik.
   (pemain = data pemain, jarak = jarak musuh ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

// papan info yang sedang cukup dekat untuk dijadikan tempat bersembunyi (atau null)
function papanDekat() {
  for (const b of papan) {
    if (pemain.x >= b.x - SEMBUNYI_JAUH && pemain.x <= b.x + OBJEK_SEMBUNYI.x + OBJEK_SEMBUNYI.w / 2 - 30)
      return b;
  }
  return null;
}

// apakah pemain boleh mulai bersembunyi sekarang?
function bisaSembunyi() {
  if (!level || pemain.hitungMundur > 0.6 || pemain.matiTimer > 0 || pemain.sembunyi) return false;
  const b = papanDekat();
  return (
    !!b &&
    !b.dipakai &&
    b.sisa > 0 &&
    pemain.dilantai &&
    pemain.tersandung <= 0 &&
    jarak >= SEMBUNYI_MIN_JARAK
  );
}

// Pencet E (atau tombol mata): pemain berlari ke objek di dekat papan lalu bersembunyi di baliknya.
// Pencet E lagi (atau waktu habis): pemain keluar, musuh masih bingung sebentar.
function togolSembunyi() {
  if (!sedangMain || dijeda || !level || pemain.matiTimer > 0) return;

  if (pemain.sembunyi) {
    // sedang bersembunyi / menuju objek: keluar / batal
    if (pemain.sudahDiPapan) keluarSembunyi();
    else {
      pemain.sembunyi = false;
      pemain.papanAktif = null;
    }
    return;
  }
  if (bisaSembunyi()) {
    // mulai bersembunyi
    pemain.sembunyi = true;
    pemain.sudahDiPapan = false;
    pemain.papanAktif = papanDekat();
  }
}

function keluarSembunyi() {
  pemain.sembunyi = false;
  pemain.sudahDiPapan = false;
  pemain.papanAktif = null;
  level.bingung = BINGUNG_SETELAH; // musuh masih bingung sebentar
}

// dipanggil tiap frame: berlari ke objek, lalu menghitung sisa waktu bersembunyi
function urusSembunyi(dt) {
  if (!pemain.sembunyi) return;
  const b = pemain.papanAktif;

  if (!pemain.sudahDiPapan) {
    // tujuan: pemain tepat di balik objek (pusat badan pemain = pemain.x + 40)
    const sasaran = b.x + OBJEK_SEMBUNYI.x + OBJEK_SEMBUNYI.w / 2 - 40;
    geser(Math.min(SPEED * dt, Math.max(0, sasaran - pemain.x))); // hanya maju, tidak mundur
    if (sasaran - pemain.x <= 1) {
      pemain.sudahDiPapan = true;
      b.dipakai = true; // satu papan hanya bisa dipakai sekali
      tandaiInfoDibaca(level.mapIndex, b.nomor); // informasinya masuk ke Koleksi di layar awal
      level.bingungWaktu = 0;
    }
    return;
  }

  b.sisa -= dt;
  if (b.sisa <= 0) keluarSembunyi();
}
