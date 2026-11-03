/* =====================================================================
   GAMBAR.JS  -  memuat gambar PNG dan menggambarnya ke layar.
   ===================================================================== */

// Setiap gambar cukup dimuat SEKALI lalu disimpan di sini,
// jadi waktu main ulang / ganti map tidak perlu memuat lagi (tidak ada layar kosong).
const simpananGambar = {};

function loadImg(alamat){
  if (!simpananGambar[alamat]) {
    const gambar = new Image();
    gambar.src = alamat;
    simpananGambar[alamat] = gambar;
  }
  return simpananGambar[alamat];
}

// true kalau gambar sudah selesai dimuat dan tidak rusak
function gambarSiap(gambar){
  return gambar.complete && gambar.naturalWidth > 0;
}

// Gambar sebuah gambar di canvas. Kalau gambarnya belum siap, tampilkan kotak berwarna.
function drawImg(gambar, x, y, lebar, tinggi, warnaCadangan){
  if (gambarSiap(gambar)) {
    ctx.drawImage(gambar, x, y, lebar, tinggi);
  } else {
    ctx.fillStyle = warnaCadangan;
    ctx.fillRect(x, y, lebar, tinggi);
  }
}

// Tunggu sampai semua gambar di daftar selesai dimuat, baru jalankan setelahSiap().
function tungguGambar(daftar, setelahSiap){
  let belumSelesai = 0;
  for (const gambar of daftar) {
    if (!gambar.complete) belumSelesai++;
  }
  if (belumSelesai === 0) {
    setelahSiap();
    return;
  }

  let sudahJalan = false;
  function jalankan(){
    if (sudahJalan) return;
    sudahJalan = true;
    setelahSiap();
  }
  function satuSelesai(){
    belumSelesai--;
    if (belumSelesai <= 0) jalankan();
  }
  for (const gambar of daftar) {
    if (!gambar.complete) {
      gambar.addEventListener('load', satuSelesai, { once: true });
      gambar.addEventListener('error', satuSelesai, { once: true });   // gambar tidak ada: tetap lanjut
    }
  }
  setTimeout(jalankan, 4000);   // cadangan: jangan menunggu lebih dari 4 detik
}

/* ----- gambar karakter pemain: karakter.awal[1..12], karakter.promed[1..12] ----- */
const karakter = { awal: [], promed: [] };
const karakterMenunduk = {};       // gambar saat menunduk (duck.png)

const daftarBaju = ['awal', 'promed'];
for (const namaBaju of daftarBaju) {
  for (let nomor = 1; nomor <= 12; nomor++) {
    karakter[namaBaju][nomor] = loadImg('assets/char/' + namaBaju + '/' + nomor + '.png');
  }
  karakterMenunduk[namaBaju] = loadImg('assets/char/' + namaBaju + '/duck.png');
}

/* ----- gambar angka hitung mundur ----- */
const HITUNG = {
  '3': loadImg('assets/ui/count-3.png'),
  '2': loadImg('assets/ui/count-2.png'),
  '1': loadImg('assets/ui/count-1.png'),
  go: loadImg('assets/ui/count-go.png'),
};

/* ----- memuat gambar semua map diam-diam di latar belakang ----- */
function muatSemuaGambar(){
  const namaFile = ['bg.jpg', 'bg-panjang.jpg', 'gate.png', 'chaser.png', 'big.png', 'car.png',
                    'ob1.png', 'ob2.png', 'p1.png', 'p2.png', 'tall.png', 'hang.png',
                    'debris_ob1.png', 'debris_ob2.png', 'debris_p1.png', 'debris_p2.png', 'debris_tall.png', 'debris_hang.png',
                    'info1.png', 'info2.png', 'info3.png'];
  for (let nomorMap = 0; nomorMap <= 6; nomorMap++) {      // 0 = prolog, 1-6 = map
    const folder = (nomorMap === 0) ? 'assets/prolog/' : 'assets/map' + nomorMap + '/';
    for (const nama of namaFile) loadImg(folder + nama);
    for (const aksi in ANIM_BANTENG) {
      for (let i = 1; i <= ANIM_BANTENG[aksi].jumlah; i++) loadImg(folder + 'chaser_' + aksi + i + '.png');
    }
  }
}
