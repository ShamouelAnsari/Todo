let { transport } = require("../intit/mailconfig");

async function sendMail() {
    // if(typeof(to)!='string' || typeof(from)!='string'){
    //     return {error:"Please provide to and from email in string"}
    // }
    let send = await transport.sendMail({
        to: "ansarishamouel01@gmail.com",
        from: "ansarishamouel03@gmail.com",
        subject: "otp generation",
        text: "Assaalamu alaikum"
    }).catch((error) => { return { error } })
    if (!send || (send && send.error)) {
        return { error: send.error }
    }
    return { data: send }
}

module.exports = { sendMail }