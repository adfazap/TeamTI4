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
const RUN = [2, 3, 4, 5, 6, 7, 8];   // gambar saat berlari
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
// baju karakter yang berlari di layar awal (tombol Main): 'awal' = baju biasa, 'promed' = Jaket kuning
const BAJU_HOME = 'home';

// Jaket kuning melayang di prolog: harus diambil (lompat) supaya baju berganti dan prolog bisa diselesaikan
const JAS = { ukuran: 84, tinggi: 185, jarakPetunjuk: 900 };   // tinggi = tinggi tengah jas dari tanah (makin besar = makin tinggi)

// ukuran banteng di layar (1 = ukuran asli gambar, 1.4 = 40% lebih besar). Moncong tetap di tempat yang sama.
const SKALA_BANTENG = 1.4;

// jumlah gambar lari tiap map (urutan: prolog, map1..map5). Map yang gambarnya lebih banyak, isi angkanya.
const JUMLAH_LARI = [6, 6, 6, 7, 6, 6];
function jumlahFrame(aksi, nomorMap){ return aksi === 'run' ? JUMLAH_LARI[nomorMap] : ANIM_BANTENG[aksi].jumlah; }

const ANIM_BANTENG = {
  run:    { jumlah: 4, fps: 12 },    // berlari
  wait:   { jumlah: 3, fps: 4 },     // diam menunggu
  charge: { jumlah: 2, fps: 16 },    // menyeruduk
  lompat: { jumlah: 3, fps: 1 },     // melompati rintangan kuat: hidung naik, puncak, mendarat (dipilih sesuai posisi lompatan)
  bangga: { jumlah: 3, fps: 4 },     // bangga setelah menangkap pemain (diam di tempat, dada membusung, berkilau)
  bingung:{ jumlah: 3, fps: 5 },     // bingung (tanda tanya) saat pemain bersembunyi
};

// banteng melompati rintangan KUAT (blok besar & mobil) dengan lengkungan lompat
const LOMPAT_TINGGI = 160;     // setinggi apa lompatan banteng (harus lebih tinggi dari blok terbesar = 110)
const LOMPAT_AWAL = 60;        // mulai melompat sejauh ini sebelum rintangan
const LOMPAT_AKHIR = 160;      // mendarat sejauh ini setelah rintangan

// animasi karakter saat ditabrak banteng: assets/char/<baju>/caught1.png ... caught6.png
const TERTANGKAP = {
  jumlah: 6,                   // banyak gambar
  fps: 6,                      // kecepatan ganti gambar (3 gambar terakhir diulang-ulang)
  durasi: 1.7,                 // lama adegan (detik) sebelum layar game over
};

/* ----- papan info: sembunyi & baca ----- */
// pencet E di dekat papan info: karakter berlari ke kolong papan lalu bersembunyi di balik objek kecil (assets/mapN/hide_obj.png).
// pencet E lagi untuk keluar. Banteng jadi bingung selama pemain bersembunyi.
const SEMBUNYI_JAUH = 700;     // pengingat "Pencet E" muncul & sembunyi bisa dimulai sejauh ini sebelum papan (px)
const SEMBUNYI_MAX = 5;        // lama maksimal bersembunyi di satu papan (detik)
const SEMBUNYI_MIN_JARAK = 70; // kalau banteng lebih dekat dari ini, tidak bisa bersembunyi
const BINGUNG_SETELAH = 1.0;   // banteng masih bingung sekian detik setelah pemain keluar
const OBJEK_SEMBUNYI = { x: 130, w: 100, h: 80 };     // objek sembunyi kecil di KOLONG papan (antara dua tiang): jarak dari kiri papan, lebar, tinggi
const GAMBAR_SEMBUNYI = 2;     // assets/char/<baju>/hide1.png, hide2.png

/* ----- panjang map ----- */
const PANJANG_MAP = 14000;
const PANJANG_PROLOG = 7000;
const PENGALI_JARAK_RINTANGAN = 1.1;   // jarak antar rintangan dikali angka ini (makin besar = rintangan makin jarang)

/* ----- data 5 peminatan (urutan = nomor map) ----- */
const MAPS = [
  { name: 'KULS', studio: 'KULS Creative', stream: 'Project Manager & Designer',
    deskripsi: 'Merancang promosi produk, gig media, dan konsep gamifikasi: dari strategi brand sampai kampanye kreatif multiplatform. Studio KULS Creative.' },
  { name: 'ORFIL', studio: 'Orang Film UI', stream: 'Artist & Engineer',
    deskripsi: 'Memproduksi film, videografi, dan fotografi: manajemen kru, pengoperasian alat, pra-produksi sampai pasca-produksi. Studio Orang Film UI.' },
  { name: 'WIRE', studio: 'WIRE Studio', stream: 'Artist, Engineer',
    deskripsi: 'Menciptakan, mengelola bisnis, dan memasarkan musik: dari produksi dan recording sampai distribusi rilisan. Studio WIRE.' },
  { name: 'FLUI', studio: 'FLUI Media', stream: 'Project Manager & Designer',
    deskripsi: 'Mengelola produk dan media fashion dan lifestyle: desain, koordinasi talent, jurnalisme, dan pemasaran brand. Studio FLUI Media.' },
  { name: 'OXLAB', studio: 'OX-Laboratory', stream: 'Engineer & Artist',
    deskripsi: 'Membuat game digital: desain, pemrograman, aset visual dan audio, sampai marketing dan publishing. Studio OX-Laboratory.' },
];

// ----- layar loading sebelum masuk map (gelap, animasi PNG, teks tipis tentang map) -----
const MIN_MEMUAT = 2200;         // lama minimal layar loading (milidetik) supaya teksnya sempat terbaca
const MIN_MEMUAT_ULANG = 700;    // kalau mengulang map yang sama, loading dibuat lebih singkat
const TEKS_PROLOG = 'Berlari sampai mendapatkan jakun dan bersiap menjelajahi peminatan Promed.';

/* ----- posisi tiap map di layar "Pilih Peminatan" (x%, y%) ----- */
const POS = [[30, 32], [30, 68], [52, 32], [52, 68], [74, 50]];
const START = [10, 50];     // posisi node awal (karakter)
const FINAL = [91, 50];     // posisi node FINAL
