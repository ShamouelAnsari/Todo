let { Task } = require('../schema/task');
let joi = require('joi');
let { validate } = require('../helper/validate');

async function createTask(params, userData) {
    let schema = joi.object({
        taskName: joi.string().required(),
        taskDescription: joi.string().required(),
        expectedStartDate: joi.date().iso().required(),
        expectedEndDate: joi.date().iso().required()
    })

    // user data validation
    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // data format
    let data = {
        name: params.taskName,
        description: params.taskDescription,
        expectedStartDate: params.expectedStartDate,
        expectedEndDate: params.expectedEndDate,
        createdBy: userData.id
    }

    // insert data into db
    let insert = await Task.create(data).catch((error) => { return { error } })
    if (!insert || (insert && insert.error)) {
        return { error: "Task not created", status: 500 }
    }

    return { data: insert }
}

async function updatetask(taskId, params, userData) {

    // user data validation
    let schema = joi.object({
        id: joi.number().required(),
        taskName: joi.string().min(5).max(155),
        startDate: joi.date().iso(),
        endDate: joi.date().iso(),
        expectedStartDate: joi.date().iso(),
        expectedEndDate: joi.date().iso()
    })

    let joiParams = { ...params }
    joiParams["id"] = params.taskId

    let check = await validate(schema, params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if taskId/task exists in DB
    let task = await Task.findOne({ where: { id: taskId, isDeleted: false } }).catch((error) => { return { error } })
    if (!task || (task && task.error)) {
        return { error: "Task not found", status: 404 }
    }

    // check if task is created by the user
    if (userData.id != task.createdBy) {
        return { error: "Access Denied", status: 403 }
    }

    // data formatting
    let data = {}
    if (params.taskName) { data["name"] = params.taskName }
    if (params.taskDescription) { data["description"] = params.taskDescription }
    if (params.startDate) { data["startDate"] = params.startDate }
    if (params.endDate) { data["endDate"] = params.endDate }
    if (params.expectedStartDate) { data["expectedStartDate"] = params.expectedStartDate }
    if (params.expectedEndDate) { data["expectedEndDate"] = params.expectedEndDate }

    // insert data into db
    let update = await Task.update(data, { where: { id: taskId } }).catch((error) => { return { error } })
    if (!update || (update && update.error)) {
        return { error: "Task not updated", status: 500 }
    }

    // return response
    return { data: update }
}

module.exports = { createTask, updatetask }