const { func } = require('joi')
let task = require('../model/task')

async function createTask(req, res) {
    let data = await task.createTask(req.body, req.userData).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : 'Controller Internal server error'
        let status = (data && data.status) ? data.status : 500
        return res.status(status).send({ error })
    }
    return res.send({ status: 'Task Created Successfully' })
}

async function updateTask(req, res) {
    let data = await task.updateTask(req.params.taskId, req.body, req.userData).catch((error) => { return { error } })
    console.log("controller data", data);
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : " Controller Internal server error"
        let status = (data && data.status) ? data.status : 500;
        return res.status(status).send({ error })
    }
    return res.send({ data: data.data })
}

async function listTask(req, res) {
    let data = await task.listTask(req.body, req.userData).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : " Internal SErver Error"
        let status = (data && data.status) ? data.status : 500
        return res.status(status).send({ error })
    }
    return res.send({ data: data.data })
}

async function detailTask(req,res){
    let data = await task.detailTask(req.params.taskId, req.body,req.userData).catch((error)=>{return {error}})
    if(!data || (data&& data.error)){
        let error = (data && data.error) ? data.error : "Internal server error"
        let status = (data && data.status) ? data.status : 500;
        return res.status(status).send({ error })
    }
    return res.send({ data: data.data })
}

module.exports = { createTask, updateTask, listTask ,detailTask}