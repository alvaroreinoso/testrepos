const { User, Team, Brokerage, Customer, CustomerLocation } = require('./models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Find all users with their associated tasks
// Raw SQL: SELECT * FROM "Users" JOIN "Tasks" ON "Tasks"."userId" = "Users".id;

const findTeamsWithUsers = async () => {
    const teams = await Team.findAll({
        include: [{
            model: User
        }]
    });
    console.log("All teams with their associated users:", JSON.stringify(teams, null, 4));
}



const findCustomersWithLocations = async () => {
    const customers = await Customer.findAll({
        include: [{
            model: CustomerLocation
        }]
    });
    console.log("All brokerages with their associated teams:", JSON.stringify(customers, null, 4));
}

const run = async () => {
    await findCustomersWithLocations()
    await process.exit()
}

run()