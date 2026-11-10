/* =====================================================================
   RENDER.JS  -  menggambar semuanya ke layar (canvas), dipanggil tiap frame.
   Yang digambar belakangan tampil di depan.
   ===================================================================== */

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H); // bersihkan layar
  if (!level) return;

  gambarBackground();
  gambarGerbang();
  gambarJasMelayang();
  const bersembunyi = pemain.sembunyi && pemain.sudahDiPapan;
  gambarPapanInfo();
  if (bersembunyi) gambarPemain(); // bersembunyi: pemain digambar DI BELAKANG objek
  gambarObjekSembunyi();
  gambarSemuaRintangan();
  gambarMusuh();
  if (!bersembunyi) gambarPemain();
  gambarKeteranganSembunyi();
  gambarPetunjukSembunyi();
  gambarPetunjukAwal();
  gambarHitungMundur();
  gambarEfekLayar();
}

/* ----- background ----- */
function gambarBackground() {
  // Background PANJANG (tidak looping): satu gambar lebar yang bergeser pelan dari awal sampai akhir map.
  // Kalau file bg-panjang.jpg tidak ada, otomatis memakai background looping di bawah.
  if (!BG_LOOPING && gambarSiap(level.latarPanjang)) {
    const lebarGambar = Math.max(W, (level.latarPanjang.naturalWidth * H) / level.latarPanjang.naturalHeight);
    let progres = pemain.x / level.panjang; // 0 di awal map, 1 di gerbang
    progres = Math.max(0, Math.min(1, progres));
    const x = -progres * (lebarGambar - W); // geser sebanyak kelebihan lebar gambar
    ctx.drawImage(level.latarPanjang, x, 0, lebarGambar, H);
    return;
  }

  // Background LOOPING: gambar pendek diulang sampai layar penuh
  const geser = (((kameraX() * 0.5) % BG_W) + BG_W) % BG_W; // selalu antara 0 dan BG_W
  for (let x = -geser; x < W; x += BG_W) {
    drawImg(level.latar, x, 0, BG_W, H, '#3a5a8c');
  }
}

/* ----- gerbang finish di ujung map ----- */
function gambarGerbang() {
  drawImg(level.gerbang, level.panjang - kameraX(), GROUND - 260, 200, 260, '#d4a017');
}

/* ----- prolog: jaket kuning melayang (berkilau). Hilang kalau sudah diambil. Petunjuk muncul saat mendekat ----- */
function gambarJasMelayang() {
  if (!level.prolog || pemain.sudahGanti) return;
  const j = posisiJas();
  const layarX = j.x - kameraX();
  if (layarX < -120 || layarX > W + 120) return;
  const u = JAS.ukuran;

  // lingkaran cahaya berdenyut di belakang jas
  const denyut = 0.5 + 0.5 * Math.sin(pemain.waktu * 5);
  const sinar = ctx.createRadialGradient(layarX, j.y, 4, layarX, j.y, u * (0.8 + 0.15 * denyut));
  sinar.addColorStop(0, 'rgba(255,240,150,0.85)');
  sinar.addColorStop(1, 'rgba(255,240,150,0)');
  ctx.fillStyle = sinar;
  ctx.fillRect(layarX - u, j.y - u, u * 2, u * 2);

  drawImg(level.gambarJas, layarX - u / 2, j.y - u / 2, u, u, '#fff');

  // bintang kecil berputar
  for (let i = 0; i < 3; i++) {
    const a = pemain.waktu * 2 + i * 2.1;
    const bx = layarX + Math.cos(a) * u * 0.7,
      by = j.y + Math.sin(a) * u * 0.55;
    ctx.fillStyle = '#fff3a0';
    ctx.fillRect(bx - 3, by - 1, 6, 2);
    ctx.fillRect(bx - 1, by - 3, 2, 6);
  }

  // petunjuk saat sudah dekat
  const sisa = j.x - pemain.x;
  if (sisa > -60 && sisa < JAS.jarakPetunjuk) {
    const lebar = Math.min(460, W - 20);
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(pemain.waktu * 6);
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(W / 2 - lebar / 2, 66, lebar, 34);
    ctx.fillStyle = '#ffe36b';
    ctx.font = '700 17px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lompat & ambil jaket kuning! Wajib untuk menyelesaikan prolog', W / 2, 88, lebar - 12);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

/* ----- papan info peminatan + dua tiangnya ----- */
function gambarPapanInfo() {
  for (const b of papan) {
    const x = b.x - kameraX();
    if (x < -400 || x > W + 50) continue; // di luar layar: tidak perlu digambar
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + 120, GROUND - 95, 10, 95);
    ctx.fillRect(x + 230, GROUND - 95, 10, 95);
    drawImg(b.gambar, x, GROUND - 95 - 203, 360, 203, '#fff');
  }
}

/* ----- objek tempat bersembunyi di dekat tiap papan (assets/mapN/hide_obj.png) ----- */
function gambarObjekSembunyi() {
  for (const b of papan) {
    const x = b.x + OBJEK_SEMBUNYI.x - kameraX();
    if (x < -200 || x > W + 50) continue;
    drawImg(b.objek, x, GROUND - OBJEK_SEMBUNYI.h, OBJEK_SEMBUNYI.w, OBJEK_SEMBUNYI.h, '#6a5a7a');
  }
}

/* ----- rintangan ----- */
function gambarSemuaRintangan() {
  for (const o of rintangan) {
    const x = kiriLayar(o);
    if (x < -200 || x > W + 100) continue; // di luar layar
    if (o.hancur > 0) gambarRintanganHancur(o, x);
    else gambarRintangan(o, x);
  }
}

// rintangan yang masih utuh
function gambarRintangan(o, x) {
  const y = atasRintangan(o);

  if (o.gantung) {
    // tali dari atas layar
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + o.w / 2, 0);
    ctx.lineTo(x + o.w / 2, y);
    ctx.stroke();

    if (o.terbalik) {
      // gambar dibalik (khusus prolog)
      ctx.save();
      ctx.translate(x, y + o.h);
      ctx.scale(1, -1);
      drawImg(o.gambar, 0, 0, o.w, o.h, '#7a4a2b');
      ctx.restore();
    } else {
      drawImg(o.gambar, x, y, o.w, o.h, '#7a4a2b');
    }
  } else if (o.jenis === 'pair') {
    // dua benda berdempetan
    drawImg(o.gambar, x, y, o.w / 2, o.h, '#7a4a2b');
    drawImg(o.gambar2, x + o.w / 2, y, o.w / 2, o.h, '#7a4a2b');
  } else {
    drawImg(o.gambar, x, y, o.w, o.h, '#7a4a2b');
  }
}

// rintangan yang sudah dihancurkan musuh:
// gambar utuh bergetar & memudar, lalu diganti gambar pecahan yang tetap tinggal di jalan
function gambarRintanganHancur(o, x) {
  const t = Math.min(1, o.hancur / 0.25); // 0 -> 1 selama 0.25 detik pertama

  if (t < 1) {
    ctx.globalAlpha = 1 - t;
    gambarRintangan(o, x + (Math.random() - 0.5) * 8); // bergetar
  }

  ctx.globalAlpha = t;
  for (let i = 0; i < o.pecahan.length; i++) {
    const gambarPecahan = o.pecahan[i];
    if (!gambarSiap(gambarPecahan)) continue;

    // rintangan 'pair' punya dua tumpukan pecahan, yang lain satu di tengah
    let tengah = x + o.w / 2;
    if (o.pecahan.length > 1) tengah = x + o.w * (i === 0 ? 0.25 : 0.75);

    const jatuh = (1 - t) * 28; // pecahan jatuh dari atas
    const px = Math.round(tengah - gambarPecahan.naturalWidth / 2);
    const py = GROUND - gambarPecahan.naturalHeight - jatuh;
    ctx.drawImage(gambarPecahan, px, py);
  }
  ctx.globalAlpha = 1;
}

/* ----- musuh / pengejar ----- */
function gambarMusuh() {
  const x = 230 - jarak - 150;

  let aksi = level.aksiMusuh; // 'run', 'wait', 'charge' atau 'bingung'
  if (pemain.matiTimer > 0) aksi = pemain.tTangkap < 0.35 ? 'charge' : 'bangga'; // menangkap: menyeruduk dulu, lalu diam bangga

  const frame = level.animMusuh[aksi];
  let nomor = Math.floor(pemain.waktu * ANIM_MUSUH[aksi].fps) % frame.length;
  if (aksi === 'lompat') nomor = Math.min(frame.length - 1, Math.floor(level.lompatU * frame.length)); // gambar sesuai posisi lompatan
  const gambarIni = frame[nomor];

  // kalau gambar animasinya tidak ada, pakai chaser.png biasa
  if (!gambarSiap(gambarIni)) {
    drawImg(
      level.gambarMusuh,
      x + 150 - 150 * SKALA_MUSUH,
      GROUND - 100 * SKALA_MUSUH - level.musuhY,
      150 * SKALA_MUSUH,
      100 * SKALA_MUSUH,
      '#a33'
    );
    return;
  }

  let naik = 0; // seberapa tinggi musuh terangkat
  if (aksi === 'run') {
    const loncatan = [6, 0, 6, 0]; // melompat tiap langkah
    naik = loncatan[nomor % 4];
  } else if (aksi === 'charge' && nomor === 1) {
    naik = 4;
  }

  if (aksi === 'charge' && pemain.matiTimer <= 0 && level.hadap > 0) {
    // garis kecepatan putih di belakang musuh
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 3; i++) {
      const gx = x - 10 - ((pemain.waktu * 700 + i * 37) % 60);
      ctx.fillRect(gx, GROUND - 80 + i * 22, 34, 4);
    }
  }
  // ukuran gambar sesuai aslinya x SKALA_MUSUH (gambar bingung lebih tinggi karena ada tanda tanya)
  const lebarB = (gambarIni.naturalWidth || 150) * SKALA_MUSUH;
  const tinggiB = (gambarIni.naturalHeight || 100) * SKALA_MUSUH;
  const yMusuh = GROUND - tinggiB - naik - level.musuhY; // musuhY > 0 = sedang melompati rintangan kuat
  const xB = x + 150 - lebarB; // sisi kanan (moncong) tetap di tempat yang sama

  if (level.hadap < 0 && pemain.matiTimer <= 0) {
    // menghadap kiri (bolak-balik saat bingung): gambar dibalik
    const tengah = xB + lebarB / 2;
    ctx.save();
    ctx.translate(tengah, 0);
    ctx.scale(-1, 1);
    drawImg(gambarIni, -lebarB / 2, yMusuh, lebarB, tinggiB, '#a33');
    ctx.restore();
  } else {
    drawImg(gambarIni, xB, yMusuh, lebarB, tinggiB, '#a33');
  }
}

/* ----- karakter pemain ----- */
function gambarPemain() {
  // ditabrak musuh: animasi caught1..6 (terlempar, mendarat, pusing). 3 gambar terakhir diulang.
  if (pemain.matiTimer > 0) {
    const daftar = karakterTertangkap[baju];
    let n = Math.floor(pemain.tTangkap * TERTANGKAP.fps);
    if (n >= TERTANGKAP.jumlah) n = TERTANGKAP.jumlah - 3 + ((n - TERTANGKAP.jumlah) % 3);
    const g = daftar[n];
    if (gambarSiap(g)) {
      drawImg(
        g,
        240 - (PLAYER_H * g.naturalWidth) / g.naturalHeight / 2,
        pemain.y - PLAYER_H,
        (PLAYER_H * g.naturalWidth) / g.naturalHeight,
        PLAYER_H,
        '#e63946'
      );
      return;
    }
  }

  // bersembunyi di balik objek: gambar siluet gelap (hide1/hide2), atau gambar menunduk kalau belum ada
  if (pemain.sembunyi && pemain.sudahDiPapan) {
    const g = karakterSembunyi[baju][Math.floor(pemain.waktu * 2) % GAMBAR_SEMBUNYI];
    const dasar = gambarSiap(g) ? g : karakterMenunduk[baju];
    const lebarS = (PLAYER_H * (dasar.naturalWidth || 80)) / (dasar.naturalHeight || PLAYER_H);
    ctx.globalAlpha = 0.9;
    drawImg(dasar, 240 - lebarS / 2, pemain.y - PLAYER_H, lebarS, PLAYER_H, '#334');
    ctx.globalAlpha = 1;
    return;
  }

  // pilih kelompok gambar sesuai keadaan
  let daftarFrame;
  if (pemain.tersandung > 0) daftarFrame = HIT;
  else if (!pemain.dilantai) daftarFrame = AIR;
  else if (pemain.sedangLari) daftarFrame = RUN;
  else daftarFrame = [1]; // diam: gambar berdiri

  const nomor = daftarFrame[Math.floor(pemain.waktu * FPS) % daftarFrame.length];
  let gambarIni = karakter[baju][nomor];

  // menunduk: pakai gambar duck.png (bukan digepengkan)
  const menunduk = pemain.menunduk && pemain.dilantai && pemain.tersandung <= 0;
  if (menunduk && gambarSiap(karakterMenunduk[baju])) gambarIni = karakterMenunduk[baju];

  let lebar = 80;
  if (gambarIni.naturalWidth) lebar = (PLAYER_H * gambarIni.naturalWidth) / gambarIni.naturalHeight;

  // saat kebal, karakter berkedip
  const terlihat = pemain.kebal <= 0 || Math.floor(pemain.waktu * 12) % 2 === 1;
  if (terlihat) drawImg(gambarIni, 240 - lebar / 2, pemain.y - PLAYER_H, lebar, PLAYER_H, '#e63946');
}

/* ----- keterangan kecil saat bersembunyi: sisa waktu + cara keluar (papan TIDAK diperbesar) ----- */
function gambarKeteranganSembunyi() {
  if (!(pemain.sembunyi && pemain.sudahDiPapan)) return;
  const b = pemain.papanAktif;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(W / 2 - 170, 70, 340, 52);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(W / 2 - 150, 108, 300, 6);
  ctx.fillStyle = '#ffd23c';
  ctx.fillRect(W / 2 - 150, 108, (300 * Math.max(0, b.sisa)) / SEMBUNYI_MAX, 6);
  ctx.fillStyle = '#fff';
  ctx.font = '700 16px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bersembunyi · pencet  E  untuk keluar', W / 2, 98);
  ctx.textAlign = 'left';
}

/* ----- pengingat "Pencet E" begitu papan info terlihat (berkedip pelan supaya menarik perhatian) ----- */
function gambarPetunjukSembunyi() {
  if (!bisaSembunyi()) return;
  const lebar = Math.min(560, W - 20);
  const kiri = W / 2 - lebar / 2;
  ctx.globalAlpha = 0.85 + 0.15 * Math.sin(pemain.waktu * 6);
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(kiri, 66, lebar, 64);
  ctx.strokeStyle = '#ffd23c';
  ctx.lineWidth = 3;
  ctx.strokeRect(kiri, 66, lebar, 64);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23c';
  ctx.font = '800 20px Nunito, sans-serif';
  ctx.fillText('Papan info di depan!', W / 2, 92);
  ctx.fillStyle = '#fff';
  ctx.font = '700 17px Nunito, sans-serif';
  ctx.fillText('Pencet  E  untuk bersembunyi dan membacanya', W / 2, 118);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

/* ----- tulisan "Tahan → untuk berlari" di awal level ----- */
function gambarPetunjukAwal() {
  if (pemain.x >= 1) return;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W / 2 - 230, 70, 460, 46);
  ctx.fillStyle = '#fff';
  ctx.font = '800 22px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tahan  →  untuk berlari', W / 2, 101);
  ctx.textAlign = 'left';
}

/* ----- angka hitung mundur 3 - 2 - 1 - GO! ----- */
function gambarHitungMundur() {
  const sisa = pemain.hitungMundur;
  if (sisa <= 0) return;

  // pilih gambar & kapan angka itu berakhir
  let kunci, akhir;
  if (sisa > 2.2) {
    kunci = '3';
    akhir = 2.2;
  } else if (sisa > 1.4) {
    kunci = '2';
    akhir = 1.4;
  } else if (sisa > 0.6) {
    kunci = '1';
    akhir = 0.6;
  } else {
    kunci = 'go';
    akhir = 0;
  }

  // pecahan: 1 di awal angka, 0 di akhir angka
  let pecahan;
  if (kunci === 'go') pecahan = sisa / 0.6;
  else pecahan = (sisa - akhir) / 0.8;

  // angka mengecil pelan-pelan, "GO!" membesar sambil memudar
  let skala;
  if (kunci === 'go') skala = 1 + (1 - pecahan) * 0.3;
  else skala = 1 + pecahan * 0.35;

  const gambarAngka = HITUNG[kunci];
  const lebar = (gambarAngka.naturalWidth || 144) * skala;
  const tinggi = (gambarAngka.naturalHeight || 176) * skala;

  if (kunci === 'go') ctx.globalAlpha = Math.min(1, pecahan * 2);
  drawImg(gambarAngka, W / 2 - lebar / 2, H / 2 - tinggi / 2 - 20, lebar, tinggi, '#fff');
  ctx.globalAlpha = 1;
}

/* ----- efek layar: merah saat ditabrak, kilatan ganti baju, tepi merah saat musuh dekat ----- */
function gambarEfekLayar() {
  if (pemain.matiTimer > 0) {
    // ditabrak musuh: layar kemerahan
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);
  }

  if (pemain.kilat > 0) {
    // ganti baju: kilatan putih + tulisan
    const terang = Math.min(1, pemain.kilat);
    ctx.fillStyle = 'rgba(255,255,255,' + terang * 0.9 + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(20,33,61,' + terang + ')';
    ctx.font = '800 56px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ganti pakaian!', W / 2, H / 2);
    ctx.textAlign = 'left';
  }

  if (jarak < 100 && jarak > -190) {
    // musuh dekat: tepi kiri layar memerah
    const warna = ctx.createLinearGradient(0, 0, 220, 0);
    warna.addColorStop(0, 'rgba(255,0,0,' + (100 - jarak) / 150 + ')');
    warna.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = warna;
    ctx.fillRect(0, 0, 220, H);
  }
}
