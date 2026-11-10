/* =====================================================================
   MUSUH.JS  -  perilaku musuh yang mengejar: gerak, menghancurkan /
   melompati rintangan, bingung saat pemain bersembunyi, dan menangkap
   pemain.
   (pemain = data pemain, jarak = jarak musuh ke pemain, rintangan = daftar rintangan)
   ===================================================================== */

// Musuh mengejar. Jarak berkurang karena musuh lebih cepat dari "dunia".
function gerakMusuh(dt) {
  const pengali = level.prolog ? 0.75 : 1;

  // pemain bersembunyi di balik papan: musuh bingung, tidak mengejar
  if (pemain.sembunyi && pemain.sudahDiPapan) {
    musuhBingung(dt);
    return;
  }
  if (level.bingung > 0) {
    // pemain baru keluar: musuh masih bingung di tempat
    level.bingung -= dt;
    level.bingungWaktu += dt;
    level.hadap = Math.floor(level.bingungWaktu / 0.35) % 2 === 0 ? 1 : -1;
    return; // (tidak mengejar; jarak hanya bertambah karena pemain lari)
  }
  level.hadap = 1; // mengejar lagi: selalu menghadap ke kanan (kalau tidak, bisa tetap terbalik setelah bingung)

  // kemarahan musuh turun pelan-pelan kalau pemain tidak menabrak
  pemain.marah = Math.max(0, pemain.marah - RAGE_DECAY * dt);

  // makin jauh map, musuh makin cepat sedikit (+40 di ujung map)
  const kecepatanDasar = BULL_SPEED + (40 * pemain.x) / level.panjang;
  const kecepatan = kecepatanDasar * (1 + pemain.marah) * pengali;
  jarak -= kecepatan * dt;
}

// Musuh menghancurkan rintangan kecil yang tersentuh moncongnya.
// Rintangan "kuat" (blok besar & mobil) tidak bisa hancur: musuh MELOMPATINYA dengan lengkungan lompat.
//   - kalau pemain ada di atas rintangan itu / belum melewatinya (melayang), musuh menunggu di depannya dulu
//   - kalau pemain tertahan di depan rintangan (di tanah), musuh langsung menangkapnya
function musuhMenghancurkanRintangan(dt) {
  const moncong = pemain.x + 30 - jarak; // posisi moncong musuh di dunia
  const bingung = pemain.sembunyi || level.bingung > 0;

  level.musuhY = 0;
  if (bingung) level.aksiMusuh = 'bingung';
  else if (jarak < 90)
    level.aksiMusuh = 'charge'; // dekat = menyeruduk
  else level.aksiMusuh = 'run';

  for (const o of rintangan) {
    if (o.hancur > 0) {
      // sudah hancur: hitung lama sejak hancur (untuk animasi)
      o.hancur += dt;
      continue;
    }
    if (o.sudahDilewati) continue;

    if (!o.kuat) {
      if (moncong >= o.x) o.hancur = 0.001; // hancur!
      continue;
    }

    // ----- rintangan kuat: dilompati -----
    if (bingung) continue; // lagi bingung: tidak mengurus rintangan kuat
    const awalLompat = o.x - LOMPAT_AWAL;
    const akhirLompat = o.x + o.w + LOMPAT_AKHIR;
    if (moncong < awalLompat) continue; // masih jauh
    if (moncong >= akhirLompat) {
      o.sudahDilewati = true;
      continue;
    }

    if (!o.mulaiLompat) {
      const pemainTertahan = pemain.dilantai && pemain.x < o.x - 30; // di tanah, di depan rintangan
      if (pemainTertahan) {
        continue; // pemain tertahan di tanah: musuh terus mendekat dan menangkapnya
      }
      o.mulaiLompat = true; // selain itu musuh langsung lompat (pemain masih di atas pun tetap dikejar)
    }

    // lengkung lompat: 0 di awal, setinggi LOMPAT_TINGGI di tengah (agak datar), 0 saat mendarat
    const u = (moncong - awalLompat) / (akhirLompat - awalLompat);
    const tinggi = LOMPAT_TINGGI * (1 - Math.pow(2 * u - 1, 4));
    level.musuhY = Math.max(level.musuhY, tinggi);
    level.aksiMusuh = 'lompat';
    level.lompatU = u; // 0 = baru lepas landas, 1 = mendarat (untuk memilih gambar lompat)
  }
}

// Musuh yang kehilangan pemain: mondar-mandir bolak-balik di dekat papan sambil celingukan.
function musuhBingung(dt) {
  level.bingungWaktu += dt;
  const sasaran = 120 + 50 * Math.sin(level.bingungWaktu * 2.6); // jarak bergoyang antara 70 dan 170
  const selisih = sasaran - jarak;
  const langkah = Math.max(-300 * dt, Math.min(300 * dt, selisih));
  jarak += langkah;
  if (Math.abs(langkah) > 0.3) level.hadap = langkah > 0 ? -1 : 1; // jarak membesar = mundur = menghadap kiri
}

// Musuh menangkap pemain HANYA kalau badannya benar-benar menyentuh badan pemain.
// Kalau pemain masih melayang di atas musuh, musuh MENUNGGU di bawahnya sampai pemain turun.
// Mengembalikan true kalau pemain tertangkap.
function cekMusuhMenangkap() {
  if (pemain.sembunyi && pemain.sudahDiPapan) return false; // bersembunyi: tidak bisa ditangkap

  // kotak badan musuh (kiri & kanan di layar, bagian atas)
  const musuhKiri = 230 - jarak - 150 + 20;
  const musuhKanan = 230 - jarak - 10;
  const musuhAtas = GROUND - 70;

  // kotak badan pemain
  const pemainKiri = 222;
  const pemainKanan = 258;
  const kakiPemain = pemain.y - 6;

  const sejajar = musuhKanan > pemainKiri && musuhKiri < pemainKanan;
  if (!sejajar) return false;
  if (level.musuhY > 0 && kakiPemain < GROUND - 40) return false; // musuh sedang melompat & pemain di atas: lewat saja, tidak menahan

  if (musuhAtas < kakiPemain) {
    // kaki pemain cukup rendah: badan kena
    caught();
    return true;
  }
  jarak = -3; // pemain di udara: musuh ditahan, menunggu pemain turun
  level.aksiMusuh = 'wait';
  return false;
}
