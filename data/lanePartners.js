const faker = require('faker');

const lanePartners = [...Array(62)].map((user) => (
    {
      name: faker.company.companyName(),
      address: faker.address.streetAddress(),
      address2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zipcode: faker.address.zipCode(),
      lnglat: `${faker.address.longitude()},${faker.address.latitude()}`,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),  
      title: faker.name.jobTitle(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
))
  
const lanePartnersBackup = [

    {
        name: 'ABC Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'XYZ Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Bobs Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Jimmys Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Debbys Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Parkers Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Johns Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Andrews Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Houstons Plastics',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Big Bad Burgers',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Pasta Pasta Pasta',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'We Got Buns',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Coca-Cola',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Eds Chicken',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'McDonalds',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Chick-Fil-A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Milling Inc.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Textiles Co.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Floor and Decor',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Ikea',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Home Depot',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Lowes',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Bills Stone',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Garbage Bag Company',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Target',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Waste Management',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Panama City Beach Co.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Lake Michigan Inc.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Darden Lake Inc.',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Charleston Port Authority',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Santa Monica Waste Water',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Mars Petfood',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Hershey Company',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Ruiz Foods',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Las Delicias',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Franklin BBQ',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Central BBQ',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'McCormick Spices',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Pacific Spice Company',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Dunavant Enterprises',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cargill',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Tractor Supply Company',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Gold Mine',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Silver Mine',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Copper Mine',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Sudan Cotton',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Amarillo Cotton',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Sweetwater Cotton',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Midland Cotton',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Lubbock Cotton',
        createdAt: new Date(),
        updatedAt: new Date()
    }

]

module.exports = lanePartners