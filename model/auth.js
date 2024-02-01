let { User } = require('../schema/user')
let joi = require('joi')
let bcrypt = require('bcrypt')
let security = require('../helper/security')
let { sendMail } = require('../helper/mailer')
let { validate } = require('../helper/validate')
let config = require('config')
let mailCredential = config.get("mailCredential")

async function register(params) {
    let schema = joi.object({
        username: joi.string().min(2).max(155).required(),
        email: joi.string().max(255).email().required(),
        password: joi.string().min(8).max(16).required()
    })

    // used data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if user exits
    let user = await User.findOne({ where: { emailID: params.email } }).catch((error) => { return { error } })
    if (user) {
        return { error: 'User already exists', status: 409 }
    }

    // hash password
    let password = await bcrypt.hash(params.password, 10).catch((error) => { return { error } })
    if (!password || (password && password.error)) {
        return { error: "hash password error", status: 500 }
    }

    // data formatting
    let data = {
        name: params.username,
        emailID: params.email,
        password: password
    }

    // inserting into database
    let insert = await User.create(data).catch((error) => { return { error } })
    if (!insert || (insert && insert.error)) {
        return { error: 'Insert error', status: 500 }
    }

    // return only minimum response
    let response = {
        id: insert.id,
        username: insert.name,
        email: insert.emailID
    }

    return { data: response }

    // return all response
    // return {data:insert}
}

async function login(params) {
    let schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(8).max(12).required()
    })

    // user data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if user email exists in db
    let user = await User.findOne({ where: { emailID: params.email } }).catch((error) => { return { error } })
    if (!user || (user && user.error)) {
        return { error: 'User not found', status: 404 }
    }

    // check if user password  exits in db (compare)
    let compare = await bcrypt.compare(params.password, user.password).catch((error) => { return { error } })
    if (!compare || (compare && compare.error)) {
        return { error: 'User Email and Password invalid ', status: 403 }
    }

    // generate token
    let token = await security.signAsync({ id: user.id }).catch((error) => { return { error } })
    if (!token || (token && token.error)) {
        return { error: 'token internal server error', status: 500 }
    }

    // save toke in db
    let update = await User.update({ token }, { where: { id: user.id } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: 'User not login Please try again', status: 500 }
    }

    // return token in respones.header
    return { token }
}

// otp generation
function generateOTP(length = 6) {
    let output = '';
    const possibleDigits = '0123456789';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * possibleDigits.length);
        output += possibleDigits.charAt(randomIndex);
    }

    return output;
}

let a = generateOTP()

async function forgetPassword(params) {
    let schema = joi.object({
        email: joi.string().email().required()
    })

    // user data validation
    let check = await validate(schema, params.email).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if email exits
    let user = await User.findOne({ where: { emailID: params.email } }).catch((error) => { return { error } })
    if (!user || (user && user.error)) {
        return { error: 'User not found', status: 404 }
    }

    // generate opt
    let otp = a

    // hash opt
    let hash = await bcrypt.hash(otp, 10).catch((error) => { return { error } })
    if (!hash || (hash && hash.error)) {
        return { error: "hash otp error", status: 500 }
    }

    // save hash opt in db
    let update = await User.update({ otp: hash }, { where: { id: user.id } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: 'opt not updated', status: 500 }
    }

    // send mail to user (later last me karenge)
    let mailSend = {
        to: params.email,
        from: mailCredential.user,
        subject: "Forget Password",
        text: `Otp for resetting password is ${otp}`
    }

    let mail = await sendMail(mailSend).catch((error) => { return { error } })
    if (!mail || (mail && mail.error)) {
        return { error: "mail Internal server error", status: 500 }
    }

    // return response
    return { data: mail }
}

async function resetPassword(params) {
    let schema = joi.object({
        otp: joi.string().min(4).max(6).required(),
        email: joi.string().max(255).required(),
        password: joi.string().min(8).max(12).required(),
    })

    // user data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 500 }
    }

    // check if email exists
    let user = await User.findOne({ where: { emailID: params.email } }).catch((error) => { return { error } })
    if (!user || (user && user.error)) {
        return { error: 'User not found email does not exists', status: 500 }
    }

    // compare otp
    let compare = await bcrypt.compare(params.otp, user.otp).catch((error) => { return { error } })
    if (!compare || (compare && compare.error)) {
        return { error: 'Otp not valid', status: 500 }
    }

    // hash password
    let password = await bcrypt.hash(params.password, 10).catch((error) => { return { error } })
    if (!password || (password && password.error)) {
        return { error: 'Internal server error', status: 500 }
    }

    // update password in db
    let update = await User.update({ password: password, otp: "" }, { where: { id: user.id } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: 'Password not updated', status: 500 }
    }

    // return response
    return { data: "Password updated sucessfully" }
}

async function logout(userData) {
    let schema = joi.object({
        id: joi.number().required()
    })

    let check = await validate(schema, { id: userData.id }).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    let update = await User.update({ token: "" }, { where: { id: userData.id } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: "Not Logout", status: 500 }
    }

    return { data: "Success" }

}

async function changePassword(params, userData) {
    let schema = joi.object({
        oldPassword: joi.string().min(8).max(12).required(),
        newPassword: joi.string().min(8).max(12).required(),
    })

    // user data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    console.log("check data: ", check)
    if (!check || (check && check.error)) {
        return { error: check.error, status: 500 }
    }
    // fetch user from db
    let user = await User.findOne({ where: { id: userData.id } }).catch((error) => { return { error } })
    console.log("user data: ", user)
    if (!user || (user && user.error)) {
        return { error: 'User not found email does not exists', status: 500 }
    }

    // enter old password for changing then compare old password from db
    let compare = await bcrypt.compare(params.oldPassword,user.password).catch((error)=>{return {error}})
    console.log("compare data: ",compare);
    if(!compare||(compare&&compare.error)){
        return {error:"Old password not match"}
    }

    // hash new password
    let password = await bcrypt.hash(params.newPassword, 10).catch((error) => { return { error } })
    console.log("password data", password);
    if (!password || (password && password.error)) {
        return { error: 'password not encryption error', status: 500 }
    }

    // update password in db
    let update = await User.update({ password, token: "" }, { where: { id: user.id } }).catch((error) => { return { error } })
    console.log("update data: ", update)
    if (!update || (update && update.error)) {
        return { error: 'Password not updated', status: 500 }
    }

    // return response
    return { data: "Password Updated sucessfully" }

}

module.exports = { register, login, forgetPassword, resetPassword, logout, changePassword }