/* =====================================================================
   LEVEL.JS  -  memulai satu level (prolog / map): menyiapkan data pemain,
   musuh, rintangan, papan info, lalu memuat gambarnya.
   (pemain = data pemain, jarak = jarak musuh ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

// mapIndex: 0-4 = map peminatan 1-5, -1 = prolog
let terakhirMap = null; // map yang terakhir dimulai (untuk membedakan 'ulangi' dari masuk baru)

function startLevel(mapIndex) {
  const prolog = mapIndex < 0;
  const ulang = mapIndex === terakhirMap; // mengulang map yang sama -> loading singkat
  terakhirMap = mapIndex;
  const waktuMulai = performance.now();
  tampilkanMemuat(mapIndex); // layar loading gelap + animasi + teks tentang map

  setPlaying(false); // tahan dulu sampai semua gambar siap (supaya tidak ada map kosong)
  dijeda = false;
  if (prolog) baju = 'awal'; // prolog selalu mulai dengan baju awal

  const folder = prolog ? 'assets/prolog/' : 'assets/map' + (mapIndex + 1) + '/';

  // ----- data level -----
  level = {
    prolog: prolog,
    mapIndex: mapIndex,
    panjang: prolog ? PANJANG_PROLOG : PANJANG_MAP,
    latar: loadImg(folder + 'bg.jpg'), // background pendek (dipakai kalau looping)
    latarPanjang: loadImg(folder + 'bg-panjang.jpg'), // background panjang (tidak looping)
    gerbang: loadImg(folder + 'gate.png'),
    gambarJas: prolog ? loadImg(folder + 'jas.png') : null, // jaket kuning melayang (hanya prolog)
    gambarMusuh: loadImg(folder + 'chaser.png'),
    animMusuh: {}, // gambar animasi musuh: run, wait, charge
    aksiMusuh: 'run', // sedang apa musuh: 'run', 'wait' (menunggu), 'charge' (menyeruduk), 'bingung'
    lompatU: 0, // posisi dalam lompatan (0..1), dipakai memilih gambar lompat
    musuhY: 0, // tinggi musuh di atas tanah (saat melompati rintangan kuat)
    hadap: 1, // arah hadap musuh: 1 = kanan, -1 = kiri (saat bingung bolak-balik)
    bingung: 0, // sisa waktu musuh masih bingung setelah pemain keluar dari persembunyian
    bingungWaktu: 0 // jam untuk gerakan bolak-balik musuh
  };
  for (const aksi in ANIM_MUSUH) {
    level.animMusuh[aksi] = [];
    for (let i = 1; i <= jumlahFrame(aksi, prolog ? 0 : mapIndex + 1); i++) {
      level.animMusuh[aksi].push(loadImg(folder + 'chaser_' + aksi + i + '.png'));
    }
  }

  // ----- data pemain -----
  pemain = {
    x: 0, // posisi di dunia (makin besar = makin jauh)
    y: GROUND, // posisi kaki (makin kecil = makin tinggi)
    vy: 0, // kecepatan naik/turun
    dilantai: true, // sedang menginjak tanah / rintangan?
    jumlahLompat: 0, // sudah lompat berapa kali (maksimal 2 = double jump)
    menunduk: false,
    sedangLari: false,
    tersandung: 0, // sisa waktu animasi "kena" (detik)
    kebal: 0, // sisa waktu kebal setelah menabrak (karakter berkedip)
    marah: 0, // seberapa marah musuh (makin sering menabrak makin besar)
    waktu: 0, // jam untuk animasi
    hitungMundur: 3, // hitung mundur 3-2-1 sebelum mulai
    matiTimer: 0, // > 0 = sedang adegan ditabrak musuh
    kilat: 0, // kilatan putih saat ganti baju
    sudahGanti: false, // sudah ganti baju di prolog?
    tTangkap: 0, // lama adegan ditabrak (untuk animasi caught)
    sembunyi: false, // sedang bersembunyi di papan info?
    sudahDiPapan: false, // sudah sampai di balik papan (siap membaca)?
    papanAktif: null // papan yang sedang dipakai bersembunyi
  };
  jarak = START_GAP;

  rintangan = buatRintangan(folder, prolog, level.panjang);

  // papan info peminatan di pinggir jalan (hanya di map, bukan prolog)
  papan = [];
  if (!prolog) {
    for (let i = 1; i <= 3; i++) {
      papan.push({
        nomor: i,
        x: (level.panjang * i) / 4 + 200,
        gambar: loadImg(folder + 'info' + i + '.png'),
        objek: loadImg(folder + 'hide_obj.png'), // objek tempat bersembunyi (beda tiap map)
        sisa: SEMBUNYI_MAX, // sisa waktu bersembunyi di papan ini
        dipakai: false
      }); // sudah pernah dipakai bersembunyi? (hanya sekali per papan)
    }
    // area di sekitar papan dikosongkan dari rintangan supaya papan terbaca dan bisa didatangi
    rintangan = rintangan.filter(function (o) {
      return !papan.some(function (b) {
        return o.x + o.w > b.x - SEMBUNYI_JAUH - 40 && o.x < b.x + 440;
      });
    });
  }

  // ----- tunggu semua gambar siap, baru mulai -----
  const daftarGambar = [level.latar, level.latarPanjang, level.gerbang, level.gambarMusuh];
  if (level.gambarJas) daftarGambar.push(level.gambarJas);
  for (const aksi in level.animMusuh) {
    for (const g of level.animMusuh[aksi]) daftarGambar.push(g);
  }
  for (const o of rintangan) {
    daftarGambar.push(o.gambar);
    if (o.gambar2) daftarGambar.push(o.gambar2);
    for (const g of o.pecahan) daftarGambar.push(g);
  }
  for (const b of papan) {
    daftarGambar.push(b.gambar);
    daftarGambar.push(b.objek);
  }
  for (const nama in HITUNG) daftarGambar.push(HITUNG[nama]);
  for (const namaBaju of daftarBaju) {
    for (let i = 1; i <= 12; i++) daftarGambar.push(karakter[namaBaju][i]);
    daftarGambar.push(karakterMenunduk[namaBaju]);
    for (const g of karakterTertangkap[namaBaju]) daftarGambar.push(g);
    for (const g of karakterSembunyi[namaBaju]) daftarGambar.push(g);
  }

  const levelIni = level;
  tungguGambar(daftarGambar, function () {
    // gambar sudah siap; loading tetap tampil minimal beberapa detik supaya enak dilihat
    const sisa = Math.max(0, (ulang ? MIN_MEMUAT_ULANG : MIN_MEMUAT) - (performance.now() - waktuMulai));
    setTimeout(function () {
      if (level !== levelIni) return; // pemain sudah pindah level, batalkan
      const mulaiMain = function () {
        if (level !== levelIni) return;
        showScreen(null); // tutup layar
        dijeda = false;
        setPlaying(true); // game mulai (hitung mundur 3-2-1)
      };
      if (ulang)
        mulaiMain(); // mengulang map yang sama: langsung main
      else tampilkanPetunjuk(mulaiMain); // masuk map: layar petunjuk (lompat / menunduk) dulu
    }, sisa);
  });
}
