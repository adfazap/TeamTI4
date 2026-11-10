/* =====================================================================
   SUARA.JS  -  musik latar dan efek suara.
   Semua suara dibuat langsung oleh browser (tanpa file mp3).
   Mau pakai lagu sendiri? Taruh file music.mp3 di folder map
   (assets/map1/music.mp3, prolog: assets/prolog/music.mp3), otomatis dipakai.
   ===================================================================== */

// Satu lagu untuk tiap level. Urutan: [prolog, map1, map2, ... map5]  (map5 = Game, nada ala chiptune)
//   bpm    = kecepatan lagu         wave   = jenis bunyi
//   root   = nada dasar             scale  = tangga nada yang dipakai
//   melody = urutan nada (angka = nomor di scale, -1 = diam), 16 langkah diulang terus
const MUSIK = [
  {
    bpm: 130,
    wave: 'square',
    root: 60,
    scale: [0, 2, 4, 7, 9],
    melody: [0, 2, 4, 2, 0, 2, 4, 5, 4, 2, 0, 2, 4, 2, 0, -1]
  },
  {
    bpm: 140,
    wave: 'sawtooth',
    root: 57,
    scale: [0, 3, 5, 7, 10],
    melody: [0, 2, 4, 2, 0, 2, 4, 6, 0, 2, 4, 2, 5, 4, 2, 0]
  },
  {
    bpm: 90,
    wave: 'triangle',
    root: 52,
    scale: [0, 2, 3, 5, 7, 8, 10],
    melody: [0, -1, 2, -1, 4, -1, 2, -1, 5, -1, 4, -1, 2, -1, 0, -1]
  },
  {
    bpm: 110,
    wave: 'square',
    root: 55,
    scale: [0, 3, 5, 6, 7, 10],
    melody: [0, -1, 2, 3, -1, 2, 0, -1, 4, -1, 3, 2, -1, 0, -1, 2]
  },
  {
    bpm: 125,
    wave: 'triangle',
    root: 64,
    scale: [0, 2, 4, 7, 9],
    melody: [4, 3, 2, 0, 2, 3, 4, 5, 4, 3, 2, 0, 2, 4, 3, -1]
  },
  {
    bpm: 125,
    wave: 'square',
    root: 58,
    scale: [0, 2, 3, 5, 7, 9, 10],
    melody: [0, 2, 3, 4, 3, 2, 0, -1, 4, 5, 6, 5, 4, 2, 3, -1]
  }
];

let audio; // mesin suara browser (dibuat saat pertama dibutuhkan)
let pengulangMusik; // timer yang memainkan nada terus-menerus
let musikFile = null; // file music.mp3 (kalau ada)
let bisu = false; // true kalau tombol suara dimatikan

// mengubah nomor nada MIDI menjadi frekuensi (Hz)
function nadaKeHz(nomorNada) {
  return 440 * Math.pow(2, (nomorNada - 69) / 12);
}

// membunyikan satu nada
function bunyikanNada(nomorNada, lama, jenisBunyi, keras) {
  const osilator = audio.createOscillator();
  const volume = audio.createGain();
  const sekarang = audio.currentTime;

  osilator.type = jenisBunyi;
  osilator.frequency.value = nadaKeHz(nomorNada);
  volume.gain.setValueAtTime(keras, sekarang);
  volume.gain.exponentialRampToValueAtTime(0.001, sekarang + lama); // makin lama makin pelan

  osilator.connect(volume);
  volume.connect(audio.destination);
  osilator.start(sekarang);
  osilator.stop(sekarang + lama);
}

function startMusic() {
  stopMusic();
  if (bisu || !level) return;

  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();

  const lagu = MUSIK[level.mapIndex + 1]; // mapIndex -1 (prolog) -> lagu nomor 0
  const jumlahNada = lagu.scale.length;
  const jedaMs = 60000 / lagu.bpm / 2; // jeda antar nada (milidetik)
  let langkah = 0;

  pengulangMusik = setInterval(function () {
    const nomor = lagu.melody[langkah % lagu.melody.length];
    if (nomor >= 0) {
      const oktaf = Math.floor(nomor / jumlahNada);
      const nada = lagu.root + lagu.scale[nomor % jumlahNada] + 12 * oktaf;
      bunyikanNada(nada, (jedaMs / 1000) * 1.5, lagu.wave, 0.08);
    }
    if (langkah % 4 === 0) {
      // nada bass tiap 4 langkah
      const urutanBass = [0, 2, 4, 2];
      const nadaBass = lagu.root - 24 + lagu.scale[urutanBass[Math.floor(langkah / 4) % 4]];
      bunyikanNada(nadaBass, (jedaMs / 1000) * 3, 'triangle', 0.12);
    }
    langkah++;
  }, jedaMs);

  // kalau ada file music.mp3 di folder map, pakai itu menggantikan musik buatan
  const folder = level.prolog ? 'prolog' : 'map' + (level.mapIndex + 1);
  const file = new Audio('assets/' + folder + '/music.mp3');
  file.loop = true;
  musikFile = file;
  file.addEventListener('canplaythrough', function () {
    if (musikFile !== file) return;
    clearInterval(pengulangMusik);
    file.play().catch(function () {});
  });
}

function stopMusic() {
  clearInterval(pengulangMusik);
  if (musikFile) {
    musikFile.pause();
    musikFile = null;
  }
}

// suara nada turun saat game over
function bunyiGameOver() {
  if (bisu || !audio) return;
  const osilator = audio.createOscillator();
  const volume = audio.createGain();
  const sekarang = audio.currentTime;

  osilator.type = 'sawtooth';
  osilator.frequency.setValueAtTime(400, sekarang);
  osilator.frequency.exponentialRampToValueAtTime(60, sekarang + 0.8);
  volume.gain.setValueAtTime(0.15, sekarang);
  volume.gain.exponentialRampToValueAtTime(0.001, sekarang + 0.8);

  osilator.connect(volume);
  volume.connect(audio.destination);
  osilator.start(sekarang);
  osilator.stop(sekarang + 0.8);
}
