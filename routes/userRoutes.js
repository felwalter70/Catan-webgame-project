const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/catanLogin", userController.renderLogin);
router.get("/catanCadastro", userController.renderCadastro);
router.post("/cadastrar", userController.cadastrarUser);
router.post("/concluirCadastro", userController.concluirCadastro);
router.post("/logar", userController.logarUser);
router.get("/reenviarCodigo", userController.reenviarCodigo);

module.exports = router;