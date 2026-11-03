/* =====================================================================
   RENDER.JS  -  menggambar semuanya ke layar (canvas), dipanggil tiap frame.
   Yang digambar belakangan tampil di depan.
   ===================================================================== */

function render(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);          // bersihkan layar
  if (!level) return;

  gambarBackground();
  gambarGerbang();
  gambarPapanInfo();
  gambarSemuaRintangan();
  gambarBanteng();
  gambarPemain();
  gambarPetunjukAwal();
  gambarHitungMundur();
  gambarEfekLayar();
}

/* ----- background ----- */
function gambarBackground(){
  // Background PANJANG (tidak looping): satu gambar lebar yang bergeser pelan dari awal sampai akhir map.
  // Kalau file bg-panjang.jpg tidak ada, otomatis memakai background looping di bawah.
  if (!BG_LOOPING && gambarSiap(level.latarPanjang)) {
    const lebarGambar = Math.max(W, level.latarPanjang.naturalWidth * H / level.latarPanjang.naturalHeight);
    let progres = pemain.x / level.panjang;            // 0 di awal map, 1 di gerbang
    progres = Math.max(0, Math.min(1, progres));
    const x = -progres * (lebarGambar - W);            // geser sebanyak kelebihan lebar gambar
    ctx.drawImage(level.latarPanjang, x, 0, lebarGambar, H);
    return;
  }

  // Background LOOPING: gambar pendek diulang sampai layar penuh
  const geser = (((kameraX() * 0.5) % BG_W) + BG_W) % BG_W;   // selalu antara 0 dan BG_W
  for (let x = -geser; x < W; x += BG_W) {
    drawImg(level.latar, x, 0, BG_W, H, '#3a5a8c');
  }
}

/* ----- gerbang finish di ujung map ----- */
function gambarGerbang(){
  drawImg(level.gerbang, level.panjang - kameraX(), GROUND - 260, 200, 260, '#d4a017');
}

/* ----- papan info peminatan + dua tiangnya ----- */
function gambarPapanInfo(){
  for (const b of papan) {
    const x = b.x - kameraX();
    if (x < -400 || x > W + 50) continue;      // di luar layar: tidak perlu digambar
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + 120, GROUND - 95, 10, 95);
    ctx.fillRect(x + 230, GROUND - 95, 10, 95);
    drawImg(b.gambar, x, GROUND - 95 - 203, 360, 203, '#fff');
  }
}

/* ----- rintangan ----- */
function gambarSemuaRintangan(){
  for (const o of rintangan) {
    const x = kiriLayar(o);
    if (x < -200 || x > W + 100) continue;     // di luar layar
    if (o.hancur > 0) gambarRintanganHancur(o, x);
    else gambarRintangan(o, x);
  }
}

// rintangan yang masih utuh
function gambarRintangan(o, x){
  const y = atasRintangan(o);

  if (o.gantung) {
    // tali dari atas layar
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + o.w / 2, 0);
    ctx.lineTo(x + o.w / 2, y);
    ctx.stroke();

    if (o.terbalik) {                          // gambar dibalik (khusus prolog)
      ctx.save();
      ctx.translate(x, y + o.h);
      ctx.scale(1, -1);
      drawImg(o.gambar, 0, 0, o.w, o.h, '#7a4a2b');
      ctx.restore();
    } else {
      drawImg(o.gambar, x, y, o.w, o.h, '#7a4a2b');
    }
  } else if (o.jenis === 'pair') {             // dua benda berdempetan
    drawImg(o.gambar, x, y, o.w / 2, o.h, '#7a4a2b');
    drawImg(o.gambar2, x + o.w / 2, y, o.w / 2, o.h, '#7a4a2b');
  } else {
    drawImg(o.gambar, x, y, o.w, o.h, '#7a4a2b');
  }
}

// rintangan yang sudah dihancurkan banteng:
// gambar utuh bergetar & memudar, lalu diganti gambar pecahan yang tetap tinggal di jalan
function gambarRintanganHancur(o, x){
  const t = Math.min(1, o.hancur / 0.25);     // 0 -> 1 selama 0.25 detik pertama

  if (t < 1) {
    ctx.globalAlpha = 1 - t;
    gambarRintangan(o, x + (Math.random() - 0.5) * 8);    // bergetar
  }

  ctx.globalAlpha = t;
  for (let i = 0; i < o.pecahan.length; i++) {
    const gambarPecahan = o.pecahan[i];
    if (!gambarSiap(gambarPecahan)) continue;

    // rintangan 'pair' punya dua tumpukan pecahan, yang lain satu di tengah
    let tengah = x + o.w / 2;
    if (o.pecahan.length > 1) tengah = x + o.w * (i === 0 ? 0.25 : 0.75);

    const jatuh = (1 - t) * 28;               // pecahan jatuh dari atas
    const px = Math.round(tengah - gambarPecahan.naturalWidth / 2);
    const py = GROUND - gambarPecahan.naturalHeight - jatuh;
    ctx.drawImage(gambarPecahan, px, py);
  }
  ctx.globalAlpha = 1;
}

/* ----- banteng / pengejar ----- */
function gambarBanteng(){
  const x = 230 - jarak - 150;

  let aksi = level.aksiBanteng;                // 'run', 'wait' atau 'charge'
  if (pemain.matiTimer > 0) aksi = 'charge';   // saat menangkap pemain: menyeruduk

  const frame = level.animBanteng[aksi];
  const nomor = Math.floor(pemain.waktu * ANIM_BANTENG[aksi].fps) % frame.length;
  const gambarIni = frame[nomor];

  // kalau gambar animasinya tidak ada, pakai chaser.png biasa
  if (!gambarSiap(gambarIni)) {
    drawImg(level.gambarBanteng, x, GROUND - 100, 150, 100, '#a33');
    return;
  }

  let naik = 0;                                // seberapa tinggi banteng terangkat
  if (aksi === 'run') {
    const loncatan = [6, 0, 6, 0];             // melompat tiap langkah
    naik = loncatan[nomor % 4];
  } else if (aksi === 'charge' && nomor === 1) {
    naik = 4;
  }

  if (aksi === 'charge') {                     // garis kecepatan putih di belakang banteng
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 3; i++) {
      const gx = x - 10 - ((pemain.waktu * 700 + i * 37) % 60);
      ctx.fillRect(gx, GROUND - 80 + i * 22, 34, 4);
    }
  }
  drawImg(gambarIni, x, GROUND - 100 - naik, gambarIni.naturalWidth, 100, '#a33');
}

/* ----- karakter pemain ----- */
function gambarPemain(){
  // pilih kelompok gambar sesuai keadaan
  let daftarFrame;
  if (pemain.tersandung > 0) daftarFrame = HIT;
  else if (!pemain.dilantai) daftarFrame = AIR;
  else if (pemain.sedangLari) daftarFrame = RUN;
  else daftarFrame = [1];                      // diam: gambar berdiri

  const nomor = daftarFrame[Math.floor(pemain.waktu * FPS) % daftarFrame.length];
  let gambarIni = karakter[baju][nomor];

  // menunduk: pakai gambar duck.png (bukan digepengkan)
  const menunduk = pemain.menunduk && pemain.dilantai && pemain.tersandung <= 0;
  if (menunduk && gambarSiap(karakterMenunduk[baju])) gambarIni = karakterMenunduk[baju];

  let lebar = 80;
  if (gambarIni.naturalWidth) lebar = PLAYER_H * gambarIni.naturalWidth / gambarIni.naturalHeight;

  // saat kebal, karakter berkedip
  const terlihat = (pemain.kebal <= 0) || (Math.floor(pemain.waktu * 12) % 2 === 1);
  if (terlihat) drawImg(gambarIni, 240 - lebar / 2, pemain.y - PLAYER_H, lebar, PLAYER_H, '#e63946');
}

/* ----- tulisan "Tahan → untuk berlari" di awal level ----- */
function gambarPetunjukAwal(){
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
function gambarHitungMundur(){
  const sisa = pemain.hitungMundur;
  if (sisa <= 0) return;

  // pilih gambar & kapan angka itu berakhir
  let kunci, akhir;
  if (sisa > 2.2) { kunci = '3'; akhir = 2.2; }
  else if (sisa > 1.4) { kunci = '2'; akhir = 1.4; }
  else if (sisa > 0.6) { kunci = '1'; akhir = 0.6; }
  else { kunci = 'go'; akhir = 0; }

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

/* ----- efek layar: merah saat ditabrak, kilatan ganti baju, tepi merah saat banteng dekat ----- */
function gambarEfekLayar(){
  if (pemain.matiTimer > 0) {                  // ditabrak banteng: layar kemerahan
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);
  }

  if (pemain.kilat > 0) {                      // ganti baju: kilatan putih + tulisan
    const terang = Math.min(1, pemain.kilat);
    ctx.fillStyle = 'rgba(255,255,255,' + (terang * 0.9) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(20,33,61,' + terang + ')';
    ctx.font = '800 56px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ganti pakaian!', W / 2, H / 2);
    ctx.textAlign = 'left';
  }

  if (jarak < 100 && jarak > -190) {           // banteng dekat: tepi kiri layar memerah
    const warna = ctx.createLinearGradient(0, 0, 220, 0);
    warna.addColorStop(0, 'rgba(255,0,0,' + ((100 - jarak) / 150) + ')');
    warna.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = warna;
    ctx.fillRect(0, 0, 220, H);
  }
}
