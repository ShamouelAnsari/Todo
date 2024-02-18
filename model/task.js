let { Task } = require('../schema/task');
let joi = require('joi');
let { validate } = require('../helper/validate');
let { sequelizeCon, QueryTypes } = require('../intit/dbconfig');

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

async function detailTask(taskId, params, userData){
    
    // user data validation
    let schema = joi.object({
        id: joi.number().required()
    })

    let joiParams = {...params}
    joiParams["id"] = taskId;

    let check = await validate(schema, joiParams).catch((error)=>{return {error}})
    if(!check||(check && check.error)){
        return {error: check.error, status: 500}
    }

    // create sql query
    let sqlQuery = `SELECT task.name as taskName, task.description as taskDescription,
    u1.name as createdBy, u2.name as updatedBy, u3.name as assignTo from task
    left join user as u1 on task.createdBy = u1.id
    left join user as u2 on task.updatedBy = u2.id
    left join user as u3 on task.assignTo = u3.id
    where task.id = :taskID and (task.createdBy = :userID or task.assignTo = :userID);`

    // fetch data from db
    let data = await sequelizeCon.query(sqlQuery,{
        type: QueryTypes.SELECT,
        replacements: {taskID: taskId, userID: userData.id}
    }).catch((error)=>{return {error}})
    if(!data||(data&&data.error)){
        return {error:"Task not found", status:404}
    }

    // return response
    return {data:data}

}

module.exports = { createTask, updateTask, listTask, detailTask }