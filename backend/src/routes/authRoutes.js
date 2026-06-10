const express = require("express");
const router = express.Router();

const {
  login,
  studentLogin,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/student-login", studentLogin);

module.exports = router;