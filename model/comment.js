let { Comment } = require("../schema/comment")
let { Task } = require("../schema/task")
let joi = require("joi")
let { validate } = require("../helper/validate")

async function addComment(taskId, params, userData) {
    // user data validation
    let schema = joi.object({
        id: joi.number().required(),
        taskComment: joi.string().required()
    })

    let joiParams = { ...params }
    joiParams["id"] = taskId

    let check = await validate(schema, joiParams).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 500 }
    }

    // check if task exists 
    let task = await Task.findOne({ where: { id: taskId } }).catch((error) => { return { error } })
    if (!task || (task && task.error)) {
        return { error: "Task not found", status: 404 }
    }

    // check if the task is assignTo or Created by the login user
    if (userData.id != task.assignTo && userData.id != task.createdBy) {
        return { error: "task not assign or created by the login user", status: 403 }
    }

    // check if task is active 
    if (task.idActive == false) {
        return { error: "Task is not Active", status: 400 }
    }

    // check if task is not deleted
    if (task.isDeleted == true) {
        return { error: "Task is deleted", status: 400 }
    }

    // format data
    let data = {
        taskID: taskId,
        comment: params.taskComment,
        createdBy: userData.id
    }

    // insert data into db
    let insert = await Comment.create(data).catch((error) => { return { error } })
    if (!insert || (insert && insert.error)) {
        return { error: "Comment not inserted", status: 400 }
    }

    // return response
    return { data: insert }
}

async function listComment(taskId, userData) {
    // user data validation
    let schema = joi.object({
        id: joi.number().required()
    })

    let joiParams = {}
    joiParams["id"] = taskId

    let check = await validate(schema, joiParams).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error, status: 400 }
    }

    // check if task exists
    let task = await Task.findOne({ where: { id: taskId } }).catch((error) => { return { error } })
    if (!task || (task && task.erro)) {
        return { error: "Task not found", status: 404 }
    }

    // check if task is assign to or created by the login user
    if (task.assignTo != userData.id && task.createdBy != userData.id) {
        return { error: "Task is not assign or created by the login user", status: 403 }
    }

    // check if comment is done by or created by the login user
    // let comment = await Comment.findOne({ where: { createdBy: userData.id } }).catch((error) => { return { error } })
    // if (!comment || (comment && comment.error)) {
    //     return { error: "Comment not created or updated by the login user", status: 403 }
    // }

    // let respone = {
    //     taskID: comment.taskID,
    //     commentID: comment.id,
    //     taskComment: comment.comment,
    //     commentCreatedBy: comment.createdBy
    // }

    // return response
    // return { data: respone }

    // check if task is not deleted and task is Active
    if (task.isDeleted != false && task.idActive != true) {
        return { error: "Task is deleted OR task is not Active", status: 404 }
    }

    let list = await Comment.findAll({where:{taskID: taskId}}).catch((error)=>{return {error}})
    if(!list || (list && list.error)){
        return {error:"Internal Server Error",status: 500}
    }

    // return list
    return { data: list }
}

module.exports = { addComment, listComment }