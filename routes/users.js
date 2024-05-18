var express = require("express");
var router = express.Router();
var db = require("../config/database");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const { generateToken } = require("../middleware/verify-token");
const { authenticateToken } = require("../middleware/verify-token");

// // Route Login User
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Memeriksa apakah email dan password diinputkan
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      code: 400,
      status: "Bad Request",
      message: "Please provide both email and password for login",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({
        success: false,
        code: 500,
        status: "Server Error",
        message: "Internal Server Error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        code: 401,
        status: "Bad Request",
        message:
          "Account not Found. Make sure the email and password are correct",
      });
    }

    const user = results[0];

    // Memeriksa apakah password cocok
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    console.log("Input Password:", password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isPasswordMatch);

    if (isPasswordMatch) {
      // Jika otentikasi berhasil, generate token
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        code: 200,
        status: "OK",
        message: "Login Successful",
        userId: user.user_id,
        username: user.username,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        code: 401,
        status: "Bad Request",
        message: "Incorrect Password",
      });
    }
  });
});

// Route untuk signup user
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Periksa apakah email, username, dan password telah diinputkan
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        code: 400,
        status: "Bad Request",
        message: "Please provide email, username, and password.",
      });
    }

    // Periksa apakah email mengandung karakter '@'
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        code: 400,
        status: "Bad Request",
        message: "Invalid email format. Please use a valid email address.",
      });
    }

    // Periksa apakah email sudah ada di database
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(
      checkEmailQuery,
      [email],
      async (checkEmailErr, checkEmailResult) => {
        if (checkEmailErr) {
          console.error("Error checking email:", checkEmailErr);
          return res.status(500).json({
            success: false,
            code: 500,
            status: "Server Error",
            message: "Internal Server Error",
          });
        }

        // Jika email sudah ada, beri respons
        if (checkEmailResult.length > 0) {
          return res.status(400).json({
            success: false,
            code: 400,
            status: "Bad Request",
            message: "Email already exists. Please use a different email.",
          });
        }

        // Periksa panjang password
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            code: 400,
            status: "Bad Request",
            message: "Password should be at least 8 characters long.",
          });
        }

        // Hash password sebelum menyimpan ke database
        const hashedPassword = bcrypt.hashSync(password, 10);

        const createdat = new Date();

        // Query untuk insert user baru ke database dengan createdat
        const insertUserQuery =
          "INSERT INTO users (email, username, password, createdat) VALUES (?, ?, ?, ?)";
        db.query(
          insertUserQuery,
          [email, username, hashedPassword, createdat],
          (insertErr, result) => {
            if (insertErr) {
              console.error("Error during user registration:", insertErr);
              return res.status(500).json({
                success: false,
                code: 500,
                status: "Server Error",
                message: "Internal Server Error",
              });
            }

            if (result.affectedRows > 0) {
              return res.status(200).json({
                success: true,
                code: 200,
                status: "OK",
                message: "User Registered Successfully",
              });
            } else {
              return res.status(500).json({
                success: false,
                code: 500,
                status: "Server Error",
                message: "Failed to Register User",
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      success: false,
      code: 500,
      status: "Server Error",
      message: "Internal Server Error",
    });
  }
});

// Show all data from database
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error("Error in MySQL query: " + error.message);
      res.status(500).send("Error in MySQL query");
      return;
    }
    res.json({
      success: true,
      code: "200",
      status: "OK",
      message: "Success display data",
      data: results,
    });
  });
});

// Insert data to database
router.post("/", authenticateToken, (req, res) => {
  const { nama, alamat, nohp } = req.body;

  // periksa apakah yang diinputkan sesuai
  if (!nama || !alamat || !nohp) {
    return res.status(400).json({
      success: false,
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
      success: true,
      code: "201",
      status: "OK",
      message: "Data has been successfully added to the database",
      user_id: results.insertId,
    });
  });
});

// kueri untuk update data dari database
router.put("/:id", authenticateToken, (req, res) => {
  const user_id = req.params.id;
  const { nama, alamat, nohp } = req.body;

  // Periksa apakah data yang diterima sesuai
  if (!nama || !alamat || !nohp) {
    return res.status(400).json({
      success: false,
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
      success: true,
      code: "200",
      status: "OK",
      message: "Data has been successfully update to the database",
      user_id: user_id,
    });
  });
});

// Rute untuk menghapus data dari database
router.delete("/:id", authenticateToken, (req, res) => {
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
      success: true,
      code: "200",
      status: "OK",
      message: "Data has been successfully deleted from database",
      user_id: user_id,
    });
  });
});

module.exports = router;
