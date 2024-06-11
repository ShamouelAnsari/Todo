let express = require('express')
let config = require('config')
let router = require('./routes')
const corsObj = require('./middleware/cors')
let port = config.get('port')
let app = express()
let cors = require('cors')
// cors import
// let cors = require('./middleware/cors')

app.use(cors(corsObj))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)
// cors using middleware
// app.use(cors)

app.listen(port, () => {
    console.log(`~~Connected to port ${port}~~`)
})