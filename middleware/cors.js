// middleware daal

let cors = require('cors')

let corsObj = {
    origin:(domain,cb)=>{
        let whiteList={
            'abc.com':true,
            'abc.co.in':true,
            'microsoft.com':true,
            'google.com':true
        }

        if(!whiteList[domain]){
            return cb('data not found',false)
        }
        return cb(null,true)
    }
}

module.exports = cors