/* =====================================================================
   MAIN.JS  -  file terakhir yang dijalankan: memulai "loop" permainan.
   ===================================================================== */

// Loop permainan: browser memanggil fungsi ini sekitar 60 kali per detik.
let waktuLama = performance.now();

function loop(waktuSekarang) {
  // dt = berapa detik sejak frame sebelumnya (dibatasi 0.05 supaya tidak "loncat" kalau browser lag)
  const dt = Math.min((waktuSekarang - waktuLama) / 1000, 0.05);
  waktuLama = waktuSekarang;

  if (sedangMain && !dijeda) update(dt); // hitung logika permainan
  render(); // gambar ke layar

  requestAnimationFrame(loop); // jadwalkan frame berikutnya
}
requestAnimationFrame(loop);

updateContinue(); // atur tombol Lanjutkan sesuai progres tersimpan
fokusAwal('welcome'); // keyboard: sorot tombol utama di layar awal
setTimeout(muatSemuaGambar, 300); // muat gambar semua map di latar belakang
