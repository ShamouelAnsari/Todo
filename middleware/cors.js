let corsObj = {
    origin:(domain,cb)=>{
        let whiteList={
            // 'abc.com':true,
            // 'abc.co.in':true,
            // 'microsoft.com':true,
            // 'google.com':true
            "http://localhost:3000": true
        }

        if(!whiteList[domain]){
            return cb('domain not found',false)
        }
        return cb(null,true)
    }
}

module.exports = corsObj