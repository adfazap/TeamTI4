GAMBAR UI - taruh file dengan NAMA PERSIS seperti di bawah ke folder ini (assets/ui/).
Semua opsional: kalau file belum ada, game memakai tampilan bawaan. Boleh diisi satu-satu.

TOMBOL (PNG transparan, teks/label sudah ada di dalam gambar; ukuran bebas, rasio gambar dipertahankan)
  btn-main.png        tombol "Main" di home          (saran 420 x 150)
  btn-howto.png       tombol "Cara bermain"          (saran 420 x 150)
  btn-back.png        tombol "Kembali"               (saran 420 x 150)
  btn-resume.png      tombol "Lanjut" di layar jeda  (saran 420 x 150)
  btn-retry.png       tombol "Ulangi" (jeda & tertangkap)
  btn-menu.png        tombol "Menu utama"
  btn-next.png        tombol "Lanjut" setelah map selesai
  btn-again.png       tombol "Main lagi" di ending
  btn-continue.png    tombol "Lanjutkan" di home (progres tersimpan, aktif setelah prolog selesai)
  btn-continue-off.png tombol "Lanjutkan" abu-abu (prolog belum selesai, tidak bisa diklik)
  btn-fullscreen.png  ikon layar penuh               (saran 128 x 128)
  btn-pause.png       ikon jeda                      (saran 128 x 128)
  btn-sound-on.png    ikon suara menyala             (saran 128 x 128)
  btn-sound-off.png   ikon suara mati                (saran 128 x 128)

LATAR LAYAR (JPG/PNG penuh, saran 1920 x 1080; nama file harus .jpg seperti di bawah)
  home-bg.jpg         latar home (menggantikan ilustrasi kampus)
  select-bg.jpg       latar layar pilih peminatan
  menu-bg.jpg         latar layar Cara bermain, Jeda, Map selesai, dan Ending
  panel.png           bingkai kotak deskripsi di home (diregangkan, saran 1000 x 600)

HOME
  logo.png            logo/judul "Lari Promed" (PNG transparan, saran 1200 x 600)

PETA PILIHAN PEMINATAN (PNG transparan)
  node-frame.png      bingkai di sekeliling tiap kotak map (saran 300 x 300, bagian tengah kosong)
  check.png           tanda centang map selesai      (saran 256 x 256)
  lock.png            gembok node FINAL              (saran 256 x 256)
  final.png           gambar node FINAL              (saran 300 x 300)
  start.png           gambar node awal (karakter)    (saran 300 x 300)
  Gambar tiap map: assets/map1/thumb.png ... assets/map5/thumb.png (saran 300 x 300, tanpa transparansi).
                   Kalau tidak ada, dipakai bg.jpg map tersebut.

GAME OVER (saat kena pengejar)
  gameover.png        judul "GAME OVER" (PNG transparan, saran 1000 x 400)
  gameover-bg.jpg     latar layar game over (saran 1920 x 1080)
  Tombol di layar ini memakai btn-retry.png dan btn-menu.png.

HITUNG MUNDUR (PNG transparan, angka dengan tepi gelap; ukuran bebas, ditampilkan di tengah layar)
  count-3.png   count-2.png   count-1.png   count-go.png

LOADING (sebelum masuk map)
  loading-1.png ... loading-8.png   8 frame animasi loading (PNG transparan, bebas ukuran; diputar 12 gambar per detik)
  loading-bg.jpg                    latar layar loading (opsional; kalau tidak ada, latar gelap polos)
  Teks tipis di layar ini diambil dari 'deskripsi' tiap map di pengaturan.js. Lama minimal: MIN_MEMUAT.

RINTANGAN KHUSUS PROLOG (di assets/prolog/, bukan di assets/ui/)
  buku.png (60x80)  meja.png (112x68)  kertas.png (60x72)  banner.png (96x72, menggantung dengan tali dari atas)
  debris_buku.png  debris_meja.png  debris_kertas.png  debris_banner.png   = pecahan setelah dihancurkan banteng

btn-hide.png  : tombol "sembunyi" di layar sentuh (muncul dekat papan info), 128x128
btn-start.png : (opsional) tombol "Mulai" di layar petunjuk sebelum main
