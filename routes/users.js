var express = require("express");
var router = express.Router();
var db = require("../config/database");
var bodyParser = require("body-parser");

// Menampilkan data dari database
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
        "failed to enter data into the database, please enter the appropriate nama, alamat and nohp",
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
      id: results.insertId,
    });
  });
});
module.exports = router;
