const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviaEmailConfirmacao(confirmCode, emailDestinatario) {
    return await transporter.sendMail({
        from: '"Catan App" <no-reply@catan.com>',
        to: emailDestinatario,
        subject: "Código de confirmação",
        text: `Aqui está seu código de confirmação para sua nova conta no CATAN: ${confirmCode}`
    });
}

module.exports = {
    enviaEmailConfirmacao
}