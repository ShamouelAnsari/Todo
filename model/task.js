let { Task } = require('../schema/task');
let joi = require('joi');
let { validate } = require('../helper/validate');
let { sequelizeCon, QueryTypes } = require('../intit/dbconfig');
let { sendMail } = require('../helper/mailer');
let { User } = require('../schema/user');
let config = require('config')
let mailCredential = config.get("mailCredential")

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

async function updateTask(taskId, params, userData) {

    // user data validation
    let schema = joi.object({
        id: joi.number().required(),
        taskName: joi.string(),
        startDate: joi.date().iso(),
        endDate: joi.date().iso(),
        expectedStartDate: joi.date().iso(),
        expectedEndDate: joi.date().iso()
    })

    let joiParams = { ...params };
    joiParams["id"] = taskId

    let check = await validate(schema, joiParams).catch((error) => { return { error } })
    console.log('check data', check);
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if taskId/task exists in DB
    let task = await Task.findOne({ where: { id: taskId, isDeleted: false } }).catch((error) => { return { error } })
    console.log('task data', task);
    if (!task || (task && task.error)) {
        return { error: "Task not found", status: 404 }
    }

    // check if task is created by the user
    if (userData.id != task.createdBy) {
        return { error: 'Access Denied', status: 403 }
    }

    // data formatting
    let data = {}
    if (params.taskName) { data["name"] = params.taskName };
    if (params.taskDescription) { data["description"] = params.taskDescription };
    if (params.startDate) { data["startDate"] = params.startDate };
    if (params.endDate) { data["endDate"] = params.endDate };
    if (params.expectedStartDate) { data["expectedStartDate"] = params.expectedStartDate };
    if (params.expectedEndDate) { data["expectedEndDate"] = params.expectedEndDate };

    // insert data into db
    let update = await Task.update(data, { where: { id: taskId } }).catch((error) => { return { error } })
    console.log('update data', update);
    if (!update || (update && update.error)) {
        return { error: "Task not updated", status: 500 }
    }

    // return response
    return { data: update }
}

async function listTask(params, userData) {

    // SQL Query
    let sqlQuery = `select task.name as taskName, user.name as createdBy
    from task 
    left join user on task.createdBy = user.id
    where task.createdBy = :userID or task.assignTo = :userID`;

    // create the sql query
    let task = await sequelizeCon.query(sqlQuery,
        {
            type: QueryTypes.SELECT,
            replacements: { userID: userData.id }
        }).catch((error) => { return { error } })
    if (!task || (task && task.error)) {
        return { error: 'Task not found', status: 404 }
    }

    // return response
    return { data: task }
}

async function detailTask(taskId, params, userData) {

    // user data validation
    let schema = joi.object({
        id: joi.number().required()
    })

    let joiParams = { ...params }
    joiParams["id"] = taskId;

    let check = await validate(schema, joiParams).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 500 }
    }

    // create sql query
    let sqlQuery = `SELECT task.name as taskName, task.description as taskDescription,
    u1.name as createdBy, u2.name as updatedBy, u3.name as assignTo from task
    left join user as u1 on task.createdBy = u1.id
    left join user as u2 on task.updatedBy = u2.id
    left join user as u3 on task.assignTo = u3.id
    where task.id = :taskID and (task.createdBy = :userID or task.assignTo = :userID);`

    // fetch data from db
    let data = await sequelizeCon.query(sqlQuery, {
        type: QueryTypes.SELECT,
        replacements: { taskID: taskId, userID: userData.id }
    }).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        return { error: "Task not found", status: 404 }
    }
    
    // return response
    return { data: data }
    
}

async function assignTask(params, userData) {
    
    // user data validation
    let schema = joi.object({
        taskID: joi.number().required(),
        userID: joi.number().required()
    })

    let check = await validate(schema, params).catch((error) => { return { error } })
    console.log('check data', check);
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if task exists in db
    let task = await Task.findOne({ where: { id: params.taskID } }).catch((error) => { return { error } })
    console.log("task data", task);
    if (!task || (task && task.error)) {
        return { error: "Task not found", status: 404 }
    }
    
    // check if task belongs to login user
    if (userData.id != task.createdBy) {
        return { error: "task is not created by the user", status: 403 }
    }

    // check if task exists and user is active or not
    if(task.isDeleted == true|| task.idActive == false){
        return {error: "task is deleted or user is not active", status: 403}
    }
    
    
    // check if user exists
    let assignUser = await User.findOne({ where: { id: params.userID, isDeleted: false ,idActive: true} }).catch((error) => { return { error } })
    console.log('User data', assignUser);
    if (!assignUser || (assignUser && assignUser.error)) {
        return { error: "User not found", status: 404 }
    }

    // data formatting
    let data = {
        status: 2,
        assignTo: params.userID,
        updatedBy: userData.id
    }

    // update it into db
    let update = await Task.update(data, { where: { id: params.taskID } }).catch((error) => { return { error } })
    console.log('update data', update);
    if (!update || (update && update.error)) {
        return { error: "Task not updated", status: 500 }
    }

    // mail formatting
    let mailSend = {
        to: assignUser.emailID,
        from: mailCredential.user,
        subject: "New Task",
        text: `A task has been assigned To you by ${task.name}. Description for the task is ${task.description}. 
        the task has been assigned by ${userData.name}.`
    }

    // send mail
    let mail = await sendMail(mailSend).catch((error) => { return { error } })
    if (!mail || (mail && mail.error)) {
        return { error: "mail Internal server error", status: 500 }
    }

    // return response
    return { data: update }
}

module.exports = { createTask, updateTask, listTask, detailTask, assignTask }