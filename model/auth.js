let { User } = require('../schema/user')
let joi = require('joi')
let bcrypt = require('bcrypt')
let security = require('../helper/security')
let {sendMail} = require('../helper/mailer')

async function register(params) {

    // used data validation
    let check = await validateRegister(params).catch((error) => { return { error } })
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

async function validateRegister(data) {
    let schema = joi.object({
        username: joi.string().min(2).max(155).required(),
        email: joi.string().max(255).email().required(),
        password: joi.string().min(8).max(16).required()
    })

    let valid = await schema.validateAsync(data, { abortEarly: false })
        .catch((error) => { return { error } })

    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }
    return { data: valid }

}

async function login(params) {
    // user data validation
    let check = await validateLogin(params).catch((error) => { return { error } })
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
    let  token = await security.signAsync({ id: user.id }).catch((error) => { return { error } })
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

async function validateLogin(data) {
    let schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(8).max(12).required()
    })

    let valid = schema.validateAsync(data, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }
    return { data: valid }

}

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


async function forgetPassword(params){
    // user data validation
    let check = await validateforgetPassword(params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }
    

    // check if email exits
    let user = await User.findOne({ where: { emailID: params.email } }).catch((error) => { return { error } })
    if (!user || (user && user.error)) {
        return { error: 'User not found', status: 404 }
    }
    
    // generate opt
    // uppar banaya hu
    
    // hash opt
    let otp = await bcrypt.hash(a, 10).catch((error) => { return { error } })
    if (!otp || (otp && otp.error)) {
        return { error: "hash otp error", status: 500 }
    }
    

    // save hash opt in db
    let update = await User.update({ otp }, { where: { id: user.id } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: 'opt not updated', status: 500 }
    }
    

    // send mail to user (later last me karenge)
    let mail = await sendMail().catch((error)=>{return{error}})
    if(!mail||(mail&&mail.error)){
        return{error:"mail Internal server error",status:500}
    }
    

    // return response
    return {data:mail}
}

async function validateforgetPassword(data){
    let schema = joi.object({
        email: joi.string().email().required()
    })

    let valid = schema.validateAsync(data, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }
    return { data: valid }
}

async function logout(userData) {

}

module.exports = { register, login, logout ,forgetPassword}