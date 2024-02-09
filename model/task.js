let { Task } = require('../schema/task')
let joi = require('joi')
let { validate } = require('../helper/validate')

async function createTask(params, userData) {
    let schema = joi.object({
        name: joi.string().required(),
        description: joi.string().required(),
        expectedEndDate: joi.date().iso().required()
    })

    // user data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // data format
    let data = {
        name: params.name,
        description: params.description,
        expectedEndDate: params.expectedEndDate,
        createdBy: userData.id
    }

    // insert data into db
    let insert = await Task.create(data).catch((error) => { return { error } })
    if (!insert || (insert && insert.error)) {
        return { error: "Task not created successfully", status: 500 }
    }

    return { data: 'Success' }
}

module.exports = { createTask }