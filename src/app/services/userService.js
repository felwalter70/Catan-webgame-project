const pool = require("../../config/database");
const argon2 = require("argon2");
const crypto = require("crypto");

async function deleteRequestByEmail(email) {
    const deleteTableRequestQuery = "DELETE FROM confirm_requests WHERE email = ?";

    pool.execute(deleteTableRequestQuery, [email]);
}

async function cleanConfirmRequests() {
    const cleanTableRequestsQuery = "DELETE FROM confirm_requests WHERE expDate < NOW()";

    pool.execute(cleanTableRequestsQuery);
}

async function insertUserConfirmRequest(confirmCode, nome, email, senha) {
    const queryInsertUserRequest = "INSERT INTO confirm_requests (confirmCode, username, email, senha, expDate) VALUES (?, ?, ?, ?, ?)";
    let now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    const expDateFormatada = `${now.getFullYear().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const dados = [confirmCode, nome, email, senha, expDateFormatada];

    await cleanConfirmRequests();
    await pool.execute(queryInsertUserRequest, dados);
}

async function getUserByEmail(email) {
    const querySelectUserEmail = "SELECT * FROM users WHERE email = ?";

    const [ rows ] = await pool.execute(querySelectUserEmail, [email]);
    const user = rows[0];

    return user;
}

async function getRequestInfos(confirmCode) {
    const querySelectRequest = "SELECT * FROM confirm_requests WHERE confirmCode = ?";

    const [ rows ] = await pool.execute(querySelectRequest, [confirmCode]);
    const request = rows[0];

    return request;
}

async function insertUserCadastro(requestInfos) {
    const queryInsertUserCadastro = "INSERT INTO users (uuid, username, email, senha) VALUES (?, ?, ?, ?)";

    if (!(await getUserByEmail(requestInfos.email))) {
        const uuid = crypto.randomUUID();
        const dados = [uuid, requestInfos.username, requestInfos.email, requestInfos.senha];
    
        await pool.execute(queryInsertUserCadastro, dados);
    }
}

async function changeUserPassword(email, senhaHash) {
    const queryUpdateUserPassword = "UPDATE users SET senha = ? WHERE email = ?";

    await pool.execute(queryUpdateUserPassword, [senhaHash, email]);
}

module.exports = {
    getUserByEmail,
    insertUserCadastro,
    insertUserConfirmRequest,
    getRequestInfos,
    deleteRequestByEmail,
    cleanConfirmRequests,
    changeUserPassword
}