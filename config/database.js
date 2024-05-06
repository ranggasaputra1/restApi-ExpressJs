const mysql = require("mysql");

// Konfigurasi koneksi ke database
const database = mysql.createConnection({
  host: "34.174.147.197", // Host database
  user: "root", // Pengguna database
  password: "express", // Kata sandi pengguna database
  database: "express", // Nama database yang ingin digunakan
});

// Membuka koneksi ke database
database.connect((err) => {
  if (err) {
    console.error("Koneksi ke database gagal: " + err.stack);
    return;
  }
  console.log("Berhasil Terhubung ke database ");
});

module.exports = database;
