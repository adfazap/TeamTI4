/* =====================================================================
   RINTANGAN.JS  -  jenis-jenis rintangan dan cara membuatnya.
   ===================================================================== */

/* Setiap jenis rintangan punya:
     w, h    = lebar & tinggi di layar
     gambar  = nama file gambar di folder map (tanpa .png)
     jarak   = jarak minimal ke rintangan berikutnya
     gantung = true kalau menggantung di atas kepala (harus menunduk)
     kuat    = true kalau TIDAK bisa dihancurkan banteng (banteng menunggu dulu lalu melompatinya) */
const TYPES = {
  k1:   { jenis: 'k1',   w: 60,  h: 80,  gambar: 'ob1',  jarak: 450 },                 // peti kecil
  k2:   { jenis: 'k2',   w: 60,  h: 80,  gambar: 'ob2',  jarak: 450 },                 // cone
  p1:   { jenis: 'p1',   w: 60,  h: 80,  gambar: 'p1',   jarak: 450 },                 // benda bertema map (1)
  p2:   { jenis: 'p2',   w: 60,  h: 80,  gambar: 'p2',   jarak: 450 },                 // benda bertema map (2)
  pair: { jenis: 'pair', w: 120, h: 80,  gambar: 'p1', gambar2: 'p2', jarak: 520 },   // dua benda berdempetan
  tall: { jenis: 'tall', w: 48,  h: 120, gambar: 'tall', jarak: 480 },                 // tinggi & sempit
  car:  { jenis: 'car',  w: 176, h: 76,  gambar: 'car',  jarak: 600, kuat: true },     // mobil: bisa dinaiki
  big:  { jenis: 'big',  w: 160, h: 110, gambar: 'big',  jarak: 700, kuat: true },     // blok besar: bisa dinaiki
  hang: { jenis: 'hang', w: 88,  h: 68,  gambar: 'hang', jarak: 450, gantung: true },  // menggantung: harus menunduk

  // ----- khusus PROLOG (gambar di assets/prolog/) -----
  buku:   { jenis: 'buku',   w: 60,  h: 80, gambar: 'buku',   jarak: 450 },                 // tumpukan buku (dilompati)
  meja:   { jenis: 'meja',   w: 112, h: 68, gambar: 'meja',   jarak: 520 },                 // meja dan kursi (dilompati)
  kertas: { jenis: 'kertas', w: 60,  h: 72, gambar: 'kertas', jarak: 450 },                 // tumpukan kertas ujian (dilompati)
  banner: { jenis: 'banner', w: 96,  h: 72, gambar: 'banner', jarak: 450, gantung: true },  // banner ujian menggantung (menunduk)
};

// gambar yang punya file sendiri di folder prolog (selain itu prolog memakai ob1.png)
const GAMBAR_PROLOG = ['big', 'buku', 'meja', 'kertas', 'banner'];
// yang punya gambar pecahan sendiri di folder prolog (debris_<nama>.png)
const PECAHAN_PROLOG = ['buku', 'meja', 'kertas', 'banner'];

// Memilih jenis rintangan secara acak. Angkanya = peluang (0.14 = 14%).
function pilihJenis(prolog){
  if (prolog) {                         // prolog: buku, meja-kursi, kertas ujian (lompat), blok besar (naik), banner ujian (menunduk)
    const a = Math.random();
    if (a < 0.26) return 'buku';
    if (a < 0.52) return 'meja';
    if (a < 0.78) return 'kertas';
    if (a < 0.89) return 'big';
    return 'banner';
  }
  const acak = Math.random();
  let jenis;
  if (acak < 0.14) jenis = 'k1';
  else if (acak < 0.22) jenis = 'k2';
  else if (acak < 0.36) jenis = 'p1';
  else if (acak < 0.50) jenis = 'p2';
  else if (acak < 0.60) jenis = 'pair';
  else if (acak < 0.72) jenis = 'tall';
  else if (acak < 0.84) jenis = 'car';
  else if (acak < 0.92) jenis = 'big';
  else jenis = 'hang';

  // prolog dibuat lebih mudah: tidak ada rintangan yang sulit
  if (prolog && (jenis === 'pair' || jenis === 'tall' || jenis === 'car')) jenis = 'k1';
  return jenis;
}

// Mengambil gambar rintangan dari folder map.
// Prolog punya gambar sendiri (lihat GAMBAR_PROLOG), jenis lain memakai ob1.png.
function ambilGambar(folder, nama, prolog){
  if (prolog && !GAMBAR_PROLOG.includes(nama)) nama = 'ob1';
  return loadImg(folder + nama + '.png');
}

// Gambar pecahan (debris) yang muncul setelah rintangan hancur
function ambilPecahan(folder, nama, prolog){
  if (prolog && !PECAHAN_PROLOG.includes(nama)) nama = 'ob1';
  return loadImg(folder + 'debris_' + nama + '.png');
}

// Membuat semua rintangan sepanjang map, dari kiri ke kanan.
function buatRintangan(folder, prolog, panjangMap){
  const daftar = [];
  const pengaliJarak = prolog ? 1.5 : 1;          // prolog: rintangan lebih jarang
  let x = prolog ? 1200 : 900;                    // posisi rintangan pertama

  while (x < panjangMap - 700) {
    const data = TYPES[pilihJenis(prolog)];

    const obj = {
      x: x,
      w: data.w,
      h: data.h,
      jenis: data.jenis,
      gantung: !!data.gantung,
      kuat: !!data.kuat,
      terbalik: false,                            // (dulu gambar gantung prolog dibalik; banner ujian tidak dibalik)
      gambar: ambilGambar(folder, data.gambar, prolog),
      gambar2: null,
      pecahan: [ambilPecahan(folder, data.gambar, prolog)],
      hancur: 0,        // 0 = utuh. Kalau > 0 = sudah hancur (angkanya = lama sejak hancur)
      mulaiLompat: false,     // banteng sedang / sudah melompati rintangan kuat ini
      sudahDilewati: false,   // banteng sudah selesai melompatinya
    };
    if (data.gambar2) {
      obj.gambar2 = ambilGambar(folder, data.gambar2, prolog);
      obj.pecahan.push(ambilPecahan(folder, data.gambar2, prolog));
    }
    daftar.push(obj);

    x = x + (data.jarak + Math.random() * 350) * PENGALI_JARAK_RINTANGAN * pengaliJarak;   // jarak ke rintangan berikutnya
  }
  return daftar;
}
