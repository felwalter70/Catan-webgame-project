const userService = require("../services/userService");
const emailService = require("../services/emailService");
const utils = require("../utils/common");
const crypto = require("crypto");
const argon2 = require("argon2");

function renderLogin(req, res) {
    const { aviso } = req.query;
    let avisoMessage = '';

    if (aviso == 1) avisoMessage = "Email ou senha inválidos";
    else if (aviso == 2) avisoMessage = "";
    else if (aviso == 3) avisoMessage = "Usuário cadastrado com sucesso";
    else if (aviso == 4) avisoMessage = "Houve um erro inesperado durante o processo";

    req.session.tempEmail = null;
    req.session.tempSenha = null;
    req.session.tempName = null;

    res.render("loginCadastro", {login: true, aviso: avisoMessage});
};

function renderCadastro(req, res) {
    const { aviso } = req.query;
    let avisoMessage = '';

    if (aviso == 1) avisoMessage = "Os campos não foram devidamente preenchidos ou senhas não coincidem";
    else if (aviso == 2) avisoMessage = "O email já foi cadastrado";
    else if (aviso == 3) avisoMessage = "O código de confirmação está incorreto";
    else if (aviso == 4) avisoMessage = "Houve um erro inesperado durante o processo";

    res.render("loginCadastro", {cadastro: true, aviso: avisoMessage});
}

async function reenviarCodigo(req, res) {
    if (req.session.tempEmail && req.session.tempSenha && req.session.tempName) {
        try {
            await userService.deleteRequestByEmail(req.session.tempEmail);
    
            if (!(await userService.getUserByEmail(req.session.tempEmail))) {
                const intConfirm = crypto.randomInt(0, 1000000);
                const codigoConfirm = Number(intConfirm.toString().padStart(6, '0'));
        
                emailService.enviaEmailConfirmacao(codigoConfirm, req.session.tempEmail);
        
                await userService.insertUserConfirmRequest(codigoConfirm, req.session.tempName, req.session.tempEmail, req.session.tempSenha);
                res.render("loginCadastro", {confirmEmail: true, urlConfirm: "/user/concluirCadastro"});
            }
            else {
                res.redirect("/user/catanCadastro?aviso=2");
            }
    
        } catch (erro) {
            res.redirect("/user/catanCadastro?aviso=4");
        }
    }
}

async function cadastrarUser(req, res) {
    const nome = req.body.username;
    const email = req.body.email;
    const senha = req.body.senha;
    const senhaConfirmacao = req.body.senhaConfirmacao;

    try {
        if (!(utils.isEmpty([nome, email, senha, senhaConfirmacao])) && (senhaConfirmacao == senha)) {
            if (!(await userService.getUserByEmail(email))) {
                const senhaHash = await argon2.hash(senha);

                req.session.tempEmail = email;
                req.session.tempName = nome;
                req.session.tempSenha = senhaHash

                const intConfirm = crypto.randomInt(0, 1000000);
                const codigoConfirm = Number(intConfirm.toString().padStart(6, '0'));

                emailService.enviaEmailConfirmacao(codigoConfirm, email);

                await userService.insertUserConfirmRequest(codigoConfirm, nome, email, senhaHash);
                res.render("loginCadastro", {confirmEmail: true, urlConfirm: "/user/concluirCadastro"});
            }
            else {
                res.redirect("/user/catanCadastro?aviso=2");
            }
        }
        else {
            res.redirect("/user/catanCadastro?aviso=1");
        }

    } catch (erro) {
        console.error(erro);
    }
}

async function concluirCadastro(req, res) {
    try {
        await userService.cleanConfirmRequests();

        const codigoConfirm = req.body.confirmCode;
        const requestInfos = await userService.getRequestInfos(codigoConfirm);
    
        if (requestInfos && !(await userService.getUserByEmail(requestInfos.email))) {
            userService.deleteRequestByEmail(requestInfos.email);

            await userService.insertUserCadastro(requestInfos);
            res.redirect("/user/catanLogin?aviso=3");
        }
        else {
            res.redirect("/user/catanCadastro?aviso=3");
        }

    } catch (erro) {
        res.redirect("/user/catanCadastro?aviso=4");
    }

}

async function logarUser(req, res) {
    try {
        const email = req.body.email;
        const senha = req.body.senha;
    
        const user = await userService.getUserByEmail(email);

        if (!user) {
            res.redirect("/user/catanLogin?aviso=1");
        }

        const isEqual = await argon2.verify(user.senha, senha);
    
        if (isEqual) {
            req.session.user = user;
    
            console.log("Session.user => ", req.session.user);
    
            res.redirect("/lobby/main");
        }
        else {
            res.redirect("/user/catanLogin?aviso=1");
        }
    } catch (erro) {
        console.error(erro);

        res.redirect("/user/catanLogin?aviso=4");
    }
}

module.exports = {
    renderLogin,
    renderCadastro,
    cadastrarUser,
    concluirCadastro,
    logarUser,
    reenviarCodigo
}