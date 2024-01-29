let mailer = require('nodemailer')

let transport = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: "465",
    secure: true,
    auth: {
        user: 'ansarishamouel03@gmail.com',
        pass: 'vdor xbvt zmxx kxov'
    }
});

module.exports = { transport }