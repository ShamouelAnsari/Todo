let mailer = require('nodemailer')
let config = require('config')
let mailCredential = config.get("mailCredential")

let transport = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: "465",
    secure: true,
    auth: mailCredential
});

module.exports = { transport }