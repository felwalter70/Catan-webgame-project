const express = require('express');
const router = express.Router();

const loginRoutes = require('./loginRoutes');
const lobbyRoutes = require('./lobbyRoutes');
const userRoutes = require('./userRoutes');

router.use(loginRoutes);
router.use(lobbyRoutes);
router.use(userRoutes);

module.exports = router;