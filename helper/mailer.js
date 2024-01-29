let {transport} = require("../intit/mailconfig");

async function sendMail(){
    let send = await transport.sendMail({
        to:"ansarishamouel01@gmail.com",
        from:"ansarishamouel03@gmail.com",
        subject:"otp generation",
        text: "Assaalamu alaikum"
    }).catch((error)=>{return {error}})
    if(!send||(send&&send.error)){
        return {error:send.error}
    }
    return {data:send}
}

module.exports={sendMail}