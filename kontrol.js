/* =====================================================================
   KONTROL.JS  -  membaca keyboard dan layar sentuh.

   Keyboard:  tahan → (atau D) = lari   |  ↑ / Spasi / W = lompat (tekan lagi di udara = double jump)
              ↓ atau S = menunduk       |  P / Esc = pause   |  F = layar penuh
              pencet E dekat papan info = sembunyi di balik objek (pencet lagi = keluar)
   Sentuh:    ketuk bagian atas layar = lompat, tahan bagian tengah = lari, tahan bagian bawah = menunduk
   ===================================================================== */

// true selama tombolnya sedang ditahan
const tombol = { kanan: false, bawah: false };
// jari yang sedang menyentuh layar: nomor jari -> 'lari' atau 'nunduk'
const sentuhan = new Map();

function sedangLari(){
  return tombol.kanan || Array.from(sentuhan.values()).includes('lari');
}
function sedangMenunduk(){
  return tombol.bawah || Array.from(sentuhan.values()).includes('nunduk');
}

// true kalau sedang ada layar menu (home, peta, pause, dll) di atas game
function menuTerbuka(){
  return !!document.querySelector('.screen.show');
}

function lompat(){
  if (!sedangMain || dijeda) return;
  if (pemain.hitungMundur > 0.6) return;        // belum boleh lompat saat hitung mundur
  if (pemain.sembunyi) return;                  // sedang bersembunyi

  if (pemain.dilantai) {
    pemain.vy = JUMP;                            // lompat pertama
    pemain.jumlahLompat = 1;
  } else if (pemain.jumlahLompat < 2) {
    pemain.vy = JUMP2;                           // lompat kedua di udara (double jump)
    pemain.jumlahLompat = 2;
  }
}

addEventListener('keydown', function(e){
  if (menuTerbuka()) {                          // di menu: Spasi tidak boleh menekan tombol; panah/Enter diurus menu.js
    if (e.code === 'Space') e.preventDefault();
  } else {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    lompat();
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    e.preventDefault();
    tombol.kanan = true;
  }
  if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    e.preventDefault();
    tombol.bawah = true;
  }
  if (e.code === 'KeyE' && !e.repeat) togolSembunyi();   // pencet E dekat papan info = sembunyi (pencet lagi = keluar)
  if (e.code === 'Enter') {                                 // Enter saat bermain = pause
    e.preventDefault();                                     // (cegah Enter ikut menekan tombol Lanjut yang baru muncul)
    if (!e.repeat) pauseGame();
  }
  if (e.code === 'KeyM') $('btnMute').click();              // M = suara nyala/mati
  }                                                         // (akhir kontrol saat bermain)
  if (e.code === 'KeyF') toggleFullscreen();
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (dijeda) resumeGame();
    else pauseGame();
  }
});

addEventListener('keyup', function(e){
  if (e.code === 'Space' && menuTerbuka()) e.preventDefault();   // cegah Spasi (lepas) menekan tombol menu
  if (e.code === 'ArrowRight' || e.code === 'KeyD') tombol.kanan = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') tombol.bawah = false;
});

// kalau jendela kehilangan fokus, anggap semua tombol dilepas
addEventListener('blur', function(){
  tombol.kanan = false;
  tombol.bawah = false;
  sentuhan.clear();
});

$('c').addEventListener('pointerdown', function(e){
  e.preventDefault();
  const posisiY = e.clientY / innerHeight;       // 0 = atas layar, 1 = bawah layar
  if (posisiY < 0.35) lompat();
  else if (posisiY > 0.65) sentuhan.set(e.pointerId, 'nunduk');
  else sentuhan.set(e.pointerId, 'lari');
});

function jariDiangkat(e){
  sentuhan.delete(e.pointerId);
}
addEventListener('pointerup', jariDiangkat);
addEventListener('pointercancel', jariDiangkat);

document.addEventListener('contextmenu', function(e){ e.preventDefault(); });   // matikan menu klik kanan

/* ---- tombol layar sentuh Lari / Lompat / Tunduk + pengaturannya (tampil/sembunyi, transparansi) ---- */
const PENGATURAN_SENTUH = 'promedSentuh';
const setelanSentuh = { tampil: true, opasitas: 75 };       // opasitas dalam persen
try {
  const simpan = JSON.parse(localStorage.getItem(PENGATURAN_SENTUH) || '{}');
  if (typeof simpan.tampil === 'boolean') setelanSentuh.tampil = simpan.tampil;
  if (simpan.opasitas >= 15 && simpan.opasitas <= 100) setelanSentuh.opasitas = simpan.opasitas;
} catch (err) {}

if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) document.body.classList.add('sentuh');

function terapkanSetelanSentuh(){
  document.documentElement.style.setProperty('--opasitas-tombol', setelanSentuh.opasitas / 100);
  document.body.classList.toggle('tombol-tampil', setelanSentuh.tampil);
  perbaruiTombolSentuh();
}
// tombol hanya tampil saat sedang bermain (bukan di menu), dan kalau pemain tidak mematikannya
function perbaruiTombolSentuh(){
  document.body.classList.toggle('main-tombol', setelanSentuh.tampil && sedangMain && !dijeda && !menuTerbuka());
}
function simpanSetelanSentuh(){
  try { localStorage.setItem(PENGATURAN_SENTUH, JSON.stringify(setelanSentuh)); } catch (err) {}
}

function pasangTombolSentuh(id, aksi){
  const el = $(id);
  el.addEventListener('pointerdown', function(e){
    e.preventDefault(); e.stopPropagation();
    el.classList.add('tekan');
    if (aksi === 'lompat') lompat(); else sentuhan.set(e.pointerId, aksi);
  });
  const lepas = function(e){ el.classList.remove('tekan'); };
  el.addEventListener('pointerup', lepas);
  el.addEventListener('pointercancel', lepas);
  el.addEventListener('pointerleave', lepas);
}
pasangTombolSentuh('btnLari', 'lari');
pasangTombolSentuh('btnTunduk', 'nunduk');
pasangTombolSentuh('btnLompat', 'lompat');

// tombol layar sentuh "sembunyi" (muncul di dekat papan info): ketuk = sembunyi / keluar
const tombolSembunyi = $('btnSembunyi');
tombolSembunyi.addEventListener('pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); togolSembunyi(); });
