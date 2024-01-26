let { sequelizeCon, Model, DataTypes } = require('../intit/dbconfig')

class User extends Model { }

User.init({
    // schema
    id: {
        type: DataTypes.INTEGER, auto_increment: true, allowNull: false, primaryKey: true
    },
    name: {
        type: DataTypes.STRING(155), allowNull: false
    },
    emailID: {
        type: DataTypes.STRING(255), allowNull: false, unique: true
    },
    password: {
        type: DataTypes.STRING(300), allowNull: false
    },
    otp: {
        type: DataTypes.STRING(300), allowNull: true
    },
    token: {
        type: DataTypes.STRING(500)
    },
    isDeleted: {
        type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false
    },
    idActive: {
        type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false
    },
    updatedBy: {
        type: DataTypes.INTEGER, allowNull: true
    }
}, {
    // configuration option
    tableName: "user", modelName: "User", sequelize: sequelizeCon
})

// if table gets deleted just run this line onces it will get created
// User.sync()

module.exports = { User }