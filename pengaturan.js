/* =====================================================================
   PENGATURAN.JS  -  semua angka yang boleh kamu ubah ada di file ini.
   Ubah angkanya, simpan, lalu refresh browser untuk melihat hasilnya.
   ===================================================================== */

/* ----- ukuran layar ----- */
const H = 540;              // tinggi layar game
const GROUND = 460;         // posisi tanah (y). Makin besar = tanah makin ke bawah
const BG_W = 960;           // lebar gambar background (dipakai kalau background looping)
const BG_LOOPING = false;   // false = background panjang, tampil sekali dari awal sampai akhir map (assets/mapN/bg-panjang.jpg)
                            // true  = background pendek (bg.jpg) diulang-ulang terus
let W = 960;                // lebar layar (otomatis menyesuaikan jendela, lihat fit() di menu.js)

/* ----- karakter pemain ----- */
const PLAYER_H = 150;       // tinggi karakter di layar
const FPS = 12;             // kecepatan animasi karakter (gambar per detik)
// karakter punya 12 gambar (1.png - 12.png). Ini pembagiannya:
const RUN = [1, 2, 3, 4, 5, 6, 7, 8];   // gambar saat berlari
const AIR = [9];                        // gambar saat melompat
const HIT = [10, 11, 12];               // gambar saat menabrak

/* ----- kecepatan & lompat ----- */
const SPEED = 540;          // kecepatan lari pemain
const STUMBLE_SPEED = 370;  // kecepatan pemain setelah menabrak
const GRAVITY = 2600;       // gravitasi (makin besar = jatuh makin cepat)
const JUMP = -840;          // kekuatan lompat pertama (minus = ke atas)
const JUMP2 = -760;         // kekuatan lompat kedua (double jump)

/* ----- pengejar (banteng) ----- */
const START_GAP = 170;      // jarak awal banteng ke pemain
const MAX_GAP = 340;        // jarak paling jauh banteng kalau pemain tidak pernah menabrak
const BULL_SPEED = 480;     // kecepatan dasar banteng (sedikit lebih lambat dari pemain)
const STUMBLE_LOSS = 40;    // jarak yang hilang setiap pemain menabrak
const RAGE_PER_HIT = 0.16;  // banteng makin cepat sebesar ini setiap pemain menabrak
const RAGE_MAX = 0.55;      // batas paling cepat
const RAGE_DECAY = 0.12;    // banteng kembali normal pelan-pelan sebesar ini per detik

// animasi banteng. Gambarnya: assets/mapN/chaser_run1.png, chaser_wait1.png, chaser_charge1.png, dst.
// jumlah = banyak gambar, fps = kecepatan gantinya
const ANIM_BANTENG = {
  run:    { jumlah: 6, fps: 12 },    // berlari
  wait:   { jumlah: 3, fps: 4 },     // diam menunggu
  charge: { jumlah: 2, fps: 16 },    // menyeruduk
};

/* ----- panjang map ----- */
const PANJANG_MAP = 14000;
const PANJANG_PROLOG = 7000;
const PENGALI_JARAK_RINTANGAN = 1.1;   // jarak antar rintangan dikali angka ini (makin besar = rintangan makin jarang)

/* ----- data 6 peminatan (urutan = nomor map) ----- */
const MAPS = [
  { name: 'Digital Advertising, Gig Media & Gamification', studio: 'KULS Creative', stream: 'Project Manager & Designer', deskripsi: 'Iklan digital, gig media, dan gamifikasi. Studio KULS Creative.' },
  { name: 'Filmografi, Videografi & Fotografi', studio: 'Orang Film UI', stream: 'Artist & Engineer', deskripsi: 'Keterampilan konseptual dan teknis memproduksi film, videografi, dan fotografi. Studio Orang Film UI.' },
  { name: 'Musik', studio: 'WIRE Studio', stream: 'Artist, Engineer', deskripsi: 'Menciptakan, mengelola bisnis, dan memasarkan musik. Studio WIRE.' },
  { name: 'Fashion & Lifestyle', studio: 'FLUI Media', stream: 'Project Manager & Designer', deskripsi: 'Mengelola produk dan media fashion dan lifestyle. Studio FLUI Media.' },
  { name: 'OXLAB', studio: 'OXLAB', stream: '-', deskripsi: '=' },
  { name: 'Peminatan 6', studio: '(isi studio)', stream: '(isi core stream)', deskripsi: '(isi deskripsi peminatan 6)' },
];

// ----- layar loading sebelum masuk map (gelap, animasi PNG, teks tipis tentang map) -----
const MIN_MEMUAT = 2200;         // lama minimal layar loading (milidetik) supaya teksnya sempat terbaca
const MIN_MEMUAT_ULANG = 700;    // kalau mengulang map yang sama, loading dibuat lebih singkat
const TEKS_PROLOG = 'Berlari di kampus dan bersiap menjelajahi peminatan Promed.';

/* ----- posisi tiap map di layar "Pilih Peminatan" (x%, y%) ----- */
const POS = [[30, 32], [30, 68], [52, 32], [52, 68], [74, 32], [74, 68]];
const START = [10, 50];     // posisi node awal (karakter)
const FINAL = [91, 50];     // posisi node FINAL
