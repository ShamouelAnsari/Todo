let { transport } = require("../intit/mailconfig");
async function sendMail(params) {
    if(typeof(params.to)!='string' || typeof(params.from)!='string'){
        return {error:"Please provide to and from email in string"}
    }
    let send = await transport.sendMail(params).catch((error) => { return { error } })
    if (!send || (send && send.error)) {
        return { error: send.error }
    }
    return { data: send }
}

module.exports = { sendMail }