/* =====================================================================
   STATE.JS  -  variabel yang dipakai bersama oleh semua file,
   plus simpan / muat progres.
   ===================================================================== */

// jalan pintas: $('btnPlay') sama dengan document.getElementById('btnPlay')
const $ = id => document.getElementById(id);
const ctx = $('c').getContext('2d');      // "kuas" untuk menggambar di canvas

let level;                // data map yang sedang dimainkan (dibuat di startLevel)
let pemain;               // data pemain (posisi, kecepatan, dll)
let rintangan = [];       // daftar semua rintangan di map
let papan = [];           // daftar papan info di pinggir jalan
let jarak = 0;            // jarak banteng ke pemain (makin kecil = makin dekat)

let sedangMain = false;   // true kalau game sedang berjalan
let dijeda = false;       // true kalau sedang di-pause

let baju = 'awal';        // baju karakter: 'awal' (sebelum prolog selesai), lalu 'promed'
const selesai = new Set();  // nomor map yang sudah diselesaikan, contoh {0, 2}
let prologSelesai = false;  // sudah menyelesaikan prolog? (untuk tombol Lanjutkan)

/* ----- simpan progres di browser (localStorage) ----- */
const KUNCI_SIMPAN = 'promedProgress';

function simpan(){
  const data = { prolog: prologSelesai, finished: Array.from(selesai) };
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(data));
  } catch (e) {
    // kalau browser melarang penyimpanan, abaikan saja
  }
}

function muat(){
  try {
    const teks = localStorage.getItem(KUNCI_SIMPAN);
    if (teks) {
      const data = JSON.parse(teks);
      prologSelesai = !!data.prolog;
      for (const nomor of data.finished) selesai.add(nomor);
    }
  } catch (e) {
    // data rusak: abaikan, mulai dari awal
  }
  if (prologSelesai) baju = 'promed';
}
muat();   // jalan sekali saat game dibuka
