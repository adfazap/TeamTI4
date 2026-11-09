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
  fokusAwal(id);                       // keyboard: sorot tombol utama layar ini
  perbaruiTombolSentuh();              // tombol sentuh Lari/Lompat/Tunduk hanya saat bermain
}

// Layar pesan dengan satu tombol (dipakai saat prolog / map selesai)
function message(teks, labelTombol, aksi){
  $('doneTitle').textContent = teks;
  $('btnNext').textContent = labelTombol;
  $('btnNext').onclick = aksi;
  muatUI($('btnNext'), 'btn-next.png', 'gambar');
  showScreen('done');
}

/* ===================== LAYAR PETUNJUK (sebelum mulai) ===================== */
// Ditampilkan setelah loading, sebelum hitung mundur: cara melewati tiap jenis rintangan.
// aksiMulai = fungsi yang dijalankan saat tombol Mulai ditekan (memulai permainan).
function tampilkanPetunjuk(aksiMulai){
  const folder = level.prolog ? 'assets/prolog/' : 'assets/map' + (level.mapIndex + 1) + '/';

  // [gambar, judul, isi]
  let baris;
  if (level.prolog) {
    baris = [
      [folder + 'jas.png',    'Jas dokter melayang',      'Lompat dan ambil di tengah prolog. WAJIB: kalau sampai gerbang tanpa mengambilnya, game over.'],
      [folder + 'buku.png',   'Buku, meja, kertas ujian', 'Lompat dengan  ↑ / Spasi. Banteng bisa menghancurkannya.'],
      [folder + 'big.png',    'Blok besar',               'Lompat dan naiki. Banteng tidak bisa menghancurkannya, ia melompatinya.'],
      [folder + 'banner.png', 'Menggantung di atas kepala', 'Tahan  ↓ / S  untuk menunduk (slide).'],
    ];
  } else {
    baris = [
      [folder + 'ob1.png',  'Rintangan kecil',            'Lompat dengan  ↑ / Spasi. Banteng bisa menghancurkannya.'],
      [folder + 'tall.png', 'Rintangan tinggi',           'Lompat tepat waktu. Kalau kurang tinggi, tekan  ↑ / Spasi  lagi saat di udara (double jump).'],
      [folder + 'big.png',  'Blok besar dan mobil',       'Lompat dan naiki. Banteng tidak bisa menghancurkannya, ia melompatinya.'],
      [folder + 'hang.png', 'Menggantung di atas kepala', 'Tahan  ↓ / S  untuk menunduk (slide).'],
      ['assets/ui/btn-hide.png', 'Papan info',            'Pencet  E  di dekat papan untuk bersembunyi di kolongnya dan membaca. Banteng jadi bingung.'],
    ];
  }

  let html = '';
  for (const b of baris) {
    html += '<li><img src="' + b[0] + '" alt="" onerror="this.style.visibility=\'hidden\'"><span><b>' + b[1] + '</b>' + b[2] + '</span></li>';
  }
  $('petunjukIsi').innerHTML = html;

  $('btnMulai').onclick = aksiMulai;
  showScreen('petunjuk');
}

/* ===================== LAYAR PILIH PEMINATAN ===================== */
function openSelect(){
  const semuaSelesai = (selesai.size === MAPS.length);
  const posisi = p => 'left:' + p[0] + '%;top:' + p[1] + '%';

  // garis penghubung antar kolom node
  const kolom = [[START], [POS[0], POS[1]], [POS[2], POS[3]], [POS[4]], [FINAL]];
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
            '<b class="num">' + (i + 1) + '</b><span class="lab' + (POS[i][1] < 50 ? ' atas' : '') + '">' + MAPS[i].name + '</span></button>';
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
  if (!nilai) $('btnSembunyi').style.display = 'none';
  $('hud').style.display = nilai ? '' : 'none';
  perbaruiTombolSentuh();
}

function pauseGame(){
  if (!sedangMain || dijeda) return;
  dijeda = true;
  $('btnSembunyi').style.display = 'none';
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

/* ----- layar Koleksi Informasi: papan info yang sudah dibaca saat ngumpet; yang belum = abu-abu ----- */
function bukaKoleksi(){
  let html = '', jumlah = 0;
  for (let i = 0; i < MAPS.length; i++) {
    let dibaca = 0, kartu = '';
    for (let n = 1; n <= 3; n++) {
      if (infoSudahDibaca(i, n)) {
        dibaca++;
        kartu += '<button class="kartu" data-map="' + i + '" data-no="' + n + '" title="Info ' + n + '" style="background-image:url(assets/map' + (i + 1) + '/info' + n + '.png)"></button>';
      } else {
        kartu += '<button class="kartu terkunci" disabled title="Ngumpet di papan info ke-' + n + ' map ini untuk membacanya"><span>🔒</span></button>';
      }
    }
    jumlah += dibaca;
    html += '<div class="kol' + (dibaca === 3 ? ' lengkap' : '') + '"><h3>' + MAPS[i].name + '</h3>' + kartu + '</div>';
  }
  $('koleksiIsi').innerHTML = html;
  $('koleksiJumlah').textContent = 'Terkumpul ' + jumlah + '/' + (MAPS.length * 3) + '. Yang abu-abu belum dibaca: ngumpet di balik objek papan info (tekan E) untuk membukanya.';
  for (const k of $('koleksiIsi').querySelectorAll('.kartu:not(.terkunci)')) {
    k.onclick = function(){
      $('popInfoGambar').src = 'assets/map' + (Number(k.dataset.map) + 1) + '/info' + k.dataset.no + '.png';
      $('popInfo').classList.add('buka');
    };
  }
  showScreen('koleksi');
}
$('btnKoleksi').onclick = bukaKoleksi;
$('btnSelectHome').onclick = function(){ showScreen('welcome'); };      // dari peta pilihan kembali ke home
$('btnKoleksiKembali').onclick = function(){ showScreen('welcome'); };
$('popInfo').onclick = function(){ this.classList.remove('buka'); };

/* ----- layar pengaturan tombol layar sentuh ----- */
let layarSebelumSetelan = 'welcome';
function bukaSetelan(dari){
  layarSebelumSetelan = dari;
  $('cekTampil').checked = setelanSentuh.tampil;
  $('geserOpasitas').value = setelanSentuh.opasitas;
  $('nilaiOpasitas').textContent = setelanSentuh.opasitas + '%';
  showScreen('setelan');
}
$('linkSetelan').onclick = function(){ bukaSetelan('welcome'); };
$('linkSetelanJeda').onclick = function(){ bukaSetelan('pause'); };
$('btnSetKembali').onclick = function(){ showScreen(layarSebelumSetelan); };
$('cekTampil').onchange = function(){ setelanSentuh.tampil = this.checked; simpanSetelanSentuh(); terapkanSetelanSentuh(); };
$('geserOpasitas').oninput = function(){
  setelanSentuh.opasitas = Number(this.value);
  $('nilaiOpasitas').textContent = this.value + '%';
  simpanSetelanSentuh(); terapkanSetelanSentuh();
};
terapkanSetelanSentuh();
setInterval(perbaruiTombolSentuh, 300);
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
  $('hero').setAttribute('href', 'assets/char/' + BAJU_HOME + '/' + frameHome + '.png');
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
  petunjuk: 'menu-bg.jpg',
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

/* ===================== KEYBOARD DI MENU =====================
   Semua tombol bisa dipakai tanpa mouse:
     panah / WASD = pindah sorotan   |   Enter = tekan tombol yang disorot   |   Tab juga bisa
     Esc / Backspace = kembali (di Cara Bermain & Pilih Peminatan)
   Saat bermain (tidak ada layar menu): Enter = pause, M = suara.
   ===================================================================== */

// tombol yang pertama kali disorot di tiap layar (kalau tidak bisa dipakai, diganti tombol pertama yang aktif)
const TOMBOL_UTAMA = {
  welcome: 'btnContinue', howto: 'btnBack', pause: 'btnResume', setelan: 'btnSetKembali', koleksi: 'btnKoleksiKembali',
  gameover: 'btnOverRetry', done: 'btnNext', ending: 'btnAgain', petunjuk: 'btnMulai',
};

// tombol yang terlihat & aktif di sebuah layar
function tombolDiLayar(layar){
  return Array.from(layar.querySelectorAll('button')).filter(function(t){
    return !t.disabled && t.offsetParent !== null;
  });
}

function fokusAwal(id){
  if (!id || id === 'memuat') {                 // sedang main / loading: lepas sorotan supaya Spasi/Enter tidak menekan tombol
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    return;
  }
  const layar = $(id);
  const daftar = tombolDiLayar(layar);
  let pilihan = null;

  if (id === 'select') {                        // peta: sorot peminatan pertama yang belum selesai, kalau habis FINAL
    pilihan = daftar.find(function(t){ return t.dataset.map !== undefined && !t.classList.contains('finished'); })
           || daftar.find(function(t){ return t.id === 'final'; })
           || daftar[0];
  } else {
    pilihan = daftar.find(function(t){ return t.id === TOMBOL_UTAMA[id]; }) || daftar[0];
  }
  if (pilihan) pilihan.focus();
}

// pindah sorotan ke tombol terdekat di arah (dx, dy)
function pindahFokus(layar, dx, dy){
  const daftar = tombolDiLayar(layar);
  if (daftar.length === 0) return;
  const sekarang = document.activeElement;
  if (!daftar.includes(sekarang)) { daftar[0].focus(); return; }

  const r = sekarang.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let terbaik = null, skorTerbaik = Infinity;
  for (const t of daftar) {
    if (t === sekarang) continue;
    const q = t.getBoundingClientRect();
    const x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
    const maju = x * dx + y * dy;               // seberapa jauh ke arah yang dituju
    if (maju <= 1) continue;                    // bukan di arah itu
    const samping = (dx !== 0) ? Math.abs(y) : Math.abs(x);
    const skor = maju + 2 * samping;            // lebih suka yang lurus
    if (skor < skorTerbaik) { skorTerbaik = skor; terbaik = t; }
  }
  if (terbaik) terbaik.focus();
}

const ARAH_MENU = {
  ArrowRight: [1, 0], KeyD: [1, 0], ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowDown: [0, 1], KeyS: [0, 1], ArrowUp: [0, -1], KeyW: [0, -1],
};

addEventListener('keydown', function(e){
  document.body.classList.add('keyboard');      // tampilkan tanda sorotan (cincin kuning)
  const layar = document.querySelector('.screen.show');
  if (!layar) return;                           // sedang main: ditangani kontrol.js

  if (ARAH_MENU[e.code]) {
    e.preventDefault();
    pindahFokus(layar, ARAH_MENU[e.code][0], ARAH_MENU[e.code][1]);
  } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    if (e.repeat) { e.preventDefault(); return; }     // tahan Enter tidak menekan berkali-kali
    const aktif = document.activeElement;
    if (!(aktif && aktif.tagName === 'BUTTON' && layar.contains(aktif) && !aktif.disabled)) {
      e.preventDefault();                       // belum ada yang disorot: tekan tombol utama layar ini
      fokusAwal(layar.id);
      if (document.activeElement && layar.contains(document.activeElement)) document.activeElement.click();
    }
  } else if (e.code === 'Escape' || e.code === 'Backspace') {
    if (layar.id === 'howto') $('btnBack').click();
    else if (layar.id === 'setelan') $('btnSetKembali').click();
    else if (layar.id === 'koleksi') {
      if ($('popInfo').classList.contains('buka')) $('popInfo').click();   // tutup pop-up dulu
      else $('btnKoleksiKembali').click();
    }
    else if (layar.id === 'select') showScreen('welcome');
    else if (layar.id === 'petunjuk') openSelect();         // batal masuk map
  }
});
addEventListener('pointerdown', function(){ document.body.classList.remove('keyboard'); });
