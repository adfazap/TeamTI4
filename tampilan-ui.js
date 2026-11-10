/* =====================================================================
   TAMPILAN-UI.JS  -  gambar tampilan (UI) buatan sendiri dari assets/ui/
   dan layar loading.
   ===================================================================== */

/* ===================== GAMBAR TAMPILAN (assets/ui/) =====================
   Daftar lengkap nama file ada di assets/ui/README.txt.
   Kalau file gambarnya ada, otomatis dipakai. Kalau tidak ada, tampilan bawaan tetap jalan. */

// Memasang gambar ke sebuah elemen. kelas 'gambar' = tombol, 'latar' = latar layar
function muatUI(elemen, namaFile, kelas) {
  const gambar = new Image();
  gambar.onload = function () {
    elemen.style.setProperty('--img', 'url(assets/ui/' + namaFile + ')');
    if (kelas === 'gambar') elemen.style.aspectRatio = gambar.naturalWidth + ' / ' + gambar.naturalHeight;
    else elemen.style.aspectRatio = '';
    elemen.classList.add(kelas);
  };
  gambar.onerror = function () {
    elemen.classList.remove(kelas); // file tidak ada: pakai tampilan bawaan
  };
  gambar.src = 'assets/ui/' + namaFile;
}

// Gambar kecil untuk peta pilihan (centang, gembok, dll)
function muatVar(nama, namaFile) {
  const gambar = new Image();
  gambar.onload = function () {
    document.documentElement.style.setProperty('--' + nama, 'url(assets/ui/' + namaFile + ')');
    document.documentElement.classList.add('ada-' + nama);
  };
  gambar.src = 'assets/ui/' + namaFile;
}

function ikonSuara() {
  $('btnMute').textContent = bisu ? '🔇' : '🔊';
  muatUI($('btnMute'), bisu ? 'btn-sound-off.png' : 'btn-sound-on.png', 'gambar');
}

// tombol (id di index.html) -> nama file gambarnya
const GAMBAR_TOMBOL = {
  btnPlay: 'btn-main.png',
  btnHow: 'btn-howto.png',
  btnBack: 'btn-back.png',
  btnResume: 'btn-resume.png',
  btnRetry: 'btn-retry.png',
  btnMenu: 'btn-menu.png',
  btnAgain: 'btn-again.png',
  btnFS: 'btn-fullscreen.png',
  btnPause: 'btn-pause.png',
  btnMulai: 'btn-start.png',
  btnSembunyi: 'btn-hide.png',
  btnLari: 'btn-run.png',
  btnTunduk: 'btn-duck.png',
  btnLompat: 'btn-jump.png',
  contohTombol: 'btn-jump.png',
  btnSetKembali: 'btn-back.png',
  btnKoleksi: 'btn-info.png',
  btnKoleksiKembali: 'btn-back.png',
  btnSelectHome: 'btn-home.png',
  btnOverRetry: 'btn-retry.png',
  btnOverMenu: 'btn-menu.png'
};
for (const id in GAMBAR_TOMBOL) muatUI($(id), GAMBAR_TOMBOL[id], 'gambar');
ikonSuara();

// latar tiap layar (id layar -> nama file)
const GAMBAR_LATAR = {
  welcome: 'home-bg.jpg',
  select: 'select-bg.jpg',
  memuat: 'loading-bg.jpg',
  howto: 'menu-bg.jpg',
  pause: 'menu-bg.jpg',
  done: 'menu-bg.jpg',
  ending: 'menu-bg.jpg',
  gameover: 'gameover-bg.jpg',
  petunjuk: 'menu-bg.jpg'
};
for (const id in GAMBAR_LATAR) muatUI($(id), GAMBAR_LATAR[id], 'latar');
muatUI(document.querySelector('.panel'), 'panel.png', 'latar-panel');

// gambar kecil di peta pilihan
muatVar('check', 'check.png');
muatVar('lock', 'lock.png');
muatVar('final', 'final.png');
muatVar('start', 'start.png');
muatVar('frame', 'node-frame.png');

// logo "Lari Promed" di home
const gambarLogo = new Image();
gambarLogo.onload = function () {
  $('logo').src = gambarLogo.src;
  $('welcome').classList.add('ada-logo');
};
gambarLogo.src = 'assets/ui/logo.png';

// tulisan "GAME OVER"
const gambarGameOver = new Image();
gambarGameOver.onload = function () {
  $('overLogo').src = gambarGameOver.src;
  $('gameover').classList.add('ada-over');
};
gambarGameOver.src = 'assets/ui/gameover.png';

/* ===== LAYAR LOADING (sebelum masuk map) =====
   Animasi = 8 gambar PNG: assets/ui/loading-1.png ... loading-8.png (timpa dengan gambarmu kalau mau) */
const gambarMemuat = [];
for (let i = 1; i <= 8; i++) gambarMemuat.push(loadImg('assets/ui/loading-' + i + '.png'));
let frameMemuat = 0;
setInterval(function () {
  if (!$('memuat').classList.contains('show')) return;
  frameMemuat = (frameMemuat + 1) % gambarMemuat.length;
  $('memuatGambar').src = gambarMemuat[frameMemuat].src;
}, 1000 / FPS);
function tampilkanMemuat(mapIndex) {
  const prolog = mapIndex < 0;
  $('memuatJudul').textContent = prolog ? 'Prolog' : MAPS[mapIndex].name;
  $('memuatTeks').textContent = prolog ? TEKS_PROLOG : MAPS[mapIndex].deskripsi;
  showScreen('memuat');
}
