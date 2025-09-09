const express = require("express");
const router = express.Router();
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");

router.post("/signup", authValidation.signUp, (req, res) => {
  authController.signUp(req, res);
});

router.post("/login", authValidation.login, (req, res) => {
  authController.login(req, res);
});

module.exports = router;
