const express = require("express");
const router = express.Router();
const lobbyController = require("../controllers/lobbyController");

router.get("/main", lobbyController.renderLobby);

module.exports = router;