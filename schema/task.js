let { sequelizeCon, Model, DataTypes } = require('../intit/dbconfig')

class Task extends Model { }

Task.init({
    // schema
    id: {
        type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true
    },
    name: {
        type: DataTypes.STRING, allowNull: false
    },
    description: {
        type: DataTypes.STRING, allowNull: false
    },
    startDate: {
        type: DataTypes.DATE, allowNull: true
    },
    endDate: {
        type: DataTypes.DATE, allowNull: true
    },
    expectedStartDate: {
        type: DataTypes.DATE, allowNull: true
    },
    expectedEndDate: {
        type: DataTypes.DATE, allowNull: true
    },
    assignTo: {
        type: DataTypes.INTEGER, allowNull: true
    },
    status: {
        type: DataTypes.TINYINT, allowNull: true
    },
    idActive: {
        type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false
    },
    isDeleted: {
        type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER, allowNull: true
    },
    updatedBy: {
        type: DataTypes.INTEGER, allowNull: true
    }

}, {
    // configuration option
    tableName: "task", modelName: "Task", sequelize: sequelizeCon
})

// if table gets deleted just run this line onces it will get created
// Task.sync()

module.exports = { Task }