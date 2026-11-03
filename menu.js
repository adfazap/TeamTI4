/* =====================================================================
   MENU.JS  -  layar menu (home, pilih peminatan, pause, dll), tombol-tombol,
   dan gambar tampilan (UI) dari folder assets/ui/.
   ===================================================================== */

/* ===================== PINDAH LAYAR ===================== */
// Menampilkan satu layar (berdasarkan id di index.html) dan menyembunyikan yang lain.
// showScreen(null) = tidak menampilkan layar apa pun (hanya game).
function showScreen(id){
  const semuaLayar = document.querySelectorAll('.screen');
  for (const layar of semuaLayar) layar.classList.remove('show');

  if (id) $(id).classList.add('show');
  if (id === 'welcome') updateContinue();
}

// Layar pesan dengan satu tombol (dipakai saat prolog / map selesai)
function message(teks, labelTombol, aksi){
  $('doneTitle').textContent = teks;
  $('btnNext').textContent = labelTombol;
  $('btnNext').onclick = aksi;
  muatUI($('btnNext'), 'btn-next.png', 'gambar');
  showScreen('done');
}

/* ===================== LAYAR PILIH PEMINATAN ===================== */
function openSelect(){
  const semuaSelesai = (selesai.size === MAPS.length);
  const posisi = p => 'left:' + p[0] + '%;top:' + p[1] + '%';

  // garis penghubung antar kolom node
  const kolom = [[START], [POS[0], POS[1]], [POS[2], POS[3]], [POS[4], POS[5]], [FINAL]];
  let garis = '';
  for (let k = 0; k < kolom.length - 1; k++) {
    for (const a of kolom[k]) {
      for (const b of kolom[k + 1]) {
        garis += '<line x1="' + (a[0] * 2.4) + '" y1="' + a[1] + '" x2="' + (b[0] * 2.4) + '" y2="' + b[1] + '"/>';
      }
    }
  }

  let html = '<svg viewBox="0 0 240 100">' + garis + '</svg>';

  // node awal (karakter)
  html += '<div class="node start finished" style="' + posisi(START) + '">' +
          '<i class="pic"></i><img src="assets/char/promed/1.png"></div>';

  // node tiap map
  for (let i = 0; i < MAPS.length; i++) {
    const kelas = selesai.has(i) ? 'node finished' : 'node';
    html += '<button class="' + kelas + '" data-map="' + i + '" title="' + MAPS[i].name + '" style="' + posisi(POS[i]) + '">' +
            '<i class="pic" style="background-image:url(assets/map' + (i + 1) + '/thumb.png),url(assets/map' + (i + 1) + '/bg.jpg)"></i>' +
            '<b class="num">' + (i + 1) + '</b><span class="lab">' + MAPS[i].name + '</span></button>';
  }

  // node FINAL (terkunci sebelum semua map selesai)
  html += '<button id="final" class="node final ' + (semuaSelesai ? '' : 'locked') + '" ' + (semuaSelesai ? '' : 'disabled') +
          ' style="' + posisi(FINAL) + '"><i class="pic"></i><span class="trofi">🏆</span><span class="lab">FINAL</span></button>';

  $('cards').innerHTML = html;

  // klik node map = mulai map itu
  const tombolMap = $('cards').querySelectorAll('[data-map]');
  for (const tombolIni of tombolMap) {
    tombolIni.onclick = function(){ startLevel(Number(tombolIni.dataset.map)); };
  }
  $('final').onclick = function(){ showScreen('ending'); };

  if (semuaSelesai) $('progress').textContent = 'Semua peminatan selesai! Buka FINAL 🏆';
  else $('progress').textContent = 'Selesaikan semua peminatan untuk membuka FINAL (' + selesai.size + '/' + MAPS.length + ')';

  terakhirMap = null;          // kembali ke peta: masuk map lagi = loading penuh
  showScreen('select');
}

/* ===================== LAYAR PENUH & UKURAN LAYAR ===================== */
function toggleFullscreen(){
  const game = $('game');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (game.requestFullscreen) {
    game.requestFullscreen().then(function(){
      try { screen.orientation.lock('landscape').catch(function(){}); } catch (e) {}   // putar ke landscape di HP
    }).catch(function(){});
  } else {
    document.body.classList.toggle('pseudofs');    // cadangan untuk iPhone
  }
}

// Menyesuaikan ukuran canvas dengan jendela browser
function fit(){
  const game = $('game');
  W = Math.round(H * game.clientWidth / game.clientHeight);
  W = Math.max(640, Math.min(1400, W));
  $('c').width = W;
  $('c').height = H;
}
fit();
addEventListener('resize', fit);
document.addEventListener('fullscreenchange', function(){
  fit();
  if (!document.fullscreenElement) pauseGame();
});

/* ===================== PAUSE ===================== */
// menampilkan / menyembunyikan tombol pause & tulisan HUD sesuai status bermain
function setPlaying(nilai){
  sedangMain = nilai;
  $('btnPause').style.display = nilai ? 'grid' : 'none';
  $('hud').style.display = nilai ? '' : 'none';
}

function pauseGame(){
  if (!sedangMain || dijeda) return;
  dijeda = true;
  stopMusic();
  showScreen('pause');
}

function resumeGame(){
  dijeda = false;
  showScreen(null);
  if (pemain.hitungMundur <= 0.6) startMusic();    // jangan mulai musik kalau masih hitung mundur
}

document.addEventListener('visibilitychange', function(){
  if (document.hidden) pauseGame();                // pindah tab = otomatis pause
});

/* ===================== TOMBOL-TOMBOL ===================== */
$('btnPlay').onclick = function(){
  if (!document.fullscreenElement) toggleFullscreen();   // klik Main = layar penuh
  baju = 'awal';
  startLevel(-1);                                        // mulai dari prolog
};

$('btnContinue').onclick = function(){                   // lanjutkan progres tersimpan
  if (!prologSelesai) return;
  if (!document.fullscreenElement) toggleFullscreen();
  baju = 'promed';
  openSelect();
};

// Tombol Lanjutkan abu-abu & tidak bisa diklik kalau prolog belum selesai
function updateContinue(){
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

$('btnHow').onclick = function(){ showScreen('howto'); };
$('btnBack').onclick = function(){ showScreen('welcome'); };
$('linkFS').onclick = toggleFullscreen;
$('btnFS').onclick = toggleFullscreen;

$('btnPause').onclick = pauseGame;
$('btnResume').onclick = resumeGame;
$('btnRetry').onclick = function(){ startLevel(level.mapIndex); };
$('btnMenu').onclick = function(){
  dijeda = false;
  setPlaying(false);
  stopMusic();
  showScreen('welcome');
};

$('btnOverRetry').onclick = function(){ startLevel(level.mapIndex); };
$('btnOverMenu').onclick = function(){ showScreen('welcome'); };

$('btnAgain').onclick = function(){                      // "Main lagi" di layar ending
  selesai.clear();
  simpan();
  baju = 'awal';
  startLevel(-1);
};

$('btnMute').onclick = function(){                       // tombol suara
  bisu = !bisu;
  ikonSuara();
  if (sedangMain) startMusic();
  else stopMusic();
};

/* ===================== KARAKTER BERJALAN DI HOME ===================== */
let frameHome = 1;
setInterval(function(){
  if (!$('welcome').classList.contains('show')) return;
  frameHome = frameHome % 8 + 1;
  $('hero').setAttribute('href', 'assets/char/awal/' + frameHome + '.png');
}, 1000 / FPS);

/* ===================== GAMBAR TAMPILAN (assets/ui/) =====================
   Daftar lengkap nama file ada di assets/ui/README.txt.
   Kalau file gambarnya ada, otomatis dipakai. Kalau tidak ada, tampilan bawaan tetap jalan. */

// Memasang gambar ke sebuah elemen. kelas 'gambar' = tombol, 'latar' = latar layar
function muatUI(elemen, namaFile, kelas){
  const gambar = new Image();
  gambar.onload = function(){
    elemen.style.setProperty('--img', 'url(assets/ui/' + namaFile + ')');
    if (kelas === 'gambar') elemen.style.aspectRatio = gambar.naturalWidth + ' / ' + gambar.naturalHeight;
    else elemen.style.aspectRatio = '';
    elemen.classList.add(kelas);
  };
  gambar.onerror = function(){
    elemen.classList.remove(kelas);       // file tidak ada: pakai tampilan bawaan
  };
  gambar.src = 'assets/ui/' + namaFile;
}

// Gambar kecil untuk peta pilihan (centang, gembok, dll)
function muatVar(nama, namaFile){
  const gambar = new Image();
  gambar.onload = function(){
    document.documentElement.style.setProperty('--' + nama, 'url(assets/ui/' + namaFile + ')');
    document.documentElement.classList.add('ada-' + nama);
  };
  gambar.src = 'assets/ui/' + namaFile;
}

function ikonSuara(){
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
  btnOverRetry: 'btn-retry.png',
  btnOverMenu: 'btn-menu.png',
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
gambarLogo.onload = function(){
  $('logo').src = gambarLogo.src;
  $('welcome').classList.add('ada-logo');
};
gambarLogo.src = 'assets/ui/logo.png';

// tulisan "GAME OVER"
const gambarGameOver = new Image();
gambarGameOver.onload = function(){
  $('overLogo').src = gambarGameOver.src;
  $('gameover').classList.add('ada-over');
};
gambarGameOver.src = 'assets/ui/gameover.png';


/* ===== LAYAR LOADING (sebelum masuk map) =====
   Animasi = 8 gambar PNG: assets/ui/loading-1.png ... loading-8.png (timpa dengan gambarmu kalau mau) */
const gambarMemuat = [];
for (let i = 1; i <= 8; i++) gambarMemuat.push(loadImg('assets/ui/loading-' + i + '.png'));
let frameMemuat = 0;
setInterval(function(){
  if (!$('memuat').classList.contains('show')) return;
  frameMemuat = (frameMemuat + 1) % gambarMemuat.length;
  $('memuatGambar').src = gambarMemuat[frameMemuat].src;
}, 1000 / FPS);
function tampilkanMemuat(mapIndex){
  const prolog = (mapIndex < 0);
  $('memuatJudul').textContent = prolog ? 'Prolog' : MAPS[mapIndex].name;
  $('memuatTeks').textContent = prolog ? TEKS_PROLOG : MAPS[mapIndex].deskripsi;
  showScreen('memuat');
}
