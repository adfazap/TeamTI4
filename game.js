/* =====================================================================
   isi permainan tiap frame: update() mengatur pemain, waktu,
   lompat, tabrakan rintangan, jaket kuning prolog, dan HUD.
   (pemain = data pemain, jarak = jarak musuh ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

// Kamera: pemain selalu digambar di x = 200 layar, dunia yang bergeser.
function kameraX() {
  return pemain.x - 200;
}

// posisi kiri rintangan di layar
function kiriLayar(o) {
  return o.x - kameraX();
}

// apakah rintangan sedang berada tepat di depan/di badan pemain? (hanya cek kiri-kanan)
function bersinggungan(o) {
  const kiri = kiriLayar(o);
  return kiri < 280 && kiri + o.w > 230;
}

const DASAR_GANTUNG = GROUND - 95; // bagian bawah rintangan yang menggantung

// posisi y bagian ATAS rintangan
function atasRintangan(o) {
  if (o.gantung) return DASAR_GANTUNG - o.h;
  return GROUND - o.h;
}

// menggeser pemain; jarak ke musuh ikut berubah
function geser(dx) {
  pemain.x += dx;
  jarak += dx;
}

// dt = lama sejak frame sebelumnya (dalam detik, sekitar 0.016)
function update(dt) {
  // 1. Sedang ditabrak musuh: tunggu sebentar lalu GAME OVER
  if (pemain.matiTimer > 0) {
    pemain.matiTimer -= dt;
    pemain.tTangkap += dt;
    pemain.waktu += dt;
    if (pemain.matiTimer <= 0) gameOver();
    return;
  }

  // 2. Hitung mundur 3-2-1: semua diam dulu
  const sedangHitung = pemain.hitungMundur > 0.6;
  pemain.hitungMundur -= dt;
  if (sedangHitung) {
    pemain.waktu += dt;
    if (pemain.hitungMundur <= 0.6) startMusic(); // musik mulai bersamaan dengan "GO!"
    return;
  }

  // 3. Permainan berjalan
  urusSembunyi(dt);
  gerakPemain(dt);
  gerakMusuh(dt);
  kurangiWaktu(dt);
  fisikaLompat(dt);
  cekTabrakanRintangan();
  musuhMenghancurkanRintangan(dt);

  if (jarak > MAX_GAP) jarak = MAX_GAP; // musuh tidak boleh terlalu jauh tertinggal

  if (cekMusuhMenangkap()) return;

  if (pemain.x >= level.panjang) {
    // sampai di gerbang
    finishLevel();
    return;
  }
  tampilkanHud();
}

// Pemain berlari ke kanan selama tombol → ditahan. Tidak ada tombol mundur.
function gerakPemain(dt) {
  const pengali = level.prolog ? 0.75 : 1; // prolog lebih santai

  pemain.menunduk = sedangMenunduk();
  pemain.sedangLari = sedangLari();

  if (pemain.sembunyi) {
    // sedang bersembunyi: tidak bisa lari / menunduk
    pemain.menunduk = false;
    pemain.sedangLari = pemain.sudahDiPapan ? false : true; // sebelum sampai di papan: berlari ke balik papan
    return; // (gerakan ke papan diatur di urusSembunyi)
  }

  let kecepatan = 0;
  if (pemain.sedangLari) {
    if (pemain.tersandung > 0)
      kecepatan = STUMBLE_SPEED * pengali; // baru menabrak: melambat
    else kecepatan = SPEED * pengali;
  }
  geser(kecepatan * dt);
}

// Menurunkan semua timer, dan mengganti baju di tengah prolog.
function kurangiWaktu(dt) {
  pemain.tersandung -= dt;
  pemain.kebal -= dt;
  pemain.waktu += dt;
  pemain.kilat -= dt;

  // prolog: baju baru berganti HANYA kalau jaket kuning yang melayang diambil
  if (level.prolog && !pemain.sudahGanti && jasMenyentuhPemain()) {
    pemain.sudahGanti = true;
    baju = 'promed'; // ganti jaket kuning
    pemain.kilat = 1.2; // kilatan putih + tulisan "Ganti pakaian!"
  }
}

// posisi tengah jaket kuning (melayang naik-turun pelan)
function posisiJas() {
  return { x: level.panjang / 2 + 40, y: GROUND - JAS.tinggi + Math.sin(pemain.waktu * 3) * 8 };
}

// true kalau badan pemain menyentuh jas
function jasMenyentuhPemain() {
  const j = posisiJas();
  const r = JAS.ukuran / 2;
  const kiri = pemain.x + 10,
    kanan = pemain.x + 70; // badan pemain
  const bawah = pemain.y,
    atas = pemain.y - 110;
  return kanan > j.x - r && kiri < j.x + r && bawah > j.y - r && atas < j.y + r;
}

// Gravitasi, lompat, dan berdiri di atas rintangan besar / mobil.
function fisikaLompat(dt) {
  const yLama = pemain.y;
  pemain.vy += GRAVITY * dt; // gravitasi menarik ke bawah
  pemain.y += pemain.vy * dt;

  // cari lantai: tanah, atau atap rintangan kalau pemain jatuh di atasnya
  let lantai = GROUND;
  for (const o of rintangan) {
    if (o.gantung || o.hancur > 0) continue;
    if (!bersinggungan(o)) continue;
    const atas = atasRintangan(o);
    if (yLama <= atas + 16 && atas < lantai) lantai = atas;
  }

  pemain.dilantai = false;
  if (pemain.y >= lantai && pemain.vy >= 0) {
    pemain.y = lantai; // mendarat
    pemain.vy = 0;
    pemain.dilantai = true;
    pemain.jumlahLompat = 0;
  } else if (pemain.jumlahLompat === 0) {
    pemain.jumlahLompat = 1; // jatuh dari atas blok: masih boleh 1x lompat di udara
  }
}

// Menabrak rintangan: pemain TERTAHAN di depannya sampai berhasil melompatinya.
// Hukumannya (jarak musuh berkurang & musuh marah) hanya SEKALI per tabrakan.
function cekTabrakanRintangan() {
  const tinggiBadan = pemain.menunduk && pemain.dilantai ? 75 : 140;

  for (const o of rintangan) {
    if (o.hancur > 0) continue; // rintangan sudah hancur
    if (!bersinggungan(o)) continue;

    let kena;
    if (o.gantung) {
      kena = pemain.y - tinggiBadan < DASAR_GANTUNG && pemain.y > atasRintangan(o); // kepala kena
    } else {
      kena = pemain.y > atasRintangan(o) + 8; // kaki di bawah puncak
    }
    if (!kena) continue;

    geser(o.x - 81 - pemain.x); // tidak tembus: tertahan di depan rintangan
    pemain.tersandung = Math.max(pemain.tersandung, 0.3);
    if (pemain.kebal <= 0) {
      pemain.kebal = 1.2;
      jarak -= STUMBLE_LOSS;
      pemain.marah = Math.min(RAGE_MAX, pemain.marah + RAGE_PER_HIT);
    }
  }
}

function tampilkanHud() {
  $('btnSembunyi').style.display = bisaSembunyi() || pemain.sembunyi ? 'grid' : 'none';
  const nama = level.prolog ? 'Prolog' : MAPS[level.mapIndex].name;
  const persen = Math.floor((pemain.x / level.panjang) * 100);
  $('hud').textContent = nama + '  ' + persen + '%';
}
