/* =====================================================================
   GAME.JS  -  isi permainan: memulai level, gerak pemain & banteng,
   tabrakan, menang (finish) dan kalah (game over).

   Setiap detik browser memanggil update() sekitar 60 kali.
   update() mengatur apa yang terjadi di setiap "frame" permainan.
   (pemain = data pemain, jarak = jarak banteng ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

/* ===================== MEMULAI LEVEL ===================== */
// mapIndex: 0-4 = map peminatan 1-5, -1 = prolog
let terakhirMap = null;     // map yang terakhir dimulai (untuk membedakan 'ulangi' dari masuk baru)

function startLevel(mapIndex){
  const prolog = (mapIndex < 0);
  const ulang = (mapIndex === terakhirMap);   // mengulang map yang sama -> loading singkat
  terakhirMap = mapIndex;
  const waktuMulai = performance.now();
  tampilkanMemuat(mapIndex);                  // layar loading gelap + animasi + teks tentang map

  setPlaying(false);          // tahan dulu sampai semua gambar siap (supaya tidak ada map kosong)
  dijeda = false;
  if (prolog) baju = 'awal';  // prolog selalu mulai dengan baju awal

  const folder = prolog ? 'assets/prolog/' : 'assets/map' + (mapIndex + 1) + '/';

  // ----- data level -----
  level = {
    prolog: prolog,
    mapIndex: mapIndex,
    panjang: prolog ? PANJANG_PROLOG : PANJANG_MAP,
    latar: loadImg(folder + 'bg.jpg'),                // background pendek (dipakai kalau looping)
    latarPanjang: loadImg(folder + 'bg-panjang.jpg'), // background panjang (tidak looping)
    gerbang: loadImg(folder + 'gate.png'),
    gambarBanteng: loadImg(folder + 'chaser.png'),
    animBanteng: {},          // gambar animasi banteng: run, wait, charge
    aksiBanteng: 'run',       // sedang apa banteng: 'run', 'wait' (menunggu), 'charge' (menyeruduk), 'bingung'
    lompatU: 0,               // posisi dalam lompatan (0..1), dipakai memilih gambar lompat
    bantengY: 0,              // tinggi banteng di atas tanah (saat melompati rintangan kuat)
    hadap: 1,                 // arah hadap banteng: 1 = kanan, -1 = kiri (saat bingung bolak-balik)
    bingung: 0,               // sisa waktu banteng masih bingung setelah pemain keluar dari persembunyian
    bingungWaktu: 0,          // jam untuk gerakan bolak-balik banteng
  };
  for (const aksi in ANIM_BANTENG) {
    level.animBanteng[aksi] = [];
    for (let i = 1; i <= jumlahFrame(aksi, prolog ? 0 : mapIndex + 1); i++) {
      level.animBanteng[aksi].push(loadImg(folder + 'chaser_' + aksi + i + '.png'));
    }
  }

  // ----- data pemain -----
  pemain = {
    x: 0,                  // posisi di dunia (makin besar = makin jauh)
    y: GROUND,             // posisi kaki (makin kecil = makin tinggi)
    vy: 0,                 // kecepatan naik/turun
    dilantai: true,        // sedang menginjak tanah / rintangan?
    jumlahLompat: 0,       // sudah lompat berapa kali (maksimal 2 = double jump)
    menunduk: false,
    sedangLari: false,
    tersandung: 0,         // sisa waktu animasi "kena" (detik)
    kebal: 0,              // sisa waktu kebal setelah menabrak (karakter berkedip)
    marah: 0,              // seberapa marah banteng (makin sering menabrak makin besar)
    waktu: 0,              // jam untuk animasi
    hitungMundur: 3,       // hitung mundur 3-2-1 sebelum mulai
    matiTimer: 0,          // > 0 = sedang adegan ditabrak banteng
    kilat: 0,              // kilatan putih saat ganti baju
    sudahGanti: false,     // sudah ganti baju di prolog?
    tTangkap: 0,           // lama adegan ditabrak (untuk animasi caught)
    sembunyi: false,       // sedang bersembunyi di papan info?
    sudahDiPapan: false,   // sudah sampai di balik papan (siap membaca)?
    papanAktif: null,      // papan yang sedang dipakai bersembunyi
  };
  jarak = START_GAP;

  rintangan = buatRintangan(folder, prolog, level.panjang);

  // papan info peminatan di pinggir jalan (hanya di map, bukan prolog)
  papan = [];
  if (!prolog) {
    for (let i = 1; i <= 3; i++) {
      papan.push({ x: level.panjang * i / 4 + 200, gambar: loadImg(folder + 'info' + i + '.png'),
                   objek: loadImg(folder + 'hide_obj.png'),   // objek tempat bersembunyi (beda tiap map)
                   sisa: SEMBUNYI_MAX,     // sisa waktu bersembunyi di papan ini
                   dipakai: false });      // sudah pernah dipakai bersembunyi? (hanya sekali per papan)
    }
    // area di sekitar papan dikosongkan dari rintangan supaya papan terbaca dan bisa didatangi
    rintangan = rintangan.filter(function(o){
      return !papan.some(function(b){ return o.x + o.w > b.x - SEMBUNYI_JAUH - 40 && o.x < b.x + 440; });
    });
  }

  // ----- tunggu semua gambar siap, baru mulai -----
  const daftarGambar = [level.latar, level.latarPanjang, level.gerbang, level.gambarBanteng];
  for (const aksi in level.animBanteng) {
    for (const g of level.animBanteng[aksi]) daftarGambar.push(g);
  }
  for (const o of rintangan) {
    daftarGambar.push(o.gambar);
    if (o.gambar2) daftarGambar.push(o.gambar2);
    for (const g of o.pecahan) daftarGambar.push(g);
  }
  for (const b of papan) { daftarGambar.push(b.gambar); daftarGambar.push(b.objek); }
  for (const nama in HITUNG) daftarGambar.push(HITUNG[nama]);
  for (const namaBaju of daftarBaju) {
    for (let i = 1; i <= 12; i++) daftarGambar.push(karakter[namaBaju][i]);
    daftarGambar.push(karakterMenunduk[namaBaju]);
    for (const g of karakterTertangkap[namaBaju]) daftarGambar.push(g);
    for (const g of karakterSembunyi[namaBaju]) daftarGambar.push(g);
  }

  const levelIni = level;
  tungguGambar(daftarGambar, function(){
    // gambar sudah siap; loading tetap tampil minimal beberapa detik supaya enak dilihat
    const sisa = Math.max(0, (ulang ? MIN_MEMUAT_ULANG : MIN_MEMUAT) - (performance.now() - waktuMulai));
    setTimeout(function(){
      if (level !== levelIni) return;   // pemain sudah pindah level, batalkan
      const mulaiMain = function(){
        if (level !== levelIni) return;
        showScreen(null);               // tutup layar
        dijeda = false;
        setPlaying(true);               // game mulai (hitung mundur 3-2-1)
      };
      if (ulang) mulaiMain();           // mengulang map yang sama: langsung main
      else tampilkanPetunjuk(mulaiMain);   // masuk map: layar petunjuk (lompat / menunduk) dulu
    }, sisa);
  });
}

/* ===================== HAL-HAL BANTU ===================== */
// Kamera: pemain selalu digambar di x = 200 layar, dunia yang bergeser.
function kameraX(){
  return pemain.x - 200;
}
// posisi kiri rintangan di layar
function kiriLayar(o){
  return o.x - kameraX();
}
// apakah rintangan sedang berada tepat di depan/di badan pemain? (hanya cek kiri-kanan)
function bersinggungan(o){
  const kiri = kiriLayar(o);
  return kiri < 280 && kiri + o.w > 230;
}
const DASAR_GANTUNG = GROUND - 95;      // bagian bawah rintangan yang menggantung

// posisi y bagian ATAS rintangan
function atasRintangan(o){
  if (o.gantung) return DASAR_GANTUNG - o.h;
  return GROUND - o.h;
}
// menggeser pemain; jarak ke banteng ikut berubah
function geser(dx){
  pemain.x += dx;
  jarak += dx;
}

/* ===================== UPDATE (dipanggil tiap frame) ===================== */
// dt = lama sejak frame sebelumnya (dalam detik, sekitar 0.016)
function update(dt){

  // 1. Sedang ditabrak banteng: tunggu sebentar lalu GAME OVER
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
    if (pemain.hitungMundur <= 0.6) startMusic();   // musik mulai bersamaan dengan "GO!"
    return;
  }

  // 3. Permainan berjalan
  urusSembunyi(dt);
  gerakPemain(dt);
  gerakBanteng(dt);
  kurangiWaktu(dt);
  fisikaLompat(dt);
  cekTabrakanRintangan();
  bantengMenghancurkanRintangan(dt);

  if (jarak > MAX_GAP) jarak = MAX_GAP;     // banteng tidak boleh terlalu jauh tertinggal

  if (cekBantengMenangkap()) return;

  if (pemain.x >= level.panjang) {          // sampai di gerbang
    finishLevel();
    return;
  }
  tampilkanHud();
}

// Pemain berlari ke kanan selama tombol → ditahan. Tidak ada tombol mundur.
function gerakPemain(dt){
  const pengali = level.prolog ? 0.75 : 1;       // prolog lebih santai

  pemain.menunduk = sedangMenunduk();
  pemain.sedangLari = sedangLari();

  if (pemain.sembunyi) {                       // sedang bersembunyi: tidak bisa lari / menunduk
    pemain.menunduk = false;
    pemain.sedangLari = pemain.sudahDiPapan ? false : true;   // sebelum sampai di papan: berlari ke balik papan
    return;                                    // (gerakan ke papan diatur di urusSembunyi)
  }

  let kecepatan = 0;
  if (pemain.sedangLari) {
    if (pemain.tersandung > 0) kecepatan = STUMBLE_SPEED * pengali;   // baru menabrak: melambat
    else kecepatan = SPEED * pengali;
  }
  geser(kecepatan * dt);
}

// Banteng mengejar. Jarak berkurang karena banteng lebih cepat dari "dunia".
function gerakBanteng(dt){
  const pengali = level.prolog ? 0.75 : 1;

  // pemain bersembunyi di balik papan: banteng bingung, tidak mengejar
  if (pemain.sembunyi && pemain.sudahDiPapan) {
    bantengBingung(dt);
    return;
  }
  if (level.bingung > 0) {                      // pemain baru keluar: banteng masih bingung di tempat
    level.bingung -= dt;
    level.bingungWaktu += dt;
    level.hadap = (Math.floor(level.bingungWaktu / 0.35) % 2 === 0) ? 1 : -1;
    return;                                     // (tidak mengejar; jarak hanya bertambah karena pemain lari)
  }
  level.hadap = 1;                              // mengejar lagi: selalu menghadap ke kanan (kalau tidak, bisa tetap terbalik setelah bingung)

  // kemarahan banteng turun pelan-pelan kalau pemain tidak menabrak
  pemain.marah = Math.max(0, pemain.marah - RAGE_DECAY * dt);

  // makin jauh map, banteng makin cepat sedikit (+40 di ujung map)
  const kecepatanDasar = BULL_SPEED + 40 * pemain.x / level.panjang;
  const kecepatan = kecepatanDasar * (1 + pemain.marah) * pengali;
  jarak -= kecepatan * dt;
}

// Menurunkan semua timer, dan mengganti baju di tengah prolog.
function kurangiWaktu(dt){
  pemain.tersandung -= dt;
  pemain.kebal -= dt;
  pemain.waktu += dt;
  pemain.kilat -= dt;

  if (level.prolog && !pemain.sudahGanti && pemain.x >= level.panjang / 2) {
    pemain.sudahGanti = true;
    baju = 'promed';        // ganti jas dokter
    pemain.kilat = 1.2;     // kilatan putih + tulisan "Ganti pakaian!"
  }
}

// Gravitasi, lompat, dan berdiri di atas rintangan besar / mobil.
function fisikaLompat(dt){
  const yLama = pemain.y;
  pemain.vy += GRAVITY * dt;       // gravitasi menarik ke bawah
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
    pemain.y = lantai;              // mendarat
    pemain.vy = 0;
    pemain.dilantai = true;
    pemain.jumlahLompat = 0;
  } else if (pemain.jumlahLompat === 0) {
    pemain.jumlahLompat = 1;        // jatuh dari atas blok: masih boleh 1x lompat di udara
  }
}

// Menabrak rintangan: pemain TERTAHAN di depannya sampai berhasil melompatinya.
// Hukumannya (jarak banteng berkurang & banteng marah) hanya SEKALI per tabrakan.
function cekTabrakanRintangan(){
  const tinggiBadan = (pemain.menunduk && pemain.dilantai) ? 75 : 140;

  for (const o of rintangan) {
    if (o.hancur > 0) continue;            // rintangan sudah hancur
    if (!bersinggungan(o)) continue;

    let kena;
    if (o.gantung) {
      kena = (pemain.y - tinggiBadan < DASAR_GANTUNG) && (pemain.y > atasRintangan(o));   // kepala kena
    } else {
      kena = pemain.y > atasRintangan(o) + 8;                                              // kaki di bawah puncak
    }
    if (!kena) continue;

    geser(o.x - 81 - pemain.x);                          // tidak tembus: tertahan di depan rintangan
    pemain.tersandung = Math.max(pemain.tersandung, 0.3);
    if (pemain.kebal <= 0) {
      pemain.kebal = 1.2;
      jarak -= STUMBLE_LOSS;
      pemain.marah = Math.min(RAGE_MAX, pemain.marah + RAGE_PER_HIT);
    }
  }
}

// Banteng menghancurkan rintangan kecil yang tersentuh moncongnya.
// Rintangan "kuat" (blok besar & mobil) tidak bisa hancur: banteng MELOMPATINYA dengan lengkungan lompat.
//   - kalau pemain ada di atas rintangan itu / belum melewatinya (melayang), banteng menunggu di depannya dulu
//   - kalau pemain tertahan di depan rintangan (di tanah), banteng langsung menangkapnya
function bantengMenghancurkanRintangan(dt){
  const moncong = pemain.x + 30 - jarak;      // posisi moncong banteng di dunia
  const bingung = pemain.sembunyi || level.bingung > 0;

  level.bantengY = 0;
  if (bingung) level.aksiBanteng = 'bingung';
  else if (jarak < 90) level.aksiBanteng = 'charge';   // dekat = menyeruduk
  else level.aksiBanteng = 'run';

  for (const o of rintangan) {
    if (o.hancur > 0) {                       // sudah hancur: hitung lama sejak hancur (untuk animasi)
      o.hancur += dt;
      continue;
    }
    if (o.sudahDilewati) continue;

    if (!o.kuat) {
      if (moncong >= o.x) o.hancur = 0.001;   // hancur!
      continue;
    }

    // ----- rintangan kuat: dilompati -----
    if (bingung) continue;                    // lagi bingung: tidak mengurus rintangan kuat
    const awalLompat = o.x - LOMPAT_AWAL;
    const akhirLompat = o.x + o.w + LOMPAT_AKHIR;
    if (moncong < awalLompat) continue;       // masih jauh
    if (moncong >= akhirLompat) { o.sudahDilewati = true; continue; }

    if (!o.mulaiLompat) {
      const pemainTertahan = pemain.dilantai && pemain.x < o.x - 30;   // di tanah, di depan rintangan
      if (pemainTertahan) {
        continue;                             // pemain tertahan di tanah: banteng terus mendekat dan menangkapnya
      }
      o.mulaiLompat = true;                   // selain itu banteng langsung lompat (pemain masih di atas pun tetap dikejar)
    }

    // lengkung lompat: 0 di awal, setinggi LOMPAT_TINGGI di tengah (agak datar), 0 saat mendarat
    const u = (moncong - awalLompat) / (akhirLompat - awalLompat);
    const tinggi = LOMPAT_TINGGI * (1 - Math.pow(2 * u - 1, 4));
    level.bantengY = Math.max(level.bantengY, tinggi);
    level.aksiBanteng = 'lompat';
    level.lompatU = u;                         // 0 = baru lepas landas, 1 = mendarat (untuk memilih gambar lompat)
  }
}

/* ===================== SEMBUNYI DI PAPAN INFO ===================== */
// papan info yang sedang cukup dekat untuk dijadikan tempat bersembunyi (atau null)
function papanDekat(){
  for (const b of papan) {
    if (pemain.x >= b.x - SEMBUNYI_JAUH && pemain.x <= b.x + OBJEK_SEMBUNYI.x + OBJEK_SEMBUNYI.w / 2 - 30) return b;
  }
  return null;
}

// apakah pemain boleh mulai bersembunyi sekarang?
function bisaSembunyi(){
  if (!level || pemain.hitungMundur > 0.6 || pemain.matiTimer > 0 || pemain.sembunyi) return false;
  const b = papanDekat();
  return !!b && !b.dipakai && b.sisa > 0 && pemain.dilantai && pemain.tersandung <= 0 && jarak >= SEMBUNYI_MIN_JARAK;
}

// Pencet E (atau tombol mata): pemain berlari ke objek di dekat papan lalu bersembunyi di baliknya.
// Pencet E lagi (atau waktu habis): pemain keluar, banteng masih bingung sebentar.
function togolSembunyi(){
  if (!sedangMain || dijeda || !level || pemain.matiTimer > 0) return;

  if (pemain.sembunyi) {                      // sedang bersembunyi / menuju objek: keluar / batal
    if (pemain.sudahDiPapan) keluarSembunyi();
    else { pemain.sembunyi = false; pemain.papanAktif = null; }
    return;
  }
  if (bisaSembunyi()) {                       // mulai bersembunyi
    pemain.sembunyi = true;
    pemain.sudahDiPapan = false;
    pemain.papanAktif = papanDekat();
  }
}

function keluarSembunyi(){
  pemain.sembunyi = false;
  pemain.sudahDiPapan = false;
  pemain.papanAktif = null;
  level.bingung = BINGUNG_SETELAH;            // banteng masih bingung sebentar
}

// dipanggil tiap frame: berlari ke objek, lalu menghitung sisa waktu bersembunyi
function urusSembunyi(dt){
  if (!pemain.sembunyi) return;
  const b = pemain.papanAktif;

  if (!pemain.sudahDiPapan) {
    // tujuan: pemain tepat di balik objek (pusat badan pemain = pemain.x + 40)
    const sasaran = b.x + OBJEK_SEMBUNYI.x + OBJEK_SEMBUNYI.w / 2 - 40;
    geser(Math.min(SPEED * dt, Math.max(0, sasaran - pemain.x)));   // hanya maju, tidak mundur
    if (sasaran - pemain.x <= 1) {
      pemain.sudahDiPapan = true;
      b.dipakai = true;                       // satu papan hanya bisa dipakai sekali
      level.bingungWaktu = 0;
    }
    return;
  }

  b.sisa -= dt;
  if (b.sisa <= 0) keluarSembunyi();
}

// Banteng yang kehilangan pemain: mondar-mandir bolak-balik di dekat papan sambil celingukan.
function bantengBingung(dt){
  level.bingungWaktu += dt;
  const sasaran = 120 + 50 * Math.sin(level.bingungWaktu * 2.6);   // jarak bergoyang antara 70 dan 170
  const selisih = sasaran - jarak;
  const langkah = Math.max(-300 * dt, Math.min(300 * dt, selisih));
  jarak += langkah;
  if (Math.abs(langkah) > 0.3) level.hadap = (langkah > 0) ? -1 : 1;   // jarak membesar = mundur = menghadap kiri
}

// Banteng menangkap pemain HANYA kalau badannya benar-benar menyentuh badan pemain.
// Kalau pemain masih melayang di atas banteng, banteng MENUNGGU di bawahnya sampai pemain turun.
// Mengembalikan true kalau pemain tertangkap.
function cekBantengMenangkap(){
  if (pemain.sembunyi && pemain.sudahDiPapan) return false;   // bersembunyi: tidak bisa ditangkap

  // kotak badan banteng (kiri & kanan di layar, bagian atas)
  const bantengKiri = 230 - jarak - 150 + 20;
  const bantengKanan = 230 - jarak - 10;
  const bantengAtas = GROUND - 70;

  // kotak badan pemain
  const pemainKiri = 222;
  const pemainKanan = 258;
  const kakiPemain = pemain.y - 6;

  const sejajar = (bantengKanan > pemainKiri) && (bantengKiri < pemainKanan);
  if (!sejajar) return false;
  if (level.bantengY > 0 && kakiPemain < GROUND - 40) return false;   // banteng sedang melompat & pemain di atas: lewat saja, tidak menahan

  if (bantengAtas < kakiPemain) {      // kaki pemain cukup rendah: badan kena
    caught();
    return true;
  }
  jarak = -3;                          // pemain di udara: banteng ditahan, menunggu pemain turun
  level.aksiBanteng = 'wait';
  return false;
}

function tampilkanHud(){
  $('btnSembunyi').style.display = (bisaSembunyi() || pemain.sembunyi) ? 'grid' : 'none';
  const nama = level.prolog ? 'Prolog' : MAPS[level.mapIndex].name;
  const persen = Math.floor(pemain.x / level.panjang * 100);
  $('hud').textContent = nama + '  ' + persen + '%';
}

/* ===================== KALAH & MENANG ===================== */
// dipanggil saat banteng menangkap pemain
function caught(){
  pemain.matiTimer = TERTANGKAP.durasi;   // adegan ditabrak (animasi caught1..6) sebelum layar game over
  pemain.tTangkap = 0;
  pemain.sembunyi = false;
  level.bantengY = 0;                      // banteng mendarat tepat di pemain
  $('btnSembunyi').style.display = 'none';
  pemain.tersandung = 1;
  stopMusic();
  bunyiGameOver();
}

function gameOver(){
  setPlaying(false);
  $('overInfo').textContent = level.prolog ? 'Prolog' : MAPS[level.mapIndex].name;
  showScreen('gameover');
}

// dipanggil saat pemain sampai di gerbang
function finishLevel(){
  setPlaying(false);
  stopMusic();

  if (level.prolog) {
    baju = 'promed';
    selesai.clear();          // mulai game baru: map yang selesai dikosongkan
    prologSelesai = true;
    simpan();
    message('Prolog selesai!\nKamu sudah jadi mahasiswa Promed. Sekarang pilih peminatanmu.', 'LANJUT', openSelect);
    return;
  }

  selesai.add(level.mapIndex);
  simpan();

  const m = MAPS[level.mapIndex];
  let teks = m.name + ' selesai! (' + selesai.size + '/' + MAPS.length + ')\n';
  teks += 'Studio: ' + m.studio + ' · Core Stream: ' + m.stream;
  if (selesai.size === MAPS.length) teks += '\n🏆 Semua selesai! FINAL terbuka';
  message(teks, 'LANJUT', openSelect);
}
