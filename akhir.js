/* =====================================================================
   kalah (tertangkap -> game over) dan menang (finish: prolog
   / map / ending).
   (pemain = data pemain, jarak = jarak musuh ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

// dipanggil saat musuh menangkap pemain
function caught() {
  pemain.matiTimer = TERTANGKAP.durasi; // adegan ditabrak (animasi caught1..6) sebelum layar game over
  pemain.tTangkap = 0;
  pemain.sembunyi = false;
  level.musuhY = 0; // musuh mendarat tepat di pemain
  $('btnSembunyi').style.display = 'none';
  pemain.tersandung = 1;
  stopMusic();
  bunyiGameOver();
}

function gameOver() {
  setPlaying(false);
  $('overInfo').textContent = level.prolog ? 'Prolog' : MAPS[level.mapIndex].name;
  $('overPesan').textContent = level.gagalJas
    ? 'Kamu sampai di gerbang tanpa mengambil jaket kuning!'
    : 'Kamu tertangkap pengejar!';
  showScreen('gameover');
}

// dipanggil saat pemain sampai di gerbang
function finishLevel() {
  setPlaying(false);
  stopMusic();

  if (level.prolog && !pemain.sudahGanti) {
    // sampai gerbang tanpa mengambil jaket kuning: GAME OVER walau sudah finish
    level.gagalJas = true;
    bunyiGameOver();
    gameOver();
    return;
  }

  if (level.prolog) {
    baju = 'promed';
    selesai.clear(); // mulai game baru: map yang selesai dikosongkan
    prologSelesai = true;
    simpan();
    message(
      'Prolog selesai!\nKamu sudah jadi mahasiswa Promed. Sekarang pilih peminatanmu.',
      'LANJUT',
      openSelect
    );
    return;
  }

  selesai.add(level.mapIndex);
  simpan();

  const m = MAPS[level.mapIndex];
  let teks = m.name + ' selesai! (' + selesai.size + '/' + MAPS.length + ')\n';
  teks += 'Studio: ' + m.studio + ' · Core Stream: ' + m.stream;
  if (selesai.size === MAPS.length) teks += '\n🏆 Semua selesai! FINAL terbuka';
  message(teks, 'LANJUT', openSelect);
}
