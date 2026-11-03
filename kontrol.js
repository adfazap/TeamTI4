/* =====================================================================
   KONTROL.JS  -  membaca keyboard dan layar sentuh.

   Keyboard:  tahan → (atau D) = lari   |  ↑ / Spasi / W = lompat (tekan lagi di udara = double jump)
              ↓ atau S = menunduk       |  P / Esc = pause   |  F = layar penuh
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

function lompat(){
  if (!sedangMain || dijeda) return;
  if (pemain.hitungMundur > 0.6) return;        // belum boleh lompat saat hitung mundur

  if (pemain.dilantai) {
    pemain.vy = JUMP;                            // lompat pertama
    pemain.jumlahLompat = 1;
  } else if (pemain.jumlahLompat < 2) {
    pemain.vy = JUMP2;                           // lompat kedua di udara (double jump)
    pemain.jumlahLompat = 2;
  }
}

addEventListener('keydown', function(e){
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
  if (e.code === 'KeyF') toggleFullscreen();
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (dijeda) resumeGame();
    else pauseGame();
  }
});

addEventListener('keyup', function(e){
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
