/* =====================================================================
   TOMBOL-MENU.JS  -  fungsi semua tombol di menu (Main, Lanjutkan, Cara
   bermain, Koleksi Info, pengaturan tombol HP, pause, game over, dll) dan
   karakter yang berlari di home.
   ===================================================================== */

/* ===================== TOMBOL-TOMBOL ===================== */
$('btnPlay').onclick = function () {
  if (!document.fullscreenElement) toggleFullscreen(); // klik Main = layar penuh
  baju = 'awal';
  startLevel(-1); // mulai dari prolog
};

$('btnContinue').onclick = function () {
  // lanjutkan progres tersimpan
  if (!prologSelesai) return;
  if (!document.fullscreenElement) toggleFullscreen();
  baju = 'promed';
  openSelect();
};

// Tombol Lanjutkan abu-abu & tidak bisa diklik kalau prolog belum selesai
function updateContinue() {
  const tombolLanjut = $('btnContinue');
  tombolLanjut.disabled = !prologSelesai;

  if (prologSelesai) {
    tombolLanjut.title = 'Lanjutkan (' + selesai.size + '/' + MAPS.length + ' peminatan selesai)';
    muatUI(tombolLanjut, 'btn-continue.png', 'gambar');
  } else {
    tombolLanjut.title = 'Selesaikan prolog dulu';
    muatUI(tombolLanjut, 'btn-continue-off.png', 'gambar');
  }
}

$('btnHow').onclick = function () {
  showScreen('howto');
};
$('btnBack').onclick = function () {
  showScreen('welcome');
};
$('linkFS').onclick = toggleFullscreen;

/* ----- layar Koleksi Informasi: papan info yang sudah dibaca saat ngumpet; yang belum = abu-abu ----- */
function bukaKoleksi() {
  let html = '',
    jumlah = 0;
  for (let i = 0; i < MAPS.length; i++) {
    let dibaca = 0,
      kartu = '';
    for (let n = 1; n <= 3; n++) {
      if (infoSudahDibaca(i, n)) {
        dibaca++;
        kartu +=
          '<button class="kartu" data-map="' +
          i +
          '" data-no="' +
          n +
          '" title="Info ' +
          n +
          '" style="background-image:url(assets/map' +
          (i + 1) +
          '/info' +
          n +
          '.png)"></button>';
      } else {
        kartu +=
          '<button class="kartu terkunci" disabled title="Ngumpet di papan info ke-' +
          n +
          ' map ini untuk membacanya"><span>🔒</span></button>';
      }
    }
    jumlah += dibaca;
    html +=
      '<div class="kol' +
      (dibaca === 3 ? ' lengkap' : '') +
      '"><h3>' +
      MAPS[i].name +
      '</h3>' +
      kartu +
      '</div>';
  }
  $('koleksiIsi').innerHTML = html;
  $('koleksiJumlah').textContent =
    'Terkumpul ' +
    jumlah +
    '/' +
    MAPS.length * 3 +
    '. Yang abu-abu belum dibaca: ngumpet di balik objek papan info (tekan E) untuk membukanya.';
  for (const k of $('koleksiIsi').querySelectorAll('.kartu:not(.terkunci)')) {
    k.onclick = function () {
      $('popInfoGambar').src = 'assets/map' + (Number(k.dataset.map) + 1) + '/info' + k.dataset.no + '.png';
      $('popInfo').classList.add('buka');
    };
  }
  showScreen('koleksi');
}
$('btnKoleksi').onclick = bukaKoleksi;
$('btnSelectHome').onclick = function () {
  showScreen('welcome');
}; // dari peta pilihan kembali ke home
$('btnKoleksiKembali').onclick = function () {
  showScreen('welcome');
};
$('popInfo').onclick = function () {
  this.classList.remove('buka');
};

/* ----- layar pengaturan tombol layar sentuh ----- */
let layarSebelumSetelan = 'welcome';
function bukaSetelan(dari) {
  layarSebelumSetelan = dari;
  $('cekTampil').checked = setelanSentuh.tampil;
  $('geserOpasitas').value = setelanSentuh.opasitas;
  $('nilaiOpasitas').textContent = setelanSentuh.opasitas + '%';
  showScreen('setelan');
}
$('linkSetelan').onclick = function () {
  bukaSetelan('welcome');
};
$('linkSetelanJeda').onclick = function () {
  bukaSetelan('pause');
};
$('btnSetKembali').onclick = function () {
  showScreen(layarSebelumSetelan);
};
$('cekTampil').onchange = function () {
  setelanSentuh.tampil = this.checked;
  simpanSetelanSentuh();
  terapkanSetelanSentuh();
};
$('geserOpasitas').oninput = function () {
  setelanSentuh.opasitas = Number(this.value);
  $('nilaiOpasitas').textContent = this.value + '%';
  simpanSetelanSentuh();
  terapkanSetelanSentuh();
};
terapkanSetelanSentuh();
setInterval(perbaruiTombolSentuh, 300);
$('btnFS').onclick = toggleFullscreen;

$('btnPause').onclick = pauseGame;
$('btnResume').onclick = resumeGame;
$('btnRetry').onclick = function () {
  startLevel(level.mapIndex);
};
$('btnMenu').onclick = function () {
  dijeda = false;
  setPlaying(false);
  stopMusic();
  showScreen('welcome');
};

$('btnOverRetry').onclick = function () {
  startLevel(level.mapIndex);
};
$('btnOverMenu').onclick = function () {
  showScreen('welcome');
};

$('btnAgain').onclick = function () {
  // "Main lagi" di layar ending
  selesai.clear();
  simpan();
  baju = 'awal';
  startLevel(-1);
};

$('btnMute').onclick = function () {
  // tombol suara
  bisu = !bisu;
  ikonSuara();
  if (sedangMain) startMusic();
  else stopMusic();
};

/* ===================== KARAKTER BERJALAN DI HOME ===================== */
let frameHome = 1;
setInterval(function () {
  if (!$('welcome').classList.contains('show')) return;
  frameHome = (frameHome % 8) + 1;
  $('hero').setAttribute('href', 'assets/char/' + BAJU_HOME + '/' + frameHome + '.png');
}, 1000 / FPS);
