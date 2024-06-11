let {sequelizeCon, Model, DataTypes} = require("../intit/dbconfig")

class Comment extends Model {}

Comment.init({
    id:{
        type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true
    },
    comment:{
        type: DataTypes.STRING(500),allowNull:false
    },
    createdBy:{
        type: DataTypes.INTEGER, allowNull: false
    },
    taskID:{
        type: DataTypes.INTEGER, allowNull: false
    }
},{tableName:"comment",modelName:"Comment",sequelize:sequelizeCon})

// Comment.sync()

module.exports = {Comment}