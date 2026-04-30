const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviaEmailConfirmacao(confirmCode, emailDestinatario) {
    return await transporter.sendMail({
        from: 'onboarding@resend.dev',
        to: "felwalter70@gmail.com",
        subject: "Código de confirmação",
        text: `Olá ${emailDestinatario}!\n\nAqui está seu código de confirmação para sua nova conta no CATAN: ${confirmCode}.`
    });
}

module.exports = {
    enviaEmailConfirmacao
}