const express = require("express");
const router = express.Router();
const loginController = require("../app/controllers/loginController");

router.get("/catanLogin", loginController.renderLogin);
router.get("/catanCadastro", loginController.renderCadastro);
router.post("/cadastrar", loginController.cadastrarUser);
router.post("/concluirCadastro", loginController.concluirCadastro);
router.post("/logar", loginController.logarUser);
router.get("/reenviarCodigo", loginController.reenviarCodigo);
router.get("/resetPassword", loginController.renderPasswordReset);
router.post("/confirmarEmailRecuperacao", loginController.enviarPasswordEmail);
router.post("/confirmEmail", loginController.confirmaEmailPasswordReset);
router.get("/renderAlteracaoPassword", loginController.renderAlteracaoPassword)
router.post("/alterarPassword", loginController.alterarUserPassword)

module.exports = router;