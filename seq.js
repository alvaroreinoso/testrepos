const db = require('./models/index')
const { User, Team, Brokerage, Customer, CustomerLocation, Lane } = require('./models')

// async function run() {


// const getLanes = async () => {
//     const results = await Customer.findAll({
//         where: {
//             userId: 1
//         }, include: [{
//             model: CustomerLocation
//         }]
//     })
//     // results.forEach(cust => console.log(cust.CustomerLocations))
//     const locations = []
//     await results.forEach(cust => locations.push(cust.CustomerLocation))

//     console.log(locations)
// }
// // const getLanes = async () => {
// //     const results = await Customer.findAll({
// //         where: {
// //             userId: 1
// //         }, include: [{
// //             model: CustomerLocation
// //         }]
// //     })
// //     results.forEach(cust => await Lane.findAll({
// //         where: {
// //             customerLocationId: cust.CustomerLocations.id
// //         }
// //     })
        
// //     console.log(cust.CustomerLocations))
// // }



// getLanes()

// }                       

// run()

// Lane.findAll({
//     include: {
//         model: Customer,
//         where: {
//             customerLocationId: 
//         }

//     }
// })

async function run () {

// const user = await User.findOne({
//     where: {
//         id: 1
//     },
//     include: [{
//       model: Customer,
//       required: true,
//       include: [{
//         model: CustomerLocation,
//         required: true,
//         include: [{
//             model: Lane,
//             required: true

//         }]
//       }]
//     }]
//   });

const customers = await Customer.findAll({
    where: {
        userId: 1
    },
    include: [{
        model: CustomerLocation,
        required: true,
        include: [{
            model: Lane,
            required: true

        }]
      }]
})

console.log(customers)

const locations = await customers.map(cust => cust.CustomerLocations)
const lanes = await locations[0].map(loc => loc.Lanes)
// const lanes2 = await lanes.map(lane => lane.Lane)
console.log(lanes)
// user.Customers.forEach(cust => console.log)
// console.log((user.Customers))
// //   users.forEach(user => console.log(user.Customers))

//   const locations = await user.Customers.map(cust => cust.CustomerLocations)
//   console.log(locations) 

//   const lanes = await locations[0].map(loc => loc.Lanes)

//   console.log(JSON.stringify(lanes))

//   const locs = await customers.map(cust => cust.CustomerLocations)
//   console.log(locs)

// return users
}

run()


// Find customers by user

// Find all customer locations by customer

// find all lanes by customer locations