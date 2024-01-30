async function validate(schema,data){
    // if(typeof(schema)!='object'||typeof(data)!='object'){
    //     return {error:"Provde schema and data in object"}
    // }

    let valid = schema.validateAsync(data, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }
    return { data: valid }
}

module.exports = {validate}