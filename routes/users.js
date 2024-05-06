var express = require("express");
var router = express.Router();
var db = require("../config/database");
var bodyParser = require("body-parser");

// Menampilkan seluruh data dari database
router.get("/", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error("Error in MySQL query: " + error.message);
      res.status(500).send("Error in MySQL query");
      return;
    }
    res.json({
      code: "200",
      status: "OK",
      message: "Success display data",
      data: results,
    });
  });
});

// Insert data ke database
router.post("/", (req, res) => {
  const { nama, alamat, nohp } = req.body;

  // periksa apakah yang diinputkan sesuai
  if (!nama || !alamat || !nohp) {
    return res.status(400).json({
      code: "400",
      status: "Bad Request",
      message:
        "failed to insert data into the database, please enter the appropriate nama, alamat and nohp",
    });
  }

  // kueri untuk menambahkan data baru ke database
  const query = "INSERT INTO users (nama, alamat, nohp) VALUES (?, ?, ?)";
  db.query(query, [nama, alamat, nohp], (error, results) => {
    if (error) {
      console.error("Failed to add data to database:", error);
      return res.status(500).json({ error: "Failed to add data to database:" });
    }
    res.status(201).json({
      code: "201",
      status: "OK",
      message: "Data has been successfully added to the database",
      user_id: results.insertId,
    });
  });
});

// kueri untuk update data dari database
router.put("/:id", (req, res) => {
  const user_id = req.params.id;
  const { nama, alamat, nohp } = req.body;

  // Periksa apakah data yang diterima sesuai
  if (!nama || !alamat || !nohp) {
    return res.status(400).json({
      code: "400",
      status: "Bad Request",
      message:
        "failed to update data into the database, please enter the appropriate nama, alamat and nohp",
    });
  }

  // kueri untuk memperbarui data dalam database
  const query =
    "UPDATE users SET nama = ?, alamat = ?, nohp = ? WHERE user_id = ?";
  db.query(query, [nama, alamat, nohp, user_id], (error, results) => {
    if (error) {
      console.error("Failed to update data to database:", error);
      return res
        .status(500)
        .json({ error: "Failed to update data to database:" });
    }
    res.status(200).json({
      code: "200",
      status: "OK",
      message: "Data has been successfully update to the database",
      user_id: user_id,
    });
  });
});

// Rute untuk menghapus data dari database
router.delete("/:id", (req, res) => {
  const user_id = req.params.id;

  // kueri untuk menghapus data dari database
  const query = "DELETE FROM users WHERE user_id = ?";
  db.query(query, [user_id], (error, results) => {
    if (error) {
      console.error("Failed to update data to database:", error);
      return res
        .status(500)
        .json({ error: "Failed to update data to database:" });
    }
    res.status(200).json({
      code: "200",
      status: "OK",
      message: "Data has been successfully deleted from database",
      user_id: user_id,
    });
  });
});

module.exports = router;
