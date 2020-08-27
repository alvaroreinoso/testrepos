require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const Lane = sequelize.define('lane', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    customer_location_id: DataTypes.INTEGER,
    lane_partner_location_id: DataTypes.INTEGER,
    truck_type: DataTypes.STRING,
    customer_is_shipper: DataTypes.BOOLEAN
}, {
    timestamps: false
})

module.exports = Lane;

// async function myFunc() {
//     await Lane.findAll()
//     console.log 
// }


// const getLanes = async () => {
//     const results = await Lane.findAll()
//     console.log(results)
// }

// console.log(getLanes())

// const testLane = Lane.build({
//     customer_location_id: 1,
//     lane_partner_location_id: 2,
//     truck_type: 'Big',
//     customer_is_shipper: true
// })

// console.log(testLane)

// testLane.save()