/* =====================================================================
    semua tombol menu bisa dipakai lewat keyboard
   (panah / WASD, Enter, Esc).
   ===================================================================== */

/* ===================== KEYBOARD DI MENU =====================
   Semua tombol bisa dipakai tanpa mouse:
     panah / WASD = pindah sorotan   |   Enter = tekan tombol yang disorot   |   Tab juga bisa
     Esc / Backspace = kembali (di Cara Bermain & Pilih Peminatan)
   Saat bermain (tidak ada layar menu): Enter = pause, M = suara.
   ===================================================================== */

// tombol yang pertama kali disorot di tiap layar (kalau ga bisa dipake ni ye, diganti tombol pertama yang aktif)
const TOMBOL_UTAMA = {
  welcome: 'btnContinue',
  howto: 'btnBack',
  pause: 'btnResume',
  setelan: 'btnSetKembali',
  koleksi: 'btnKoleksiKembali',
  gameover: 'btnOverRetry',
  done: 'btnNext',
  ending: 'btnAgain',
  petunjuk: 'btnMulai'
};

// tombol yang terlihat & aktif di sebuah layar
function tombolDiLayar(layar) {
  return Array.from(layar.querySelectorAll('button')).filter(function (t) {
    return !t.disabled && t.offsetParent !== null;
  });
}

function fokusAwal(id) {
  if (!id || id === 'memuat') {
    // sedang main / loading: lepas sorotan supaya Spasi/Enter tidak menekan tombol
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    return;
  }
  const layar = $(id);
  const daftar = tombolDiLayar(layar);
  let pilihan = null;

  if (id === 'select') {
    // peta: sorot peminatan pertama yang belum selesai, kalau habis FINAL
    pilihan =
      daftar.find(function (t) {
        return t.dataset.map !== undefined && !t.classList.contains('finished');
      }) ||
      daftar.find(function (t) {
        return t.id === 'final';
      }) ||
      daftar[0];
  } else {
    pilihan =
      daftar.find(function (t) {
        return t.id === TOMBOL_UTAMA[id];
      }) || daftar[0];
  }
  if (pilihan) pilihan.focus();
}

// pindah sorotan ke tombol terdekat di arah (dx, dy)
function pindahFokus(layar, dx, dy) {
  const daftar = tombolDiLayar(layar);
  if (daftar.length === 0) return;
  const sekarang = document.activeElement;
  if (!daftar.includes(sekarang)) {
    daftar[0].focus();
    return;
  }

  const r = sekarang.getBoundingClientRect();
  const cx = r.left + r.width / 2,
    cy = r.top + r.height / 2;
  let terbaik = null,
    skorTerbaik = Infinity;
  for (const t of daftar) {
    if (t === sekarang) continue;
    const q = t.getBoundingClientRect();
    const x = q.left + q.width / 2 - cx,
      y = q.top + q.height / 2 - cy;
    const maju = x * dx + y * dy; // seberapa jauh ke arah yang dituju
    if (maju <= 1) continue; // bukan di arah itu
    const samping = dx !== 0 ? Math.abs(y) : Math.abs(x);
    const skor = maju + 2 * samping; // lebih suka yang lurus
    if (skor < skorTerbaik) {
      skorTerbaik = skor;
      terbaik = t;
    }
  }
  if (terbaik) terbaik.focus();
}

const ARAH_MENU = {
  ArrowRight: [1, 0],
  KeyD: [1, 0],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowUp: [0, -1],
  KeyW: [0, -1]
};

addEventListener('keydown', function (e) {
  document.body.classList.add('keyboard'); // tampilkan tanda sorotan (cincin kuning)
  const layar = document.querySelector('.screen.show');
  if (!layar) return; // sedang main: ditangani kontrol.js

  if (ARAH_MENU[e.code]) {
    e.preventDefault();
    pindahFokus(layar, ARAH_MENU[e.code][0], ARAH_MENU[e.code][1]);
  } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    if (e.repeat) {
      e.preventDefault();
      return;
    } // tahan Enter tidak menekan berkali-kali
    const aktif = document.activeElement;
    if (!(aktif && aktif.tagName === 'BUTTON' && layar.contains(aktif) && !aktif.disabled)) {
      e.preventDefault(); // belum ada yang disorot: tekan tombol utama layar ini
      fokusAwal(layar.id);
      if (document.activeElement && layar.contains(document.activeElement)) document.activeElement.click();
    }
  } else if (e.code === 'Escape' || e.code === 'Backspace') {
    if (layar.id === 'howto') $('btnBack').click();
    else if (layar.id === 'setelan') $('btnSetKembali').click();
    else if (layar.id === 'koleksi') {
      if ($('popInfo').classList.contains('buka'))
        $('popInfo').click(); // tutup pop-up dulu
      else $('btnKoleksiKembali').click();
    } else if (layar.id === 'select') showScreen('welcome');
    else if (layar.id === 'petunjuk') openSelect(); // batal masuk map
  }
});
addEventListener('pointerdown', function () {
  document.body.classList.remove('keyboard');
});
