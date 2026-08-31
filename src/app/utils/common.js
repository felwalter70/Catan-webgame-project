const crypto = require("crypto");

/**
 * Verifica se uma das variáveis dentro de um array está vazia / nula
 * @param {Array} vInfos - Array com variáveis de diferentes tipos primitivos 
 * @returns True caso alguma das variáveis seja vazia / nula, false caso todas possuam valor
 */
function isEmpty(vInfos) {
    let flag = false;

    for (let i = 0; i < vInfos.length; i++) {
        const infoType = typeof(vInfos[i]);

        if (infoType == "string" && (vInfos[i].trim()) == "") {
            flag = true;
            break;
        }
    }

    return flag;
}

/**
 * Gera uma sequência de 6 números inteiros para emails de confirmação
 * @returns {string} Uma string de 6 dígitos inteiros
 */
function geraCodigoConfirmEmail() {
    const intConfirm = crypto.randomInt(0, 1000000);
    const codigoConfirm = Number(intConfirm.toString().padStart(6, '0'));

    return codigoConfirm;
}

function geraTokenCSFR() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    isEmpty,
    geraTokenCSFR,
    geraCodigoConfirmEmail
}