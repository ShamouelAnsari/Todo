let { User } = require('../schema/user')
let joi = require('joi')
let bcrypt = require('bcrypt')

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

async function login(register) {

}

async function logout(userData) {

}

module.exports = { register, login, logout }