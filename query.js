const { User, Team, Brokerage, Customer } = require('./models')
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

const findUsersWithCustomers = async () => {
    const teams = await User.findAll({
        include: [{
            model: Customer
        }]
    });
    console.log("All users with their associated customers:", JSON.stringify(teams, null, 4));
}

const findUsersWithTeams = async () => {
    const users = await User.findAll({
        include: [{
            model: Team,
            // model: Brokerage
        }]
    });
    console.log("All users with their associated teams and brokerage:", JSON.stringify(users, null, 4));
}

const findBrokeragesWithTeams = async () => {
    const brokerages = await Brokerage.findAll({
        include: [{
            model: Team
        }]
    });
    console.log("All brokerages with their associated teams:", JSON.stringify(brokerages, null, 4));
}

const run = async () => {
    // await findTeamsWithUsers()
    await findUsersWithCustomers()
    await findUsersWithTeams()
    // await findBrokeragesWithTeams()
    await process.exit()
}

run()