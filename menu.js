/* =====================================================================
   MENU.JS  -  layar menu: pindah layar, petunjuk sebelum mulai, pilih peminatan,
   layar penuh & ukuran layar, dan pause.
   (Tombol-tombolnya ada di tombol-menu.js, gambar UI di tampilan-ui.js, keyboard di keyboard-menu.js)
   ===================================================================== */

/* ===================== PINDAH LAYAR ===================== */
// Menampilkan satu layar (berdasarkan id di index.html) dan menyembunyikan yang lain.
// showScreen(null) = tidak menampilkan layar apa pun (hanya game).
function showScreen(id) {
  const semuaLayar = document.querySelectorAll('.screen');
  for (const layar of semuaLayar) layar.classList.remove('show');

  if (id) $(id).classList.add('show');
  if (id === 'welcome') updateContinue();
  fokusAwal(id); // keyboard: sorot tombol utama layar ini
  perbaruiTombolSentuh(); // tombol sentuh Lari/Lompat/Tunduk hanya saat bermain
}

// Layar pesan dengan satu tombol (dipakai saat prolog / map selesai)
function message(teks, labelTombol, aksi) {
  $('doneTitle').textContent = teks;
  $('btnNext').textContent = labelTombol;
  $('btnNext').onclick = aksi;
  muatUI($('btnNext'), 'btn-next.png', 'gambar');
  showScreen('done');
}

/* ===================== LAYAR PETUNJUK (sebelum mulai) ===================== */
// Ditampilkan setelah loading, sebelum hitung mundur: cara melewati tiap jenis rintangan.
// aksiMulai = fungsi yang dijalankan saat tombol Mulai ditekan (memulai permainan).
function tampilkanPetunjuk(aksiMulai) {
  const folder = level.prolog ? 'assets/prolog/' : 'assets/map' + (level.mapIndex + 1) + '/';

  // [gambar, judul, isi]
  let baris;
  if (level.prolog) {
    baris = [
      [
        folder + 'jas.png',
        'Jaket kuning melayang',
        'Lompat dan ambil di tengah prolog. WAJIB: kalau sampai gerbang tanpa mengambilnya, game over.'
      ],
      [
        folder + 'buku.png',
        'Buku, meja, kertas ujian',
        'Lompat dengan  ↑ / Spasi. Musuh bisa menghancurkannya.'
      ],
      [
        folder + 'big.png',
        'Blok besar',
        'Lompat dan naiki. Musuh tidak bisa menghancurkannya, ia melompatinya.'
      ],
      [folder + 'banner.png', 'Menggantung di atas kepala', 'Tahan  ↓ / S  untuk menunduk (slide).']
    ];
  } else {
    baris = [
      [folder + 'ob1.png', 'Rintangan kecil', 'Lompat dengan  ↑ / Spasi. Musuh bisa menghancurkannya.'],
      [
        folder + 'tall.png',
        'Rintangan tinggi',
        'Lompat tepat waktu. Kalau kurang tinggi, tekan  ↑ / Spasi  lagi saat di udara (double jump).'
      ],
      [
        folder + 'big.png',
        'Blok besar dan mobil',
        'Lompat dan naiki. Musuh tidak bisa menghancurkannya, ia melompatinya.'
      ],
      [folder + 'hang.png', 'Menggantung di atas kepala', 'Tahan  ↓ / S  untuk menunduk (slide).'],
      [
        'assets/ui/btn-hide.png',
        'Papan info',
        'Pencet  E  di dekat papan untuk bersembunyi di kolongnya dan membaca. Musuh jadi bingung.'
      ]
      [folder + 'jas.png',    'Jaket kuninng melayang',      'Lompat dan ambil di tengah prolog. WAJIB: kalau sampai gerbang tanpa mengambilnya, game over.'],
      [folder + 'buku.png',   'Buku, meja, kertas ujian', 'Lompat dengan  ↑ / Spasi. Musuh bisa menghancurkannya.'],
      [folder + 'big.png',    'Blok besar',               'Lompat dan naiki. musuh tidak bisa menghancurkannya, ia melompatinya.'],
      [folder + 'banner.png', 'Menggantung di atas kepala', 'Tahan  ↓ / S  untuk menunduk (slide).'],
    ];
  } 

  let html = '';
  for (const b of baris) {
    html +=
      '<li><img src="' +
      b[0] +
      '" alt="" onerror="this.style.visibility=\'hidden\'"><span><b>' +
      b[1] +
      '</b>' +
      b[2] +
      '</span></li>';
  }
  $('petunjukIsi').innerHTML = html;

  $('btnMulai').onclick = aksiMulai;
  showScreen('petunjuk');
}

/* ===================== LAYAR PILIH PEMINATAN ===================== */
function openSelect() {
  const semuaSelesai = selesai.size === MAPS.length;
  const posisi = p => 'left:' + p[0] + '%;top:' + p[1] + '%';

  // garis penghubung antar kolom node
  const kolom = [[START], [POS[0], POS[1]], [POS[2], POS[3]], [POS[4]], [FINAL]];
  let garis = '';
  for (let k = 0; k < kolom.length - 1; k++) {
    for (const a of kolom[k]) {
      for (const b of kolom[k + 1]) {
        garis +=
          '<line x1="' + a[0] * 2.4 + '" y1="' + a[1] + '" x2="' + b[0] * 2.4 + '" y2="' + b[1] + '"/>';
      }
    }
  }

  let html = '<svg viewBox="0 0 240 100">' + garis + '</svg>';

  // node awal (karakter)
  html +=
    '<div class="node start finished" style="' +
    posisi(START) +
    '">' +
    '<i class="pic"></i><img src="assets/char/promed/1.png"></div>';

  // node tiap map
  for (let i = 0; i < MAPS.length; i++) {
    const kelas = selesai.has(i) ? 'node finished' : 'node';
    html +=
      '<button class="' +
      kelas +
      '" data-map="' +
      i +
      '" title="' +
      MAPS[i].name +
      '" style="' +
      posisi(POS[i]) +
      '">' +
      '<i class="pic" style="background-image:url(assets/map' +
      (i + 1) +
      '/thumb.png),url(assets/map' +
      (i + 1) +
      '/bg.jpg)"></i>' +
      '<b class="num">' +
      (i + 1) +
      '</b><span class="lab' +
      (POS[i][1] < 50 ? ' atas' : '') +
      '">' +
      MAPS[i].name +
      '</span></button>';
  }

  // node FINAL (terkunci sebelum semua map selesai)
  html +=
    '<button id="final" class="node final ' +
    (semuaSelesai ? '' : 'locked') +
    '" ' +
    (semuaSelesai ? '' : 'disabled') +
    ' style="' +
    posisi(FINAL) +
    '"><i class="pic"></i><span class="trofi">🏆</span><span class="lab">FINAL</span></button>';

  $('cards').innerHTML = html;

  // klik node map = mulai map itu
  const tombolMap = $('cards').querySelectorAll('[data-map]');
  for (const tombolIni of tombolMap) {
    tombolIni.onclick = function () {
      startLevel(Number(tombolIni.dataset.map));
    };
  }
  $('final').onclick = function () {
    showScreen('ending');
  };

  if (semuaSelesai) $('progress').textContent = 'Semua peminatan selesai! Buka FINAL 🏆';
  else
    $('progress').textContent =
      'Selesaikan semua peminatan untuk membuka FINAL (' + selesai.size + '/' + MAPS.length + ')';

  terakhirMap = null; // kembali ke peta: masuk map lagi = loading penuh
  showScreen('select');
}

/* ===================== LAYAR PENUH & UKURAN LAYAR ===================== */
function toggleFullscreen() {
  const game = $('game');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (game.requestFullscreen) {
    game
      .requestFullscreen()
      .then(function () {
        try {
          screen.orientation.lock('landscape').catch(function () {});
        } catch (e) {} // putar ke landscape di HP
      })
      .catch(function () {});
  } else {
    document.body.classList.toggle('pseudofs'); // cadangan untuk iPhone
  }
}

// Menyesuaikan ukuran canvas dengan jendela browser
function fit() {
  const game = $('game');
  W = Math.round((H * game.clientWidth) / game.clientHeight);
  W = Math.max(640, Math.min(1400, W));
  $('c').width = W;
  $('c').height = H;
}
fit();
addEventListener('resize', fit);
document.addEventListener('fullscreenchange', function () {
  fit();
  if (!document.fullscreenElement) pauseGame();
});

/* ===================== PAUSE ===================== */
// menampilkan / menyembunyikan tombol pause & tulisan HUD sesuai status bermain
function setPlaying(nilai) {
  sedangMain = nilai;
  $('btnPause').style.display = nilai ? 'grid' : 'none';
  if (!nilai) $('btnSembunyi').style.display = 'none';
  $('hud').style.display = nilai ? '' : 'none';
  perbaruiTombolSentuh();
}

function pauseGame() {
  if (!sedangMain || dijeda) return;
  dijeda = true;
  $('btnSembunyi').style.display = 'none';
  stopMusic();
  showScreen('pause');
}

function resumeGame() {
  dijeda = false;
  showScreen(null);
  if (pemain.hitungMundur <= 0.6) startMusic(); // jangan mulai musik kalau masih hitung mundur
}

document.addEventListener('visibilitychange', function () {
  if (document.hidden) pauseGame(); // pindah tab = otomatis pause
});
