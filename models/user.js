require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

// try {
//     sequelize.authenticate();
//     console.log('Connection has been established successfully.');
// } catch (error) {
//     console.error('Unable to connect to the database:', error);
// }

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: DataTypes.STRING,
    brokerage_id: DataTypes.INTEGER,
    team_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    email: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.STRING,
}, {
    timestamps: false
})


// User.sync({ alter: true })

const jerry = User.build({
    username: 'test',
    brokerage_id: 1,
    team_id: 2,
    title: 'exec',
    email: 'test@gmail.com',
    first_name: 'jerry',
    last_name: 'oates',
    phone: '901-299-1109'
})

module.exports = User;