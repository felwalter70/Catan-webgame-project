function isEmpty(vInfos) {
    let flag = 0;

    for (let i = 0; i < vInfos.length; i++) {
        const infoType = typeof(vInfos[i]);

        if (infoType == "string" && (vInfos[i].trim()) == "") {
            flag = 1;
            break;
        }
    }

    return flag;
}

function geraTokenCSFR() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    isEmpty,
    geraTokenCSFR
}