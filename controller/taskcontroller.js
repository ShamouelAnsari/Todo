let task = require('../model/task')

async function createTask(req, res) {
    let data = await task.createTask(req.body, req.userData).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : 'Controller Internal server error'
        let status = (data && data.status) ? data.status : 500
        return res.status(status).send({ error })
    }
    return res.send({ status: 'Task created succesfully' })
}

module.exports = { createTask }