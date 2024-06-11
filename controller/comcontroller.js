let comment = require('../model/comment');

async function addComment(req, res) {
    let data = await comment.addComment(req.params.taskId, req.body, req.userData).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : 'Controller Internal server error'
        let status = (data && data.status) ? data.status : 500
        return res.status(status).send({ error })
    }
    return res.send(data)
}

async function listComment(req, res) {
    let data = await comment.listComment(req.params.taskId, req.body, req.userData).catch((error) => { return { error } })
    if (!data || (data && data.error)) {
        let error = (data && data.error) ? data.error : 'Controller Internal server error'
        let status = (data && data.status) ? data.status : 500
        return res.status(status).send({ error })
    }
    return res.send(data)
}

module.exports = { addComment, listComment }